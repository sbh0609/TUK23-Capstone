import React from 'react';
import Card from "./Card";
function CardList({ repositories, file_data, username,personal_list, team_list }) {
  return (
    <div className="cardList" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      {repositories.map((repository, index) => {
        const repositoryName = repository[0];
        const fileList = file_data[repositoryName]; // 해당 레포지토리의 파일 리스트
        if (personal_list.includes(repositoryName)) {
          // personal_list에 포함된 경우
          return (
            <Card
              key={index}
              repo_name={repositoryName}
              
              fileList={fileList}
              username={username}
              repo_type={'personal'}
            />
          );
        } else if (team_list.includes(repositoryName)) {
          // team_list에 포함된 경우
          return (
            <Card
              key={index}
              repo_name={repositoryName}
              
              fileList={fileList}
              username={username}
              repo_type={'team'}
            />
          );
        }
      })}
    </div>
  );
}

export default CardList;