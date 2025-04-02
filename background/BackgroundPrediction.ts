// background/BackgroundPrediction.ts

import * as TaskManager from 'expo-task-manager';
import { predict } from '../hooks/useSensorPrediction';
import { savePredictionExternally } from '../contexts/SensorContext';

export const BACKGROUND_PREDICTION_TASK = 'background-prediction-task';

//Tâche d'arrière-plan définie pour fonctionner hors React
TaskManager.defineTask(BACKGROUND_PREDICTION_TASK, async () => {
  try {
    const prediction = await predict(
      require('../assets/model/cnn/model.json'),
      require('../assets/model/cnn/group1-shard1of1.bin')
    );

    if (prediction !== null) {
      await savePredictionExternally(prediction);
    }

    return 'newData';
  } catch (error) {
    console.error('Erreur dans la tâche de prédiction en arrière-plan :', error);
    return 'failed';
  }
});
