import React from 'react';
import Card from "./Card";
function CardList({ repositories, repositorySelectedTime, repositoryName, repositoryContributorName }) {
  return (
    <div className="cardList" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      {repositories.map((repository, index) => {

        return (
           <Card
            key={index}
            repo_name={repositorySelectedTime}
            fileList={repositoryName}
            username={repositoryContributorName}
            repo_type={'personal'}
          />
        );
      })}
    </div>
  );
}

export default CardList;