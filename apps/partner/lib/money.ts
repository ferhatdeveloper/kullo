/** Partner IQD formatter — TR·IQD öncelikli. */
export function formatIqd(amount: number, currency: string = "IQD"): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = Math.round(n).toLocaleString("tr-TR");
  return currency === "USD" ? `$${n.toLocaleString("en-US")}` : `${formatted} IQD`;
}
