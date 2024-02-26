import React, { createContext, useState, useContext } from 'react';

const RepositoryListContext = createContext(null);
// 이 Hook을 통해 context에 접근할 수 있습니다.
export const useMaintainPage = () => useContext(RepositoryListContext);

// 이 컴포넌트는 context를 제공합니다.
export const RepositoryListProvider = ({ children }) => {
  const [repositoryListData, setRepositoryListData] = useState({
    repositories: [],
    file_data: {},
    isLoading: true
  });
  // 상태를 초기화하는 함수
  const clearData = () => {
    setRepositoryListData({ 
        repositories: [], 
        file_data: {}, 
        isLoading: true ,
        personal_list: [], 
        team_list: [],
        globusername:''})
  };

  return (
    <RepositoryListContext.Provider value={{ repositoryListData, setRepositoryListData, clearData }}>
      {children}
    </RepositoryListContext.Provider>
  );
};