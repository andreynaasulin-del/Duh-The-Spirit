import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProduct } from '@/config/stars-shop';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const RequestSchema = z.object({
  productId: z.string().min(1).max(64),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const product = getProduct(parsed.data.productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!BOT_TOKEN || BOT_TOKEN.includes('ВСТАВЬ')) {
      // Dev mode: return mock invoice URL
      return NextResponse.json({
        invoiceUrl: `tg://dev_invoice/${product.id}`,
        productId: product.id,
        dev: true,
      });
    }

    // Create invoice via Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          payload: JSON.stringify({ productId: product.id, ts: Date.now() }),
          currency: 'XTR',
          prices: [{ label: product.title, amount: product.stars }],
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoiceUrl: data.result,
      productId: product.id,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
