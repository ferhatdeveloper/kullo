import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  DEMO_GOODS,
  DEMO_REALTY,
  DEMO_RESTAURANTS,
  DEMO_SHOPS,
  DEMO_VEHICLES,
  type DemoGoodsListing,
  type DemoRealtyListing,
  type DemoRestaurant,
  type DemoShop,
} from "./demo-data";
import { writeVehiclesSnapshot } from "./offline-snapshot";

const KEY = "kullo.marketplace_offline_v5";

type MarketplaceSnapshot = {
  realty: DemoRealtyListing[];
  goods: DemoGoodsListing[];
  shops: DemoShop[];
  restaurants: DemoRestaurant[];
  seeded: boolean;
};

type MarketplaceState = MarketplaceSnapshot & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  listRealty: () => DemoRealtyListing[];
  getRealty: (id: string) => DemoRealtyListing | undefined;
  addRealty: (item: DemoRealtyListing) => Promise<void>;
  listGoods: () => DemoGoodsListing[];
  getGoods: (id: string) => DemoGoodsListing | undefined;
  addGoods: (item: DemoGoodsListing) => Promise<void>;
  listShops: () => DemoShop[];
  getShop: (id: string) => DemoShop | undefined;
  listRestaurants: () => DemoRestaurant[];
  getRestaurant: (id: string) => DemoRestaurant | undefined;
};

function mergeById<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of base) map.set(row.id, row);
  for (const row of extra) map.set(row.id, row);
  return Array.from(map.values());
}

async function persist(snap: MarketplaceSnapshot) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  hydrated: false,
  seeded: false,
  realty: DEMO_REALTY,
  goods: DEMO_GOODS,
  shops: DEMO_SHOPS,
  restaurants: DEMO_RESTAURANTS,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        const seed: MarketplaceSnapshot = {
          realty: DEMO_REALTY,
          goods: DEMO_GOODS,
          shops: DEMO_SHOPS,
          restaurants: DEMO_RESTAURANTS,
          seeded: true,
        };
        set({ ...seed, hydrated: true });
        await persist(seed);
        await writeVehiclesSnapshot(DEMO_VEHICLES as never);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<MarketplaceSnapshot>;
      const next: MarketplaceSnapshot = {
        realty: mergeById(DEMO_REALTY, Array.isArray(parsed.realty) ? parsed.realty : []),
        goods: mergeById(DEMO_GOODS, Array.isArray(parsed.goods) ? parsed.goods : []),
        shops: mergeById(DEMO_SHOPS, Array.isArray(parsed.shops) ? parsed.shops : []),
        restaurants: mergeById(
          DEMO_RESTAURANTS,
          Array.isArray(parsed.restaurants) ? parsed.restaurants : [],
        ),
        seeded: true,
      };
      set({ ...next, hydrated: true });
      await persist(next);
      try {
        const { readVehiclesSnapshot } = await import("./offline-snapshot");
        const existing = await readVehiclesSnapshot();
        if (!existing?.length) await writeVehiclesSnapshot(DEMO_VEHICLES as never);
      } catch {
        /* ignore */
      }
    } catch {
      set({
        hydrated: true,
        seeded: true,
        realty: DEMO_REALTY,
        goods: DEMO_GOODS,
        shops: DEMO_SHOPS,
        restaurants: DEMO_RESTAURANTS,
      });
    }
  },

  listRealty: () => get().realty,
  getRealty: (id) => get().realty.find((r) => r.id === id),
  addRealty: async (item) => {
    const realty = mergeById(get().realty, [item]);
    const next = {
      realty,
      goods: get().goods,
      shops: get().shops,
      restaurants: get().restaurants,
      seeded: true,
    };
    set({ ...next });
    await persist(next);
  },

  listGoods: () => get().goods,
  getGoods: (id) => get().goods.find((g) => g.id === id),
  addGoods: async (item) => {
    const goods = mergeById(get().goods, [item]);
    const shops = get().shops.map((s) =>
      s.id === item.shop_id && !s.listing_ids.includes(item.id)
        ? { ...s, listing_ids: [...s.listing_ids, item.id] }
        : s,
    );
    const next = {
      realty: get().realty,
      goods,
      shops,
      restaurants: get().restaurants,
      seeded: true,
    };
    set({ ...next });
    await persist(next);
  },

  listShops: () => get().shops,
  getShop: (id) => get().shops.find((s) => s.id === id),

  listRestaurants: () => get().restaurants,
  getRestaurant: (id) => get().restaurants.find((r) => r.id === id),
}));
