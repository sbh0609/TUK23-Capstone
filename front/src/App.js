import React from 'react';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RepositoryListPage from './pages/RepositoryListPage';
import AboutUsPage from './pages/AboutUsPage'
import RepositoryDetailPage from './pages/RepositoryDetailPage'
import { RepositoryProvider } from './Context/RepositoryContext'; // 방금 만든 컨텍스트를 가져옵니다
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RepositoryListProvider } from './Context/MaintainPage';
import LoginSelectPage from './pages/LoginSelectPage';
import Temptemp from './pages/Temptemp';
import Validation from './login/Validation';
import Register from './pages/RegisterPage';
import DBtest from './tests/dbtest';

function App(){
  return (
    <RepositoryProvider>
      <RepositoryListProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/main' element={<MainPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/repository' element={<RepositoryListPage />} />
            <Route path='/aboutUs' element={<AboutUsPage />} />
            <Route path='/repositoryDetail' element={<RepositoryDetailPage/>} />
            <Route path='/loginSelect' element={<LoginSelectPage/>} />
            <Route path='/tempTemp' element={<Temptemp/>} />
            <Route path='/validation' element={<Validation/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/dbtest' element={<DBtest/>} />

            <Route index element={<MainPage />} />
          </Routes>
        </BrowserRouter>
      </RepositoryListProvider>
    </RepositoryProvider>
  )
}

export default App;
