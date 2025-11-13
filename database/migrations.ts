import { db } from '../database/client';

export async function runMigrations() {
  try {
    console.log('🧨 Видаляємо стару таблицю...');
    await db.run(`DROP TABLE IF EXISTS games;`); 

    console.log('🔄 Створюємо нову таблицю...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        image TEXT,
        release_date TEXT NOT NULL,
        rating TEXT DEFAULT 'medium' CHECK(rating IN ('low','medium','high')) NOT NULL,
        sold INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s','now'))
      );
    `);

    console.log('✅ Таблицю games створено заново');
  } catch (error) {
    console.error('❌ Помилка при створенні таблиці:', error);
    throw error;
  }
}
