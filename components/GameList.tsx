import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Game } from '../models/game';
import { mockGames } from '../data/game-data';
import { styles } from '../styles/gameListStyles';
import GameCard from './GameCard';
import GameForm from './GameForm';
import { GameFormData } from '../models/game';

export default function GameList() {
  const [games, setGames] = useState<Game[]>(mockGames);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddGame = (formData: GameFormData) => {
    const newGame: Game = {
      id: games.length + 1,
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      image: formData.image || 'https://via.placeholder.com/500',
      releaseDate: formData.releaseDate,
      rating: formData.rating,
      sold: false, // За замовчуванням не продано
    };

    setGames([newGame, ...games]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Ігри 2024</Text>
        <Text style={styles.subtitle}>
          {games.length} {games.length === 1 ? 'гра' : 'ігор'} доступно
        </Text>
      </View>

      <FlatList
        data={games}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <GameCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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