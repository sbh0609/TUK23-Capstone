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
import { Container, Grid, Paper, Typography } from '@mui/material';


const RepositoryDetailPage = () => {
  const session_userID = sessionStorage.getItem("userID");
  const storedDetail = JSON.parse(sessionStorage.getItem('repositoryDetail'));
  const { repositoryDetail, setRepositoryDetail } = useRepository();
  const [isDetailSet, setIsDetailSet] = useState(false);

  console.log("Stored detail from session storage:", storedDetail);

  // 페이지 로드 시 storedDetail이 있으면 repositoryDetail을 설정
  useEffect(() => {
    if (storedDetail && !isDetailSet) {
      console.log("Setting repository detail from stored detail");
      setRepositoryDetail(storedDetail);
      setIsDetailSet(true);
    }
  }, [storedDetail, isDetailSet, setRepositoryDetail]);

  const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;

  console.log("Repository details:", repositoryDetail);

  const [repoAnalyze, setRepoAnalyze] = useState(null);
  const [evaluate, setEvaluate] = useState(null);

  useEffect(() => {
    if (isDetailSet && repo_name && username && fileList.length > 0 && repo_type && click_time && session_userID) {
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
    }
  }, [isDetailSet, repo_name, username, fileList, repo_type, click_time, session_userID]);
  
  if (!repoAnalyze || !evaluate) { // 로딩화면 표시하는 곳!
    return <div>Loading...</div>;
  }
  // program_lang 객체를 배열로 변환
  const languages = Object.entries(repoAnalyze.program_lang).map(([lang, percentage]) => ({ lang, percentage }));
  console.log(languages)
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Repository Detail</Typography>
      <Typography variant="h6">Last Evaluate: {repoAnalyze.repo_selected_time}</Typography>
      <Grid container spacing={3}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h6">Repository: {repo_name}</Typography>
          <Typography variant="h6">Username: {username}</Typography>
        </Paper>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Program Language</Typography>
            <LanguageSection languages={languages} />
            <Typography variant="h6">FrameWork</Typography>
            <FrameworkSection frameworks={repoAnalyze.framework} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Communication</Typography>
            <CollaborationScore evaluate={evaluate} username={username} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Code Quallity</Typography>
            <CodeHealthScore evaluate={evaluate} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const LanguageSection = ({ languages }) => (
  <div>
    {languages.map((language, index) => (
      <Typography key={index} variant="body1">{language.lang}: {language.percentage.toFixed(2)}%</Typography>
    ))}
  </div>
);

const FrameworkSection = ({ frameworks }) => (
  <div>
    {frameworks.map((framework, index) => (
      <Typography key={index} variant="body1">{framework}</Typography>
    ))}
  </div>
);

const CollaborationScore = ({ evaluate,username }) => (
  <div>
    <Typography variant="h6">Repo Communication: {evaluate.total_collaboration_score}</Typography>
    <Typography variant="h6">{username} Communication: {evaluate.user_collaboration_score}</Typography>
  </div>
);

const CodeHealthScore = ({ evaluate }) => (
  <div>
    <Typography variant="h6">Code Quality: {evaluate.code_quality}</Typography>
  </div>
);

export default RepositoryDetailPage;