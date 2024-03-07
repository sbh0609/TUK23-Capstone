from flask import Flask, jsonify, request
from flask_cors import CORS,cross_origin
import requests,hashlib, json, os, base64, re
from dotenv import load_dotenv
import getframework

# 환경 변수 로드 및 토큰 설정
load_dotenv()
token = os.environ.get('token')
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
}

source_file_extensions = {
    "C": [".c", ".h"],
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


app = Flask(__name__)
api=CORS(app)  # CORS 적용


@app.route('/api/input', methods=['POST'])
@cross_origin()
def handle_input():
    data = request.json
    username = data.get('username')
    organization_list = data.get('organizations')
    repos_url = f'https://api.github.com/users/{username}/repos'
    con_repos_url = f'https://api.github.com/users/{username}/repos?type=member'
    user_repo_list = []
    filtered_files = {}
    personal_repo=[]
    team_repo=[]
    personal_list=[]
    team_list=[]
    getframework.not_org_repo(repos_url,headers,user_repo_list)
    getframework.not_org_repo(con_repos_url,headers,user_repo_list)
    getframework.org_repo(organization_list,username,headers,user_repo_list) 
    getframework.choose_repo_commit(user_repo_list,headers)
    getframework.choose_repo_extension(user_repo_list,all_extensions,headers,filtered_files)
    getframework.classify_personal_team(user_repo_list,headers,personal_repo,team_repo)
    personal_list = [i[0]for i in personal_repo]
    team_list = [i[0]for i in team_repo]
    print(team_list)
    return jsonify({"repositories": user_repo_list,"file_data": filtered_files,"personal_list":personal_list,"team_list":team_list})



@app.route('/api/analyze',methods=['POST'])
@cross_origin()
def analyze_repo():
    datas = request.json
    user_name = datas.get('username')
    repo_name = datas.get('repo_name')
    repo_file = datas.get('fileList')
    repo_type = datas.get('repo_type')
    print(user_name)
    if(repo_type=='personal'):
        program_lang= getframework.get_used_lang(repo_name,all_lang,headers)
        repo_file_data=getframework.get_file_data(repo_file,repo_name,headers)
        comment_per=getframework.comment_percent(repo_file_data)
        framework=getframework.analyze_dependencies(repo_file_data)
        dup_code=getframework.detect_code_duplication(repo_file_data)
        repo_analyze={
            "program_lang": program_lang,
            "comment_per": comment_per,
            "framework": framework,
            "duplicate_code": dup_code,
        }
        return jsonify(repo_analyze)
    elif(repo_type=='team'):
        program_lang= getframework.get_used_lang(repo_name,all_lang,headers)
        repo_file_data=getframework.get_file_data(repo_file,repo_name,headers)
        comment_per=getframework.comment_percent(repo_file_data)
        framework=getframework.analyze_dependencies(repo_file_data)
        dup_code=getframework.detect_code_duplication(repo_file_data)
        pr_per=getframework.pr_percent(user_name,repo_name,headers)
        issue_per=getframework.issue_percent(user_name,repo_name,headers)
        commit_per = getframework.commit_percent(user_name,repo_name,headers)
        merged_pr_stats =getframework.get_merged_pr_stats(user_name, repo_name,headers)
        repo_analyze={
            "program_lang": program_lang,
            "comment_per": comment_per,
            "framework": framework,
            "duplicate_code": dup_code,
            "pr_per": pr_per,
            "commit_per": commit_per,
            "merged_pr_stats": merged_pr_stats,
            "issue_per": issue_per,
        }
        return jsonify(repo_analyze)
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    