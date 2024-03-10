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
