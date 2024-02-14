import React from 'react';
import Main from './pages/Main';
import LoginPage from './pages/LoginPage';
import RepositoryList from './pages/RepositoryList';

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/main' element={<Main />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/repository' element={<RepositoryList />} />
        <Route index element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;