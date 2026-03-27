import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const ADMIN_IDS = ['7984904430'];
const APP_URL = 'https://www.duhthespirit.app/';

async function sendMessage(chatId: string | number, text: string, replyMarkup?: object) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...(replyMarkup && { reply_markup: replyMarkup }),
    }),
  });
}

async function sendPhoto(chatId: string | number, photoUrl: string, caption: string, replyMarkup?: object) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
      ...(replyMarkup && { reply_markup: replyMarkup }),
    }),
  });
}

// Main menu keyboard
const MAIN_MENU = {
  inline_keyboard: [
    [{ text: '🎮 Играть', web_app: { url: APP_URL } }],
    [
      { text: '❓ FAQ', callback_data: 'faq' },
      { text: '👤 Создатель', callback_data: 'creator' },
    ],
    [
      { text: '⭐ Stars Shop', callback_data: 'stars' },
      { text: '📢 Канал', url: 'https://t.me/duhdeveloperhub' },
    ],
  ],
};

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
  if (WEBHOOK_SECRET && secretHeader && secretHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update = await req.json();

    // === CALLBACK QUERIES (button presses) ===
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      // Answer callback to remove loading
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id }),
      });

      if (data === 'faq') {
        await sendMessage(chatId,
          `❓ <b>FAQ</b>\n\n` +
          `<b>Что это за игра?</b>\nИнтерактивная новелла о молодом музыканте. 4 сезона, выборы с последствиями, несколько концовок.\n\n` +
          `<b>Как играть?</b>\nВыполняй действия, принимай квесты, общайся с NPC. Каждый выбор влияет на сюжет.\n\n` +
          `<b>Что такое сезоны?</b>\nОсень (меланхолия), Зима (тревога), Весна (мания), Лето (студия). Каждый меняет механики.\n\n` +
          `<b>Можно ли умереть?</b>\nЗависит от сложности. На Light нельзя, на From Street одна попытка.\n\n` +
          `<b>Как заработать?</b>\nХастл, курьер, музыка, темные схемы. Или Stars Shop.\n\n` +
          `<b>Кто такой Дух?</b>\nГаллюцинация. Провоцирует, пугает, иногда помогает. Не доверяй ему.`,
          { inline_keyboard: [
            [{ text: '🎮 Играть', web_app: { url: APP_URL } }],
            [{ text: '◀️ Назад', callback_data: 'menu' }],
          ]}
        );
      }

      if (data === 'creator') {
        await sendMessage(chatId,
          `👤 <b>Создатель</b>\n\n` +
          `🎮 @duhdeveloper\n` +
          `📢 @duhdeveloperhub\n\n` +
          `Фидбэк, идеи, баги, коллабы.\nПиши напрямую.`,
          { inline_keyboard: [
            [
              { text: '✉️ Написать', url: 'https://t.me/duhdeveloper' },
              { text: '📢 Канал', url: 'https://t.me/duhdeveloperhub' },
            ],
            [{ text: '◀️ Назад', callback_data: 'menu' }],
          ]}
        );
      }

      if (data === 'stars') {
        await sendMessage(chatId,
          `⭐ <b>Stars Shop</b>\n\n` +
          `Покупай бусты за Telegram Stars:\n\n` +
          `⚡ <b>Энергетик</b> (25 Stars)\nПолное восстановление энергии\n\n` +
          `❤️ <b>Полное восстановление</b> (75 Stars)\nHP, энергия, настроение на максимум\n\n` +
          `💰 <b>Спонсорский контракт</b> (150 Stars)\n+10,000₽ на счет\n\n` +
          `Покупки доступны внутри игры.`,
          { inline_keyboard: [
            [{ text: '🎮 Открыть магазин', web_app: { url: APP_URL + 'game/shop' } }],
            [{ text: '◀️ Назад', callback_data: 'menu' }],
          ]}
        );
      }

      if (data === 'menu') {
        await sendMessage(chatId,
          '👻 <b>Duh The Spirit</b>\n\nВыживай. Зарабатывай. Не теряй рассудок.',
          MAIN_MENU
        );
      }

      return NextResponse.json({ ok: true });
    }

    // === TEXT COMMANDS ===
    if (update.message?.text) {
      const text = update.message.text;
      const fromId = String(update.message.from?.id);
      const chatId = update.message.chat.id;

      // /start
      if (text.startsWith('/start') || text === '/play') {
        const refMatch = text.match(/ref_(\d+)/);
        if (refMatch && refMatch[1] !== fromId) {
          try {
            await sendMessage(refMatch[1],
              `🎉 По твоей ссылке зашел новый игрок!\n\n💰 +5,000₽ на баланс`,
              { inline_keyboard: [[{ text: '🎮 Играть', web_app: { url: APP_URL } }]] }
            );
          } catch {}
        }

        await sendMessage(chatId,
          '👻 <b>Duh The Spirit</b>\n\nВыживай. Зарабатывай. Не теряй рассудок.',
          MAIN_MENU
        );
        return NextResponse.json({ ok: true });
      }

      // /faq
      if (text === '/faq') {
        await sendMessage(chatId,
          `❓ <b>FAQ</b>\n\n` +
          `<b>Что это?</b> Интерактивная новелла. 4 сезона, выборы, последствия.\n` +
          `<b>Как играть?</b> Действия, квесты, NPC. Каждый клик меняет историю.\n` +
          `<b>Кто такой Дух?</b> Галлюцинация. Провокатор. Не верь ему.\n` +
          `<b>Можно умереть?</b> Зависит от сложности.`,
          { inline_keyboard: [[{ text: '🎮 Играть', web_app: { url: APP_URL } }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // /gift — admin only
      if (text.startsWith('/gift') && ADMIN_IDS.includes(fromId)) {
        const parts = text.split(' ');
        const targetId = parts[1];
        const amount = parseInt(parts[2] || '0');

        if (!targetId || !amount || amount <= 0) {
          await sendMessage(chatId, '❌ Формат: /gift &lt;telegram_id&gt; &lt;сумма&gt;\nПример: /gift 809291523 50000');
          return NextResponse.json({ ok: true });
        }

        const res = await fetch(`${APP_URL}api/admin/gift`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: fromId, targetTelegramId: targetId, amount }),
        });

        const data = await res.json();
        if (data.success) {
          await sendMessage(chatId, `✅ Подарок отправлен!\n\n👤 ${data.gift.to}\n💰 +${amount.toLocaleString('ru')}₽`);
        } else {
          await sendMessage(chatId, `❌ Ошибка: ${data.error}`);
        }
        return NextResponse.json({ ok: true });
      }

      // /balance — admin only
      if (text === '/balance' && ADMIN_IDS.includes(fromId)) {
        try {
          const txRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getStarTransactions?limit=100`);
          const txData = await txRes.json();

          if (txData.ok && txData.result?.transactions) {
            const txs = txData.result.transactions;
            const totalStars = txs.reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0);
            const totalUsd = (totalStars * 0.02).toFixed(2);

            let msg = `⭐ <b>Stars Balance</b>\n\n`;
            msg += `💰 Баланс: <b>${totalStars} Stars</b> (~$${totalUsd})\n`;
            msg += `📊 Транзакций: ${txs.length}\n\n`;

            const recent = txs.slice(0, 5);
            for (const tx of recent) {
              const user = tx.source?.user;
              const name = user?.username ? `@${user.username}` : user?.first_name || 'Unknown';
              msg += `• ${name}: +${tx.amount} ⭐\n`;
            }

            await sendMessage(chatId, msg);
          } else {
            await sendMessage(chatId, '⭐ Баланс: 0 Stars');
          }
        } catch {
          await sendMessage(chatId, '❌ Не удалось получить баланс');
        }
        return NextResponse.json({ ok: true });
      }

      // /help
      if (text === '/help') {
        let helpText = `👻 <b>Duh The Spirit</b>\n\n`;
        helpText += `/play — Открыть игру\n`;
        helpText += `/faq — Частые вопросы\n`;
        helpText += `/help — Помощь\n`;
        if (ADMIN_IDS.includes(fromId)) {
          helpText += `\n🔑 <b>Админ:</b>\n/gift &lt;id&gt; &lt;сумма&gt;\n/balance`;
        }
        await sendMessage(chatId, helpText, MAIN_MENU);
        return NextResponse.json({ ok: true });
      }

      // Unknown command — show menu
      if (text.startsWith('/')) {
        await sendMessage(chatId,
          '👻 Не понял. Вот что я умею:',
          MAIN_MENU
        );
        return NextResponse.json({ ok: true });
      }
    }

    // === PRE-CHECKOUT ===
    if (update.pre_checkout_query) {
      let isValid = false;
      try {
        const payload = JSON.parse(update.pre_checkout_query.invoice_payload);
        isValid = typeof payload.productId === 'string' && payload.productId.length > 0;
      } catch { isValid = false; }

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: isValid,
          ...(!isValid && { error_message: 'Invalid product' }),
        }),
      });
      return NextResponse.json({ ok: true });
    }

    // === SUCCESSFUL PAYMENT ===
    if (update.message?.successful_payment) {
      console.log(`[STARS] user=${update.message.from?.id} amount=${update.message.successful_payment.total_amount}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
