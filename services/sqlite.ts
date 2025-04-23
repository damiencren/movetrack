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
      console.log('Base de données initialisée avec succès !');

      await this.createTables();
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
    } catch (error) {
      console.error('Erreur lors de la création des tables :', error);
    }
  }

  public async addGesture(gesture: string) {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return;
    }
    try {
      await this.db.runAsync('INSERT INTO gestures (gesture) VALUES (?);', [gesture]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément :', error);
    }
  }

  public async getGestures(): Promise<{ id: number; gesture: string; created_at : string ;}[]> {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return [];
    }
    try {
      const results = await this.db.getAllAsync<{ id: number; gesture: string; created_at : string;}>(
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

  public async getActivitySummaryByPeriod(
    period: 'day' | 'week' | 'month'
  ): Promise<{ name: string; duration: number }[]> {
    if (!this.db) {
      console.error('La base de données n\'est pas initialisée.');
      return [];
    }
  
    try {
      let dateCondition = '';
      let divisor = 1;
  
      if (period === 'day') {
        dateCondition = "DATE(created_at) = DATE('now')";
        divisor = 1;
      } else if (period === 'week') {
        dateCondition = "DATE(created_at) >= DATE('now', '-6 days')";
        divisor = 7;
      } else if (period === 'month') {
        dateCondition = "DATE(created_at) >= DATE('now', '-29 days')";
        divisor = 30;
      }
  
      const results = await this.db.getAllAsync<{
        gesture: string;
        count: number;
      }>(
        `SELECT gesture, COUNT(*) as count
         FROM gestures
         WHERE ${dateCondition}
         GROUP BY gesture
         ORDER BY count DESC;`
      );
  
      return results.map(r => ({
        name: r.gesture,
        duration: Math.round((r.count * 3) / divisor), // 3s * count, moyenné
      }));
    } catch (error) {
      console.error('Erreur lors du résumé des activités :', error);
      return [];
    }
  }
  
  
}





export default new DatabaseService();
