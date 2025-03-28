import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('app.db');

export async function initializeDatabase() {
await db.execAsync('BEGIN');
try {
    await db.execAsync(
       `CREATE TABLE IF NOT EXISTS geopos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );
    await db.execAsync(
         `INSERT INTO geopos (latitude, longitude) VALUES (10, 10)`,
    );
    await db.execAsync('COMMIT');
} catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
}
}

export default db;
