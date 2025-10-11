export type Game = {
  readonly id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  releaseDate: string; // Дата релізу
  rating: 'low' | 'medium' | 'high'; // Рейтинг (замість пріоритету)
  sold: boolean; // Продано чи ні (замість done/to-do)
};

export type GameFormData = {
  title: string;
  price: string;
  description: string;
  category: string;
  image: string;
  releaseDate: string;
  rating: 'low' | 'medium' | 'high';
};