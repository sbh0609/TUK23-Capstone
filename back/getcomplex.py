import subprocess
import re
import json

def analyze_file(file_path):
    command = ""
    if file_path.endswith(".py"):
        command = f"pylint {file_path} --rcfile=analyzeTool/.pylintrc"
    elif file_path.endswith(".java"):
        command = f"java -jar analyzeTool/checkstyle-10.15.0-all.jar -c analyzeTool/google_checks.xml {file_path}"
    elif file_path.endswith(".js") or file_path.endswith(".ts"):
        command = f"eslint {file_path} --format=json"
    elif file_path.endswith(".kt") or file_path.endswith(".kts"):
        command = f"java -Dfile.encoding=UTF-8 analyzeTool/-jar detekt-cli-1.23.6-all.jar --input {file_path} --config analyzeTool/detekt.yml"

    result = subprocess.run(command, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    
    if result.stderr:
        print("Errors:", result.stderr)
    
    if file_path.endswith(".js") or file_path.endswith(".ts"):
        return json.loads(result.stdout)  # JSON 데이터 반환
    else:
        return result.stdout
    
def extract_complexity_messages(command_output):
    complexity_info = {}
    if isinstance(command_output, str):  # 문자열 처리
        patterns = [
            (r'.*?:(\d+):\d+: Cyclomatic Complexity is (\d+)', lambda line, value: (int(line), int(value))),  # Checkstyle
            (r'.*?:(\d+):.*?: R\d+: .*? is too complex. The McCabe rating is (\d+)', lambda line, value: (int(line), int(value))),  # Pylint
            (r'CyclomaticComplexMethod - \d+/\d+ - \[.*?\] at .*?:(\d+):(\d+)', lambda line, value: (int(line), int(value)))  # Detekt
        ]
        for pattern, extractor in patterns:
            for match in re.findall(pattern, command_output, re.MULTILINE):
                line_number, complexity_value = extractor(*match)
                if line_number in complexity_info:
                    complexity_info[line_number] = max(complexity_info[line_number], complexity_value)
                else:
                    complexity_info[line_number] = complexity_value

    elif isinstance(command_output, list):  # JSON 데이터 처리 (ESLint)
        for item in command_output:
            for message in item.get('messages', []):
                if message['ruleId'] == "complexity":
                    complexity_value = int(re.search(r'\d+', message['message']).group())
                    line_number = message.get('line', None)
                    if line_number:
                        if line_number in complexity_info:
                            complexity_info[line_number] = max(complexity_info[line_number], complexity_value)
                        else:
                            complexity_info[line_number] = complexity_value

    return complexity_info


# 파일 경로 설정
files_to_analyze = ["back.py","getframework.py"]
all_files_complexity = {}

# 분석 실행
for file_path in files_to_analyze:
    result = analyze_file(file_path)
    complexity_info = extract_complexity_messages(result)
    all_files_complexity[file_path] = complexity_info

print(all_files_complexity)


# def analyze_file(file_path):
#     command = ""
#     if file_path.endswith(".py"):
#         command = f"pylint {file_path} --rcfile=analyzeTool/.pylintrc"
#     elif file_path.endswith(".java"):
#         command = f"java -jar analyzeTool/checkstyle-10.15.0-all.jar -c analyzeTool/google_checks.xml {file_path}"
#     elif file_path.endswith(".js") or file_path.endswith(".ts"):
#         command = f"eslint {file_path} --format=json"
#     elif file_path.endswith(".kt") or file_path.endswith(".kts"):
#         command = f"java -Dfile.encoding=UTF-8 analyzeTool/-jar detekt-cli-1.23.6-all.jar --input {file_path} --config analyzeTool/detekt.yml"

#     result = subprocess.run(command, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    
#     if result.stderr:
#         print("Errors:", result.stderr)
    
#     if file_path.endswith(".js") or file_path.endswith(".ts"):
#         return json.loads(result.stdout)  # JSON 데이터 반환
#     else:
#         return result.stdout
    
# def extract_complexity_messages(command_output):
#     complexity_count = {}
#     if isinstance(command_output, str):  # 문자열 처리
#         pattern = r'Cyclomatic Complexity is (\d+)|The McCabe rating is (\d+)|complexity: (\d+)|too complex based on Cyclomatic Complexi\(\.\.\.\) \[CyclomaticComplexMethod\]'
#         complexity_matches = re.findall(pattern, command_output)
#         for match in complexity_matches:
#             complexity_value = next((int(m) for m in match if m), None)
#             if complexity_value:
#                 complexity_count[complexity_value] = complexity_count.get(complexity_value, 0) + 1
#     elif isinstance(command_output, list):  # JSON 데이터 처리
#         for item in command_output:
#             for message in item.get('messages', []):
#                 if message['ruleId'] == "complexity":
#                     complexity_value = int(re.search(r'\d+', message['message']).group())
#                     complexity_count[complexity_value] = complexity_count.get(complexity_value, 0) + 1

#     return complexity_count

# files_to_analyze = ["back.py","getframework.py"]

# #분석 실행
# for file_path in files_to_analyze:
#     result = analyze_file(file_path)
#     complexity_info = extract_complexity_messages(result)
#     print(f"{file_path} - Complexity Info: {complexity_info}")
