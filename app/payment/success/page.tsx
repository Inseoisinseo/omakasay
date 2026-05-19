import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  PASS_PRICES,
  parsePassTypeFromOrderId,
  confirmTossPayment,
  savePass,
} from '@/lib/paymentUtils';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

  if (!paymentKey || !orderId || !amount) {
    redirect('/workspace?payment=fail');
  }

  const passType = parsePassTypeFromOrderId(orderId);
  if (!passType || Number(amount) !== PASS_PRICES[passType]) {
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

  const confirm = await confirmTossPayment(paymentKey, orderId, Number(amount));
  if (!confirm.ok) redirect('/workspace?payment=fail');

  try {
    await savePass(supabase, user.id, passType, orderId);
  } catch {
    redirect('/workspace?payment=fail');
  }

  redirect(`/workspace?payment=success&type=${passType}`);
}
