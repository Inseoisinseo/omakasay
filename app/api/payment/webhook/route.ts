import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { savePass } from '@/lib/paymentUtils';
import { PASS_TYPE_BY_PRODUCT_ID } from '@/lib/polar';
import type { PassType } from '@/lib/passUtils';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const { type, data } = event as { type: string; data: Record<string, unknown> };

    if (type === 'order.paid') {
      const userId = (data.external_customer_id ?? (data.metadata as Record<string, unknown>)?.user_id) as string | undefined;
      const productId = (data.items as Array<{ product_id: string }>)?.[0]?.product_id;
      const passType = productId ? PASS_TYPE_BY_PRODUCT_ID[productId] : undefined;
      const orderId = data.id as string | undefined;

      if (userId && passType && orderId) {
        const supabase = getAdminClient();
        await savePass(supabase, userId, passType as PassType, orderId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payment/webhook]', err);
    return NextResponse.json({ error: 'Webhook 처리 실패' }, { status: 500 });
  }
}
