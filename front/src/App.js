import React from 'react';
import MainPage from './pages/MainPage';
import Login from './login/Login';
import Register from './login/RegisterPage';
import LoginSelectPage from './pages/LoginSelectPage';
import Search from './repositories/RepositorySearchPage';
import RepositoryListPage from './pages/RepositoryListPage';
import RepositoryDetailPage from './pages/RepositoryDetailPage'
import AboutUsPage from './pages/AboutUsPage'
import { RepositoryProvider } from './Context/RepositoryContext'; // 방금 만든 컨텍스트를 가져옵니다
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RepositoryListProvider } from './Context/MaintainPage';
import DBtest from './tests/dbtest';

import LoginUserDefault from './login_user_pages/LoginUserDefaultPage';

function App(){
  return (
    <RepositoryProvider>
      <RepositoryListProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/main' element={<MainPage />} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/loginSelect' element={<LoginSelectPage/>} />

            <Route path='/loginUserDefault' element={<LoginUserDefault/>} />

            <Route path='/search' element={<Search />} />
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
