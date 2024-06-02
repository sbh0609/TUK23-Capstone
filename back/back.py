from flask import Flask, jsonify, request
from flask_cors import CORS,cross_origin
from dotenv import load_dotenv
from celery import Celery
import os
import getframework
import func
import pymysql
import json
import time
# 환경 변수 로드 및 토큰 설정

load_dotenv()
app = Flask(__name__)
app.secret_key = 'root'
CORS(app, supports_credentials=True, origins='http://localhost:3000')

app.config['CELERY_BROKER_URL'] = 'redis://redis:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://redis:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

def connect_to_database():
    connection = pymysql.connect(
        host='db',  # 호스트 주소
        port=3306,
        user='root',  # 데이터베이스 사용자 이름
        password='1234',  # 데이터베이스 암호
        database='tuk23_capstone',  # 사용할 데이터베이스 이름
        charset='utf8mb4',  # 문자 인코딩 설정
        cursorclass=pymysql.cursors.DictCursor  # 결과를 딕셔너리 형태로 반환
    )
    return connection

token = os.environ.get('token')
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
}

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


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    userID = data.get('userID')
    password = data.get('password')
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM user WHERE web_user_id = %s AND pwd = %s"
            cursor.execute(sql, (userID, password))
            user = cursor.fetchone()

            if user:
                return jsonify({'message': 'Login successful', 'userID': user['web_user_id']}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    userID = data.get('userID')
    password = data.get('password')
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            sql_check = "SELECT * FROM user WHERE web_user_id = %s"
            cursor.execute(sql_check, (userID), )
            user = cursor.fetchone()

            if user is None:
                sql_insert = "INSERT INTO user (web_user_id, pwd) VALUES (%s, %s)"
                cursor.execute(sql_insert, (userID, password))
                connection.commit() 
                return jsonify({'message(@register)': '회원가입 성공'}), 200
            else:
                return jsonify({'error(@register)': '중복 아이디'}), 409
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/own_repo', methods=['POST'])
def find_own_repo():
    data = request.get_json()
    #userID = data.get('session_userID')
    userID = "test1"
    try:
        connection = connect_to_database()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM analyzed_repo_data WHERE web_user_id = %s"
            cursor.execute(sql, (userID))
            user = cursor.fetchone()
            username = user['repo_contributor_name']
            print(username)
            return jsonify({"username": username}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/input', methods=['POST'])
@cross_origin()
def handle_input():
    data = request.json
    username = data.get('username')
    print("Gotten username: ", username)
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
    print(filtered_files)
    personal_list = [i[0]for i in personal_repo]
    team_list = [i[0]for i in team_repo]
    print(team_list)
    return jsonify({"repositories": user_repo_list,"file_data": filtered_files,"personal_list":personal_list,"team_list":team_list})

@celery.task
def analyze_file_task(file_path):
    result = getframework.analyze_file(file_path)
    complexity_info=getframework.extract_complexity_messages(result)
    return {"file_path": file_path, "complexity_info": complexity_info}

@app.route('/api/analyze',methods=['POST'])
@cross_origin()
def analyze_repo():
    datas = request.json
    user_name = datas.get('username')
    repo_name = datas.get('repo_name')
    repo_file = datas.get('fileList')
    repo_type = datas.get('repo_type')
    click_time = datas.get('click_time')
    print(click_time)
    all_files_complexity = {}
    user_id = datas.get('session_userID')
    
    if(repo_type=='personal'):
        program_lang= getframework.get_used_lang(repo_name,all_lang,headers)
        repo_file_data,complex_file_path=getframework.get_file_data(repo_file,repo_name,user_id,headers)
        
        comment_per=getframework.comment_percent(repo_file_data)
        framework=getframework.analyze_dependencies(repo_file_data)
        dup_code=getframework.detect_code_duplication(repo_file_data)

        # for file_path in complex_file_path:
        #     result = getframework.analyze_file(file_path)
        #     complexity_info=getframework.extract_complexity_messages(result)
        #     all_files_complexity[file_path] = complexity_info

        tasks = [analyze_file_task.apply_async(args=[file_path]) for file_path in complex_file_path]

        for task in tasks:
            result = task.get()
            file_path = result['file_path']
            all_files_complexity[file_path] = result['complexity_info']

        repo_analyze={
            "program_lang": program_lang,
            "comment_per": comment_per,
            "framework": framework,
            "duplicate_code": dup_code,
            "complexity": all_files_complexity
        }
        
        json_framework = json.dumps(framework)
        json_main_lang = json.dumps(program_lang)
        json_complexity_data = json.dumps(all_files_complexity)
        
        try:
            connection = connect_to_database()
            with connection.cursor() as cursor:
                sql_insert = """
                    INSERT INTO analyzed_repo_data (
                        web_user_id, 
                        repo_selected_time,
                        repo_name, 
                        repo_contributor_name, 
                        frameworks, 
                        main_lang,              
                        total_lines,
                        comment_lines,
                        total_comment_percentage,
                        duplicates,
                        duplicate_percentage,
                        complexity_data        
                    ) 
                    VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """
                cursor.execute(sql_insert, 
                               (    
                                user_id,
                                click_time,
                                repo_name, 
                                user_name, 
                                json_framework,
                                json_main_lang,
                                comment_per[0], 
                                comment_per[1], 
                                comment_per[2], 
                                dup_code[1], 
                                dup_code[2],
                                json_complexity_data
                                ))
                connection.commit() 
        except Exception as e:
            return jsonify({'DataBase Insert Error': str(e)}), 500
    
    elif(repo_type=='team'):
        program_lang= getframework.get_used_lang(repo_name,all_lang,headers)
        
        repo_file_data,complex_file_path=getframework.get_file_data(repo_file,repo_name,user_id,headers)
        
        comment_per=getframework.comment_percent(repo_file_data)
        framework=getframework.analyze_dependencies(repo_file_data)
        dup_code=getframework.detect_code_duplication(repo_file_data)
        pr_per=getframework.pr_percent(user_name,repo_name,headers)
        issue_per=getframework.issue_percent(user_name,repo_name,headers)
        commit_per = getframework.commit_percent(user_name,repo_name,headers)
        merged_pr_stats =getframework.get_merged_pr_stats(user_name, repo_name,headers)
        # for file_path in complex_file_path:
        #     result = getframework.analyze_file(file_path)
        #     complexity_info=getframework.extract_complexity_messages(result)
        #     all_files_complexity[file_path] = complexity_info
        
        tasks = [analyze_file_task.apply_async(args=[file_path]) for file_path in complex_file_path]
        
        for task in tasks:
            result = task.get()
            file_path = result['file_path']
            all_files_complexity[file_path] = result['complexity_info']
        
        total_quality, user_quality = func.classify_commit_quality(repo_name, user_name, token)
        total_grammar, user_grammar = func.check_grammar(repo_name, user_name, token)

        repo_analyze={
            "program_lang": program_lang,
            "comment_per": comment_per,
            "framework": framework,
            "duplicate_code": dup_code,
            "pr_per": pr_per,
            "commit_per": commit_per,
            "merged_pr_stats": merged_pr_stats,
            "issue_per": issue_per,
            "complexity": all_files_complexity,
            "total_quality": total_quality,
            "user_quality": user_quality,
            "total_grammar": total_grammar,
            "user_grammar": user_grammar
        }
        
        json_framework = json.dumps(framework)
        json_main_lang = json.dumps(program_lang)
        json_complexity_data = json.dumps(all_files_complexity)
        json_total_quality = json.dumps(total_quality[0])
        json_user_quality = json.dumps(user_quality[1])
        
        try:
            connection = connect_to_database()
            with connection.cursor() as cursor:
                sql_insert = """
                    INSERT INTO analyzed_repo_data (
                        web_user_id, 
                        repo_selected_time,
                        repo_name, 
                        repo_contributor_name, 
                        frameworks, 
                        main_lang,              
                        total_lines,
                        comment_lines,
                        total_comment_percentage,
                        duplicates,
                        duplicate_percentage,
                        complexity_data,
                        total_pr,
                        user_pr,
                        pr_per,
                        total_commits,
                        user_commits,
                        user_commit_percentage,
                        merged_prs,
                        merged_prs_percentage,
                        total_issues,
                        user_issues,
                        issue_per,
                        total_result,
                        user_result,
                        total_grammar,
                        user_grammar
                    ) 
                    VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )
                """
                
                cursor.execute(sql_insert, 
                               (    
                                user_id,
                                click_time,
                                repo_name, 
                                user_name, 
                                json_framework,
                                json_main_lang,
                                comment_per[0], 
                                comment_per[1], 
                                comment_per[2], 
                                dup_code[1], 
                                dup_code[2],
                                json_complexity_data,    
                                pr_per[0],
                                pr_per[1],
                                pr_per[2],
                                commit_per[0],
                                commit_per[1],
                                commit_per[2],
                                merged_pr_stats[1],
                                merged_pr_stats[2],
                                issue_per[0],
                                issue_per[1],
                                issue_per[2],
                                json_total_quality,
                                json_user_quality,
                                total_grammar,
                                user_grammar  
                                ))
                connection.commit() 
        except Exception as e:
            return jsonify({'DataBase Insert Error': str(e)}), 500
        
    return jsonify(repo_analyze)
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    