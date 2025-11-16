import { expo } from './client';

export async function runMigrations() {
  try {
    console.log('🔄 Запуск міграцій...');
    
    await expo.execAsync(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        image TEXT,
        release_date TEXT NOT NULL,
        rating TEXT DEFAULT 'medium' CHECK(rating IN ('low', 'medium', 'high')) NOT NULL,
        
        -- Статуси
        sold INTEGER DEFAULT 0,
        is_wishlist INTEGER DEFAULT 0,
        is_new INTEGER DEFAULT 1,
        
        -- Знижки
        original_price REAL,
        discount_percent INTEGER,
        sale_end_date TEXT,
        
        -- Нотифікації
        notification_id TEXT,
        reminder_date TEXT,
        notify_on_release INTEGER DEFAULT 0,
        
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);
    
    console.log('✅ Міграції виконано успішно');
  } catch (error) {
    console.error('❌ Помилка міграцій:', error);
    throw error;
  }
}