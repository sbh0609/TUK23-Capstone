import React, { useState, useEffect } from "react";
import Select from "react-select";
import CardList from "./components/CardList";
import "./App.css";

function Repositories() {
  const [repositories, setRepositories ] = useState([]);
  const [userInput, setUserInput ] = useState("");

  const type_options = [
    { value: "all", label: "All" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]
  const language_options = [
    { value: "all", label: "All" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]
  const ect_options = [
    { value: "all", label: "All" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]
  const optionStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: "#000000",
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
    fetch("https://jsonplaceholder.typicode.com/users", {
      method: "GET",
    })
      .then((res) => res.json()) 
      .then((result) => { 
        setRepositories(result); 
    });
  }, []);

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  }
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