import React, { createContext, useState, useContext } from 'react';

const RepositoryContext = createContext(null);

export const useRepository = () => useContext(RepositoryContext);

export const RepositoryProvider = ({ children }) => {
  const [repositoryDetail, setRepositoryDetail] = useState({
    name: '',
    fileList: []
  });

  return (
    <RepositoryContext.Provider value={{ repositoryDetail, setRepositoryDetail }}>
      {children}
    </RepositoryContext.Provider>
  );
};
