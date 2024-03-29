import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';
import { useMaintainPage } from '../Context/MaintainPage';

function LoginPage() {
  const [username, setUsername] = useState("");
  // const [passwords, setPasswords] = useState(['']);
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
    navigate("/repository", { state: { username, organizations: organizations.filter(org => org) } });
  };
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
    </div>
    );
}


export default LoginPage;