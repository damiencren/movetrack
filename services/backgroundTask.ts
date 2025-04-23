// backgroundTasks.js
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as tf from '@tensorflow/tfjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performPrediction } from './predictionService';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import DatabaseService from '../services/sqlite';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

const mean = [0.804749279, 0.0287554865, 0.0864980163, -0.000636303058, -0.000292296856, -0.000275299412, 0.000506464674, -0.000823780831, 0.000112948439];
const std = [0.41411195, 0.39099543, 0.35776881, 0.19484634, 0.12242748, 0.10687881, 0.40681506, 0.38185432, 0.25574314];

const gestures = [
    'WALKING',
    'WALKING_UPSTAIRS',
    'WALKING_DOWNSTAIRS',
    'SITTING',
    'STANDING',
    'LAYING'
  ];

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        const storedData = await AsyncStorage.getItem('sensorData');
        const sensorData = storedData ? JSON.parse(storedData) : null;

        if (sensorData) {
            const model = await tf.loadGraphModel(bundleResourceIO(require('../assets/model/cnn/model.json'), require('../assets/model/cnn/group1-shard1of1.bin')));
            const prediction = await performPrediction(model, sensorData, mean, std);
            if (prediction !== null) {
                await DatabaseService.addGesture(gestures[prediction]);
            }
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerBackgroundFetch = async () => {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 1, // Temps minimum en minutes entre chaque exécution
        stopOnTerminate: false, // Continuer la tâche même si l'application est terminée
        startOnBoot: true, // Démarrer la tâche au démarrage de l'appareil
    });
};