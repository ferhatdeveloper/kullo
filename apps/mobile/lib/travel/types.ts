/**
 * Seyahat / Transfer — ortak tipler (uçak · otobüs · özel araç).
 */

export type TravelMode = "flight" | "bus" | "private";

export type TravelPlace = {
  /** IATA / terminal kodu — pazar countryCode (IQ/TR/AE) ile aynı alan değil */
  code: string;
  city_tr: string;
  city_en: string;
  country_tr: string;
  country_en: string;
  /** IATA / otobüs terminal kodu */
  kind: "airport" | "station" | "city";
  lat: number;
  lng: number;
};

export type PaxCount = {
  adults: number;
  children: number;
  infants: number;
};

export type TravelSearchQuery = {
  from: string;
  to: string;
  date: string;
  returnDate?: string | null;
  pax: PaxCount;
};

export type TravelOfferBase = {
  id: string;
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  durationMin: number;
  price_iqd: number;
  currency: "IQD";
  seatsLeft: number;
  /** Opsiyonel platform ücreti (gösterim) */
  fee_iqd?: number;
  featured?: boolean;
};

export type FlightOffer = TravelOfferBase & {
  mode: "flight";
  airline: string;
  flightNo: string;
  stops: 0 | 1 | 2;
  cabin: "economy" | "business";
};

export type BusOffer = TravelOfferBase & {
  mode: "bus";
  operator: string;
  busNo: string;
  stops: 0 | 1 | 2;
  seatType: "standard" | "vip";
};

export type PrivateVehicleClass = "sedan" | "suv" | "van" | "luxury";

export type PrivateTransferQuote = {
  id: string;
  from: string;
  to: string;
  vehicle: PrivateVehicleClass;
  distanceKm: number;
  durationMin: number;
  price_iqd: number;
  currency: "IQD";
  fee_iqd?: number;
  seats: number;
  etaMin: number;
};

export type TravelResultSort = "price_asc" | "duration_asc" | "depart_asc";

export type TravelListFilters = {
  maxStops: 0 | 1 | 2 | null;
  sort: TravelResultSort;
  maxPrice: number | null;
  /** Uçak: economy/business; otobüs: standard/vip */
  cabinOrSeat: string | null;
};

export const DEFAULT_TRAVEL_FILTERS: TravelListFilters = {
  maxStops: null,
  sort: "price_asc",
  maxPrice: null,
  cabinOrSeat: null,
};

export function totalPax(pax: PaxCount): number {
  return Math.max(1, (pax.adults || 0) + (pax.children || 0));
}
