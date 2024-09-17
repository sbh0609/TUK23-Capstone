import React, { Fragment, useState, useEffect } from "react";
import 'chart.js/auto';
import "./MyPageDetail.css";
import { useNavigate,useLocation } from "react-router-dom";
import axios from 'axios';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

const MyPageEvaluate = () =>{
    const location = useLocation();
    const { repo_analyzed_data, repo_evaluate_data, repo_name, repo_type, click_time } = location.state || {}; 
    console.log("Location State:", location.state); // useEffect 밖에서 로그 출력

    const session_userID = sessionStorage.getItem("userID");
    const [username, setUsername] = useState('');


    // const [programLang, setProgramLang] = useState(repo_analyzed_data ? repo_analyzed_data.language : '');
    // const [open, setOpen] = useState(false);
    // const [selectedCard, setSelectedCard] = useState(null);
    // const [modalData, setModalData] = useState(null);

    
}