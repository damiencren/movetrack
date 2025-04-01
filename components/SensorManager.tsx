import { useEffect } from 'react';
import useSensorPrediction from '../hooks/useSensorPrediction';
import { useSensor } from '../contexts/SensorContext';

const SensorManager = () => {
  const { updatePrediction } = useSensor();
  const { predict } = useSensorPrediction({
    modelJson: require('../assets/model/cnn/model.json'),
    modelWeights: require('../assets/model/cnn/group1-shard1of1.bin')
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const prediction = await predict();
      if (prediction !== null) {
        updatePrediction(prediction);
      }
    }, 2600);

    return () => clearInterval(interval);
  }, [predict, updatePrediction]);

  return null;
};

export default SensorManager;