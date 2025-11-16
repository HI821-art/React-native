import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // ========== ІНІЦІАЛІЗАЦІЯ ==========
  async initialize() {
    if (!Device.isDevice) {
      console.log('⚠️ Нотифікації працюють тільки на реальних пристроях');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Дозвіл на нотифікації не надано');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('games', {
        name: 'Ігри',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }

    console.log('✅ Нотифікації ініціалізовано');
    return finalStatus;
  },

  // ========== 1. НОТИФІКАЦІЯ ПРО РЕЛІЗ ГРИ ==========
  async scheduleReleaseNotification(game: { id: number; title: string; releaseDate: string; }): Promise<string | null> {
    try {
      const releaseDate = new Date(game.releaseDate);
      const now = new Date();

      if (releaseDate <= now) {
        console.log('⚠️ Гра вже вийшла');
        return null;
      }

      const notificationDate = new Date(releaseDate);
      notificationDate.setDate(notificationDate.getDate() - 1);
      notificationDate.setHours(10, 0, 0, 0);

      if (notificationDate <= now) {
        console.log('⚠️ Дата нотифікації вже минула');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎮 Завтра реліз!',
          body: `"${game.title}" виходить завтра! Не пропусти!`,
          data: { gameId: game.id, type: 'release', action: 'view' },
          sound: true,
          categoryIdentifier: 'game-release',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        },
      });

      console.log(`✅ Нотифікація про реліз: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Помилка планування:', error);
      return null;
    }
  },

  // ========== 2. НОТИФІКАЦІЯ ПРО ЗНИЖКУ ==========
  async scheduleSaleNotification(game: { id: number; title: string; price: number; originalPrice: number; discountPercent: number; saleEndDate: string; }): Promise<string | null> {
    try {
      const endDate = new Date(game.saleEndDate);
      const now = new Date();
      if (endDate <= now) return null;

      const notificationDate = new Date(endDate);
      notificationDate.setDate(notificationDate.getDate() - 1);
      notificationDate.setHours(18, 0, 0, 0);

      if (notificationDate <= now) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Знижка закінчується завтра!',
          body: `"${game.title}" зі знижкою ${game.discountPercent}% тільки 1 день! Зараз $${game.price.toFixed(2)}`,
          data: { gameId: game.id, type: 'sale', action: 'view' },
          sound: true,
          categoryIdentifier: 'game-sale',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        },
      });

      console.log(`✅ Нотифікація про знижку: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Помилка планування:', error);
      return null;
    }
  },

  // ========== 3. ЩОТИЖНЕВЕ НАГАДУВАННЯ WISHLIST ==========
  async scheduleWishlistReminder(wishlistCount: number): Promise<string | null> {
    try {
      if (wishlistCount === 0) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💝 Твій список бажань',
          body: `У тебе ${wishlistCount} ${wishlistCount === 1 ? 'гра' : 'ігор'} в списку бажань. Час переглянути?`,
          data: { type: 'wishlist', action: 'view-wishlist' },
          sound: true,
          categoryIdentifier: 'wishlist-reminder',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: 1,
          hour: 12,
          minute: 0,
          repeats: true,
        },
      });

      console.log(`✅ Щотижневе wishlist: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Помилка планування:', error);
      return null;
    }
  },

  // ========== 4. ЩОМІСЯЧНА СТАТИСТИКА ==========
  async scheduleMonthlyStats(stats: { total: number; newThisMonth: number; totalValue: number; }): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Твоя колекція за місяць',
          body: `${stats.total} ігор на суму $${stats.totalValue.toFixed(2)}. Додано ${stats.newThisMonth} нових!`,
          data: { type: 'stats', action: 'view-stats' },
          sound: true,
          categoryIdentifier: 'monthly-stats',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          day: 1,
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });

      console.log(`✅ Щомісячна статистика: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Помилка планування:', error);
      return null;
    }
  },

  // ========== 5. НАГАДУВАННЯ ПРО НОВІ ІГРИ ==========
  async scheduleNewGamesReminder(newGamesCount: number): Promise<string | null> {
    try {
      if (newGamesCount === 0) return null;

      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + 3);
      triggerDate.setHours(19, 0, 0, 0);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🆕 У тебе є непереглянуті ігри!',
          body: `${newGamesCount} ${newGamesCount === 1 ? 'гра' : 'ігор'} чекає на перегляд!`,
          data: { type: 'new-games', action: 'view-new' },
          sound: true,
          categoryIdentifier: 'new-games-reminder',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      console.log(`✅ Нагадування про нові ігри: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Помилка планування:', error);
      return null;
    }
  },

  // ========== УПРАВЛІННЯ НОТИФІКАЦІЯМИ ==========
  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`🗑️ Нотифікація ${notificationId} скасована`);
    } catch (error) {
      console.error('❌ Помилка скасування:', error);
    }
  },

  async cancelAllGameNotifications(notificationIds: (string | null)[]) {
    try {
      const validIds = notificationIds.filter((id): id is string => id !== null);
      await Promise.all(validIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
      console.log(`🗑️ Скасовано ${validIds.length} нотифікацій`);
    } catch (error) {
      console.error('❌ Помилка скасування:', error);
    }
  },

  async getAllScheduledNotifications() {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Заплановані нотифікації:', notifications.length);
    return notifications;
  },

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Всі нотифікації скасовано');
  },

  async sendTestNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
    console.log('✅ Тестова нотифікація відправлена');
  },
};

// ========================================
// Категорії та дії
// ========================================
export async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('game-release', [
    { identifier: 'view', buttonTitle: '👀 Переглянути', options: { opensAppToForeground: true } },
    { identifier: 'remind-later', buttonTitle: '⏰ Нагадати пізніше', options: { opensAppToForeground: false } },
  ]);

  await Notifications.setNotificationCategoryAsync('game-sale', [
    { identifier: 'view', buttonTitle: '💰 Переглянути', options: { opensAppToForeground: true } },
    { identifier: 'delete', buttonTitle: '🗑️ Видалити', options: { opensAppToForeground: false, isDestructive: true } },
  ]);

  await Notifications.setNotificationCategoryAsync('wishlist-reminder', [
    { identifier: 'view-wishlist', buttonTitle: '💝 Переглянути', options: { opensAppToForeground: true } },
    { identifier: 'dismiss', buttonTitle: '❌ Закрити', options: { opensAppToForeground: false } },
  ]);

  await Notifications.setNotificationCategoryAsync('monthly-stats', [
    { identifier: 'view-stats', buttonTitle: '📊 Переглянути', options: { opensAppToForeground: true } },
  ]);

  await Notifications.setNotificationCategoryAsync('new-games-reminder', [
    { identifier: 'view-new', buttonTitle: '🆕 Переглянути', options: { opensAppToForeground: true } },
  ]);

  console.log('✅ Категорії нотифікацій налаштовано');
}
