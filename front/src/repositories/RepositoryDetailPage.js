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

  const handleOpen = (cardData) => {
    setSelectedCard(cardData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCard(null);
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

      {repo_type === 'team' ? (
        <div className="grid">
          <div className="card" onClick={() => handleOpen({ title: 'Program Language', data: languages })}>
            <h6>Program Language</h6>
            {languages.map((language, index) => (
              <p key={index}>{language.lang}: {language.percentage.toFixed(2)}%</p>
            ))}
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Communication Ability', totalScore: total_collaboration_score, userScore: user_collaboration_score })}>
            <h6>Communication Ability</h6>
            <p>Repo Communication: {total_collaboration_score}</p>
            <p>{username} Communication: {user_collaboration_score}</p>
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Code Quality', score: code_quality })}>
            <h6>Code Quality</h6>
            <h4>{code_quality}</h4>
          </div>
        </div>
      ) : (
        <div className="grid">
          <div className="card" onClick={() => handleOpen({ title: 'Comment Score', score: comment_score })}>
            <h6>Comment Score</h6>
            <h4>{comment_score}</h4>
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Duplication Score', score: duplication_score })}>
            <h6>Duplication Score</h6>
            <h4>{duplication_score}</h4>
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Complexity Score', score: complexity_repo_score })}>
            <h6>Complexity Score</h6>
            <h4>{complexity_repo_score}</h4>
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Function Length Score', score: function_length_repo_score })}>
            <h6>Function Length Score</h6>
            <h4>{function_length_repo_score}</h4>
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Parameter Count Score', score: parameter_count_repo_score })}>
            <h6>Parameter Count Score</h6>
            <h4>{parameter_count_repo_score}</h4>
          </div>
          <div className="card" onClick={() => handleOpen({ title: 'Commit Quality', qualityScore: commit_message_quality_scores.total_commit_message_quality_score, grammarScore: commit_message_grammar_scores.total_commit_message_grammar_score })}>
            <h6>Commit Quality</h6>
            <p>Quality Score: {commit_message_quality_scores.total_commit_message_quality_score}</p>
            <p>Grammar Score: {commit_message_grammar_scores.total_commit_message_grammar_score}</p>
          </div>
        </div>
      )}

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
                {selectedCard.data && selectedCard.data.map((language, index) => (
                  <p key={index}>{language.lang}: {language.percentage.toFixed(2)}%</p>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryDetailPage;