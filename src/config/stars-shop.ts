export interface StarsProduct {
  id: string;
  title: string;
  description: string;
  stars: number;
  icon: string;
  effects: Record<string, number>;
  category: 'boost' | 'cosmetic' | 'unlock';
}

export const STARS_PRODUCTS: StarsProduct[] = [
  {
    id: 'energy_pack',
    title: 'Энергетик',
    description: 'Полное восстановление энергии',
    stars: 25,
    icon: 'zap',
    effects: { energy: 100 },
    category: 'boost',
  },
  {
    id: 'full_heal',
    title: 'Полное восстановление',
    description: 'HP, энергия, настроение — всё на максимум',
    stars: 75,
    icon: 'heart',
    effects: { health: 100, energy: 100, mood: 100 },
    category: 'boost',
  },
  {
    id: 'cash_injection',
    title: 'Спонсорский контракт',
    description: '+10,000₽ на счёт',
    stars: 150,
    icon: 'banknote',
    effects: { cash: 10000 },
    category: 'boost',
  },
];

export function getProduct(id: string): StarsProduct | undefined {
  return STARS_PRODUCTS.find(p => p.id === id);
}
