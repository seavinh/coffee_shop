export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface CustomizationOption {
  sizes: { label: string; priceExtra: number }[];
  milkChoices: { label: string; priceExtra: number }[];
  sweetnessLevels: string[];
  temperatures: string[];
  extraShotPrice: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  roastLevel?: 'Light' | 'Medium' | 'Dark' | 'Omni';
  tags: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  customization?: CustomizationOption;
}
