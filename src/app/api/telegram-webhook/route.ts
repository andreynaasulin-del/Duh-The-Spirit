import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Verify webhook signature — reject fake requests
  const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
  if (!WEBHOOK_SECRET || secretHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update = await req.json();

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
