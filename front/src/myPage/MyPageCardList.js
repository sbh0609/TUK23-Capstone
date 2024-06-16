import React from 'react';
import Card from "./MyPageCard";
function CardList ({ repositories, repo_type, repo_analyzed_data, repo_evaluate_data }) {

  return (
    <div className="cardList" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      {repositories.map((repository, index) => {
        return (
           <Card
            key={index}
            repo_name={repositories}
            repo_type={repo_type}
            repo_analyzed_data={repo_analyzed_data}
            repo_evaluate_data={repo_evaluate_data}
          />
        );
      })}
    </div>
  );
}

export default CardList;