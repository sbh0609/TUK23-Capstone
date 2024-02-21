import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";

function RepositoryDetailPage() {
  // 페이지 이동
  const navigate = useNavigate();
  const location = useLocation();
  const value1 = location.state.value1;
  const value2 = location.state.value2;
  const value3 = location.state.value3;
  console.log(value1, value2, value3);
  const handleLogOutButton = () => {
    navigate("/login");
  }

  return (
    <div>
      <div className="top-bar">
        <button  className="home-button">Home</button>
        <button  className="log-out-button">Log out</button>
        <button  className="about-us-button">About us</button>
      </div>
    </div>
  );
}

export default RepositoryDetailPage;