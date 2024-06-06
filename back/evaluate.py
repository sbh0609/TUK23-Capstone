def give_grade(point):
    if 4.5 <= point <= 5.0:
        return "A+"
    elif 4.0 <= point < 4.5:
        return "A"
    elif 3.5 <= point < 4.0:
        return "B+"
    elif 3.0 <= point < 3.5:
        return "B"
    elif 2.5 <= point < 3.0:
        return "C+"
    elif 2.0 <= point < 2.5:
        return "C"
    elif 1.5 <= point < 2.0:
        return "D"
    elif 1.0 <= point < 1.5:
        return "D-"
    else:
        print(point)
        return "F"
    
def calculate_total_collaboration_score(data):
    # 필요한 점수 추출
    total_pr_merge_score = data['pr_scores']['total_pr_merge_score']
    total_issue_close_score = data['issue_scores']['total_issue_close_score']
    total_commit_message_quality_score = data['commit_message_quality_scores']['total_commit_message_quality_score']
    total_commit_message_grammar_score = data['commit_message_grammar_scores']['total_commit_message_grammar_score']

    # 평균 점수 계산
    total_score = (
        total_pr_merge_score +
        total_issue_close_score +
        total_commit_message_quality_score +
        total_commit_message_grammar_score
    )
    average_score = total_score / 4.0

    # 등급 계산
    grade = give_grade(average_score)
    
    return grade

def calculate_user_collaboration_score(data):
    # 필요한 점수 추출
    user_pr_score = data['pr_scores']['user_pr_score']
    user_mergerd_pr_score=data['pr_scores']['merged_pr_score']
    user_issue_score=data['issue_scores']['user_issue_score']
    user_closed_issue_score=data['issue_scores']['closed_issue_score']
    total_commit_message_quality_score = data['commit_message_quality_scores']['user_commit_message_quality_score']
    total_commit_message_grammar_score = data['commit_message_grammar_scores']['user_commit_message_grammar_score']

    # 평균 점수 계산
    total_score = (
        user_pr_score +
        user_mergerd_pr_score +
        user_issue_score +
        user_closed_issue_score +
        total_commit_message_quality_score +
        total_commit_message_grammar_score
    )
    average_score = total_score / 6.0

    # 등급 계산
    grade = give_grade(average_score)
    
    return grade

def team_code_quality(data):
    comment_score=data['comment_score']
    duplication_score=data['duplication_score']
    complexity_repo_score=data['complexity_repo_score']
    function_length_repo_score=data['function_length_repo_score']
    parameter_count_repo_score=data['parameter_count_repo_score']
    
    total_score = (
        comment_score +
        duplication_score +
        complexity_repo_score +
        function_length_repo_score +
        parameter_count_repo_score
    )
    average_score = total_score / 5.0
    
    grade = give_grade(average_score)
    
    return grade

def convert_scores_to_grades(evaluate):
    evaluate_with_grades = {}
    for key, value in evaluate.items():
        if isinstance(value, (int, float)):  # 단일 점수일 경우
            evaluate_with_grades[key] = give_grade(value)
        elif isinstance(value, dict):  # 딕셔너리 내의 점수일 경우
            nested_scores = {}
            for nested_key, nested_value in value.items():
                nested_scores[nested_key] = give_grade(nested_value)
            evaluate_with_grades[key] = nested_scores
        else:
            evaluate_with_grades[key] = value  # 다른 데이터 타입은 그대로 유지
    return evaluate_with_grades

def evaluate_comment_percentage(comment_percentage):
    if 10 <= comment_percentage < 30:
        return 5  # 매우 우수
    elif (5 <= comment_percentage < 10) or (30 <= comment_percentage < 40):
        return 4  # 우수
    elif (0 <= comment_percentage < 5) or (40 <= comment_percentage < 50):
        return 3  # 보통
    elif 50 <= comment_percentage < 60:
        return 2  # 부족
    elif comment_percentage >= 60:
        return 1  # 매우 부족
    else:
        return 0  # 비율이 0 미만인 경우, 데이터 오류로 간주
    
def evaluate_code_duplication(duplication_percentage):
    if 0 <= duplication_percentage < 10:
        return 5  # 매우 우수
    elif 10 <= duplication_percentage < 20:
        return 4  # 우수
    elif 20 <= duplication_percentage < 30:
        return 3  # 보통
    elif 30 <= duplication_percentage < 40:
        return 2  # 부족
    elif duplication_percentage >= 40:
        return 1  # 매우 부족
    else:
        return 0  # 비율이 0 미만인 경우, 데이터 오류로 간주
    
def evaluate_complexity(complexity_info):
    file_scores = {}
    repo_scores = []

    for file, complexities in complexity_info.items():
        scores = []
        for line, complexity in complexities.items():
            if complexity <= 4:
                scores.append(3)  # 보통
            elif 5 <= complexity <= 7:
                scores.append(2)  # 나쁨
            elif 8 <= complexity <= 30:
                scores.append(1)  # 매우 나쁨
            elif complexity >30:
                scores.append(0)
        
        if scores:
            file_avg_score = sum(scores) / len(scores)
            file_scores[file] = file_avg_score
            repo_scores.append(file_avg_score)
    
    repo_avg_score = sum(repo_scores) / len(repo_scores) if repo_scores else 0
    return file_scores, repo_avg_score


def evaluate_function_length(function_length_info):
    file_scores = {}
    repo_scores = []

    for file, lengths in function_length_info.items():
        scores = []
        for line, length in lengths.items():
            if 20 <= length <= 35:
                scores.append(5)  # 매우 우수
            elif 10 <= length < 20 or 35 < length <= 60:
                scores.append(4)  # 우수
            elif 5 <= length < 10 or 60 < length <= 80:
                scores.append(3)  # 보통
            elif length < 5 or 80 < length <= 100:
                scores.append(2)  # 부족
            elif length > 100:
                scores.append(1)  # 매우 부족
        
        if scores:
            file_avg_score = sum(scores) / len(scores)
            file_scores[file] = file_avg_score
            repo_scores.append(file_avg_score)
    
    repo_avg_score = sum(repo_scores) / len(repo_scores) if repo_scores else 0
    return file_scores, repo_avg_score

def evaluate_parameter_count(parameter_count_info):
    file_scores = {}
    repo_scores = []

    for file, params in parameter_count_info.items():
        scores = []
        for line, count in params.items():
            if count <= 2:
                scores.append(5)  # 매우 우수
            elif 3 <= count <= 4:
                scores.append(4)  # 우수
            elif 5 <= count <= 6:
                scores.append(3)  # 보통
            elif 7 <= count <= 8:
                scores.append(2)  # 부족
            elif count > 8:
                scores.append(1)  # 매우 부족
        
        if scores:
            file_avg_score = sum(scores) / len(scores)
            file_scores[file] = file_avg_score
            repo_scores.append(file_avg_score)
    
    repo_avg_score = sum(repo_scores) / len(repo_scores) if repo_scores else 0
    return file_scores, repo_avg_score

def evaluate_commit_percentage(commit_per):
    total_commits, user_commits, user_commit_percentage = commit_per
    if user_commit_percentage >= 30:
        score = 5
    elif 20 <= user_commit_percentage < 30:
        score = 4
    elif 10 <= user_commit_percentage < 20:
        score = 3
    elif 5 <= user_commit_percentage < 10:
        score = 2
    else:
        score = 1
    return score

def evaluate_pr_percentage(pr_per):
    user_pr_percentage = pr_per['user_pr_percentage']
    merged_user_pr_percentage = pr_per['merged_user_pr_percentage']
    total_pr_merge_percentage = pr_per['merged_pr_percentage']
    
    # 전체 PR에서 사용자가 작성한 비율 평가
    if user_pr_percentage >= 30:
        user_pr_score = 5
    elif user_pr_percentage >= 20:
        user_pr_score = 4
    elif user_pr_percentage >= 10:
        user_pr_score = 3
    elif user_pr_percentage >= 5:
        user_pr_score = 2
    else:
        user_pr_score = 1

    # 사용자가 작성한 PR에서 병합된 비율 평가
    if merged_user_pr_percentage >= 80:
        merged_pr_score = 5
    elif merged_user_pr_percentage >= 60:
        merged_pr_score = 4
    elif merged_user_pr_percentage >= 40:
        merged_pr_score = 3
    elif merged_user_pr_percentage >= 20:
        merged_pr_score = 2
    else:
        merged_pr_score = 1

    # 전체 PR에서 병합된 비율 평가
    if total_pr_merge_percentage >= 80:
        total_pr_merge_score = 5
    elif total_pr_merge_percentage >= 60:
        total_pr_merge_score = 4
    elif total_pr_merge_percentage >= 40:
        total_pr_merge_score = 3
    elif total_pr_merge_percentage >= 20:
        total_pr_merge_score = 2
    else:
        total_pr_merge_score = 1

    return {
        "user_pr_score": user_pr_score,
        "merged_pr_score": merged_pr_score,
        "total_pr_merge_score": total_pr_merge_score
    }

def evaluate_issue_percentage(issue_per):
    user_issue_percentage = issue_per['user_issue_percentage']
    closed_user_issue_percentage = issue_per['closed_user_issue_percentage']
    total_issue_close_percentage = issue_per['closed_issue_percentage']

    # 전체 Issue에서 사용자가 작성한 비율 평가
    if user_issue_percentage >= 30:
        user_issue_score = 5
    elif user_issue_percentage >= 20:
        user_issue_score = 4
    elif user_issue_percentage >= 10:
        user_issue_score = 3
    elif user_issue_percentage >= 5:
        user_issue_score = 2
    else:
        user_issue_score = 1

    # 사용자가 작성한 Issue에서 해결된 비율 평가
    if closed_user_issue_percentage >= 80:
        closed_issue_score = 5
    elif closed_user_issue_percentage >= 60:
        closed_issue_score = 4
    elif closed_user_issue_percentage >= 40:
        closed_issue_score = 3
    elif closed_user_issue_percentage >= 20:
        closed_issue_score = 2
    else:
        closed_issue_score = 1

    # 전체 Issue에서 해결된 비율 평가
    if total_issue_close_percentage >= 80:
        total_issue_close_score = 5
    elif total_issue_close_percentage >= 60:
        total_issue_close_score = 4
    elif total_issue_close_percentage >= 40:
        total_issue_close_score = 3
    elif total_issue_close_percentage >= 20:
        total_issue_close_score = 2
    else:
        total_issue_close_score = 1

    return {
        "user_issue_score": user_issue_score,
        "closed_issue_score": closed_issue_score,
        "total_issue_close_score": total_issue_close_score
    }
def calculate_average_quality_score(quality_list):
    quality_scores = [5, 1, 3, 4]  # why and what: 5, nor: 1, why: 3, what: 4
    total_weighted_score = sum(quality_list[i] * quality_scores[i] for i in range(len(quality_list)))
    total_count = sum(quality_list)
    return total_weighted_score / total_count if total_count else 0

def evaluate_grammar(percentage):
        if percentage >= 90:
            return 5
        elif percentage >= 80:
            return 4
        elif percentage >= 70:
            return 3
        elif percentage >= 60:
            return 2
        else:
            return 1
        
def evaluate_commit_message_quality(total_quality, user_quality):

    total_content_score = calculate_average_quality_score(total_quality)
    user_content_score = calculate_average_quality_score(user_quality)
    
    return {
        "total_commit_message_quality_score": total_content_score,
        "user_commit_message_quality_score": user_content_score
    }

def evaluate_commit_message_grammar(total_grammar, user_grammar):

    total_grammar_score = evaluate_grammar(total_grammar)
    user_grammar_score = evaluate_grammar(user_grammar)

    return {
        "total_commit_message_grammar_score": total_grammar_score,
        "user_commit_message_grammar_score": user_grammar_score
    }
    
    
# def main(data):
#     # 주석 비율 평가
#     total_lines, comment_lines, comment_percentage = data['comment_per']
#     comment_score = evaluate_comment_percentage(comment_percentage)

#     # 코드 중복성 평가
#     total_lines, duplicate_lines, duplication_percentage = data['duplicate_code']
#     duplication_score = evaluate_code_duplication(duplication_percentage)

#     # 복잡도 평가
#     complexity_file_scores, complexity_repo_score = evaluate_complexity(data['complexity'])

#     # 함수 길이 평가
#     function_length_file_scores, function_length_repo_score = evaluate_function_length(data['funcion_length'])

#     # 함수 매개변수 평가
#     parameter_count_file_scores, parameter_count_repo_score = evaluate_parameter_count(data['parameter_count'])

#     # 커밋 비율 평가
#     commit_score = evaluate_commit_percentage(data['commit_per'])

#     # PR 비율 평가
#     pr_scores = evaluate_pr_percentage(data['pr_per'])

#     # Issue 비율 평가
#     issue_scores = evaluate_issue_percentage(data['issue_per'])

#     # 커밋 메시지 평가
#     commit_message_quality_scores = evaluate_commit_message_quality(data['total_quality'], data['user_quality'])
#     commit_message_grammar_scores = evaluate_commit_message_grammar(data['total_grammar'], data['user_grammar'])

#     results = {
#         "comment_score": comment_score,
#         "duplication_score": duplication_score,
#         "complexity_file_scores": complexity_file_scores,
#         "complexity_repo_score": complexity_repo_score,
#         "function_length_file_scores": function_length_file_scores,
#         "function_length_repo_score": function_length_repo_score,
#         "parameter_count_file_scores": parameter_count_file_scores,
#         "parameter_count_repo_score": parameter_count_repo_score,
#         "commit_score": commit_score,
#         "pr_scores": pr_scores,
#         "issue_scores": issue_scores,
#         "commit_message_quality_scores": commit_message_quality_scores,
#         "commit_message_grammar_scores": commit_message_grammar_scores
#     }

#     return results
# data = {
#     'program_lang': ['Python'],
#     'comment_per': (646, 149, 1.1073320494658967),
#     'framework': [],
#     'duplicate_code': (646, 40, 6.191950464396285),
#     'pr_per': {
#         'total_prs': 4,
#         'merged_prs': 3,
#         'merged_pr_percentage': 75.0,
#         'total_user_prs': 1,
#         'merged_user_prs': 1,
#         'merged_user_pr_percentage': 33.33333333333333,
#         'user_pr_percentage': 25.0
#     },
#     'commit_per': (62, 60, 96.7741935483871),
#     'merged_pr_stats': (4, 3, 75.0),
#     'issue_per': {
#         'total_issues': 4,
#         'closed_issues': 4,
#         'closed_issue_percentage': 100.0,
#         'total_user_issues': 1,
#         'closed_user_issues': 1,
#         'closed_user_issue_percentage': 25.0,
#         'user_issue_percentage': 25.0
#     },
#     'complexity': {
#         'file_data\\sbh06091\\Brithub/twitter_bot\\__init__.py': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\console\\filter_api.py': {6: 5},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\console\\requirements.txt': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\generate.py': {15: 4, 45: 2, 53: 7, 73: 8, 98: 15, 154: 19, 210: 2},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\main.py': {6: 3},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\pfp.py': {6: 3, 16: 4, 27: 6, 53: 2},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\requirements.txt': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\tweet.py': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\tweet_dumper.py': {36: 16, 115: 2},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\utils.py': {61: 7}
#     },
#     'funcion_length': {
#         'file_data\\sbh06091\\Brithub/twitter_bot\\__init__.py': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\console\\filter_api.py': {6: 21, 49: 4, 55: 5, 63: 5},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\console\\requirements.txt': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\generate.py': {15: 22, 45: 3, 53: 14, 73: 16, 98: 33, 154: 40},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\main.py': {6: 3},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\pfp.py': {6: 5, 16: 6, 27: 19},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\requirements.txt': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\tweet.py': {6: 7, 18: 3, 23: 3, 27: 2},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\tweet_dumper.py': {26: 7, 36: 49},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\utils.py': {11: 6, 24: 3, 34: 6, 45: 5, 53: 5, 61: 22, 91: 6, 111: 21}
#     },
#     'parameter_count': {
#         'file_data\\sbh06091\\Brithub/twitter_bot\\__init__.py': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\console\\filter_api.py': {6: 1, 49: 2, 55: 3, 63: 3},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\console\\requirements.txt': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\generate.py': {15: 2, 45: 3, 53: 2, 73: 3, 98: 1, 154: 1},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\main.py': {6: 2, 12: 2, 16: 2},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\pfp.py': {6: 3, 16: 3, 27: 2},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\requirements.txt': {},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\tweet.py': {18: 1, 23: 2, 27: 1},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\tweet_dumper.py': {26: 2, 36: 1},
#         'file_data\\sbh06091\\Brithub/twitter_bot\\utils.py': {11: 3, 24: 1, 34: 2, 45: 3, 53: 2, 61: 1, 91: 1, 111: 1}
#     },
#     'total_quality': [28, 1, 3, 27],
#     'user_quality': [26, 1, 3, 27],
#     'total_grammar': 52.63157894736842,
#     'user_grammar': 54.23728813559322
# }
# # 평가 실행
# results = main(data)

# # 결과 출력
# for key, value in results.items():
#     print(f"{key}: {value}")
