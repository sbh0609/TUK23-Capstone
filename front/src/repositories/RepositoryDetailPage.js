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
  const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;

  const [repoAnalyze, setRepoAnalyze] = useState(null);
  const [evaluate, setEvaluate] = useState(null);

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

  return (
    <Container>
      <Typography variant="h3" gutterBottom>저장소 평가 결과</Typography>
      <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ marginBottom: '30px' }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '25px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: '10px' }}>Repository: {repo_name}</Typography>
            <Typography variant="h6" style={{ marginBottom: '10px' }}>Username: {username}</Typography>
            <Typography variant="h6">Last Evaluate: {repoAnalyze.repo_selected_time}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '30px' }}>
            <Typography variant="h6">Program Language</Typography>
            <LanguageSection languages={languages} />
            {frameworks && frameworks.length > 0 && (
              <>
                <Typography variant="h6">FrameWork</Typography>
                <FrameworkSection frameworks={frameworks} />
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '30px' }}>
            <Typography variant="h6">Communication Ability</Typography>
            <CollaborationScore evaluate={evaluate} username={username} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '30px' }}>
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

const CollaborationScore = ({ evaluate, username }) => (
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