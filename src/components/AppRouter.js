import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RepositoriesPage from '../pages/RepositoriesPage';

const AppRouter = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/LoginPage">LoginPage</Link>
            </li>
            <li>
              <Link to="/RepositoriesPage">RepositoriesPage</Link>
            </li>
          </ul>
        </nav>

        <hr />

        <Routes>
          <Route exact path="/LoginPage" element={<LoginPage />} />
          <Route path="/RepositoriesPage" element={<RepositoriesPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;