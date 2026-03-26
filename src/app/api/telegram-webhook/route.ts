import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const ADMIN_IDS = ['7984904430'];

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

export async function POST(req: NextRequest) {
  // Verify webhook signature if configured
  const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
  if (WEBHOOK_SECRET && secretHeader && secretHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update = await req.json();

    // Handle bot commands
    if (update.message?.text) {
      const text = update.message.text;
      const fromId = String(update.message.from?.id);
      const chatId = update.message.chat.id;

      // /start — welcome + play button
      if (text === '/start' || text === '/play') {
        await sendMessage(chatId,
          '👻 <b>Duh The Spirit</b>\n\nВыживай. Зарабатывай. Не теряй рассудок.\n\nНажми кнопку ниже чтобы начать:',
          { inline_keyboard: [[{ text: '🎮 Играть', web_app: { url: 'https://www.duhthespirit.app/' } }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // /gift <telegram_id> <amount> — admin only
      if (text.startsWith('/gift') && ADMIN_IDS.includes(fromId)) {
        const parts = text.split(' ');
        const targetId = parts[1];
        const amount = parseInt(parts[2] || '0');

        if (!targetId || !amount || amount <= 0) {
          await sendMessage(chatId, '❌ Формат: /gift <telegram_id> <сумма>\nПример: /gift 809291523 50000');
          return NextResponse.json({ ok: true });
        }

        // Call our gift API
        const baseUrl = 'https://www.duhthespirit.app';
        const res = await fetch(`${baseUrl}/api/admin/gift`, {
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

      // /balance — admin only, show Stars balance
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
            msg += `<b>Последние:</b>\n`;

            const recent = txs.slice(0, 5);
            for (const tx of recent) {
              const user = tx.source?.user;
              const name = user?.username ? `@${user.username}` : user?.first_name || 'Unknown';
              const date = new Date(tx.date * 1000).toLocaleString('ru-RU', { timeZone: 'Asia/Tbilisi' });
              msg += `• ${name}: +${tx.amount} ⭐ (${date})\n`;
            }

            await sendMessage(chatId, msg);
          } else {
            await sendMessage(chatId, '⭐ Баланс: 0 Stars\nПока нет транзакций.');
          }
        } catch {
          await sendMessage(chatId, '❌ Не удалось получить баланс');
        }
        return NextResponse.json({ ok: true });
      }

      // /help
      if (text === '/help') {
        let helpText = '👻 <b>Duh The Spirit</b>\n\n/play — Открыть игру\n/help — Помощь';
        if (ADMIN_IDS.includes(fromId)) {
          helpText += '\n\n🔑 <b>Админ:</b>\n/gift &lt;id&gt; &lt;сумма&gt; — Подарить деньги игроку\n/balance — Баланс Stars\n/stats — Статистика (скоро)';
        }
        await sendMessage(chatId, helpText);
        return NextResponse.json({ ok: true });
      }
    }

    // Handle pre_checkout_query — MUST respond within 10 seconds
    if (update.pre_checkout_query) {
      const queryId = update.pre_checkout_query.id;

      // Validate payload is valid JSON with known productId
      let isValid = false;
      try {
        const payload = JSON.parse(update.pre_checkout_query.invoice_payload);
        isValid = typeof payload.productId === 'string' && payload.productId.length > 0;
      } catch {
        isValid = false;
      }

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pre_checkout_query_id: queryId,
            ok: isValid,
            ...(!isValid && { error_message: 'Invalid product' }),
          }),
        }
      );

      return NextResponse.json({ ok: true });
    }

    // Handle successful payment — log only, effects applied client-side
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const userId = update.message.from?.id;

      // Log for analytics (no sensitive data)
      console.log(
        `[STARS] user=${userId} amount=${payment.total_amount} currency=${payment.currency}`
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always 200 to Telegram
  }
}
