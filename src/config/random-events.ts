import type { SeasonId } from './seasons';

export interface RandomEvent {
  id: string;
  text: string;
  season?: SeasonId | 'all';
  chance: number; // 0-1, probability per action
  effect: {
    cash?: number;
    respect?: number;
    fame?: number;
    mood?: number;
    stability?: number;
    energy?: number;
    health?: number;
  };
  emoji: string;
}

export const RANDOM_EVENTS: RandomEvent[] = [
  // === POSITIVE ===
  { id: 'find_cash', text: 'Нашёл 200₽ в кармане старой куртки.', chance: 0.05, emoji: '💵', effect: { cash: 200, mood: 5 } },
  { id: 'stranger_respect', text: 'Незнакомец узнал тебя: «Йо, ты тот парень!»', chance: 0.04, emoji: '🤝', effect: { respect: 2, mood: 10 } },
  { id: 'good_food', text: 'Бабушка с первого этажа угостила пирожками.', chance: 0.04, emoji: '🥧', effect: { mood: 15, energy: 10 } },
  { id: 'cat_friend', text: 'Дворовый кот запрыгнул на колени. Маленькая радость.', chance: 0.05, emoji: '🐱', effect: { mood: 10, stability: 5 } },
  { id: 'viral_clip', text: 'Кто-то запостил твой фристайл. +50 просмотров.', chance: 0.03, emoji: '📱', effect: { fame: 3, mood: 10 } },
  { id: 'sunset', text: 'Закат над крышами. Красиво, даже здесь.', chance: 0.04, emoji: '🌅', effect: { mood: 8, stability: 5 } },

  // === NEGATIVE ===
  { id: 'pickpocket', text: 'Карман порезали в толпе. –300₽.', chance: 0.04, emoji: '🔪', effect: { cash: -300, mood: -10 } },
  { id: 'rain', text: 'Промок до нитки. Настроение на нуле.', chance: 0.05, emoji: '🌧️', effect: { mood: -10, energy: -5 } },
  { id: 'noise', text: 'Соседи орали всю ночь. Не выспался.', chance: 0.04, emoji: '🔊', effect: { energy: -15, mood: -5 } },
  { id: 'police_check', text: 'Полиция проверила документы. Нервы.', chance: 0.03, emoji: '🚔', effect: { stability: -10, mood: -5 } },
  { id: 'broken_phone', text: 'Телефон глюкнул. Потерял все демки.', chance: 0.02, emoji: '📵', effect: { mood: -20, stability: -5 } },

  // === SEASON-SPECIFIC ===
  { id: 'autumn_melancholy', text: 'Серое небо давит. Сегодня всё тяжелее.', season: 'autumn', chance: 0.08, emoji: '🍂', effect: { mood: -15, stability: -5 } },
  { id: 'winter_panic', text: 'Сердце забилось без причины. Паника.', season: 'winter', chance: 0.10, emoji: '❄️', effect: { stability: -15, energy: -10 } },
  { id: 'spring_idea', text: 'ИДЕЯ! Проснулся в 3 ночи с гениальным хуком.', season: 'spring', chance: 0.10, emoji: '💡', effect: { mood: 25, energy: -10, stability: -5 } },
  { id: 'spring_spend', text: 'Купил студийное оборудование не думая. –2000₽.', season: 'spring', chance: 0.06, emoji: '🛒', effect: { cash: -2000, mood: 15 } },
  { id: 'summer_party', text: 'Затянули на вечеринку. Утро — в тумане.', season: 'summer', chance: 0.08, emoji: '🎉', effect: { mood: 10, energy: -20, stability: -5 } },
  { id: 'summer_studio', text: 'Студия была свободна ночью. Записал огненный куплет.', season: 'summer', chance: 0.07, emoji: '🎤', effect: { fame: 3, mood: 15, energy: -10 } },

  // === NEUTRAL / LORE ===
  { id: 'graffiti', text: 'Новое граффити на стене: "Не сдавайся".', chance: 0.05, emoji: '🎨', effect: { mood: 5 } },
  { id: 'ambulance', text: 'Скорая проехала с сиреной. Кому-то хуже.', chance: 0.04, emoji: '🚑', effect: { stability: -3 } },
  { id: 'dog', text: 'Бездомный пёс бежит за тобой. Верный спутник.', chance: 0.03, emoji: '🐕', effect: { mood: 10 } },
  { id: 'old_man', text: 'Старик на лавочке: «Я тоже мечтал стать музыкантом...»', chance: 0.03, emoji: '👴', effect: { mood: -5, stability: 5 } },
];

/**
 * Roll for a random event after an action.
 * Returns null if no event triggers.
 */
export function rollRandomEvent(currentSeason: SeasonId): RandomEvent | null {
  // Shuffle to avoid bias
  const shuffled = [...RANDOM_EVENTS].sort(() => Math.random() - 0.5);

  for (const event of shuffled) {
    // Skip season-specific events that don't match
    if (event.season && event.season !== 'all' && event.season !== currentSeason) continue;

    // Roll dice
    if (Math.random() < event.chance) {
      return event;
    }
  }

  return null;
}
