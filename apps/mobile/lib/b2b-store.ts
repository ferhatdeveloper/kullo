/**
 * B2B toptancı ↔ firma — talep / teklif / kabul (AsyncStorage seed offline).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { commissionBreakdown } from "./kullo-commission";

const KEY = "kullo.b2b_v1";

export type B2BRole = "company" | "wholesale";

export type B2BRequestStatus = "open" | "accepted" | "closed";

export type B2BOfferStatus = "pending" | "accepted" | "rejected";

export type B2BCategory =
  | "grocery"
  | "building"
  | "electronics"
  | "packaging"
  | "other";

export type B2BRequest = {
  id: string;
  companyName: string;
  title: string;
  category: B2BCategory;
  quantity: number;
  unit: string;
  city: string;
  notes?: string;
  status: B2BRequestStatus;
  createdAt: string;
  acceptedOfferId?: string;
};

export type B2BOffer = {
  id: string;
  requestId: string;
  wholesalerName: string;
  /** Birim fiyat IQD */
  unitPrice_iqd: number;
  /** Toplam teklif IQD */
  totalPrice_iqd: number;
  deliveryDays: number;
  note?: string;
  createdAt: string;
  status: B2BOfferStatus;
};

type Persisted = {
  role: B2BRole;
  requests: B2BRequest[];
  offers: B2BOffer[];
};

type State = {
  hydrated: boolean;
  role: B2BRole;
  requests: B2BRequest[];
  offers: B2BOffer[];
  hydrate: () => Promise<void>;
  setRole: (role: B2BRole) => Promise<void>;
  createRequest: (
    input: Omit<B2BRequest, "id" | "createdAt" | "status" | "acceptedOfferId">,
  ) => Promise<B2BRequest>;
  addOffer: (
    input: Omit<B2BOffer, "id" | "createdAt" | "status">,
  ) => Promise<B2BOffer>;
  acceptOffer: (requestId: string, offerId: string) => Promise<void>;
  offersFor: (requestId: string) => B2BOffer[];
  requestById: (id: string) => B2BRequest | undefined;
};

const SEED_REQUESTS: B2BRequest[] = [
  {
    id: "b2b-req-1",
    companyName: "Zagros Market Ltd.",
    title: "Pirinç 25 kg çuval — 200 adet",
    category: "grocery",
    quantity: 200,
    unit: "çuval",
    city: "Erbil",
    notes: "Basmati tercih; teslim Ankawa depo.",
    status: "open",
    createdAt: "2026-11-05T09:00:00.000Z",
  },
  {
    id: "b2b-req-2",
    companyName: "Nawroz İnşaat",
    title: "Çimento 50 kg — 500 torba",
    category: "building",
    quantity: 500,
    unit: "torba",
    city: "Sulaymaniyah",
    notes: "Haftalık sevkiyat mümkün olsun.",
    status: "open",
    createdAt: "2026-11-06T11:30:00.000Z",
  },
  {
    id: "b2b-req-3",
    companyName: "Koya Elektronik",
    title: "USB-C şarj kablosu — 1000 adet",
    category: "electronics",
    quantity: 1000,
    unit: "adet",
    city: "Erbil",
    status: "open",
    createdAt: "2026-11-06T15:00:00.000Z",
  },
  {
    id: "b2b-req-4",
    companyName: "Baran Gıda",
    title: "Karton koli 40×30×30 — 3000 adet",
    category: "packaging",
    quantity: 3000,
    unit: "adet",
    city: "Duhok",
    notes: "Marka baskısı yok; düz kraft.",
    status: "accepted",
    createdAt: "2026-11-03T08:00:00.000Z",
    acceptedOfferId: "b2b-off-4a",
  },
];

const SEED_OFFERS: B2BOffer[] = [
  {
    id: "b2b-off-1a",
    requestId: "b2b-req-1",
    wholesalerName: "Hawler Toptan",
    unitPrice_iqd: 42_000,
    totalPrice_iqd: 8_400_000,
    deliveryDays: 3,
    note: "Depodan teslim · fatura IQD",
    createdAt: "2026-11-05T14:00:00.000Z",
    status: "pending",
  },
  {
    id: "b2b-off-1b",
    requestId: "b2b-req-1",
    wholesalerName: "Kurdistan Bulk Co.",
    unitPrice_iqd: 39_500,
    totalPrice_iqd: 7_900_000,
    deliveryDays: 5,
    note: "Minimum 150 çuval",
    createdAt: "2026-11-05T16:20:00.000Z",
    status: "pending",
  },
  {
    id: "b2b-off-2a",
    requestId: "b2b-req-2",
    wholesalerName: "Suli Yapı Toptan",
    unitPrice_iqd: 9_800,
    totalPrice_iqd: 4_900_000,
    deliveryDays: 2,
    createdAt: "2026-11-06T13:00:00.000Z",
    status: "pending",
  },
  {
    id: "b2b-off-3a",
    requestId: "b2b-req-3",
    wholesalerName: "Tech Wholesale IQ",
    unitPrice_iqd: 2_750,
    totalPrice_iqd: 2_750_000,
    deliveryDays: 7,
    note: "1 m · 60 W uyumlu",
    createdAt: "2026-11-07T09:10:00.000Z",
    status: "pending",
  },
  {
    id: "b2b-off-4a",
    requestId: "b2b-req-4",
    wholesalerName: "PakPack Toptan",
    unitPrice_iqd: 1_100,
    totalPrice_iqd: 3_300_000,
    deliveryDays: 4,
    createdAt: "2026-11-03T12:00:00.000Z",
    status: "accepted",
  },
];

async function persist(slice: Persisted) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(slice));
  } catch {
    /* ignore */
  }
}

function seed(): Persisted {
  return {
    role: "company",
    requests: SEED_REQUESTS,
    offers: SEED_OFFERS,
  };
}

export function offerCommission(totalPrice_iqd: number) {
  return commissionBreakdown(totalPrice_iqd);
}

export const useB2BStore = create<State>((set, get) => ({
  hydrated: false,
  role: "company",
  requests: [],
  offers: [],

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        const s = seed();
        set({ ...s, hydrated: true });
        await persist(s);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      const requests = Array.isArray(parsed.requests) ? parsed.requests : seed().requests;
      const offers = Array.isArray(parsed.offers) ? parsed.offers : seed().offers;
      const role = parsed.role === "wholesale" ? "wholesale" : "company";
      set({ hydrated: true, role, requests, offers });
    } catch {
      const s = seed();
      set({ ...s, hydrated: true });
    }
  },

  setRole: async (role) => {
    const next = { role, requests: get().requests, offers: get().offers };
    set({ role });
    await persist(next);
  },

  createRequest: async (input) => {
    const req: B2BRequest = {
      ...input,
      id: `b2b-req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: "open",
    };
    const requests = [req, ...get().requests];
    set({ requests });
    await persist({ role: get().role, requests, offers: get().offers });
    return req;
  },

  addOffer: async (input) => {
    const offer: B2BOffer = {
      ...input,
      id: `b2b-off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    const offers = [offer, ...get().offers];
    set({ offers });
    await persist({ role: get().role, requests: get().requests, offers });
    return offer;
  },

  acceptOffer: async (requestId, offerId) => {
    const offers = get().offers.map((o) => {
      if (o.requestId !== requestId) return o;
      if (o.id === offerId) return { ...o, status: "accepted" as const };
      if (o.status === "pending") return { ...o, status: "rejected" as const };
      return o;
    });
    const requests = get().requests.map((r) =>
      r.id === requestId
        ? { ...r, status: "accepted" as const, acceptedOfferId: offerId }
        : r,
    );
    set({ offers, requests });
    await persist({ role: get().role, requests, offers });
  },

  offersFor: (requestId) =>
    get()
      .offers.filter((o) => o.requestId === requestId)
      .sort((a, b) => a.totalPrice_iqd - b.totalPrice_iqd),

  requestById: (id) => get().requests.find((r) => r.id === id),
}));

export const B2B_CATEGORIES: B2BCategory[] = [
  "grocery",
  "building",
  "electronics",
  "packaging",
  "other",
];

export const B2B_CITIES = ["Erbil", "Ankawa", "Sulaymaniyah", "Duhok"] as const;
