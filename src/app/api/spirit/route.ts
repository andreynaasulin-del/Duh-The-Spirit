import { NextRequest, NextResponse } from 'next/server';
import { SEASON_SPIRIT_PROMPTS, buildSpiritContext, type SpiritContext } from '@/config/spirit-prompts';
import { detectSafetyLevel } from '@/config/safety';

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_URL = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'deepseek/deepseek-chat-v3-0324';

export async function POST(req: NextRequest) {
  try {
    const ctx: SpiritContext = await req.json();

    if (!ctx.season || !ctx.stats) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    // If no AI key, use static fallbacks
    if (!AI_API_KEY) {
      return NextResponse.json({ whisper: getStaticWhisper(ctx) });
    }

    const systemPrompt = SEASON_SPIRIT_PROMPTS[ctx.season];
    const userPrompt = buildSpiritContext(ctx);

    const aiResponse = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
        'HTTP-Referer': 'https://duh-the-spirit.vercel.app',
        'X-Title': 'Duh The Spirit',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 80,
        temperature: 0.9, // High creativity for unpredictability
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ whisper: getStaticWhisper(ctx) });
    }

    const data = await aiResponse.json();
    let whisper = data.choices?.[0]?.message?.content || '';

    // Safety filter — Spirit should never cross the line
    const safety = detectSafetyLevel(whisper);
    if (safety === 'crisis') {
      whisper = getStaticWhisper(ctx);
    }

    // Clean up
    whisper = whisper.replace(/^["«]|["»]$/g, '').trim();
    if (whisper.length > 200) whisper = whisper.substring(0, 200) + '...';

    return NextResponse.json({ whisper });
  } catch {
    return NextResponse.json({ whisper: 'Тишина. Даже Дух молчит сегодня.' });
  }
}

// Static fallbacks per season
function getStaticWhisper(ctx: SpiritContext): string {
  const { season, stats, kpis } = ctx;

  const pool: Record<string, string[]> = {
    autumn: [
      'Ещё один день в этой дыре. Хочешь выбраться — действуй.',
      'Серые стены. Серое небо. Серая жизнь. Привыкай.',
      'Они все чего-то добились. А ты?',
      'Может, лечь и не вставать. Район подождёт.',
      stats.mood < 30 ? 'Дно. Ты на дне. Но дно — это фундамент.' : 'Тихо внутри. Слишком тихо.',
      kpis.cash < 500 ? 'Пустые карманы. Пустая душа.' : 'Деньги есть. А толку?',
    ],
    winter: [
      'Не выходи. Там опасно. Тут тоже, но хотя бы тепло.',
      'Слышишь шаги? Кто-то идёт. Или это сердце.',
      'Зэфу нельзя доверять. Никому нельзя.',
      'Стены сжимаются. Или это я?',
      stats.anxiety > 50 ? 'Дыши. Дыши. ДЫШИ.' : 'Тишина перед бурей.',
      stats.stability < 40 ? 'Ты разваливаешься. Я чувствую.' : 'Пока держишься. Пока.',
    ],
    spring: [
      'ТЫ ГЕНИЙ. Запиши это СЕЙЧАС.',
      'Сон — для тех кто сдался. Ты — нет.',
      'Весь район будет знать твоё имя. СКОРО.',
      'Купи что-нибудь. Ты заслужил. ТЫ ЗАСЛУЖИЛ.',
      stats.energy < 30 ? 'Устал? ЛОЖЬ. Ты только начал!' : 'ЭНЕРГИЯ. ЧУВСТВУЕШЬ? ЭТО СИЛА.',
      kpis.fame > 30 ? 'Слава растёт. ЕЩЁ. БОЛЬШЕ.' : 'Они ещё не знают тебя. Но узнают.',
    ],
    summer: [
      'Ночь только началась. Студия ждёт.',
      'Все тусят. А ты дома? Серьёзно?',
      'Один звонок Алхимику — и ты снова летишь.',
      'Жизнь коротка. Жги.',
      stats.energy < 20 ? 'Усталость — иллюзия. Или нет.' : 'Ещё один трек. Потом спать. Может быть.',
      kpis.cash > 5000 ? 'Деньги жгут карман. Потрать.' : 'На мели? Район кормит тех, кто берёт.',
    ],
  };

  const options = pool[season] || pool.autumn;
  return options[Math.floor(Math.random() * options.length)];
}
