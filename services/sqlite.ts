import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      console.log('Initialisation de la base de données...');
      this.db = await SQLite.openDatabaseAsync('myDatabase.db');
      this.dropTables(); // Uncomment this line to drop tables on each init (for testing purposes)

      console.log('Base de données initialisée avec succès !');

      await this.createTables();
      this.addFakeData(); // Uncomment this line to add fake data
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données :', error);
    }
  }

  private async createTables() {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS gestures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gesture TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS positions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Erreur lors de la création des tables :', error);
    }
  }

  public async dropTables() {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
    try {
      await this.db.execAsync('DROP TABLE IF EXISTS gestures;');
      await this.db.execAsync('DROP TABLE IF EXISTS positions;');
      console.log('Tables supprimées avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression des tables :', error);
    }
  }

  public async addGesture(gesture: string, createdAt?: string) {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
    try {
      const date = createdAt ? new Date(createdAt) : new Date();
      date.setHours(date.getHours() - 4); // Adjust to UTC-4
      const adjustedCreatedAt = date.toISOString();
  
      await this.db.runAsync(
        'INSERT INTO gestures (gesture, created_at) VALUES (?, ?);',
        [gesture, adjustedCreatedAt]
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément :', error);
    }
  }
  
  public async getGestures(): Promise<{ id: number; gesture: string; created_at: string }[]> {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return [];
    }
    try {
      const results = await this.db.getAllAsync<{ id: number; gesture: string; created_at: string }>(
        'SELECT * FROM gestures;'
      );
      return results;
    } catch (error) {
      console.error('Erreur lors de la récupération des éléments :', error);
      return [];
    }
  }

  public async clearGestures() {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
    try {
      await this.db.runAsync('DELETE FROM gestures;');
    } catch (error) {
      console.error('Erreur lors de la suppression des éléments :', error);
    }
  }

  public async addPosition(latitude: number, longitude: number, createdAt?: string) {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
    try {
      if (createdAt) {
        await this.db.runAsync(
          'INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);',
          [latitude, longitude, createdAt]
        );
      } else {
        await this.db.runAsync(
          'INSERT INTO positions (latitude, longitude) VALUES (?, ?);',
          [latitude, longitude]
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la position :', error);
    }
  }

  public async getAllPositions(): Promise<{ id: number; latitude: number; longitude: number; created_at: string }[]> {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return [];
    }
    try {
      const results = await this.db.getAllAsync<{ id: number; latitude: number; longitude: number; created_at: string }>(
        'SELECT * FROM positions;'
      );
      return results;
    } catch (error) {
      console.error('Erreur lors de la récupération des positions :', error);
      return [];
    }
  }

  public async addFakeData() {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
  
    try {
      // Inserting gesture "WALKING"
      await this.db.runAsync('INSERT INTO gestures (gesture, created_at) VALUES (?, ?);', [
        'WALKING',
        '2025-04-01T10:00:00Z', // Start date for WALKING gesture
      ]);
      
      // Inserting positions for "WALKING"
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0001, -71.0669905 + 0.0001, '2025-04-01T10:00:00Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0002, -71.0669905 - 0.0001, '2025-04-01T10:00:05Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.0001, -71.0669905 + 0.0002, '2025-04-01T10:00:10Z',
      ]);
      await this.db.runAsync('INSERT INTO gestures (gesture, created_at) VALUES (?, ?);', [
        'LAYING',
        '2025-04-01T10:00:11Z', // Start date for WALKING gesture
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.00015, -71.0669905 - 0.00005, '2025-04-01T10:00:15Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.0001, -71.0669905 - 0.00015, '2025-04-01T10:00:20Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.00005, -71.0669905 + 0.00005, '2025-04-01T10:00:25Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0001, -71.0669905 - 0.0001, '2025-04-01T10:00:30Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.00005, -71.0669905 + 0.0001, '2025-04-01T10:00:35Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0001, -71.0669905 + 0.0001, '2025-04-01T10:00:40Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.00015, -71.0669905 - 0.00005, '2025-04-01T10:00:45Z',
      ]);
  
      // Inserting gesture "STANDING"
      await this.db.runAsync('INSERT INTO gestures (gesture, created_at) VALUES (?, ?);', [
        'STANDING',
        '2025-04-01T10:05:00Z', // Start date for STANDING gesture
      ]);
  
      // Inserting positions for "STANDING"
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.00005, -71.0669905 - 0.00005, '2025-04-01T10:05:00Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.0001, -71.0669905 + 0.00005, '2025-04-01T10:05:05Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0001, -71.0669905 - 0.0001, '2025-04-01T10:05:10Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.00015, -71.0669905 + 0.0001, '2025-04-01T10:05:15Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0002, -71.0669905 - 0.00005, '2025-04-01T10:05:20Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.0001, -71.0669905 + 0.0002, '2025-04-01T10:05:25Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.00005, -71.0669905 - 0.0001, '2025-04-01T10:05:30Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0001, -71.0669905 + 0.00015, '2025-04-01T10:05:35Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 - 0.00005, -71.0669905 - 0.00005, '2025-04-01T10:05:40Z',
      ]);
      await this.db.runAsync('INSERT INTO positions (latitude, longitude, created_at) VALUES (?, ?, ?);', [
        48.4074286 + 0.0001, -71.0669905 + 0.0001, '2025-04-01T10:05:45Z',
      ]);
  
      console.log('Fake data added successfully!');
    } catch (error) {
      console.error('Error adding fake data:', error);
    }
  }
}

export default new DatabaseService();