from flask import Flask, request, jsonify, send_from_directory
import requests
from flask_cors import CORS
import os

app = Flask(__name__, static_folder=r'D:\projects\TUK23-Capstone-feat-4\frontreact\build', static_url_path='')
CORS(app)

# GitHub 토큰과 헤더 설정, 실제 사용을 위해선 유효한 GitHub 토큰 필요
headers = {
    'Authorization': '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',
    'Accept': 'application/vnd.github.v3+json',
}

def get_user_contributed_repositories(username, organization):
    """사용자가 기여한 조직의 레포지토리 목록을 가져옵니다."""
    url = f"https://api.github.com/orgs/{organization}/repos"
    repos = requests.get(url, headers=headers).json()
    
    contributed_repos = []
    for repo in repos:
        contributors_url = repo['contributors_url']
        contributors = requests.get(contributors_url, headers=headers).json()
        
        if any(contributor['login'] == username for contributor in contributors):
            contributed_repos.append(repo)
            
    return contributed_repos

@app.route('/org/repos', methods=['POST'])
def org_repos():
    data = request.get_json()
    username = data.get('username')
    organization = data.get('organization')
    
    if username and organization:
        repos = get_user_contributed_repositories(username, organization)
        return jsonify({"status": "success", "repositories": repos})
    else:
        return jsonify({"status": "error", "message": "Username and organization are required"}), 400

# 정적 파일 서빙을 위한 엔드포인트
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
