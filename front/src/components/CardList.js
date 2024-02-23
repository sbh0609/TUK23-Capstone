import React from 'react';
import Card from "./Card";
function CardList({ repositories, file_data }) {
  return (
    <div className="cardList" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      {repositories.map((repository, index) => {
        const repositoryName = repository[0];
        const fileList = file_data[repositoryName]; // 해당 레포지토리의 파일 리스트
        return (
          <Card
            key={index}
            name={repositoryName}
            url={repository[1]}
            fileList={fileList}
          />
        );
      })}
    </div>
  );
}

export default CardList;