import { NextRequest, NextResponse } from 'next/server';
import { DOCTOR_SYSTEM_PROMPT, filterAIResponse, detectSafetyLevel } from '@/config/safety';

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Server-side safety check (redundant with client, but defense in depth)
    const safetyLevel = detectSafetyLevel(message);

    if (safetyLevel === 'crisis') {
      // Don't even call AI — return safe response immediately
      return NextResponse.json({
        reply: 'Я слышу тебя. То, что ты чувствуешь — это важно. Пожалуйста, позвони прямо сейчас: 8-800-2000-122 (бесплатно, анонимно, круглосуточно). Там выслушают. Попросить помощь — это не слабость, это самый сильный шаг.',
        safetyLevel: 'crisis',
      });
    }

    // If no AI key configured, use fallback responses
    if (!AI_API_KEY) {
      return NextResponse.json({
        reply: getFallbackResponse(message, safetyLevel),
        safetyLevel,
      });
    }

    // Build messages array with safety system prompt
    const messages: ChatMessage[] = [
      { role: 'system', content: DOCTOR_SYSTEM_PROMPT },
      // Include last 6 messages of history for context
      ...history.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call AI API
    const aiResponse = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 200, // Keep responses short
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status);
      return NextResponse.json({
        reply: getFallbackResponse(message, safetyLevel),
        safetyLevel,
      });
    }

    const data = await aiResponse.json();
    const rawReply = data.choices?.[0]?.message?.content || '';

    // Filter AI response for safety
    const safeReply = filterAIResponse(rawReply);

    return NextResponse.json({
      reply: safeReply,
      safetyLevel,
    });
  } catch (error) {
    console.error('Doctor chat error:', error);
    return NextResponse.json({
      reply: 'Что-то пошло не так. Давай попробуем ещё раз. Как ты себя чувствуешь?',
      safetyLevel: 'safe',
    });
  }
}

// Fallback responses when no AI API is configured
function getFallbackResponse(message: string, level: SafetyLevel): string {
  if (level === 'distress') {
    const responses = [
      'Я слышу тебя. Это звучит тяжело. Но ты пришёл — а значит ищешь выход. Это уже шаг. Что именно давит сильнее всего?',
      'Знаешь, район ломает многих. Но не тех, кто умеет говорить о боли. Ты умеешь. Расскажи, что чувствуешь.',
      'Тяжело — это нормально. Ненормально — нести это одному. Ты уже здесь. Давай разберёмся вместе. Что произошло?',
      'Я не буду говорить что всё наладится. Но я буду слушать. И иногда этого достаточно чтобы стало чуть легче. Говори.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Normal responses
  const msg = message.toLowerCase();

  if (msg.includes('привет') || msg.includes('здравствуй') || msg.includes('хей')) {
    return 'Рад что зашёл. Тут нет осуждения — только разговор. Как ты себя сегодня чувствуешь?';
  }
  if (msg.includes('музык') || msg.includes('трек') || msg.includes('бит')) {
    return 'Музыка — мощная штука. Она может вытащить из самых тёмных мест. Что для тебя значит творчество? Это побег или способ говорить?';
  }
  if (msg.includes('сон') || msg.includes('бессон') || msg.includes('спать')) {
    return 'Сон — это не роскошь, это ремонт. Без него мозг начинает врать тебе. Попробуй: телефон в сторону за час до сна, тёмная комната, ритуал. Сколько часов спишь?';
  }
  if (msg.includes('тревог') || msg.includes('страш') || msg.includes('паник')) {
    return 'Тревога — как шум в голове. Она говорит что опасность везде, но это ложь. Попробуй: 5 вещей вокруг, которые видишь. 4 звука. 3 прикосновения. Это заземляет. Когда тревога сильнее — утром или вечером?';
  }
  if (msg.includes('злюсь') || msg.includes('бесит') || msg.includes('ненавижу')) {
    return 'Злость — это энергия. Вопрос куда её направить. Можно разрушать, а можно — в музыку, в спорт, в текст. Что тебя разозлило?';
  }

  const generic = [
    'Расскажи подробнее. Что сейчас в голове? Иногда просто проговорить — уже помогает.',
    'Я тут. Без осуждения. Что тебя привело сегодня?',
    'Каждый день — новый куплет. Иногда кривой, иногда огонь. Как прошёл этот?',
    'Помни: я персонаж в игре. Если тебе реально тяжело — позвони 8-800-2000-122. А пока — о чём хочешь поговорить?',
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

type SafetyLevel = 'safe' | 'distress' | 'crisis';
