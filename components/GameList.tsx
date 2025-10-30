import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Game, GameFormData } from '../models/game';
import { mockGames } from '../data/game-data';
import { styles } from '../styles/gameListStyles';
import GameCard from './GameCard';
import GameForm from './GameForm';
import { storageService } from '../utils/storage';

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження ігор при старті додатку
  useEffect(() => {
    loadGamesFromStorage();
  }, []);

  // Автоматичне збереження при зміні списку ігор
  useEffect(() => {
    if (!isLoading && games.length > 0) {
      saveGamesToStorage();
    }
  }, [games]);

  // Функція завантаження ігор
  const loadGamesFromStorage = async () => {
    try {
      setIsLoading(true);
      const savedGames = await storageService.loadGames();
      
      if (savedGames && savedGames.length > 0) {
        setGames(savedGames);
        console.log(`📦 Завантажено ${savedGames.length} ігор з сховища`);
      } else {
        // Якщо немає збережених ігор, використовуємо mock дані
        setGames(mockGames);
        console.log('📦 Використано початкові дані');
      }
    } catch (error) {
      console.error('Помилка завантаження:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити ігри');
      setGames(mockGames); // Fallback на mock дані
    } finally {
      setIsLoading(false);
    }
  };

  // Функція збереження ігор
  const saveGamesToStorage = async () => {
    try {
      await storageService.saveGames(games);
      console.log(`💾 Збережено ${games.length} ігор`);
    } catch (error) {
      console.error('Помилка збереження:', error);
    }
  };

  // Додавання нової гри
  const handleAddGame = async (formData: GameFormData) => {
    const newGame: Game = {
      id: Date.now(), // Унікальний ID на основі timestamp
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      image: formData.image || 'https://via.placeholder.com/500',
      releaseDate: formData.releaseDate,
      rating: formData.rating,
      sold: false,
    };

    const updatedGames = [newGame, ...games];
    setGames(updatedGames);

    // Показати повідомлення про успіх
    Alert.alert('✅ Успіх', `Гру "${newGame.title}" додано!`);
  };

  // Видалення гри
  const handleDeleteGame = (id: number) => {
    Alert.alert(
      'Видалити гру?',
      'Ця дія незворотна',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            const updatedGames = games.filter(game => game.id !== id);
            setGames(updatedGames);
          },
        },
      ]
    );
  };

  // Перемикання статусу "продано"
  const handleToggleSold = (id: number) => {
    const updatedGames = games.map(game =>
      game.id === id ? { ...game, sold: !game.sold } : game
    );
    setGames(updatedGames);
  };

  // Очистити всі дані (для тестування)
  const handleClearAll = () => {
    Alert.alert(
      '🗑️ Видалити всі дані?',
      'Це видалить всі ігри зі сховища',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити все',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearGames();
            setGames(mockGames);
            Alert.alert('✅', 'Всі дані видалено');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Завантаження ігор...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Ігри 2024</Text>
        <Text style={styles.subtitle}>
          {games.length} {games.length === 1 ? 'гра' : 'ігор'} доступно
        </Text>
        
        {/* Кнопка очистки (для тестування) */}
        <TouchableOpacity 
          onPress={handleClearAll}
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: '#EF4444', fontSize: 12 }}>
            🗑️ Очистити сховище
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={games}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDeleteGame(item.id)}
            onPress={() => handleToggleSold(item.id)}
          >
            <GameCard item={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📦 Немає ігор</Text>
            <Text style={styles.emptySubtext}>
              Натисніть "+" щоб додати нову гру
            </Text>
          </View>
        }
      />

      {/* Кнопка додавання */}
      <TouchableOpacity
        style={styles.addButtonContainer}
        onPress={() => setIsFormVisible(true)}
      >
        <Text style={styles.addButton}>＋</Text>
      </TouchableOpacity>

      {/* Форма */}
      <GameForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleAddGame}
      />
    </SafeAreaView>
  );
}
