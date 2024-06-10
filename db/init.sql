CREATE DATABASE IF NOT EXISTS tuk23_capstone;

USE tuk23_capstone;

CREATE TABLE IF NOT EXISTS user (
    web_user_id VARCHAR(20) PRIMARY KEY,
    pwd VARCHAR(20)
);
CREATE TABLE IF NOT EXISTS analyzed_repo_data (
    repo_selected_time DATETIME,
    repo_name VARCHAR(100),
    repo_contributor_name VARCHAR(40),
    web_user_id VARCHAR(20),
    program_lang JSON,
    comment_per JSON,
    framework JSON,
    duplicate_code JSON,
    pr_data JSON,
    commit_per JSON,
    issue_data JSON,
    complexity JSON,
    function_length JSON,
    parameter_count JSON,
    total_quality JSON,
    user_quality JSON,
    total_grammar FLOAT,
    user_grammar FLOAT,
    keyword_count JSON,
    PRIMARY KEY (web_user_id, repo_selected_time, repo_name, repo_contributor_name),
    FOREIGN KEY (web_user_id) REFERENCES user(web_user_id)
);

CREATE TABLE IF NOT EXISTS evaluate_repo_data (
    repo_selected_time DATETIME,
    repo_name VARCHAR(100),
    repo_contributor_name VARCHAR(40),
    web_user_id VARCHAR(20),
    comment_score VARCHAR(2),
    duplication_score VARCHAR(2),
    complexity_file_scores JSON,
    complexity_repo_score VARCHAR(2),
    function_length_file_scores JSON,
    function_length_repo_score VARCHAR(2),
    parameter_count_file_scores JSON,
    parameter_count_repo_score VARCHAR(2),
    commit_score VARCHAR(2),
    pr_scores JSON,
    issue_scores JSON,
    commit_message_quality_scores JSON,
    commit_message_grammar_scores JSON,
    total_collaboration_score VARCHAR(2),
    user_collaboration_score VARCHAR(2),
    code_quality VARCHAR(2),
    PRIMARY KEY (web_user_id, repo_selected_time, repo_name, repo_contributor_name),
    FOREIGN KEY (web_user_id) REFERENCES user(web_user_id)
);