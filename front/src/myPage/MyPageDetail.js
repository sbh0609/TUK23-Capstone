import React, { Fragment, useState, useEffect } from "react";
import 'chart.js/auto';
import "./MyPageDetail.css";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';
import { Pie,Bar,Line,Doughnut } from 'react-chartjs-2';
import { useLocation } from "react-router-dom";


const MyPageDetail = () => {
  const location = useLocation();
  const session_userID = sessionStorage.getItem("userID");
  const [username, setUsername] = useState();
  const [repoAnalyze, setRepoAnalyze] = useState(null);
  const [evaluate, setEvaluate] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalData, setModalData] = useState(null);
  const { repo_analyzed_data, repo_evaluate_data, repo_name, repo_type } = location.state || {}; 
  const [programLang, setProgramLang] = useState();

  useEffect(() => {
    if (repo_analyzed_data && repo_evaluate_data) {
      const parsedRepoAnalyze = {
        ...repo_analyzed_data,
        program_lang: JSON.parse(repo_analyzed_data.program_lang || '{}'),
        complexity: JSON.parse(repo_analyzed_data.complexity || '{}'),
        function_length: JSON.parse(repo_analyzed_data.function_length || '{}'),
        parameter_count: JSON.parse(repo_analyzed_data.parameter_count || '{}'),
        keyword_count: JSON.parse(repo_analyzed_data.keyword_count || '{}'),
        pr_data: JSON.parse(repo_analyzed_data.pr_data || '{}'),
        issue_data: JSON.parse(repo_analyzed_data.issue_data || '{}')
      };
      setRepoAnalyze(parsedRepoAnalyze);
      setEvaluate(repo_evaluate_data);
      setUsername(repo_analyzed_data.repo_contributor_name);
      programLang= repo_analyzed_data.program_lang;
      setProgramLang(programLang);
    }
  }, [repo_analyzed_data, repo_evaluate_data]);

  console.log("(detail) repoAnalyze: ", repoAnalyze);
  console.log("(detail) evaluate: ", evaluate);

  if (!repoAnalyze || !evaluate) {
    return <div>Loading...</div>;
  }

  const languages = repoAnalyze.program_lang ? Object.entries(JSON.parse(repoAnalyze.program_lang)).map(([lang, percentage]) => ({ lang, percentage })) : [];
  const frameworks = repoAnalyze.framework;
  console.log(languages);

  const {
    comment_score,
    duplication_score,
    complexity_file_scores,
    complexity_repo_score,
    function_length_file_scores,
    function_length_repo_score,
    parameter_count_file_scores,
    parameter_count_repo_score,
    commit_score,
    pr_scores,
    issue_scores,
    commit_message_quality_scores,
    commit_message_grammar_scores,
    total_collaboration_score,
    user_collaboration_score,
    code_quality
  } = evaluate;

  const { comment_per, duplicate_code, total_quality, total_grammar, keyword_count } = repoAnalyze;
  const totalLines = comment_per ? comment_per[0] : 0;
  const commentLines = comment_per ? comment_per[1] : 0;
  const commentRatio = comment_per ? comment_per[2] : 0;

  const totalDuplicateLines = duplicate_code ? duplicate_code[0] : 0;
  const duplicatedLines = duplicate_code ? duplicate_code[1] : 0;
  const duplicationRatio = duplicate_code ? duplicate_code[2] : 0;

  const handleOpen = (cardData, modalData) => {
    console.log('handleOpen called');
    setSelectedCard(cardData);
    setModalData(modalData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCard(null);
    setModalData(null);
  };

  const doughnutData = {
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

  const commentDoughnutData = {
    labels: ['Comment Lines', 'Code Lines'],
    datasets: [{
      data: [commentLines, totalLines - commentLines],
      backgroundColor: ['#36A2EB', '#FFCE56'],
    }]
  };

  const duplicationDoughnutData = {
    labels: ['Duplicated Lines', 'Non-Duplicated Lines'],
    datasets: [{
      data: [duplicatedLines, totalDuplicateLines - duplicatedLines],
      backgroundColor: ['#FF6384', '#36A2EB'],
    }]
  };

  const getBarChartData = (data) => {
    const { total_keyword, user_keyword } = data;

    const labels = Object.keys(total_keyword);
    const totalValues = Object.values(total_keyword);
    const userValues = labels.map(label => user_keyword[label] || 0);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Total Keywords',
          data: totalValues,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'User Keywords',
          data: userValues,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }
      ]
    };
  };

  const barChartOptions = {
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
            return `${context.label}: ${count}`;
          }
        }
      }
    },
    maintainAspectRatio: false
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

  const commitDoughnutData = {
    labels: ['User Commits', 'Other Commits'],
    datasets: [{
      data: repoAnalyze.commit_per ? [repoAnalyze.commit_per[1], repoAnalyze.commit_per[0] - repoAnalyze.commit_per[1]] : [0, 0],
      backgroundColor: ['#36A2EB', '#FFCE56'],
      borderColor: ['#AAAAAA', '#AAAAAA'],
    }]
  };

  const prDoughnutData = {
    labels: ['User PRs', 'Other PRs', 'Merged User PRs', 'Unmerged User PRs', 'Merged Total PRs', 'Unmerged Total PRs'],
    datasets: [
      {
        label: 'Total/user PR',
        data: [
          repoAnalyze.pr_data ? repoAnalyze.pr_data.total_user_prs : 0,
          repoAnalyze.pr_data ? repoAnalyze.pr_data.total_prs - repoAnalyze.pr_data.total_user_prs : 0,
          0, 0, 0, 0
        ],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4CAF50', '#36A2EB', '#FF9800'],
        borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA']
      },
      {
        label: 'Un/Merged User PR',
        data: [
          0, 0,
          repoAnalyze.pr_data ? repoAnalyze.pr_data.merged_user_prs : 0,
          repoAnalyze.pr_data ? repoAnalyze.pr_data.total_user_prs - repoAnalyze.pr_data.merged_user_prs : 0,
          0, 0
        ],
        backgroundColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#FF6384', '#4CAF50', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)'],
        borderColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#AAAAAA', '#AAAAAA', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)'],
      },
      {
        label: 'Un/Merged Total PR',
        data: [
          0, 0, 0, 0,
          repoAnalyze.pr_data ? repoAnalyze.pr_data.merged_prs : 0,
          repoAnalyze.pr_data ? repoAnalyze.pr_data.total_prs - repoAnalyze.pr_data.merged_prs : 0
        ],
        backgroundColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#36A2EB', '#FF9800'],
        borderColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#AAAAAA', '#AAAAAA'],
      }
    ]
  };
  
  const prDoughnutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let dataLabel = context.label || '';
            let value = context.raw;
            let total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            let percentage = ((value / total) * 100).toFixed(1);
            return `${context.dataset.label}: ${dataLabel} - ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  const issueDoughnutData = {
    labels: ['User Issues', 'Other Issues', 'Closed User Issues', 'Unclosed User Issues', 'Closed Total Issues', 'Unclosed Total Issues'],
    datasets: [
      {
        label: 'Total/User Issue',
        data: [
          repoAnalyze.issue_data ? repoAnalyze.issue_data.total_user_issues : 0,
          repoAnalyze.issue_data ? repoAnalyze.issue_data.total_issues - repoAnalyze.issue_data.total_user_issues : 0,
          0, 0, 0, 0
        ],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4CAF50', '#36A2EB', '#FF9800'],
        borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA']
      },
      {
        label: 'not/closed User Issue',
        data: [
          0, 0,
          repoAnalyze.issue_data ? repoAnalyze.issue_data.closed_user_issues : 0,
          repoAnalyze.issue_data ? repoAnalyze.issue_data.total_user_issues - repoAnalyze.issue_data.closed_user_issues : 0,
          0, 0
        ],
        backgroundColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#FF6384', '#4CAF50', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)'],
        borderColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#AAAAAA', '#AAAAAA', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)'],
      },
      {
        label: 'not/closed Total Issue',
        data: [
          0, 0, 0, 0,
          repoAnalyze.issue_data ? repoAnalyze.issue_data.closed_issues : 0,
          repoAnalyze.issue_data ? repoAnalyze.issue_data.total_issues - repoAnalyze.issue_data.closed_issues : 0
        ],
        backgroundColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#36A2EB', '#FF9800'],
        borderColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', '#AAAAAA', '#AAAAAA'],
      }
    ]
  };
  
  const issueDoughnutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let dataLabel = context.label || '';
            let value = context.raw;
            let total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            let percentage = ((value / total) * 100).toFixed(1);
            return `${context.dataset.label}: ${dataLabel} - ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  const commitQualityDoughnutData = {
    labels: ['Why or Not', 'Nor', 'Why', 'What'],
    datasets: [
      {
        label: 'Total Quality',
        data: [
          repoAnalyze.total_quality ? repoAnalyze.total_quality[0] : 0,
          repoAnalyze.total_quality ? repoAnalyze.total_quality[1] : 0,
          repoAnalyze.total_quality ? repoAnalyze.total_quality[2] : 0,
          repoAnalyze.total_quality ? repoAnalyze.total_quality[3] : 0,
        ],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4CAF50'],
        borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA'],
      },
      {
        label: 'User Quality',
        data: [
          repoAnalyze.user_quality ? repoAnalyze.user_quality[0] : 0,
          repoAnalyze.user_quality ? repoAnalyze.user_quality[1] : 0,
          repoAnalyze.user_quality ? repoAnalyze.user_quality[2] : 0,
          repoAnalyze.user_quality ? repoAnalyze.user_quality[3] : 0,
        ],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4CAF50'],
        borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA'],
      },
    ]
  };
  
  const commitQualityDoughnutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let dataLabel = context.label || '';
            let value = context.raw;
            let total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            let percentage = ((value / total) * 100).toFixed(1);
            return `${context.dataset.label}: ${dataLabel} - ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  const commitGrammarDoughnutData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        label: 'Total Grammar',
        data: [
          repoAnalyze.total_grammar ? repoAnalyze.total_grammar : 0,
          repoAnalyze.total_grammar ? 100 - repoAnalyze.total_grammar : 0
        ],
        backgroundColor: ['#36A2EB', '#FFCE56'],
        borderColor: ['#AAAAAA', '#AAAAAA'],
      },
      {
        label: 'User Grammar',
        data: [
          repoAnalyze.user_grammar ? repoAnalyze.user_grammar : 0,
          repoAnalyze.user_grammar ? 100 - repoAnalyze.user_grammar : 0
        ],
        backgroundColor: ['#FFA07A', '#87CEFA'],
        borderColor: ['#AAAAAA', '#AAAAAA'],
      },
    ]
  };
  
  const commitGrammarDoughnutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let dataLabel = context.label || '';
            let value = context.raw;
            let total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            let percentage = ((value / total) * 100).toFixed(1);
            return `${context.dataset.label}: ${dataLabel} - ${value} (${percentage}%)`;
          }
        }
      }
    }
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

      <div className={`grid ${repo_type === "team" ? "team" : ""}`}>
        {repo_type === "team" ? (
          <>
            <div className="card">
              <h5>Program Language</h5>
              <div className="chart">
                <Doughnut data={doughnutData} />
              </div>
            </div>
            <div className="card" onClick={() => handleOpen(
              { title: "Code Quality", score: code_quality, type: 'team' },
              { comment_score, duplication_score, complexity_repo_score, function_length_repo_score, parameter_count_repo_score }
            )}>
              <h5>Code Quality</h5>
              <div className="score">
                <p>Grade: {code_quality}</p>
              </div>
              <div className="evaluation-data">
                <span>Comment Score</span>
                <span>Duplication Score</span>
                <span>Complexity Score</span>
                <span>Function Length Score</span>
                <span>Parameter Count Score</span>
              </div>
            </div>
            <div className="card" onClick={() => handleOpen(
              { title: "Communication Ability", totalScore: total_collaboration_score, userScore: user_collaboration_score, type: 'team' },
              { commit_score, pr_scores, issue_scores, commit_message_quality_scores }
            )}>
              <h5>Communication Ability</h5>
              <div className="card-content-horizontal">
                <div className="score">
                  <h6>Repo Communication</h6>
                  <p>Grade: {total_collaboration_score}</p>
                </div>
                <div className="score">
                  <h6>{username} Communication</h6>
                  <p>Grade: {user_collaboration_score}</p>
                </div>
              </div>
              <div className="evaluation-data">
                <span>Commit Score</span>
                <span>PR Scores</span>
                <span>Issue Scores</span>
                <span>Commit Message Quality</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <h5>Program Language</h5>
              <div className="chart">
                <Doughnut data={doughnutData} />
              </div>
            </div>
            <div className="card">
              <h5>Comment Score</h5>
              <div className="card-content">
                <div className="score">
                  <p>Grade: {comment_score}</p>
                </div>
                <div className="chart">
                  <Doughnut data={commentDoughnutData} />
                </div>
                <p>{(commentRatio * 100).toFixed(1)}% comments</p>
              </div>
            </div>
            <div className="card">
              <h5>Duplication Score</h5>
              <div className="card-content">
                <div className="score">
                  <p>Grade: {duplication_score}</p>
                </div>
                <div className="chart">
                  <Doughnut data={duplicationDoughnutData} />
                </div>
                <p>{(duplicationRatio * 100).toFixed(1)}% duplication</p>
              </div>
            </div>
            <div className="card" onClick={() => handleOpen(
              { title: "Complexity Score", score: complexity_repo_score },
              { details: complexityDetails, thresholds: { normal: 4, bad: 7, veryBad: 30, worst: 31 }, categories: complexityCategories }
            )}>
              <h5>Complexity Score</h5>
              <div className="card-content">
                <div className="score">
                  <p>Grade: {complexity_repo_score}</p>
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
                  <p>Grade: {function_length_repo_score}</p>
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
                  <p>Grade: {parameter_count_repo_score}</p>
                </div>
                <div className="chart" style={{ height: '250px' }}>
                  <Bar data={parameterCountBarData} options={parameterCountOptions} />
                </div>
              </div>
            </div>
            <div className="card" onClick={() => handleOpen(
              { title: "Commit Quality", score: commit_message_quality_scores.total_commit_message_quality_score },
              { keywordCounts: keyword_count }
            )}>
              <h5>Commit Quality</h5>
              <div className="commit-scores">
                <div className="commit-score">
                  <p>Quality Score: {commit_message_quality_scores.total_commit_message_quality_score}</p>
                  <div className="chart" style={{ height: '250px' }}>
                    <Bar data={totalQualityData} options={totalQualityOptions} />
                  </div>
                </div>
                <div className="commit-score">
                  <p>Grammar Score: {commit_message_grammar_scores.total_commit_message_grammar_score}</p>
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
          <div className={`modal_body ${repo_type === "team" ? "team-modal-body" : ""}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80vw', height: 'auto' }}>
            <button className="modal_close" onClick={handleClose}>&times;</button>
            {selectedCard && selectedCard.type !== 'team' && (
              <>
                <h2>{selectedCard.title}</h2>
                {selectedCard.qualityScore && <p>Quality Score: {selectedCard.qualityScore}</p>}
                {selectedCard.grammarScore && <p>Grammar Score: {selectedCard.grammarScore}</p>}
                {selectedCard.totalScore && <p>Repo Communication: {selectedCard.totalScore}</p>}
                {selectedCard.userScore && <p>{username} Communication: {selectedCard.userScore}</p>}
              </>
            )}
            {modalData && modalData.details && (
              <>
                <div className="modalchart" style={{ width: '100%', flexGrow: 1 }}>
                  <Line data={getLineChartData(modalData.details, `Num of ${selectedCard.title}`)} options={lineChartOptions} />
                </div>
                <div className="criteria" style={{ flexGrow: 1 }}>
                  <h3>Evaluation Criteria</h3>
                  <p>Normal: {modalData.thresholds.normal} 이하</p>
                  <p>Bad: {modalData.thresholds.normal + 1} ~ {modalData.thresholds.bad}</p>
                  <p>Very Bad: {modalData.thresholds.bad + 1} ~ {modalData.thresholds.veryBad}</p>
                  <p>Worst: {modalData.thresholds.veryBad} 이상</p>
                </div>
              </>
            )}
            {modalData && modalData.keywordCounts && (
              <>
                <div className="modalchart" style={{ width: '100%', flexGrow: 1 }}>
                  <Bar data={getBarChartData(modalData.keywordCounts)} options={barChartOptions} />
                </div>
                <div className="criteria">
                  <h3>Keyword Counts</h3>
                  <div className="criteria-container">
                    <div className="criteria-item">
                      <h4>Commit Message Quality</h4>
                      <p>Best: Why and What</p>
                      <p>Good: What</p>
                      <p>Average: Why</p>
                      <p>Bad: Nor</p>
                    </div>
                    <div className="criteria-item">
                      <h4>Grammar Quality</h4>
                      <p>Best: (90% 이상)</p>
                      <p>Good: (80% - 89%)</p>
                      <p>Average: (70% - 79%)</p>
                      <p>Bad: (60% - 69%)</p>
                      <p>Worst: (60% 이하)</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedCard && selectedCard.type === 'team' && selectedCard.title === 'Communication Ability' && (
              <>
                <h2 className="team-modal-header">{selectedCard.title}</h2>
                <h3 className="team-modal-subheader">Commit Amount</h3>
                <p className="team-modal-score">Commit Score: {evaluate.commit_score}</p>
                <div className="team-chart">
                  {repoAnalyze.commit_per && repoAnalyze.commit_per[0] > 0 ? (
                    <Doughnut data={commitDoughnutData} />
                  ) : (
                    <p>Commit이 존재하지 않습니다</p>
                  )}
                </div>
                <p className="team-modal-ratio">Commit Ratio: {repoAnalyze.commit_per[2]}%</p>

                <h3 className="team-modal-subheader">PR Scores</h3>
                <p className="team-modal-score">
                  User PR Score: {evaluate.pr_scores.user_pr_score} / Merged PR Score: {evaluate.pr_scores.merged_pr_score} / Total PR Merge Score: {evaluate.pr_scores.total_pr_merge_score}
                </p>
                <div className="team-chart" style={{ width: '800px', height: '800px', margin: '0 auto' }}>
                  {repoAnalyze.pr_data && repoAnalyze.pr_data.total_prs > 0 ? (
                    <Doughnut data={prDoughnutData} options={prDoughnutOptions}/>
                  ) : (
                    <p>PR이 존재하지 않습니다</p>
                  )}
                </div>
                <p className="team-modal-ratio">
                  Merged PR Percentage: {repoAnalyze.pr_data ? repoAnalyze.pr_data.merged_pr_percentage : 0}% / Merged User PR Percentage: {repoAnalyze.pr_data ? repoAnalyze.pr_data.merged_user_pr_percentage : 0}% / User PR Percentage: {repoAnalyze.pr_data ? repoAnalyze.pr_data.user_pr_percentage : 0}%
                </p>
                <h3 className="team-modal-subheader">Issue Scores</h3>
                <p className="team-modal-score">
                    User Issue Score: {evaluate.issue_scores.user_issue_score} / Closed Issue Score: {evaluate.issue_scores.closed_issue_score} / Total Issue Close Score: {evaluate.issue_scores.total_issue_close_score}
                </p>
                <div className="team-chart" style={{ width: '800px', height: '800px', margin: '0 auto' }}>
                    {repoAnalyze.issue_data && repoAnalyze.issue_data.total_issues > 0 ? (
                        <Doughnut data={issueDoughnutData} options={issueDoughnutOptions}/>
                    ) : (
                        <p>Issue가 존재하지 않습니다</p>
                    )}
                </div>
                <p className="team-modal-ratio">
                    Closed Issue Percentage: {repoAnalyze.issue_data ? repoAnalyze.issue_data.closed_issue_percentage : 0}% / Closed User Issue Percentage: {repoAnalyze.issue_data ? repoAnalyze.issue_data.closed_user_issue_percentage : 0}% / User Issue Percentage: {repoAnalyze.issue_data ? repoAnalyze.issue_data.user_issue_percentage : 0}%
                </p>
                <h3 className="team-modal-subheader">Commit Quality Scores</h3>
                <p className="team-modal-score">
                    Total Commit Quality Score: {evaluate.commit_message_quality_scores.total_commit_message_quality_score} / User Commit Quality Score: {evaluate.commit_message_quality_scores.user_commit_message_quality_score}
                </p>
                <div className="team-chart" style={{ width: '800px', height: '800px', margin: '0 auto' }}>
                    {repoAnalyze.total_quality && repoAnalyze.total_quality.length > 0 ? (
                        <Doughnut data={commitQualityDoughnutData} options={commitQualityDoughnutOptions}/>
                    ) : (
                        <p>Commit Quality 데이터가 존재하지 않습니다</p>
                    )}
                </div>
                <h3 className="team-modal-subheader">Commit Grammar Scores</h3>
                <p className="team-modal-score">
                    Total Commit Message Grammar Score: {evaluate.commit_message_grammar_scores.total_commit_message_grammar_score} / User Commit Message Grammar Score: {evaluate.commit_message_grammar_scores.user_commit_message_grammar_score}
                </p>
                <div className="team-chart" style={{ width: '800px', height: '800px', margin: '0 auto' }}>
                    <Doughnut data={commitGrammarDoughnutData} options={commitGrammarDoughnutOptions} />
                </div>
                <p className="team-modal-ratio">
                    Total Grammar Correct: {repoAnalyze.total_grammar}% / User Grammar Correct: {repoAnalyze.user_grammar}%
                </p>
                <h3 className="team-modal-subheader">Keyword Counts</h3>
                {/* <h3 className="team-modal-subheader">Keyword Counts</h3> */}
                <div className="team-chart-keyword">
                  <Bar data={getBarChartData(keyword_count)} options={barChartOptions} />
                </div>
              </>
            )}
            {selectedCard && selectedCard.type === 'team' && selectedCard.title === 'Code Quality' && (
              <>
                <h2 className="team-modal-header">{selectedCard.title}</h2>
                <h3 className="team-modal-subheader">Code Quality Details</h3>
                
                <div className="team-chart-horizontal">
                  <div className="team-chart">
                    <h3 className="team-modal-subheader">Comment Score</h3>
                    <p className="team-modal-score">Comment Score: {comment_score}</p>
                    <Doughnut data={commentDoughnutData} />
                    <p className="team-modal-ratio">{commentRatio}% comments</p>
                  </div>
                  <div className="team-chart">
                    <h3 className="team-modal-subheader">Duplication Score</h3>
                    <p className="team-modal-score">Duplication Score: {duplication_score}</p>
                    <Doughnut data={duplicationDoughnutData} />
                    <p className="team-modal-ratio">{duplicationRatio}% duplication</p>
                  </div>
                </div>

                <h3 className="team-modal-subheader">Complexity Score</h3>
                <p className="team-modal-score">Complexity Score: {complexity_repo_score}</p>
                <div className="team-chart-large-horizontal">
                  <div className="team-chart-large">
                    <Bar data={complexityBarData} options={complexityOptions} />
                  </div>
                  <div className="team-chart-large">
                    <Line data={getLineChartData(complexityDetails, 'Complexity Distribution')} options={lineChartOptions} />
                  </div>
                </div>

                <h3 className="team-modal-subheader">Function Length Score</h3>
                <p className="team-modal-score">Function Length Score: {function_length_repo_score}</p>
                <div className="team-chart-large-horizontal">
                  <div className="team-chart-large">
                    <Bar data={functionLengthBarData} options={functionLengthOptions} />
                  </div>
                  <div className="team-chart-large">
                    <Line data={getLineChartData(functionLengthDetails, 'Function Length Distribution')} options={lineChartOptions} />
                  </div>
                </div>

                <h3 className="team-modal-subheader">Parameter Count Score</h3>
                <p className="team-modal-score">Parameter Count Score: {parameter_count_repo_score}</p>
                <div className="team-chart-large-horizontal">
                  <div className="team-chart-large">
                    <Bar data={parameterCountBarData} options={parameterCountOptions} />
                  </div>
                  <div className="team-chart-large">
                    <Line data={getLineChartData(parameterCountDetails, 'Parameter Count Distribution')} options={lineChartOptions} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPageDetail;