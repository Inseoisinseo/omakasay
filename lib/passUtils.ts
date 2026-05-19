export type PassType = '1day' | '3day' | '7day';

const PASS_DURATION_MS: Record<PassType, number> = {
  '1day':  24  * 60 * 60 * 1000,
  '3day':  72  * 60 * 60 * 1000,
  '7day':  168 * 60 * 60 * 1000,
};

export function calculateExpiresAt(passType: PassType, purchasedAt: Date = new Date()): Date {
  return new Date(purchasedAt.getTime() + PASS_DURATION_MS[passType]);
}

export function formatPassType(passType: PassType): string {
  const labels: Record<PassType, string> = {
    '1day': '1일권',
    '3day': '3일권',
    '7day': '7일권',
  };
  return labels[passType];
}
