import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";
import Card from "../components/Card";
import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
import axios from 'axios';

const RepositoryDetailPage = () => {
  const { repositoryDetail } = useRepository();
  const { repo_name, fileList, username, repo_type } = repositoryDetail;
  useEffect(()=>{
    axios.post('http://localhost:5000/api/analyze',{repo_name,username,fileList,repo_type})
      .then(response=>{
        console.log(response)
      })
      .catch(error => {
        console.error('Error analyzing repositories', error);
      });
  },[]);
    
  return (
    <div>
      {repositoryDetail.fileList}
    </div>
  );
};
export default RepositoryDetailPage;