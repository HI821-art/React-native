import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import { useEffect, useRef } from 'react';
import { gameQueries } from '../database/queries';
import { notificationService, setupNotificationCategories } from '../services/notificationService';

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    initNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Нотифікація отримана:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      const { notification, actionIdentifier } = response;
      const data = notification.request.content.data;

      console.log('👆 Дія:', actionIdentifier);
      console.log('📦 Дані:', data);

      await handleNotificationAction(actionIdentifier, data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const initNotifications = async () => {
    await notificationService.initialize();
    await setupNotificationCategories();
    await setupPeriodicNotifications();
  };

  const setupPeriodicNotifications = async () => {
    const wishlistGames = await gameQueries.getWishlistGames();
    if (wishlistGames.length > 0) {
      await notificationService.scheduleWishlistReminder(wishlistGames.length);
    }

    const stats = await gameQueries.getExtendedStatistics();
    await notificationService.scheduleMonthlyStats({
      total: stats.total || 0,
      newThisMonth: stats.newGames || 0,
      totalValue: stats.totalValue || 0,
    });

    const newGames = await gameQueries.getNewGames();
    if (newGames.length > 0) {
      await notificationService.scheduleNewGamesReminder(newGames.length);
    }
  };

  const handleNotificationAction = async (actionIdentifier: string, data: any) => {
    switch (actionIdentifier) {
      case 'view':
      case 'view-wishlist':
      case 'view-stats':
      case 'view-new':
        console.log('👀 Відкриваємо додаток');
        break;

      case 'delete':
        if (data.gameId) {
          try {
            await gameQueries.deleteGame(data.gameId);
            console.log('🗑️ Гру видалено');
          } catch (error) {
            console.error('❌ Помилка видалення:', error);
          }
        }
        break;

      case 'remind-later':
        console.log('⏰ Нагадаємо пізніше');
        break;

      case 'dismiss':
        console.log('❌ Закрито');
        break;

      default:
        console.log('🤷 Невідома дія');
    }
  };

  return <Stack />;
}
