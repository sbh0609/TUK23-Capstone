import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRepository } from "../Context/RepositoryContext";
import { useNavigate, useLocation } from 'react-router-dom';

const RepositoryEvaluatePage = () => {
    const session_userID = sessionStorage.getItem("userID");
    const { repositoryDetail } = useRepository();
    const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
    const navigate = useNavigate();
    const location = useLocation();

    // location.state에서 재분석 데이터를 받으면 기존 데이터를 덮어씌움
    const { repoAnalyze: reanalyzedRepoAnalyze, evaluate: reanalyzedEvaluate } = location.state || {};

    const [repoAnalyze, setRepoAnalyze] = useState(reanalyzedRepoAnalyze || null);  // 재분석 데이터가 있으면 사용
    const [evaluate, setEvaluate] = useState(reanalyzedEvaluate || null);           // 재분석 데이터가 있으면 사용

    // 재분석 데이터가 없을 때만 초기 분석 실행
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
            })
            .catch(error => {
                console.error('Error:', error);
                window.alert('Error: ' + error);
            });
        }
    }, [repoAnalyze, evaluate, repo_name, username, fileList, repo_type, click_time, session_userID]);

    // 분석 데이터가 없을 경우 로딩 표시
    if (!repoAnalyze || !evaluate) {
        return <div>Loading...</div>;
    }

    // '자세한 분석 보러가기' 버튼 클릭 시 RepositoryDetailPage로 이동하면서 state로 데이터 전달
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


    // 키워드 통계 데이터 가져오기
    const keywordCounts = repoAnalyze.keyword_count || {}; // 키워드 데이터가 있을 경우 가져오기
    const totalKeywords = keywordCounts.total_keyword || {};
    const userKeywords = keywordCounts.user_keyword || {};

    // 각 평가 항목에 대한 메시지 생성
    const generateEvaluationMessage = (score, label, suggestions) => {
        if (!score) {
            return <p>{label} 관련 데이터가 존재하지 않습니다.</p>;
        }

        switch (score) {
            case "A+":
            case "A":
                return (
                    <>
                        <p>{label} 등급은 {score} 입니다. 이 항목은 우수하며, 현재 상태를 유지하면 좋습니다.</p>
                        {suggestions && <p>{suggestions.A}</p>}
                    </>
                );
            case "B+":
            case "B":
                return (
                    <>
                        <p>{label} 등급은 {score} 입니다. 이 항목은 좋지만, 약간의 개선이 필요할 수 있습니다.</p>
                        {suggestions && <p>{suggestions.B}</p>}
                    </>
                );
            case "C+":
            case "C":
                return (
                    <>
                        <p>{label} 등급은 {score} 입니다. 이 항목은 다소 개선이 필요합니다.</p>
                        {suggestions && <p>{suggestions.C}</p>}
                    </>
                );
            case "D+":
            case "D":
                return (
                    <>
                        <p>{label} 등급은 {score} 입니다. 이 항목은 많은 개선이 필요합니다.</p>
                        {suggestions && <p>{suggestions.D}</p>}
                    </>
                );
            case "F":
            default:
                return (
                    <>
                        <p>{label} 등급은 {score} 입니다. 관련 데이터를 평가할 정보가 부족합니다.</p>
                        {suggestions && <p>{suggestions.F}</p>}
                    </>
                );
        }
    };

    // 팀 프로젝트 메시지 생성
    const generateTeamProjectMessage = () => (
        <div>
            <h2>Code Quality (코드 품질 분석)</h2>
            
            {generateEvaluationMessage(evaluate.comment_score, "1.1 주석 비율", {
                A: "주석이 잘 작성되어 코드의 가독성이 뛰어납니다.",
                B: "주석이 적절하지만 더 명확한 설명이 도움이 될 수 있습니다.",
                C: "주석이 부족하거나 부적절합니다. 중요한 코드에 주석을 추가하세요.",
                D: "주석이 거의 없거나 부적절합니다. 가독성을 위해 주석을 추가해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.duplication_score, "1.2 중복 코드 비율", {
                A: "중복 코드 비율이 낮아 매우 효율적인 코드입니다.",
                B: "중복 코드가 조금 있으나 개선할 여지가 있습니다.",
                C: "중복 코드가 많습니다. 코드 재사용을 고려해보세요.",
                D: "중복 코드가 매우 많습니다. 함수화나 코드 리팩토링을 강력히 권장합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.complexity_repo_score, "1.3 복잡도 점수", {
                A: "코드가 단순하며 이해하기 쉽습니다.",
                B: "일부 복잡한 코드가 있지만 전반적으로 관리할 만합니다.",
                C: "복잡한 코드가 다소 많습니다. 함수 분리나 리팩토링을 고려하세요.",
                D: "코드가 매우 복잡합니다. 반드시 코드 구조를 단순화하고 리팩토링을 수행해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.function_length_repo_score, "1.4 함수 길이", {
                A: "함수 길이가 적절하며 가독성이 좋습니다.",
                B: "일부 함수가 조금 길지만 전반적으로 괜찮습니다.",
                C: "긴 함수가 다소 많습니다. 함수 분리를 고려하세요.",
                D: "함수가 너무 깁니다. 유지 보수를 위해 반드시 분리해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.parameter_count_repo_score, "1.5 매개변수 수", {
                A: "매개변수 수가 적절하게 관리되고 있습니다.",
                B: "대체로 적절하지만 일부 함수는 매개변수가 많을 수 있습니다.",
                C: "매개변수가 너무 많아 가독성이 떨어집니다. 함수 리팩토링을 고려하세요.",
                D: "매개변수가 너무 많습니다. 매개변수를 줄이고 가독성을 높이세요.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            <h2>Communication Ability (협업 능력 분석)</h2>
            {generateEvaluationMessage(evaluate.pr_scores.user_pr_score, "PR 점수", {
                A: "PR 관리가 매우 잘 이루어졌습니다.",
                B: "PR이 적절하지만 더 많은 리뷰와 참여가 필요합니다.",
                C: "PR 관리가 미흡합니다. 협업을 더 강화할 필요가 있습니다.",
                D: "PR 관리가 매우 부족합니다. 협업 개선이 필수적입니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}
            
            {generateEvaluationMessage(evaluate.issue_scores.total_issue_close_score, "이슈 해결 비율", {
                A: "모든 이슈가 잘 해결되었습니다.",
                B: "이슈가 대부분 해결되었지만 일부 미해결 이슈가 남아 있습니다.",
                C: "이슈 해결 비율이 낮습니다. 이슈 관리를 강화해야 합니다.",
                D: "이슈 해결이 거의 이루어지지 않았습니다. 즉시 해결할 필요가 있습니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            <h2>커밋 메시지 분석</h2>
            {generateEvaluationMessage(evaluate.commit_message_quality_scores.total_commit_message_quality_score, "커밋 메시지 품질", {
                A: "커밋 메시지가 매우 명확하고 이해하기 쉽습니다.",
                B: "대체로 명확하지만 일부 메시지가 구체성이 부족합니다.",
                C: "커밋 메시지가 다소 모호합니다. 구체적인 변경 사항을 기록하세요.",
                D: "커밋 메시지가 불명확합니다. 개선이 필요합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.commit_message_grammar_scores.total_commit_message_grammar_score, "커밋 메시지 문법", {
                A: "커밋 메시지 문법이 매우 정확합니다.",
                B: "대체로 문법이 맞지만 일부 오류가 있습니다.",
                C: "문법 오류가 다수 발견됩니다. 메시지 작성 시 주의하세요.",
                D: "문법 오류가 매우 많습니다. 커밋 메시지의 가독성을 위해 문법을 개선해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            <h2>키워드 사용 평가</h2>
            <p>
                이 프로젝트의 커밋 메시지에는 다음과 같은 작업 키워드가 사용되었습니다:
                <br />
                <strong>Add:</strong> {totalKeywords.Add || 0}회 (사용자: {userKeywords.Add || 0}회), <strong>Fix:</strong> {totalKeywords.Fix || 0}회 (사용자: {userKeywords.Fix || 0}회), <strong>Remove/Delete:</strong> {totalKeywords["Remove/Delete"] || 0}회 (사용자: {userKeywords["Remove/Delete"] || 0}회), <strong>Update:</strong> {totalKeywords.Update || 0}회 (사용자: {userKeywords.Update || 0}회)
            </p>
        </div>
    );

    // 개인 프로젝트 메시지 생성
    const generatePersonalProjectMessage = () => (
        <div>
            <h2>Code Quality (코드 품질 분석)</h2>
            
            {generateEvaluationMessage(evaluate.comment_score, "1.1 주석 비율", {
                A: "주석이 잘 작성되어 코드의 가독성이 뛰어납니다.",
                B: "주석이 적절하지만 더 명확한 설명이 도움이 될 수 있습니다.",
                C: "주석이 부족하거나 부적절합니다. 중요한 코드에 주석을 추가하세요.",
                D: "주석이 거의 없거나 부적절합니다. 가독성을 위해 주석을 추가해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.duplication_score, "1.2 중복 코드 비율", {
                A: "중복 코드 비율이 낮아 매우 효율적인 코드입니다.",
                B: "중복 코드가 조금 있으나 개선할 여지가 있습니다.",
                C: "중복 코드가 많습니다. 코드 재사용을 고려해보세요.",
                D: "중복 코드가 매우 많습니다. 함수화나 코드 리팩토링을 강력히 권장합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.complexity_repo_score, "1.3 복잡도 점수", {
                A: "코드가 단순하며 이해하기 쉽습니다.",
                B: "일부 복잡한 코드가 있지만 전반적으로 관리할 만합니다.",
                C: "복잡한 코드가 다소 많습니다. 함수 분리나 리팩토링을 고려하세요.",
                D: "코드가 매우 복잡합니다. 반드시 코드 구조를 단순화하고 리팩토링을 수행해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.function_length_repo_score, "1.4 함수 길이", {
                A: "함수 길이가 적절하며 가독성이 좋습니다.",
                B: "일부 함수가 조금 길지만 전반적으로 괜찮습니다.",
                C: "긴 함수가 다소 많습니다. 함수 분리를 고려하세요.",
                D: "함수가 너무 깁니다. 유지 보수를 위해 반드시 분리해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.parameter_count_repo_score, "1.5 매개변수 수", {
                A: "매개변수 수가 적절하게 관리되고 있습니다.",
                B: "대체로 적절하지만 일부 함수는 매개변수가 많을 수 있습니다.",
                C: "매개변수가 너무 많아 가독성이 떨어집니다. 함수 리팩토링을 고려하세요.",
                D: "매개변수가 너무 많습니다. 매개변수를 줄이고 가독성을 높이세요.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            <h2>커밋 메시지 분석</h2>
            {generateEvaluationMessage(evaluate.commit_message_quality_scores.total_commit_message_quality_score, "커밋 메시지 품질", {
                A: "커밋 메시지가 매우 명확하고 이해하기 쉽습니다.",
                B: "대체로 명확하지만 일부 메시지가 구체성이 부족합니다.",
                C: "커밋 메시지가 다소 모호합니다. 구체적인 변경 사항을 기록하세요.",
                D: "커밋 메시지가 불명확합니다. 개선이 필요합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            {generateEvaluationMessage(evaluate.commit_message_grammar_scores.total_commit_message_grammar_score, "커밋 메시지 문법", {
                A: "커밋 메시지 문법이 매우 정확합니다.",
                B: "대체로 문법이 맞지만 일부 오류가 있습니다.",
                C: "문법 오류가 다수 발견됩니다. 메시지 작성 시 주의하세요.",
                D: "문법 오류가 매우 많습니다. 커밋 메시지의 가독성을 위해 문법을 개선해야 합니다.",
                F: "관련 데이터를 평가할 정보가 부족합니다."
            })}

            <h2>키워드 사용 평가</h2>
            <p>
                이 프로젝트의 커밋 메시지에는 다음과 같은 작업 키워드가 사용되었습니다:
                <br />
                <strong>Add:</strong> {totalKeywords.Add || 0}회 (사용자: {userKeywords.Add || 0}회), <strong>Fix:</strong> {totalKeywords.Fix || 0}회 (사용자: {userKeywords.Fix || 0}회), <strong>Remove/Delete:</strong> {totalKeywords["Remove/Delete"] || 0}회 (사용자: {userKeywords["Remove/Delete"] || 0}회), <strong>Update:</strong> {totalKeywords.Update || 0}회 (사용자: {userKeywords.Update || 0}회)
            </p>
        </div>
    );

    return (
        <div className="evaluation-page">
            {repo_type === "team" ? generateTeamProjectMessage() : generatePersonalProjectMessage()}
            <button onClick={handleDetailClick}>자세한 분석 보러가기</button>
        </div>
    );
};

export default RepositoryEvaluatePage;
