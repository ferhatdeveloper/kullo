/**
 * Uçak API istemci iskeleti.
 * Şimdi: DemoTravelProvider (offline seed).
 * Sonra: EXPO_PUBLIC_FLIGHTS_API_URL + EXPO_PUBLIC_FLIGHTS_API_KEY ile gerçek sağlayıcı.
 */

import {
  DEMO_FLIGHTS,
  synthesizeFlights,
} from "./seed";
import type {
  FlightOffer,
  TravelListFilters,
  TravelSearchQuery,
} from "./types";
import { DEFAULT_TRAVEL_FILTERS } from "./types";

export type FlightsApiConfig = {
  baseUrl: string;
  apiKey: string;
  /** true → daima demo; false → URL varsa canlı denenebilir */
  forceDemo: boolean;
};

export function getFlightsApiConfig(): FlightsApiConfig {
  const baseUrl = (process.env.EXPO_PUBLIC_FLIGHTS_API_URL ?? "").trim();
  const apiKey = (process.env.EXPO_PUBLIC_FLIGHTS_API_KEY ?? "").trim();
  const forceDemo =
    (process.env.EXPO_PUBLIC_FLIGHTS_USE_DEMO ?? "true").toLowerCase() !==
    "false";
  return { baseUrl, apiKey, forceDemo };
}

export interface FlightsProvider {
  search(query: TravelSearchQuery): Promise<FlightOffer[]>;
}

/** Offline demo — her zaman dolu sonuç. */
export class DemoFlightsProvider implements FlightsProvider {
  async search(query: TravelSearchQuery): Promise<FlightOffer[]> {
    await delay(280);
    const from = query.from.toUpperCase();
    const to = query.to.toUpperCase();
    const matched = DEMO_FLIGHTS.filter(
      (f) => f.from === from && f.to === to,
    );
    if (matched.length > 0) {
      return matched.map((f) => withSearchDate(f, query.date));
    }
    return synthesizeFlights(from, to, query.date);
  }
}

/**
 * Canlı istemci iskeleti — env dolu + forceDemo=false iken çağrılır.
 * Henüz gerçek sağlayıcı yok; 501 benzeri hata fırlatır → üst katman demo’ya düşer.
 */
export class LiveFlightsProvider implements FlightsProvider {
  constructor(private readonly config: FlightsApiConfig) {}

  async search(query: TravelSearchQuery): Promise<FlightOffer[]> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new Error("FLIGHTS_API_NOT_CONFIGURED");
    }
    // Placeholder: gerçek HTTP entegrasyonu docs/TRAVEL_REFERENCE.md’de.
    const url = `${stripSlash(this.config.baseUrl)}/v1/flights/search`;
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
        infants: query.pax.infants,
      }),
    });
    if (!res.ok) {
      throw new Error(`FLIGHTS_API_HTTP_${res.status}`);
    }
    const data = (await res.json()) as { offers?: FlightOffer[] };
    return Array.isArray(data.offers) ? data.offers : [];
  }
}

let cached: FlightsProvider | null = null;

export function getFlightsProvider(): FlightsProvider {
  if (cached) return cached;
  const cfg = getFlightsApiConfig();
  if (!cfg.forceDemo && cfg.baseUrl && cfg.apiKey) {
    cached = {
      async search(query) {
        try {
          return await new LiveFlightsProvider(cfg).search(query);
        } catch {
          return new DemoFlightsProvider().search(query);
        }
      },
    };
  } else {
    cached = new DemoFlightsProvider();
  }
  return cached;
}

export function filterFlightOffers(
  offers: FlightOffer[],
  filters: TravelListFilters = DEFAULT_TRAVEL_FILTERS,
): FlightOffer[] {
  let list = [...offers];
  if (filters.maxStops != null) {
    list = list.filter((o) => o.stops <= filters.maxStops!);
  }
  if (filters.maxPrice != null) {
    list = list.filter((o) => o.price_iqd <= filters.maxPrice!);
  }
  if (filters.cabinOrSeat) {
    list = list.filter((o) => o.cabin === filters.cabinOrSeat);
  }
  list.sort((a, b) => {
    if (filters.sort === "duration_asc") return a.durationMin - b.durationMin;
    if (filters.sort === "depart_asc")
      return a.departAt.localeCompare(b.departAt);
    return a.price_iqd - b.price_iqd;
  });
  return list;
}

function withSearchDate(offer: FlightOffer, date: string): FlightOffer {
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
