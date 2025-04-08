import * as Location from 'expo-location';
import DatabaseService from './sqlite';

class GeolocationService {
  private static instance: GeolocationService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  public async startLogging(interval: number = 5000): Promise<void> {
    if (this.intervalId) {
      console.log('Geolocation logging is already running.');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return;
      }

      console.log('Starting geolocation logging...');
      this.logPosition(); // Log immediately

      this.intervalId = setInterval(() => {
        this.logPosition();
      }, interval);
    } catch (error) {
      console.error('Error starting geolocation logging:', error);
    }
  }

  public stopLogging(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Geolocation logging stopped.');
    }
  }

  private async logPosition(): Promise<void> {
    try {
      const location = await Location.getCurrentPositionAsync({});
      await DatabaseService.addPosition(location.coords.latitude, location.coords.longitude);
      console.log('Logged position:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error logging position:', error);
    }
  }
}

export default GeolocationService.getInstance();