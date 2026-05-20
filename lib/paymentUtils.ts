import type { PassType } from '@/lib/passUtils';
import { calculateExpiresAt } from '@/lib/passUtils';
import type { SupabaseClient } from '@supabase/supabase-js';

export const PASS_PRICES: Record<PassType, number> = {
  '1day': 990,
  '3day': 1900,
  '7day': 2900,
};

export const PASS_NAMES: Record<PassType, string> = {
  '1day': '1일 패스',
  '3day': '3일 패스',
  '7day': '7일 패스',
};

export function generateOrderId(passType: PassType): string {
  const rand = Math.random().toString(36).slice(2, 7);
  return `OMAKA-${passType}-${Date.now().toString(36)}-${rand}`;
}

export function parsePassTypeFromOrderId(orderId: string): PassType | null {
  const segment = orderId.split('-')[1];
  if (segment === '1day' || segment === '3day' || segment === '7day') return segment;
  return null;
}

export async function savePass(
  supabase: SupabaseClient,
  userId: string,
  passType: PassType,
  orderId: string,
) {
  const purchasedAt = new Date();
  const expiresAt = calculateExpiresAt(passType, purchasedAt);
  const { error } = await supabase.from('passes').insert({
    user_id: userId,
    pass_type: passType,
    purchased_at: purchasedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
    order_id: orderId,
  });
  // UNIQUE 제약 위반(중복 결제) 은 무시 - 이미 저장된 것으로 처리
  if (error && error.code !== '23505') throw error;
}
