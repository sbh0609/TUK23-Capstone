import React, { useState, useEffect } from "react";
import Select from "react-select";
import CardList from "./components/CardList";
import "./App.css";

function Repositories() {
  const [repositories, setRepositories ] = useState([]);
  const [userInput, setUserInput ] = useState("");

  // 드롭다운의 옵션들 선언
  const type_options = [
    { value: "Sincere@april.biz", label: "All" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]
  const language_options = [
    { value: "Shanna@melissa.tv", label: "All" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]
  const ect_options = [
    { value: "Nathan@yesenia.net", label: "All" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]
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

  // 페이지에서 데이터 수집
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users", {
      method: "GET",
    })
      .then((res) => res.json()) 
      .then((result) => { 
        setRepositories(result); 
    });
  }, []);

  // 검색창에 값 입력시 입력한 값을 검색창에 출력
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  }
  // 검색창에 입력된 값과 일치하는 데이터를 필터링
  const filteredRepositories = repositories.filter(((repositories) => {
    return repositories.name.toLowerCase().includes(userInput.toLowerCase());
  }));

  return (
    <div>
      <div className="top-bar">
        <button className="home-button">Home</button>
        <button className="log-out-button">Log out</button>
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
          <Select options={type_options} styles={optionStyles} placeholder="Type" className="select-type"/>
          <Select options={language_options} styles={optionStyles} placeholder="Language"/>
          <Select options={ect_options} styles={optionStyles} placeholder="Ect"/>
        </div>
      </div>

      <div className="repository-list-field" >
        <CardList className="repository-list" repositories={filteredRepositories} />
      </div>
    </div>
  );
}

export default Repositories;