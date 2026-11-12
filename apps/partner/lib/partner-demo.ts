export type MerchantOrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "handed"
  | "cancelled";

export type DemoMerchantOrder = {
  id: string;
  code: string;
  customer: string;
  items: { name: string; qty: number }[];
  total: number;
  currency: "IQD";
  status: MerchantOrderStatus;
  placedAt: string;
  etaMin: number;
  note?: string;
  courierName?: string;
};

export type DemoMenuItem = {
  id: string;
  name: string;
  price: number;
  currency: "IQD";
  available: boolean;
  category: string;
};

export const DEMO_MERCHANT_STATS = {
  todayOrders: 24,
  todayRevenue: 1_840_000,
  avgPrepMin: 18,
  rating: 4.8,
  acceptanceRate: 96,
};

export const DEMO_MERCHANT_ORDERS: DemoMerchantOrder[] = [
  {
    id: "mo1",
    code: "#K-1842",
    customer: "A. Hassan",
    items: [
      { name: "Lahmacun", qty: 3 },
      { name: "Ayran", qty: 2 },
    ],
    total: 28_500,
    currency: "IQD",
    status: "new",
    placedAt: "12:41",
    etaMin: 25,
    note: "Az acılı",
  },
  {
    id: "mo2",
    code: "#K-1841",
    customer: "R. Omar",
    items: [
      { name: "Iskender", qty: 1 },
      { name: "Salata", qty: 1 },
    ],
    total: 22_000,
    currency: "IQD",
    status: "preparing",
    placedAt: "12:28",
    etaMin: 12,
  },
  {
    id: "mo3",
    code: "#K-1839",
    customer: "M. Ali",
    items: [{ name: "Pide karışık", qty: 2 }],
    total: 19_000,
    currency: "IQD",
    status: "ready",
    placedAt: "12:10",
    etaMin: 0,
    courierName: "Kurye · S. Karim",
  },
  {
    id: "mo4",
    code: "#K-1835",
    customer: "N. Suleiman",
    items: [
      { name: "Adana dürüm", qty: 2 },
      { name: "Kola", qty: 2 },
    ],
    total: 24_000,
    currency: "IQD",
    status: "handed",
    placedAt: "11:52",
    etaMin: 0,
  },
  {
    id: "mo5",
    code: "#K-1830",
    customer: "H. Barzani",
    items: [{ name: "Çorba", qty: 1 }],
    total: 6_500,
    currency: "IQD",
    status: "cancelled",
    placedAt: "11:20",
    etaMin: 0,
  },
];

export const DEMO_MENU_ITEMS: DemoMenuItem[] = [
  {
    id: "mi1",
    name: "Lahmacun",
    price: 7_500,
    currency: "IQD",
    available: true,
    category: "Fırın",
  },
  {
    id: "mi2",
    name: "Iskender",
    price: 18_000,
    currency: "IQD",
    available: true,
    category: "Ana",
  },
  {
    id: "mi3",
    name: "Pide karışık",
    price: 9_500,
    currency: "IQD",
    available: true,
    category: "Fırın",
  },
  {
    id: "mi4",
    name: "Adana dürüm",
    price: 9_000,
    currency: "IQD",
    available: false,
    category: "Dürüm",
  },
  {
    id: "mi5",
    name: "Ayran",
    price: 2_500,
    currency: "IQD",
    available: true,
    category: "İçecek",
  },
  {
    id: "mi6",
    name: "Baklava",
    price: 8_000,
    currency: "IQD",
    available: true,
    category: "Tatlı",
  },
];

export function nextMerchantStatus(
  status: MerchantOrderStatus,
): MerchantOrderStatus | null {
  if (status === "new") return "accepted";
  if (status === "accepted") return "preparing";
  if (status === "preparing") return "ready";
  if (status === "ready") return "handed";
  return null;
}
