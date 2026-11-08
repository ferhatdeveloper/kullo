import { create } from "zustand";

import { Coordinates, calculateDistance } from "./live-location";
import { TruckType } from "./freight-store";

export interface FuelPrice {
  regular: number;
  diesel: number;
  currency: string;
  unit: "liter" | "gallon";
  lastUpdated: number;
}

export interface TruckFuelConsumption {
  type: TruckType;
  consumptionPerKm: number;
  loadedConsumptionPerKm: number;
  unit: "liter";
}

export interface PriceBreakdown {
  fuelCost: number;
  driverFee: number;
  tollFees: number;
  serviceFee: number;
  insuranceFee: number;
  total: number;
  pricePerKm: number;
  currency: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  fuelNeeded: number;
  estimatedCost: PriceBreakdown;
}

const IRAQ_FUEL_PRICES: FuelPrice = {
  regular: 450,
  diesel: 500,
  currency: "IQD",
  unit: "liter",
  lastUpdated: Date.now(),
};

const TRUCK_FUEL_CONSUMPTION: Record<TruckType, TruckFuelConsumption> = {
  flatbed: {
    type: "flatbed",
    consumptionPerKm: 0.25,
    loadedConsumptionPerKm: 0.35,
    unit: "liter",
  },
  dry_van: {
    type: "dry_van",
    consumptionPerKm: 0.28,
    loadedConsumptionPerKm: 0.38,
    unit: "liter",
  },
  reefer: {
    type: "reefer",
    consumptionPerKm: 0.35,
    loadedConsumptionPerKm: 0.45,
    unit: "liter",
  },
  tanker: {
    type: "tanker",
    consumptionPerKm: 0.30,
    loadedConsumptionPerKm: 0.42,
    unit: "liter",
  },
  lowboy: {
    type: "lowboy",
    consumptionPerKm: 0.40,
    loadedConsumptionPerKm: 0.55,
    unit: "liter",
  },
  container: {
    type: "container",
    consumptionPerKm: 0.32,
    loadedConsumptionPerKm: 0.45,
    unit: "liter",
  },
  pickup: {
    type: "pickup",
    consumptionPerKm: 0.12,
    loadedConsumptionPerKm: 0.18,
    unit: "liter",
  },
  other: {
    type: "other",
    consumptionPerKm: 0.25,
    loadedConsumptionPerKm: 0.35,
    unit: "liter",
  },
};

const DRIVER_FEE_PER_KM = 150;
const TOLL_FEE_PER_100KM = 5000;
const SERVICE_FEE_PERCENTAGE = 0.05;
const INSURANCE_FEE_PERCENTAGE = 0.02;

interface PricingState {
  fuelPrices: FuelPrice;
  customFuelPrice: number | null;
  useCustomFuelPrice: boolean;
  
  setFuelPrices: (prices: FuelPrice) => void;
  setCustomFuelPrice: (price: number | null) => void;
  toggleCustomFuelPrice: (use: boolean) => void;
  getCurrentFuelPrice: (type: "regular" | "diesel") => number;
}

export const usePricingStore = create<PricingState>((set, get) => ({
  fuelPrices: IRAQ_FUEL_PRICES,
  customFuelPrice: null,
  useCustomFuelPrice: false,

  setFuelPrices: (prices) => set({ fuelPrices: prices }),
  
  setCustomFuelPrice: (price) => set({ customFuelPrice: price }),
  
  toggleCustomFuelPrice: (use) => set({ useCustomFuelPrice: use }),
  
  getCurrentFuelPrice: (type) => {
    const state = get();
    if (state.useCustomFuelPrice && state.customFuelPrice !== null) {
      return state.customFuelPrice;
    }
    return type === "diesel" ? state.fuelPrices.diesel : state.fuelPrices.regular;
  },
}));

export function calculateRouteDistance(
  pickup: Coordinates,
  delivery: Coordinates
): number {
  return calculateDistance(
    pickup.latitude,
    pickup.longitude,
    delivery.latitude,
    delivery.longitude
  );
}

export function calculateFuelNeeded(
  distanceKm: number,
  truckType: TruckType,
  isLoaded: boolean = true
): number {
  const consumption = TRUCK_FUEL_CONSUMPTION[truckType] || TRUCK_FUEL_CONSUMPTION.other;
  const consumptionRate = isLoaded
    ? consumption.loadedConsumptionPerKm
    : consumption.consumptionPerKm;
  
  return distanceKm * consumptionRate;
}

export function calculateFreightPrice(
  distanceKm: number,
  truckType: TruckType,
  fuelPricePerLiter: number,
  weightTons: number = 0,
  includeReturn: boolean = false
): PriceBreakdown {
  const totalDistance = includeReturn ? distanceKm * 2 : distanceKm;
  
  const fuelNeeded = calculateFuelNeeded(totalDistance, truckType, true);
  const fuelCost = Math.round(fuelNeeded * fuelPricePerLiter);
  
  const driverFee = Math.round(totalDistance * DRIVER_FEE_PER_KM);
  
  const tollFees = Math.round((totalDistance / 100) * TOLL_FEE_PER_100KM);
  
  const subtotal = fuelCost + driverFee + tollFees;
  
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE);
  const insuranceFee = Math.round(subtotal * INSURANCE_FEE_PERCENTAGE);
  
  const weightSurcharge = weightTons > 20 ? Math.round((weightTons - 20) * 5000) : 0;
  
  const total = subtotal + serviceFee + insuranceFee + weightSurcharge;
  
  return {
    fuelCost,
    driverFee,
    tollFees,
    serviceFee,
    insuranceFee,
    total,
    pricePerKm: Math.round(total / distanceKm),
    currency: "IQD",
  };
}

export function calculateEstimatedDuration(
  distanceKm: number,
  avgSpeedKmh: number = 60
): number {
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

export function getRouteInfo(
  pickup: Coordinates,
  delivery: Coordinates,
  truckType: TruckType,
  fuelPricePerLiter: number,
  weightTons: number = 0,
  includeReturn: boolean = false
): RouteInfo {
  const distance = calculateRouteDistance(pickup, delivery);
  const duration = calculateEstimatedDuration(distance);
  const totalDistance = includeReturn ? distance * 2 : distance;
  const fuelNeeded = calculateFuelNeeded(totalDistance, truckType, true);
  const estimatedCost = calculateFreightPrice(
    distance,
    truckType,
    fuelPricePerLiter,
    weightTons,
    includeReturn
  );

  return {
    distance,
    duration,
    fuelNeeded,
    estimatedCost,
  };
}

export function formatPrice(price: number, currency: string = "IQD"): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M ${currency}`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K ${currency}`;
  }
  return `${price.toLocaleString()} ${currency}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dk`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} sa`;
  }
  return `${hours} sa ${mins} dk`;
}

export function getSuggestedPrice(
  distanceKm: number,
  truckType: TruckType,
  fuelPricePerLiter: number,
  weightTons: number = 0
): { min: number; suggested: number; max: number } {
  const base = calculateFreightPrice(distanceKm, truckType, fuelPricePerLiter, weightTons);
  
  return {
    min: Math.round(base.total * 0.85),
    suggested: base.total,
    max: Math.round(base.total * 1.25),
  };
}

export function getTruckFuelType(truckType: TruckType): "regular" | "diesel" {
  if (truckType === "pickup") {
    return "regular";
  }
  return "diesel";
}

export function getFuelConsumptionInfo(truckType: TruckType): {
  empty: string;
  loaded: string;
} {
  const consumption = TRUCK_FUEL_CONSUMPTION[truckType] || TRUCK_FUEL_CONSUMPTION.other;
  return {
    empty: `${(consumption.consumptionPerKm * 100).toFixed(1)} L/100km`,
    loaded: `${(consumption.loadedConsumptionPerKm * 100).toFixed(1)} L/100km`,
  };
}

export const IRAQ_CITIES_DISTANCES: Record<string, Record<string, number>> = {
  Erbil: {
    Duhok: 145,
    Sulaymaniyah: 195,
    Kirkuk: 90,
    Mosul: 88,
    Baghdad: 350,
    Basra: 720,
  },
  Duhok: {
    Erbil: 145,
    Sulaymaniyah: 340,
    Kirkuk: 235,
    Mosul: 75,
    Baghdad: 495,
    Basra: 865,
  },
  Sulaymaniyah: {
    Erbil: 195,
    Duhok: 340,
    Kirkuk: 110,
    Mosul: 283,
    Baghdad: 290,
    Basra: 660,
  },
  Kirkuk: {
    Erbil: 90,
    Duhok: 235,
    Sulaymaniyah: 110,
    Mosul: 178,
    Baghdad: 255,
    Basra: 625,
  },
  Mosul: {
    Erbil: 88,
    Duhok: 75,
    Sulaymaniyah: 283,
    Kirkuk: 178,
    Baghdad: 400,
    Basra: 770,
  },
  Baghdad: {
    Erbil: 350,
    Duhok: 495,
    Sulaymaniyah: 290,
    Kirkuk: 255,
    Mosul: 400,
    Basra: 545,
  },
  Basra: {
    Erbil: 720,
    Duhok: 865,
    Sulaymaniyah: 660,
    Kirkuk: 625,
    Mosul: 770,
    Baghdad: 545,
  },
};

export function getCityDistance(fromCity: string, toCity: string): number | null {
  const from = IRAQ_CITIES_DISTANCES[fromCity];
  if (from && from[toCity] !== undefined) {
    return from[toCity];
  }
  return null;
}
