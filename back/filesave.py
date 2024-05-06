import boto3
import requests
import base64
import os

def save_file_to_s3(file_path_list, repo_name, user_name, headers):
    s3 = boto3.client('s3')
    bucket_name = 'your-bucket-name'  # S3 버킷 이름

    for file_path in file_path_list:
        file_url = f'https://api.github.com/repos/{repo_name}/contents/{file_path}'
        response = requests.get(file_url, headers=headers).json()
        file_data = response['content']

        # Base64 인코딩된 내용을 디코딩
        decoded_content = base64.b64decode(file_data)

        # S3에 저장할 경로 설정
        s3_key = f"repofiledata-{user_name}/{repo_name}/{file_path}"

        # S3에 파일 저장
        s3.put_object(Bucket=bucket_name, Key=s3_key, Body=decoded_content)
        print(f"Saved {file_path} to S3 at {s3_key}")

# 사용 예제
headers = {'Authorization': 'token your-github-token'}
file_path_list = ['path/to/your/file.py', 'path/to/another/file.js']
repo_name = 'repo_owner/repo_name'
user_name = 'github_username'

save_file_to_s3(file_path_list, repo_name, user_name, headers)