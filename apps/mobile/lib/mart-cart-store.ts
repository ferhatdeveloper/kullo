import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "kullo.mart_cart_v1";

export type MartCartLine = {
  productId: string;
  name: string;
  unitPriceIqd: number;
  qty: number;
  imageUri?: string;
  aisle?: string;
};

type MartCartState = {
  hydrated: boolean;
  lines: MartCartLine[];
  hydrate: () => Promise<void>;
  add: (line: Omit<MartCartLine, "qty">, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: () => number;
  count: () => number;
};

async function persist(lines: MartCartLine[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ lines }));
}

export const useMartCartStore = create<MartCartState>((set, get) => ({
  hydrated: false,
  lines: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        set({ hydrated: true, lines: [] });
        return;
      }
      const parsed = JSON.parse(raw) as { lines?: MartCartLine[] };
      set({ hydrated: true, lines: parsed.lines ?? [] });
    } catch {
      set({ hydrated: true, lines: [] });
    }
  },
  add: async (line, qty = 1) => {
    const current = get().lines;
    const existing = current.find((l) => l.productId === line.productId);
    const next = existing
      ? current.map((l) =>
          l.productId === line.productId ? { ...l, qty: l.qty + qty } : l,
        )
      : [...current, { ...line, qty }];
    set({ lines: next });
    await persist(next);
  },
  setQty: async (productId, qty) => {
    const next =
      qty <= 0
        ? get().lines.filter((l) => l.productId !== productId)
        : get().lines.map((l) => (l.productId === productId ? { ...l, qty } : l));
    set({ lines: next });
    await persist(next);
  },
  clear: async () => {
    set({ lines: [] });
    await persist([]);
  },
  subtotal: () => get().lines.reduce((s, l) => s + l.unitPriceIqd * l.qty, 0),
  count: () => get().lines.reduce((n, l) => n + l.qty, 0),
}));
