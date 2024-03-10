from dotenv import load_dotenv
import hashlib
import json
import requests
import os
import base64
import re

def get_used_lang(repo_name,all_lang,headers):
    main_lang = []
    lang_url = f'https://api.github.com/repos/{repo_name}/languages'
    response = requests.get(lang_url,headers=headers).json()
    repo_lang = list(response.keys())
    for lang in repo_lang:
        if lang in all_lang:
            main_lang.append(lang)
    return main_lang

def comment_percent(repo_file_data):
    comment_styles = {
    ".c": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".cpp": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".h": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".java": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".js": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".cs": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".py": {"inline": "#", "block_start": '"""', "block_end": '"""'},
    ".rb": {"inline": "#"},
    ".php": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".go": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".scala": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".swift": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".ts": {"inline": "//", "block_start": "/*", "block_end": "*/"},
    ".kt": {"inline": "//", "block_start": "/*", "block_end": "*/"}
    }
    result = {}
    total_comment_ratio = 0
    file_count = 0
    for file_name, file_data in repo_file_data.items():
        _, ext = os.path.splitext(file_name)
        if ext in comment_styles:
            lines = file_data.split('\n')
            total_lines = len(lines)
            comment_lines = 0
            in_block_comment = False
            for line in lines:
                stripped_line = line.strip()
                if stripped_line.startswith(comment_styles[ext]['inline']):
                    comment_lines += 1
                elif stripped_line.startswith(comment_styles[ext]['block_start']):
                    in_block_comment = True
                    comment_lines += 1
                elif in_block_comment and stripped_line.endswith(comment_styles[ext]['block_end']):
                    in_block_comment = False
                    comment_lines += 1
                elif in_block_comment:
                    comment_lines += 1
            
            comment_ratio = comment_lines / total_lines if total_lines > 0 else 0         
            # comment_ratio = calculate_comment_ratio(file_data, comment_styles[ext])
            total_comment_ratio += comment_ratio
            file_count += 1
            result[file_name] = comment_ratio
    average_comment_ratio = total_comment_ratio / file_count
    return average_comment_ratio

def analyze_dependencies(repo_file_data):
    frameworks = []
    for file_path, content in repo_file_data.items():
        file_name = os.path.basename(file_path)
        if file_name == 'package.json':
            # JSON 파일 분석
            data = json.loads(content)
            dependencies = data.get('dependencies', {})
            for dep in dependencies:
                if dep in ['react', 'vue', 'angular',"next","nuxt"]:
                    frameworks.append(dep)
        elif file_name == 'requirements.txt':
            for line in content.split('\n'):
                if any(fw in line for fw in ['Django=', 'Flask=', 'FastAPI=', 'Pyramid=', 'Bottle=']):
                    frameworks.append(line.split('==')[0])
           
        elif file_name == 'build.gradle':
            if ('spring-boot' in content or 'spring-framework' in content or 'spring-cloud' in content) and 'Spring' not in frameworks:
                frameworks.append('Spring')
            if ('android' in content or 'com.android.application' in content or 'com.android.library' in content) and 'Android' not in frameworks:
                frameworks.append('Android')
    return frameworks

def detect_code_duplication(repo_file_data):
    line_hashes = {}
    duplicates = 0
    total_lines = 0
    dup_line=[]
    for file_path, content in repo_file_data.items():
        for line in content.split('\n'):
            total_lines += 1
            important_line = True
            stripped_line = line.strip()
            # 중요하지 않은 라인 체크
            if not stripped_line or stripped_line in ["{", "}", "/*", "*/", '"""',"(",")","})"]:
                important_line = False
            else :
                important_line = True
            if important_line:
                line_hash = hashlib.md5(line.encode()).hexdigest()
                if line_hash in line_hashes:
                    if line_hashes[line_hash] == 1:
                        dup_line.append(stripped_line)
                        duplicates += 1
                    line_hashes[line_hash] += 1
                else:
                    line_hashes[line_hash] = 1

    duplicate_ratio = (duplicates / total_lines) * 100 if total_lines > 0 else 0
    return duplicate_ratio

