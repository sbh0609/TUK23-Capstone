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
  const [complexityData, setComplexityData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Line Complexity Counts',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  });

  const [complexDoughnutData, setComplexDoughnutData] = useState({
    labels: ['Green (1-10)', 'Yellow (11-20)', 'Red (21+)'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 205, 86, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 205, 86, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      }
    ],
  });

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Complexity Ranges',
        font: {
          size: 16
        }
      }
    }
  };
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
const [barData, setUserQualityData] = useState({
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
            const {complexity} = response.data;
           
            
            // Process fetched data to count complexities
            const complexityCounts = {};
            Object.values(complexity).forEach(file => {
              Object.entries(file).forEach(([line, comp]) => {
                complexityCounts[comp] = (complexityCounts[comp] || 0) + 1;
              });
            });
            
        
            // Prepare chart data
            const labels = Object.keys(complexityCounts).sort((a, b) => a - b);
            const data = labels.map(label => complexityCounts[label]);
            setComplexityData({
              labels,
              datasets: [{
                label: 'Line Complexity Counts',
                data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
              }]
            });

           
            const rangeCounts = { green: 0, yellow: 0, red: 0 };
            Object.values(complexity).forEach(files => {
              Object.entries(files).forEach(([line, comp]) => {
                if (comp <= 10) {
                  rangeCounts.green++;
                } else if (comp <= 20) {
                  rangeCounts.yellow++;
                } else {
                  rangeCounts.red++;
                }
              });
              
          setComplexDoughnutData(prevData => ({
          ...prevData,
          datasets: [{
            ...prevData.datasets[0],
            data: [rangeCounts.green, rangeCounts.yellow, rangeCounts.red]
          }]
         }));
            });
         
           
            
            // 품질 데이터 설정
            setTotalQualityData({
              TWhatWhy: response.data.total_quality[0],
              TNone: response.data.total_quality[1],
              TWhy: response.data.total_quality[2],
              TWhat: response.data.total_quality[3]
            });
            setUserQualityData({
              WhatWhy: response.data.user_quality[0],
              None: response.data.user_quality[1],
              Why: response.data.user_quality[2],
              What: response.data.user_quality[3]
            });
            setGrammarData({
              totalGrammar: response.data.total_grammar.toFixed(2),
              userGrammar: response.data.user_grammar.toFixed(2)
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
  const PullRequestData = {
    labels: ['User PR','Other'],
    datasets: [{
      data: prData.prPercentage != null ? [prData.prPercentage , 100 - prData.prPercentage] : [0, 100],
      backgroundColor: ['rgba(10, 30, 100, 1.2)', 'rgba(255, 255, 255, 0.1)'],
      borderColor: ['rgba(10, 30, 100, 1)', 'rgba(10, 30, 100, 1)'],
      borderWidth: 2
    }]
  };
  
  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${prData.prPercentage != null ? parseFloat(prData.prPercentage).toFixed(2) : '0.00'}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: 'PR Percentage',
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  };
  
  const pr_plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2 + 20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];
  const merged_prDataChart = {
    labels: ['User Merged_PR',
      'Other'],
    datasets: [{
      ata: merged_prData.Merged_prPercentage != null ? [(merged_prData.Merged_PR/merged_prData.totalusers_PR)*100 , 100 - (merged_prData.Merged_PR/merged_prData.totalusers_PR)*100] : [0, 100],
      backgroundColor: ['rgba(140, 250, 100, 1.2)', 'rgba(255, 255, 255, 0.1)'],
      borderColor: ['rgba(140, 250, 100, 1)', 'rgba(140, 250, 100, 1)'],
      borderWidth: 2
    }]
  };
  
  const merged_PRoptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${merged_prData.Merged_prPercentage != null ? parseFloat(merged_prData.Merged_prPercentage).toFixed(2) : '0.00'}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: 'Merged_PR Percentage',
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  };
  
  const merged_pr_plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2 + 20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];
  const commentsDataChart = {
    labels: ['User Comments', 'Other'],
    datasets: [{
      data: commentsData.CommentsPercentage  != null ? [commentsData.CommentsPercentage , 100 - commentsData.CommentsPercentage ] : [0, 100],
      backgroundColor: ['rgba(128, 175, 128, 1.2)', 'rgba(255, 255, 255, 0.1)'],
      borderColor: ['rgba(128, 175, 128, 1)', 'rgba(128, 175, 128, 1)'],
      borderWidth: 1
    }]
  };
  
  const commentsoptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${commentsData.CommentsPercentage != null ? parseFloat(commentsData.CommentsPercentage).toFixed(2) : '0.00'}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: 'Comments Percentage',
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  };
  
  const comments_plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2 + 20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];
  const commitsDataChart = {
    labels: ['User Commits', 'Other'],
    datasets: [{
      data: commitsData.CommitsPercentage != null ? [(commitsData.userCommits/commitsData.totalCommits)*100, 100 - (commitsData.userCommits/commitsData.totalCommits)*100] : [0, 100],
      backgroundColor: ['rgba(153, 102, 255, 1.2)', 'rgba(255, 255, 255, 0.1)'],
      borderColor: ['rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 1)'],
      borderWidth: 1
    }]
  };
  
  const commitsoptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${commitsData.CommitsPercentage != null ? parseFloat(commitsData.CommitsPercentage).toFixed(2) : '0.00'}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: 'Commits Percentage',
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  };
  
  const commit_plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2 + 20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];
  const issuesDataChart = {
    labels: ['User Issues', 'Total Lines'],
    datasets: [{
      data: issuesData.IssuesPercentage != null ? [issuesData.IssuesPercentage, 100 - duplicatesData.DuplicatesPercentage] : [0, 100],
      backgroundColor: ['rgba(30, 150, 200, 1.2)', 'rgba(255, 255, 255, 0.1)'],
      borderColor: ['rgba(30, 150, 200, 1)', 'rgba(30, 150, 200, 1)'],
      borderWidth: 2
    }]
  };
  
  const issuesoptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${issuesData.IssuesPercentage != null ? parseFloat(issuesData.IssuesPercentage).toFixed(2) : '0.00'}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: 'Issues Percentage',
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  };
  
  const issue_plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2 + 20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];
  const duplicatesDataChart = {
    labels: ['User Duplicates', 'Total Lines'],
    datasets: [{
      data: duplicatesData.DuplicatesPercentage != null ? [duplicatesData.DuplicatesPercentage, 100 - duplicatesData.DuplicatesPercentage] : [0, 100],
      backgroundColor: ['rgba(255, 205, 86, 1.2)', 'rgba(255, 255, 255, 0.1)'],
      borderColor: ['rgba(255, 205, 86, 1)', 'rgba(255, 205, 86, 1)'],
      borderWidth: 2
    }]
  };
  
  const duplicatesoptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${duplicatesData.DuplicatesPercentage != null ? parseFloat(duplicatesData.DuplicatesPercentage).toFixed(2) : '0.00'}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: 'Duplicate Percentage',
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  };
  
  const dup_plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2 + 20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];
 


  

  const barDatachart = {
    labels: ['WhatWhy', 'What', 'Why', 'None'],
    datasets: [
      {
        label: 'Team Quality',
        data: [
          teambarData?.TWhatWhy || 0,
          teambarData?.TWhat || 0,
          teambarData?.TWhy || 0,
          teambarData?.TNone || 0
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Team Quality 색상
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'User Quality',
        data: [
          barData?.WhatWhy || 0,
          barData?.What || 0,
          barData?.Why || 0,
          barData?.None || 0
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // User Quality 색상
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== undefined) {
              label += `${context.raw}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Categories'
        },
        grouped: true
      },
      y: {
        title: {
          display: true,
          text: 'Values'
        },
        beginAtZero: true
      }
    }
  };
  const totalGrammarData = {
    labels: ['Total Grammar'],
    datasets: [
      {
        data: [grammardata.totalGrammar || 0, 100 - (grammardata.totalGrammar || 0)],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 255, 255, 0.1)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const userGrammarData = {
    labels: ['User Grammar'],
    datasets: [
      {
        data: [grammardata.userGrammar || 0, 100 - (grammardata.userGrammar || 0)],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 255, 255, 0.1)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const grammeroptions = (titleText, percentage) => ({
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: {
        text: `${titleText.includes('Total') ? grammardata.totalGrammar : grammardata.userGrammar || 0}%`,
        color: '#000000',
        fontStyle: 'Arial',
        sidePadding: 20,
      },
      title: {
        display: true,
        text: titleText,
        font: {
          size: 20,
        },
      },
    },
    cutout: '70%',
  });

  const plugins = [
    {
      id: 'centerText',
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.centerText) {
          const ctx = chart.ctx;
          const centerConfig = chart.config.options.plugins.centerText;
          const fontSize = (chart.height / 114).toFixed(2);
          ctx.font = `${fontSize}em ${centerConfig.fontStyle}`;
          ctx.textBaseline = 'middle';
          const text = centerConfig.text;
          const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
          const textY = Math.round(chart.height / 2+20);
          ctx.fillStyle = centerConfig.color;
          ctx.fillText(text, textX, textY);
        }
      },
    },
  ];

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
        <div className="repo-info">
          <h2 className="repo-name">{repoName} Repository</h2>
          {prData.prPercentage !== null && (
            <h3 className="repo-type">{prData.prPercentage > 0 ? 'Team Repository' : 'Personal Repository'}</h3>
          )}
        </div>
        <div className="info-boxset">
        <div className="info-boxx">
          <h3>Used Language</h3>
          <p>{programLanguages.join(', ')}</p> {/* 언어들을 쉼표로 구분하여 표시 */}
        </div>
        <div className="info-boxx">
          <h3>Used Framework</h3>
          <p>{framework.join(', ')}</p> {/* 프레임워크들을 쉼표로 구분하여 표시 */}
        </div>
        </div>
      </Element>

      <Element name="section-two">
      
        <h2 className="section-container">Repository info</h2>
          <>
            <div className="team-chart-with-info">
	            <div className="team-chart-and-info-container">
              {prData.prPercentage === '0.00' ? (
  <div className="team-chart-and-info-container">
    <img src={imageData} alt="No Data Available" style={{ width: '300px', height: 'auto' }} />
    <div className="team-info-box">
      <h3>Total PR</h3>
      <p>해당 프로젝트는 Total PR 데이터가 없습니다.</p>
    </div>
  </div>
) : (
  <div className="team-chart-and-info-container">
    <div className="team-chart-container">
      <Doughnut data={PullRequestData} options={options} plugins={pr_plugins} />
    </div>
    <div className="team-info-box">
      <h3>Total PR</h3>
      <p>총 PR: {prData.totalPR}</p>
      <p>사용자 PR: {prData.userPR}</p>
      <p>PR 비중:  {prData.prPercentage }</p>
    </div>
  </div>
)}
              </div>
	          <div className="team-chart-and-info-container">
            {merged_prData.Merged_prPercentage === '0.00' ? (
  <div className="team-chart-and-info-container">
    <img src={imageData} alt="No Data Available" style={{ width: '300px', height: 'auto' }} />
    <div className="team-info-box">
      <h3>Total Merged PR</h3>
      <p>해당 프로젝트는 Total Merged PR 데이터가 없습니다.</p>
    </div>
  </div>
) : (
  <div className="team-chart-and-info-container">
    <div className="team-chart-container">
      <Doughnut data={merged_prDataChart} options={merged_PRoptions} plugins={merged_pr_plugins} />
    </div>
    <div className="team-info-box">
      <h3>Total Merged_PR</h3>
      <p>총 PR: {merged_prData.totalusers_PR}</p>
      <p>병합된 PR: {merged_prData.Merged_PR}</p>
      <p>병합된 PR 비중:  {merged_prData.Merged_prPercentage }</p>
    </div>
  </div>
)}
            </div>
            <div className="team-chart-and-info-container">
            {issuesData.IssuesPercentage === '0.00' ? (
 <div className="team-chart-and-info-container">
    <img src={imageData} alt="No Data Available" style={{ width: '300px', height: 'auto' }} />
    <div className="team-info-box">
      <h3>Total Issues</h3>
      <p>해당 프로젝트는 Total Issues 데이터가 없습니다.</p>
    </div>
  </div>
) : (
  <div className="team-chart-and-info-container">
    <div className="team-chart-container">
    <Doughnut data={issuesDataChart} options={issuesoptions} plugins={issue_plugins} />
    </div>
    <div className="team-info-box">
      <h3>Total Issues</h3>
      <p>총 issues: {issuesData. totalIssues}</p>
      <p>사용자 issues : {issuesData.userIssues}</p>
      {/* 배열의 각 요소를 개별적으로 렌더링합니다. */}
      <p>issues 비율:  {issuesData.IssuesPercentage }</p>
    </div>
  </div>
)}
            </div>
            </div>
            <div className="all-chart-with-info">
            <div className="chart-and-info-container">
              {commitsData.CommitsPercentage === '0.00' ? (
                <div className="chart-and-info-container">
                <img src={imageData} alt="No Data Available" style={{ width: '300px', height: 'auto' }} />
                  <div className="info-box">
                  <h3>Total Commits</h3>
                  <p>해당 프로젝트는 Total Commits 데이터가 없습니다.</p>
                  </div>
                </div>
                ) : (
              <div className="chart-and-info-container">
                <div className="chart-container">
                <Doughnut data={commitsDataChart} options={commitsoptions} plugins={commit_plugins} />
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
       <Doughnut data={commentsDataChart} options={commentsoptions} plugins={comments_plugins} />
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
      <Doughnut data={duplicatesDataChart} options={duplicatesoptions} plugins={dup_plugins} />
      </div>
     <div className="info-box">
     <h3>Duplicates</h3>
      <p>총 라인수: {duplicatesData. total_lines}</p>
      <p>중복 라인수 : {duplicatesData.userDuplicates}</p>
      {/* 배열의 각 요소를 개별적으로 렌더링합니다. */}
      <p>중복 비율:  {duplicatesData.DuplicatesPercentage }</p>
        </div>
       </div>
      </div>
          </>
      </Element>

      <Element name="section-three">
      
          <h2 className="section-container">Complexity</h2>
          <div className="complex-line-chart-and-info-container">
           <div className="complex-line-chartBox">
             <Line data={complexityData} options={{ responsive: true, scales: { x: { title: { display: true, text: 'Complexity Level' } }, y: { title: { display: true, text: 'Count of Lines' } } }}} />
            </div>
          <div className="complex-line-info-box">
           <ul>
            {complexityData.labels.map((label, index) => (
             <li key={index}>
              {`Complexity Level ${label}:`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`${complexityData.datasets[0].data[index]} lines`}</li>
           ))}
           </ul>
            </div>
          </div>
          <div className="complex-dough-chart-and-info-container">
        <div className="complex-dough-container">
          <Doughnut data={complexDoughnutData} options={doughnutOptions} />
        </div>
        <div className="complex-dough-info-box">
        <h3>Complexity Distribute</h3>
          <p>Green (1-10): {complexDoughnutData.datasets[0].data[0]}</p>
          <p>Yellow (11-20): {complexDoughnutData.datasets[0].data[1]}</p>
          <p>Red (21+): {complexDoughnutData.datasets[0].data[2]}</p>
        </div>
      </div>
     
      </Element>
         

      <Element name="section-four">
      
      <h2 className="section-container">Commit message</h2>
      <div className="grammer-chart-and-info-container">
        <div className="grammer-doughnut-chart-container">
          <Doughnut
            data={totalGrammarData}
            options={grammeroptions('Total Grammar', grammardata.totalGrammar || 0)}
            plugins={plugins}
          />
        </div>
        <div className="grammer-doughnut-chart-container">
          <Doughnut
            data={userGrammarData}
            options={grammeroptions('User Grammar', grammardata.userGrammar || 0)}
            plugins={plugins}
          />
        </div>
      </div>
  <div className="bar-chart-with-info">
  <div className="bar-chart-and-info-container">
      
  
      
              
    
    <div className="bar-chart-container">
        <Bar data={barDatachart} options={barDataoptions} />
      </div>
      <div className="bar-chart-info-box">
     <h3>Commit Message Chart</h3>
       <p>Total What+Why: {teambarData.TWhatWhy} <br /> User What+Why: {barData.WhatWhy}</p>
        <p>Total No What: {teambarData.TWhy} &nbsp;&nbsp;&nbsp;  User No What:{barData.Why}</p>
       <p>Total No Why: {teambarData.TWhat} &nbsp;&nbsp;&nbsp;  User No Why: {barData.What}</p>
       <p>Total Neither Why nor What: {teambarData.TNone} <br />  User Neither Why nor What: {barData.None} </p>
      </div>
      </div>
  </div>
 
</Element>
    </Fragment>
  </div>
  </div>
  </div>
  );

};

export default RepositoryDetailPage;