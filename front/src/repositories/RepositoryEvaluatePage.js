import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRepository } from "../Context/RepositoryContext";
import { useNavigate } from 'react-router-dom';

const RepositoryEvaluatePage = () => {
    const session_userID = sessionStorage.getItem("userID");
    const { repositoryDetail } = useRepository();
    const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
    const [repoAnalyze, setRepoAnalyze] = useState(null);
    const [evaluate, setEvaluate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.post('http://localhost:5000/api/analyze', { repo_name, username, fileList, repo_type, click_time, session_userID })
          .then(response => {
            setRepoAnalyze(response.data.repo_analyze);
            setEvaluate(response.data.evaluate);
          })
          .catch(error => {
            console.error('Error', error);
            window.alert('Error: ' + error);
          });
    }, [repo_name, username, fileList, repo_type, click_time, session_userID]);

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
              click_time, 
              session_userID
            }
        });
    };

    // 팀 프로젝트 메시지 생성
    const generateTeamProjectMessage = () => (
        <div>
            <h2>Code Quality (코드 품질 분석)</h2>
            <p>1.1 주석 비율 (Comment Score): {evaluate.comment_score}</p>
            <p>- 프로젝트 전체 코드에서 <strong>{repoAnalyze.comment_per[2]}%</strong>가 주석으로 작성되었습니다. 주석 비율이 적절하여 코드의 가독성이 뛰어납니다.</p>
            <p>- 개선 사항: 현재 상태를 유지하면서, 주석은 코드에 대한 설명과 문서화를 위해 사용하는 것이 좋습니다.</p>

            <p>1.2 중복 코드 비율 (Duplication Score): {evaluate.duplication_score}</p>
            <p>- 코드의 <strong>{repoAnalyze.duplicate_code[2]}%</strong>가 중복되었습니다. 중복된 코드 비율이 낮아 유지 보수성과 코드 효율성이 매우 우수합니다.</p>
            <p>- 개선 사항: 중복되는 부분을 더 작은 함수로 추출하여 코드 재사용성을 높일 수 있습니다.</p>

            <p>1.3 복잡도 점수 (Complexity Score): {evaluate.complexity_repo_score}</p>
            <p>- 프로젝트의 평균 복잡도 점수는 <strong>{evaluate.complexity_repo_score}</strong>로 일부 코드가 다소 복잡합니다.</p>

            <h2>Communication Ability (협업 능력 분석)</h2>
            <p>2.1 PR 및 이슈 관리:</p>
            <p>- 사용자의 PR 점수는 <strong>{evaluate.pr_scores.user_pr_score}</strong>, 전체 PR 병합 비율은 <strong>{evaluate.pr_scores.total_pr_merge_score}</strong>입니다.</p>
            <p>- 이슈 해결 비율은 <strong>{evaluate.issue_scores.total_issue_close_score}</strong>로 모든 이슈가 해결되었습니다.</p>
            <p>- 개선 사항: 더 많은 PR을 제출하고, 코드 리뷰를 통해 협업을 강화할 수 있습니다.</p>

            <h2>커밋 메시지 분석</h2>
            <p>2.3 커밋 메시지 품질 점수: {evaluate.commit_message_quality_scores.total_commit_message_quality_score}</p>
            <p>- 사용자의 커밋 메시지 품질은 매우 우수합니다.</p>
            <p>2.4 커밋 메시지 문법 점수: {evaluate.commit_message_grammar_scores.total_commit_message_grammar_score}</p>
            <p>- 개선 사항: 커밋 메시지 작성 시 문법에 주의하여 가독성을 높이십시오.</p>
        </div>
    );

    // 개인 프로젝트 메시지 생성
    const generatePersonalProjectMessage = () => (
        <div>
            <h2>Code Quality (코드 품질 분석)</h2>
            <p>1.1 주석 비율 (Comment Score): {evaluate.comment_score}</p>
            <p>- 코드의 <strong>{repoAnalyze.comment_per[2]}%</strong>가 주석으로 작성되었습니다. 주석 비율이 적절하여 코드의 가독성이 좋습니다.</p>

            <p>1.2 중복 코드 비율 (Duplication Score): {evaluate.duplication_score}</p>
            <p>- 코드의 <strong>{repoAnalyze.duplicate_code[2]}%</strong>가 중복되었습니다.</p>

            <p>1.3 복잡도 점수 (Complexity Score): {evaluate.complexity_repo_score}</p>
            <p>- 일부 파일에서 복잡도가 높아 개선이 필요합니다.</p>

            <h2>커밋 메시지 분석</h2>
            <p>2.1 커밋 메시지 품질 점수: {evaluate.commit_message_quality_scores.total_commit_message_quality_score}</p>
            <p>- 사용자의 커밋 메시지는 대부분 명확하게 작성되었습니다.</p>

            <p>2.2 커밋 메시지 문법 점수: {evaluate.commit_message_grammar_scores.total_commit_message_grammar_score}</p>
            <p>- 개선 사항: 문법 오류를 줄여 커밋 메시지의 신뢰성을 높이십시오.</p>
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