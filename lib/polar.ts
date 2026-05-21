import { Polar } from '@polar-sh/sdk';
import type { PassType } from '@/lib/passUtils';

export const polar = new Polar({
  accessToken: process.env.POLAR_API_TOKEN!,
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') ?? 'sandbox',
});

export const POLAR_PRODUCT_IDS: Record<PassType, string> = {
  '1day': process.env.POLAR_1DAY_PRODUCT_ID!,
  '3day': process.env.POLAR_3DAY_PRODUCT_ID!,
  '7day': process.env.POLAR_7DAY_PRODUCT_ID!,
};

export const PASS_TYPE_BY_PRODUCT_ID: Record<string, PassType> = Object.fromEntries(
  (Object.entries(POLAR_PRODUCT_IDS) as [PassType, string][]).map(([passType, productId]) => [productId, passType])
);
