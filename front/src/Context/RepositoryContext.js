import React, { createContext, useState, useContext } from 'react';
const RepositoryContext = createContext(null);
export const useRepository = () => useContext(RepositoryContext);
export const RepositoryProvider = ({ children }) => {
  const [repositoryDetail, setRepositoryDetail] = useState({
    repo_name: '',
    fileList: [],
    username: '',
    repo_type: '',
    click_time: ''
  });
  return (
    <RepositoryContext.Provider value={{ repositoryDetail, setRepositoryDetail }}>
      {children}
    </RepositoryContext.Provider>
  );
};