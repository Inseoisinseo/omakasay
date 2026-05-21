import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { polar, POLAR_PRODUCT_IDS } from '@/lib/polar';
import type { PassType } from '@/lib/passUtils';

const VALID_PASS_TYPES = new Set<PassType>(['1day', '3day', '7day']);

export async function POST(req: NextRequest) {
  try {
    const { passType } = await req.json() as { passType: PassType };

    if (!VALID_PASS_TYPES.has(passType)) {
      return NextResponse.json({ error: '올바르지 않은 패스 타입' }, { status: 400 });
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
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const origin = req.headers.get('origin') ?? req.nextUrl.origin;
    const successUrl = `${origin}/payment/success?checkout_id={CHECKOUT_ID}&pass_type=${passType}`;

    const checkout = await polar.checkouts.create({
      products: [POLAR_PRODUCT_IDS[passType]],
      successUrl,
      externalCustomerId: user.id,
      metadata: { pass_type: passType, user_id: user.id },
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[payment/checkout] POLAR_SERVER:', process.env.POLAR_SERVER);
    console.error('[payment/checkout] token set:', !!process.env.POLAR_API_TOKEN);
    console.error('[payment/checkout] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
