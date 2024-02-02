import React, { useState }  from 'react';
import './App.css';

function RepositoriesPage() {
  const [searchInput, setSearchInput] = useState('');

  const searchData = () => {
    
  }

  return (
    <div>
      <div className="top-bar">
        <button className="home-button">Home</button>
        <button className="log-out-button">Log out</button>
        <button className="about-us-button">About us</button>
      </div>

      <div className="search-bar">

        <button className="search-type-button">Type</button>
        <button className="search-language-button">Language</button>
        <button className="search-temp-button">Ect</button>
      </div>

      <div className="repository-list-field">

      </div>
    </div>
  );
}

export default RepositoriesPage;