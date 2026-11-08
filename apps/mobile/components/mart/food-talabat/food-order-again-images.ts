/**
 * Tekrar sipariş rayı — yemek fotoğrafları.
 * Restoran cover Unsplash id’leriyle çakışmaz (aynı ekranda çift görüntü olmasın).
 */
export const FOOD_ORDER_AGAIN_IMAGE_URIS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80", // salata kasesi
  "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", // pepperoni
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", // burger tabağı
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80", // sushi
  "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80", // kebab
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // gourmet plate
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80", // pasta
  "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=600&q=80", // ızgara
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80", // yumurta tabağı
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80", // fine dining
] as const;

export function orderAgainImageUri(index: number, fallback: string): string {
  const list = FOOD_ORDER_AGAIN_IMAGE_URIS;
  if (!list.length) return fallback;
  return list[index % list.length] ?? fallback;
}
