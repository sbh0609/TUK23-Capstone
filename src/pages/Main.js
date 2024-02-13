import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Main() {
  const navigate = useNavigate();
  const handleEnterButton = () => {
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