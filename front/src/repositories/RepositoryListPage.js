import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryListPage.css";
import axios from 'axios';
import { useMaintainPage } from '../Context/MaintainPage'; // Context를 가져옵니다.
import gifLoading from '../resources/Loading_icon.gif';
import homeIcon from '../resources/home-icon.png';
import profileIcon from '../resources/profile-icon.png';
import informationIcon from '../resources/information-icon.png';
import bookmarkIcon from '../resources/bookmark-icon.png';
import arrowScrollUpIcon from '../resources/arrow-scroll-up-icon.png';
import arrowScrollDownIcon from '../resources/arrow-scroll-down-icon.png';

function RepositoryListPage() {
  const session_userID = sessionStorage.getItem("userID");

  const [userInput, setUserInput ] = useState("");
  const [userType, setUserType ] = useState("");
  const [userLanguage, setUserLanguage ] = useState("");
  const [userEct, setUserEct ] = useState("");
  const [isListButtonActive, setIsListButtonActive] = useState(false); 
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
  const handleHomeButton = () => {
    navigate("/main");
  }
  const handleLoginButton = () => {
    navigate("/login");
  }
  const handleProfileButton = () => {
    navigate("/myPage");
  }

  // 드롭다운의 스타일
  const optionStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: "#ffffff",
      color: "#000000",
      border: "none", // 테두리 제거
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none", // 포커스 시 테두리 제거
      '&:hover': {
        borderColor: "#000000",
      },
      width: '150px', // 드롭다운의 너비 설정
      minHeight: '40px', // 드롭다운의 최소 높이 설정
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isFocused ? "#e2e2e2" : "#ffffff",
      color: "#000000",
      '&:hover': {
        backgroundColor: "#e2e2e2",
      },
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: "#ffffff",
    }),
  };

  useEffect(() => {

    if (repositories.length > 0) {
      setRepositoryListData({ ...repositoryListData, isLoading: false });

      return;
    }
    if (location.state) {
      const { username, organizations } = location.state;
      // 백엔드에 요청 보내기
      axios.post('http://localhost:5000/api/input', { username, organizations })
        .then(response => {
          setRepositoryListData({ 
            repositories: response.data.repositories, 
            file_data: response.data.file_data, 
            isLoading: false, 
            personal_list: response.data.personal_list,
            team_list : response.data.team_list,
            globusername : username
          });
          // setData({
          //   personal_list: response.data.personal_list,
          //   team_list : response.data.team_list,
          //   globusername : username

          // })

        })
        .catch(error => {
          console.error('Error fetching repositories', error);
          setRepositoryListData({ ...repositoryListData, isLoading: false });
        });
    }
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
  const handleListButton = () => {
    setIsListButtonActive(!isListButtonActive);
  }

  return (
    <div>
      <div className="top-bar">
        <button onClick={handleHomeButton} className="top-bar-button home-button">
          <img src={homeIcon} alt="홈 아이콘" class="top-bar-icon home-button-icon"/>
        </button>

        <div className="top-bar-right">
          <button onClick={handleLoginButton} className="top-bar-button top-login-button">로그인</button>

          <button className="top-bar-button top-information-button">
            <img src={informationIcon} alt="홈 아이콘" class="top-bar-icon top-information-button-icon"/>
          </button>
        </div>
      </div>

      <div className="side-bar">
        <div className="side-bar-first-section">
          {session_userID ? (
            <button onClick={handleListButton} className="side-list-button">
              <img src={bookmarkIcon} alt="프로필 아이콘" class="side-bar-icon list-button-icon"/> 기존 분석 리스트
              <img src={isListButtonActive ? arrowScrollUpIcon : arrowScrollDownIcon} alt="프로필 아이콘" className="list-button-icon2" />
            </button>
          ) : (
            <div>
              <p className="login-phase">검색한 레포지토리들을 저장하고, 열람하려면 로그인하세요.</p>
              <button onClick={handleLoginButton} className="side-login-button">로그인</button>
            </div>
          )}
        </div>

        <div className="side-bar-second-section">
          <button onClick={handleProfileButton} className="side-bar-button side-profile-button">
            <img src={profileIcon} alt="프로필 아이콘" class="side-bar-icon profile-button-icon"/> 프로필
          </button>
        </div>

        <div className="side-bar-third-section">
          <a href="/information" className="information-hyperlink">
            정보
          </a>
        </div>
      </div>

      <div className="search-bar-background">
        <div className="search-bar-components">
          <label>
              <input
                className="search-bar"
                type="text"
                value={userInput}
                onChange={handleUserInputChange}
                placeholder=" Search"
              />
            </label>
          <div className="search-bar-dropdown">
            <Select options={type_options} styles={optionStyles} placeholder="Type" onChange={handleUserTypeChange}/>
            <Select options={language_options} styles={optionStyles} placeholder="Language" onChange={handleUserLanguageChange}/>
            <Select options={ect_options} styles={optionStyles} placeholder="Ect" onChange={handleUserEctChange}/>
          </div>
        </div>
      </div>

      <div className="repository-list-field" >
        {isLoading ? (
          <div className="loading">
            <img src={gifLoading} alt="GIF" className="gifLoading" />
            <div className="loading-title" >Load Repositories...</div>
            <div className="loading-explain">
              commit 수와 의존성 파일 유무를 통해<br />
              분석할 repository들을 선별하고 있습니다.<br /><br />
            </div>
          </div>
        ) : (
          <CardList 
            repositories={repositories} 
            file_data={file_data} 
            username = {globusername}
            personal_list = {personal_list}
            team_list = {team_list}
          />
        )}
      </div>
    </div>
  );
}

export default RepositoryListPage;