/** Basit coğrafi yardımcılar — seed adres nearest seçimi için. */

export type LatLng = { lat: number; lng: number };

/** Büyük daire mesafe (km). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function nearestByKm<T extends LatLng & { id: string }>(
  origin: LatLng,
  items: T[],
): T | null {
  if (!items.length) return null;
  let best = items[0]!;
  let bestKm = haversineKm(origin, best);
  for (let i = 1; i < items.length; i++) {
    const item = items[i]!;
    const km = haversineKm(origin, item);
    if (km < bestKm) {
      best = item;
      bestKm = km;
    }
  }
  return best;
}
