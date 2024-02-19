import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import axios from 'axios';

function fetchData() {
  axios.get('http://localhost:5000')
    .then(response => {
      // 응답 처리
      console.log(response.data);
    })
    .catch(error => {
      // 오류 처리
      console.error('There was an error!', error);
    });
}
function Main() {
  const navigate = useNavigate();
  const handleEnterButton = () => {
    fetchData();
    navigate("/login");
  }
  return (
        <div className="main">
          <div className="background">
            <video className="background-video" autoPlay loop muted>
              <source src="background1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
  
          <header className="main-header">
            <p>
              Get analyzed your repositories
            </p>
          </header>
  
          <p className="main-paragraph">
            Evaluate your Code{'\n'}
            Check your project's skills{'\n'}
            Explore your Collaborative potential
          </p>
          <button onClick={handleEnterButton} className='move-button'></button>
        </div>
    );
}

export default Main;
