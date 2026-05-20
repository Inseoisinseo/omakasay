import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { polar } from '@/lib/polar';
import { savePass } from '@/lib/paymentUtils';
import type { PassType } from '@/lib/passUtils';

const VALID_PASS_TYPES = new Set<PassType>(['1day', '3day', '7day']);

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string; pass_type?: string }>;
}) {
  const { checkout_id, pass_type } = await searchParams;

  if (!checkout_id || !pass_type) {
    redirect('/workspace?payment=fail');
  }

  const passType = pass_type as PassType;
  if (!VALID_PASS_TYPES.has(passType)) {
    redirect('/workspace?payment=fail');
  }

  let checkout;
  try {
    checkout = await polar.checkouts.get({ id: checkout_id });
  } catch {
    redirect('/workspace?payment=fail');
  }

  if (checkout.status !== 'succeeded') {
    redirect('/workspace?payment=fail');
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
  if (!user) redirect('/auth');

  try {
    await savePass(supabase, user.id, passType, checkout_id);
  } catch {
    redirect('/workspace?payment=fail');
  }

  redirect(`/workspace?payment=success&type=${passType}`);
}
