import React from 'react';
import MainPage from './pages/MainPage';
import SearchPage from './repositories/RepositorySearchPage';
import RepositoryListPage from './repositories/RepositoryListPage';
import AboutUsPage from './pages/AboutUsPage'
import RepositoryDetailPage from './repositories/RepositoryDetailPage'
import { RepositoryProvider } from './Context/RepositoryContext'; // 방금 만든 컨텍스트를 가져옵니다
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RepositoryListProvider } from './Context/MaintainPage';
import LoginSelectPage from './pages/LoginSelectPage';
import Register from './login/RegisterPage';
import DBtest from './tests/dbtest';
import Login from './login/Login';
import LoginUserDefault from './login_user_pages/LoginUserDefaultPage';

function App(){
  return (
    <RepositoryProvider>
      <RepositoryListProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/main' element={<MainPage />} />
            <Route path='/search' element={<SearchPage />} />
            <Route path='/repository' element={<RepositoryListPage />} />
            <Route path='/aboutUs' element={<AboutUsPage />} />
            <Route path='/repositoryDetail' element={<RepositoryDetailPage/>} />
            <Route path='/loginSelect' element={<LoginSelectPage/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/dbtest' element={<DBtest/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/loginUserDefault' element={<LoginUserDefault/>} />

            <Route index element={<MainPage />} />
          </Routes>
        </BrowserRouter>
      </RepositoryListProvider>
    </RepositoryProvider>
  )
}

export default App;
