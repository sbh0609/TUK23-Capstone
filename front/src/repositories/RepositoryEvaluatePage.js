import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRepository } from "../Context/RepositoryContext";
import { useNavigate, useLocation } from 'react-router-dom';
import "./RepositoryEvaluatePage.css";  // CSS 파일 추가

const RepositoryEvaluatePage = () => {
    const session_userID = sessionStorage.getItem("userID");
    const { repositoryDetail } = useRepository();
    const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
    const navigate = useNavigate();
    const location = useLocation();

    const { repoAnalyze: reanalyzedRepoAnalyze, evaluate: reanalyzedEvaluate } = location.state || {};

    const [repoAnalyze, setRepoAnalyze] = useState(reanalyzedRepoAnalyze || null);
    const [evaluate, setEvaluate] = useState(reanalyzedEvaluate || null);

    useEffect(() => {
        if (!repoAnalyze || !evaluate) {
            axios.post('http://localhost:5000/api/analyze', { 
                repo_name, 
                username, 
                fileList, 
                repo_type, 
                click_time, 
                session_userID 
            })
            .then(response => {
                setRepoAnalyze(response.data.repo_analyze);
                setEvaluate(response.data.evaluate);
                console.log("df",repoAnalyze)
                console.log("df",evaluate)
            })
            .catch(error => {
                console.error('Error:', error);
                window.alert('Error: ' + error);
            });
        }
    }, [repoAnalyze, evaluate, repo_name, username, fileList, repo_type, click_time, session_userID]);

    if (!repoAnalyze || !evaluate) {
        return <div>Loading...</div>;
    }

    const handleDetailClick = () => {
        navigate("/detail", {
            state: { 
              repoAnalyze, 
              evaluate, 
              repo_name, 
              username, 
              repo_type, 
              session_userID
            }
        });
    };
       // 등급에 따라 배경색을 설정하는 함수
    // 등급에 따라 배경색을 설정하는 함수
    const getGradeClass = (grade) => {
        switch (grade) {
            case "A+":
            case "A":
                return "grade-a"; // 초록색
            case "B+":
            case "B":
                return "grade-b"; // 파랑색
            case "C+":
            case "C":
                return "grade-c"; // 노랑색
            case "D+":
            case "D":
                return "grade-d"; // 빨강색
            default:
                return "grade-default"; // 하얀색
        }
    };
    const formatFilePath = (filePath) => {
        const pathParts = filePath.split("/"); // 경로를 '/'로 분리
        return pathParts.slice(2).join("/"); // 'file_data/사용자명/' 이후의 경로만 남김
    };
    // 가장 높은 값을 찾는 함수
    const findHighestValue = (data) => {
        let highestValue = { filePath: "", line: 0, value: 0 };
        Object.entries(data).forEach(([filePath, lineData]) => {
            Object.entries(lineData).forEach(([line, value]) => {
                if (value > highestValue.value) {
                    highestValue = { filePath, line, value };
                }
            });
        });
        return highestValue;
    };
    // 코드 작성 능력 평가 생성
    const generateCodeQualityMessage = (qualityScore) => {
        switch (qualityScore) {
            case "A+":
            case "A":
                return "저장소는 전반적으로 높은 수준의 코드 품질을 유지하고 있습니다. 코드 가독성과 유지보수성이 매우 우수하며, 현재 상태를 유지하면 좋습니다.";
            case "B+":
            case "B":
                return "저장소는 대체로 좋은 품질을 유지하고 있지만, 코드 개선이 필요한 부분이 있습니다. 가독성과 유지보수를 위해 일부 리팩토링을 고려할 수 있습니다.";
            case "C+":
            case "C":
                return "코드 품질이 중간 수준이며, 여러 부분에서 개선이 필요합니다. 가독성과 유지보수성을 위해 리팩토링이 필요합니다.";
            case "D+":
            case "D":
                return "코드 품질이 낮습니다. 가독성과 유지보수를 위해 적극적인 리팩토링이 필요합니다.";
            default:
                return "코드 품질 평가를 할 수 있는 정보가 부족합니다.";
        }
    };

    // 주석 비율에 대한 메시지 생성
    const generateCommentMessage = (commentScore, totalComments, commentLines, commentRatio) => {
        let commentMessage = "";
    
        switch (commentScore) {
            case "A+":
            case "A":
                commentMessage = `총 ${totalComments}줄 중 ${commentLines}줄이 주석으로, 주석 비율은 ${commentRatio.toFixed(2)}%입니다. 주석이 충분하고 적절하게 작성되어 코드의 가독성이 크게 향상되고 있습니다.`;
                break;
            case "B+":
            case "B":
                commentMessage = `총 ${totalComments}줄 중 ${commentLines}줄이 주석으로, 주석 비율은 ${commentRatio.toFixed(2)}%입니다. 주석이 적절하게 작성되었으나, 추가적인 설명이 필요할 수 있습니다.`;
                break;
            case "C+":
            case "C":
                commentMessage = `총 ${totalComments}줄 중 ${commentLines}줄이 주석으로, 주석 비율은 ${commentRatio.toFixed(2)}%입니다. 주석이 부족하거나 부적절하여 코드 이해가 어려울 수 있습니다.`;
                break;
            case "D+":
            case "D":
                commentMessage = `총 ${totalComments}줄 중 ${commentLines}줄이 주석으로, 주석 비율은 ${commentRatio.toFixed(2)}%입니다. 주석이 너무 많아 가독성을 방해하고 있습니다.`;
                break;
            default:
                commentMessage = "관련 데이터를 평가할 정보가 부족합니다.";
                break;
        }
    
        return <p>{commentMessage}</p>;
    };

    
    // 복잡도 메시지 생성
    const generateComplexityMessage = (complexityScore, complexityData) => {
        const highestComplexity = findHighestValue(complexityData);
        const formattedPath = formatFilePath(highestComplexity.filePath); // 경로에서 'file_data/사용자명/' 부분 제거
        const complexityMessage = `복잡도가 가장 높은 파일은 ${formattedPath}의 라인 ${highestComplexity.line}이며, 복잡도 값은 ${highestComplexity.value}입니다.`;

        let message = "";

        switch (complexityScore) {
            case "A+":
            case "A":
                message = `저장소의 코드 복잡도가 매우 낮습니다. 가독성과 유지보수성이 뛰어납니다.${complexityMessage}`;
                break;
            case "B+":
            case "B":
                message = `코드 복잡도가 대체로 양호하지만 일부 파일에서 복잡도가 증가하고 있습니다. ${complexityMessage}`;
                break;
            case "C+":
            case "C":
                message = `저장소에는 복잡도가 높은 파일들이 존재하며, 유지보수에 어려움을 줄 수 있습니다. ${complexityMessage}`;
                break;
            case "D+":
            case "D":
                message = `코드 복잡도가 매우 높아 유지보수에 심각한 어려움을 줄 수 있습니다. ${complexityMessage}`;
                break;
            default:
                message = "코드 복잡도를 평가할 정보가 부족합니다.";
                break;
        }

        return <p>코드 복잡도: {complexityScore}<br />{message}</p>;
    };

    // 함수 길이 메시지 생성
    const generateFunctionLengthMessage = (functionLengthScore, functionLengthData) => {
        const highestFunctionLength = findHighestValue(functionLengthData);
        const formattedPath = formatFilePath(highestFunctionLength.filePath); // 경로에서 'file_data/사용자명/' 부분 제거
        const functionLengthMessage = `가장 긴 함수는 ${formattedPath}의 라인 ${highestFunctionLength.line}이며, 함수 길이는 ${highestFunctionLength.value}입니다.`;

        let message = "";

        switch (functionLengthScore) {
            case "A+":
            case "A":
                message = `함수 길이가 적절하여 가독성과 유지보수성이 우수합니다.${functionLengthMessage}`;
                break;
            case "B+":
            case "B":
                message = `함수 길이가 대체로 적절하지만, 일부 긴 함수가 있습니다. ${functionLengthMessage}`;
                break;
            case "C+":
            case "C":
                message = `긴 함수들이 존재하여 코드 가독성과 유지보수성이 떨어질 수 있습니다. ${functionLengthMessage}`;
                break;
            case "D+":
            case "D":
                message = `함수가 너무 길어 코드 가독성이 매우 떨어집니다. ${functionLengthMessage}`;
                break;
            default:
                message = "함수 길이를 평가할 정보가 부족합니다.";
                break;
        }

        return <p>함수 길이 등급: {functionLengthScore}<br />{message}</p>;
    };

    // 매개변수 수 메시지 생성
    const generateParameterCountMessage = (parameterCountScore, parameterCountData) => {
        const highestParameterCount = findHighestValue(parameterCountData);
        const formattedPath = formatFilePath(highestParameterCount.filePath); // 경로에서 'file_data/사용자명/' 부분 제거
        const parameterCountMessage = `가장 많은 매개변수를 사용하는 함수는 ${formattedPath}의 라인 ${highestParameterCount.line}이며, 매개변수 수는 ${highestParameterCount.value}입니다.`;

        let message = "";

        switch (parameterCountScore) {
            case "A+":
            case "A":
                message = `매개변수 수가 적절하게 관리되고 있습니다.${parameterCountMessage}`;
                break;
            case "B+":
            case "B":
                message = `매개변수 수가 적절하지만, 일부 함수에서는 매개변수가 다소 많습니다. ${parameterCountMessage}`;
                break;
            case "C+":
            case "C":
                message = `매개변수가 많은 함수들이 있어 코드 가독성이 떨어질 수 있습니다. ${parameterCountMessage}`;
                break;
            case "D+":
            case "D":
                message = `매개변수가 너무 많아 가독성과 유지보수성이 크게 떨어집니다. ${parameterCountMessage}`;
                break;
            default:
                message = "매개변수 수를 평가할 정보가 부족합니다.";
                break;
        }

        return <p>매개변수 수 등급: {parameterCountScore}<br />{message}</p>;
    };
    // 중복성에 따른 메시지 생성
    const generateDuplicationMessage = (duplicationScore, duplicationData) => {
        const [totalLines, duplicatedLines, duplicationRatio] = duplicationData || [];

        let duplicationMessage = "";

        switch (duplicationScore) {
            case "A+":
            case "A":
                duplicationMessage = `중복 코드가 거의 없으며, 코드의 효율성이 매우 높습니다. 중복 코드 비율은 ${duplicationRatio.toFixed(2)}%로 매우 낮은 편입니다.`;
                break;
            case "B+":
            case "B":
                duplicationMessage = `중복 코드 비율이 약간 높습니다. 코드 재사용을 고려할 수 있습니다. 중복 코드 비율은 ${duplicationRatio.toFixed(2)}%입니다.`;
                break;
            case "C+":
            case "C":
                duplicationMessage = `중복 코드 비율이 다소 높습니다. 중복된 코드를 리팩토링하여 개선하는 것이 좋습니다. 중복 코드 비율은 ${duplicationRatio.toFixed(2)}%입니다.`;
                break;
            case "D+":
            case "D":
                duplicationMessage = `중복 코드가 매우 많아 코드 효율성이 떨어집니다. 중복 코드를 제거하거나 함수화를 통해 코드 중복성을 줄여야 합니다. 중복 코드 비율은 ${duplicationRatio.toFixed(2)}%입니다.`;
                break;
            default:
                duplicationMessage = "중복성을 평가할 정보가 부족합니다.";
                break;
        }

        return <p>중복성 등급: {duplicationScore}<br />{duplicationMessage}</p>;
    };

    // PR 관리에 대한 메시지 생성
    const generatePRManagementMessage = (prScores, prData, username) => {
        const { total_prs, merged_prs, merged_pr_percentage, total_user_prs, merged_user_prs, merged_user_pr_percentage } = prData || {};
        const { user_pr_score, total_pr_merge_score } = prScores || {};
        console.log(user_pr_score, total_pr_merge_score);
        let storageMessage = "";
        let userMessage = "";

        // 전체 저장소 PR 병합 비율에 따른 메시지
        switch (total_pr_merge_score) {
            case "A+":
            case "A":
                storageMessage = `저장소의 총 PR은 ${total_prs}개이며, 이 중 ${merged_prs}개(${merged_pr_percentage}%)가 병합되었습니다. PR 관리가 매우 잘 이루어졌습니다.`;
                break;
            case "B+":
            case "B":
                storageMessage = `저장소의 총 PR은 ${total_prs}개이며, 이 중 ${merged_prs}개(${merged_pr_percentage}%)가 병합되었습니다. PR 관리는 양호하나, 다소 개선이 필요할 수 있습니다.`;
                break;
            case "C+":
            case "C":
                storageMessage = `저장소의 총 PR은 ${total_prs}개이며, 이 중 ${merged_prs}개(${merged_pr_percentage}%)가 병합되었습니다. PR 관리가 부족하여 개선이 필요합니다.`;
                break;
            case "D+":
            case "D":
                storageMessage = `저장소의 총 PR은 ${total_prs}개이며, 이 중 ${merged_prs}개(${merged_pr_percentage}%)만 병합되었습니다. PR 관리가 매우 미흡하여 즉각적인 개선이 필요합니다.`;
                break;
            default:
                storageMessage = "PR 관리에 대한 평가를 할 수 있는 정보가 부족합니다.";
                break;
        }

        // 사용자 PR 병합 비율에 따른 메시지
        switch (user_pr_score) {
            case "A+":
            case "A":
                userMessage = `${username}님이 작성한 PR 중 ${merged_user_pr_percentage}%(${merged_user_prs}/${total_user_prs})가 병합되었습니다. PR 작성 및 병합 관리가 매우 우수합니다.`;
                break;
            case "B+":
            case "B":
                userMessage = `${username}님이 작성한 PR 중 ${merged_user_pr_percentage}%(${merged_user_prs}/${total_user_prs})가 병합되었습니다. 병합률이 양호하나, 더 많은 피드백을 반영하여 개선이 필요합니다.`;
                break;
            case "C+":
            case "C":
                userMessage = `${username}님이 작성한 PR 중 ${merged_user_pr_percentage}%(${merged_user_prs}/${total_user_prs})만 병합되었습니다. PR 작성은 많지만, 병합률이 상대적으로 낮습니다. 팀과의 협업을 통해 더 많은 피드백을 받아 개선하는 것이 좋습니다.`;
                break;
            case "D+":
            case "D":
                userMessage = `${username}님이 작성한 PR 중 ${merged_user_pr_percentage}%(${merged_user_prs}/${total_user_prs})만 병합되었습니다. PR 관리가 매우 부족하며, 병합 가능성을 높이기 위한 노력이 필요합니다.`;
                break;
            default:
                userMessage = `${username}님의 PR 관리에 대한 평가를 할 수 있는 정보가 부족합니다.`;
                break;
        }

        return (
            <div>
                <h3>PR 관리</h3>
                <p>전체 저장소 PR 병합 비율: {total_pr_merge_score}</p>
                <p>{storageMessage}</p>
                <p>사용자 PR 병합 비율: {user_pr_score}</p>
                <p>{userMessage}</p>
            </div>
        );
    };

    // Issue 해결에 대한 메시지 생성
    const generateIssueManagementMessage = (issueScores, issueData, username) => {
        const { total_issues, closed_issues, closed_issue_percentage, total_user_issues, closed_user_issues, closed_user_issue_percentage } = issueData || {};
        const { total_issue_close_score, user_issue_score } = issueScores || {};
        console.log("왜안됨",total_issue_close_score, user_issue_score)
        let storageMessage = "";
        let userMessage = "";

        // 전체 저장소 Issue 해결 비율에 따른 메시지
        switch (total_issue_close_score) {
            case "A+":
            case "A":
                storageMessage = `저장소의 이슈 ${total_issues}개 중 ${closed_issues}개(${closed_issue_percentage}%)가 해결되었습니다. 이슈 관리가 매우 잘 이루어졌습니다.`;
                break;
            case "B+":
            case "B":
                storageMessage = `저장소의 이슈 ${total_issues}개 중 ${closed_issues}개(${closed_issue_percentage}%)가 해결되었습니다. 이슈 관리가 양호하나, 다소 개선이 필요할 수 있습니다.`;
                break;
            case "C+":
            case "C":
                storageMessage = `저장소의 이슈 ${total_issues}개 중 ${closed_issues}개(${closed_issue_percentage}%)가 해결되었습니다. 이슈 관리가 부족하여 개선이 필요합니다.`;
                break;
            case "D+":
            case "D":
                storageMessage = `저장소의 이슈 ${total_issues}개 중 ${closed_issues}개(${closed_issue_percentage}%)만 해결되었습니다. 이슈 관리가 매우 미흡하여 즉각적인 개선이 필요합니다.`;
                break;
            default:
                storageMessage = "이슈 관리에 대한 평가를 할 수 있는 정보가 부족합니다.";
                break;
        }

        // 사용자 Issue 해결 비율에 따른 메시지
        switch (user_issue_score) {
            case "A+":
            case "A":
                userMessage = `${username}님이 작성한 이슈 중 ${closed_user_issue_percentage}%(${closed_user_issues}/${total_user_issues})가 해결되었습니다. ${username}가 적극적으로 이슈 해결에 참여하고 있습니다.`;
                break;
            case "B+":
            case "B":
                userMessage = `${username}님이 작성한 이슈 중 ${closed_user_issue_percentage}%(${closed_user_issues}/${total_user_issues})가 해결되었습니다. ${username}가 이슈 해결에 적극적으로 참여하고 있으나, 더 많은 해결이 필요할 수 있습니다.`;
                break;
            case "C+":
            case "C":
                userMessage = `${username}님이 작성한 이슈 중 ${closed_user_issue_percentage}%(${closed_user_issues}/${total_user_issues})만 해결되었습니다. ${username}가 이슈 해결에 다소 소극적이며, 더 많은 참여가 필요합니다.`;
                break;
            case "D+":
            case "D":
                userMessage = `${username}님이 작성한 이슈 중 ${closed_user_issue_percentage}%(${closed_user_issues}/${total_user_issues})만 해결되었습니다. ${username}의 이슈 해결이 매우 부족하며, 개선이 필요합니다.`;
                break;
            default:
                userMessage = `${username}님의 이슈 해결에 대한 평가를 할 수 있는 정보가 부족합니다.`;
                break;
        }

        return (
            <div>
                <h3>Issue 해결</h3>
                <p>전체 저장소 Issue 해결 비율: {total_issue_close_score}</p>
                <p>{storageMessage}</p>
                <p>사용자 Issue 해결 비율: {user_issue_score}</p>
                <p>{userMessage}</p>
            </div>
        );
    };

    // 커밋 점수에 대한 메시지 생성
    const generateCommitScoreMessage = (commitScore, commitData, username) => {
        const totalCommits = commitData ? commitData[0] : 0;
        const userCommits = commitData ? commitData[1] : 0;
        const commitPercentage = commitData ? commitData[2] : 0;

        let commitMessage = "";

        switch (commitScore) {
            case "A+":
            case "A":
                commitMessage = `저장소의 전체 커밋 중 ${commitPercentage}%가 ${username}님에 의해 작성되었습니다. 프로젝트 기여도가 매우 높으며, 커밋 양에서도 큰 비중을 차지하고 있습니다. 팀 프로젝트에서 매우 높은 수준의 참여를 보여주고 있습니다.`;
                break;
            case "B+":
            case "B":
                commitMessage = `${username}님은 전체 커밋 중 ${commitPercentage}%를 작성하셨습니다. 팀 프로젝트에 적극적으로 기여하고 있으나, 커밋의 비중을 높이기 위해 조금 더 참여할 수 있는 기회가 있습니다.`;
                break;
            case "C+":
            case "C":
                commitMessage = `${username}님은 전체 커밋 중 ${commitPercentage}%를 작성하셨습니다. 프로젝트에 기여하고 있으나, 더 많은 커밋을 통해 기여도를 높일 수 있습니다.`;
                break;
            case "D+":
            case "D":
                commitMessage = `${username}님의 커밋 기여도가 ${commitPercentage}%로 낮은 편입니다. 더 많은 커밋을 통해 프로젝트에 더 많은 기여를 할 수 있습니다.`;
                break;
            default:
                commitMessage = "커밋 점수에 대한 정보를 평가할 수 없습니다.";
                break;
        }

        return (
            <div>
                <h3>커밋 점수</h3>
                <p>커밋 점수: {commitScore}</p>
                <p>{commitMessage}</p>
            </div>
        );
    };

    // 커밋 메시지 품질에 대한 메시지 생성
    const generateCommitMessageQualityMessage = (commitMessageQualityScores, username) => {
        const { total_commit_message_quality_score, user_commit_message_quality_score } = commitMessageQualityScores || {};
        
        let storageMessage = "";
        let userMessage = "";

        // 전체 저장소 커밋 메시지 품질에 따른 메시지
        switch (total_commit_message_quality_score) {
            case "A+":
            case "A":
                storageMessage = `전체 커밋 메시지는 매우 명확하고 변경 사항이 잘 설명되어 있습니다. 메시지가 명확하여 다른 팀원들이 쉽게 이해할 수 있습니다.`;
                break;
            case "B+":
            case "B":
                storageMessage = `전체 커밋 메시지가 명확하지만 일부 메시지가 모호하거나 개선의 여지가 있습니다. 추가적인 설명이 있으면 좋겠습니다.`;
                break;
            case "C+":
            case "C":
                storageMessage = `전체 커밋 메시지가 다소 모호하며, 변경 사항에 대한 구체적인 설명이 부족할 수 있습니다. 더욱 명확한 커밋 메시지가 필요합니다.`;
                break;
            case "D+":
            case "D":
                storageMessage = `전체 커밋 메시지가 불명확하며, 변경 사항을 이해하기 어렵습니다. 커밋 메시지 작성 시 상세한 설명을 추가하고, 가독성을 높이는 것이 좋습니다.`;
                break;
            default:
                storageMessage = "커밋 메시지 품질에 대한 평가를 할 수 있는 정보가 부족합니다.";
                break;
        }

        // 사용자 커밋 메시지 품질에 따른 메시지
        switch (user_commit_message_quality_score) {
            case "A+":
            case "A":
                userMessage = `${username}님의 커밋 메시지도 매우 높은 수준을 유지하고 있습니다. 협업 시 매우 좋은 예시가 되고 있습니다.`;
                break;
            case "B+":
            case "B":
                userMessage = `${username}님의 커밋 메시지가 대체로 명확하지만, 일부 메시지가 모호할 수 있습니다. 추가적인 설명을 통해 커밋 메시지를 개선할 수 있습니다.`;
                break;
            case "C+":
            case "C":
                userMessage = `${username}님의 커밋 메시지가 다소 모호하며, 변경 사항을 명확히 설명할 필요가 있습니다. 더욱 구체적이고 명확한 커밋 메시지를 작성하는 것이 좋습니다.`;
                break;
            case "D+":
            case "D":
                userMessage = `${username}님의 커밋 메시지가 불명확하며, 팀원들이 변경 사항을 이해하기 어려울 수 있습니다. 커밋 메시지를 개선하여 협업 시 가독성을 높이는 것이 중요합니다.`;
                break;
            default:
                userMessage = `${username}님의 커밋 메시지 품질에 대한 평가를 할 수 있는 정보가 부족합니다.`;
                break;
        }

        return (
            <div>
                <h3>커밋 메시지 품질</h3>
                <p>커밋 메시지 품질: {total_commit_message_quality_score}</p>
                <p>{storageMessage}</p>
                <p>{username}님의 커밋 메시지 품질: {user_commit_message_quality_score}</p>
                <p>{userMessage}</p>
            </div>
        );
    };

    // 커밋 메시지 문법에 대한 메시지 생성
    const generateCommitMessageGrammarMessage = (commitMessageGrammarScores, username) => {
        const { total_commit_message_grammar_score, user_commit_message_grammar_score } = commitMessageGrammarScores || {};
        
        let storageMessage = "";
        let userMessage = "";

        // 전체 저장소 커밋 메시지 문법에 따른 메시지
        switch (total_commit_message_grammar_score) {
            case "A+":
            case "A":
                storageMessage = `전체 저장소의 커밋 메시지 문법이 매우 정확합니다. 메시지의 가독성과 명확성이 뛰어납니다.`;
                break;
            case "B+":
            case "B":
                storageMessage = `전체 저장소의 커밋 메시지 문법이 대체로 정확하지만, 일부 오류가 발견됩니다. 주의를 기울여 문법을 수정할 필요가 있습니다.`;
                break;
            case "C+":
            case "C":
                storageMessage = `전체 커밋 메시지 문법에 다소 오류가 있어 가독성을 저해할 수 있습니다. 맞춤법과 문법 오류를 수정하는 것이 좋습니다.`;
                break;
            case "D+":
            case "D":
                storageMessage = `전체 커밋 메시지에서 많은 문법 오류가 발견되었습니다. 가독성을 높이기 위해 커밋 메시지 작성 시 맞춤법 검사와 문법 확인을 강화해야 합니다.`;
                break;
            default:
                storageMessage = "커밋 메시지 문법에 대한 평가를 할 수 있는 정보가 부족합니다.";
                break;
        }

        // 사용자 커밋 메시지 문법에 따른 메시지
        switch (user_commit_message_grammar_score) {
            case "A+":
            case "A":
                userMessage = `${username}님의 커밋 메시지 문법도 매우 정확합니다. 가독성과 명확성이 뛰어나 협업 시 매우 도움이 됩니다.`;
                break;
            case "B+":
            case "B":
                userMessage = `${username}님의 커밋 메시지 문법이 대체로 정확하지만, 일부 오류가 있습니다. 커밋 전 맞춤법과 문법 검사를 하는 것이 좋습니다.`;
                break;
            case "C+":
            case "C":
                userMessage = `${username}님의 커밋 메시지에서 문법 오류가 다수 발견됩니다. 문법을 확인하고 수정하는 것이 가독성 향상에 도움이 됩니다.`;
                break;
            case "D+":
            case "D":
                userMessage = `${username}님의 커밋 메시지에서 많은 문법 오류가 발견되었습니다. 협업 시 혼동을 줄이기 위해 문법에 좀 더 신경을 쓰는 것이 좋습니다.`;
                break;
            default:
                userMessage = `${username}님의 커밋 메시지 문법에 대한 평가를 할 수 있는 정보가 부족합니다.`;
                break;
        }

        return (
            <div>
                <h3>커밋 메시지 문법</h3>
                <p>커밋 메시지 문법: {total_commit_message_grammar_score}</p>
                <p>{storageMessage}</p>
                <p>{username}님의 커밋 메시지 문법: {user_commit_message_grammar_score}</p>
                <p>{userMessage}</p>
            </div>
        );
    };

    const generateTeamProjectMessage = () => {
        const commitMessageQualityScores = evaluate.commit_message_quality_scores || {};
        const commitMessageGrammarScores = evaluate.commit_message_grammar_scores || {};
        const commitScore = evaluate.commit_score || "N/A";
        const commitData = repoAnalyze.commit_per || [0, 0, 0];
        const prScores = evaluate.pr_scores || {};
        const prData = repoAnalyze.pr_data || {};
        const issueScores = evaluate.issue_scores || {};
        const issueData = repoAnalyze.issue_data || {};

        return (
            <div className="team-message">
                <div className="repo-info-container">
                    <div className="repo-info">
                        <h2>저장소: {repo_name}</h2>
                        <h3>사용자: {username}님</h3>
                    </div>
                    <button className="detail-button" onClick={handleDetailClick}>세부 정보 보기</button>
                </div>

                <section className="section code-quality-section">
                    <h2 className="section-title">1. 코드 작성 능력 평가</h2>
                    <div className={`section-content ${getGradeClass(evaluate.code_quality)}`}>
                        <p>전체 코드 품질 등급: <span className="grade">{evaluate.code_quality}</span></p>
                        <p>{generateCodeQualityMessage(evaluate.code_quality)}</p>
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.comment_score)}`}>
                        {generateCommentMessage(evaluate.comment_score, repoAnalyze.comment_per[0], repoAnalyze.comment_per[1], repoAnalyze.comment_per[2])}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.complexity_repo_score)}`}>
                        {generateComplexityMessage(evaluate.complexity_repo_score, repoAnalyze.complexity)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.function_length_repo_score)}`}>
                        {generateFunctionLengthMessage(evaluate.function_length_repo_score, repoAnalyze.function_length)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.parameter_count_repo_score)}`}>
                        {generateParameterCountMessage(evaluate.parameter_count_repo_score, repoAnalyze.parameter_count)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.duplication_score)}`}>
                        {generateDuplicationMessage(evaluate.duplication_score, repoAnalyze.duplicate_code)}
                    </div>
                </section>

                <section className="section collaboration-section">
                    <h2 className="section-title">2. 협업 능력 평가</h2>
                    <div className={`section-content ${getGradeClass(evaluate.pr_scores?.user_pr_score)}`}>
                        {generatePRManagementMessage(prScores, prData, username)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.issue_scores?.user_issue_score)}`}>
                        {generateIssueManagementMessage(issueScores, issueData, username)}
                    </div>
                </section>

                <section className="section commit-message-section">
                    <h2 className="section-title">3. 커밋 메시지 평가</h2>
                    <div className={`section-content ${getGradeClass(evaluate.commit_score)}`}>
                        {generateCommitScoreMessage(commitScore, commitData, username)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.commit_message_quality_scores?.user_commit_message_quality_score)}`}>
                        {generateCommitMessageQualityMessage(commitMessageQualityScores, username)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.commit_message_grammar_scores?.user_commit_message_grammar_score)}`}>
                        {generateCommitMessageGrammarMessage(commitMessageGrammarScores, username)}
                    </div>
                </section>
            </div>
        );
    };

// 개인 저장소 메시지 생성
    const generatePersonalProjectMessage = () => {
        const commitMessageQualityScores = evaluate.commit_message_quality_scores || {};
        const commitMessageGrammarScores = evaluate.commit_message_grammar_scores || {};
        const commitScore = evaluate.commit_score || "N/A";
        const commitData = repoAnalyze.commit_per || [0, 0, 0];

        return (
            <div className="personal-message">
                <div className="repo-info-container">
                    <div className="repo-info">
                        <h2>저장소: {repo_name}</h2>
                        <h3>사용자: {username}님</h3>
                    </div>
                    <button className="detail-button" onClick={handleDetailClick}>세부 정보 보기</button>
                </div>

                <section className="section code-quality-section">
                    <h2 className="section-title">1. 코드 작성 능력 평가</h2>
                    <div className={`section-content ${getGradeClass(evaluate.code_quality)}`}>
                        <p>전체 코드 품질 등급: <span className="grade">{evaluate.code_quality}</span></p>
                        <p>{generateCodeQualityMessage(evaluate.code_quality)}</p>
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.comment_score)}`}>
                        {generateCommentMessage(evaluate.comment_score, repoAnalyze.comment_per[0], repoAnalyze.comment_per[1], repoAnalyze.comment_per[2])}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.complexity_repo_score)}`}>
                        {generateComplexityMessage(evaluate.complexity_repo_score, repoAnalyze.complexity)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.function_length_repo_score)}`}>
                        {generateFunctionLengthMessage(evaluate.function_length_repo_score, repoAnalyze.function_length)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.parameter_count_repo_score)}`}>
                        {generateParameterCountMessage(evaluate.parameter_count_repo_score, repoAnalyze.parameter_count)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.duplication_score)}`}>
                        {generateDuplicationMessage(evaluate.duplication_score, repoAnalyze.duplicate_code)}
                    </div>
                </section>

                <section className="section commit-message-section">
                    <h2 className="section-title">2. 커밋 메시지 평가</h2>
                    <div className={`section-content ${getGradeClass(commitScore)}`}>
                        {generateCommitScoreMessage(commitScore, commitData, username)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.commit_message_quality_score)}`}>
                        {generateCommitMessageQualityMessage(commitMessageQualityScores, username)}
                    </div>
                    <div className={`section-content ${getGradeClass(evaluate.commit_message_grammar_score)}`}>
                        {generateCommitMessageGrammarMessage(commitMessageGrammarScores, username)}
                    </div>
                </section>
            </div>
        );
    };
    return (
        <div className="evaluation-page">
            {repo_type === "team" ? generateTeamProjectMessage() : generatePersonalProjectMessage()}
        </div>
    );
};

export default RepositoryEvaluatePage;
