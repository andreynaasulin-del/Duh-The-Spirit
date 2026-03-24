import type { QuestDef } from '@/types/quest';

export const QUESTS: Record<string, QuestDef> = {
  story_hustle: {
    id: 'story_hustle', npc: 'shadow', title: 'Уличная школа', description: 'Твоя Тень требует действия. Выйди на улицу и покажи, что ты ещё в деле.', type: 'main',
    objectives: [
      { id: 'hustle', type: 'action_completed', target: 3, actionId: 'street_hustle' },
      { id: 'cash_check', type: 'kpi_reached', target: 1000, kpi: 'cash' },
    ],
    rewards: { energy: 30, stability: 15, cash: 500 },
    unlocks: ['story_studio_time'],
  },
  story_studio_time: {
    id: 'story_studio_time', npc: 'zef', title: 'Первый шум', description: 'Зеф оценил твою наглость. Запиши свой первый трек.', type: 'main',
    objectives: [
      { id: 'studio', type: 'action_completed', target: 1, actionId: 'studio_session' },
      { id: 'fame_gain', type: 'kpi_reached', target: 50, kpi: 'fame' },
    ],
    rewards: { fame: 50, respect: 20, cash: 1000 },
    unlocks: ['story_alchemist_trust'], minRelationship: 10,
  },
  story_alchemist_trust: {
    id: 'story_alchemist_trust', npc: 'alchemist', title: 'Тёмные сделки', description: 'Алхимик готов открыть тебе доступ к редким ресурсам.', type: 'main',
    objectives: [
      { id: 'buy_gear', type: 'items_bought', target: 1 },
      { id: 'chaos_level', type: 'stat_reached', target: 15, stat: 'chaos' },
    ],
    rewards: { path_chaos: 10, respect: 30, energy: 50 },
    unlocks: ['story_doctor_session'], minRelationship: 5,
  },
  story_doctor_session: {
    id: 'story_doctor_session', npc: 'bones', title: 'Сеанс у специалиста', description: 'Шум в голове нарастает. Док Бонс может помочь.', type: 'main',
    objectives: [
      { id: 'session', type: 'action_completed', target: 1, actionId: 'doctor_session' },
      { id: 'adequacy_up', type: 'stat_reached', target: 80, stat: 'adequacy' },
    ],
    rewards: { stability: 40, adequacy: 20 },
    minRelationship: 15,
  },
  side_casino_win: {
    id: 'side_casino_win', npc: 'spirit', title: 'Улыбка фортуны', description: 'Удача непостоянна. Докажи ей свою преданность.', type: 'side',
    objectives: [
      { id: 'bet_win', type: 'action_completed', target: 5, actionId: 'casino_win' },
    ],
    rewards: { path_chaos: 2 },
  },
};
