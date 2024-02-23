import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import CardList from "../components/CardList";
import "./RepositoryDetailPage.css";
import Card from "../components/Card";
import { useRepository } from '../components/RepositoryContext'; // Context를 가져옵니다.

const RepositoryDetailPage = () => {
  const { repositoryDetail } = useRepository();

  return (
    <div>
      {repositoryDetail.fileList}
    </div>
  );
};
export default RepositoryDetailPage;