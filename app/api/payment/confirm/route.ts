import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  PASS_PRICES,
  parsePassTypeFromOrderId,
  confirmTossPayment,
  savePass,
} from '@/lib/paymentUtils';

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
    }

    const passType = parsePassTypeFromOrderId(orderId);
    if (!passType) {
      return NextResponse.json({ error: '올바르지 않은 주문 ID' }, { status: 400 });
    }

    if (Number(amount) !== PASS_PRICES[passType]) {
      return NextResponse.json({ error: '결제 금액 불일치' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) =>
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const confirm = await confirmTossPayment(paymentKey, orderId, Number(amount));
    if (!confirm.ok) {
      return NextResponse.json({ error: confirm.error }, { status: 400 });
    }

    await savePass(supabase, user.id, passType, orderId);

    return NextResponse.json({ success: true, passType });
  } catch (err) {
    console.error('[payment/confirm]', err);
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다' }, { status: 500 });
  }
}
