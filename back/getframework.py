from dotenv import load_dotenv
import hashlib
import json
import requests
import os
import base64
import re

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
        rn = repo['full_name'] , repo['html_url']
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
                rn = org_repo_name , org_repo_url
                user_repo_list.append(rn)
    # return user_repo_list
   
def choose_repo_commit(user_repo_list,headers):
    repos_to_remove = []
    for repo in user_repo_list:
        commits_url = f'https://api.github.com/repos/{repo[0]}/commits'
        response = get_paged_response(commits_url,headers)
        if len(response) < 10:
            repos_to_remove.append(repo)

    for repo in repos_to_remove:
        user_repo_list.remove(repo)
    
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


def choose_repo_extension(user_repo_list,all_extensions,headers,filtered_files):
    release_num=0
    release_file_name = ["Makefile","requirements.txt","package.json","pop.xml","build.gradle"]
    repos_to_remove = []
    for a in user_repo_list: 
        latest_commit = get_latest_commit_data(a[0],headers)
        tree_data = get_git_tree(a[0],latest_commit,headers,recursive=True)
        
        repo_files = []
        
        for file_info in tree_data["tree"]:
            if file_info["type"] == "blob":
                _, ext = os.path.splitext(file_info["path"])
                if ext in all_extensions:
                    repo_files.append(file_info["path"])
                release_file = os.path.basename(file_info["path"])
                if release_file in release_file_name:
                    repo_files.append(file_info["path"])
                    release_num+=1

        if not repo_files :
            repos_to_remove.append(a)
        else :
            filtered_files[a[0]] = repo_files
        if release_num==0 :
            repos_to_remove.append(a)
            
    for repo in repos_to_remove:
        user_repo_list.remove(repo)
    
    return user_repo_list,filtered_files
   
        
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
    
    # return personal_repo,team_repo

# pr_percent, issue_percent, commit_percent, get_merged_pr_stas,get_used_lang,get_file_data 는 사용자가 user_repo_list에서 선택한 repo_name이 인자로 필요
def pr_percent(username,repo_name,headers):
    pr_per=0
    pr_url = f"https://api.github.com/repos/{repo_name}/pulls?state=all"
    response=get_paged_response(pr_url,headers)
    total_pr = len(response)
    if total_pr==0:
        pr_per=0
    else:
        user_pr = sum(1 for pr in response if pr['user']['login']==username)
        pr_per = user_pr/total_pr * 100
    return total_pr, user_pr, pr_per;
        
def issue_percent(username, repo_name,headers):
    issue_url = f"https://api.github.com/repos/{repo_name}/issues?state=all"
    response = get_paged_response(issue_url,headers)
    total_issues = len(response)
    user_issues = sum(1 for issue in response if issue['user']['login'] == username)
    issue_per = user_issues / total_issues * 100 if total_issues > 0 else 0
    return total_issues, user_issues, issue_per;

def commit_percent(username, repo_name,headers):
    commit_url = f"https://api.github.com/repos/{repo_name}/commits"
    response = get_paged_response(commit_url,headers)
    total_commits = len(response)
    user_commits = sum(1 for commit in response if commit['author']['login'] == username)
    user_commit_percentage = (user_commits / total_commits) * 100 if total_commits > 0 else 0
    return total_commits, user_commits, user_commit_percentage;

def get_merged_pr_stats(username, repo_name,headers):
    pr_url = f"https://api.github.com/repos/{repo_name}/pulls?state=all&creator={username}"
    response = get_paged_response(pr_url,headers)
    total_user_prs = len(response)
    merged_prs = sum(1 for pr in response if pr['state'] == 'closed' and pr.get('merged_at'))
    merged_pr_percentage = (merged_prs / total_user_prs) * 100 if total_user_prs > 0 else 0
    return total_user_prs, merged_prs, merged_pr_percentage;

def get_used_lang(repo_name,all_lang,headers):
    main_lang = []
    lang_url = f'https://api.github.com/repos/{repo_name}/languages'
    response = requests.get(lang_url,headers=headers).json()
    repo_lang = list(response.keys())
    for lang in repo_lang:
        if lang in all_lang:
            main_lang.append(lang)
    return main_lang

def get_file_data(file_path_list,repo_name,headers):
    file_data_dict = {}
    for file_path in file_path_list:
        file_url = f'https://api.github.com/repos/{repo_name}/contents/{file_path}'
        response = requests.get(file_url,headers=headers).json()
        file_data = response['content']
        encoded_content = file_data
        decoded_content = base64.b64decode(encoded_content)
        readme_text = decoded_content.decode('utf-8')
        file_data_dict[file_path] = readme_text
    return file_data_dict

def get_personal_repo_file(filtered_files, personal_repo):
    for key in personal_repo:
        if key[0] in filtered_files:
            personal_filtered_files[key[0]]=filtered_files[key[0]]
                  
def comment_percent(repo_file_data):
    comment_styles = {
    # ".c": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    # ".cpp": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    # ".h": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".java": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".js": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    # ".cs": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".py": {"inline": "#", "block_start": '"""', "block_end": '"""'},
    # ".rb": {"inline": "#"},
    # ".php": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    # ".go": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    # ".scala": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    # ".swift": {"inline": "//", "block_start": "/*", "block_end": "*/"},
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
    average_comment_ratio = total_comment_ratio / file_count
    return total_lines1,comment_lines1,average_comment_ratio, file_count;


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
    return total_lines, duplicates, duplicate_ratio;



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
    print(user_repo_list)
    # org_repo(organization_name,username,headers,user_repo_list) 

    # choose_repo_commit(user_repo_list,headers)

    # choose_repo_extension(user_repo_list,all_extensions,headers,filtered_files)
    # classify_personal_team(user_repo_list,headers)

    # get_personal_repo_file(filtered_files,personal_repo)
    # repo_file_data=get_file_data(filtered_files,"sbh0609/SHManagement",headers)
    # print(detect_code_duplication(repo_file_data))
    # print(analyze_dependencies(repo_file_data))
    # print(comment_percent(repo_file_data))