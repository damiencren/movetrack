import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { savePredictionExternally } from '../contexts/SensorContext';
import useSensorPrediction from '../hooks/useSensorPrediction';

const { predict } = useSensorPrediction({
  modelJson: require('../assets/model/cnn/model.json'),
  modelWeights: require('../assets/model/cnn/group1-shard1of1.bin')
});

export const BACKGROUND_PREDICTION_TASK = 'background-prediction-task';

// Tâche d'arrière-plan définie pour fonctionner hors React
TaskManager.defineTask(BACKGROUND_PREDICTION_TASK, async () => {
  try {
    const prediction = await predict();

    if (prediction !== null) {
      await savePredictionExternally(prediction);
      console.log('Prediction Saved')
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Erreur dans la tâche de prédiction en arrière-plan :', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Configuration de Background Fetch
const registerBackgroundFetchAsync = async () => {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_PREDICTION_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false, // Android only
    startOnBoot: true, // Android only
  });
};

// Appel de la fonction pour enregistrer la tâche
registerBackgroundFetchAsync();