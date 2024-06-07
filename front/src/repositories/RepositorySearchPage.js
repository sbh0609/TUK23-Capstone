import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RepositorySearchPage.css';
import { useMaintainPage } from '../Context/MaintainPage';

function Search() {
  const [username, setUsername] = useState("");
  const [organizations, setOrganiztions] = useState(['']);
  const { clearData } = useMaintainPage();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  
  const handleOrganizationChange = (index, e) => {
    const newOrganiztions = [...organizations];
    newOrganiztions[index] = e.target.value;
    setOrganiztions(newOrganiztions);
  };
  const handleAddOrganiztionButton = () => {
    setOrganiztions([...organizations, '']);
  }
  const navigate = useNavigate();

  const handleSubmit = () => {
    // 데이터 처리 페이지로 바로 이동
    const filteredOrganizations = organizations.filter(org => org);
    const searchData = { username, organizations: filteredOrganizations };
    navigate("/list", { state: searchData });
  };
  // const handleSubmit = () => {
  //   // 데이터 처리 페이지로 바로 이동
   
  //   const filteredOrganizations = organizations.filter(org => org);
  //   const searchData = { username, organizations: filteredOrganizations };
  //   // sessionStorage.setItem('searchData', JSON.stringify(searchData));
  //   navigate("/list", { state: searchData });
  // };
  useEffect(()=>{
    clearData();
  },[]);
  return (
    <div className="LoginPage">
      <div className="LoginPage-Background">
      </div>
      
      <div className="enter-your-github-outer">
        <div className="enter-your-github-inner">
          <p className= "enter-Phrase">Enter your</p>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hyperlink-github">Github</a>
        </div>
      </div>

      <div className="LoginPage-LoginBox">
        <div className="LoginPage-LoginBox-Username">
          <p className="username">Username</p>
          <label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Username"
            />
          </label>
          <p className="organizations">Organizations</p>
        </div>
        
        {organizations.map((organization, index)=> (
          <div key={index} className="organization-box">
            <label>
              <input
                type="text"
                value={organization}
                onChange={(e) => handleOrganizationChange(index, e)}
                placeholder={`Organization ${index + 1}`}
               />
            </label> <br />
          </div>
          ))}
          <button onClick={handleAddOrganiztionButton} className="LoginPage-AddOrganizationButton">+ Add Organization</button><br />
          <button onClick={handleSubmit} className="LoginPage-EnterButton">Enter</button>
      </div>

      <div className="loading-explain">
        <br /><br />입력하신 깃허브 아이디와 조직 이름을 기반으로 분석 가능한 저장소를 찾아냅니다<br /><br />
        입력한 깃허브 아이디에 대한 기준으로 저장소를 분석합니다
      </div>
    </div>
    );
}


export default Search;