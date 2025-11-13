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