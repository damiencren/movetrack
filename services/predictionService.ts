// services/predictionService.ts
import * as tf from '@tensorflow/tfjs';

export const performPrediction = async (model : tf.GraphModel<string | tf.io.IOHandler> | null, dataBuffer: number[][], mean: number[], std: number[]) => {
  if (!model || dataBuffer.length < 128) return null;

  try {
    const window = dataBuffer.slice(-128);
    const inputTensor = tf.tensor3d([window]);
    const processedTensor = inputTensor.sub(mean).div(std);

    const prediction = model.predict(processedTensor);

    if (prediction instanceof tf.Tensor) {
      const output = await prediction.data();
      const predictedIndex = output.indexOf(Math.max(...output));

      tf.dispose([inputTensor, processedTensor, prediction]);
      return predictedIndex;
    }
    return null;
  } catch (error) {
    console.error('Erreur de prédiction:', error);
    return null;
  }
};