import { db } from './client';
import { gamesTable, type Game, type NewGame } from './schema';
import { eq, like, or, sql, desc, gt, and } from 'drizzle-orm';

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

  addToWishlist: async (id: number): Promise<Game> => {
    const [result] = await db
      .update(gamesTable)
      .set({ isWishlist: true })
      .where(eq(gamesTable.id, id))
      .returning();

    console.log(`💝 Гру ${id} додано до wishlist`);
    return result;
  },

  getWishlistGames: async (): Promise<Game[]> => {
    return await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.isWishlist, true))
      .orderBy(desc(gamesTable.createdAt));
  },

  removeFromWishlist: async (id: number): Promise<Game> => {
    const [result] = await db
      .update(gamesTable)
      .set({ isWishlist: false })
      .where(eq(gamesTable.id, id))
      .returning();

    console.log(`💔 Гру ${id} видалено з wishlist`);
    return result;
  },

  setSale: async (id: number, discountPercent: number, saleEndDate: string): Promise<Game> => {
    const [game] = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, id))
      .limit(1);

    if (!game) throw new Error('Гру не знайдено');

    const [result] = await db
      .update(gamesTable)
      .set({
        originalPrice: game.price,
        discountPercent,
        price: game.price * (1 - discountPercent / 100),
        saleEndDate,
      })
      .where(eq(gamesTable.id, id))
      .returning();

    console.log(`💰 Знижку ${discountPercent}% встановлено на гру ${id}`);
    return result;
  },

  removeSale: async (id: number): Promise<Game> => {
    const [game] = await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.id, id))
      .limit(1);

    if (!game || !game.originalPrice) throw new Error('Гра не на знижці');

    const [result] = await db
      .update(gamesTable)
      .set({
        price: game.originalPrice,
        originalPrice: null,
        discountPercent: null,
        saleEndDate: null,
      })
      .where(eq(gamesTable.id, id))
      .returning();

    console.log(`💸 Знижку видалено з гри ${id}`);
    return result;
  },

  getGamesOnSale: async (): Promise<Game[]> => {
    const today = new Date().toISOString().split('T')[0];

    return await db
      .select()
      .from(gamesTable)
      .where(
        and(
          sql`${gamesTable.originalPrice} IS NOT NULL`,
          gt(gamesTable.saleEndDate, today)
        )
      )
      .orderBy(desc(gamesTable.discountPercent));
  },

  // ===== НОВІ ІГРИ =====

  markAsViewed: async (id: number): Promise<Game> => {
    const [result] = await db
      .update(gamesTable)
      .set({ isNew: false })
      .where(eq(gamesTable.id, id))
      .returning();

    return result;
  },

  getNewGames: async (): Promise<Game[]> => {
    return await db
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.isNew, true))
      .orderBy(desc(gamesTable.createdAt));
  },

  // ===== МАЙБУТНІ РЕЛІЗИ =====

  getUpcomingReleases: async (): Promise<Game[]> => {
    const today = new Date().toISOString().split('T')[0];

    return await db
      .select()
      .from(gamesTable)
      .where(gt(gamesTable.releaseDate, today))
      .orderBy(gamesTable.releaseDate);
  },

  enableReleaseNotification: async (id: number): Promise<Game> => {
    const [result] = await db
      .update(gamesTable)
      .set({ notifyOnRelease: true })
      .where(eq(gamesTable.id, id))
      .returning();

    return result;
  },

  // ===== СТАТИСТИКА =====

  getExtendedStatistics: async () => {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        sold: sql<number>`sum(case when ${gamesTable.sold} = 1 then 1 else 0 end)`,
        wishlist: sql<number>`sum(case when ${gamesTable.isWishlist} = 1 then 1 else 0 end)`,
        newGames: sql<number>`sum(case when ${gamesTable.isNew} = 1 then 1 else 0 end)`,
        onSale: sql<number>`sum(case when ${gamesTable.originalPrice} IS NOT NULL then 1 else 0 end)`,
        totalValue: sql<number>`sum(${gamesTable.price})`,
        averagePrice: sql<number>`avg(${gamesTable.price})`,
      })
      .from(gamesTable);

    return stats;
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
