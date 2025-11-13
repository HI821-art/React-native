import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Game } from '../models/game';

type Props = {
  item: Game;
};

const GameCard = ({ item }: Props) => {
  const getRatingEmoji = (rating: 'low' | 'medium' | 'high') => {
    switch (rating) {
      case 'low': return '⭐';
      case 'medium': return '⭐⭐';
      case 'high': return '⭐⭐⭐';
    }
  };

  return (
    <View style={[styles.card, item.sold && styles.cardSold]}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/500' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, item.sold && styles.titleSold]}>
            {item.title}
          </Text>
          {item.sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>✓ Продано</Text>
            </View>
          )}
        </View>
        
        <View style={styles.metaRow}>
          <Text style={styles.price}>💰 ${item.price}</Text>
          <Text style={styles.rating}>{getRatingEmoji(item.rating)}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'Немає опису'}
        </Text>
        
        <Text style={styles.date}>📅 {item.releaseDate}</Text>
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
  cardSold: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: 100,
    height: 120,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  titleSold: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  soldBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soldText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  price: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  rating: {
    fontSize: 12,
  },
  category: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
