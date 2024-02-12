import React from 'react';
import Card from "./Card";

function CardList({ repositories, onClick }) {

  return (
    <div className="cardList" style={{ display: 'flex', flexWrap: 'wrap',  alignContent: 'flex-start' }}>
      {repositories.map((repositories) => {
        return (
          <Card
            key={repositories.id}
            id={repositories.id}
            name={repositories.name}
            email={repositories.email}
            phone={repositories.phone}
            />
        );
      })}
    </div>
  );
}

export default CardList;