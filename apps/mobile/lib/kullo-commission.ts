/**
 * Kullo platform komisyonu — mock/config.
 * Teklif ve kabul UI’da oran + tutar gösterilir.
 */

export const KULLO_COMMISSION_RATE = 0.05;

export type CommissionBreakdown = {
  rate: number;
  /** Yüzde nokta, örn. 5 */
  ratePercent: number;
  gross: number;
  commission: number;
  net: number;
};

export function commissionBreakdown(gross: number): CommissionBreakdown {
  const safe = Number.isFinite(gross) && gross > 0 ? gross : 0;
  const commission = Math.round(safe * KULLO_COMMISSION_RATE);
  return {
    rate: KULLO_COMMISSION_RATE,
    ratePercent: Math.round(KULLO_COMMISSION_RATE * 100),
    gross: safe,
    commission,
    net: Math.max(0, safe - commission),
  };
}
