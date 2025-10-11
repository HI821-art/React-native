import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Game } from '../models/game';

type Props = {
  item: Game;
};

const GameCard = ({ item }: Props) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>💰 ${item.price}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

export default GameCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    color: '#007AFF',
    marginVertical: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});