import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "kullo.realty_favorites_v1";

type State = {
  hydrated: boolean;
  ids: string[];
  hydrate: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
  has: (id: string) => boolean;
  clear: () => Promise<void>;
};

export const useRealtyFavorites = create<State>((set, get) => ({
  hydrated: false,
  ids: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      set({ hydrated: true, ids: Array.isArray(ids) ? ids : [] });
    } catch {
      set({ hydrated: true, ids: [] });
    }
  },
  toggle: async (id) => {
    const cur = get().ids;
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    set({ ids: next });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  },
  has: (id) => get().ids.includes(id),
  clear: async () => {
    set({ ids: [] });
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
}));
