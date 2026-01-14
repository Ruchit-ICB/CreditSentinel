import React, { createContext, useContext, useState } from 'react';

export interface AIContextType {
  contextData: string;
  contextId: string; // Used to detect page changes
  setContext: (id: string, data: string) => void;
}

const AIContext = createContext<AIContextType>({
  contextData: '',
  contextId: '',
  setContext: () => {},
});

export const useAIContext = () => useContext(AIContext);

export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextData, setContextData] = useState('');
  const [contextId, setContextId] = useState('');

  const setContext = (id: string, data: string) => {
    // Only update if ID changes to prevent infinite loops if called in render (though it should be called in useEffect)
    if (id !== contextId) {
        setContextId(id);
        setContextData(data);
    }
  };

  return (
    <AIContext.Provider value={{ contextData, contextId, setContext }}>
      {children}
    </AIContext.Provider>
  );
};