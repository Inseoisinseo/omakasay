import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 웹훅은 TossPayments 서버에서 호출 → 서비스 롤 키로 RLS 우회
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const { eventType, data } = event as { eventType: string; data: { orderId?: string } };

    if (eventType === 'PAYMENT_CANCELED' && data?.orderId) {
      const supabase = getAdminClient();
      await supabase
        .from('passes')
        .update({ is_active: false })
        .eq('order_id', data.orderId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payment/webhook]', err);
    return NextResponse.json({ error: 'Webhook 처리 실패' }, { status: 500 });
  }
}
