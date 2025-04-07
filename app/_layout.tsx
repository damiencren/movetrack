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
import DatabaseService from '@/services/sqlite'; // Import the DatabaseService


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
    async function prepare() {
      if (loaded) {
        SplashScreen.hideAsync();

        const logPosition = async () => {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              console.error('Location permission not granted');
              return;
            }

            const location = await Location.getCurrentPositionAsync({});
            await DatabaseService.addPosition(location.coords.latitude, location.coords.longitude);
            
          } catch (error) {
            console.error('Error fetching location:', error);
          }
        };

        // Log position immediately and then every 5 seconds
        logPosition();
        const interval = setInterval(() => {
          logPosition();
        }, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
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