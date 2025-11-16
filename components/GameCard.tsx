import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Game } from '../models/game';

type Props = {
  item: Game;
  onToggleWishlist?: () => void;
  onMarkAsViewed?: () => void;
};

const GameCard = ({ item, onToggleWishlist, onMarkAsViewed }: Props) => {
  const getRatingEmoji = (rating: 'low' | 'medium' | 'high') => {
    switch (rating) {
      case 'low': return '⭐';
      case 'medium': return '⭐⭐';
      case 'high': return '⭐⭐⭐';
    }
  };

  const isUpcoming = new Date(item.releaseDate) > new Date();
  const daysUntilRelease = isUpcoming 
    ? Math.ceil((new Date(item.releaseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <View style={[styles.card, item.sold && styles.cardSold]}>

    
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/500' }} 
          style={styles.image} 
        />

     
        {onToggleWishlist && (
          <TouchableOpacity
            style={styles.topRightButton}
            onPress={onToggleWishlist}
          >
            <Text style={styles.buttonEmoji}>
              {item.isWishlist ? '💝' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}

      
        {onMarkAsViewed && (
          <TouchableOpacity
            style={[styles.topRightButton, { top: 38 }]}
            onPress={onMarkAsViewed}
          >
            <Text style={styles.buttonEmoji}>
              {item.isViewed ? '👁️' : '🕶️'}
            </Text>
          </TouchableOpacity>
        )}

        {item.isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>🆕 NEW</Text>
          </View>
        )}
        
        {(item as any).discountPercent ? (
          <View style={[styles.badge, styles.saleBadge]}>
            <Text style={styles.badgeText}>-{(item as any).discountPercent}%</Text>
          </View>
        ) : null}
        
        {isUpcoming && (
          <View style={[styles.badge, styles.upcomingBadge]}>
            <Text style={styles.badgeText}>🎮 {daysUntilRelease}д</Text>
          </View>
        )}
      </View>

      {/* --- INFO --- */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, item.sold && styles.titleSold]}>
            {item.title}
          </Text>

          {item.isWishlist && <Text style={styles.wishlistIcon}>💝</Text>}
          
          {item.sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>✓ Продано</Text>
            </View>
          )}
        </View>
        
        <View style={styles.metaRow}>
        <View style={styles.priceContainer}>
  {item.originalPrice != null && (
    <Text style={styles.originalPrice}>
      ${(item.originalPrice ?? 0).toFixed(2)}
    </Text>
  )}
  <Text style={styles.salePrice}>💰 ${item.price.toFixed(2)}</Text>
</View>

          
          <Text style={styles.rating}>{getRatingEmoji(item.rating)}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'Немає опису'}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            📅 {isUpcoming ? 'Реліз: ' : ''}{item.releaseDate}
          </Text>
          
          {item.saleEndDate && (
            <Text style={styles.saleEnd}>
              ⏰ Акція до: {item.saleEndDate}
            </Text>
          )}
        </View>
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

  imageContainer: {
    position: 'relative',
  },

  image: {
    width: 100,
    height: 120,
    borderRadius: 8,
  },

  topRightButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 6,
  },

  buttonEmoji: {
    fontSize: 16,
    color: '#fff',
  },

  badge: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadge: {
    top: 4,
    left: 4,
    backgroundColor: '#10B981',
  },
  saleBadge: {
    top: 4,
    right: 30,
    backgroundColor: '#EF4444',
  },
  upcomingBadge: {
    bottom: 4,
    left: 4,
    backgroundColor: '#3B82F6',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },

  info: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  wishlistIcon: {
    fontSize: 16,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  salePrice: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '700',
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

  footer: {
    gap: 2,
  },

  date: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  saleEnd: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
});
