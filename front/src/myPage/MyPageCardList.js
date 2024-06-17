import React from 'react';
import MyPageCard from "./MyPageCard";

function MyPageCardList({ repositories, repo_type, repo_analyzed_data, repo_evaluate_data }) {
  return (
    <div className="cardList" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      {repositories.map((repositoryName, index) => (
        <MyPageCard
          key={index}
          repo_name={repositoryName}
          repo_type={repo_type[index]}
          repo_analyzed_data={repo_analyzed_data[index]}
          repo_evaluate_data={repo_evaluate_data[index]}
        />
      ))}
    </div>
  );
}

export default MyPageCardList;