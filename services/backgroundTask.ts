// backgroundTasks.js
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';


TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    
    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const registerBackgroundFetch = async () => {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15, // Temps minimum en minutes entre chaque exécution
        stopOnTerminate: false, // Continuer la tâche même si l'application est terminée
        startOnBoot: true, // Démarrer la tâche au démarrage de l'appareil
    });
};