import React, { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";
import Card from "../components/Card";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';

const RepositoryDetailPage = () => {
  const { repositoryDetail } = useRepository();
  const { repo_name, fileList, username, repo_type } = repositoryDetail;
  const [programLanguages, setProgramLanguages] = useState([]);
  const [repoName, setRepoName] = useState('');
  const [framework, setFramework] = useState([]);
  const [prData, setPRData] = useState({
    totalPR: null,
    userPR: null,
    prPercentage: null
});
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
    axios.post('http://localhost:5000/api/analyze',{repo_name,username,fileList,repo_type})
      .then(response=>{
        console.log(response);
            setProgramLanguages(response.data.program_lang);
            const responseData = JSON.parse(response.config.data);
            setRepoName(responseData.repo_name);
            setFramework(response.data.framework);
            const { pr_per } = response.data;
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
          })
      .catch(error => {
        console.error('Error analyzing repositories', error);
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
  return (
    
    <div  className="RepositoryDetailPage" >
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
      
      <div className="repo-info">
      <h2 className="repo-name">{repoName} Repository</h2>

      

      {prData.prPercentage !== null && (
        <h3 className="repo-type">{prData.prPercentage > 0 ? 'Team Repository' : 'Personal Repository'}</h3>

      )}
      </div>
    <div className="info-box">
      <h3>Used Language</h3>
      <p>{programLanguages.join(', ')}</p> {/* 언어들을 쉼표로 구분하여 표시 */}
    </div>

    <div className="info-box">
      <h3>Used Framework</h3>
      <p>{framework.join(', ')}</p> {/* 프레임워크들을 쉼표로 구분하여 표시 */}
    </div>
     {/* 도넛 차트 추가 */}
     {prData.prPercentage  != null && (
      <>
    <div className="chart-container">
     <Doughnut data={doughnutData} options={options} />
    </div>
    <div className="pr-info-box">
    <h3>Total PR</h3>
    <p>총 PR: {prData.totalPR}</p>
    <p>사용자 PR: {prData.userPR}</p>
    {/* 배열의 각 요소를 개별적으로 렌더링합니다. */}
    <p>PR 비중:  {prData.prPercentage }</p>
      </div>
      </>
    )};
    </div>
  );
};
export default RepositoryDetailPage;