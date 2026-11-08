/**
 * Otobüs API istemci iskeleti.
 * Şimdi: DemoBusProvider (offline seed).
 * Sonra: EXPO_PUBLIC_BUS_API_URL + EXPO_PUBLIC_BUS_API_KEY.
 */

import { DEMO_BUSES, synthesizeBuses } from "./seed";
import type {
  BusOffer,
  TravelListFilters,
  TravelSearchQuery,
} from "./types";
import { DEFAULT_TRAVEL_FILTERS } from "./types";

export type BusApiConfig = {
  baseUrl: string;
  apiKey: string;
  forceDemo: boolean;
};

export function getBusApiConfig(): BusApiConfig {
  const baseUrl = (process.env.EXPO_PUBLIC_BUS_API_URL ?? "").trim();
  const apiKey = (process.env.EXPO_PUBLIC_BUS_API_KEY ?? "").trim();
  const forceDemo =
    (process.env.EXPO_PUBLIC_BUS_USE_DEMO ?? "true").toLowerCase() !== "false";
  return { baseUrl, apiKey, forceDemo };
}

export interface BusProvider {
  search(query: TravelSearchQuery): Promise<BusOffer[]>;
}

export class DemoBusProvider implements BusProvider {
  async search(query: TravelSearchQuery): Promise<BusOffer[]> {
    await delay(260);
    const from = query.from.toUpperCase();
    const to = query.to.toUpperCase();
    const matched = DEMO_BUSES.filter((b) => b.from === from && b.to === to);
    if (matched.length > 0) {
      return matched.map((b) => withSearchDate(b, query.date));
    }
    return synthesizeBuses(from, to, query.date);
  }
}

export class LiveBusProvider implements BusProvider {
  constructor(private readonly config: BusApiConfig) {}

  async search(query: TravelSearchQuery): Promise<BusOffer[]> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new Error("BUS_API_NOT_CONFIGURED");
    }
    const url = `${stripSlash(this.config.baseUrl)}/v1/buses/search`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        origin: query.from,
        destination: query.to,
        date: query.date,
        adults: query.pax.adults,
        children: query.pax.children,
      }),
    });
    if (!res.ok) {
      throw new Error(`BUS_API_HTTP_${res.status}`);
    }
    const data = (await res.json()) as { offers?: BusOffer[] };
    return Array.isArray(data.offers) ? data.offers : [];
  }
}

let cached: BusProvider | null = null;

export function getBusProvider(): BusProvider {
  if (cached) return cached;
  const cfg = getBusApiConfig();
  if (!cfg.forceDemo && cfg.baseUrl && cfg.apiKey) {
    cached = {
      async search(query) {
        try {
          return await new LiveBusProvider(cfg).search(query);
        } catch {
          return new DemoBusProvider().search(query);
        }
      },
    };
  } else {
    cached = new DemoBusProvider();
  }
  return cached;
}

export function filterBusOffers(
  offers: BusOffer[],
  filters: TravelListFilters = DEFAULT_TRAVEL_FILTERS,
): BusOffer[] {
  let list = [...offers];
  if (filters.maxStops != null) {
    list = list.filter((o) => o.stops <= filters.maxStops!);
  }
  if (filters.maxPrice != null) {
    list = list.filter((o) => o.price_iqd <= filters.maxPrice!);
  }
  if (filters.cabinOrSeat) {
    list = list.filter((o) => o.seatType === filters.cabinOrSeat);
  }
  list.sort((a, b) => {
    if (filters.sort === "duration_asc") return a.durationMin - b.durationMin;
    if (filters.sort === "depart_asc")
      return a.departAt.localeCompare(b.departAt);
    return a.price_iqd - b.price_iqd;
  });
  return list;
}

function withSearchDate(offer: BusOffer, date: string): BusOffer {
  const day = date.slice(0, 10);
  if (!day) return offer;
  return {
    ...offer,
    departAt: offer.departAt.replace(/^\d{4}-\d{2}-\d{2}/, day),
    arriveAt: offer.arriveAt.replace(/^\d{4}-\d{2}-\d{2}/, day),
  };
}

function stripSlash(s: string) {
  return s.replace(/\/+$/, "");
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
