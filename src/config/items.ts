import type { ItemDef } from '@/types/common';

export const ITEMS: ItemDef[] = [
  // ========== УЛИЦА (Street Food & Energy) ==========
  { id: 'doshik', name: 'Дошик', desc: 'Лапша быстрого приготовления. Классика жанра.', effectText: '+20 сытости', price: 150, icon: 'soup', category: 'street', tier: 'common', consumable: true, effects: { hunger: 20 } },
  { id: 'shawarma', name: 'Шаурма', desc: 'С подворотни у метро. Мясо непонятное, но вкусно.', effectText: '+45 сытости', price: 350, icon: 'sandwich', category: 'street', tier: 'common', consumable: true, effects: { hunger: 45 } },
  { id: 'redbull', name: 'Red Bull', desc: 'Крылья? Не, но бодрит на несколько часов.', effectText: '+30 энергии', price: 250, icon: 'coffee', category: 'street', tier: 'common', consumable: true, effects: { energy: 30 } },
  { id: 'tornado', name: 'Tornado', desc: 'Энергетик для тех, кому Red Bull слабоват.', effectText: '+55 энергии, -5 HP', price: 450, icon: 'zap', category: 'street', tier: 'rare', consumable: true, effects: { energy: 55, health: -5 } },
  { id: 'cigarettes', name: 'Крепкий чай', desc: 'Горький, но успокаивает нервы.', effectText: '+15 стабильности, -5 HP', price: 200, icon: 'coffee', category: 'street', tier: 'common', consumable: true, effects: { stability: 15, health: -5 } },
  { id: 'cheap_vodka', name: 'Зелье храбрости', desc: 'Старый рецепт. Согревает душу, но бьёт по здоровью.', effectText: '+20 Mood, +10 Stability, -10 HP', price: 300, icon: 'wine', category: 'street', tier: 'common', consumable: true, effects: { mood: 20, stability: 10, health: -10, withdrawal: 10 } },
  { id: 'banquet', name: 'Банкет', desc: 'Нормальный обед в нормальном заведении. Редкость.', effectText: '+80 сытости, +25 энергии', price: 1500, icon: 'utensils', category: 'street', tier: 'epic', consumable: true, effects: { hunger: 80, energy: 25 } },

  // ========== ФАРМА (Medical) ==========
  { id: 'bandage', name: 'Бинт', desc: 'Базовая перевязка. Остановит кровь.', effectText: '+15 HP', price: 200, icon: 'bandage', category: 'pharma', tier: 'common', consumable: true, effects: { health: 15 } },
  { id: 'painkillers', name: 'Кетанов', desc: 'Снимает любую боль. На время.', effectText: '+30 HP', price: 400, icon: 'pill', category: 'pharma', tier: 'common', consumable: true, effects: { health: 30 } },
  { id: 'medkit', name: 'Армейская аптечка', desc: 'Всё что нужно для полевой хирургии.', effectText: '+60 HP', price: 1500, icon: 'cross', category: 'pharma', tier: 'rare', consumable: true, effects: { health: 60 } },
  { id: 'vitamins', name: 'Витаминки', desc: 'Компливит. Чтобы не развалиться окончательно.', effectText: '+5 HP, +5 Energy', price: 150, icon: 'pill', category: 'pharma', tier: 'common', consumable: true, effects: { health: 5, energy: 5 } },
  { id: 'adrenaline', name: 'Адреналин', desc: 'Экстренный стимулятор. Последний шанс.', effectText: '+100 Energy, -20 Stability', price: 3000, icon: 'zap', category: 'pharma', tier: 'epic', consumable: true, effects: { energy: 100, stability: -20 } },
  { id: 'stabilizer', name: 'Стабилизатор', desc: 'Седативный сбор. Снимает напряжение.', effectText: '+40 стабильности', price: 1200, icon: 'leaf', category: 'pharma', tier: 'rare', consumable: true, effects: { stability: 40 } },
  { id: 'nanomed', name: 'Экспериментальная сыворотка', desc: 'Украдено из военной лаборатории. Работает.', effectText: 'Полное восстановление HP', price: 15000, icon: 'dna', category: 'pharma', tier: 'legendary', consumable: true, effects: { health: 100 } },

  // ========== СТУДИЯ (Equipment — non-consumable) ==========
  { id: 'earbuds', name: 'AirPods Pro', desc: 'Слушай биты в любом месте.', effectText: '+5% качество записи', price: 8000, icon: 'headphones', category: 'studio', tier: 'common', consumable: false, effects: { studioBonus: 5 } },
  { id: 'mic_sm58', name: 'Shure SM58', desc: 'Легенда. Им пели все — от Кобейна до Моргенштерна.', effectText: '+15% качество записи', price: 25000, icon: 'mic', category: 'studio', tier: 'rare', consumable: false, effects: { studioBonus: 15 } },
  { id: 'laptop_mac', name: 'MacBook Pro', desc: 'FL Studio, Ableton, Logic — всё твоё.', effectText: '+200₽/день, +10% студия', price: 120000, icon: 'laptop', category: 'studio', tier: 'epic', consumable: false, effects: { passiveIncome: 200, studioBonus: 10 } },
  { id: 'gold_chain', name: 'Золотая цепь 585', desc: '150 грамм чистого флекса.', effectText: '+50 Fame, +10% в баттлах', price: 180000, icon: 'link', category: 'studio', tier: 'legendary', consumable: false, effects: { fame: 50, battleBonus: 10 } },

  // ========== ЧЁРНЫЙ РЫНОК ==========
  { id: 'burner', name: 'Левый телефон', desc: 'Не привязан ни к чему. Для дел.', effectText: '-10% подозрение', price: 5000, icon: 'smartphone', category: 'black', tier: 'common', consumable: false, effects: { suspicionReduction: 10 } },
  { id: 'city_map', name: 'Карта ходов', desc: 'Все закоулки, дворы, крыши.', effectText: '-20% риск на улице', price: 8000, icon: 'map', category: 'black', tier: 'rare', consumable: false, effects: { riskReduction: 20 } },
  { id: 'hack_tool', name: 'Флиппер Зеро', desc: 'Мультитул хакера.', effectText: '+15% шанс успеха взлома', price: 12000, icon: 'wifi-off', category: 'black', tier: 'rare', consumable: false, effects: { hackingSkill: 15 } },
  { id: 'police_scanner', name: 'Полицейская рация', desc: 'Слушай их частоты.', effectText: '-30% риск ареста', price: 35000, icon: 'radio', category: 'black', tier: 'epic', consumable: false, effects: { arrestRiskReduction: 30 } },
  { id: 'fake_passport', name: 'Поддельный паспорт', desc: 'Полный комплект: паспорт, права, СНИЛС.', effectText: '-50% риск ареста', price: 250000, icon: 'id-card', category: 'black', tier: 'legendary', consumable: false, effects: { arrestRiskReduction: 50 } },
  { id: 'vip_bratva', name: 'Крыша от братвы', desc: 'Серьёзные люди теперь на твоей стороне.', effectText: '+100 Fame, иммунитет', price: 500000, icon: 'handshake', category: 'black', tier: 'legendary', consumable: false, effects: { fame: 100 } },

  // ========== СПЕЦИАЛЬНЫЕ ==========
  { id: 'secret_stash', name: 'Секретный тайник', desc: 'Место для ценного.', effectText: '+10,000 к лимиту кэша', price: 25000, icon: 'package', category: 'special', tier: 'epic', consumable: false, effects: { maxCash: 10000 } },
  { id: 'crypto_wallet', name: 'Крипто-ферма', desc: 'Майнит пока ты спишь.', effectText: '+150₽/день', price: 15000, icon: 'cpu', category: 'special', tier: 'rare', consumable: false, effects: { passiveIncome: 150 } },
  { id: 'golden_ticket', name: 'Золотой пропуск', desc: 'VIP-зона клуба.', effectText: 'VIP статус', price: 50000, icon: 'ticket', category: 'special', tier: 'legendary', consumable: false, effects: { clubVip: 1 } },
  { id: 'shadow_vpn', name: 'Shadow VPN', desc: 'Твой трафик не видит даже майор.', effectText: '-10% риск', price: 10000, icon: 'shield-check', category: 'special', tier: 'rare', consumable: false, effects: { securityLevel: 10 } },

  // ========== НЕЙРО ==========
  { id: 'shard_os_history', name: 'Дата-осколок: История PRYTON_OS', desc: 'Поврежденный файл о разработке нейросети.', effectText: '+5% Синхро', price: 5000, icon: 'database', category: 'black', tier: 'rare', consumable: true, effects: { synchronization: 5 } },
  { id: 'neuro_calm', name: 'Нейро-стек: Спокойствие', desc: 'Патч для коры головного мозга.', effectText: '+25 Стабильность', price: 3500, icon: 'activity', category: 'black', tier: 'rare', consumable: true, effects: { stability: 25 } },
  { id: 'dopamine_injector', name: 'Дофаминовый инжектор', desc: 'Прямой впрыск. Эйфория гарантирована.', effectText: '+50 Mood, -15 Стаб', price: 4500, icon: 'flask-conical', category: 'street', tier: 'rare', consumable: true, effects: { mood: 50, stability: -15 } },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find(i => i.id === id);
}

export function getItemsByCategory(category: string): ItemDef[] {
  return ITEMS.filter(i => i.category === category);
}
