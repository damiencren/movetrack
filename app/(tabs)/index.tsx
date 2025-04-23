import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, ToastAndroid } from 'react-native';
import { useSensor } from '../../contexts/SensorContext';
import { useModelControl } from '@/contexts/ModelControlContext';
import DatabaseService from '../../services/sqlite';
import classNames from 'classnames';

const SensorTab = () => {

  const { gesture } = useSensor();
  const { isRunning, startModel, stopModel } = useModelControl();
  const [gestureData, setGestureData] = useState<{ id: number; gesture: string; created_at: string }[]>([]);

  const fetchData = async () => {
    const data = await DatabaseService.getGestures();
    setGestureData(data);
  };

  useEffect(() => {
    fetchData();
  }, [gesture]);

  return (
    <View className='flex p-4 h-full mt-10'>
      <Text className='font-extrabold text-4xl dark:text-background'>Activity Recognition</Text>
      {gesture !== null ? (
        <View className='flex flex-col gap-4 flex-1 mb-10 mt-5 justify-center'>
          <Text className='text-2xl font-bold dark:text-background'>Model</Text>
          <View className='flex flex-row '>
            <Text className='text-2xl dark:text-background'>Model Status : </Text>
            <Text className={classNames('font-bold text-center text-2xl', { 'text-green-500': isRunning, 'text-red-500': !isRunning, })}>{isRunning ? 'Actif' : 'Inactif'}</Text>
          </View>
          {isRunning ?
            <Button color='red' onPress={() => stopModel()} title='Stop' />
            :
            <Button color='green' onPress={() => startModel()} title='Start' />
          }
          <Button color='blue' onPress={() => { DatabaseService.clearGestures(); fetchData(); ToastAndroid.show('History cleared', ToastAndroid.SHORT); }} title='Clear History' />
          <Text className='text-2xl font-bold dark:text-background'>Gesture Prediction</Text>
          <View className='flex flex-row w-full my-1 p-4 bg-card rounded-lg'>
            <Text className='text-center text-2xl'>Current Activity: {gesture.name}</Text>
          </View>
          <Text className='text-2xl font-bold dark:text-background'>Gesture History</Text>
          <FlatList
            className='w-full'
            data={gestureData.reverse()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className='flex flex-row w-full my-1 p-4 bg-card rounded-lg border border-gray-400'>
                <Text className='text-lg font-bold w-1/2 text-center'>{item.gesture}</Text>
                <Text className='w-1/2 text-center'>{item.created_at}</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <Text>Initializing sensors...</Text>
      )}
    </View>
  );
};

export default SensorTab;