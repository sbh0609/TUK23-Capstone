import React, { Fragment, useState, useEffect } from "react";
import 'chart.js/auto';
import "./RepositoryDetailPage.css";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';
import { Pie,Bar } from 'react-chartjs-2';


const RepositoryDetailPage = () => {
  const session_userID = sessionStorage.getItem("userID");
  const { repositoryDetail, setRepositoryDetail } = useRepository();
  const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
  const [repoAnalyze, setRepoAnalyze] = useState(null);
  const [evaluate, setEvaluate] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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

  if (!repoAnalyze || !evaluate) {
    return <div>Loading...</div>;
  }

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

  // 데이터를 바탕으로 각 기준별로 분류
  const categorizeData = (data, thresholds) => {
    const categories = { normal: 0, bad: 0, veryBad: 0, worst: 0 };
    Object.values(data).forEach(file => {
      Object.values(file).forEach(value => {
        if (value <= thresholds.normal) {
          categories.normal += 1;
        } else if (value <= thresholds.bad) {
          categories.bad += 1;
        } else if (value <= thresholds.veryBad) {
          categories.veryBad += 1;
        } else {
          categories.worst += 1;
        }
      });
    });
    return categories;
  };

  const complexityCategories = categorizeData(repoAnalyze.complexity, { normal: 4, bad: 7, veryBad: 30 });
  const functionLengthCategories = categorizeData(repoAnalyze.function_length, { normal: 20, bad: 40, veryBad: 100 });
  const parameterCountCategories = categorizeData(repoAnalyze.parameter_count, { normal: 2, bad: 5, veryBad: 10 });

  const totalComplexities = Object.values(complexityCategories).reduce((acc, val) => acc + val, 0);
  const totalFunctionLengths = Object.values(functionLengthCategories).reduce((acc, val) => acc + val, 0);
  const totalParameterCounts = Object.values(parameterCountCategories).reduce((acc, val) => acc + val, 0);

  const complexityBarData = {
    labels: ['Normal', 'Bad', 'Very Bad', 'Worst'],
    datasets: [{
      label: 'Complexity Distribution',
      data: [
        complexityCategories.normal,
        complexityCategories.bad,
        complexityCategories.veryBad,
        complexityCategories.worst
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336'],
    }]
  };

  const functionLengthBarData = {
    labels: ['Normal', 'Bad', 'Very Bad', 'Worst'],
    datasets: [{
      label: 'Function Length Distribution',
      data: [
        functionLengthCategories.normal,
        functionLengthCategories.bad,
        functionLengthCategories.veryBad,
        functionLengthCategories.worst
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336'],
    }]
  };

  const parameterCountBarData = {
    labels: ['Normal', 'Bad', 'Very Bad', 'Worst'],
    datasets: [{
      label: 'Parameter Count Distribution',
      data: [
        parameterCountCategories.normal,
        parameterCountCategories.bad,
        parameterCountCategories.veryBad,
        parameterCountCategories.worst
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336'],
    }]
  };

  const complexityOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / totalComplexities) * 100).toFixed(2);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    maintainAspectRatio: false
  };

  const functionLengthOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / totalFunctionLengths) * 100).toFixed(2);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    maintainAspectRatio: false
  };

  const parameterCountOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / totalParameterCounts) * 100).toFixed(2);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    maintainAspectRatio: false
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
              <h5>Communication Ability</h5>
              <h6>Repo Communication: {total_collaboration_score}</h6>
              <h6>{username} Communication: {user_collaboration_score}</h6>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Code Quality", score: code_quality })}>
              <h5>Code Quality</h5>
              <h6>{code_quality}</h6>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <h5>Program Language</h5>
              <div className="chart">
                <Pie data={pieData} />
              </div>
            </div>
            <div className="card">
              <h5>Comment Score</h5>
              <div className="card-content">
                <div className="score">
                  <h6>Grade: {comment_score}</h6>
                </div>
                <div className="chart">
                  <Pie data={commentPieData} />
                </div>
                <h6>{(commentRatio * 100).toFixed(1)}% comments</h6>
              </div>
            </div>
            <div className="card">
              <h5>Duplication Score</h5>
              <div className="card-content">
                <div className="score">
                  <h6>Grade: {duplication_score}</h6>
                </div>
                <div className="chart">
                  <Pie data={duplicationPieData} />
                </div>
                <h6>{(duplicationRatio * 100).toFixed(1)}% duplication</h6>
              </div>
            </div>
            <div className="card">
              <h5>Complexity Score</h5>
              <div className="card-content">
                <div className="score">
                  <h6>Grade: {complexity_repo_score}</h6>
                </div>
                <div className="chart" style={{ height: '250px' }}>
                  <Bar data={complexityBarData} options={complexityOptions} />
                </div>
              </div>
            </div>
            <div className="card">
              <h5>Function Length Score</h5>
              <div className="card-content">
                <div className="score">
                  <h6>Grade: {function_length_repo_score}</h6>
                </div>
                <div className="chart" style={{ height: '250px' }}>
                  <Bar data={functionLengthBarData} options={functionLengthOptions} />
                </div>
              </div>
            </div>
            <div className="card">
              <h5>Parameter Count Score</h5>
              <div className="card-content">
                <div className="score">
                  <h6>Grade: {parameter_count_repo_score}</h6>
                </div>
                <div className="chart" style={{ height: '250px' }}>
                  <Bar data={parameterCountBarData} options={parameterCountOptions} />
                </div>
              </div>
            </div>
            <div className="card" onClick={() => handleOpen({ title: "Commit Quality", qualityScore: commit_message_quality_scores.total_commit_message_quality_score, grammarScore: commit_message_grammar_scores.total_commit_message_grammar_score })}>
              <h5>Commit Quality</h5>
              <h6>Quality Score: {commit_message_quality_scores.total_commit_message_quality_score}</h6>
              <h6>Grammar Score: {commit_message_grammar_scores.total_commit_message_grammar_score}</h6>
            </div>
          </>
        )}
      </div>
  
      {open && (
        <div className="modal" onClick={handleClose}>
          <div className="modal_body" onClick={(e) => e.stopPropagation()}>
            <button className="modal_close" onClick={handleClose}>&times;</button>
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