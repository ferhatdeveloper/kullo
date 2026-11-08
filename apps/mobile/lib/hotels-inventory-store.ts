import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  DEMO_HOTELS,
  HOTEL_PHOTO_IDS,
  type DemoHotel,
  type HotelRoomType,
} from "./hotels-catalog";

/** User-requested persist key */
const KEY = "hotels-inventory";

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;

export type HotelRoom = {
  id: string;
  name: string;
  capacity: number;
  /** Gecelik IQD */
  price_amount: number;
  /** Müsait oda stoğu */
  stock: number;
  room_type: HotelRoomType;
  cover_url: string;
  gallery: string[];
};

export type HotelsInventory = Record<string, HotelRoom[]>;

type State = {
  hydrated: boolean;
  byHotel: HotelsInventory;
  hydrate: () => Promise<void>;
  roomsFor: (hotelId: string) => HotelRoom[];
  minPriceFor: (hotelId: string) => number | null;
  upsertRoom: (hotelId: string, room: HotelRoom) => Promise<void>;
  removeRoom: (hotelId: string, roomId: string) => Promise<void>;
  setRooms: (hotelId: string, rooms: HotelRoom[]) => Promise<void>;
};

const ROOM_NAME: Record<HotelRoomType, string> = {
  standard: "Standart oda",
  deluxe: "Deluxe oda",
  suite: "Suit",
  residence: "Residence süit",
};

/** Oda tipine göre offline home foto id’leri (OfflineCover) */
const ROOM_PHOTO_SETS: Record<HotelRoomType, readonly [string, string, string]> = {
  standard: [HOTEL_PHOTO_IDS[4], HOTEL_PHOTO_IDS[9], HOTEL_PHOTO_IDS[11]],
  deluxe: [HOTEL_PHOTO_IDS[3], HOTEL_PHOTO_IDS[1], HOTEL_PHOTO_IDS[7]],
  suite: [HOTEL_PHOTO_IDS[0], HOTEL_PHOTO_IDS[2], HOTEL_PHOTO_IDS[6]],
  residence: [HOTEL_PHOTO_IDS[5], HOTEL_PHOTO_IDS[8], HOTEL_PHOTO_IDS[10]],
};

export function photosForRoomType(roomType: HotelRoomType): {
  cover_url: string;
  gallery: string[];
} {
  const ids = ROOM_PHOTO_SETS[roomType] ?? ROOM_PHOTO_SETS.standard;
  const gallery = ids.map((id) => u(id));
  return { cover_url: gallery[0], gallery };
}

function seedRoomsForHotel(hotel: DemoHotel): HotelRoom[] {
  const base = hotel.price_amount;
  const primaryPhotos = photosForRoomType(hotel.room_type);
  const primary: HotelRoom = {
    id: `${hotel.id}-r1`,
    name: ROOM_NAME[hotel.room_type],
    capacity: hotel.room_type === "suite" || hotel.room_type === "residence" ? 3 : 2,
    price_amount: base,
    stock: hotel.stars >= 5 ? 8 : 12,
    room_type: hotel.room_type,
    ...primaryPhotos,
  };

  const extras: HotelRoom[] = [];
  if (hotel.room_type !== "standard") {
    extras.push({
      id: `${hotel.id}-r2`,
      name: ROOM_NAME.standard,
      capacity: 2,
      price_amount: Math.round((base * 0.72) / 1000) * 1000,
      stock: 10,
      room_type: "standard",
      ...photosForRoomType("standard"),
    });
  } else {
    extras.push({
      id: `${hotel.id}-r2`,
      name: ROOM_NAME.deluxe,
      capacity: 2,
      price_amount: Math.round((base * 1.35) / 1000) * 1000,
      stock: 6,
      room_type: "deluxe",
      ...photosForRoomType("deluxe"),
    });
  }

  if (hotel.stars >= 4) {
    const thirdType: HotelRoomType =
      hotel.room_type === "suite"
        ? "residence"
        : hotel.room_type === "residence"
          ? "deluxe"
          : "suite";
    extras.push({
      id: `${hotel.id}-r3`,
      name: ROOM_NAME[thirdType],
      capacity: thirdType === "suite" || thirdType === "residence" ? 4 : 2,
      price_amount: Math.round((base * 1.55) / 1000) * 1000,
      stock: 3,
      room_type: thirdType,
      ...photosForRoomType(thirdType),
    });
  }

  return [primary, ...extras].sort((a, b) => a.price_amount - b.price_amount);
}

function buildSeed(): HotelsInventory {
  const out: HotelsInventory = {};
  for (const h of DEMO_HOTELS) {
    out[h.id] = seedRoomsForHotel(h);
  }
  return out;
}

function normalizeRoom(r: Partial<HotelRoom>, fallbackType: HotelRoomType = "standard"): HotelRoom {
  const room_type = (r.room_type as HotelRoomType) || fallbackType;
  const photos = photosForRoomType(room_type);
  const gallery =
    Array.isArray(r.gallery) && r.gallery.length
      ? r.gallery.filter((x): x is string => typeof x === "string")
      : photos.gallery;
  return {
    id: String(r.id || `room-${Date.now()}`),
    name: String(r.name || "Room"),
    capacity: Math.max(1, Number(r.capacity) || 2),
    price_amount: Math.max(0, Number(r.price_amount) || 0),
    stock: Math.max(0, Number(r.stock) || 0),
    room_type,
    cover_url: typeof r.cover_url === "string" && r.cover_url ? r.cover_url : photos.cover_url,
    gallery,
  };
}

function normalizeInventory(raw: unknown): HotelsInventory {
  if (!raw || typeof raw !== "object") return buildSeed();
  const seed = buildSeed();
  const parsed = raw as HotelsInventory;
  const out: HotelsInventory = { ...seed };
  for (const [hotelId, rooms] of Object.entries(parsed)) {
    if (!Array.isArray(rooms)) continue;
    const cleaned = rooms
      .filter((r) => r && typeof r === "object" && typeof (r as HotelRoom).id === "string")
      .map((r) => normalizeRoom(r as Partial<HotelRoom>));
    if (cleaned.length) out[hotelId] = cleaned;
  }
  return out;
}

async function persist(byHotel: HotelsInventory) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(byHotel));
  } catch {
    /* ignore */
  }
}

export const useHotelsInventory = create<State>((set, get) => ({
  hydrated: false,
  byHotel: buildSeed(),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        const seed = buildSeed();
        set({ byHotel: seed, hydrated: true });
        await persist(seed);
        return;
      }
      const byHotel = normalizeInventory(JSON.parse(raw));
      set({ byHotel, hydrated: true });
      await persist(byHotel);
    } catch {
      set({ byHotel: buildSeed(), hydrated: true });
    }
  },

  roomsFor: (hotelId) => get().byHotel[hotelId] ?? [],

  minPriceFor: (hotelId) => {
    const rooms = get().byHotel[hotelId] ?? [];
    const available = rooms.filter((r) => r.stock > 0);
    const pool = available.length ? available : rooms;
    if (!pool.length) return null;
    return Math.min(...pool.map((r) => r.price_amount));
  },

  upsertRoom: async (hotelId, room) => {
    const cur = get().byHotel[hotelId] ?? [];
    const normalized = normalizeRoom(room, room.room_type);
    const idx = cur.findIndex((r) => r.id === normalized.id);
    const nextRooms =
      idx >= 0
        ? cur.map((r, i) => (i === idx ? normalized : r))
        : [...cur, normalized];
    const byHotel = { ...get().byHotel, [hotelId]: nextRooms };
    set({ byHotel });
    await persist(byHotel);
  },

  removeRoom: async (hotelId, roomId) => {
    const cur = get().byHotel[hotelId] ?? [];
    const byHotel = {
      ...get().byHotel,
      [hotelId]: cur.filter((r) => r.id !== roomId),
    };
    set({ byHotel });
    await persist(byHotel);
  },

  setRooms: async (hotelId, rooms) => {
    const byHotel = {
      ...get().byHotel,
      [hotelId]: rooms.map((r) => normalizeRoom(r, r.room_type)),
    };
    set({ byHotel });
    await persist(byHotel);
  },
}));

export function newRoomId(hotelId: string): string {
  return `${hotelId}-r${Date.now().toString(36)}`;
}
