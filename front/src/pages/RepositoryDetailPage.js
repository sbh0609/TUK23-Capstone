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

const RepositoryDetailPage = () => {
  const { repositoryDetail } = useRepository();
  const { repo_name, fileList, username, repo_type, token } = repositoryDetail;
  const [programLanguages, setProgramLanguages] = useState([]);
  const [repoName, setRepoName] = useState('');
  const [framework, setFramework] = useState([]);
  const [complexityData, setComplexityData] = useState({});
  const [prData, setPRData] = useState({
    totalPR: null,
    userPR: null,
    prPercentage: null
});
const [teambarData, setTotalQualityData] = useState({
  TWhatWhy: null,
  TNone: null,
  TWhy: null,
  TWhat: null 
});
const [barData, setUserlQualityData] = useState({
  WhatWhy: null,
  None: null,
  Why: null,
  What: null 
});
const [grammardata, setGrammarData] = useState({
  totalGrammar: null,
  userGrammar: null
});
  const [commitsData, setcommitsData] = useState({
  totalCommits: null,
  userCommits: null,
  CommitsPercentage: null
});
  const [commentsData, setCommentsData] = useState({
  totalines: null,
  commentlines: null,
  CommentsPercentage: null,
  fliecounts: null
});
  const [merged_prData, setMerged_PRData] = useState({
  totalusers_PR: null,
  Merged_PR: null,
  Merged_prPercentage: null
});
  const [issuesData, setIssuesData] = useState({
  totalIssues: null,
  userIssues: null,
  IssuesPercentage: null
});
  const [duplicatesData, setDuplicatesData] = useState({
  total_lines: null,
  userDuplicates: null,
  DuplicatesPercentage: null
});
  const complexity_data = {1: 2, 2: 2}

  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput ] = useState("");
  const [userType, setUserType ] = useState("");
  const [userLanguage, setUserLanguage ] = useState("");
  const [userEct, setUserEct ] = useState("");
  const navigate = useNavigate();
    // 드롭다운의 옵션들 선언
    const type_options = [
      { value: "", label: "All" },
      { value: "Sincere@april.biz", label: "Private" },
      { value: "Nathan@yesenia.net", label: "Public" },
    ]
    const language_options = [
      { value: "", label: "All" },
      { value: "hildegard.org", label: "Private" },
      { value: "jacynthe.com", label: "Public" },
    ]
    const ect_options = [
      { value: "", label: "All" },
      { value: "Kulas Light", label: "Private" },
      { value: "Kattie Turnpike", label: "Public" },
    ]
    const handleEnterButton = () => {
      navigate("/repository");
    }
  
    // 드롭다운의 스타일
    const optionStyles = {
      control: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: "#000000",
        color: state.isFocused ? "#FFFFFF" : "#FFFFFF",
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: state.isFocused ? "#e2e2e2" : "",
        color: state.isFocused ? "#333333" : "#FFFFFF",
      }),
      menu: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: "#333333",
      }),
    }
  useEffect(()=>{
    axios.post('http://localhost:5000/api/analyze',{repo_name,username,fileList,repo_type,token})
      .then(response=>{
        console.log(response);
            setProgramLanguages(response.data.program_lang);
            const responseData = JSON.parse(response.config.data);
            setRepoName(responseData.repo_name);
            setFramework(response.data.framework);
            const { pr_per } = response.data;
            const {commit_per} = response.data;
            const {merged_pr_stats} = response.data;
            const {issue_per} = response.data;
            const {duplicate_code} = response.data;
            const {comment_per} = response.data;
            console.log("Before update:", duplicate_code);
            const fetchedComplexityData = response.data.complexity_info || {}; // 서버 응답이 없거나 오류가 있을 경우 빈 객체를 사용
             setComplexityData(fetchedComplexityData);
            setTotalQualityData({
              TWhatWhy: response.data.WhatWhy,
              TNone: response.data.None,
              TWhy: response.data.Why,
              TWhat: response.data.What
            });
            setUserlQualityData({
              WhatWhy: response.data.WhatWhy,
              None: response.data.None,
              Why: response.data.Why,
              What: response.data.What});
            setGrammarData({
              totalGrammar: response.data.total_grammar,
              userGrammar: response.data.user_grammar
            });
      
            if (pr_per && pr_per.length >= 3) {
              // prData 상태를 업데이트합니다.
              setPRData({
                totalPR: pr_per[0],
                userPR: pr_per[1],
                prPercentage: parseFloat(pr_per[2]).toFixed(2) // 소수점 두 번째 자리까지 포맷
              });
            } else {
              // pr_per 배열이 존재하지 않거나, 예상한 길이가 아니라면 기본값을 설정할 수 있습니다.
              setPRData({
                totalPR: '데이터 없음',
                userPR: '데이터 없음',
                prPercentage: '0.00'
              });
            }
            if (commit_per && commit_per.length >= 3) {
              setcommitsData({
                totalCommits: commit_per[0],
                userCommits: commit_per[1],
                CommitsPercentage: parseFloat(commit_per[2]).toFixed(2) // 소수점 두 번째 자리까지 포맷
              });
            } else {
              // pr_per 배열이 존재하지 않거나, 예상한 길이가 아니라면 기본값을 설정할 수 있습니다.
              setcommitsData({
                totalCommits: '데이터 없음',
                userCommits: '데이터 없음',
                CommitsPercentage: '0.00'
              });
            }
            if (merged_pr_stats && merged_pr_stats.length >= 3) {
              setMerged_PRData({
                totalusers_PR: merged_pr_stats[0],
                Merged_PR: merged_pr_stats[1],
                Merged_prPercentage: parseFloat(merged_pr_stats[2]).toFixed(2) // 소수점 두 번째 자리까지 포맷
              });
            } else {
              // pr_per 배열이 존재하지 않거나, 예상한 길이가 아니라면 기본값을 설정할 수 있습니다.
              setMerged_PRData({
                totalusers_PR: '데이터 없음',
                Merged_PR: '데이터 없음',
                Merged_prPercentage: '0.00'
              });
            }
            if (issue_per && issue_per.length >= 3) {
              setIssuesData({
                totalIssues: issue_per[0],
                userIssues: issue_per[1],
                IssuesPercentage: parseFloat(issue_per[2]).toFixed(2) // 소수점 두 번째 자리까지 포맷
              });
            } else {
              setIssuesData({
                totalIssues: '데이터 없음',
                userIssues: '데이터 없음',
                IssuesPercentage: '0.00'
              });
            }
            if (duplicate_code && duplicate_code.length >= 3) {
              setDuplicatesData({
                total_lines: duplicate_code[0],
                userDuplicates: duplicate_code[1],
                DuplicatesPercentage: parseFloat(duplicate_code[2]).toFixed(2) // 소수점 두 번째 자리까지 포맷
              });
            } else {
              setDuplicatesData({
                total_lines: null,
                userDuplicates: null,
                DuplicatesPercentage: '0.00'
              });
            }
            console.log("After update:", duplicate_code);
            if (comment_per && comment_per.length >= 3) {
              setCommentsData({
                totalines: comment_per[0],
                commentlines: comment_per[1],
                CommentsPercentage: parseFloat(comment_per[2]).toFixed(2), // 소수점 두 번째 자리까지 포맷
                fliecounts: comment_per[3]
              });
            } else {
              setCommentsData({
                totalines: '데이터 없음',
                commentlines: '데이터 없음',
                CommentsPercentage: '0.00',
                fliecounts: '데이터 없음'
              });
            }
            if (response.data.program_lang && response.data.program_lang.length > 0) {
              setLoading(false);
            }
          })
      .catch(error => {
        console.error('Error fetching data', error);
        setComplexityData({}); 
        console.error('Error analyzing repositories', error);
        window.alert('Error: ' + error);
        setLoading(false);
      });
    
  },[]);
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  }
  // 드롭다운 선택시 onchange
  const handleUserTypeChange = (selectedOption) => {
    setUserType(selectedOption.value);
  }
  const handleUserLanguageChange = (selectedOption) => {
    setUserLanguage(selectedOption.value);
  }
  const handleUserEctChange = (selectedOption) => {
    setUserEct(selectedOption.value);
  }
  const doughnutData = {
    labels: [
      'User PR',
      'Other'
    ],
    datasets: [{
      label: 'Pull Request Percentage',
      data: prData.prPercentage  != null ? [prData.prPercentage , 100 - prData.prPercentage ] : [0, 100], // PR 비율 또는 기본 값
      backgroundColor: [
        'rgba(255, 206, 86, 0.2)',
        'rgba(54, 162, 235, 0.2)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    }]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: { // 차트 제목 설정
        display: true,
        text: 'Pull Request Percentage', // 원하는 제목 설정
        font: {
          size: 20 // 원하는 제목 크기 설정
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${context.parsed.toFixed(2)}%`; // 소수점 두 자리까지만 표시
            }
            return label;
          }
        }
      }
    }
  };
  const merged_prDataChart = {
    labels: ['User Merged_PR', 'Other'],
    datasets: [{
      label: 'Merged_PR Percentage',
      data: merged_prData.Merged_prPercentage != null ? [(merged_prData.Merged_PR/merged_prData.totalusers_PR)*100 , 100 - (merged_prData.Merged_PR/merged_prData.totalusers_PR)*100] : [0, 100],
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)'],
      borderWidth: 1
    }]
  };
  const merged_PRoptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: { // 차트 제목 설정
        display: true,
        text: 'Merged_PR Percentage', // 원하는 제목 설정
        font: {
          size: 20 // 원하는 제목 크기 설정
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${context.parsed.toFixed(2)}%`; // 소수점 두 자리까지만 표시
            }
            return label;
          }
        }
      }
    }
  };
  const commentsDataChart = {
    labels: ['User Comments', 'Other'],
    datasets: [{
      label: 'Comments Percentage',
      data: commentsData.CommentsPercentage  != null ? [(commentsData.commentlines/commentsData.totalines)*100, 100 - (commentsData.commentlines/commentsData.totalines)*100 ] : [0, 100],
      backgroundColor: ['rgba(128, 128, 128, 0.8)', 'rgba(0, 123, 255, 0.8)'],
      borderColor: ['rgba(128, 128, 128, 1)', 'rgba(0, 123, 255, 1)'],
      borderWidth: 1
    }]
  };
  const commentsoptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: { // 차트 제목 설정
        display: true,
        text: 'Comments Percentage', // 원하는 제목 설정
        font: {
          size: 20 // 원하는 제목 크기 설정
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${context.parsed.toFixed(2)}%`; // 소수점 두 자리까지만 표시
            }
            return label;
          }
        }
      }
    }
  };
  const commitsDataChart = {
    labels: ['User Commits', 'Other'],
    datasets: [{
      label: 'Commits Percentage',
      data: commitsData.CommitsPercentage != null ? [(commitsData.userCommits/commitsData.totalCommits)*100, 100 - (commitsData.userCommits/commitsData.totalCommits)*100] : [0, 100],
      backgroundColor: ['rgba(153, 102, 255, 0.2)', 'rgba(201, 203, 207, 0.2)'],
      borderColor: ['rgba(153, 102, 255, 1)', 'rgba(201, 203, 207, 1)'],
      borderWidth: 1
    }]
  };
  const commitsoptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: { // 차트 제목 설정
        display: true,
        text: 'Commits Percentage', // 원하는 제목 설정
        font: {
          size: 20 // 원하는 제목 크기 설정
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${context.parsed.toFixed(2)}%`; // 소수점 두 자리까지만 표시
            }
            return label;
          }
        }
      }
    }
  };
  const issuesDataChart = {
    labels: ['User Issues', 'Other'],
    datasets: [{
      label: 'Issues Percentage',
      data: issuesData.IssuesPercentage != null ? [(issuesData.userIssues/issuesData.totalIssues)*100, 100 - (issuesData.userIssues/issuesData.totalIssues)*100] : [0, 100],
      backgroundColor: ['rgba(75, 180, 60, 0.5)', 'rgba(140, 250, 100, 0.5)'],
      borderColor: ['rgba(75, 180, 60, 1)', 'rgba(140, 250, 100, 1)'],
      borderWidth: 1
    }]
  };
  const issuesoptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: { // 차트 제목 설정
        display: true,
        text: 'Issues Percentage', // 원하는 제목 설정
        font: {
          size: 20 // 원하는 제목 크기 설정
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${context.parsed.toFixed(2)}%`; // 소수점 두 자리까지만 표시
            }
            return label;
          }
        }
      }
    }
  };
  const duplicatesDataChart = {
    labels: ['User Duplicates', 'Total Lines'],
    datasets: [{
      label: 'Duplicates Percentage',
      data:  duplicatesData.DuplicatesPercentage  != null ? [duplicatesData.DuplicatesPercentage , 100 - duplicatesData.DuplicatesPercentage ] : [0, 100],
      backgroundColor: ['rgba(33, 33, 33, 0.8)', 'rgba(255, 205, 86, 0.8)'],
      borderColor: ['rgba(33, 33, 33, 1)', 'rgba(255, 205, 86, 1)'],
      borderWidth: 1
    }]
  };
  const duplicatesoptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: { // 차트 제목 설정
        display: true,
        text: 'Duplicates Percentage', // 원하는 제목 설정
        font: {
          size: 20 // 원하는 제목 크기 설정
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${context.parsed.toFixed(2)}%`; // 소수점 두 자리까지만 표시
            }
            return label;
          }
        }
      }
    }
  };
  const barDatachart = {
    labels: ['WhatWhy', 'What', 'Why', 'None'],
    datasets: [{
      label: 'Commit Message Chart',
      data: [
        barData?.WhatWhy || 0,  // Use optional chaining and fallback to 0
        barData?.What || 0,
        barData?.Why || 0,
        barData?.None || 0
      ],
      backgroundColor: [
          'rgba(255, 206, 86, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(122, 162, 235, 0.2)',
          'rgba(30, 162, 235, 0.2)'
      ],
      borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(122, 162, 235, 1)',
          'rgba(30, 162, 235, 1)'
      ],
      borderWidth: 1
    }]
  };
  
    const barDataoptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Commit Message Chart',
          font: {
            size: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              
              return label;
            }
          }
        }
      }
    };
    const lineChartData = {
      labels: Object.keys(complexityData).map(line => `Line ${line}`),
      datasets: [
        {
          label: 'Cyclomatic Complexity per Line',
          data: Object.values(complexityData),
          fill: false,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgba(75, 192, 192, 0.2)',
        }
      ]
    };
  
    const chartOptions = {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cyclomatic Complexity'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Source Code Lines'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
 
  return (
  <div id="page-wrap">
    
    <div>
      {loading ? <Loading /> : null} 
      <div className="top-bar">
        <button onClick={handleEnterButton} className="home-button">Home</button>
        <button onClick={handleEnterButton} className="log-out-button">Log out</button>
        <button className="about-us-button">About us</button>
      </div>
      <div className="search-bar-background">
        <label>
          <input
            className="search-bar"
            type="text"
            value={userInput}
            onChange={handleUserInputChange}
            placeholder=" Search"
          />
        </label>
        <div className="select">
          <Select options={type_options} styles={optionStyles} placeholder="Type" onChange={handleUserTypeChange} className="select-type"/>
          <Select options={language_options} styles={optionStyles} placeholder="Language" onChange={handleUserLanguageChange}/>
          <Select options={ect_options} styles={optionStyles} placeholder="Ect" onChange={handleUserEctChange}/>
        </div>
      </div>

 

    <div>
    <Fragment>
      <Element name="section-one">
        <h2>Section One</h2>
        <div className="repo-info">
          <h2 className="repo-name">{repoName} Repository</h2>
          {prData.prPercentage !== null && (
            <h3 className="repo-type">{prData.prPercentage > 0 ? 'Team Repository' : 'Personal Repository'}</h3>
          )}
        </div>
        <div className="info-boxx">
          <h3>Used Language</h3>
          <p>{programLanguages.join(', ')}</p> {/* 언어들을 쉼표로 구분하여 표시 */}
        </div>
        <div className="info-boxx">
          <h3>Used Framework</h3>
          <p>{framework.join(', ')}</p> {/* 프레임워크들을 쉼표로 구분하여 표시 */}
        </div>
      </Element>

      <Element name="section-two">
        <h2>Repository info</h2>
          <>
            <div className="chart-with-info">
	            <div className="chart-and-info-container">
              {prData.prPercentage === '0.00' ? (
  <div className="chart-and-info-container">
    <img src={imageData} alt="No Data Available" style={{ width: '100%', height: 'auto' }} />
    <div className="info-box">
      <h3>Total PR</h3>
      <p>해당 프로젝트는 personal 프로젝트라 데이터가 없습니다.</p>
    </div>
  </div>
) : (
  <div className="chart-and-info-container">
    <div className="chart-container">
      <Doughnut data={doughnutData} options={options} />
    </div>
    <div className="info-box">
      <h3>Total Commits</h3>
      <p>총 PR: {prData.totalPR}</p>
      <p>사용자 PR: {prData.userPR}</p>
      <p>PR 비중:  {prData.prPercentage }</p>
    </div>
  </div>
)}
              </div>
	          <div className="chart-and-info-container">
            {merged_prData.Merged_prPercentage === '0.00' ? (
  <div className="chart-and-info-container">
    <img src={imageData} alt="No Data Available" style={{ width: '100%', height: 'auto' }} />
    <div className="info-box">
      <h3>Total PR</h3>
      <p>해당 프로젝트는 personal 프로젝트라 데이터가 없습니다.</p>
    </div>
  </div>
) : (
  <div className="chart-and-info-container">
    <div className="chart-container">
      <Doughnut data={merged_prDataChart} options={merged_PRoptions} />
    </div>
    <div className="info-box">
      <h3>Total Merged_PR</h3>
      <p>총 PR: {merged_prData.totalusers_PR}</p>
      <p>병합된 PR: {merged_prData.Merged_PR}</p>
      <p>병합된 PR 비중:  {merged_prData.Merged_prPercentage }</p>
    </div>
  </div>
)}
            </div>
            <div className="chart-and-info-container">
            {issuesData.IssuesPercentage === '0.00' ? (
 <div className="chart-and-info-container">
    <img src={imageData} alt="No Data Available" style={{ width: '100%', height: 'auto' }} />
    <div className="info-box">
      <h3>Total PR</h3>
      <p>해당 프로젝트는 personal 프로젝트라 데이터가 없습니다.</p>
    </div>
  </div>
) : (
  <div className="chart-and-info-container">
    <div className="chart-container">
      <Doughnut data={issuesDataChart} options={issuesoptions} />
    </div>
    <div className="info-box">
      <h3>Total Merged_PR</h3>
      <p>총 Issues: {issuesData.totalIssues}</p>
      <p>사용자 Issues: {issuesData.userIssues}</p>
      <p>Issues 비중: {issuesData.IssuesPercentage}</p>
    </div>
  </div>
)}
            </div>
            <div className="chart-and-info-container">
              {commitsData.CommitsPercentage === '0.00' ? (
                <div className="chart-and-info-container">
                <img src={imageData} alt="No Data Available" style={{ width: '100%', height: 'auto' }} />
                  <div className="info-box">
                  <h3>Total Commits</h3>
                  <p>해당 프로젝트는 personal 프로젝트라 데이터가 없습니다.</p>
                  </div>
                </div>
                ) : (
              <div className="chart-and-info-container">
                <div className="chart-container">
                  <Doughnut data={commitsDataChart} options={commitsoptions} />
                </div>
                  <div className="info-box">
                    <h3>Total Commits</h3>
                    <p>총 Commit: {commitsData.totalCommits}</p>
                    <p>사용자 Commit: {commitsData.userCommits}</p>
                    <p>Commit 비중: {commitsData.CommitsPercentage}</p>
                  </div>
                </div>
              )}          
        </div>

	     
	    <div className="chart-and-info-container">
      <div className="chart-container">
       <Doughnut data={commentsDataChart} options={commentsoptions} />
     </div>
     <div className="info-box">
     <h3>Total Comments</h3>
       <p>총 라인수: {commentsData.totalines}</p>
        <p>주석 라인수: {commentsData.commentlines}</p>
       <p>파일수: {commentsData.fliecounts}</p>
       <p>사용자 comments 비율: {commentsData.totalines && commentsData.totalines > 0 ? ((commentsData.commentlines / commentsData.totalines) * 100).toFixed(2) : '데이터 없음'}</p>
      </div>
      </div>
      <div className="chart-and-info-container">
      <div className="chart-container">
      <Doughnut data={duplicatesDataChart} options={duplicatesoptions} />
      </div>
     <div className="info-box">
     <h3>Total PR</h3>
      <p>총 라인수: {duplicatesData. total_lines}</p>
      <p>중복 라인수 : {duplicatesData.userDuplicates}</p>
      {/* 배열의 각 요소를 개별적으로 렌더링합니다. */}
      <p>중복 비율:  {duplicatesData.DuplicatesPercentage }</p>
        </div>
       </div>
      </div>
          </>
       
      
          <div className="scroll-link-box">
            <ScrollLink to="section-one" spy={true} smooth={true} duration={500}>
                 top
            </ScrollLink>
          </div>
      </Element>

      <Element name="section-three">
        <h2>Section Three</h2>
        <div>
        <Line data={lineChartData} options={chartOptions} />
        </div>
        <div className="scroll-link-box">
           <ScrollLink to="section-one" spy={true} smooth={true} duration={500}>
             top
           </ScrollLink>
        </div>
      </Element>

      <Element name="section-four">
        <h2>Section Four</h2>
	    <div className="chart-with-info">
            <div className="chart-and-info-container">
      <div className="chart-container">
      <Bar data={barDatachart} options={barDataoptions} />
      </div>
     <div className="info-box">
     <h3>Total PR</h3>
      <p>WhatWhy: {barData. WhatWhy}</p>
      <p>What : {barData.What}</p>
      <p>Why : {barData.Why}</p>
      <p>None:  {barData.None }</p>
        </div>
        </div>
        </div>
        <div className="scroll-link-box">
          <ScrollLink to="section-one" spy={true} smooth={true} duration={500}>
            top
          </ScrollLink>
        </div>
      </Element>
    </Fragment>
  </div>
  </div>
  </div>
  );

};

export default RepositoryDetailPage;