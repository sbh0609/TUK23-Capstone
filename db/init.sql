CREATE DATABASE IF NOT EXISTS tuk23_capstone;

USE tuk23_capstone;

CREATE TABLE IF NOT EXISTS user (
    web_user_id VARCHAR(20) PRIMARY KEY,
    pwd VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS rated_repo_data (
    repo_selected_time DATETIME,
    repo_name VARCHAR(100),
    repo_contributor_name VARCHAR(40),
    code_smell_grade VARCHAR(200),
    code_reliability_grade VARCHAR(200),
    duplicate_grade VARCHAR(200),
    liar_code_grade VARCHAR(200),
    commit_utilization_grade VARCHAR(200),
    pr_utilization_grade VARCHAR(200),
    issue_utilization_grade VARCHAR(200),
    web_user_id VARCHAR(20),
    PRIMARY KEY (web_user_id, repo_selected_time, repo_name, repo_contributor_name),
    FOREIGN KEY (web_user_id) REFERENCES user(web_user_id)
);

CREATE TABLE IF NOT EXISTS analyzed_repo_data (
    repo_selected_time DATETIME,
    repo_name VARCHAR(100),
    repo_contributor_name VARCHAR(40),
    frameworks JSON,
    main_lang JSON,
    total_pr INT,
    user_pr INT,
    pr_per DOUBLE,
    total_issues INT,
    user_issues INT,
    issue_per DOUBLE,
    total_commits INT,
    user_commits INT,
    user_commit_percentage DOUBLE,
    merged_prs INT,
    merged_prs_percentage DOUBLE,
    total_lines INT,
    comment_lines INT,
    total_comment_percentage DOUBLE,
    duplicates DOUBLE,
    duplicate_percentage DOUBLE,
    total_result JSON,
    user_result JSON,
    total_grammar DOUBLE,
    user_grammar DOUBLE,
    complexity_data JSON,
    web_user_id VARCHAR(20),
    PRIMARY KEY (web_user_id, repo_selected_time, repo_name, repo_contributor_name),
    FOREIGN KEY (web_user_id) REFERENCES user(web_user_id)
);