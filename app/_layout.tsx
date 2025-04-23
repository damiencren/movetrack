import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SensorProvider } from '../contexts/SensorContext';
import SensorManager from '../components/SensorManager';
import { registerBackgroundFetch } from '../services/backgroundTask';


import "../global.css"

import { useColorScheme } from '@/hooks/useColorScheme';
import { ModelControlProvider } from '@/contexts/ModelControlContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  

  useEffect(() => {
    console.log('registerBackgroundFetch');
    registerBackgroundFetch();
  }, []);

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