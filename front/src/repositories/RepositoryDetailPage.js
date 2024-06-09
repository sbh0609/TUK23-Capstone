import React, { Fragment, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Link as ScrollLink, Element } from 'react-scroll';  // Link 컴포넌트 임포트
import imageData from '../resources/image.png';
import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";
import Card from "../components/Card";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';
import Loading from "../components/DetailLoading";
import { Container, Grid, Paper, Typography, Modal, Box } from '@mui/material';
import { Pie } from 'react-chartjs-2';


const RepositoryDetailPage = () => {
  const session_userID = sessionStorage.getItem("userID");
  const { repositoryDetail, setRepositoryDetail } = useRepository();
  const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
  const [repoAnalyze, setRepoAnalyze] = useState(null);
  const [evaluate, setEvaluate] = useState(null);
  const [open, setOpen] = useState(false); // 모달 창 열기 상태
  const [selectedCard, setSelectedCard] = useState(null); // 선택된 카드 데이터
  useEffect(() => {
    axios.post('http://localhost:5000/api/analyze', { repo_name, username, fileList, repo_type, click_time, session_userID })
      .then(response => {
        console.log(response);
        setRepoAnalyze(response.data.repo_analyze);
        setEvaluate(response.data.evaluate);
      })
      .catch(error => {
        console.error('Error', error);
        window.alert('Error: ' + error);
      });
  }, [repo_name, username, fileList, repo_type, click_time, session_userID]);
  // if (isDetailSet && repo_name && username && fileList.length > 0 && repo_type && click_time && session_userID) 
  if (!repoAnalyze || !evaluate) { // 로딩화면 표시하는 곳!
    return <div>Loading...</div>;
  }
  // program_lang 객체를 배열로 변환
  const languages = Object.entries(repoAnalyze.program_lang).map(([lang, percentage]) => ({ lang, percentage }));
  const frameworks = repoAnalyze.framework;
  console.log(languages);

  const {
    comment_score,
    duplication_score,
    complexity_repo_score,
    function_length_repo_score,
    parameter_count_repo_score,
    commit_message_quality_scores,
    commit_message_grammar_scores,
    total_collaboration_score,
    user_collaboration_score,
    code_quality
  } = evaluate;
  const { comment_per, duplicate_code } = repoAnalyze;
  const totalLines = comment_per[0];
  const commentLines = comment_per[1];
  const commentRatio = comment_per[2];

  const totalDuplicateLines = duplicate_code[0];
  const duplicatedLines = duplicate_code[1];
  const duplicationRatio = duplicate_code[2];

  const handleOpen = (cardData) => {
    setSelectedCard(cardData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCard(null);
  };

  const pieData = {
    labels: languages.map(language => language.lang),
    datasets: [{
      data: languages.map(language => language.percentage),
      backgroundColor: languages.map(language => {
        switch (language.lang) {
          case 'Java':
            return 'red';
          case 'Python':
            return 'blue';
          case 'Kotlin':
            return 'purple';
          case 'JavaScript':
            return 'yellow';
          case 'TypeScript':
            return 'green';
          default:
            return 'grey';
        }
      }),
    }]
  };
  const commentPieData = {
    labels: ['Comment Lines', 'Code Lines'],
    datasets: [{
      data: [commentLines, totalLines - commentLines],
      backgroundColor: ['#36A2EB', '#FFCE56'],
    }]
  };

  const duplicationPieData = {
    labels: ['Duplicated Lines', 'Non-Duplicated Lines'],
    datasets: [{
      data: [duplicatedLines, totalDuplicateLines - duplicatedLines],
      backgroundColor: ['#FF6384', '#36A2EB'],
    }]
  };

  return (
    <div className="container">
      <h3>저장소 평가 결과</h3>
      <div className="repo-details">
        <div className="repo-info">
          <h5>Repository: {repo_name}</h5>
          <p>Username: {username}</p>
          <p>Last Evaluate: {repoAnalyze.repo_selected_time}</p>
        </div>
      </div>
  
      <div className="grid">
        {repo_type === "team" ? (
          <>
            <div
              className="card"
              onClick={() =>
                handleOpen({
                  title: "Communication Ability",
                  totalScore: total_collaboration_score,
                  userScore: user_collaboration_score,
                })
              }
            >
              <h6>Communication Ability</h6>
              <p>Repo Communication: {total_collaboration_score}</p>
              <p>{username} Communication: {user_collaboration_score}</p>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Code Quality", score: code_quality })}>
              <h6>Code Quality</h6>
              <h4>{code_quality}</h4>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <h6>Program Language</h6>
              <div className="chart">
                <Pie data={pieData} />
              </div>
            </div>
            <div className="card">
              <h6>Comment Score</h6>
              <div className="card-content">
                <div className="score">
                  <h4>Grade: {comment_score}</h4>
                </div>
                <div className="chart">
                  <Pie data={commentPieData} />
                </div>
                <h4>{(commentRatio * 100).toFixed(1)}% comments</h4>
              </div>
            </div>
            <div className="card">
              <h6>Duplication Score</h6>
              <div className="card-content">
                <div className="score">
                  <h4>Grade: {duplication_score}</h4>
                </div>
                <div className="chart">
                  <Pie data={duplicationPieData} />
                </div>
                <h4>{(duplicationRatio * 100).toFixed(1)}% duplication</h4>
              </div>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Complexity Score", score: complexity_repo_score })}>
              <h6>Complexity Score</h6>
              <h4>{complexity_repo_score}</h4>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Function Length Score", score: function_length_repo_score })}>
              <h6>Function Length Score</h6>
              <h4>{function_length_repo_score}</h4>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Parameter Count Score", score: parameter_count_repo_score })}>
              <h6>Parameter Count Score</h6>
              <h4>{parameter_count_repo_score}</h4>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Commit Quality", qualityScore: commit_message_quality_scores.total_commit_message_quality_score, grammarScore: commit_message_grammar_scores.total_commit_message_grammar_score })}>
              <h6>Commit Quality</h6>
              <p>Quality Score: {commit_message_quality_scores.total_commit_message_quality_score}</p>
              <p>Grammar Score: {commit_message_grammar_scores.total_commit_message_grammar_score}</p>
            </div>
          </>
        )}
      </div>
  
      {open && (
        <div className="modal" onClick={handleClose}>
          <div className="modal_body" onClick={(e) => e.stopPropagation()}>
            {selectedCard && (
              <>
                <h2>{selectedCard.title}</h2>
                {selectedCard.score && <p>{selectedCard.score}</p>}
                {selectedCard.qualityScore && <p>Quality Score: {selectedCard.qualityScore}</p>}
                {selectedCard.grammarScore && <p>Grammar Score: {selectedCard.grammarScore}</p>}
                {selectedCard.totalScore && <p>Repo Communication: {selectedCard.totalScore}</p>}
                {selectedCard.userScore && <p>{username} Communication: {selectedCard.userScore}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
  export default RepositoryDetailPage;