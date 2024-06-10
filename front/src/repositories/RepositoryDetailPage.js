import React, { Fragment, useState, useEffect } from "react";
import 'chart.js/auto';
import "./RepositoryDetailPage.css";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';
import { Pie,Bar,Line,Doughnut } from 'react-chartjs-2';


const RepositoryDetailPage = () => {
  const session_userID = sessionStorage.getItem("userID");
  const { repositoryDetail, setRepositoryDetail } = useRepository();
  const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
  const [repoAnalyze, setRepoAnalyze] = useState(null);
  const [evaluate, setEvaluate] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalData, setModalData] = useState(null);

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
  const { comment_per, duplicate_code, total_quality, total_grammar } = repoAnalyze;
  const totalLines = comment_per[0];
  const commentLines = comment_per[1];
  const commentRatio = comment_per[2];

  const totalDuplicateLines = duplicate_code[0];
  const duplicatedLines = duplicate_code[1];
  const duplicationRatio = duplicate_code[2];

  const handleOpen = (cardData, modalData) => {
    setSelectedCard(cardData);
    setModalData(modalData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCard(null);
    setModalData(null);
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

  const categorizeData = (data, thresholds) => {
    const categories = { normal: 0, bad: 0, veryBad: 0, worst: 0 };
    const detailedData = {};

    Object.entries(data).forEach(([file, lines]) => {
      Object.entries(lines).forEach(([line, value]) => {
        if (value <= thresholds.normal) {
          categories.normal += 1;
        } else if (value <= thresholds.bad) {
          categories.bad += 1;
        } else if (value <= thresholds.veryBad) {
          categories.veryBad += 1;
        } else {
          categories.worst += 1;
        }

        if (!detailedData[file]) {
          detailedData[file] = [];
        }
        detailedData[file].push({ line: parseInt(line), value });
      });
    });

    return { categories, detailedData };
  };

  const { categories: complexityCategories, detailedData: complexityDetails } = categorizeData(repoAnalyze.complexity, { normal: 4, bad: 7, veryBad: 30 });
  const { categories: functionLengthCategories, detailedData: functionLengthDetails } = categorizeData(repoAnalyze.function_length, { normal: 20, bad: 40, veryBad: 100 });
  const { categories: parameterCountCategories, detailedData: parameterCountDetails } = categorizeData(repoAnalyze.parameter_count, { normal: 2, bad: 5, veryBad: 10 });

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
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Number.isInteger(value) ? value : null
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / totalComplexities) * 100).toFixed(0);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const functionLengthOptions = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Number.isInteger(value) ? value : null
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / totalFunctionLengths) * 100).toFixed(0);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const parameterCountOptions = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Number.isInteger(value) ? value : null
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / totalParameterCounts) * 100).toFixed(0);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const getLineChartData = (data, label) => {
    const counts = {};

    Object.values(data).forEach(values => {
      values.forEach(({ value }) => {
        counts[value] = (counts[value] || 0) + 1;
      });
    });

    const sortedValues = Object.keys(counts).sort((a, b) => a - b);
    const dataPoints = sortedValues.map(value => ({
      x: parseInt(value),
      y: counts[value]
    }));

    return {
      datasets: [{
        label: label,
        data: dataPoints,
        fill: false,
        borderColor: 'rgba(255,0,0,1)',
        tension: 0
      }]
    };
  };

  const lineChartOptions = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: (value) => Number.isInteger(value) ? value : null
        }
      }
    },
    maintainAspectRatio: false
  };

  // commit quality와 grammar data를 repo_analyze로부터 추출
  const totalQualityData = {
    labels: ['Why and What', 'Nor', 'Why', 'What'],
    datasets: [{
      label: 'Commit Message Quality',
      data: total_quality,
      backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336'],
    }]
  };

  const totalQualityOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const ratio = ((count / total_quality.reduce((a, b) => a + b, 0)) * 100).toFixed(0);
            return `${context.label}: ${count} (${ratio}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const grammarPieData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [total_grammar, 100 - total_grammar], // total_grammar 데이터
      backgroundColor: ['#36A2EB', '#FFCE56']
    }]
  };

  const grammarOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            return `${context.label}: ${count}%`;
          }
        }
      }
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
            <div className="card" onClick={() => handleOpen(
              { title: "Complexity Score", score: complexity_repo_score },
              { details: complexityDetails, thresholds: { normal: 4, bad: 7, veryBad: 30, worst: 31 }, categories: complexityCategories }
            )}>
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
            <div className="card" onClick={() => handleOpen(
              { title: "Function Length Score", score: function_length_repo_score },
              { details: functionLengthDetails, thresholds: { normal: 20, bad: 40, veryBad: 100, worst: 101 }, categories: functionLengthCategories }
            )}>
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
            <div className="card" onClick={() => handleOpen(
              { title: "Parameter Count Score", score: parameter_count_repo_score },
              { details: parameterCountDetails, thresholds: { normal: 2, bad: 5, veryBad: 10, worst: 11 }, categories: parameterCountCategories }
            )}>
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
            <div className="card">
              <h5>Commit Quality</h5>
              <div className="commit-scores">
                <div className="commit-score">
                  <h6>Quality Score: {commit_message_quality_scores.total_commit_message_quality_score}</h6>
                  <div className="chart" style={{ height: '250px' }}>
                    <Bar data={totalQualityData} options={totalQualityOptions} />
                  </div>
                </div>
                <div className="commit-score">
                  <h6>Grammar Score: {commit_message_grammar_scores.total_commit_message_grammar_score}</h6>
                  <div className="chart" style={{ height: '250px' }}>
                    <Doughnut data={grammarPieData} options={grammarOptions} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="modal" onClick={handleClose}>
          <div className="modal_body" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80vw' }}>
            <button className="modal_close" onClick={handleClose}>&times;</button>
            {selectedCard && (
              <>
                <h2>{selectedCard.title}</h2>
                {selectedCard.score && <p>Grade: {selectedCard.score}</p>}
                {selectedCard.qualityScore && <p>Quality Score: {selectedCard.qualityScore}</p>}
                {selectedCard.grammarScore && <p>Grammar Score: {selectedCard.grammarScore}</p>}
                {selectedCard.totalScore && <p>Repo Communication: {selectedCard.totalScore}</p>}
                {selectedCard.userScore && <p>{username} Communication: {selectedCard.userScore}</p>}
              </>
            )}
            {modalData && modalData.details && (
              <>
                <div className="modalchart" style={{ width: '100%', height: '600px' }}>
                  <Line data={getLineChartData(modalData.details, `Num of ${selectedCard.title}`)} options={lineChartOptions} />
                </div>
                <div className="criteria">
                  <h3>Evaluation Criteria</h3>
                  <p>Normal: {modalData.thresholds.normal} 이하</p>
                  <p>Bad: {modalData.thresholds.normal + 1} ~ {modalData.thresholds.bad}</p>
                  <p>Very Bad: {modalData.thresholds.bad + 1} ~ {modalData.thresholds.veryBad}</p>
                  <p>Worst: {modalData.thresholds.veryBad + 1} 이상</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RepositoryDetailPage;