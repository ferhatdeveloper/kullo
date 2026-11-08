import * as Location from "expo-location";
import { create } from "zustand";

export interface Coordinates {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  type: "driver" | "courier" | "delivery";
  status: "idle" | "en_route" | "arrived" | "busy";
  location: Coordinates;
  destination?: Coordinates;
  eta?: number;
  phone?: string;
  avatar?: string;
  rating?: number;
  vehicleType?: string;
  vehiclePlate?: string;
}

interface LiveLocationState {
  userLocation: Coordinates | null;
  agents: Agent[];
  activeOrderId: string | null;
  watchId: Location.LocationSubscription | null;
  isTracking: boolean;
  error: string | null;
  
  setUserLocation: (location: Coordinates) => void;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  setActiveOrder: (orderId: string | null) => void;
  setTracking: (isTracking: boolean) => void;
  setError: (error: string | null) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

export const useLiveLocation = create<LiveLocationState>((set, get) => ({
  userLocation: null,
  agents: [],
  activeOrderId: null,
  watchId: null,
  isTracking: false,
  error: null,

  setUserLocation: (location) => set({ userLocation: location }),
  
  setAgents: (agents) => set({ agents }),
  
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  
  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents.filter((a) => a.id !== agent.id), agent],
    })),
  
  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    })),
  
  setActiveOrder: (orderId) => set({ activeOrderId: orderId }),
  
  setTracking: (isTracking) => set({ isTracking }),
  
  setError: (error) => set({ error }),

  startTracking: async () => {
    const state = get();
    if (state.isTracking) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({ error: "Location permission denied" });
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      set({
        userLocation: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          heading: currentLocation.coords.heading ?? undefined,
          speed: currentLocation.coords.speed ?? undefined,
          timestamp: currentLocation.timestamp,
        },
        isTracking: true,
        error: null,
      });

      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (location) => {
          set({
            userLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading ?? undefined,
              speed: location.coords.speed ?? undefined,
              timestamp: location.timestamp,
            },
          });
        }
      );

      set({ watchId });
    } catch (err) {
      set({ error: String(err), isTracking: false });
    }
  },

  stopTracking: () => {
    const state = get();
    if (state.watchId) {
      state.watchId.remove();
    }
    set({ watchId: null, isTracking: false });
  },
}));

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatETA(minutes: number): string {
  if (minutes < 1) return "< 1 dk";
  if (minutes < 60) return `${Math.round(minutes)} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} sa`;
}

export function getAgentStatusColor(status: Agent["status"]): string {
  switch (status) {
    case "idle":
      return "#9E9E9E";
    case "en_route":
      return "#4CAF50";
    case "arrived":
      return "#2196F3";
    case "busy":
      return "#FF9800";
    default:
      return "#9E9E9E";
  }
}
