import React from 'react';
import MainPage from './pages/MainPage';
import Register from './login/RegisterPage';
import Login from './login/Login';
import MyPage from './pages/MyPage';
import SearchPage from './repositories/RepositorySearchPage';
import RepositoryListPage from './repositories/RepositoryListPage';
import AboutUsPage from './pages/AboutUsPage'
import RepositoryDetailPage from './repositories/RepositoryDetailPage'
import { RepositoryProvider } from './Context/RepositoryContext'; // 방금 만든 컨텍스트를 가져옵니다
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RepositoryListProvider } from './Context/MaintainPage';
import LoginSelectPage from './pages/LoginSelectPage';
import DBtest from './tests/dbtest';

function App(){
  return (
    <RepositoryProvider>
      <RepositoryListProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/main' element={<MainPage />} />
            <Route path='/register' element={<Register/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/loginSelect' element={<LoginSelectPage/>} />
            <Route path='/myPage' element={<MyPage/>} />
            <Route path='/search' element={<SearchPage />} />
            <Route path='/repository' element={<RepositoryListPage />} />
            <Route path='/repositoryDetail' element={<RepositoryDetailPage/>} />
            <Route path='/aboutUs' element={<AboutUsPage />} />
            <Route path='/dbtest' element={<DBtest/>} />

            <Route index element={<MainPage />} />
          </Routes>
        </BrowserRouter>
      </RepositoryListProvider>
    </RepositoryProvider>
  )
}

export default App;
