from dotenv import load_dotenv
import requests
import re
import os
import spacy

# 정확도를 높이기 위한 동사 데이터 (사용 빈도 순으로 상위에 있는 동사를 가져옴.)
verb_like_words = {"add", "fix", "update", "remove", "delete","refactor", "implement", "rename",
                    "improve", "change", "modify", "document", "test", "initial", "feature",
                    "adding", "fixing", "updating", "removing", "deleting" "refactoring",
                    "implementing", "improving", "changing", "modifying", "documenting",
                    "testing", "initialing", "featuring", "renaming"}

def preprocess_commit_message(message):
    # message = re.sub(r'\[\w+/#\d+\]', '', message)
    # message = re.sub(r'\b\w+:', '', message)
    message = re.sub(r'\[.*?\]', '', message)
    message = re.sub(r'.*:', '', message)
    message = re.sub(r'\(\#\d+\)', '', message)
    message = re.sub(r'\b\w+/#\d+\b', '', message)
    message = message.split('\n', 1)[0]

    if len(message) == 0:
        return ""
    
    message = re.sub(r'^[;:.,!?]+|[;:.,!?]+$', '', message).strip()

    return message

def get_repository_commits(repo_owner, repo_name, user, access_token):
    commits_endpoint = f"https://api.github.com/repos/{repo_owner}/{repo_name}/commits"
    commits_headers = {"Authorization": f"Bearer {access_token}"}

    per_page = 100
    page = 1

    total_commit_message = []
    user_commit_message = []

    while True:
        params = {"per_page": per_page, "page": page}
        commits_response = requests.get(commits_endpoint, headers=commits_headers, params=params)

        if commits_response.status_code == 200:
            commits = commits_response.json()
            if not commits:
                break
            for commit in commits:
                message = commit['commit']['message']

                if message.startswith("Merge") or message.startswith("Revert") or message.startswith("Conflict") or "README.md" in message or message == "Initial commit":
                    continue

                message = preprocess_commit_message(message)

                if message == "":
                    continue

                if commit["author"] and commit["author"]["login"] == user:
                    user_commit_message.append(message)
                total_commit_message.append(message)
                
            page += 1
        else:
            print("커밋 정보 가져오기 실패:", commits_response.status_code)
            print("에러 메시지:", commits_response.text)
            break
        
    return total_commit_message, user_commit_message

def get_repository_pull_requests(repo_owner, repo_name, user, access_token):
    pull_requests_endpoint = f"https://api.github.com/repos/{repo_owner}/{repo_name}/pulls"
    pull_requests_headers = {"Authorization": f"Bearer {access_token}"}

    per_page = 100
    page = 1

    total_pull_request_titles = []
    user_pull_request_titles = []

    while True:
        params = {"per_page": per_page, "page": page, "state": "all"}
        pull_requests_response = requests.get(pull_requests_endpoint, headers=pull_requests_headers, params=params)

        if pull_requests_response.status_code == 200:
            pull_requests = pull_requests_response.json()
            if not pull_requests:
                break
            for pull_request in pull_requests:
                title = pull_request['title']

                if pull_request['user']['login'] == user:
                    user_pull_request_titles.append(title)
                total_pull_request_titles.append(title)
                
            page += 1
        else:
            print("풀 리퀘스트 정보 가져오기 실패:", pull_requests_response.status_code)
            print("에러 메시지:", pull_requests_response.text)
            break
        
    return total_pull_request_titles, user_pull_request_titles

def evaluate_messages(commit_messages):
    
    nlp = spacy.load("en_core_web_sm")

    grammar_score_count = 0

    for commit_message in commit_messages:
        if commit_message:
            commit_message = commit_message[0].lower() + commit_message[1:]

        doc = nlp(commit_message)
        first_word = doc[0].text.lower() if doc else ""
        
        is_verb = (doc[0].pos_ == "VERB" and doc[0].dep_ == "ROOT") or first_word in verb_like_words

        if is_verb:
            grammar_score_count += 1

    total_messages = len(commit_messages)
    grammar_score_ratio = grammar_score_count / total_messages if total_messages > 0 else 0

    return grammar_score_ratio * 100

if __name__ == '__main__':
    load_dotenv()
    token = os.environ.get('token')
    print(f"token: {token}")