from flask import Flask, jsonify, request
from flask_cors import CORS
import requests,hashlib, json, os, base64, re
from dotenv import load_dotenv
import getframework

# 전역 변수 설정
# user_repo_list = []

personal_filtered_files = {}
repo_file_data = {}
personal_repo = []
team_repo = []

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
CORS(app)  # CORS 적용


@app.route('/api/input', methods=['POST'])
def handle_input():
    data = request.json
    username = data.get('username')
    organization_list = data.get('organizations')
    repos_url = f'https://api.github.com/users/{username}/repos'
    con_repos_url = f'https://api.github.com/users/{username}/repos?type=member'
    
    user_repo_list = []
    filtered_files = {}
    getframework.not_org_repo(repos_url,headers,user_repo_list)
    getframework.not_org_repo(con_repos_url,headers,user_repo_list)
    getframework.org_repo(organization_list,username,headers,user_repo_list) 
    # getframework.choose_repo_commit(user_repo_list,headers)
    # getframework.choose_repo_extension(user_repo_list,all_extensions,headers,filtered_files)
    # print(filtered_files)
    # 여기서 username과 organization_list 처리
    # 예: 데이터베이스에 저장, 처리 로직 수행 등
    return jsonify({"repositories": user_repo_list,"file_data": filtered_files})
    # return jsonify({"repositories": user_repo_list})

if __name__ == '__main__':
    app.run(debug=True)
    