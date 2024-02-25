import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryListPage.css";
import axios from 'axios';
import { useMaintainPage } from '../Context/MaintainPage'; // Context를 가져옵니다.

function RepositoryListPage() {

  const [userInput, setUserInput ] = useState("");
  const [userType, setUserType ] = useState("");
  const [userLanguage, setUserLanguage ] = useState("");
  const [userEct, setUserEct ] = useState("");
// const [data, setData] = useState({ repositories: [], file_data: {}, isLoading: true });

  const { repositoryListData, setRepositoryListData } = useMaintainPage(); // Context 사용

  const { repositories, file_data, isLoading } = repositoryListData; // Context 데이터 분해 할당
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

    console.log("RepositoryListPage 마운트됨");

  

    if (repositories.length > 0) {

      return;

    }

  
    if (location.state) {

      console.log("백엔드 요청 시작", location.state);
      const { username, organizations } = location.state;

      // 백엔드에 요청 보내기
      axios.post('http://localhost:5000/api/input', { username, organizations })
        .then(response => {


          console.log("백엔드 요청 완료", response.data);

          setRepositoryListData({ 
            repositories: response.data.repositories, 
            file_data: response.data.file_data, 
            isLoading: false 
          });

        })
        .catch(error => {
          console.error('Error fetching repositories', error);

          // 에러 처리

          setRepositoryListData({ ...repositoryListData, isLoading: false });
        });
    }

 

  

    return () => {

      console.log("RepositoryListPage 언마운트됨");

    };

  }, []);

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
          <div>데이터 처리 중...</div>
        ) : (
          <CardList 

            repositories={repositories} 

            file_data={file_data} 
          />
        )}
      </div>
    </div>
  );
}

export default RepositoryListPage;