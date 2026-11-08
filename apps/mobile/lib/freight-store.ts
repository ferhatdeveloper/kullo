import { create } from "zustand";

import { Coordinates } from "./live-location";

export type LoadStatus =
  | "posted"
  | "bidding"
  | "awarded"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type TruckType =
  | "flatbed"
  | "dry_van"
  | "reefer"
  | "tanker"
  | "lowboy"
  | "container"
  | "pickup"
  | "other";

export type LoadCategory =
  | "general"
  | "construction"
  | "agriculture"
  | "food"
  | "chemicals"
  | "furniture"
  | "machinery"
  | "vehicles"
  | "livestock"
  | "hazmat"
  | "other";

export interface LoadLocation {
  address: string;
  city: string;
  coordinates: Coordinates;
}

export interface Load {
  id: string;
  shipperId: string;
  shipperName: string;
  shipperPhone?: string;
  shipperRating?: number;
  shipperVerified?: boolean;
  
  title: string;
  description?: string;
  category: LoadCategory;
  weight: number;
  weightUnit: "kg" | "ton";
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: "m" | "cm";
  };
  
  truckType: TruckType;
  truckCount?: number;
  
  pickup: LoadLocation;
  delivery: LoadLocation;
  distance?: number;
  
  pickupDate: string;
  pickupTimeWindow?: { from: string; to: string };
  deliveryDate?: string;
  
  price?: number;
  priceType: "fixed" | "per_km" | "negotiable";
  currency: string;
  
  status: LoadStatus;
  bidsCount: number;
  
  requirements?: string[];
  images?: string[];
  
  createdAt: number;
  updatedAt: number;
}

export interface Bid {
  id: string;
  loadId: string;
  carrierId: string;
  carrierName: string;
  carrierPhone?: string;
  carrierRating?: number;
  carrierVerified?: boolean;
  
  truckType: TruckType;
  truckPlate?: string;
  driverName?: string;
  driverPhone?: string;
  
  price: number;
  currency: string;
  message?: string;
  
  estimatedPickup?: string;
  estimatedDelivery?: string;
  
  status: "pending" | "accepted" | "rejected" | "expired" | "withdrawn";
  
  createdAt: number;
  updatedAt: number;
}

export interface Carrier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  
  companyName?: string;
  truckTypes: TruckType[];
  truckCount: number;
  
  completedLoads: number;
  onTimeRate: number;
  
  location?: Coordinates;
  serviceAreas?: string[];
  
  createdAt: number;
}

export interface Trip {
  id: string;
  loadId: string;
  load: Load;
  carrierId: string;
  carrier: Carrier;
  
  status: "assigned" | "en_route_pickup" | "at_pickup" | "loaded" | "in_transit" | "at_delivery" | "delivered";
  
  currentLocation?: Coordinates;
  eta?: number;
  
  pickupOtp?: string;
  deliveryOtp?: string;
  
  pickupTime?: number;
  deliveryTime?: number;
  
  signature?: string;
  photos?: string[];
  
  createdAt: number;
  updatedAt: number;
}

interface FreightState {
  loads: Load[];
  myLoads: Load[];
  myBids: Bid[];
  activeTrip: Trip | null;
  
  filters: {
    category?: LoadCategory;
    truckType?: TruckType;
    minWeight?: number;
    maxWeight?: number;
    pickupCity?: string;
    deliveryCity?: string;
    sortBy: "newest" | "price_high" | "price_low" | "distance" | "pickup_date";
  };
  
  isLoading: boolean;
  error: string | null;
  
  setLoads: (loads: Load[]) => void;
  addLoad: (load: Load) => void;
  updateLoad: (id: string, updates: Partial<Load>) => void;
  removeLoad: (id: string) => void;
  
  setMyLoads: (loads: Load[]) => void;
  setMyBids: (bids: Bid[]) => void;
  addBid: (bid: Bid) => void;
  updateBid: (id: string, updates: Partial<Bid>) => void;
  
  setActiveTrip: (trip: Trip | null) => void;
  updateTrip: (updates: Partial<Trip>) => void;
  
  setFilters: (filters: Partial<FreightState["filters"]>) => void;
  resetFilters: () => void;
  
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: FreightState["filters"] = {
  sortBy: "newest",
};

export const useFreightStore = create<FreightState>((set) => ({
  loads: [],
  myLoads: [],
  myBids: [],
  activeTrip: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,

  setLoads: (loads) => set({ loads }),
  
  addLoad: (load) =>
    set((state) => ({
      loads: [load, ...state.loads],
      myLoads: [load, ...state.myLoads],
    })),
  
  updateLoad: (id, updates) =>
    set((state) => ({
      loads: state.loads.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l
      ),
      myLoads: state.myLoads.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l
      ),
    })),
  
  removeLoad: (id) =>
    set((state) => ({
      loads: state.loads.filter((l) => l.id !== id),
      myLoads: state.myLoads.filter((l) => l.id !== id),
    })),

  setMyLoads: (loads) => set({ myLoads: loads }),
  
  setMyBids: (bids) => set({ myBids: bids }),
  
  addBid: (bid) =>
    set((state) => ({
      myBids: [bid, ...state.myBids],
      loads: state.loads.map((l) =>
        l.id === bid.loadId ? { ...l, bidsCount: l.bidsCount + 1 } : l
      ),
    })),
  
  updateBid: (id, updates) =>
    set((state) => ({
      myBids: state.myBids.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b
      ),
    })),

  setActiveTrip: (trip) => set({ activeTrip: trip }),
  
  updateTrip: (updates) =>
    set((state) => ({
      activeTrip: state.activeTrip
        ? { ...state.activeTrip, ...updates, updatedAt: Date.now() }
        : null,
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  
  resetFilters: () => set({ filters: defaultFilters }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export function getTruckTypeLabel(type: TruckType): string {
  const labels: Record<TruckType, string> = {
    flatbed: "Açık Kasa",
    dry_van: "Kapalı Kasa",
    reefer: "Frigorifik",
    tanker: "Tanker",
    lowboy: "Lowboy",
    container: "Konteyner",
    pickup: "Kamyonet",
    other: "Diğer",
  };
  return labels[type] || type;
}

export function getLoadCategoryLabel(category: LoadCategory): string {
  const labels: Record<LoadCategory, string> = {
    general: "Genel Yük",
    construction: "İnşaat Malzemesi",
    agriculture: "Tarım Ürünleri",
    food: "Gıda",
    chemicals: "Kimyasal",
    furniture: "Mobilya",
    machinery: "Makine",
    vehicles: "Araç",
    livestock: "Canlı Hayvan",
    hazmat: "Tehlikeli Madde",
    other: "Diğer",
  };
  return labels[category] || category;
}

export function getLoadStatusLabel(status: LoadStatus): string {
  const labels: Record<LoadStatus, string> = {
    posted: "Yayında",
    bidding: "Teklif Aşamasında",
    awarded: "Atandı",
    assigned: "Sürücü Atandı",
    in_transit: "Taşımada",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
  };
  return labels[status] || status;
}

export function getLoadStatusColor(status: LoadStatus): string {
  const colors: Record<LoadStatus, string> = {
    posted: "#2196F3",
    bidding: "#FF9800",
    awarded: "#9C27B0",
    assigned: "#3F51B5",
    in_transit: "#4CAF50",
    delivered: "#8BC34A",
    cancelled: "#F44336",
  };
  return colors[status] || "#9E9E9E";
}

export function matchScore(load: Load, carrier: Carrier): number {
  let score = 0;
  
  if (carrier.truckTypes.includes(load.truckType)) {
    score += 30;
  }
  
  score += Math.min(carrier.rating * 10, 25);
  
  if (carrier.verified) {
    score += 15;
  }
  
  const completionBonus = Math.min(carrier.completedLoads / 10, 15);
  score += completionBonus;
  
  score += carrier.onTimeRate * 15;
  
  return Math.round(score);
}

export function formatWeight(weight: number, unit: "kg" | "ton"): string {
  if (unit === "ton") {
    return `${weight} ton`;
  }
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} ton`;
  }
  return `${weight} kg`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
