export type Game = {
  readonly id: number;
  title: string;
  price: number;
  description: string | null;
  category: string;
  image: string | null;
  releaseDate: string;
  rating: 'low' | 'medium' | 'high';
  
 
  sold: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  

  isWishlist?: boolean;             
  isNew?: boolean;                 
  isViewed?: boolean;                
  

  originalPrice?: number | null;     
  discountPercent?: number | null;   
  saleEndDate?: string | null;       
  
 
  notificationId?: string | null;  
  reminderDate?: string | null;      
  notifyOnRelease?: boolean;        
  saleNotificationId?: string | null; 
};

export type GameFormData = {
  title: string;
  price: string;
  description: string;
  category: string;
  image: string;
  releaseDate: string;
  rating: 'low' | 'medium' | 'high';
  
 
  notifyOnRelease?: boolean;         
};


export type SetSaleData = {
  gameId: number;
  discountPercent: number;
  saleEndDate: string;
};


export type GameStatistics = {
  total: number;
  sold: number;
  notSold: number;
  wishlist: number;
  newGames: number;
  onSale: number;
  totalValue: number;
  averagePrice: number;
  maxPrice: number;
  minPrice: number;
};


export type GameFilter = 
  | 'all'          
  | 'wishlist'     
  | 'new'         
  | 'sale'          
  | 'upcoming'     
  | 'sold';       


export type GameSort =
  | 'date-desc'    
  | 'date-asc'     
  | 'price-desc'   
  | 'price-asc'     
  | 'title-asc'    
  | 'rating-desc'   
  | 'release-asc';  

// ========================================
// HELPER FUNCTIONS
// ========================================

export const isGameOnSale = (game: Game): boolean => {
  if (!game.originalPrice || !game.saleEndDate) return false;
  
  const endDate = new Date(game.saleEndDate);
  const now = new Date();
  
  return endDate > now;
};


export const getDaysUntilRelease = (releaseDate: string): number => {
  const release = new Date(releaseDate);
  const now = new Date();
  const diff = release.getTime() - now.getTime();
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};


export const isUpcomingRelease = (releaseDate: string): boolean => {
  return getDaysUntilRelease(releaseDate) > 0;
};


export const getFinalPrice = (game: Game): number => {
  if (isGameOnSale(game)) {
    return game.price;
  }
  return game.originalPrice || game.price;
};


export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};


export const getStatusBadge = (game: Game): string | null => {
  if (game.sold) return '✓ Продано';
  if (game.isNew) return '🆕 NEW';
  if (isGameOnSale(game)) return `💰 -${game.discountPercent}%`;
  if (isUpcomingRelease(game.releaseDate)) {
    const days = getDaysUntilRelease(game.releaseDate);
    return `🎮 ${days}д`;
  }
  return null;
};


export const getRatingColor = (rating: 'low' | 'medium' | 'high'): string => {
  switch (rating) {
    case 'low': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'high': return '#10B981';
  }
};


export const getRatingEmoji = (rating: 'low' | 'medium' | 'high'): string => {
  switch (rating) {
    case 'low': return '⭐';
    case 'medium': return '⭐⭐';
    case 'high': return '⭐⭐⭐';
  }
};