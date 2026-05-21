import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import { savePass } from '@/lib/paymentUtils';
import { PASS_TYPE_BY_PRODUCT_ID } from '@/lib/polar';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] POLAR_WEBHOOK_SECRET 환경변수 누락');
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
  }

  const rawBody = await req.text();

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => { headers[key] = value; });

  let event;
  try {
    event = validateEvent(rawBody, headers, secret);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.warn('[webhook] 서명 검증 실패');
      return NextResponse.json({ error: '서명 검증 실패' }, { status: 403 });
    }
    throw err;
  }

  if (event.type === 'order.paid') {
    const order = event.data;
    const userId = order.customer?.externalId ?? undefined;
    const productId = (order.productId ?? undefined) as string | undefined;
    const passType = productId ? PASS_TYPE_BY_PRODUCT_ID[productId] : undefined;

    if (userId && passType) {
      const supabase = getAdminClient();
      await savePass(supabase, userId, passType, order.id);
      console.log(`[webhook] pass 저장 완료: userId=${userId}, type=${passType}`);
    } else {
      console.warn('[webhook] order.paid — userId 또는 passType 누락', { userId, productId });
    }
  }

  return NextResponse.json({ ok: true });
}
