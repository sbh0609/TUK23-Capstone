import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState(['']);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (index, e) => {
    const newPasswords = [...passwords];
    newPasswords[index] = e.target.value;
    setPasswords(newPasswords);
  };
  const handleAddPasswordButton = () => {
    setPasswords([...passwords, '']);
  }
  const handleEnterButton = () => {
    console.log('Username:', username);
    console.log('Organizations:', passwords);
  }

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
        
        {passwords.map((password, index)=> (
          <div key={index}>
            <label>
              <input
                type="text"
                value={password}
                onChange={(e) => handlePasswordChange(index, e)}
                placeholder={`Organization ${index + 1}`}
               />
            </label> <br />
          </div>
          ))}
          <button onClick={handleAddPasswordButton} className="LoginPage-AddPasswordButton">+ Add Organization</button><br />
          <button onClick={handleEnterButton} className="LoginPage-EnterButton">Enter</button>
      </div>
      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hyperlink-github">Github</a>
    </div>
    );
}


export default LoginPage;