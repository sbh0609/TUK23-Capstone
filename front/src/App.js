import React from 'react';
import MainPage from './pages/MainPage';
import Login from './login/Login';
import Register from './login/RegisterPage';
import LoginSelectPage from './pages/LoginSelectPage';
import MyPage from './myPage/MyPage';
import MyPageDetail from './myPage/MyPageDetail';
import Search from './repositories/RepositorySearchPage';
import RepositoryListPage from './repositories/RepositoryListPage';
import RepositoryDetailPage from './repositories/RepositoryDetailPage'
import AboutUsPage from './pages/AboutUsPage'
import { RepositoryProvider } from './Context/RepositoryContext'; // 방금 만든 컨텍스트를 가져옵니다
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RepositoryListProvider } from './Context/MaintainPage';
import DBtest from './tests/dbtest';
import Test from './tests/test';
import Test2 from './tests/test2';

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
            <Route path='/myPage' element={<MyPage/>} />
            <Route path='/myDetail' element={<MyPageDetail/>} />
            <Route path='/search' element={<Search />} />
            <Route path='/list' element={<RepositoryListPage />} />
            <Route path='/detail' element={<RepositoryDetailPage/>} />
            <Route path='/aboutUs' element={<AboutUsPage />} />
            <Route path='/dbtest' element={<DBtest/>} />
            <Route path='/test' element={<Test/>} />
            <Route path='/test2' element={<Test2/>} />

            <Route index element={<MainPage />} />
          </Routes>
        </BrowserRouter>
      </RepositoryListProvider>
    </RepositoryProvider>
  )
}

export default App;
