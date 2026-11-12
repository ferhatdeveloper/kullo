import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "kullo.partner_v1";

export type PartnerRole = "merchant" | "driver" | "courier";
export type MerchantVertical = "food" | "market";
export type DriverMode = "taxi" | "shared" | "airport" | "parcel";

type Persisted = {
  role: PartnerRole | null;
  merchantVertical: MerchantVertical;
  driverOnline: boolean;
  merchantOpen: boolean;
  driverMode: DriverMode | "all";
};

type PartnerState = Persisted & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setRole: (role: PartnerRole | null) => Promise<void>;
  setMerchantVertical: (v: MerchantVertical) => Promise<void>;
  setDriverOnline: (v: boolean) => Promise<void>;
  setMerchantOpen: (v: boolean) => Promise<void>;
  setDriverMode: (v: DriverMode | "all") => Promise<void>;
  clearRole: () => Promise<void>;
};

const defaults: Persisted = {
  role: null,
  merchantVertical: "food",
  driverOnline: false,
  merchantOpen: true,
  driverMode: "all",
};

async function persist(partial: Partial<Persisted>, get: () => PartnerState) {
  const next: Persisted = {
    role: get().role,
    merchantVertical: get().merchantVertical,
    driverOnline: get().driverOnline,
    merchantOpen: get().merchantOpen,
    driverMode: get().driverMode,
    ...partial,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  ...defaults,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      set({
        hydrated: true,
        role: parsed.role ?? null,
        merchantVertical: parsed.merchantVertical ?? "food",
        driverOnline: Boolean(parsed.driverOnline),
        merchantOpen: parsed.merchantOpen !== false,
        driverMode: parsed.driverMode ?? "all",
      });
    } catch {
      set({ hydrated: true });
    }
  },
  setRole: async (role) => {
    set({ role });
    await persist({ role }, get);
  },
  setMerchantVertical: async (merchantVertical) => {
    set({ merchantVertical });
    await persist({ merchantVertical }, get);
  },
  setDriverOnline: async (driverOnline) => {
    set({ driverOnline });
    await persist({ driverOnline }, get);
  },
  setMerchantOpen: async (merchantOpen) => {
    set({ merchantOpen });
    await persist({ merchantOpen }, get);
  },
  setDriverMode: async (driverMode) => {
    set({ driverMode });
    await persist({ driverMode }, get);
  },
  clearRole: async () => {
    set({ role: null });
    await persist({ role: null }, get);
  },
}));
