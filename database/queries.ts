import { db } from './client';
import { gamesTable, type Game, type NewGame } from './schema';
import { eq, like, or, sql, desc } from 'drizzle-orm';

export const gameQueries = {
  
  getAllGames: async (): Promise<Game[]> => {
    return await db
      .select()
      .from(gamesTable)
      .orderBy(desc(gamesTable.createdAt));
  },

  createGame: async (game: NewGame): Promise<Game> => {
    const [newGame] = await db
      .insert(gamesTable)
      .values(game)
      .returning();
    
    console.log(`✅ Гру "${newGame.title}" додано з ID: ${newGame.id}`);
    return newGame;
  },

  updateGame: async (id: number, updates: Partial<NewGame>): Promise<Game> => {
    const [updatedGame] = await db
      .update(gamesTable)
      .set(updates)
      .where(eq(gamesTable.id, id))
      .returning();
    
    console.log(`✅ Гру ${id} оновлено`);
    return updatedGame;
  },

  toggleSold: async (id: number): Promise<Game> => {
    const [game] = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, id))
      .limit(1);
    
    if (!game) throw new Error('Гру не знайдено');
    
    const [result] = await db
      .update(gamesTable)
      .set({ sold: !game.sold })
      .where(eq(gamesTable.id, id))
      .returning();
    
    console.log(`✅ Статус гри ${id} змінено`);
    return result;
  },

  deleteGame: async (id: number): Promise<void> => {
    await db
      .delete(gamesTable)
      .where(eq(gamesTable.id, id));
    
    console.log(`🗑️ Гру ${id} видалено`);
  },

  deleteAllGames: async (): Promise<void> => {
    await db.delete(gamesTable);
    console.log('🗑️ Всі ігри видалено');
  },

  getGameById: async (id: number): Promise<Game | undefined> => {
    const [result] = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, id))
      .limit(1);
    
    return result;
  },

  searchGames: async (query: string): Promise<Game[]> => {
    return await db
      .select()
      .from(gamesTable)
      .where(
        or(
          like(gamesTable.title, `%${query}%`),
          like(gamesTable.description, `%${query}%`)
        )
      )
      .orderBy(desc(gamesTable.createdAt));
  },

  getStatistics: async () => {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        sold: sql<number>`sum(case when ${gamesTable.sold} = 1 then 1 else 0 end)`,
        notSold: sql<number>`sum(case when ${gamesTable.sold} = 0 then 1 else 0 end)`,
        totalValue: sql<number>`sum(${gamesTable.price})`,
        averagePrice: sql<number>`avg(${gamesTable.price})`,
        maxPrice: sql<number>`max(${gamesTable.price})`,
        minPrice: sql<number>`min(${gamesTable.price})`,
      })
      .from(gamesTable);

    return {
      total: stats?.total || 0,
      sold: stats?.sold || 0,
      notSold: stats?.notSold || 0,
      totalValue: stats?.totalValue || 0,
      averagePrice: stats?.averagePrice || 0,
      maxPrice: stats?.maxPrice || 0,
      minPrice: stats?.minPrice || 0,
    };
  },
};
