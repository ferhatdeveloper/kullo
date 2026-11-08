/**
 * Offline demo seed — ülkeler arası + bölgesel seyahat sonuçları.
 */

import type {
  BusOffer,
  FlightOffer,
  PrivateTransferQuote,
  TravelPlace,
} from "./types";

export const TRAVEL_PLACES: TravelPlace[] = [
  {
    code: "EBL",
    city_tr: "Erbil",
    city_en: "Erbil",
    country_tr: "Irak",
    country_en: "Iraq",
    kind: "airport",
    lat: 36.2376,
    lng: 43.9631,
  },
  {
    code: "BGW",
    city_tr: "Bağdat",
    city_en: "Baghdad",
    country_tr: "Irak",
    country_en: "Iraq",
    kind: "airport",
    lat: 33.2625,
    lng: 44.2346,
  },
  {
    code: "ISU",
    city_tr: "Süleymaniye",
    city_en: "Sulaymaniyah",
    country_tr: "Irak",
    country_en: "Iraq",
    kind: "airport",
    lat: 35.5608,
    lng: 45.3147,
  },
  {
    code: "DHK",
    city_tr: "Duhok",
    city_en: "Duhok",
    country_tr: "Irak",
    country_en: "Iraq",
    kind: "city",
    lat: 36.8671,
    lng: 42.9884,
  },
  {
    code: "IST",
    city_tr: "İstanbul",
    city_en: "Istanbul",
    country_tr: "Türkiye",
    country_en: "Turkey",
    kind: "airport",
    lat: 41.2753,
    lng: 28.7519,
  },
  {
    code: "ESB",
    city_tr: "Ankara",
    city_en: "Ankara",
    country_tr: "Türkiye",
    country_en: "Turkey",
    kind: "airport",
    lat: 40.1281,
    lng: 32.9951,
  },
  {
    code: "DXB",
    city_tr: "Dubai",
    city_en: "Dubai",
    country_tr: "BAE",
    country_en: "UAE",
    kind: "airport",
    lat: 25.2532,
    lng: 55.3657,
  },
  {
    code: "AMM",
    city_tr: "Amman",
    city_en: "Amman",
    country_tr: "Ürdün",
    country_en: "Jordan",
    kind: "airport",
    lat: 31.7226,
    lng: 35.9932,
  },
  {
    code: "THR",
    city_tr: "Tahran",
    city_en: "Tehran",
    country_tr: "İran",
    country_en: "Iran",
    kind: "airport",
    lat: 35.6892,
    lng: 51.389,
  },
];

export function placeByCode(code: string): TravelPlace | undefined {
  return TRAVEL_PLACES.find((p) => p.code === code);
}

export function placeLabel(
  code: string,
  lang: "tr" | "en",
): string {
  const p = placeByCode(code);
  if (!p) return code;
  const city = lang === "tr" ? p.city_tr : p.city_en;
  return `${city} (${p.code})`;
}

/** Demo uçuşlar — rota eşleşince filtrelenir; yoksa seed’den örnek üretilir. */
export const DEMO_FLIGHTS: FlightOffer[] = [
  {
    id: "fl-ebl-ist-1",
    mode: "flight",
    from: "EBL",
    to: "IST",
    departAt: "2026-11-20T08:40:00+03:00",
    arriveAt: "2026-11-20T12:05:00+03:00",
    durationMin: 205,
    price_iqd: 285_000,
    fee_iqd: 12_000,
    currency: "IQD",
    seatsLeft: 9,
    airline: "Kullo Air Demo",
    flightNo: "KA 420",
    stops: 0,
    cabin: "economy",
    featured: true,
  },
  {
    id: "fl-ebl-ist-2",
    mode: "flight",
    from: "EBL",
    to: "IST",
    departAt: "2026-11-20T14:15:00+03:00",
    arriveAt: "2026-11-20T20:40:00+03:00",
    durationMin: 385,
    price_iqd: 245_000,
    fee_iqd: 10_000,
    currency: "IQD",
    seatsLeft: 14,
    airline: "Zagros Link",
    flightNo: "ZL 118",
    stops: 1,
    cabin: "economy",
  },
  {
    id: "fl-ebl-ist-3",
    mode: "flight",
    from: "EBL",
    to: "IST",
    departAt: "2026-11-20T21:00:00+03:00",
    arriveAt: "2026-11-21T00:20:00+03:00",
    durationMin: 200,
    price_iqd: 420_000,
    fee_iqd: 18_000,
    currency: "IQD",
    seatsLeft: 4,
    airline: "Kullo Air Demo",
    flightNo: "KA 880",
    stops: 0,
    cabin: "business",
  },
  {
    id: "fl-ebl-bgw-1",
    mode: "flight",
    from: "EBL",
    to: "BGW",
    departAt: "2026-11-18T07:30:00+03:00",
    arriveAt: "2026-11-18T08:25:00+03:00",
    durationMin: 55,
    price_iqd: 95_000,
    fee_iqd: 5_000,
    currency: "IQD",
    seatsLeft: 22,
    airline: "Mesopotamia Wings",
    flightNo: "MW 12",
    stops: 0,
    cabin: "economy",
    featured: true,
  },
  {
    id: "fl-ebl-dxb-1",
    mode: "flight",
    from: "EBL",
    to: "DXB",
    departAt: "2026-11-22T10:10:00+03:00",
    arriveAt: "2026-11-22T13:45:00+04:00",
    durationMin: 155,
    price_iqd: 310_000,
    fee_iqd: 14_000,
    currency: "IQD",
    seatsLeft: 11,
    airline: "Gulf Bridge Demo",
    flightNo: "GB 55",
    stops: 0,
    cabin: "economy",
  },
  {
    id: "fl-ist-ebl-1",
    mode: "flight",
    from: "IST",
    to: "EBL",
    departAt: "2026-11-25T06:50:00+03:00",
    arriveAt: "2026-11-25T10:15:00+03:00",
    durationMin: 205,
    price_iqd: 275_000,
    fee_iqd: 12_000,
    currency: "IQD",
    seatsLeft: 8,
    airline: "Kullo Air Demo",
    flightNo: "KA 421",
    stops: 0,
    cabin: "economy",
  },
  {
    id: "fl-bgw-amm-1",
    mode: "flight",
    from: "BGW",
    to: "AMM",
    departAt: "2026-11-19T09:00:00+03:00",
    arriveAt: "2026-11-19T10:40:00+03:00",
    durationMin: 100,
    price_iqd: 180_000,
    fee_iqd: 8_000,
    currency: "IQD",
    seatsLeft: 16,
    airline: "Levant Air",
    flightNo: "LA 77",
    stops: 0,
    cabin: "economy",
  },
  {
    id: "fl-isu-thr-1",
    mode: "flight",
    from: "ISU",
    to: "THR",
    departAt: "2026-11-21T11:20:00+03:00",
    arriveAt: "2026-11-21T13:05:00+03:30",
    durationMin: 75,
    price_iqd: 165_000,
    fee_iqd: 7_000,
    currency: "IQD",
    seatsLeft: 12,
    airline: "Zagros Link",
    flightNo: "ZL 204",
    stops: 0,
    cabin: "economy",
  },
];

export const DEMO_BUSES: BusOffer[] = [
  {
    id: "bu-ebl-bgw-1",
    mode: "bus",
    from: "EBL",
    to: "BGW",
    departAt: "2026-11-18T06:00:00+03:00",
    arriveAt: "2026-11-18T11:30:00+03:00",
    durationMin: 330,
    price_iqd: 28_000,
    fee_iqd: 2_000,
    currency: "IQD",
    seatsLeft: 18,
    operator: "Kurdistan Express",
    busNo: "KE 101",
    stops: 1,
    seatType: "standard",
    featured: true,
  },
  {
    id: "bu-ebl-bgw-2",
    mode: "bus",
    from: "EBL",
    to: "BGW",
    departAt: "2026-11-18T14:00:00+03:00",
    arriveAt: "2026-11-18T19:10:00+03:00",
    durationMin: 310,
    price_iqd: 42_000,
    fee_iqd: 3_000,
    currency: "IQD",
    seatsLeft: 8,
    operator: "Kurdistan Express",
    busNo: "KE 205 VIP",
    stops: 0,
    seatType: "vip",
  },
  {
    id: "bu-ebl-isu-1",
    mode: "bus",
    from: "EBL",
    to: "ISU",
    departAt: "2026-11-18T08:30:00+03:00",
    arriveAt: "2026-11-18T11:45:00+03:00",
    durationMin: 195,
    price_iqd: 18_000,
    fee_iqd: 1_500,
    currency: "IQD",
    seatsLeft: 24,
    operator: "Suli Line",
    busNo: "SL 09",
    stops: 0,
    seatType: "standard",
    featured: true,
  },
  {
    id: "bu-ebl-dhk-1",
    mode: "bus",
    from: "EBL",
    to: "DHK",
    departAt: "2026-11-18T09:00:00+03:00",
    arriveAt: "2026-11-18T11:20:00+03:00",
    durationMin: 140,
    price_iqd: 12_000,
    fee_iqd: 1_000,
    currency: "IQD",
    seatsLeft: 20,
    operator: "Duhok Shuttle",
    busNo: "DS 03",
    stops: 0,
    seatType: "standard",
  },
  {
    id: "bu-ebl-ist-1",
    mode: "bus",
    from: "EBL",
    to: "IST",
    departAt: "2026-11-19T18:00:00+03:00",
    arriveAt: "2026-11-20T14:30:00+03:00",
    durationMin: 1230,
    price_iqd: 95_000,
    fee_iqd: 5_000,
    currency: "IQD",
    seatsLeft: 6,
    operator: "Anatolia Coach",
    busNo: "AC 700",
    stops: 2,
    seatType: "vip",
    featured: true,
  },
  {
    id: "bu-bgw-amm-1",
    mode: "bus",
    from: "BGW",
    to: "AMM",
    departAt: "2026-11-20T07:00:00+03:00",
    arriveAt: "2026-11-20T18:40:00+03:00",
    durationMin: 700,
    price_iqd: 65_000,
    fee_iqd: 4_000,
    currency: "IQD",
    seatsLeft: 10,
    operator: "Desert Route",
    busNo: "DR 44",
    stops: 1,
    seatType: "standard",
  },
  {
    id: "bu-isu-thr-1",
    mode: "bus",
    from: "ISU",
    to: "THR",
    departAt: "2026-11-21T05:30:00+03:00",
    arriveAt: "2026-11-21T16:00:00+03:30",
    durationMin: 600,
    price_iqd: 55_000,
    fee_iqd: 3_500,
    currency: "IQD",
    seatsLeft: 12,
    operator: "Zagros Coach",
    busNo: "ZC 18",
    stops: 2,
    seatType: "standard",
  },
];

export const DEMO_PRIVATE: PrivateTransferQuote[] = [
  {
    id: "pv-ebl-isu-sedan",
    from: "EBL",
    to: "ISU",
    vehicle: "sedan",
    distanceKm: 210,
    durationMin: 180,
    price_iqd: 85_000,
    fee_iqd: 5_000,
    currency: "IQD",
    seats: 3,
    etaMin: 25,
  },
  {
    id: "pv-ebl-isu-suv",
    from: "EBL",
    to: "ISU",
    vehicle: "suv",
    distanceKm: 210,
    durationMin: 180,
    price_iqd: 110_000,
    fee_iqd: 6_000,
    currency: "IQD",
    seats: 5,
    etaMin: 30,
  },
  {
    id: "pv-ebl-bgw-van",
    from: "EBL",
    to: "BGW",
    vehicle: "van",
    distanceKm: 350,
    durationMin: 300,
    price_iqd: 195_000,
    fee_iqd: 10_000,
    currency: "IQD",
    seats: 7,
    etaMin: 40,
  },
  {
    id: "pv-ebl-dhk-sedan",
    from: "EBL",
    to: "DHK",
    vehicle: "sedan",
    distanceKm: 155,
    durationMin: 120,
    price_iqd: 65_000,
    fee_iqd: 4_000,
    currency: "IQD",
    seats: 3,
    etaMin: 20,
  },
  {
    id: "pv-ebl-ist-luxury",
    from: "EBL",
    to: "IST",
    vehicle: "luxury",
    distanceKm: 1_650,
    durationMin: 1_200,
    price_iqd: 1_250_000,
    fee_iqd: 40_000,
    currency: "IQD",
    seats: 3,
    etaMin: 60,
  },
];

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

/** Rota seed’de yoksa basit sentetik sonuç üret (demo her zaman dolu kalsın). */
export function synthesizeFlights(
  from: string,
  to: string,
  date: string,
): FlightOffer[] {
  const a = placeByCode(from);
  const b = placeByCode(to);
  if (!a || !b || from === to) return [];
  const km = haversineKm(a, b);
  const baseMin = Math.max(55, Math.round((km / 750) * 60) + 40);
  const day = date.slice(0, 10) || "2026-11-20";
  const arrive = (departH: number, departM: number, addMin: number) => {
    const total = departH * 60 + departM + addMin;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const dayOffset = Math.floor(total / (24 * 60));
    const d = new Date(`${day}T00:00:00+03:00`);
    d.setDate(d.getDate() + dayOffset);
    const ymd = d.toISOString().slice(0, 10);
    return `${ymd}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+03:00`;
  };
  return [
    {
      id: `fl-syn-${from}-${to}-0`,
      mode: "flight",
      from,
      to,
      departAt: `${day}T09:15:00+03:00`,
      arriveAt: arrive(9, 15, baseMin),
      durationMin: baseMin,
      price_iqd: Math.round(80_000 + km * 120),
      fee_iqd: 8_000,
      currency: "IQD",
      seatsLeft: 15,
      airline: "Kullo Air Demo",
      flightNo: `KA ${100 + (from.charCodeAt(0) % 50)}`,
      stops: 0,
      cabin: "economy",
      featured: true,
    },
    {
      id: `fl-syn-${from}-${to}-1`,
      mode: "flight",
      from,
      to,
      departAt: `${day}T16:40:00+03:00`,
      arriveAt: arrive(16, 40, baseMin + 90),
      durationMin: baseMin + 90,
      price_iqd: Math.round(65_000 + km * 95),
      fee_iqd: 7_000,
      currency: "IQD",
      seatsLeft: 20,
      airline: "Zagros Link",
      flightNo: `ZL ${200 + (to.charCodeAt(0) % 40)}`,
      stops: 1,
      cabin: "economy",
    },
  ];
}

export function synthesizeBuses(
  from: string,
  to: string,
  date: string,
): BusOffer[] {
  const a = placeByCode(from);
  const b = placeByCode(to);
  if (!a || !b || from === to) return [];
  const km = haversineKm(a, b);
  const baseMin = Math.max(90, Math.round((km / 70) * 60));
  const day = date.slice(0, 10) || "2026-11-20";
  const arrive = (departH: number, departM: number, addMin: number) => {
    const total = departH * 60 + departM + addMin;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const dayOffset = Math.floor(total / (24 * 60));
    const d = new Date(`${day}T00:00:00+03:00`);
    d.setDate(d.getDate() + dayOffset);
    const ymd = d.toISOString().slice(0, 10);
    return `${ymd}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+03:00`;
  };
  return [
    {
      id: `bu-syn-${from}-${to}-0`,
      mode: "bus",
      from,
      to,
      departAt: `${day}T07:00:00+03:00`,
      arriveAt: arrive(7, 0, baseMin),
      durationMin: baseMin,
      price_iqd: Math.round(8_000 + km * 45),
      fee_iqd: 1_500,
      currency: "IQD",
      seatsLeft: 22,
      operator: "Kurdistan Express",
      busNo: "KE Demo",
      stops: km > 400 ? 1 : 0,
      seatType: "standard",
      featured: true,
    },
    {
      id: `bu-syn-${from}-${to}-1`,
      mode: "bus",
      from,
      to,
      departAt: `${day}T13:30:00+03:00`,
      arriveAt: arrive(13, 30, Math.max(60, baseMin - 20)),
      durationMin: Math.max(60, baseMin - 20),
      price_iqd: Math.round(14_000 + km * 55),
      fee_iqd: 2_500,
      currency: "IQD",
      seatsLeft: 9,
      operator: "Anatolia Coach",
      busNo: "AC VIP",
      stops: 0,
      seatType: "vip",
    },
  ];
}

export function synthesizePrivate(
  from: string,
  to: string,
): PrivateTransferQuote[] {
  const a = placeByCode(from);
  const b = placeByCode(to);
  if (!a || !b || from === to) return [];
  const km = haversineKm(a, b);
  const durationMin = Math.max(60, Math.round((km / 80) * 60));
  return [
    {
      id: `pv-syn-${from}-${to}-sedan`,
      from,
      to,
      vehicle: "sedan",
      distanceKm: km,
      durationMin,
      price_iqd: Math.round(40_000 + km * 280),
      fee_iqd: 4_000,
      currency: "IQD",
      seats: 3,
      etaMin: 20,
    },
    {
      id: `pv-syn-${from}-${to}-suv`,
      from,
      to,
      vehicle: "suv",
      distanceKm: km,
      durationMin,
      price_iqd: Math.round(55_000 + km * 340),
      fee_iqd: 5_000,
      currency: "IQD",
      seats: 5,
      etaMin: 25,
    },
    {
      id: `pv-syn-${from}-${to}-van`,
      from,
      to,
      vehicle: "van",
      distanceKm: km,
      durationMin: durationMin + 15,
      price_iqd: Math.round(70_000 + km * 400),
      fee_iqd: 6_000,
      currency: "IQD",
      seats: 7,
      etaMin: 35,
    },
  ];
}
