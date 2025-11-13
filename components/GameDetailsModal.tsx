import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { Game } from '../database/schema';

type Props = {
  visible: boolean;
  game: Game | null;
  onClose: () => void;
};

const GameDetailsModal = ({ visible, game, onClose }: Props) => {
  if (!game) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView>
            <Image
              source={{ uri: game.image || 'https://via.placeholder.com/500' }}
              style={styles.image}
            />

            <View style={styles.headerRow}>
              <Text style={styles.title}>{game.title}</Text>
              {game.sold && (
                <Text style={styles.soldBadge}>✓ Продано</Text>
              )}
            </View>

            <Text style={styles.price}>💰 {game.price.toFixed(2)} $</Text>
            <Text style={styles.rating}>Рейтинг: {game.rating === 'low' ? '⭐' : game.rating === 'medium' ? '⭐⭐' : '⭐⭐⭐'}</Text>

            <Text style={styles.label}>Категорія: <Text style={styles.value}>{game.category}</Text></Text>
            <Text style={styles.label}>Дата виходу: <Text style={styles.value}>{game.releaseDate}</Text></Text>

            <Text style={[styles.label, { marginTop: 10 }]}>Опис:</Text>
            <Text style={styles.description}>
              {game.description || 'Опис відсутній'}
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Закрити</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default GameDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  image: {
    width: '100%',
    height: 200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  soldBadge: {
    backgroundColor: '#10B981',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  rating: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  value: {
    fontWeight: '400',
    color: '#111827',
  },
  description: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    margin: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
