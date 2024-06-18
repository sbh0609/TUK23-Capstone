import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Select from "react-select";
import MyPageCardList from "./MyPageCardList";
import "./MyPage.css";
import axios from 'axios';
import { useMaintainPage } from '../Context/MaintainPage'; // Context를 가져옵니다.
import gifLoading from '../resources/Loading_icon.gif';
import homeIcon from '../resources/home-icon.png';
import magnifierIcon from '../resources/magnifier-icon.png';
import profileIcon from '../resources/profile-icon.png';
import informationIcon from '../resources/information-icon.png';
import bookmarkIcon from '../resources/bookmark-icon.png';
import arrowScrollUpIcon from '../resources/arrow-scroll-up-icon.png';
import arrowScrollDownIcon from '../resources/arrow-scroll-down-icon.png';
import listIcon from '../resources/list-icon.png';

function MyPage() {
  const session_userID = sessionStorage.getItem("userID");

  const [userInput, setUserInput ] = useState("");
  const [userType, setUserType ] = useState("");
  const [userLanguage, setUserLanguage ] = useState("");
  const [userEct, setUserEct ] = useState("");
  const [isListButtonActive, setIsListButtonActive] = useState(false); 
  const [username, setUsername ] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // const [repositoryClassification, setData] = useState({ personal_list: [], team_list: [],globusername:''});
  const [repoNames, setRepoNames] = useState([]);
  const [repoType, setRepoType] = useState([]);
  const [repoSelectedTime, setRepoSelectedTime] = useState([]);
  const [repoContributorNames, setRepoContributorNames] = useState([]);
  const [repoMainLang, setRepoMainLang] = useState([]);
  const [repoFrameworks, setRepoFrameworks] = useState([]);
  const [get_data, setGetData] = useState([]);
  const [get_data2, setGetData2] = useState([]);

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
  const handleLogOutButton = () => {
    sessionStorage.removeItem("userID");
    navigate("/login");
  }
  const handleProfileButton = () => {
    navigate("/myPage");
  }
  const handleSearchButton = () => {
    navigate("/search")
  }
  const handleGoListButton = () => {
    navigate("/list")
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
    const fetchData = async () => {
      if (!session_userID) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
      } else {
        console.log("(myPage) userID :", session_userID);
        try {
          const response = await axios.post('http://localhost:5000/api/myPage', { session_userID });
          const get_data = response.data.user_repos;
          const get_data2 = response.data.user_eval_repos;
          setGetData(get_data);
          setGetData2(get_data2);
          console.log("fdsf ", get_data);
          console.log("sdf ", get_data2);
          if (get_data.error) {
            console.error("Error from server:", get_data.error);
            alert("서버 오류: " + get_data.error);
          } else {
            console.log("get_data : ", get_data);

            const repo_names = get_data.map(item => item.repo_name);
            setRepoNames(repo_names);
            const repo_type = get_data.map(item => item.repo_type);
            setRepoType(repo_type);
            const repo_selected_time = get_data.map(item => item.repo_selected_time);
            setRepoSelectedTime(repo_selected_time);

            console.log("레포 네임 :  ", repoNames);
            console.log("레포 타입 :  ", repoType);
            console.log("레포 타임 :  ", repoSelectedTime);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false); // 데이터 요청 완료 후 로딩 상태 해제
          console.log("isLoading set to false");
        }
      }
    };
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
  const handleListButton = () => {
    setIsListButtonActive(!isListButtonActive);
  }
  return (
    <div>
      <div className="top-bar">
        <button onClick={handleHomeButton} className="top-bar-button home-button">
          <img src={homeIcon} alt="홈 아이콘" className="top-bar-icon home-button-icon"/>
        </button>
        <button onClick={handleSearchButton} className="top-bar-button search-button">
          <img src={magnifierIcon} alt="검색 아이콘" className="top-bar-icon search-button-icon"/>
        </button>

        <div className="top-bar-right">
          <button onClick={handleLogOutButton} className="top-bar-button top-logout-button">로그아웃</button>

          <button className="top-bar-button top-information-button">
            <img src={informationIcon} alt="홈 아이콘" className= "top-bar-icon top-information-button-icon"/>
          </button>
        </div>
      </div>

      <div className="side-bar">
        <div className="side-bar-first-section">
          <button onClick={handleListButton} className="side-list-button">
            <img src={bookmarkIcon} alt="프로필 아이콘" className="side-bar-icon list-button-icon"/> 저장된 저장소 목록
            <img src={isListButtonActive ? arrowScrollUpIcon : arrowScrollDownIcon} alt="프로필 아이콘" className="list-button-icon2" />
          </button>

          <div className="side-bar-first-section2">
  
          </div>
        </div>

        <div className="side-bar-second-section">
          <button onClick={handleGoListButton} className="side-bar-button side-profile-button">
            <img src={listIcon} alt="프로필 아이콘" className="side-bar-icon profile-button-icon"/> 검색 목록
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
          <MyPageCardList 
            repositories={repoNames}
            repo_type={repoType}
            repo_analyzed_data={get_data}
            repo_evaluate_data={get_data2}
          />
        )}
      </div>
    </div>
  );
}

export default MyPage;