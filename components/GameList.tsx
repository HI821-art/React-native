import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockGames } from '../data/game-data';
import { runMigrations } from '../database/migrations';
import { gameQueries } from '../database/queries';
import type { Game } from '../database/schema';
import { GameFormData } from '../models/game';
import { styles } from '../styles/gameListStyles';
import GameCard from './GameCard';
import GameDetailsModal from './GameDetailsModal';
import GameForm from './GameForm';
import { notificationService } from '../services/notificationService';

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total: 0,
    sold: 0,
    notSold: 0,
    totalValue: 0,
    averagePrice: 0,
    maxPrice: 0,
    minPrice: 0,
  });

  useEffect(() => {
    initializeDatabase();
  }, []);

  // ========== ІНІЦІАЛІЗАЦІЯ БД ==========
  const initializeDatabase = async () => {
    try {
      setIsLoading(true);

    
      await runMigrations();

    
      const loadedGames = await gameQueries.getAllGames();

     
      if (loadedGames.length === 0) {
        console.log('📦 БД порожня, додаємо початкові дані...');
        for (const game of mockGames) {
          await gameQueries.createGame({
            title: game.title,
            price: game.price,
            description: game.description,
            category: game.category,
            image: game.image,
            releaseDate: game.releaseDate,
            rating: game.rating,
            sold: game.sold,
          });
        }
      }

      const allGames = await gameQueries.getAllGames();
      setGames(allGames);
      await loadStatistics();

      console.log(`✅ Завантажено ${allGames.length} ігор з Drizzle ORM`);
    } catch (error) {
      console.error('❌ Помилка ініціалізації БД:', error);
      Alert.alert('Помилка', 'Не вдалося підключитися до бази даних');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== СТАТИСТИКА ==========
  const loadStatistics = async () => {
    try {
      const stats = await gameQueries.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Помилка завантаження статистики:', error);
    }
  };

  const refreshGames = async () => {
    try {
      const updatedGames = await gameQueries.getAllGames();
      setGames(updatedGames);
      await loadStatistics();
    } catch (error) {
      console.error('Помилка оновлення списку:', error);
    }
  };

  // ========== ДОДАВАННЯ ГРИ З НОТИФІКАЦІЄЮ ==========
  const handleAddGame = async (formData: GameFormData) => {
    try {
      const price = parseFloat(formData.price);
      
      if (isNaN(price)) {
        Alert.alert('Помилка', 'Невірний формат ціни');
        return;
      }

      const newGame = await gameQueries.createGame({
        title: formData.title.trim(),
        price,
        description: formData.description?.trim() || null,
        category: formData.category.trim(),
        image: formData.image.trim() || 'https://via.placeholder.com/500',
        releaseDate: formData.releaseDate,
        rating: formData.rating,
        sold: false,
        isNew: true,
        notifyOnRelease: formData.notifyOnRelease || false,
      });

    
      const releaseDate = new Date(formData.releaseDate);
      const now = new Date();
      
      if (releaseDate > now && formData.notifyOnRelease) {
        const notificationId = await notificationService.scheduleReleaseNotification({
          id: newGame.id!,
          title: newGame.title,
          releaseDate: newGame.releaseDate,
        });

        if (notificationId) {
          await gameQueries.updateGame(newGame.id!, { notificationId });
        }
      }

      await refreshGames();
      Alert.alert('✅ Успіх', `Гру "${formData.title}" додано!`);
    } catch (error) {
      console.error('Помилка додавання гри:', error);
      Alert.alert('Помилка', 'Не вдалося додати гру');
    }
  };

  // ========== ВИДАЛЕННЯ ГРИ З СКАСУВАННЯМ НОТИФІКАЦІЇ ==========
  const handleDeleteGame = (id: number, title: string) => {
    Alert.alert(
      'Видалити гру?',
      `Ви впевнені, що хочете видалити "${title}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              const game = games.find(g => g.id === id);
              
             
              if (game?.notificationId) {
                await notificationService.cancelNotification(game.notificationId);
              }

              await gameQueries.deleteGame(id);
              await refreshGames();
              Alert.alert('✅', 'Гру видалено');
            } catch (error) {
              console.error('Помилка видалення:', error);
              Alert.alert('Помилка', 'Не вдалося видалити гру');
            }
          },
        },
      ]
    );
  };

  // ========== WISHLIST ==========
  const handleToggleWishlist = async (id: number) => {
    try {
      const game = games.find(g => g.id === id);
      if (!game) return;
      
      if (game.isWishlist) {
        await gameQueries.removeFromWishlist(id);
      } else {
        await gameQueries.addToWishlist(id);
      }
  
      await refreshGames();
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  // ========== ВСТАНОВИТИ ЗНИЖКУ З НОТИФІКАЦІЄЮ ==========
  const handleSetSale = async (id: number, discount: number, endDate: string) => {
    try {
      const game = await gameQueries.setSale(id, discount, endDate);

     
      const notificationId = await notificationService.scheduleSaleNotification({
        id: game.id!,
        title: game.title,
        price: game.price,
        originalPrice: game.originalPrice!,
        discountPercent: game.discountPercent!,
        saleEndDate: game.saleEndDate!,
      });

      if (notificationId) {
        await gameQueries.updateGame(id, { saleNotificationId: notificationId });
      }

      await refreshGames();
      Alert.alert('✅', `Знижку ${discount}% встановлено!`);
    } catch (error) {
      console.error('Помилка:', error);
      Alert.alert('Помилка', 'Не вдалося встановити знижку');
    }
  };

  // ========== ПОЗНАЧИТИ ЯК ПЕРЕГЛЯНУТУ ==========
  const handleMarkAsViewed = async (id: number) => {
    try {
      await gameQueries.markAsViewed(id);
      await refreshGames();
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  // ========== ОЧИСТИТИ БД ==========
  const handleClearDatabase = () => {
    Alert.alert(
      '🗑️ Видалити всі ігри?',
      'Це видалить всі дані з бази даних. Ця дія незворотна!',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити все',
          style: 'destructive',
          onPress: async () => {
            try {
            
              await notificationService.cancelAllNotifications();
              
              await gameQueries.deleteAllGames();
              await refreshGames();
              Alert.alert('✅', 'Всі ігри видалено');
            } catch (error) {
              console.error('Помилка очищення БД:', error);
              Alert.alert('Помилка', 'Не вдалося очистити базу даних');
            }
          },
        },
      ]
    );
  };

  // ========== ТЕСТОВА НОТИФІКАЦІЯ ==========
  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification(
        '🎮 Тестова нотифікація',
        'Система нотифікацій працює відмінно!'
      );
      Alert.alert('✅', 'Тестова нотифікація відправлена!');
    } catch (error) {
      console.error('Помилка:', error);
      Alert.alert('Помилка', 'Не вдалося відправити нотифікацію');
    }
  };

  // ========== ПОКАЗАТИ ВСІІ ЗАПЛАНОВАНІ НОТИФІКАЦІЇ ==========
  const handleShowScheduledNotifications = async () => {
    try {
      const notifications = await notificationService.getAllScheduledNotifications();
      Alert.alert(
        '📋 Заплановані нотифікації',
        `Всього: ${notifications.length}\n\n` +
        notifications.map((n, i) => 
          `${i + 1}. ${n.content.title}\n   ${new Date(n.trigger as any).toLocaleString()}`
        ).join('\n\n')
      );
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Завантаження Drizzle ORM...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Ігри 2024</Text>
        <Text style={styles.subtitle}>
          Drizzle ORM • {statistics.total} {statistics.total === 1 ? 'гра' : 'ігор'}
        </Text>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>✅ {statistics.sold}</Text>
          <Text style={styles.statItem}>📦 {statistics.notSold}</Text>
          <Text style={styles.statItem}>💰 ${statistics.totalValue.toFixed(2)}</Text>
        </View>

        {/* Кнопки управління */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            onPress={handleTestNotification} 
            style={styles.testButton}
          >
            <Text style={styles.testButtonText}>🔔 Тест</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleShowScheduledNotifications} 
            style={styles.testButton}
          >
            <Text style={styles.testButtonText}>📋 Нотифікації</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleClearDatabase} 
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>🗑️ Очистити</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Game list */}
      <FlatList
        data={games}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedGame(item);
              setIsDetailsVisible(true);
              handleMarkAsViewed(item.id!);
            }}
            onLongPress={() => handleDeleteGame(item.id!, item.title)}
          >
            <GameCard 
              item={{
                ...item,
                notifyOnRelease: item.notifyOnRelease || false,
              }} 
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📦 База даних порожня</Text>
            <Text style={styles.emptySubtext}>
              Натисніть "+" щоб додати нову гру
            </Text>
          </View>
        }
      />

      {/* Add new game button */}
      <TouchableOpacity
        style={styles.addButtonContainer}
        onPress={() => setIsFormVisible(true)}
      >
        <Text style={styles.addButton}>＋</Text>
      </TouchableOpacity>

      {/* Forms & Modals */}
      <GameForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleAddGame}
      />

      {selectedGame && (
        <GameDetailsModal
          visible={isDetailsVisible}
          game={selectedGame}
          onClose={() => {
            setIsDetailsVisible(false);
            setSelectedGame(null);
          }}
          onToggleWishlist={handleToggleWishlist}
          onSetSale={handleSetSale}
          onDelete={handleDeleteGame}
        />
      )}
    </SafeAreaView>
  );
}