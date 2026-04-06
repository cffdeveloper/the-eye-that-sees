/**
 * Internal conversion (sync with supabase/functions/_shared/creditsConfig.ts).
 * UI shows dollar amounts only — do not surface ratios to customers.
 */
export const CREDIT_PAYOUT_RATIO = 0.65;
export const MIN_CREDIT_PURCHASE_USD = 5;
export const MAX_CREDIT_PURCHASE_USD = 25_000;
export const MIN_DONATION_USD = 1;

export function creditsFromPayment(amountPaidUsd: number): number {
  return Math.round(amountPaidUsd * CREDIT_PAYOUT_RATIO * 10_000) / 10_000;
}

/** For internal/admin analytics only — not used in customer-facing UI. */
export function platformMarginUsd(amountPaidUsd: number): number {
  return Math.round(amountPaidUsd * (1 - CREDIT_PAYOUT_RATIO) * 10_000) / 10_000;
}

export function formatMoneyUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
