import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from '../models/game';

const STORAGE_KEY = '@games_storage';

export const storageService = {
  // Зберегти ігри
  async saveGames(games: Game[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(games);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      console.log('✅ Ігри збережено в AsyncStorage');
    } catch (error) {
      console.error('❌ Помилка збереження ігор:', error);
      throw error;
    }
  },

  // Завантажити ігри
  async loadGames(): Promise<Game[] | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        const games = JSON.parse(jsonValue);
        console.log('✅ Ігри завантажено з AsyncStorage:', games.length);
        return games;
      }
      console.log('ℹ️ Немає збережених ігор');
      return null;
    } catch (error) {
      console.error('❌ Помилка завантаження ігор:', error);
      throw error;
    }
  },

  // Видалити всі ігри (для тестування)
  async clearGames(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Всі ігри видалено з AsyncStorage');
    } catch (error) {
      console.error('❌ Помилка видалення ігор:', error);
      throw error;
    }
  },

  // Отримати розмір сховища (для дебагу)
  async getStorageSize(): Promise<string> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const bytes = new Blob([jsonValue]).size;
        return `${(bytes / 1024).toFixed(2)} KB`;
      }
      return '0 KB';
    } catch (error) {
      console.error('❌ Помилка отримання розміру:', error);
      return 'Unknown';
    }
  },
};
