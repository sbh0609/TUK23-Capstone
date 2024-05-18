import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./MyPage.css";
import axios from 'axios';
import { useMaintainPage } from '../Context/MaintainPage'; // Context를 가져옵니다.
import gifLoading from '../resources/Loading_icon.gif';

function LoginUserDefault() {
  const session_userID = sessionStorage.getItem("userID");
  const [userInput, setUserInput ] = useState("");
  const [userType, setUserType ] = useState("");
  const [userLanguage, setUserLanguage ] = useState("");
  const [userEct, setUserEct ] = useState("");
  const [username, setUsername ] = useState("");
  // const [repositoryClassification, setData] = useState({ personal_list: [], team_list: [],globusername:''});

  const { repositoryListData, setRepositoryListData } = useMaintainPage(); // Context 사용
  const { repositories, file_data, isLoading,team_list,personal_list,globusername } = repositoryListData; // Context 데이터 분해 할당
  const location = useLocation();
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
    navigate("/main");
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

  useEffect(() => {
    const fetchData = async () => {
      if (session_userID === null) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login'); // 예: 로그인 상태에 따라 다른 페이지로 이동
      } 
      else {
        console.log("userID :", session_userID);
        const response1 = await axios.post('http://localhost:5000/api/own_repo', { session_userID })
      
        const response1Data = response1.data;
        const fetchedResponseData = response1Data.username
        setUsername(fetchedResponseData);


        console.log("username:", username);
      }
    }
    fetchData();
  }, [session_userID, navigate]);

  // 검색창에 값 입력시 입력한 값을 검색창에 출력
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
  return (
    <div>
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

      <div className="repository-list-field" >

        {isLoading ? (
          <div className="loading">
            <img src={gifLoading} alt="GIF" className="gifLoading" />
            <div className="loading-title" >Load Repositories...</div>
            <div className="loading-explain">
              commit 수와 의존성 파일 유무를 통해<br />
              분석할 repository들을 선별하고 있습니다.
            </div>
          </div>
        ) : (
          <CardList 
            repositories={username}   
            /*repositories={repositories} 
            file_data={file_data} 
            username = {globusername}
            personal_list = {personal_list}
            team_list = {team_list}*/
          />
        )}
      </div>
    </div>
  );
}

export default LoginUserDefault;