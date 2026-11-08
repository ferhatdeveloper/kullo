/** Grocery demo catalog — ported from M10APP martCatalog (offline-bundled images). */

import { resolveOfflineSource } from "./offline-image-map";

export type MartNames = { en: string; tr: string; ar?: string };

export type MartImageSource = number | { uri: string };

export type MartProduct = {
  id: string;
  image: MartImageSource;
  price: number;
  pro?: number;
  old?: number;
  save?: number;
  names: MartNames;
  brand?: string;
};

export type MartCategory = {
  id: string;
  image: MartImageSource;
  names: MartNames;
  snow?: boolean;
};

export type MartBrand = {
  id: string;
  name: string;
  accent: string;
  image?: MartImageSource;
};

const U = (url: string): MartImageSource =>
  (resolveOfflineSource(url) as MartImageSource | null) ?? { uri: url };

export const MART_MIN_ORDER_IQD = 15_000;

export const BUY_AGAIN: MartProduct[] = [
  {
    id: "m28160000",
    image: U("https://images.migrosone.com/sanalmarket/product/28160000/28160000_1-9a2b7c.jpg"),
    price: 1700,
    pro: 1550,
    names: { en: "Zucchini Kg", tr: "Kabak Sakız Kg" },
  },
  {
    id: "m27271000",
    image: U("https://images.migrosone.com/sanalmarket/product/27271000/27271000_1-25552e.jpg"),
    price: 3150,
    pro: 2850,
    names: { en: "Banana Kg", tr: "Muz İthal Kg" },
  },
  {
    id: "m27133000",
    image: U("https://images.migrosone.com/sanalmarket/product/27133000/27133000_1-fe30f9.jpg"),
    price: 2000,
    pro: 1800,
    names: { en: "Granny Smith Apple Kg", tr: "Elma Granny Smith Kg" },
  },
  {
    id: "m28080000",
    image: U("https://images.migrosone.com/sanalmarket/product/28080000/28080000_1-c12d3b.jpg"),
    price: 1450,
    pro: 1300,
    names: { en: "Tomato Kg", tr: "Domates Kg" },
  },
  {
    id: "m28130000",
    image: U("https://images.migrosone.com/sanalmarket/product/28130000/28130000_1-97c4cf.jpg"),
    price: 850,
    pro: 750,
    names: { en: "Cucumber Kg", tr: "Hıyar Kg" },
  },
  {
    id: "m11010208",
    image: U("https://images.migrosone.com/sanalmarket/product/11010208/11010208_1-2ec412.jpg"),
    price: 3800,
    pro: 3400,
    names: { en: "Sütaş Latte 1 L", tr: "Sütaş Latte 1 L" },
  },
];

export const CATEGORIES: MartCategory[] = [
  {
    id: "fruit",
    image: U("https://images.migrosone.com/sanalmarket/product/27271000/27271000_1-25552e.jpg"),
    names: { en: "Fruit & Veg", tr: "Meyve & Sebze", ar: "فواكه وخضار" },
  },
  {
    id: "bakery",
    image: U("https://images.migrosone.com/sanalmarket/product/05120000/05120000-a957e2.jpg"),
    names: { en: "Bakery", tr: "Fırın", ar: "مخبوزات" },
  },
  {
    id: "meat",
    image: U("https://images.migrosone.com/sanalmarket/product/19000495/19000495_1-09963d.jpg"),
    names: { en: "Meat & Seafood", tr: "Et, Tavuk & Balık", ar: "لحوم وأسماك" },
  },
  {
    id: "frozen",
    image: U("https://images.migrosone.com/sanalmarket/product/11570223/11570223_1-a0a358.jpg"),
    names: { en: "Frozen", tr: "Dondurulmuş", ar: "مجمد" },
    snow: true,
  },
  {
    id: "dairy",
    image: U("https://images.migrosone.com/sanalmarket/product/11010208/11010208_1-2ec412.jpg"),
    names: { en: "Dairy & Eggs", tr: "Süt & Yumurta", ar: "ألبان وبيض" },
  },
  {
    id: "drinks",
    image: U("https://images.migrosone.com/sanalmarket/product/08011010/08011010_1-291140.jpg"),
    names: { en: "Beverages", tr: "İçecekler", ar: "مشروبات" },
  },
  {
    id: "snacks",
    image: U("https://images.migrosone.com/sanalmarket/product/05080439/05080439_1-0ca95e.jpg"),
    names: { en: "Snacks", tr: "Atıştırmalık", ar: "سناكات" },
  },
  {
    id: "tea",
    image: U("https://images.migrosone.com/sanalmarket/product/03231527/3231527_1-9e466b.jpg"),
    names: { en: "Coffee & Tea", tr: "Çay & Kahve", ar: "قهوة وشاي" },
  },
  {
    id: "breakfast",
    image: U("https://images.migrosone.com/sanalmarket/product/07077959/7077959_1-3e9c92.jpg"),
    names: { en: "Breakfast", tr: "Kahvaltılık", ar: "فطور" },
  },
  {
    id: "ready",
    image: U("https://images.migrosone.com/sanalmarket/product/14209387/14209387_1-77ff0a.jpg"),
    names: { en: "Ready To Eat", tr: "Hazır Yemek", ar: "جاهز للأكل" },
  },
  {
    id: "clean",
    image: U("https://images.migrosone.com/sanalmarket/product/30130506/30130506_1-198a42.jpg"),
    names: { en: "Household", tr: "Temizlik", ar: "منزلية" },
  },
  {
    id: "personal",
    image: U("https://images.migrosone.com/sanalmarket/product/07070145/07070145-ef65f0.jpg"),
    names: { en: "Personal Care", tr: "Kişisel Bakım", ar: "عناية شخصية" },
  },
];

export const BRANDS: MartBrand[] = [
  {
    id: "nescafe",
    name: "Nescafe",
    accent: "#C62828",
    image: U("https://images.migrosone.com/sanalmarket/product/08059620/08059620_1-a91fd3-1650x1650.jpg"),
  },
  {
    id: "pinar",
    name: "Pınar",
    accent: "#1565C0",
    image: U("https://images.migrosone.com/sanalmarket/product/11010198/11010198_1-c52501.jpg"),
  },
  {
    id: "ulker",
    name: "Ülker",
    accent: "#6A1B9A",
    image: U("https://images.migrosone.com/sanalmarket/product/07010209/07010209-1747ff.jpg"),
  },
  {
    id: "eti",
    name: "Eti",
    accent: "#E65100",
    image: U("https://images.migrosone.com/sanalmarket/product/07163987/07163987-235c4a.jpg"),
  },
  {
    id: "coca",
    name: "Coca-Cola",
    accent: "#B71C1C",
    image: U("https://images.migrosone.com/sanalmarket/product/08010903/8010903_yan-2e2bcb.jpg"),
  },
  {
    id: "lipton",
    name: "Lipton",
    accent: "#F57F17",
    image: U("https://images.migrosone.com/sanalmarket/product/03130027/03130027_1-ecb248.jpg"),
  },
];

export const LOGO_BRANDS: { id: string; name: string; color: string }[] = [
  { id: "lb_banetti", name: "Banetti", color: "#E8F4FC" },
  { id: "lb_maggi", name: "Maggi", color: "#FFD000" },
  { id: "lb_kinder", name: "Kinder", color: "#F2F2F2" },
  { id: "lb_nescafe", name: "Nescafé", color: "#FFF3E0" },
  { id: "lb_coca", name: "Coca-Cola", color: "#FFEBEE" },
  { id: "lb_lipton", name: "Lipton", color: "#FFF8E1" },
  { id: "lb_vaseline", name: "Vaseline", color: "#E3F2FD" },
  { id: "lb_indomie", name: "Indomie", color: "#FFEBEE" },
];

export const TOP_SAVERS: MartProduct[] = [
  {
    id: "m05080443",
    image: U("https://images.migrosone.com/sanalmarket/product/05080443/05080443_1-1748e5.jpg"),
    price: 3000,
    old: 3500,
    save: 16,
    pro: 2700,
    names: { en: "Pringles Original 140 G", tr: "Pringles Sade Original 140 G" },
  },
  {
    id: "m08010903",
    image: U("https://images.migrosone.com/sanalmarket/product/08010903/8010903_yan-2e2bcb.jpg"),
    price: 1300,
    old: 1600,
    save: 19,
    pro: 1150,
    names: { en: "Coca-Cola 1.5 L", tr: "Coca-Cola Orijinal Tat Pet 1,5 L" },
  },
  {
    id: "m07040101",
    image: U("https://images.migrosone.com/sanalmarket/product/07040101/7040101-806ed5.jpg"),
    price: 6300,
    old: 6850,
    save: 9,
    pro: 5650,
    names: { en: "Ferrero Rocher 200g", tr: "Ferrero Rocher Çikolata 16'lı, 200 gr" },
  },
  {
    id: "m07163987",
    image: U("https://images.migrosone.com/sanalmarket/product/07163987/07163987-235c4a.jpg"),
    price: 1800,
    old: 2100,
    save: 17,
    pro: 1600,
    names: { en: "Eti Karam Gurme", tr: "Eti Karam Gurme Bitter Çikolata" },
  },
  {
    id: "m11010208",
    image: U("https://images.migrosone.com/sanalmarket/product/11010208/11010208_1-2ec412.jpg"),
    price: 3800,
    old: 4100,
    save: 8,
    pro: 3400,
    names: { en: "Sütaş Latte 1 L", tr: "Sütaş Latte 1 L" },
  },
  {
    id: "m11011520",
    image: U("https://images.migrosone.com/sanalmarket/product/11011520/11011520-0da5c0.jpg"),
    price: 1050,
    old: 1150,
    save: 11,
    pro: 950,
    names: { en: "UHT Milk 1 L", tr: "UHT Süt %3 Yağlı 1 L" },
  },
];

export const BEST_SELLERS: MartProduct[] = [
  {
    id: "m27271000b",
    image: U("https://images.migrosone.com/sanalmarket/product/27271000/27271000_1-25552e.jpg"),
    price: 3150,
    pro: 2850,
    names: { en: "Banana Kg", tr: "Muz İthal Kg" },
  },
  {
    id: "m27133000b",
    image: U("https://images.migrosone.com/sanalmarket/product/27133000/27133000_1-fe30f9.jpg"),
    price: 2000,
    pro: 1800,
    names: { en: "Apple Kg", tr: "Elma Granny Smith Kg" },
  },
  {
    id: "m28080000b",
    image: U("https://images.migrosone.com/sanalmarket/product/28080000/28080000_1-c12d3b.jpg"),
    price: 1450,
    pro: 1300,
    names: { en: "Tomato Kg", tr: "Domates Kg" },
  },
  {
    id: "m28130000b",
    image: U("https://images.migrosone.com/sanalmarket/product/28130000/28130000_1-97c4cf.jpg"),
    price: 850,
    pro: 750,
    names: { en: "Cucumber Kg", tr: "Hıyar Kg" },
  },
];

export const DAIRY: MartProduct[] = [
  {
    id: "m11010208d",
    image: U("https://images.migrosone.com/sanalmarket/product/11010208/11010208_1-2ec412.jpg"),
    price: 3800,
    pro: 3400,
    names: { en: "Sütaş Latte 1 L", tr: "Sütaş Latte 1 L" },
  },
  {
    id: "m11011520d",
    image: U("https://images.migrosone.com/sanalmarket/product/11011520/11011520-0da5c0.jpg"),
    price: 1050,
    pro: 950,
    names: { en: "UHT Milk 1 L", tr: "UHT Süt %3 Yağlı 1 L" },
  },
  {
    id: "m10300063",
    image: U("https://images.migrosone.com/sanalmarket/product/10300063/10300063-a0216f.jpg"),
    price: 1600,
    pro: 1450,
    names: { en: "Labne 180 G", tr: "İçim Labne 180 G" },
  },
  {
    id: "m46054277",
    image: U("https://images.migrosone.com/sanalmarket/product/46054277/46054277_1-3bb01f.jpg"),
    price: 3600,
    pro: 3250,
    names: { en: "Eggs 15-pack", tr: "Gezen 15'li Yumurta" },
  },
];

export const SNACKS: MartProduct[] = [
  {
    id: "m05080438",
    image: U("https://images.migrosone.com/sanalmarket/product/05080438/05080438_1-3ea5fb.jpg"),
    price: 2500,
    pro: 2250,
    names: { en: "Potato Chips Cheddar", tr: "Master Potato Cheddar Cip" },
  },
  {
    id: "m05080443s",
    image: U("https://images.migrosone.com/sanalmarket/product/05080443/05080443_1-1748e5.jpg"),
    price: 3000,
    pro: 2700,
    names: { en: "Pringles Original", tr: "Pringles Sade Original 140 G" },
  },
  {
    id: "m07010209",
    image: U("https://images.migrosone.com/sanalmarket/product/07010209/07010209-1747ff.jpg"),
    price: 500,
    pro: 450,
    names: { en: "Salted Sticks 40 G", tr: "Ülker Tuzlu Çubuk Kraker 40 G" },
  },
];

export const BEVERAGES: MartProduct[] = [
  {
    id: "m08010903b",
    image: U("https://images.migrosone.com/sanalmarket/product/08010903/8010903_yan-2e2bcb.jpg"),
    price: 1300,
    old: 1600,
    save: 19,
    pro: 1150,
    names: { en: "Coca-Cola 1.5 L", tr: "Coca-Cola Orijinal Tat Pet 1,5 L" },
  },
  {
    id: "m08010904",
    image: U("https://images.migrosone.com/sanalmarket/product/08010904/8010904_1-8edb97.jpg"),
    price: 1300,
    old: 1600,
    save: 19,
    pro: 1150,
    names: { en: "Coca-Cola Zero 1.5 L", tr: "Coca-Cola Zero Sugar Pet 1,5 L" },
  },
  {
    id: "m03222794",
    image: U("https://images.migrosone.com/sanalmarket/product/03222794/3222794_1-27707a.jpg"),
    price: 500,
    pro: 450,
    names: { en: "Nescafe 2in1", tr: "Nescafe 2si 1 Arada Sütlü Köpüklü 10 G" },
  },
];

export const NESCAFE_ROW: MartProduct[] = [
  {
    id: "m08059620",
    image: U("https://images.migrosone.com/sanalmarket/product/08059620/08059620_1-a91fd3-1650x1650.jpg"),
    price: 1000,
    pro: 900,
    names: { en: "Nescafe Mocha Iced 220ml", tr: "Nescafe Mocha Iced Coffee, 220ml" },
  },
  {
    id: "m08079641",
    image: U("https://images.migrosone.com/sanalmarket/product/08079641/8079641_1-c5d520-1650x1650.jpg"),
    price: 1000,
    pro: 900,
    names: { en: "Nescafe Spanish Latte", tr: "Nescafe Iced Spanish Latte, 220ml" },
  },
  {
    id: "m08079715",
    image: U("https://images.migrosone.com/sanalmarket/product/08079715/8079715_1-ec4dfe-1650x1650.jpg"),
    price: 1000,
    pro: 900,
    names: { en: "Nescafe Cappuccino Iced", tr: "Nescafe Cappuccino Iced Coffee, 220ml" },
  },
  {
    id: "m08059622",
    image: U("https://images.migrosone.com/sanalmarket/product/08059622/08059622_1-2c323d-1650x1650.jpg"),
    price: 1000,
    pro: 900,
    names: { en: "Nescafe Latte Iced", tr: "Nescafe Latte Iced Coffee, 220ml" },
  },
];

export const EXPLORE: MartProduct[] = [
  {
    id: "m05120000",
    image: U("https://images.migrosone.com/sanalmarket/product/05120000/05120000-a957e2.jpg"),
    price: 500,
    pro: 450,
    names: { en: "Bread", tr: "Sofra Ekmek Adet" },
  },
  {
    id: "m10300063e",
    image: U("https://images.migrosone.com/sanalmarket/product/10300063/10300063-a0216f.jpg"),
    price: 1600,
    pro: 1450,
    names: { en: "Labne 180 G", tr: "İçim Labne 180 G" },
  },
  {
    id: "m07040101e",
    image: U("https://images.migrosone.com/sanalmarket/product/07040101/7040101-806ed5.jpg"),
    price: 6300,
    pro: 5650,
    names: { en: "Ferrero Rocher", tr: "Ferrero Rocher Çikolata 16'lı" },
  },
  {
    id: "m30130506",
    image: U("https://images.migrosone.com/sanalmarket/product/30130506/30130506_1-198a42.jpg"),
    price: 10900,
    pro: 9800,
    names: { en: "Laundry Detergent", tr: "Rinso Toz Çamaşır Deterjanı" },
  },
];

export const WORLD = [
  { id: "w1", names: { tr: "Yerel", en: "Local" }, emoji: "🇮🇶", bg: "#E8F5E9" },
  { id: "w2", names: { tr: "Avrupa", en: "Europe" }, emoji: "🇪🇺", bg: "#E3F2FD" },
  { id: "w3", names: { tr: "ABD", en: "USA" }, emoji: "🇺🇸", bg: "#FFEBEE" },
  { id: "w4", names: { tr: "Kore", en: "Korea" }, emoji: "🇰🇷", bg: "#FCE4EC" },
  { id: "w5", names: { tr: "Türkiye", en: "Turkey" }, emoji: "🇹🇷", bg: "#FFF3E0" },
] as const;

export const AISLE_PRODUCTS: Record<string, MartProduct[]> = {
  fruit: BEST_SELLERS,
  dairy: DAIRY,
  snacks: SNACKS,
  drinks: BEVERAGES,
  tea: NESCAFE_ROW,
  bakery: EXPLORE.slice(0, 2),
  frozen: TOP_SAVERS.slice(0, 3),
  meat: BEST_SELLERS.slice(0, 2),
  breakfast: DAIRY,
  ready: EXPLORE,
  clean: [EXPLORE[3]!],
  personal: SNACKS,
};

export function productLabel(p: { names?: MartNames; name?: string }, lang: string): string {
  if (p.names) {
    if (lang.startsWith("tr") && p.names.tr) return p.names.tr;
    if (lang.startsWith("ar") && p.names.ar) return p.names.ar;
    return p.names.en || p.names.tr || "";
  }
  return p.name ?? "";
}

export function productsForAisle(aisleId: string): MartProduct[] {
  return AISLE_PRODUCTS[aisleId] ?? TOP_SAVERS;
}
