/**
 * Bölge otel seed — Erbil / Ankawa / Sulaymaniyah / Duhok (Kürdistan-Irak odak).
 * Kapak URI’leri OfflineCover + offline-image-map (home alias) ile çalışır.
 */

export type HotelCity = "Erbil" | "Ankawa" | "Sulaymaniyah" | "Duhok";

export type HotelAmenity =
  | "wifi"
  | "pool"
  | "parking"
  | "breakfast"
  | "gym"
  | "spa"
  | "airport"
  | "restaurant"
  | "ac"
  | "desk";

export type HotelRoomType = "standard" | "deluxe" | "suite" | "residence";

export type DemoHotel = {
  id: string;
  name: string;
  city: HotelCity;
  district: string;
  stars: 3 | 4 | 5;
  rating: number;
  review_count: number;
  /** Gecelik fiyat (IQD) */
  price_amount: number;
  price_currency: "IQD";
  cover_url: string;
  gallery: string[];
  amenities: HotelAmenity[];
  room_type: HotelRoomType;
  lat: number;
  lng: number;
  description_tr: string;
  description_en: string;
  featured?: boolean;
};

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;

/**
 * Hotel kapakları — mevcut offline home/cars foto id’leri (OfflineCover lokal).
 * Alias: offline-image-map HOME_BY_PHOTO.
 */
export const HOTEL_PHOTO_IDS = [
  "photo-1564013799919-ab600027ffc6",
  "photo-1570129477492-45c003edd2be",
  "photo-1613490493576-7fde63acd811",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1502672260266-1c1ef2d93688",
  "photo-1497366216548-37526070297c",
  "photo-1497366811353-6870744d04b2",
  "photo-1519238263530-99bdd11df2ea",
  "photo-1500382017468-9049fed747ef",
  "photo-1490481651871-ab68de25d43d",
  "photo-1555529669-e69e7aa0ba9a",
  "photo-1595777457583-95e059d581b8",
] as const;

export const DEMO_HOTELS: DemoHotel[] = [
  {
    id: "htl-divan-erbil",
    name: "Divan Erbil",
    city: "Erbil",
    district: "100 Meter Road",
    stars: 5,
    rating: 4.7,
    review_count: 1284,
    price_amount: 240_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[0]),
    gallery: [u(HOTEL_PHOTO_IDS[0]), u(HOTEL_PHOTO_IDS[1]), u(HOTEL_PHOTO_IDS[2])],
    room_type: "suite",
    amenities: ["wifi", "pool", "parking", "breakfast", "gym", "spa", "airport", "restaurant", "ac", "desk"],
    lat: 36.191,
    lng: 44.009,
    description_tr:
      "Erbil merkezinde iş ve tatil konukları için spa, havuz ve şehir manzaralı odalar.",
    description_en:
      "Spa, pool and city-view rooms for business and leisure guests in central Erbil.",
    featured: true,
  },
  {
    id: "htl-rotana-erbil",
    name: "Erbil Rotana",
    city: "Erbil",
    district: "Gulan Street",
    stars: 5,
    rating: 4.6,
    review_count: 980,
    price_amount: 215_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[1]),
    gallery: [u(HOTEL_PHOTO_IDS[1]), u(HOTEL_PHOTO_IDS[3]), u(HOTEL_PHOTO_IDS[4])],
    room_type: "deluxe",
    amenities: ["wifi", "pool", "parking", "breakfast", "gym", "restaurant", "ac", "desk", "airport"],
    lat: 36.198,
    lng: 44.015,
    description_tr: "Gulan Caddesi’nde konferans salonu ve restoranıyla öne çıkan şehir oteli.",
    description_en: "City hotel on Gulan Street with meeting rooms and on-site dining.",
    featured: true,
  },
  {
    id: "htl-crystal-ankawa",
    name: "Ankawa Crystal",
    city: "Ankawa",
    district: "Ankawa Center",
    stars: 4,
    rating: 4.4,
    review_count: 642,
    price_amount: 95_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[2]),
    gallery: [u(HOTEL_PHOTO_IDS[2]), u(HOTEL_PHOTO_IDS[5]), u(HOTEL_PHOTO_IDS[6])],
    room_type: "standard",
    amenities: ["wifi", "parking", "breakfast", "restaurant", "ac", "desk"],
    lat: 36.232,
    lng: 44.002,
    description_tr: "Ankawa merkezinde restoran ve ücretsiz otoparklı butik konaklama.",
    description_en: "Boutique stay in central Ankawa with restaurant and free parking.",
    featured: true,
  },
  {
    id: "htl-hills-ankawa",
    name: "Ankawa Hills",
    city: "Ankawa",
    district: "Christian Quarter",
    stars: 4,
    rating: 4.5,
    review_count: 410,
    price_amount: 145_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[3]),
    gallery: [u(HOTEL_PHOTO_IDS[3]), u(HOTEL_PHOTO_IDS[7])],
    room_type: "deluxe",
    amenities: ["wifi", "pool", "parking", "breakfast", "ac", "desk", "airport"],
    lat: 36.235,
    lng: 43.998,
    description_tr: "Ankawa tepelerinde havuzlu, havalimanına yakın sakin bir konaklama.",
    description_en: "Quiet poolside stay on the Ankawa hills, close to the airport.",
    featured: true,
  },
  {
    id: "htl-arjaan-erbil",
    name: "Arjaan Residences Erbil",
    city: "Erbil",
    district: "Downtown",
    stars: 5,
    rating: 4.5,
    review_count: 756,
    price_amount: 180_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[4]),
    gallery: [u(HOTEL_PHOTO_IDS[4]), u(HOTEL_PHOTO_IDS[8])],
    room_type: "residence",
    amenities: ["wifi", "parking", "breakfast", "gym", "restaurant", "ac", "desk", "airport"],
    lat: 36.19,
    lng: 44.012,
    description_tr: "Uzun konaklamaya uygun residence odalar; mutfaklı süit seçenekleri.",
    description_en: "Residence-style suites with kitchenettes for longer stays.",
  },
  {
    id: "htl-chwar-erbil",
    name: "Chwar Chra Hotel",
    city: "Erbil",
    district: "Citadel Area",
    stars: 4,
    rating: 4.2,
    review_count: 520,
    price_amount: 78_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[5]),
    gallery: [u(HOTEL_PHOTO_IDS[5]), u(HOTEL_PHOTO_IDS[9])],
    room_type: "standard",
    amenities: ["wifi", "parking", "breakfast", "restaurant", "ac"],
    lat: 36.1915,
    lng: 44.0095,
    description_tr: "Kale bölgesine yürüme mesafesinde klasik şehir oteli.",
    description_en: "Classic city hotel within walking distance of the Citadel.",
  },
  {
    id: "htl-grand-suli",
    name: "Grand Suli Palace",
    city: "Sulaymaniyah",
    district: "Salim Street",
    stars: 5,
    rating: 4.6,
    review_count: 890,
    price_amount: 200_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[6]),
    gallery: [u(HOTEL_PHOTO_IDS[6]), u(HOTEL_PHOTO_IDS[10]), u(HOTEL_PHOTO_IDS[1])],
    room_type: "suite",
    amenities: ["wifi", "pool", "parking", "breakfast", "gym", "spa", "restaurant", "ac", "desk"],
    lat: 35.561,
    lng: 45.43,
    description_tr: "Süleymaniye merkezinde spa ve konferans imkanlı lüks otel.",
    description_en: "Luxury hotel in central Sulaymaniyah with spa and conference facilities.",
    featured: true,
  },
  {
    id: "htl-titanic-suli",
    name: "Mountain View Suli",
    city: "Sulaymaniyah",
    district: "Bakhtyari",
    stars: 4,
    rating: 4.3,
    review_count: 388,
    price_amount: 135_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[7]),
    gallery: [u(HOTEL_PHOTO_IDS[7]), u(HOTEL_PHOTO_IDS[11])],
    room_type: "deluxe",
    amenities: ["wifi", "pool", "parking", "breakfast", "restaurant", "ac", "airport"],
    lat: 35.555,
    lng: 45.42,
    description_tr: "Dağ manzaralı odalar ve açık havuz — hafta sonu kaçamağı için.",
    description_en: "Mountain-view rooms and outdoor pool — ideal for weekend escapes.",
  },
  {
    id: "htl-duhok-palace",
    name: "Duhok Palace",
    city: "Duhok",
    district: "Zakho Road",
    stars: 4,
    rating: 4.1,
    review_count: 274,
    price_amount: 85_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[8]),
    gallery: [u(HOTEL_PHOTO_IDS[8]), u(HOTEL_PHOTO_IDS[0])],
    room_type: "standard",
    amenities: ["wifi", "parking", "breakfast", "restaurant", "ac", "desk"],
    lat: 36.867,
    lng: 42.988,
    description_tr: "Duhok girişinde otopark ve kahvaltı dahil şehir oteli.",
    description_en: "City hotel near Duhok entrance with parking and breakfast included.",
  },
  {
    id: "htl-duhok-garden",
    name: "Duhok Garden Inn",
    city: "Duhok",
    district: "Malta",
    stars: 3,
    rating: 4.0,
    review_count: 190,
    price_amount: 55_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[9]),
    gallery: [u(HOTEL_PHOTO_IDS[9]), u(HOTEL_PHOTO_IDS[2])],
    room_type: "standard",
    amenities: ["wifi", "parking", "breakfast", "ac"],
    lat: 36.86,
    lng: 42.99,
    description_tr: "Bütçe dostu, temiz odalar ve ücretsiz Wi‑Fi.",
    description_en: "Budget-friendly clean rooms with free Wi‑Fi.",
  },
  {
    id: "htl-jiyan-erbil",
    name: "Jiyan Boutique Erbil",
    city: "Erbil",
    district: "Ankawa Road",
    stars: 3,
    rating: 4.3,
    review_count: 312,
    price_amount: 68_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[10]),
    gallery: [u(HOTEL_PHOTO_IDS[10]), u(HOTEL_PHOTO_IDS[4])],
    room_type: "standard",
    amenities: ["wifi", "parking", "breakfast", "ac", "desk"],
    lat: 36.21,
    lng: 44.005,
    description_tr: "Ankawa yolu üzerinde butik otel — kısa iş seyahatleri için.",
    description_en: "Boutique hotel on Ankawa Road — suited for short business trips.",
  },
  {
    id: "htl-citadel-view",
    name: "Citadel View Inn",
    city: "Erbil",
    district: "Downtown",
    stars: 3,
    rating: 4.1,
    review_count: 205,
    price_amount: 95_000,
    price_currency: "IQD",
    cover_url: u(HOTEL_PHOTO_IDS[11]),
    gallery: [u(HOTEL_PHOTO_IDS[11]), u(HOTEL_PHOTO_IDS[5])],
    room_type: "standard",
    amenities: ["wifi", "breakfast", "restaurant", "ac"],
    lat: 36.192,
    lng: 44.008,
    description_tr: "Kale manzaralı ekonomik konaklama; yürüyüş mesafesinde çarşı.",
    description_en: "Affordable Citadel views; souk within walking distance.",
  },
];

export const HOTEL_CITIES: HotelCity[] = [
  "Erbil",
  "Ankawa",
  "Sulaymaniyah",
  "Duhok",
];

/** UI kısaltmaları — Suli = Sulaymaniyah */
export const HOTEL_CITY_LABEL_KEY: Record<HotelCity, string> = {
  Erbil: "hotels.cities.Erbil",
  Ankawa: "hotels.cities.Ankawa",
  Sulaymaniyah: "hotels.cities.Sulaymaniyah",
  Duhok: "hotels.cities.Duhok",
};

export type HotelSort = "price_asc" | "price_desc" | "rating_desc";

export type HotelListFilters = {
  q?: string;
  city?: HotelCity | null;
  minStars?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  amenities?: HotelAmenity[];
  sort?: HotelSort;
};

export const DEFAULT_HOTEL_FILTERS: HotelListFilters = {
  q: "",
  city: null,
  minStars: null,
  minPrice: null,
  maxPrice: null,
  amenities: [],
  sort: "rating_desc",
};

export const HOTEL_FILTER_AMENITIES: HotelAmenity[] = [
  "wifi",
  "parking",
  "pool",
];

export const HOTEL_PRICE_PRESETS: Array<{
  min?: number;
  max?: number;
  key: string;
}> = [
  { max: 80_000, key: "budget" },
  { min: 80_000, max: 150_000, key: "mid" },
  { min: 150_000, max: 220_000, key: "upper" },
  { min: 220_000, key: "luxury" },
];

export function getHotel(id: string): DemoHotel | undefined {
  return DEMO_HOTELS.find((h) => h.id === id);
}

export function filterHotels(
  opts: HotelListFilters,
  priceByHotel?: Record<string, number | null | undefined>,
): DemoHotel[] {
  const q = (opts.q ?? "").trim().toLowerCase();
  const amenityNeed = opts.amenities ?? [];
  const sort = opts.sort ?? "rating_desc";

  const list = DEMO_HOTELS.filter((h) => {
    if (opts.city && h.city !== opts.city) return false;
    if (opts.minStars && h.stars < opts.minStars) return false;
    if (amenityNeed.length) {
      if (!amenityNeed.every((a) => h.amenities.includes(a))) return false;
    }
    const price =
      priceByHotel?.[h.id] != null ? Number(priceByHotel[h.id]) : h.price_amount;
    if (opts.minPrice != null && price < opts.minPrice) return false;
    if (opts.maxPrice != null && price > opts.maxPrice) return false;
    if (!q) return true;
    const hay = `${h.name} ${h.city} ${h.district}`.toLowerCase();
    return hay.includes(q);
  });

  const priceOf = (h: DemoHotel) =>
    priceByHotel?.[h.id] != null ? Number(priceByHotel[h.id]) : h.price_amount;

  return [...list].sort((a, b) => {
    if (sort === "price_asc") return priceOf(a) - priceOf(b);
    if (sort === "price_desc") return priceOf(b) - priceOf(a);
    return b.rating - a.rating;
  });
}

export function featuredHotels(limit = 8): DemoHotel[] {
  const featured = DEMO_HOTELS.filter((h) => h.featured);
  const rest = DEMO_HOTELS.filter((h) => !h.featured);
  return [...featured, ...rest].slice(0, limit);
}
