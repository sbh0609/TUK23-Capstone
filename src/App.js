import React from 'react';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RepositoryListPage from './pages/RepositoryListPage';
import AboutUsPage from './pages/AboutUsPage'

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/main' element={<MainPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/repository' element={<RepositoryListPage />} />
        <Route path='/aboutUs' element={<AboutUsPage />} />
        <Route index element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
