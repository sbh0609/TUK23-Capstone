from dotenv import load_dotenv
import hashlib
import json
import requests
import os
import base64
import re
import boto3
import subprocess
def get_paged_response(url,headers):
    results = []
    page = 1
    while True:
        separator = '&' if '?' in url else '?'
        paged_url = f'{url}{separator}page={page}'
        response = requests.get(paged_url, headers=headers)
        
        if response.status_code != 200:
            break
        
        data = response.json()
        
        if not data:
            break
        
        results.extend(data)
        page += 1
    return results


def not_org_repo(url,headers,user_repo_list):
    response= get_paged_response(url,headers)
    for repo in response:
        rn = [repo['full_name'], repo['html_url']]
        user_repo_list.append(rn)
    # return user_repo_list
        
def org_repo(org_list,username,headers,user_repo_list):
    for org in org_list :
        org_url = f'https://api.github.com/orgs/{org}/repos'
        response = get_paged_response(org_url,headers)
        for repo in response:
            org_repo_name = repo['full_name']
            org_repo_url = repo['html_url'] 
            contributors_url = f'https://api.github.com/repos/{org_repo_name}/contributors'
            contributors = get_paged_response(contributors_url,headers)
            is_contributor = any(contributor['login'] == username for contributor in contributors)
            if is_contributor:
                rn = [org_repo_name, org_repo_url]
                user_repo_list.append(rn)
    # return user_repo_list
   
def choose_repo_commit(repo, headers):
    commits_url = f'https://api.github.com/repos/{repo[0]}/commits'
    response = get_paged_response(commits_url,headers)
    if len(response) < 10:
        return True
    return False
    
def get_latest_commit_data(repo_name,headers):
    commits_url = f"https://api.github.com/repos/{repo_name}/commits"
    response = requests.get(commits_url, headers=headers)
   
    if response.status_code == 200:
        commits = response.json()
        return commits[0]['sha']  # 최신 커밋의 SHA 반환
    else :
        return None

def get_git_tree(repo_name, tree_sha,headers, recursive=True):
    url = f"https://api.github.com/repos/{repo_name}/git/trees/{tree_sha}"
    params = {"recursive": "1"} if recursive else {}
    response = requests.get(url, params=params, headers=headers)
   
    if response.status_code == 200:
        return response.json()
    else:
        return None

def choose_repo_extension(repo, all_extensions, headers):
    release_num = 0
    release_file_name = ["Makefile","requirements.txt","package.json","pop.xml","build.gradle"]
    latest_commit = get_latest_commit_data(repo[0],headers)
    tree_data = get_git_tree(repo[0],latest_commit,headers,recursive=True)
    
    repo_files = []
    
    for file_info in tree_data["tree"]:
        if file_info["type"] == "blob":
            _, ext = os.path.splitext(file_info["path"])
            if ext in all_extensions:
                repo_files.append(file_info["path"])
            release_file = os.path.basename(file_info["path"])
            if release_file in release_file_name:
                repo_files.append(file_info["path"])
                release_num += 1
    if not repo_files or release_num == 0:
        return True, repo_files
    return False, repo_files
   
        
def classify_personal_team(user_repo_list,headers,personal_repo,team_repo):
    for repo in user_repo_list:
        contributors_url = f"https://api.github.com/repos/{repo[0]}/contributors"
        response = requests.get(contributors_url, headers=headers)
        if response.status_code == 200:
            contributors = response.json()
            if len(contributors) == 1:
                personal_repo.append(repo)
            else:
                team_repo.append(repo)
    

# pr_percent, issue_percent, commit_percent, get_merged_pr_stas,get_used_lang,get_file_data 는 사용자가 user_repo_list에서 선택한 repo_name이 인자로 필요
def pr_percent(username,repo_name,headers):
    pr_url = f"https://api.github.com/repos/{repo_name}/pulls?state=all"
    response=get_paged_response(pr_url,headers)
    total_pr = len(response)
    if total_pr == 0:
        user_pr = 0
        pr_per = 0
    else:
        user_pr = sum(1 for pr in response if pr['user']['login']==username)
        pr_per = user_pr/total_pr * 100
    return total_pr, user_pr, pr_per;
    
        
def issue_percent(username, repo_name,headers):
    issue_url = f"https://api.github.com/repos/{repo_name}/issues?state=all"
    response = get_paged_response(issue_url,headers)
    total_issues = len(response)
    if total_issues ==0:
        user_issues = 0
        issue_per = 0
    else:
        user_issues = sum(1 for issue in response if issue['user']['login'] == username)
        issue_per = user_issues / total_issues * 100 if total_issues > 0 else 0
    return total_issues, user_issues, issue_per;

def commit_percent(username, repo_name,headers):
    commit_url = f"https://api.github.com/repos/{repo_name}/commits"
    response = get_paged_response(commit_url,headers)
    total_commits = len(response)
    if total_commits==0:
        user_commits=0
        user_commit_percentage=0
    else:
        user_commits = sum(1 for commit in response if commit['author'] is not None and commit['author']['login'] == username)
        user_commit_percentage = (user_commits / total_commits) * 100 if total_commits > 0 else 0
    user_commit_percentage=round(user_commit_percentage,2)
    return total_commits, user_commits, user_commit_percentage;

def get_used_lang(repo_name, all_lang, headers):
    lang_data = {}
    lang_url = f'https://api.github.com/repos/{repo_name}/languages'
    response = requests.get(lang_url, headers=headers).json()
    
    if response:
        total_lines = sum(response.values())
        main_lang_percentage = 0

        for lang, lines in response.items():
            if lang in all_lang:
                percentage = round((lines / total_lines) * 100,2)
                lang_data[lang] = percentage
                main_lang_percentage += percentage

        lang_data['other'] = 100 - main_lang_percentage

    return lang_data

def get_file_data(file_path_list,repo_name,user_id,headers):
    # load_dotenv() 
    # aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    # aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    # aws_region = os.getenv('AWS_REGION')
    # bucket_name = os.getenv('S3_BUCKKET')
    # # S3 클라이언트 설정
    # s3 = boto3.client(
    #     's3',
    #     aws_access_key_id=aws_access_key_id,
    #     aws_secret_access_key=aws_secret_access_key,
    #     region_name=aws_region
    # )
    local_save_dir = os.path.join('file_data', user_id, repo_name)
    os.makedirs(local_save_dir, exist_ok=True)
    saved_file_paths = []
    file_data_dict = {}
    for file_path in file_path_list:
        file_url = f'https://api.github.com/repos/{repo_name}/contents/{file_path}'
        response = requests.get(file_url,headers=headers).json()
        file_data = response['content']
        encoded_content = file_data
        decoded_content = base64.b64decode(encoded_content)
        
        # 로컬 파일 경로 설정
        local_file_path = os.path.join(local_save_dir, file_path.replace('/', os.sep))
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        # s3_key = f"repofiledata-{user_id}/{repo_name}/{file_path}"

        # s3.put_object(Bucket=bucket_name, Key=s3_key, Body=decoded_content)
        # print(f"Saved {file_path} to S3 at {s3_key}")
        # 파일 저장
        with open(local_file_path, 'wb') as file:
            file.write(decoded_content)
        # print(f"Saved {file_path} to {local_file_path}")

        saved_file_paths.append(local_file_path)
        readme_text = decoded_content.decode('utf-8')
        file_data_dict[file_path] = readme_text
    return file_data_dict,saved_file_paths

def get_personal_repo_file(filtered_files, personal_repo):
    for key in personal_repo:
        if key[0] in filtered_files:
            personal_filtered_files[key[0]]=filtered_files[key[0]]
                  
def comment_percent(repo_file_data):
    comment_styles = {
    ".java": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".js": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".py": {"inline": "#", "block_start": '"""', "block_end": '"""'},
    ".ts": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".kt": {"inline": "//", "block_start": "/*", "block_end": "*/"}
    }
    result = {}
    total_comment_ratio = 0
    file_count = 0
    comment_lines1 = 0
    total_lines1 = 0
    for file_name, file_data in repo_file_data.items():
        total_lines1+=len(file_data.split('\n'))
        _, ext = os.path.splitext(file_name)
        if ext in comment_styles:
            lines = file_data.split('\n')
            total_lines = len(lines)
            comment_lines = 0
            in_block_comment = False
            for line in lines:
                stripped_line = line.strip()
                if stripped_line.startswith(comment_styles[ext]['inline']):
                    comment_lines += 1
                elif stripped_line.startswith(comment_styles[ext]['block_start']):
                    in_block_comment = True
                    comment_lines += 1
                elif in_block_comment and stripped_line.endswith(comment_styles[ext]['block_end']):
                    in_block_comment = False
                    comment_lines += 1
                elif in_block_comment:
                    comment_lines += 1
            
            comment_ratio = comment_lines / total_lines if total_lines > 0 else 0         
            # comment_ratio = calculate_comment_ratio(file_data, comment_styles[ext])
            total_comment_ratio += comment_ratio
            file_count += 1
            result[file_name] = comment_ratio
            comment_lines1 += comment_lines
    real_comment_ratio=round(comment_lines1/total_lines1*100,2)
    return total_lines1,comment_lines1, real_comment_ratio;


def analyze_dependencies(repo_file_data):
    frameworks = []
    for file_path, content in repo_file_data.items():
        file_name = os.path.basename(file_path)
        if file_name == 'package.json':
            # JSON 파일 분석
            data = json.loads(content)
            dependencies = data.get('dependencies', {})
            for dep in dependencies:
                if dep in ['react', 'vue', 'angular',"next","nuxt"]:
                    frameworks.append(dep)
        elif file_name == 'requirements.txt':
            for line in content.split('\n'):
                if any(fw in line for fw in ['Django=', 'Flask=', 'FastAPI=', 'Pyramid=', 'Bottle=']):
                    frameworks.append(line.split('==')[0])
           
        elif file_name == 'build.gradle':
            if ('spring-boot' in content or 'spring-framework' in content or 'spring-cloud' in content) and 'Spring' not in frameworks:
                frameworks.append('Spring')
            if ('android' in content or 'com.android.application' in content or 'com.android.library' in content) and 'Android' not in frameworks:
                frameworks.append('Android')
    return frameworks

def detect_code_duplication(repo_file_data):
    line_hashes = {}
    duplicates = 0
    total_lines = 0
    dup_line=[]
    for file_path, content in repo_file_data.items():
        for line in content.split('\n'):
            total_lines += 1
            important_line = True
            stripped_line = line.strip()
            # 중요하지 않은 라인 체크
            if not stripped_line or stripped_line in ["{", "}", "/*", "*/", '"""',"(",")","})"]:
                important_line = False
            else :
                important_line = True
            if important_line:  
                line_hash = hashlib.md5(line.encode()).hexdigest()
                if line_hash in line_hashes:
                    if line_hashes[line_hash] == 1:
                        dup_line.append(stripped_line)
                        duplicates += 1
                    line_hashes[line_hash] += 1
                else:
                    line_hashes[line_hash] = 1

    duplicate_ratio = (duplicates / total_lines) * 100 if total_lines > 0 else 0
    real_duplicate_ratio=round(duplicates/total_lines*100,2)
    return total_lines, duplicates,real_duplicate_ratio;


def analyze_file(file_path):
    command = ""
    if file_path.endswith(".py"):
        command = f"pylint {file_path} --rcfile=analyzeTool/.pylintrc"
    elif file_path.endswith(".java"):
        command = f"java -jar analyzeTool/checkstyle-10.15.0-all.jar 
        -c analyzeTool/google_checks.xml {file_path}"
    elif file_path.endswith(".js") or file_path.endswith(".ts"):
        command = f"npx eslint {file_path} --config .eslintrc.json --format=json"
    elif file_path.endswith(".kt") or file_path.endswith(".kts"):
        command = f"java -Dfile.encoding=UTF-8 -jar analyzeTool/
        detekt-cli-1.23.6-all.jar--input {file_path} --config analyzeTool/detekt.yml"
    result = subprocess.run(command, shell=True, capture_output=True,
                            text=True, encoding='utf-8', errors='replace')

    if result.stderr:
        print("Errors:", result.stderr)
    
    if file_path.endswith(".js") or file_path.endswith(".ts"):
        return json.loads(result.stdout)  # JSON 데이터 반환
    else:
        return result.stdout
    
def extract_complexity_messages(command_output):
    complexity_info = {}
    if isinstance(command_output, str):  # 문자열 처리
        patterns = [
            (r'.*?:(\d+): Cyclomatic Complexity is (\d+)', lambda line, value: (int(line), int(value))),  # Checkstyle
            (r'.*?:(\d+):.*? is too complex. The McCabe rating is (\d+)', lambda line, value: (int(line), int(value))),  # Pylint
            (r'CyclomaticComplexMethod - (\d+)/\d+ - \[.*?\] at .*?:(\d+):\d+', lambda value, line: (int(line), int(value)))  # Detekt
        ]
        for pattern, extractor in patterns:
            for match in re.findall(pattern, command_output, re.MULTILINE):
                line_number, complexity_value = extractor(*match)
                if line_number in complexity_info:
                    complexity_info[line_number] = max(complexity_info[line_number], complexity_value)
                else:
                    complexity_info[line_number] = complexity_value

    elif isinstance(command_output, list):  # JSON 데이터 처리 (ESLint)
        for item in command_output:
            for message in item.get('messages', []):
                if message['ruleId'] == "complexity":
                    complexity_value = int(re.search(r'\d+', message['message']).group())
                    line_number = message.get('line', None)
                    if line_number:
                        if line_number in complexity_info:
                            complexity_info[line_number] = max(complexity_info[line_number], complexity_value)
                        else:
                            complexity_info[line_number] = complexity_value

    return complexity_info

def extract_function_length_messages(command_output):
    function_length_info = {}
    if isinstance(command_output, str):  # 문자열 처리
        patterns = [
            (r'.*?:(\d+):\d+: Method .+ length is (\d+) lines .*', lambda line, value: (int(line), int(value))),  # Checkstyle
            (r'.*?:(\d+):\d+: R0915: Too many statements \((\d+)/\d+\)', lambda line, value: (int(line), int(value))),  # Pylint Too many statements
            (r'.*?:(\d+):\d+: The function .* is too long \((\d+)\)\. The maximum length is \d+\. \[LongMethod\]', lambda line, value: (int(line), int(value)))  # Detekt LongMethod
        ]
        for pattern, extractor in patterns:
            for match in re.findall(pattern, command_output, re.MULTILINE):
                line_number, length_value = extractor(*match)
                if line_number in function_length_info:
                    function_length_info[line_number] = max(function_length_info[line_number], length_value)
                else:
                    function_length_info[line_number] = length_value

    elif isinstance(command_output, list):  # JSON 데이터 처리 (ESLint)
        for item in command_output:
            for message in item.get('messages', []):
                if message['ruleId'] == "max-lines-per-function":
                    length_value = int(re.search(r'\d+', message['message']).group())
                    line_number = message.get('line', None)
                    if line_number:
                        if line_number in function_length_info:
                            function_length_info[line_number] = max(function_length_info[line_number], length_value)
                        else:
                            function_length_info[line_number] = length_value
    return function_length_info

def extract_parameter_count_messages(command_output):
    parameter_count_info = {}
    if isinstance(command_output, str):  # 문자열 처리
        patterns = [
            (r'.*?:(\d+):\d+: More than 1 parameters \(found (\d+)\)\. \[ParameterNumber\]', lambda line, value: (int(line), int(value))),  # Checkstyle
            (r'.*?:(\d+):\d+: R0913: Too many arguments \((\d+)/\d+\) \(too-many-arguments\)', lambda line, value: (int(line), int(value))),  # Pylint
            (r'.*?:(\d+):\d+: The function .*?\((.*?)\) has too many parameters\. .* \[LongParameterList\]', lambda line, params: (int(line), len(params.split(','))))  # Detekt
        ]
        for pattern, extractor in patterns:
            for match in re.findall(pattern, command_output, re.MULTILINE):
                line_number, param_count = extractor(*match)
                if line_number in parameter_count_info:
                    parameter_count_info[line_number] = max(parameter_count_info[line_number], param_count)
                else:
                    parameter_count_info[line_number] = param_count

    elif isinstance(command_output, list):  # JSON 데이터 처리 (ESLint)
        for item in command_output:
            for message in item.get('messages', []):
                if message['ruleId'] == "max-params":
                    param_count = int(re.search(r'\d+', message['message']).group())
                    line_number = message.get('line', None)
                    if line_number:
                        if line_number in parameter_count_info:
                            parameter_count_info[line_number] = max(parameter_count_info[line_number], param_count)
                        else:
                            parameter_count_info[line_number] = param_count
    return parameter_count_info

def get_issue_stats(username, repo_name, headers):
    issue_url = f"https://api.github.com/repos/{repo_name}/issues?state=all"
    response = get_paged_response(issue_url, headers)

    total_issues = len(response)
    if total_issues == 0:
        return {
            "total_issues": 0,
            "closed_issues": 0,
            "closed_issue_percentage": 0,
            "total_user_issues": 0,
            "closed_user_issues": 0,
            "closed_user_issue_percentage": 0,
            "user_issue_percentage": 0
        }

    closed_issues = sum(1 for issue in response if issue['state'] == 'closed')
    
    user_issues = [issue for issue in response if issue['user']['login'] == username]
    total_user_issues = len(user_issues)
    closed_user_issues = sum(1 for issue in user_issues if issue['state'] == 'closed')

    closed_issue_percentage = (closed_issues / total_issues) * 100 if total_issues > 0 else 0
    closed_user_issue_percentage = (closed_user_issues / closed_issues) * 100 if closed_issues > 0 else 0
    user_issue_percentage = (total_user_issues / total_issues) * 100 if total_issues > 0 else 0

    return {
        "total_issues": total_issues,
        "closed_issues": closed_issues,
        "closed_issue_percentage": round(closed_issue_percentage,2),
        "total_user_issues": total_user_issues,
        "closed_user_issues": closed_user_issues,
        "closed_user_issue_percentage": round(closed_user_issue_percentage,2),
        "user_issue_percentage": round(user_issue_percentage,2)
    }

def get_pr_stats(username, repo_name, headers):
    pr_url = f"https://api.github.com/repos/{repo_name}/pulls?state=all"
    response = get_paged_response(pr_url, headers)

    total_prs = len(response)
    if total_prs == 0:
        return {
            "total_prs": 0,
            "merged_prs": 0,
            "merged_pr_percentage": 0,
            "total_user_prs": 0,
            "merged_user_prs": 0,
            "merged_user_pr_percentage": 0,
            "user_pr_percentage": 0
        }
    
    merged_prs = sum(1 for pr in response if pr['state'] == 'closed' and pr.get('merged_at'))
    merged_pr_percentage = (merged_prs / total_prs) * 100 if total_prs > 0 else 0
    user_prs = [pr for pr in response if pr['user']['login'] == username]
    total_user_prs = len(user_prs)
    merged_user_prs = sum(1 for pr in user_prs if pr['state'] == 'closed' and pr.get('merged_at'))
    merged_user_pr_percentage = (merged_user_prs / merged_prs) * 100 if merged_prs > 0 else 0
    user_pr_percentage = (total_user_prs / total_prs) * 100 if total_prs > 0 else 0



    return {
        "total_prs": total_prs,
        "merged_prs": merged_prs,
        "merged_pr_percentage": round(merged_pr_percentage,2),
        "total_user_prs": total_user_prs,
        "merged_user_prs": merged_user_prs,
        "merged_user_pr_percentage": round(merged_user_pr_percentage,2),
        "user_pr_percentage": round(user_pr_percentage,2)
    }



if __name__ == '__main__':
    
    user_repo_list = []
    filtered_files = {}
    personal_filtered_files = {}
    repo_file_data={}
    personal_repo = []
    team_repo = []

    load_dotenv()  # .env 파일에서 환경 변수 로드
    token = os.environ.get('token')  # TOKEN 환경 변수 가져오기
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
    }
    
    # 웹에서 받아와야 하는 데이터 
    username = "sbh0609" 
    organization_name = ['2023-Summer-Bootcamp-TeamC']
    repos_url = f'https://api.github.com/users/{username}/repos'
    con_repos_url = f'https://api.github.com/users/{username}/repos?type=member'
    source_file_extensions = {
    # "C": [".c", ".h"],
    # "C++": [".cpp", ".cxx", ".cc", ".hpp", ".hxx", ".h"],
    # "C#": [".cs"],
    "Python": [".py"],
    "JavaScript": [".js"],
    # "Go": [".go"],
    "Java": [".java"],
    # "PHP": [".php", ".phtml"],
    # "Ruby": [".rb"],
    # "Scala": [".scala"],
    # "Swift": [".swift"],
    "TypeScript": [".ts"],
    "Kotlin": [".kt", ".kts"]
    }

    all_extensions = [ext for ext_list in source_file_extensions.values() for ext in ext_list]
    all_lang = [lang_name for lang_name in source_file_extensions.keys()]
    not_org_repo(repos_url,headers,user_repo_list)  
    not_org_repo(con_repos_url,headers,user_repo_list)
