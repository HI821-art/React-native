import { db } from './client';

export async function resetGamesTable() {
  try {
    await db.run(`DROP TABLE IF EXISTS games;`);
    console.log('✅ Таблиця games видалена');
  } catch (error) {
    console.error('❌ Помилка при видаленні таблиці:', error);
  }
}

export async function runMigrations() {
  try {
    console.log('🔄 Створення таблиці games...');

    await db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        image TEXT,
        release_date TEXT NOT NULL,
        rating TEXT DEFAULT 'medium' CHECK(rating IN ('low', 'medium', 'high')) NOT NULL,
        
        sold INTEGER DEFAULT 0 NOT NULL,
        is_wishlist INTEGER DEFAULT 0 NOT NULL,
        is_new INTEGER DEFAULT 1 NOT NULL,

        original_price REAL,
        discount_percent INTEGER,
        sale_end_date TEXT,
        sale_notification_id TEXT,       
        notification_id TEXT,
        reminder_date TEXT,
        notify_on_release INTEGER DEFAULT 0,
        
        created_at INTEGER DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT (strftime('%s','now'))
      );
    `);

    console.log('✅ Таблиця games створена');
  } catch (error) {
    console.error('❌ Помилка міграцій:', error);
    throw error;
  }
}

// Виклик
(async () => {
  await resetGamesTable(); // видаляємо стару
  await runMigrations();   // створюємо нову
})();
