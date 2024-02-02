import React, { useState } from 'react';
import './App.css';
import Card from './components/Card';

const cardList = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "456-789-0123" },
  // 다른 사용자 데이터...
];

function RepositoriesPage() {
  const [userInput, setUserInput] = useState('');
  const [filteredCards, setFilteredCards] = useState(cardList);

  const handleUserInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);

    const filtered = cardList.filter((itemList) => {
      return itemList.name.toUpperCase().includes(input.toUpperCase());
    });
  
    setFilteredCards(filtered);
  }

  return (
    <div>
      <div className="top-bar">
        <button className="home-button">Home</button>
        <button className="log-out-button">Log out</button>
        <button className="about-us-button">About us</button>
      </div>

      <div className="search-bar-background">
        <label>
          <input
            className="search-bar"
            type="text"
            value={userInput}
            onChange={handleUserInputChange}
            placeholder=" Search"
          />
        </label>
        <button className="search-type-button">Type</button>
        <button className="search-language-button">Language</button>
        <button className="search-temp-button">Ect</button>
      </div>

      <div className="repository-list-field">
        <div className="cardList">
          {filteredCards.map((itemList) => {
            return <Card key={itemList.name} {...itemList} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default RepositoriesPage;