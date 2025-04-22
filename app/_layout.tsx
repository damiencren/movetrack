import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SensorProvider } from '../contexts/SensorContext';
import SensorManager from '../components/SensorManager';

import "../global.css"

import { useColorScheme } from '@/hooks/useColorScheme';
import { ModelControlProvider } from '@/contexts/ModelControlContext';

import * as BackgroundFetch from 'expo-background-fetch';
import { BACKGROUND_PREDICTION_TASK } from '../background/BackgroundPrediction';

async function registerBackgroundTask() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_PREDICTION_TASK, {
      minimumInterval: 5, // 60s minimum — ajustable
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Tâche en arrière-plan enregistrée');
  } else {
    console.warn('Background fetch non disponible :', status);
  }
}

useEffect(() => {
  registerBackgroundTask();
}, []);


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      if (loaded) {
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SensorProvider>
      <ModelControlProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <SensorManager />
          <StatusBar style="auto" />
        </ThemeProvider>
      </ModelControlProvider>
    </SensorProvider>
  );
}