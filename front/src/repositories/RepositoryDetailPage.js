import React, { Fragment, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Link as ScrollLink, Element } from 'react-scroll';  // Link 컴포넌트 임포트
import imageData from '../resources/image.png';
import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";
import Card from "../components/Card";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';
import Loading from "../components/DetailLoading";

const RepositoryDetailPage = () => {
  const session_userID = sessionStorage.getItem("userID");

  const { repositoryDetail } = useRepository();
  
  const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;


  useEffect(()=>{
    axios.post('http://localhost:5000/api/analyze',{repo_name, username, fileList, repo_type, click_time, session_userID})
      .then(response=>{
        console.log(response);

          })
      .catch(error => {
        console.error('Error fetching data', error);
        console.error('Error analyzing repositories', error);
        window.alert('Error: ' + error);
      });
    
  },[]);

};

export default RepositoryDetailPage;