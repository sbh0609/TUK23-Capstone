import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";
import Card from "../components/Card";

function RepositoryDetailPage() {
  // 페이지 이동
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state.name;
  const url = location.state.url;
  const data = location.state.data;

  console.log("data:", data);

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

      <div className="repository-list-field" >
        <Card
            value={data}
            name={name}
            url={url}
          />
      </div>
    </div>
  );
}

export default RepositoryDetailPage;