from flask import Flask, jsonify, request
from flask_cors import CORS,cross_origin
from dotenv import load_dotenv
# from celery import Celery
import os
import func as func
import pymysql
import json
import time
from getframework import (
    not_org_repo,org_repo,choose_repo_commit,choose_repo_extension,classify_personal_team,
    analyze_file,extract_complexity_messages,extract_function_length_messages,extract_parameter_count_messages,
    get_used_lang,get_file_data,comment_percent,analyze_dependencies,detect_code_duplication,
    get_pr_stats,get_issue_stats,commit_percent
)
from evaluate import (
    evaluate_comment_percentage, evaluate_code_duplication, evaluate_complexity,
    evaluate_function_length, evaluate_parameter_count, evaluate_commit_percentage,
    evaluate_pr_percentage, evaluate_issue_percentage, evaluate_commit_message_quality,
    evaluate_commit_message_grammar,calculate_total_collaboration_score,
    calculate_user_collaboration_score,team_code_quality,convert_scores_to_grades, give_grade
)
# 환경 변수 로드 및 토큰 설정

# load_dotenv()
# app = Flask(__name__)
# app.secret_key = 'root'
# CORS(app, supports_credentials=True, origins='http://localhost:3000')
# passwd=os.environ.get('db_pwd')
# app.config['CELERY_BROKER_URL'] = 'redis://redis:6379/0'
# app.config['CELERY_RESULT_BACKEND'] = 'redis://redis:6379/0'

# celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
# celery.conf.update(app.config)

load_dotenv()
app = Flask(__name__)
api=CORS(app)  # CORS 적용
SECRETKEY = 'root'
app.secret_key = SECRETKEY
CORS(app, supports_credentials=True, origins='http://localhost:3000')
passwd=os.environ.get('db_pwd')

connection = pymysql.connect(
    host='localhost',  # 호스트 주소
    port=3306,
    user='root',  # 데이터베이스 사용자 이름
    password=passwd,  # 데이터베이스 암호
    database='tuk23_capstone',  # 사용할 데이터베이스 이름
    charset='utf8mb4',  # 문자 인코딩 설정
    cursorclass=pymysql.cursors.DictCursor  # 결과를 딕셔너리 형태로 반환
)


# def connect_to_database():
#     connection = pymysql.connect(
#         host='db',  # 호스트 주소
#         port=3306,
#         user='root',  # 데이터베이스 사용자 이름
#         password='1234',  # 데이터베이스 암호
#         database='tuk23_capstone',  # 사용할 데이터베이스 이름
#         charset='utf8mb4',  # 문자 인코딩 설정
#         cursorclass=pymysql.cursors.DictCursor  # 결과를 딕셔너리 형태로 반환
#     )
#     return connection

token = os.environ.get('token')
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
}

source_file_extensions = {
    "Python": [".py"],
    "JavaScript": [".js"],
    "Java": [".java"],
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
        # connection = connect_to_database()
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
        # connection = connect_to_database()
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
        # connection = connect_to_database()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM analyzed_repo_data WHERE web_user_id = %s"
            cursor.execute(sql, (userID))
            user = cursor.fetchone()
            username = user['repo_contributor_name']

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
    not_org_repo(repos_url,headers,user_repo_list)
    not_org_repo(con_repos_url,headers,user_repo_list)
    org_repo(organization_list,username,headers,user_repo_list) 
    choose_repo_commit(user_repo_list,headers)
    choose_repo_extension(user_repo_list,all_extensions,headers,filtered_files)
    classify_personal_team(user_repo_list,headers,personal_repo,team_repo)

    personal_list = [i[0]for i in personal_repo]
    team_list = [i[0]for i in team_repo]

    return jsonify({"repositories": user_repo_list,"file_data": filtered_files,"personal_list":personal_list,"team_list":team_list})

# @celery.task
# def analyze_file_task(file_path):
#     result = analyze_file(file_path)
#     complexity_info=extract_complexity_messages(result)
#     function_length_info = extract_function_length_messages(result)
#     parameter_count_info = extract_parameter_count_messages(result)
#     return {"file_path": file_path, "complexity_info": complexity_info, "function_length_info": function_length_info, "parameter_count_info": parameter_count_info}

@app.route('/api/analyze',methods=['POST'])
@cross_origin()
def analyze_repo():
    datas = request.json
    user_name = datas.get('username')
    repo_name = datas.get('repo_name')
    repo_file = datas.get('fileList')
    repo_type = datas.get('repo_type')
    click_time = datas.get('click_time')
    user_id = datas.get('session_userID')

    all_files_complexity = {}
    all_files_function_length = {}
    all_files_parameter_count = {}
    
    try:
        repo_analyze = {}  # 변수 초기화
        grade_evaluate = {}  # 변수 초기화
        with connection.cursor() as cursor:
            # 데이터베이스에서 기존 데이터를 조회
            sql_select_analyzed = """
                SELECT * FROM analyzed_repo_data 
                WHERE repo_name = %s AND repo_contributor_name = %s AND web_user_id = %s 
                ORDER BY repo_selected_time DESC 
                LIMIT 1
            """
            cursor.execute(sql_select_analyzed, (repo_name, user_name, user_id))
            existing_analyzed_data = cursor.fetchone()

            sql_select_evaluate = """
                SELECT * FROM evaluate_repo_data 
                WHERE repo_name = %s AND repo_contributor_name = %s AND web_user_id = %s 
                ORDER BY repo_selected_time DESC 
                LIMIT 1
            """
            cursor.execute(sql_select_evaluate, (repo_name, user_name, user_id))
            existing_evaluate_data = cursor.fetchone()

            if existing_analyzed_data and existing_evaluate_data:
                if repo_type=='personal':
                    
                    # 데이터가 존재하면
                    repo_analyze = {
                        "repo_selected_time":existing_analyzed_data['repo_selected_time'],
                        "program_lang": json.loads(existing_analyzed_data['program_lang']),
                        "comment_per": json.loads(existing_analyzed_data['comment_per']),
                        "framework": json.loads(existing_analyzed_data['framework']),
                        "duplicate_code": json.loads(existing_analyzed_data['duplicate_code']),
                        "complexity": json.loads(existing_analyzed_data['complexity']),
                        "function_length": json.loads(existing_analyzed_data['function_length']),
                        "parameter_count": json.loads(existing_analyzed_data['parameter_count']),
                        "total_quality": json.loads(existing_analyzed_data['total_quality']),
                        "user_quality": json.loads(existing_analyzed_data['user_quality']),
                        "total_grammar": existing_analyzed_data['total_grammar'],
                        "user_grammar": existing_analyzed_data['user_grammar'],
                        "keyword_count": json.loads(existing_analyzed_data['keyword_count'])
                    }

                    grade_evaluate = {
                        "comment_score": existing_evaluate_data['comment_score'],
                        "duplication_score": existing_evaluate_data['duplication_score'],
                        "complexity_file_scores": json.loads(existing_evaluate_data['complexity_file_scores']),
                        "complexity_repo_score": existing_evaluate_data['complexity_repo_score'],
                        "function_length_file_scores": json.loads(existing_evaluate_data['function_length_file_scores']),
                        "function_length_repo_score": existing_evaluate_data['function_length_repo_score'],
                        "parameter_count_file_scores": json.loads(existing_evaluate_data['parameter_count_file_scores']),
                        "parameter_count_repo_score": existing_evaluate_data['parameter_count_repo_score'],
                        "commit_message_quality_scores": json.loads(existing_evaluate_data['commit_message_quality_scores']),
                        "commit_message_grammar_scores": json.loads(existing_evaluate_data['commit_message_grammar_scores']),
                        "code_quality": existing_evaluate_data.get('code_quality')
                    }
                elif(repo_type=='team'):
                    repo_analyze = {
                        "repo_selected_time":existing_analyzed_data['repo_selected_time'],
                        "program_lang": json.loads(existing_analyzed_data['program_lang']),
                        "comment_per": json.loads(existing_analyzed_data['comment_per']),
                        "framework": json.loads(existing_analyzed_data['framework']),
                        "duplicate_code": json.loads(existing_analyzed_data['duplicate_code']),
                        "complexity": json.loads(existing_analyzed_data['complexity']),
                        "pr_data": json.loads(existing_analyzed_data['pr_data']),
                        "commit_per": json.loads(existing_analyzed_data['commit_per']),
                        "issue_data": json.loads(existing_analyzed_data['issue_data']),
                        "function_length": json.loads(existing_analyzed_data['function_length']),
                        "parameter_count": json.loads(existing_analyzed_data['parameter_count']),
                        "total_quality": json.loads(existing_analyzed_data['total_quality']),
                        "user_quality": json.loads(existing_analyzed_data['user_quality']),
                        "total_grammar": existing_analyzed_data['total_grammar'],
                        "user_grammar": existing_analyzed_data['user_grammar'],
                        "keyword_count": json.loads(existing_analyzed_data['keyword_count'])
                    }
                    grade_evaluate = {
                        "comment_score": existing_evaluate_data['comment_score'],
                        "duplication_score": existing_evaluate_data['duplication_score'],
                        "complexity_file_scores": json.loads(existing_evaluate_data['complexity_file_scores']),
                        "complexity_repo_score": existing_evaluate_data['complexity_repo_score'],
                        "function_length_file_scores": json.loads(existing_evaluate_data['function_length_file_scores']),
                        "function_length_repo_score": existing_evaluate_data['function_length_repo_score'],
                        "parameter_count_file_scores": json.loads(existing_evaluate_data['parameter_count_file_scores']),
                        "parameter_count_repo_score": existing_evaluate_data['parameter_count_repo_score'],
                        "commit_score": existing_evaluate_data['commit_score'],
                        "pr_scores": json.loads(existing_evaluate_data['pr_scores']),
                        "issue_scores": json.loads(existing_evaluate_data['issue_scores']),
                        "commit_message_quality_scores": json.loads(existing_evaluate_data['commit_message_quality_scores']),
                        "commit_message_grammar_scores": json.loads(existing_evaluate_data['commit_message_grammar_scores']),
                        "total_collaboration_score": existing_evaluate_data['total_collaboration_score'],
                        "user_collaboration_score": existing_evaluate_data['user_collaboration_score'],
                        "code_quality": existing_evaluate_data.get('code_quality')
                    }
                return jsonify({
                    "repo_analyze": repo_analyze,
                    "evaluate": grade_evaluate
                })
                
    except Exception as e:
        return jsonify({'DataBase Select Error': str(e)}), 500
    
    if(repo_type=='personal'):
        program_lang= get_used_lang(repo_name,all_lang,headers)
        repo_file_data,complex_file_path=get_file_data(repo_file,repo_name,user_id,headers)
        comment_per=comment_percent(repo_file_data)
        framework=analyze_dependencies(repo_file_data)
        dup_code=detect_code_duplication(repo_file_data)

        for file_path in complex_file_path:
            result = analyze_file(file_path)

            complexity_info = extract_complexity_messages(result)
            function_length_info = extract_function_length_messages(result)
            parameter_count_info = extract_parameter_count_messages(result)
            all_files_complexity[file_path] = complexity_info
            all_files_function_length[file_path] = function_length_info
            all_files_parameter_count[file_path] = parameter_count_info


        total_commits, user_commits = func.get_repository_commits(repo_name, user_name, token)
        total_quality, user_quality = func.classify_commit_quality(total_commits, user_commits)
        total_grammar, user_grammar = func.check_grammar(total_commits, user_commits)
        keyword_counts = func.count_keywords(user_commits)

        repo_analyze = {
            "repo_selected_time":click_time,
            "program_lang": program_lang,
            "comment_per": comment_per,
            "framework": framework,
            "duplicate_code": dup_code,
            "complexity": all_files_complexity,
            "function_length": all_files_function_length,
            "parameter_count": all_files_parameter_count,
            "total_quality": total_quality,
            "user_quality": user_quality,
            "total_grammar": total_grammar,
            "user_grammar": user_grammar,
            "keyword_count": keyword_counts
        }
        
        # 평가 점수 계산
        comment_score = evaluate_comment_percentage(comment_per[2])
        duplication_score = evaluate_code_duplication(dup_code[2])
        complexity_file_scores, complexity_repo_score = evaluate_complexity(all_files_complexity)
        function_length_file_scores, function_length_repo_score = evaluate_function_length(all_files_function_length)
        parameter_count_file_scores, parameter_count_repo_score = evaluate_parameter_count(all_files_parameter_count)
        commit_message_quality_scores = evaluate_commit_message_quality(total_quality, user_quality)
        commit_message_grammar_scores = evaluate_commit_message_grammar(total_grammar, user_grammar)

        evaluate = {
            "comment_score": comment_score,
            "duplication_score": duplication_score,
            "complexity_file_scores": complexity_file_scores,
            "complexity_repo_score": complexity_repo_score,
            "function_length_file_scores":function_length_file_scores,
            "function_length_repo_score":function_length_repo_score,
            "parameter_count_file_scores":parameter_count_file_scores,
            "parameter_count_repo_score": parameter_count_repo_score,
            "commit_message_quality_scores": commit_message_quality_scores,
            "commit_message_grammar_scores": commit_message_grammar_scores
        }
        grade_evaluate=convert_scores_to_grades(evaluate)
        code_quality=team_code_quality(evaluate)
        grade_evaluate['code_quality'] = code_quality
        try:
            with connection.cursor() as cursor:
                sql_insert = """
                    INSERT INTO analyzed_repo_data (
                        web_user_id, 
                        repo_selected_time,
                        repo_name, 
                        repo_contributor_name, 
                        program_lang, 
                        comment_per, 
                        framework, 
                        duplicate_code, 
                        complexity, 
                        function_length, 
                        parameter_count, 
                        total_quality, 
                        user_quality, 
                        total_grammar, 
                        user_grammar,
                        keyword_count
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql_insert, (
                    user_id,
                    click_time,
                    repo_name,
                    user_name,
                    json.dumps(repo_analyze['program_lang']),
                    json.dumps(repo_analyze['comment_per']),
                    json.dumps(repo_analyze['framework']),
                    json.dumps(repo_analyze['duplicate_code']),
                    json.dumps(repo_analyze['complexity']),
                    json.dumps(repo_analyze['function_length']),
                    json.dumps(repo_analyze['parameter_count']),
                    json.dumps(repo_analyze['total_quality']),
                    json.dumps(repo_analyze['user_quality']),
                    repo_analyze['total_grammar'],
                    repo_analyze['user_grammar'],
                    json.dumps(repo_analyze["keyword_count"])
                ))
                sql_insert_evaluate = """
                    INSERT INTO evaluate_repo_data (
                        repo_selected_time,
                        repo_name,
                        repo_contributor_name,
                        web_user_id,
                        comment_score,
                        duplication_score,
                        complexity_file_scores,
                        complexity_repo_score,
                        function_length_file_scores,
                        function_length_repo_score,
                        parameter_count_file_scores,
                        parameter_count_repo_score,
                        commit_message_quality_scores,
                        commit_message_grammar_scores
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql_insert_evaluate, (
                    click_time,
                    repo_name,
                    user_name,
                    user_id,
                    grade_evaluate['comment_score'],
                    grade_evaluate['duplication_score'],
                    json.dumps(grade_evaluate['complexity_file_scores']),
                    grade_evaluate['complexity_repo_score'],
                    json.dumps(grade_evaluate['function_length_file_scores']),
                    grade_evaluate['function_length_repo_score'],
                    json.dumps(grade_evaluate['parameter_count_file_scores']),
                    grade_evaluate['parameter_count_repo_score'],
                    json.dumps(grade_evaluate['commit_message_quality_scores']),
                    json.dumps(grade_evaluate['commit_message_grammar_scores'])
                ))
                connection.commit()
        except Exception as e:
            return jsonify({'DataBase Insert Error': str(e)}), 500
    
    elif(repo_type=='team'):
        program_lang= get_used_lang(repo_name,all_lang,headers)
        repo_file_data,complex_file_path=get_file_data(repo_file,repo_name,user_id,headers)
        
        comment_per=comment_percent(repo_file_data)
        framework=analyze_dependencies(repo_file_data)
        dup_code=detect_code_duplication(repo_file_data)
        pr_data=get_pr_stats(user_name,repo_name,headers)
        issue_data = get_issue_stats(user_name,repo_name,headers)
        commit_per = commit_percent(user_name,repo_name,headers)
        
        for file_path in complex_file_path:
            result = analyze_file(file_path)
        
            complexity_info = extract_complexity_messages(result)
            function_length_info = extract_function_length_messages(result)
            parameter_count_info = extract_parameter_count_messages(result)
            all_files_complexity[file_path] = complexity_info
            all_files_function_length[file_path] = function_length_info
            all_files_parameter_count[file_path] = parameter_count_info

        
        total_commits, user_commits = func.get_repository_commits(repo_name, user_name, token)
        total_quality, user_quality = func.classify_commit_quality(total_commits, user_commits)
        total_grammar, user_grammar = func.check_grammar(total_commits, user_commits)
        keyword_counts = func.count_keywords(user_commits)

        repo_analyze = {
            "repo_selected_time":click_time,
            "program_lang": program_lang,
            "comment_per": comment_per,
            "framework": framework,
            "duplicate_code": dup_code,
            "pr_data": pr_data,
            "commit_per": commit_per,
            "issue_data": issue_data,
            "complexity": all_files_complexity,
            "function_length": all_files_function_length,
            "parameter_count": all_files_parameter_count,
            "total_quality": total_quality,
            "user_quality": user_quality,
            "total_grammar": total_grammar,
            "user_grammar": user_grammar,
            "keyword_count": keyword_counts
        }
                # 평가 점수 계산
        comment_score = evaluate_comment_percentage(comment_per[2])
        print(comment_score)
        print(comment_per)
        duplication_score = evaluate_code_duplication(dup_code[2])
        complexity_file_scores, complexity_repo_score = evaluate_complexity(all_files_complexity)
        function_length_file_scores, function_length_repo_score = evaluate_function_length(all_files_function_length)
        parameter_count_file_scores, parameter_count_repo_score = evaluate_parameter_count(all_files_parameter_count)
        commit_score = evaluate_commit_percentage(commit_per)
        pr_scores = evaluate_pr_percentage(pr_data)
        issue_scores = evaluate_issue_percentage(issue_data)
        commit_message_quality_scores = evaluate_commit_message_quality(total_quality, user_quality)
        commit_message_grammar_scores = evaluate_commit_message_grammar(total_grammar, user_grammar)

        evaluate = {
            "comment_score": comment_score,
            "duplication_score": duplication_score,
            "complexity_file_scores": complexity_file_scores,
            "complexity_repo_score": complexity_repo_score,
            "function_length_file_scores":function_length_file_scores,
            "function_length_repo_score":function_length_repo_score,
            "parameter_count_file_scores":parameter_count_file_scores,
            "parameter_count_repo_score": parameter_count_repo_score,
            "commit_score": commit_score,
            "pr_scores": pr_scores,
            "issue_scores": issue_scores,
            "commit_message_quality_scores": commit_message_quality_scores,
            "commit_message_grammar_scores": commit_message_grammar_scores
        }
        grade_evaluate=convert_scores_to_grades(evaluate)
            
        total_collaboration_score=calculate_total_collaboration_score(evaluate)
        user_collaboration_score=calculate_user_collaboration_score(evaluate)
        code_quality=team_code_quality(evaluate)
        
        # 추가 점수 변환
        grade_evaluate['total_collaboration_score'] = total_collaboration_score
        grade_evaluate['user_collaboration_score'] = user_collaboration_score
        grade_evaluate['code_quality'] = code_quality
        try:
            with connection.cursor() as cursor:
                sql_insert = """
                    INSERT INTO analyzed_repo_data (
                        repo_selected_time, 
                        repo_name, 
                        repo_contributor_name, 
                        web_user_id, 
                        program_lang, 
                        comment_per, 
                        framework, 
                        duplicate_code, 
                        pr_data, 
                        commit_per, 
                        issue_data, 
                        complexity, 
                        function_length, 
                        parameter_count, 
                        total_quality, 
                        user_quality, 
                        total_grammar, 
                        user_grammar,
                        keyword_count
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql_insert, (
                    click_time,
                    repo_name,
                    user_name,
                    user_id,
                    json.dumps(repo_analyze['program_lang']),
                    json.dumps(repo_analyze['comment_per']),
                    json.dumps(repo_analyze['framework']),
                    json.dumps(repo_analyze['duplicate_code']),
                    json.dumps(repo_analyze['pr_data']),
                    json.dumps(repo_analyze['commit_per']),
                    json.dumps(repo_analyze['issue_data']),
                    json.dumps(repo_analyze['complexity']),
                    json.dumps(repo_analyze['function_length']),
                    json.dumps(repo_analyze['parameter_count']),
                    json.dumps(repo_analyze['total_quality']),
                    json.dumps(repo_analyze['user_quality']),
                    repo_analyze['total_grammar'],
                    repo_analyze['user_grammar'],
                    json.dumps(repo_analyze["keyword_count"])
                ))
                sql_insert_evaluate = """
                     INSERT INTO evaluate_repo_data (
                        repo_selected_time,
                        repo_name,
                        repo_contributor_name,
                        web_user_id,
                        comment_score,
                        duplication_score,
                        complexity_file_scores,
                        complexity_repo_score,
                        function_length_file_scores,
                        function_length_repo_score,
                        parameter_count_file_scores,
                        parameter_count_repo_score,
                        commit_score,
                        pr_scores,
                        issue_scores,
                        commit_message_quality_scores,
                        commit_message_grammar_scores,
                        total_collaboration_score,
                        user_collaboration_score,
                        code_quality
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql_insert_evaluate, (
                    click_time,
                    repo_name,
                    user_name,
                    user_id,
                    grade_evaluate['comment_score'],
                    grade_evaluate['duplication_score'],
                    json.dumps(grade_evaluate['complexity_file_scores']),
                    grade_evaluate['complexity_repo_score'],
                    json.dumps(grade_evaluate['function_length_file_scores']),
                    grade_evaluate['function_length_repo_score'],
                    json.dumps(grade_evaluate['parameter_count_file_scores']),
                    grade_evaluate['parameter_count_repo_score'],
                    grade_evaluate['commit_score'],
                    json.dumps(grade_evaluate['pr_scores']),
                    json.dumps(grade_evaluate['issue_scores']),
                    json.dumps(grade_evaluate['commit_message_quality_scores']),
                    json.dumps(grade_evaluate['commit_message_grammar_scores']),
                    grade_evaluate['total_collaboration_score'],
                    grade_evaluate['user_collaboration_score'],
                    grade_evaluate['code_quality']
                ))
                connection.commit()
        except Exception as e:
            return jsonify({'DataBase Insert Error': str(e)}), 500
    print(grade_evaluate)
    print(repo_analyze)
    return jsonify({
        "repo_analyze": repo_analyze,
        "evaluate": grade_evaluate
    })
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    