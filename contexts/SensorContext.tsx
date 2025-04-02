import React, { createContext, useContext, useState, useCallback } from 'react';

export async function savePredictionExternally(prediction: any) {
  console.log("Prédiction enregistrée en background :", prediction);
}


type SensorContextType = {
  gesture: { name: string | null, timestamp: number }
  updatePrediction: (gestureIndex: string | null) => void;
};

const SensorContext = createContext<SensorContextType>({
  gesture: { name: null, timestamp: Date.now() },
  updatePrediction: () => { },
});

export const useSensor = () => useContext(SensorContext);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [predictedGesture, setPredictedGesture] = useState<{ name: string | null, timestamp: number }>({ name: null, timestamp: Date.now() });

  const updatePrediction = useCallback((name: string | null) => {
    console.log('Predicted gesture:', name);
    setPredictedGesture({ name, timestamp: Date.now() });
  }, []);

  return (
    <SensorContext.Provider value={{
      gesture: predictedGesture,
      updatePrediction
    }}>
      {children}
    </SensorContext.Provider>
  );
};