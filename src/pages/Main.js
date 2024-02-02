import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import '../src/components/AppRouter.js';
import AppRouter from '../src/components/AppRouter.js';

function App() {
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
        <div className="App">
          <div className="Main-background">
            <video className="background-video" autoPlay loop muted>
              <source src="background1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
  
          <header className="App-header">
            <p>
              Get analyzed your repositories
            </p>
          </header>
  
          <p className="Main-paragraph">
            Evaluate your Code{'\n'}
            Check your project's skills{'\n'}
            Explore your Collaborative potential
          </p>
          
          <div className="LoginComponent-container">
            <label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Username"
              />
            </label>
            <br />
  
            {passwords.map((password, index)=> (
              <div key={index}>
                <label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => handlePasswordChange(index, e)}
                    placeholder={`Organization ${index + 1}`}
                  />
                </label>
                <br />
              </div>
            ))}
            <button onClick={handleAddPasswordButton} className="AddPasswordButton">+ Add Organization</button>
            <br />
            <button onClick={handleEnterButton} className="EnterButton">Enter</button>
          </div>
        </div>
    );
}

export default App;
