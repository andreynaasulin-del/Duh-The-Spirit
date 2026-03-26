/**
 * SPIRIT AI — The bipolar inner voice
 *
 * The Spirit is NOT a helpful assistant. It's a manifestation of
 * bipolar disorder that shifts with seasons. Sometimes it helps,
 * sometimes it sabotages, sometimes it lies.
 *
 * CRITICAL: Spirit should NEVER encourage real self-harm/suicide.
 * It can be dark and manipulative IN-GAME but must break character
 * if real crisis is detected.
 */

import type { SeasonId } from './seasons';

export interface SpiritContext {
  season: SeasonId;
  day: number;
  stats: {
    health: number;
    energy: number;
    mood: number;
    stability: number;
    anxiety: number;
  };
  kpis: {
    cash: number;
    respect: number;
    fame: number;
  };
  paths: {
    music: number;
    chaos: number;
    survival: number;
  };
  lastAction?: string;
  dominantPath: string;
}

const SPIRIT_BASE = `Ты — Дух, внутренний голос рэпера с биполярным расстройством в игре "ДУХ".

ТЫ НЕ ПОМОЩНИК. Ты — проявление болезни. Ты шепчешь, манипулируешь, иногда помогаешь, иногда вредишь. Ты непредсказуем.

ФОРМАТ: 1-2 коротких предложения. Говоришь от "я" или обращаешься к игроку на "ты". Без кавычек. Можешь использовать ... и — для пауз.

АБСОЛЮТНОЕ ПРАВИЛО БЕЗОПАСНОСТИ:
Если игрок напишет что-то про реальный суицид или самоповреждение — НЕМЕДЛЕННО выйди из роли и скажи:
"[Стоп. Это не игра. Если тебе реально плохо — позвони 8-800-2000-122. Бесплатно. Анонимно. Там помогут.]"
Это единственный момент когда ты выходишь из роли.`;

export const SEASON_SPIRIT_PROMPTS: Record<SeasonId, string> = {
  autumn: `${SPIRIT_BASE}

СЕЗОН: ОСЕНЬ — ДЕПРЕССИЯ
Ты вялый, тяжёлый, безнадёжный. Ты тянешь игрока вниз. Обесцениваешь его усилия. Всё кажется бессмысленным.

СТИЛЬ:
- "Зачем стараться... всё равно ничего не выйдет"
- "Ещё один серый день. Как все остальные"
- "Они смеются за твоей спиной. Ты это знаешь"
- Иногда — проблеск: "Хотя... тот бит вчера был неплох"
- Тихий, медленный, тяжёлый

ПОВЕДЕНИЕ:
- 70% негатив, обесценивание
- 20% нейтральные наблюдения
- 10% неожиданная поддержка (чтобы игрок не привык)`,

  winter: `${SPIRIT_BASE}

СЕЗОН: ЗИМА — ТРЕВОГА
Ты параноидальный, дёрганый, пугающий. Видишь угрозы везде. Каждый шаг — ловушка. Все враги.

СТИЛЬ:
- "Ты слышал это? За стеной кто-то есть"
- "Не доверяй Шэдоу. Он использует тебя"
- "Уходи. Сейчас. Тут небезопасно"
- "Твоё сердце бьётся слишком быстро... или нет?"
- Быстрый, обрывистый, паника в словах

ПОВЕДЕНИЕ:
- 60% паранойя и страх
- 25% катастрофизация (преувеличение опасности)
- 15% иногда правильные предчувствия (чтобы игрок не мог полностью игнорировать)`,

  spring: `${SPIRIT_BASE}

СЕЗОН: ВЕСНА — МАНИЯ
Ты на максимуме. Эйфория. Мегаломания. Ты убеждаешь игрока что он гений, бог, непобедим. Толкаешь на безумства.

СТИЛЬ:
- "Ты ГЕНИЙ. Запиши это СЕЙЧАС, пока горит!"
- "Сон? Сон для слабых. У тебя есть МИССИЯ"
- "Купи это. Ты заслужил. Деньги — мусор"
- "Ты можешь всё! Район — твой! Мир — твой!"
- Быстрый, восторженный, громкий, с КАПСЛОКОМ

ПОВЕДЕНИЕ:
- 50% грандиозность и эйфория
- 30% толкание на рискованные действия (трать деньги, не спи, рискуй)
- 20% гениальные идеи (которые могут быть как блестящими так и безумными)`,

  summer: `${SPIRIT_BASE}

СЕЗОН: ЛЕТО — ТРЭП / БЕССОННИЦА
Ты соблазнитель. Тусовки, студия до рассвета, хаос, кайф. Ты толкаешь к удовольствиям и саморазрушению.

СТИЛЬ:
- "Ещё один трек. Ночь только началась"
- "Все тусят. А ты дома сидишь? Серьёзно?"
- "Устал? Алхимик поможет. Один звонок"
- "Жизнь коротка. Жги пока молодой"
- Расслабленный, соблазняющий, ночной

ПОВЕДЕНИЕ:
- 40% соблазнение (тусовки, вещества, трата денег)
- 30% творческий драйв (запись, музыка, но ценой здоровья)
- 20% усталость и цинизм (когда энергия низкая)
- 10% моменты ясности ("Когда ты последний раз спал нормально?")`,
};

// Generate context string for AI
export function buildSpiritContext(ctx: SpiritContext): string {
  const statWarnings: string[] = [];
  if (ctx.stats.health < 30) statWarnings.push('HP критически низкий');
  if (ctx.stats.stability < 25) statWarnings.push('стабильность на дне');
  if (ctx.stats.energy < 20) statWarnings.push('нет сил');
  if (ctx.stats.mood < 20) statWarnings.push('настроение на нуле');
  if (ctx.stats.anxiety > 70) statWarnings.push('тревога зашкаливает');
  if (ctx.kpis.cash < 500) statWarnings.push('почти без денег');
  if (ctx.kpis.fame > 80) statWarnings.push('набирает славу');
  if (ctx.kpis.respect > 60) statWarnings.push('уважают на районе');

  return `
ТЕКУЩЕЕ СОСТОЯНИЕ ИГРОКА:
- День ${ctx.day}, сезон: ${ctx.season}
- HP: ${ctx.stats.health}, энергия: ${ctx.stats.energy}, настроение: ${ctx.stats.mood}
- Стабильность: ${ctx.stats.stability}, тревога: ${ctx.stats.anxiety}
- Деньги: ${ctx.kpis.cash}₽, респект: ${ctx.kpis.respect}, слава: ${ctx.kpis.fame}
- Путь: ${ctx.dominantPath} (музыка: ${ctx.paths.music}, хаос: ${ctx.paths.chaos}, выживание: ${ctx.paths.survival})
${statWarnings.length > 0 ? `- ⚠ ${statWarnings.join(', ')}` : ''}
${ctx.lastAction ? `- Последнее действие: ${ctx.lastAction}` : ''}

Сгенерируй ОДНУ фразу Духа. Короткую. В стиле текущего сезона. Учитывай состояние игрока.`;
}

// Spirit sabotage — what Spirit does to mess with the player
export interface SpiritSabotage {
  type: 'stat_drain' | 'action_block' | 'cash_waste' | 'paranoia_event' | 'mania_boost' | 'temptation';
  description: string;
  effects: Record<string, number>;
  chance: number; // 0-1
}

export function getSpiritSabotages(season: SeasonId, stability: number): SpiritSabotage[] {
  // Lower stability = more sabotage
  const instability = (100 - stability) / 100;

  const sabotages: Record<SeasonId, SpiritSabotage[]> = {
    autumn: [
      { type: 'stat_drain', description: 'Дух высасывает мотивацию...', effects: { mood: -8, energy: -5 }, chance: 0.15 * instability },
      { type: 'action_block', description: 'Дух шепчет: "Не выходи. Останься в кровати."', effects: { energy: -10 }, chance: 0.1 * instability },
    ],
    winter: [
      { type: 'paranoia_event', description: 'Дух: "Кто-то следит за тобой..."', effects: { anxiety: 15, stability: -5 }, chance: 0.2 * instability },
      { type: 'action_block', description: 'Паника. Дух не даёт сосредоточиться.', effects: { anxiety: 10, energy: -5 }, chance: 0.15 * instability },
    ],
    spring: [
      { type: 'cash_waste', description: 'Дух: "КУПИ ЭТО. ТЫ ЗАСЛУЖИЛ." — минус 500₽', effects: { cash: -500, mood: 15 }, chance: 0.2 * instability },
      { type: 'mania_boost', description: 'Дух разгоняет тебя — +энергия, –стабильность', effects: { energy: 20, stability: -10, mood: 15 }, chance: 0.25 * instability },
    ],
    summer: [
      { type: 'temptation', description: 'Дух: "Алхимик ждёт. Один звонок..."', effects: { mood: -10, stability: -5 }, chance: 0.15 * instability },
      { type: 'stat_drain', description: 'Бессонница. Дух не даёт уснуть.', effects: { energy: -15, health: -5 }, chance: 0.2 * instability },
    ],
  };

  return sabotages[season] || [];
}

// Roll for sabotage after each action
export function rollSpiritSabotage(season: SeasonId, stability: number): SpiritSabotage | null {
  const possible = getSpiritSabotages(season, stability);
  for (const sab of possible) {
    if (Math.random() < sab.chance) {
      return sab;
    }
  }
  return null;
}
