import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import { useMaintainPage } from '../Context/MaintainPage';
import React, { useState, useEffect } from "react";

function MainPage() {
  const navigate = useNavigate();
  const { clearData } = useMaintainPage();
  const handleEnterButton = () => {
    if (sessionStorage.getItem('userID') == null) {
      navigate("/login1");
    }
    //else {
      //navigate("/loginUserDefault")
    //}
  }
  
  useEffect(()=>{
    clearData();
  },[]);
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
          <button onClick={handleEnterButton} className='move-button'>Move</button>
        </div>
    );
}

export default MainPage;
