import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';

function LoginPage() {
  const [username, setUsername] = useState("");
  // const [passwords, setPasswords] = useState(['']);
  const [organizations, setOrganiztions] = useState(['']);

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
  // const handleEnterButton = () => {
  //   navigate("/repository");
  // }
  const handleSubmit = () => {
    // 데이터 처리 페이지로 바로 이동
    navigate("/repository", { state: { username, organizations: organizations.filter(org => org) } });
  };
  // const handleSubmit = () => {
  //   axios.post('http://localhost:5000/api/input', {
  //     username: username,
  //     organization_list: organizations.filter(org => org) // 빈 문자열 제외
  //   })
  //   .then(response => {
  //     // 여기서 응답 처리
  //     console.log(response.data);
  //     // navigate("/repository", { state: { repositories: response.data.repositories, fileData: response.data.file_data } });
  //     navigate("/repository", { state: { username, organizations: organizations.filter(org => org) } });
  //     // navigate("/repository", { state: { repositories: response.data.repositories } });
  //   })
  //   .catch(error => {
  //     // 오류 처리
  //     console.error('Error submitting data', error);
  //   });
  // };

  return (
    <div className="LoginPage">
      <div className="LoginPage-Background">
      </div>
      
      <p className= "enter-Phrase">Enter your Github</p>
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
          <div key={index}>
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
          {/* <button onClick={handleEnterButton} className="LoginPage-EnterButton">Enter</button> */}
      </div>
      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hyperlink-github">Github</a>
    </div>
    );
}


export default LoginPage;