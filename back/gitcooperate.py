from dotenv import load_dotenv
import hashlib
import json
import requests
import os
import base64
import re
from getframework import get_paged_response

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
    return pr_per

def issue_percent(username, repo_name,headers):
    issue_url = f"https://api.github.com/repos/{repo_name}/issues?state=all"
    response = get_paged_response(issue_url,headers)
    total_issues = len(response)
    user_issues = sum(1 for issue in response if issue['user']['login'] == username)
    issue_per = user_issues / total_issues * 100 if total_issues > 0 else 0
    return issue_per


def commit_percent(username, repo_name,headers):
    commit_url = f"https://api.github.com/repos/{repo_name}/commits"
    response = get_paged_response(commit_url,headers)
    total_commits = len(response)
    user_commits = sum(1 for commit in response if commit['author']['login'] == username)
    user_commit_percentage = (user_commits / total_commits) * 100 if total_commits > 0 else 0
    return user_commit_percentage

def get_merged_pr_stats(username, repo_name,headers):
    pr_url = f"https://api.github.com/repos/{repo_name}/pulls?state=all&creator={username}"
    response = get_paged_response(pr_url,headers)
    total_user_prs = len(response)
    merged_prs = sum(1 for pr in response if pr['state'] == 'closed' and pr.get('merged_at'))
    merged_pr_percentage = (merged_prs / total_user_prs) * 100 if total_user_prs > 0 else 0
    return merged_prs, merged_pr_percentage