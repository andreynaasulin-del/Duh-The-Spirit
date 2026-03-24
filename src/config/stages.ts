import type { Stage } from '@/types/game';

export const STAGES: Stage[] = [
  { name: 'Пробуждение', days: [1, 2, 3], checkpoint: true },
  { name: 'Первые шаги', days: [4, 5, 6, 7], checkpoint: false },
  { name: 'Суета', days: [8, 9, 10, 11, 12], checkpoint: true },
  { name: 'Тёмные воды', days: [13, 14, 15, 16, 17, 18], checkpoint: false },
  { name: 'Переломный момент', days: [19, 20, 21, 22, 23], checkpoint: true },
  { name: 'Восхождение', days: [24, 25, 26, 27, 28, 29, 30], checkpoint: false },
  { name: 'Кульминация', days: [31, 32, 33, 34, 35], checkpoint: true },
  { name: 'Эпилог', days: [36, 37, 38, 39, 40], checkpoint: true },
];
