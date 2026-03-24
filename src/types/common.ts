export type ItemCategory = 'street' | 'pharma' | 'studio' | 'black' | 'special';
export type ItemTier = 'common' | 'rare' | 'epic' | 'legendary';

export interface ItemDef {
  id: string;
  name: string;
  desc: string;
  effectText: string;
  price: number;
  icon: string;
  category: ItemCategory;
  tier: ItemTier;
  consumable: boolean;
  effects: Record<string, number>;
}

export interface ActionDef {
  id: string;
  icon: string;
  title: string;
  meta: string;
  time: number;
  effects: Record<string, number | [number, number]>;
  paths?: Record<string, number>;
  category: 'home' | 'street' | 'farm' | 'club' | 'music' | 'survival' | 'creative' | 'special';
  condition?: string;
  requires?: string[];
  minStats?: Record<string, number>;
}

export type UpgradeCategory = 'comfort' | 'kitchen' | 'studio' | 'security' | 'vibe' | 'utility' | 'production';

export interface HomeUpgradeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
  tier: ItemTier;
  category: UpgradeCategory;
  effects: Record<string, number | boolean>;
  requires?: string[];
  unlocks?: string[];
}

export interface GPUDef {
  id: string;
  name: string;
  hashrate: number;
  power: number;
  price: number;
  temp: number;
}

export interface CoolerDef {
  id: string;
  name: string;
  cooling: number;
  price: number;
}

export interface SeedDef {
  id: string;
  name: string;
  growTime: number;
  baseQuality: number;
  price: number;
  yield: number;
}

export interface ImplantDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
  stabilityPenalty: number;
  maxStabilityReduction: number;
  effects: Record<string, number | boolean>;
}

export interface MedicationDef {
  id: string;
  name: string;
  desc: string;
  price: number;
  effects: Record<string, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
