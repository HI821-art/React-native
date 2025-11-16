import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const gamesTable = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  price: real('price').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  image: text('image'),
  releaseDate: text('release_date').notNull(),
  rating: text('rating', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  
  // Статуси
  sold: integer('sold', { mode: 'boolean' }).notNull().default(false),
  isWishlist: integer('is_wishlist', { mode: 'boolean' }).notNull().default(false),
  isNew: integer('is_new', { mode: 'boolean' }).notNull().default(true), 
  
  // Знижки
  originalPrice: real('original_price'), 
  discountPercent: integer('discount_percent'), 
  saleEndDate: text('sale_end_date'), 
  
  // Нотифікації
  notificationId: text('notification_id'), 
  reminderDate: text('reminder_date'), 
  notifyOnRelease: integer('notify_on_release', { mode: 'boolean' }).default(false), 
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export type Game = typeof gamesTable.$inferSelect;
export type NewGame = typeof gamesTable.$inferInsert;