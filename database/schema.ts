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
  sold: integer('sold', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s','now'))`),

});

export type Game = typeof gamesTable.$inferSelect;
export type NewGame = typeof gamesTable.$inferInsert;
