import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { MeetingType } from "./health-catalog";

const KEY = "kullo.health_appointments_v1";

export type HealthAppointment = {
  id: string;
  providerId: string;
  providerName: string;
  specialty: string;
  clinic: string;
  city: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  meetingType: MeetingType;
  fee_iqd: number;
  phone?: string;
  createdAt: string;
  status: "upcoming" | "done" | "cancelled";
};

type State = {
  hydrated: boolean;
  items: HealthAppointment[];
  hydrate: () => Promise<void>;
  add: (a: Omit<HealthAppointment, "id" | "createdAt" | "status">) => Promise<HealthAppointment>;
  cancel: (id: string) => Promise<void>;
};

async function persist(items: HealthAppointment[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export const useHealthAppointments = create<State>((set, get) => ({
  hydrated: false,
  items: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const items = raw ? (JSON.parse(raw) as HealthAppointment[]) : [];
      set({
        hydrated: true,
        items: Array.isArray(items) ? items : [],
      });
    } catch {
      set({ hydrated: true, items: [] });
    }
  },
  add: async (input) => {
    const appt: HealthAppointment = {
      ...input,
      id: `ha-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "upcoming",
    };
    const items = [appt, ...get().items];
    set({ items });
    await persist(items);
    return appt;
  },
  cancel: async (id) => {
    const items = get().items.map((a) =>
      a.id === id ? { ...a, status: "cancelled" as const } : a,
    );
    set({ items });
    await persist(items);
  },
}));
