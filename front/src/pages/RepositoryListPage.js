import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryListPage.css";
import axios from 'axios';

function RepositoryListPage() {
  const [repositories, setRepositories ] = useState([]);
  const [userInput, setUserInput ] = useState("");
  const [userType, setUserType ] = useState("");
  const [userLanguage, setUserLanguage ] = useState("");
  const [userEct, setUserEct ] = useState("");

  const [data, setData] = useState({ repositories: [], fileData: {}, isLoading: true });
  // const [data, setData] = useState({ repositories: [] });
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
    if (location.state) {
      const { username, organizations } = location.state;
      // 백엔드에 요청 보내기
      axios.post('http://localhost:5000/api/input', { username, organizations })
        .then(response => {
          setData({ repositories: response.data.repositories,file_data: response.data.filtered_files,isLoading: false });
        })
        .catch(error => {
          console.error('Error fetching repositories', error);
          setData({ ...data, isLoading: false });
        });
    }
  }, [location]);
  
  
  // useEffect(() => {
  //   if (location.state) {
  //     setData({
  //       repositories: location.state.repositories,
  //       // fileData: location.state.fileData
  //     });
  //   }
  // }, [location.state]);

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
        {data.isLoading ? (
          <div>데이터 처리 중...</div>
        ) : (
          <CardList className="repository-list" repositories={data.repositories} />
        )}
      </div>
    </div>
  );
}

export default RepositoryListPage;



// function Repositories() {
//   const [repositories, setRepositories ] = useState([]);
//   const [userInput, setUserInput ] = useState("");
//   const [userType, setUserType ] = useState("");
//   const [userLanguage, setUserLanguage ] = useState("");
//   const [userEct, setUserEct ] = useState("");

//   // 드롭다운의 옵션들 선언
//   const type_options = [
//     { value: "", label: "All" },
//     { value: "Sincere@april.biz", label: "Private" },
//     { value: "Nathan@yesenia.net", label: "Public" },
//   ]
//   const language_options = [
//     { value: "", label: "All" },
//     { value: "hildegard.org", label: "Private" },
//     { value: "jacynthe.com", label: "Public" },
//   ]
//   const ect_options = [
//     { value: "", label: "All" },
//     { value: "Kulas Light", label: "Private" },
//     { value: "Kattie Turnpike", label: "Public" },
//   ]

//   const navigate = useNavigate();
//   const handleEnterButton = () => {
//     navigate("/main");
//   }
//   // 드롭다운의 스타일
//   const optionStyles = {
//     control: (baseStyles, state) => ({
//       ...baseStyles,
//       backgroundColor: "#000000",
//       color: state.isFocused ? "#FFFFFF" : "#FFFFFF",
//     }),
//     option: (baseStyles, state) => ({
//       ...baseStyles,
//       backgroundColor: state.isFocused ? "#e2e2e2" : "",
//       color: state.isFocused ? "#333333" : "#FFFFFF",
//     }),
//     menu: (baseStyles, state) => ({
//       ...baseStyles,
//       backgroundColor: "#333333",
//     }),
//   }
  
//   // 페이지에서 데이터 수집
//   useEffect(() => {
//     fetch("https://jsonplaceholder.typicode.com/users", {
//       method: "GET",
//     })
//       .then((res) => res.json()) 
//       .then((result) => { 
//         setRepositories(result); 
//     });
//   }, []);

//   // 검색창에 값 입력시 입력한 값을 검색창에 출력
//   const handleUserInputChange = (e) => {
//     setUserInput(e.target.value);
//   }
//   // 드롭다운 선택시 onchange
//   const handleUserTypeChange = (selectedOption) => {
//     setUserType(selectedOption.value);
//   }
//   const handleUserLanguageChange = (selectedOption) => {
//     setUserLanguage(selectedOption.value);
//   }
//   const handleUserEctChange = (selectedOption) => {
//     setUserEct(selectedOption.value);
//   }
//   // 검색창에 입력된 값과 드롭다운 선택값들과 일치하는 데이터를 필터링
//   // const filteredRepositories = repositories.filter(((repositories) => {
//   //   const userInputMatch = repositories.name.toLowerCase().includes(userInput.toLowerCase());
//   //   const TypeMatch = repositories.email.toLowerCase().includes(userType.toLowerCase());
//   //   const LanguageMatch = repositories.website.toLowerCase().includes(userLanguage.toLowerCase());
//   //   const EctMatch = repositories.address.street.toLowerCase().includes(userEct.toLowerCase());

//   //   return userInputMatch && TypeMatch && LanguageMatch && EctMatch;
//   // }));

//   return (
//     <div>
//       <div className="top-bar">
//         <button onClick={handleEnterButton} className="home-button">Home</button>
//         <button onClick={handleEnterButton} className="log-out-button">Log out</button>
//         <button className="about-us-button">About us</button>
//       </div>

//       <div className="search-bar-background">
//         <label>
//           <input
//             className="search-bar"
//             type="text"
//             value={userInput}
//             onChange={handleUserInputChange}
//             placeholder=" Search"
//           />
//         </label>
//         <div className="select">
//           <Select options={type_options} styles={optionStyles} placeholder="Type" onChange={handleUserTypeChange} className="select-type"/>
//           <Select options={language_options} styles={optionStyles} placeholder="Language" onChange={handleUserLanguageChange}/>
//           <Select options={ect_options} styles={optionStyles} placeholder="Ect" onChange={handleUserEctChange}/>
//         </div>
//       </div>

//       <div className="repository-list-field" >
//         <CardList className="repository-list" repositories={data.repositories} />
//       </div>
//     </div>
//   );
// }

// export default Repositories;