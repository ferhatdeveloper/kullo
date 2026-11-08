import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { nearestByKm, type LatLng } from "./geo";

const KEY = "kullo.delivery_address_v1";

export type DeliveryAddress = {
  id: string;
  label: string;
  line: string;
  city: string;
  lat: number;
  lng: number;
};

/** Demo kayıtlı adresler — lat/lng ile nearest seçim */
export const DEMO_ADDRESSES: DeliveryAddress[] = [
  {
    id: "a1",
    label: "Ev",
    line: "Ankawa, Street 10",
    city: "Erbil",
    lat: 36.2355,
    lng: 44.0098,
  },
  {
    id: "a2",
    label: "İş",
    line: "Gulan St.",
    city: "Erbil",
    lat: 36.1902,
    lng: 44.0091,
  },
  {
    id: "a3",
    label: "Bağdat",
    line: "Karrada",
    city: "Baghdad",
    lat: 33.302,
    lng: 44.414,
  },
  {
    id: "a4",
    label: "Basra",
    line: "Ashar",
    city: "Basra",
    lat: 30.515,
    lng: 47.834,
  },
];

const DEFAULT_ID = DEMO_ADDRESSES[0]!.id;

type State = {
  hydrated: boolean;
  /** Konumdan otomatik seçim denendi mi (oturum) */
  autoTried: boolean;
  selectedId: string;
  addresses: DeliveryAddress[];
  hydrate: () => Promise<void>;
  select: (id: string) => Promise<void>;
  /** Cihaz konumuna göre en yakın seed adres; izin yoksa no-op */
  selectNearestFromDevice: () => Promise<string | null>;
  selectNearestTo: (origin: LatLng) => Promise<string>;
  selected: () => DeliveryAddress;
  /** Header için kısa etiket (şehir) */
  shortLabel: () => string;
};

async function persist(selectedId: string) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ selectedId }));
}

export const useDeliveryAddressStore = create<State>((set, get) => ({
  hydrated: false,
  autoTried: false,
  selectedId: DEFAULT_ID,
  addresses: DEMO_ADDRESSES,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as { selectedId?: string };
      const id = parsed.selectedId;
      const ok = DEMO_ADDRESSES.some((a) => a.id === id);
      set({ hydrated: true, selectedId: ok && id ? id : DEFAULT_ID });
    } catch {
      set({ hydrated: true });
    }
  },
  select: async (id) => {
    set({ selectedId: id });
    await persist(id);
  },
  selectNearestTo: async (origin) => {
    const hit = nearestByKm(origin, get().addresses);
    const id = hit?.id ?? DEFAULT_ID;
    set({ selectedId: id });
    await persist(id);
    return id;
  },
  selectNearestFromDevice: async () => {
    if (get().autoTried) return get().selectedId;
    set({ autoTried: true });
    try {
      const Location = await import("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const id = await get().selectNearestTo({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      return id;
    } catch {
      return null;
    }
  },
  selected: () => {
    const { selectedId, addresses } = get();
    return addresses.find((a) => a.id === selectedId) ?? addresses[0]!;
  },
  shortLabel: () => {
    const a = get().selected();
    return a.city || a.label;
  },
}));
