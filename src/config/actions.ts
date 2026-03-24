import type { ActionDef } from '@/types/common';

export const ACTIONS: ActionDef[] = [
  // === Музыка/контент ===
  { id: 'write_lyrics', icon: 'edit-3', title: 'Писать текст', meta: '+настрой, +стабильность (1ч)', time: 60, effects: { mood: 15, stability: 10 }, paths: { music: 2 }, category: 'home' },
  { id: 'studio_session', icon: 'mic-2', title: 'Студия: записать куплет', meta: '+релизы, –энергия (2ч)', time: 120, effects: { releases: 1, energy: -25 }, paths: { music: 3 }, category: 'home' },
  { id: 'street_concert', icon: 'music', title: 'Дворовый мини-концерт', meta: '+подписчики, +уважение (1ч)', time: 60, effects: { subscribers: [5, 15], respect: [1, 3], energy: -15 }, paths: { music: 2 }, category: 'street' },
  { id: 'stream', icon: 'tv', title: 'Стрим из дома', meta: '+подписчики, +кэш (3ч)', time: 180, effects: { subscribers: [10, 25], cash: [50, 150], mood: -10 }, paths: { music: 2 }, category: 'home' },
  { id: 'social_media_scroll', icon: 'smartphone', title: 'Скролл соцсетей', meta: '+подписчики, –настрой (45м)', time: 45, effects: { subscribers: [1, 5], mood: -10, energy: -5 }, paths: { music: 1 }, category: 'home' },

  // === Дом ===
  { id: 'meditation', icon: 'brain', title: 'Медитация', meta: '+стабильность, +адекватность (1ч)', time: 60, effects: { stability: 25, adequacy: 15, anxiety: -20 }, paths: { survival: 2 }, category: 'home' },
  { id: 'workout_home', icon: 'dumbbell', title: 'Домашняя тренировка', meta: '+здоровье, -энергия (45м)', time: 45, effects: { health: 15, energy: -20, mood: 10 }, paths: { survival: 1 }, category: 'home' },
  { id: 'clean_apartment', icon: 'spray-can', title: 'Уборка дома', meta: '+стабильность, +настроение (1ч)', time: 60, effects: { stability: 15, mood: 10, energy: -15 }, paths: { survival: 1 }, category: 'home' },
  { id: 'call_dealer', icon: 'phone', title: 'Позвонить алхимику', meta: '-усталость, -500₽ (15м)', time: 15, effects: { cash: -500, withdrawal: -30, health: -5 }, paths: { chaos: 1 }, category: 'home' },
  { id: 'sleep', icon: 'moon', title: 'Сон', meta: '+энергия, +здоровье (8ч)', time: 480, effects: { energy: 50, health: 15 }, paths: { survival: 1 }, category: 'home' },
  { id: 'eat_street_food', icon: 'utensils', title: 'Уличная еда', meta: '+сытость, -150₽ (30м)', time: 30, effects: { hunger: 25, health: [-5, 0], cash: -150 }, paths: { survival: 1 }, category: 'home' },
  { id: 'brew_coffee', icon: 'coffee', title: 'Крепкий кофе', meta: '+энергия, –HP (15м)', time: 15, effects: { energy: 40, health: -5, stability: -5 }, paths: { survival: 1 }, category: 'home' },
  { id: 'meditate_roof', icon: 'wind', title: 'Медитация на крыше', meta: '+стабильность, +адекватность (1ч)', time: 60, effects: { stability: 20, adequacy: 10, mood: 5 }, paths: { survival: 2 }, category: 'home' },
  { id: 'toxic_relax', icon: 'flask-conical', title: 'Алхимия настроения', meta: 'Эксперимент, риск побочек (2ч)', time: 120, effects: { mood: 30, stability: -10, adequacy: -15 }, paths: { chaos: 3 }, category: 'home' },

  // === Улица ===
  { id: 'street_hustle', icon: 'zap', title: 'Уличные дела', meta: '+кэш, +уважение, риск (2ч)', time: 120, effects: { cash: [200, 600], respect: [2, 5], health: [-10, 0] }, paths: { chaos: 2 }, category: 'street' },
  { id: 'shop_lift', icon: 'shopping-bag', title: 'Рискованная добыча', meta: '+сытость, риск последствий (1ч)', time: 60, effects: { hunger: 30, stability: [-20, 0] }, paths: { chaos: 1 }, category: 'street' },
  { id: 'alley_fight', icon: 'crosshair', title: 'Уличная разборка', meta: '+уважение, риск травмы (1ч)', time: 60, effects: { respect: [3, 8], health: [-15, 0] }, paths: { chaos: 2 }, category: 'street' },
  { id: 'courier', icon: 'bike', title: 'Халтура курьером', meta: '+₽300–500, –энергия (2ч)', time: 120, effects: { cash: [300, 500], energy: -20, hunger: -15 }, category: 'street' },
  { id: 'graffiti_bombing', icon: 'palette', title: 'Арт на районе', meta: '+респект, риск последствий (2ч)', time: 120, effects: { respect: [5, 10], mood: 15, stability: -5 }, paths: { chaos: 2 }, category: 'street' },
  { id: 'hack_atm', icon: 'laptop', title: 'Тёмная схема', meta: '+кэш, высокий риск (3ч)', time: 180, effects: { cash: [1000, 3000], stability: -15, adequacy: -5 }, paths: { chaos: 3 }, category: 'street' },
  { id: 'freestyle_battle', icon: 'mic', title: 'Фристайл баттл', meta: '+респект, +хайп (2ч)', time: 120, effects: { respect: [10, 25], mood: 10, energy: -20 }, paths: { music: 3 }, category: 'street' },
  { id: 'doctor_visit', icon: 'heart-pulse', title: 'Визит к специалисту', meta: '+HP, –500₽ (1ч)', time: 60, effects: { health: 25, cash: -500 }, paths: { survival: 2 }, category: 'street' },
  { id: 'rummage_trash', icon: 'trash-2', title: 'Поиск находок', meta: 'шанс найти полезное (30м)', time: 30, effects: { respect: -5, hunger: [0, 10], cash: [0, 50] }, paths: { survival: 1 }, category: 'street' },
  { id: 'gym_basement', icon: 'dumbbell', title: 'Качалка в подвале', meta: '+HP, +сила (1.5ч)', time: 90, effects: { health: 10, energy: -30, mood: 10 }, paths: { survival: 2 }, category: 'street' },
  { id: 'distribute_flyers', icon: 'file-text', title: 'Расклейка афиш', meta: '+подписчики (2ч)', time: 120, effects: { subscribers: [5, 15], energy: -25 }, paths: { music: 1 }, category: 'street' },
  { id: 'eavesdrop', icon: 'ear', title: 'Послушать район', meta: 'узнать слухи (1ч)', time: 60, effects: { stability: -5, adequacy: 5 }, paths: { chaos: 1 }, category: 'street' },

  // === Ферма ===
  { id: 'start_grow', icon: 'leaf', title: 'Теплица: запуск', meta: 'начать выращивание, -1500₽', time: 30, effects: { cash: -1500 }, condition: 'grow_start', paths: { chaos: 3 }, category: 'farm' },
  { id: 'tend_grow', icon: 'droplets', title: 'Теплица: уход', meta: 'снизить риск (30м)', time: 30, effects: {}, condition: 'grow_active', paths: { chaos: 1 }, category: 'farm' },
  { id: 'harvest_grow', icon: 'scissors', title: 'Теплица: сбор и сбыт', meta: '+кэш, риск последствий', time: 60, effects: { cash: [800, 1200], stability: [-30, 0] }, condition: 'grow_harvest', paths: { chaos: 2 }, category: 'farm' },

  // === Клуб / Студия ===
  { id: 'record_track', icon: 'mic', title: 'Записать трек', meta: '+релизы, –энергия (3ч)', time: 180, effects: { releases: 1, energy: -30, mood: 10 }, paths: { music: 3 }, category: 'club' },
  { id: 'mix_master', icon: 'sliders', title: 'Сведение и мастеринг', meta: '+качество релиза (2ч)', time: 120, effects: { releases: 1, energy: -20, cash: -300 }, paths: { music: 2 }, category: 'club' },
  { id: 'open_mic', icon: 'mic-2', title: 'Открытый микрофон', meta: '+респект, +подписчики (2ч)', time: 120, effects: { respect: [5, 15], subscribers: [10, 30], energy: -20 }, paths: { music: 2 }, category: 'club' },
  { id: 'rap_battle_club', icon: 'swords', title: 'Баттл в клубе', meta: '+респект или позор (2ч)', time: 120, effects: { respect: [10, 30], mood: [-10, 20], energy: -25 }, paths: { music: 3 }, category: 'club' },
  { id: 'network_producers', icon: 'users', title: 'Связи с продюсерами', meta: '+контакты, –кэш (2ч)', time: 120, effects: { cash: -500, respect: [3, 8], subscribers: [5, 20] }, paths: { music: 2 }, category: 'club' },
  { id: 'buy_beat', icon: 'shopping-cart', title: 'Купить бит', meta: '–2000₽, +качество (30м)', time: 30, effects: { cash: -2000, mood: 15 }, paths: { music: 1 }, category: 'club' },
  { id: 'shoot_video', icon: 'video', title: 'Снять клип', meta: '+подписчики, –5000₽ (4ч)', time: 240, effects: { cash: -5000, subscribers: [30, 80], respect: [5, 15], energy: -35 }, paths: { music: 3 }, category: 'club' },
  { id: 'club_party', icon: 'party-popper', title: 'Тусовка в клубе', meta: '+настрой, –стабильность (3ч)', time: 180, effects: { mood: 25, stability: -15, energy: -20, health: -5 }, paths: { chaos: 1 }, category: 'club' },
  { id: 'sell_merch', icon: 'shirt', title: 'Продать мерч', meta: '+кэш за респект (1ч)', time: 60, effects: { cash: [200, 800] }, paths: { music: 1 }, category: 'club' },
];

export function getAction(id: string): ActionDef | undefined {
  return ACTIONS.find(a => a.id === id);
}

export function getActionsByCategory(category: string): ActionDef[] {
  return ACTIONS.filter(a => a.category === category);
}
