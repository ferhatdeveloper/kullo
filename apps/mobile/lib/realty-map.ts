/** Irak şehir merkezleri — emlak pin konumları için */

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Erbil: { lat: 36.1911, lng: 44.0093 },
  Baghdad: { lat: 33.3152, lng: 44.3661 },
  Sulaymaniyah: { lat: 35.5571, lng: 45.435 },
  Basra: { lat: 30.5085, lng: 47.7804 },
  Duhok: { lat: 36.8671, lng: 42.9884 },
  Mosul: { lat: 36.3489, lng: 43.1575 },
  Kirkuk: { lat: 35.4681, lng: 44.3922 },
};

export function coordsForCity(city: string): { lat: number; lng: number } {
  return CITY_COORDS[city] ?? CITY_COORDS.Erbil!;
}

/** Deterministik küçük offset — aynı şehirdeki ilanları ayırır */
export function coordsForListing(
  id: string,
  city: string,
  district?: string,
): { lat: number; lng: number } {
  const base = coordsForCity(city);
  let h = 0;
  const key = `${id}:${district ?? ""}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const dLat = (((h % 900) - 450) / 100000) * 1.1;
  const dLng = ((((h >> 9) % 900) - 450) / 100000) * 1.1;
  return { lat: base.lat + dLat, lng: base.lng + dLng };
}
