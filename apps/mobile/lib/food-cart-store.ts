import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "kullo.food_cart_v1";

export type FoodCartLine = {
  restaurantId: string;
  restaurantName: string;
  itemId: string;
  name: string;
  unitPriceIqd: number;
  qty: number;
};

type FoodCartState = {
  hydrated: boolean;
  lines: FoodCartLine[];
  hydrate: () => Promise<void>;
  add: (line: Omit<FoodCartLine, "qty">, qty?: number) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: () => number;
  restaurantId: () => string | null;
};

async function persist(lines: FoodCartLine[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ lines }));
}

export const useFoodCartStore = create<FoodCartState>((set, get) => ({
  hydrated: false,
  lines: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        set({ hydrated: true, lines: [] });
        return;
      }
      const parsed = JSON.parse(raw) as { lines?: FoodCartLine[] };
      set({ hydrated: true, lines: parsed.lines ?? [] });
    } catch {
      set({ hydrated: true, lines: [] });
    }
  },
  add: async (line, qty = 1) => {
    const current = get().lines;
    if (current.length && current[0].restaurantId !== line.restaurantId) {
      const next = [{ ...line, qty }];
      set({ lines: next });
      await persist(next);
      return;
    }
    const existing = current.find((l) => l.itemId === line.itemId);
    const next = existing
      ? current.map((l) =>
          l.itemId === line.itemId ? { ...l, qty: l.qty + qty } : l,
        )
      : [...current, { ...line, qty }];
    set({ lines: next });
    await persist(next);
  },
  setQty: async (itemId, qty) => {
    const next =
      qty <= 0
        ? get().lines.filter((l) => l.itemId !== itemId)
        : get().lines.map((l) => (l.itemId === itemId ? { ...l, qty } : l));
    set({ lines: next });
    await persist(next);
  },
  clear: async () => {
    set({ lines: [] });
    await persist([]);
  },
  subtotal: () => get().lines.reduce((s, l) => s + l.unitPriceIqd * l.qty, 0),
  restaurantId: () => get().lines[0]?.restaurantId ?? null,
}));
