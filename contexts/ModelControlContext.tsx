import React, { createContext, useContext, useState, useCallback } from 'react';

type ModelControlContextType = {
    isRunning: boolean;
    startModel: () => void;
    stopModel: () => void;
  };

const ModelControlContext = createContext<ModelControlContextType | undefined>(undefined);

export const useModelControl = () => {
    const context = useContext(ModelControlContext);
    if (context === undefined) {
      throw new Error('useModelControl must be used within a ModelControlProvider');
    }
    return context;
  };


export const ModelControlProvider : React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);

  const startModel = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopModel = useCallback(() => {
    setIsRunning(false);
  }, []);

  return (
    <ModelControlContext.Provider value={{ isRunning, startModel, stopModel }}>
      {children}
    </ModelControlContext.Provider>
  );
};