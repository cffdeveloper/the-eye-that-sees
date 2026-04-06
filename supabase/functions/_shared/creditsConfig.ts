/** Share with src/lib/creditsConfig.ts — keep values in sync. Not shown to end users in product copy. */
export const CREDIT_PAYOUT_RATIO = 0.65;
/** Gross payment must be at least this (USD). */
export const MIN_CREDIT_PURCHASE_USD = 5;
export const MAX_CREDIT_PURCHASE_USD = 25_000;
export const MIN_DONATION_USD = 1;

/** Estimated AI usage debit per invoke (USD, from user credit balance). */
export const USAGE_COST_USD = {
  industry_intel: 0.08,
  cross_intel: 0.15,
  custom_intel: 0.12,
  social_intel: 0.06,
  deep_dive: 0.1,
  alfred_opportunities: 0.12,
  alfred_deep_dive: 0.14,
  network_events: 0.1,
  daily_read_brief: 0.35,
} as const;

export function creditsFromPayment(amountPaidUsd: number): number {
  return Math.round(amountPaidUsd * CREDIT_PAYOUT_RATIO * 10_000) / 10_000;
}

export function platformMarginUsd(amountPaidUsd: number): number {
  return Math.round(amountPaidUsd * (1 - CREDIT_PAYOUT_RATIO) * 10_000) / 10_000;
}
