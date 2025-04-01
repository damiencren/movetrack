import React, { createContext, useContext, useState, useCallback } from 'react';

type SensorContextType = {
  gesture: string | null;
  updatePrediction: (gestureIndex: number | null) => void;
};

const SensorContext = createContext<SensorContextType>({
  gesture: null,
  updatePrediction: () => { },
});

export const useSensor = () => useContext(SensorContext);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [predictedGesture, setPredictedGesture] = useState<number | null>(null);
  const gestures = [
    'WALKING',
    'WALKING_UPSTAIRS',
    'WALKING_DOWNSTAIRS',
    'SITTING',
    'STANDING',
    'LAYING'
  ];

  const updatePrediction = useCallback((gestureIndex: number | null) => {
    setPredictedGesture(gestureIndex);
  }, []);

  return (
    <SensorContext.Provider value={{
      gesture: predictedGesture !== null ? gestures[predictedGesture] : null,
      updatePrediction
    }}>
      {children}
    </SensorContext.Provider>
  );
};