import { useEffect, useRef, useState, useCallback } from 'react';
import { Accelerometer, Gyroscope, AccelerometerMeasurement } from 'expo-sensors';
import ButterworthFilter from './butterworthFilter';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const useSensorPrediction = (modelConfig: {
    modelJson: any;
    modelWeights: any;
}) => {
    const BUFFER_SIZE = 128;
    const dataBuffer = useRef<number[][]>([]);
    const bufferLock = useRef(false);
    const modelRef = useRef<tf.GraphModel | null>(null);
    const gyroData = useRef({ x: 0, y: 0, z: 0 });

    // Initialisation des filtres
    const gravityFilter = useRef({
        x: new ButterworthFilter(0.3, 50),
        y: new ButterworthFilter(0.3, 50),
        z: new ButterworthFilter(0.3, 50)
    });

    // Données normalisées (exemple)
    const mean = [0.804749279, 0.0287554865, 0.0864980163, -0.000636303058, -0.000292296856, -0.000275299412, 0.000506464674, -0.000823780831, 0.000112948439];
    const std = [0.41411195, 0.39099543, 0.35776881, 0.19484634, 0.12242748, 0.10687881, 0.40681506, 0.38185432, 0.25574314];

    // Chargement du modèle
    const loadModel = useCallback(async () => {
        if (modelRef.current) {
            console.log('Modèle déjà chargé');
            return;
        }

        await tf.ready();
        try {
            const model = await tf.loadGraphModel(
                bundleResourceIO(modelConfig.modelJson, modelConfig.modelWeights)
            );
            modelRef.current = model;
            console.log('Modèle TensorFlow chargé');
        } catch (error) {
            console.error('Erreur de chargement du modèle:', error);
        }
    }, [modelConfig]);

    // Gestion des données accéléromètre
    const handleAccelerometer = useCallback((data: AccelerometerMeasurement) => {
        const gravity = {
            x: gravityFilter.current.x.process(data.x),
            y: gravityFilter.current.y.process(data.y),
            z: gravityFilter.current.z.process(data.z)
        };

        const bodyAcc = {
            x: data.x - gravity.x,
            y: data.y - gravity.y,
            z: data.z - gravity.z
        };

        const newData = [
            data.x, data.y, data.z,
            bodyAcc.x, bodyAcc.y, bodyAcc.z,
            gyroData.current.x, gyroData.current.y, gyroData.current.z
        ];

        if (!bufferLock.current) {
            dataBuffer.current = [...dataBuffer.current, newData].slice(-BUFFER_SIZE);
        }
    }, []);

    // Prédiction
    const predict = useCallback(async () => {
        if (!modelRef.current || dataBuffer.current.length < BUFFER_SIZE) return null;

        try {
            // Récupérer la fenêtre directement depuis le buffer
            const window = dataBuffer.current.slice(-BUFFER_SIZE);

            const inputTensor = tf.tensor3d([window]);
            const processedTensor = inputTensor.sub(mean).div(std);

            const prediction = modelRef.current.predict(processedTensor);

            if (prediction instanceof tf.Tensor) {
                const output = await prediction.data();
                const predictedIndex = output.indexOf(Math.max(...output));

                // Nettoyer le buffer après prédiction
                dataBuffer.current = dataBuffer.current.slice(-64);

                tf.dispose([inputTensor, processedTensor, prediction]);
                return predictedIndex;
            }
            return null;
        } catch (error) {
            console.error('Erreur de prédiction:', error);
            return null;
        }
    }, [mean, std]); // <-- Ajouter les dépendances nécessaires

    // Initialisation
    useEffect(() => {
        loadModel();
        Accelerometer.setUpdateInterval(20);
        Gyroscope.setUpdateInterval(20);

        const accelerometerSub = Accelerometer.addListener(handleAccelerometer);
        const gyroscopeSub = Gyroscope.addListener((data) => {
            gyroData.current = data;
        });

        return () => {
            accelerometerSub.remove();
            gyroscopeSub.remove();
        };
    }, [handleAccelerometer, loadModel]);

    return { predict };
};

export default useSensorPrediction;