import requests
import os
import base64
import re
username = "sbh0609"
organization_name = ['2023-Summer-Bootcamp-TeamC',"NetworkProgrammingTeam23"] # 사용자가 입력한 조직들 리스트로 구성
org_name = "2023-Summer-Bootcamp-TeamC" 
repo_name = "SHOTPING-backend"
file_path = "shotping_flask/app.py"
token = "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"
firstparam = "2023-Summer-Bootcamp-TeamC/SHOTPING-backend"
user_repo_list = []
filtered_files = {}
personal_filtered_files = {}
repo_file_data={}
personal_repo = []
team_repo = []
# token ="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"
file_url = f'https://api.github.com/repos/{firstparam}/{repo_name}/contents/{file_path}'
lang_url = f'https://api.github.com/repos/{firstparam}/{repo_name}/languages'
repos_url = f'https://api.github.com/users/{username}/repos'
con_repos_url = f'https://api.github.com/users/{username}/repos?type=member'
organization_url = f'https://api.github.com/orgs/{org_name}/repos'
all_file_url = f'https://api.github.com/repos/{firstparam}/{repo_name}/contents'
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
}


def get_paged_response(url):
    results = []
    page = 1
    while True:
        # URL에 이미 쿼리 파라미터가 있는지 확인
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


def not_org_repo(url):
    response= get_paged_response(url)
    for repo in response:
        rn = repo['full_name'] , repo['html_url']
        # print(rn)
        user_repo_list.append(rn)
    
        
def org_repo(org_list,username):
    for org in org_list :
        org_url = f'https://api.github.com/orgs/{org}/repos'
        response = get_paged_response(org_url)
        for repo in response:
            org_repo_name = repo['full_name']
            org_repo_url = repo['html_url'] 
            contributors_url = f'https://api.github.com/repos/{org_repo_name}/contributors'
            contributors = get_paged_response(contributors_url)
            is_contributor = any(contributor['login'] == username for contributor in contributors)
            if is_contributor:
                rn = org_repo_name , org_repo_url
                # print(rn)
                user_repo_list.append(rn)
                
def choose_repo_commit():
    repos_to_remove = []

    for repo in user_repo_list:
        commits_url = f'https://api.github.com/repos/{repo[0]}/commits'
        response = get_paged_response(commits_url)
        if len(response) < 10:
            repos_to_remove.append(repo)

    for repo in repos_to_remove:
        user_repo_list.remove(repo)

def get_latest_commit_data(repo_name):
    commits_url = f"https://api.github.com/repos/{repo_name}/commits"
    response = requests.get(commits_url, headers=headers)
   
    if response.status_code == 200:
        commits = response.json()
        return commits[0]['sha']  # 최신 커밋의 SHA 반환
    else :
        return None

def get_git_tree(repo_name, tree_sha, recursive=True):
    url = f"https://api.github.com/repos/{repo_name}/git/trees/{tree_sha}"
    params = {"recursive": "1"} if recursive else {}
    response = requests.get(url, params=params, headers=headers)
   
    if response.status_code == 200:
        return response.json()
    else:
        return None
# contributors_url = f"https://api.github.com/repos/{a[0]}/contributors"
# # team_num = requests.get(contributors_url,headers=headers).json()
# 컨트리뷰터가 1명이고 파일이 있으면 filtered_files에 추가
        # elif len(team_num) == 1:
        #     personal_filtered_files[a[0]] = repo_files
def choose_repo_extension():
    repos_to_remove = []
    for a in user_repo_list: 
        
        
        latest_commit = get_latest_commit_data(a[0])
        tree_data = get_git_tree(a[0],latest_commit,recursive=True)
        
        repo_files = []
        
        for file_info in tree_data["tree"]:
            if file_info["type"] == "blob":
                _, ext = os.path.splitext(file_info["path"])
                if ext in all_extensions:
                    repo_files.append(file_info["path"])
        if not repo_files:
            repos_to_remove.append(a)
        
        else :
            filtered_files[a[0]] = repo_files
        # 절대 지우면 안되는 코드
        
        
    for repo in repos_to_remove:
        user_repo_list.remove(repo)
    
        
def classify_personal_team():
    for repo in user_repo_list:
        contributors_url = f"https://api.github.com/repos/{repo[0]}/contributors"
        response = requests.get(contributors_url, headers=headers)
        if response.status_code == 200:
            contributors = response.json()
            if len(contributors) == 1:
                personal_repo.append(repo)
            else:
                team_repo.append(repo)

def pr_percent(username,repo_name):
    pr_url = f"https://api.github.com/repos/{repo_name}/pulls?state=all"
    response=get_paged_response(pr_url)
    total_pr = len(response)
    user_pr = sum(1 for pr in response if pr['user']['login']==username)
    pr_per = user_pr/total_pr * 100
    return pr_per
        
def issue_percent(username, repo_name):
    issue_url = f"https://api.github.com/repos/{repo_name}/issues?state=all"
    response = get_paged_response(issue_url)
    total_issues = len(response)
    user_issues = sum(1 for issue in response if issue['user']['login'] == username)
    issue_per = user_issues / total_issues * 100 if total_issues > 0 else 0
    return issue_per

def commit_percent(username, repo):
    commit_url = f"https://api.github.com/repos/{repo}/commits"
    response = get_paged_response(commit_url)
    total_commits = len(response)
    user_commits = sum(1 for commit in response if commit['author']['login'] == username)
    user_commit_percentage = (user_commits / total_commits) * 100 if total_commits > 0 else 0
    return user_commit_percentage

def get_merged_pr_stats(username, repo):
    pr_url = f"https://api.github.com/repos/{repo}/pulls?state=all&creator={username}"
    response = get_paged_response(pr_url)
    total_user_prs = len(response)
    merged_prs = sum(1 for pr in response if pr['state'] == 'closed' and pr.get('merged_at'))
    merged_pr_percentage = (merged_prs / total_user_prs) * 100 if total_user_prs > 0 else 0
    return merged_prs, merged_pr_percentage

def get_used_lang(repo_name):
    main_lang = []
    lang_url = f'https://api.github.com/repos/{repo_name}/languages'
    response = requests.get(lang_url,headers=headers).json()
    repo_lang = list(response.keys())
    for lang in repo_lang:
        if lang in all_lang:
            main_lang.append(lang)
    return main_lang

def get_file_data(filtered_files,repo_name):
    file_data_dict = {}
    file_path_list=filtered_files.get(repo_name, [])
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
    ".c": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".cpp": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".h": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".java": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".js": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".cs": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".py": {"inline": "#", "block_start": '"""', "block_end": '"""'},
    ".rb": {"inline": "#"},
    ".php": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".go": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".scala": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".swift": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".ts": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".kt": {"inline": "//", "block_start": "/*", "block_end": "*/"}
    }
    result = {}
    total_comment_ratio = 0
    file_count = 0
    for file_name, file_data in repo_file_data.items():
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
    average_comment_ratio = total_comment_ratio / file_count
    return average_comment_ratio

source_file_extensions = {
    "C": [".c", ".h",],
    "C++": [".cpp", ".cxx", ".cc", ".hpp", ".hxx", ".h"],
    "C#": [".cs"],
    "Python": [".py"],
    "JavaScript": [".js"],
    "Go": [".go"],
    "Java": [".java"],
    "PHP": [".php", ".phtml"],
    "Ruby": [".rb"],
    "Scala": [".scala"],
    "Swift": [".swift"],
    "TypeScript": [".ts"],
    "Kotlin": [".kt", ".kts"]
}

all_extensions = [ext for ext_list in source_file_extensions.values() for ext in ext_list]
all_lang = [lang_name for lang_name in source_file_extensions.keys()]
not_org_repo(repos_url)  

not_org_repo(con_repos_url)

org_repo(organization_name,username) 

choose_repo_commit()

choose_repo_extension()
classify_personal_team()
get_personal_repo_file(filtered_files,personal_repo)
repo_file_data=get_file_data(personal_filtered_files,"sbh0609/app")
print(comment_percent(repo_file_data))
# print(long_mehtod_percent(repo_file_data,50))
# for repo_name, files in filtered_files.items():
#     print(f"레포지토리 {repo_name}의 파일 목록:")
#     for file in files:
#         print(f" - {file}")
#     print()  # 레포지토리 간에 공백 줄 추가
# print(get_used_lang(firstparam))
# print(all_lang)
# print(filtered_files)
# print(user_repo_list)
# print(personal_repo)



# a= requests.get(file_url, headers=headers)
# ab=a.json()

# c = ab['content']
# # print(c)

# # 인코딩된 README 내용
# encoded_content = c

# # Base64 디코드
# decoded_content = base64.b64decode(encoded_content)

# # 바이트 형태로 반환된 내용을 문자열로 변환
# readme_text = decoded_content.decode('utf-8')

# # 디코드된 README 출력
# print(readme_text)