/**
 * Özel araç transfer — mock fiyatlandırma (API şart değil).
 */

import { DEMO_PRIVATE, placeByCode, synthesizePrivate } from "./seed";
import type { PrivateTransferQuote, PrivateVehicleClass } from "./types";

export async function quotePrivateTransfer(opts: {
  from: string;
  to: string;
  vehicle?: PrivateVehicleClass | null;
}): Promise<PrivateTransferQuote[]> {
  await delay(220);
  const from = opts.from.toUpperCase();
  const to = opts.to.toUpperCase();
  let list = DEMO_PRIVATE.filter((q) => q.from === from && q.to === to);
  if (list.length === 0) {
    list = synthesizePrivate(from, to);
  }
  if (opts.vehicle) {
    list = list.filter((q) => q.vehicle === opts.vehicle);
  }
  return list;
}

export function privateMarkers(from: string, to: string) {
  const a = placeByCode(from);
  const b = placeByCode(to);
  if (!a || !b) return [];
  return [
    {
      id: "pickup",
      lat: a.lat,
      lng: a.lng,
      label: a.code,
      selected: true,
    },
    {
      id: "dropoff",
      lat: b.lat,
      lng: b.lng,
      label: b.code,
    },
  ];
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
