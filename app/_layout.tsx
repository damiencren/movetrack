import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Location from 'expo-location';
import 'react-native-reanimated';
import { SensorProvider } from '../contexts/SensorContext';
import SensorManager from '../components/SensorManager';
import { registerBackgroundFetch } from '../services/backgroundTask';
import DatabaseService from '@/services/sqlite'; // Import the DatabaseService


import "../global.css"

import { useColorScheme } from '@/hooks/useColorScheme';
import { ModelControlProvider } from '@/contexts/ModelControlContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import GeolocationService from '@/services/geolocalisationservice';

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

        // Start geolocation logging
        await GeolocationService.startLogging(5000); // Log every 5 seconds
      }
    }

    prepare();

    // Cleanup on unmount
    return () => {
      GeolocationService.stopLogging();
    };
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