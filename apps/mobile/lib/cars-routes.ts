/**
 * Araç dikeyi — Satın al (buy) ile Kirala (rent) ayrı IA.
 * Deep link: /cars/buy · /cars/rent · ?intent=buy|rent · ?mode=buy|rent
 */

export type CarsIntent = "buy" | "rent";

export function parseCarsIntent(
  raw: string | string[] | undefined | null,
): CarsIntent | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "buy" || v === "rent") return v;
  return null;
}

/** Prefer intent, then mode (alias). */
export function resolveCarsIntent(params: {
  intent?: string | string[];
  mode?: string | string[];
}): CarsIntent | null {
  return parseCarsIntent(params.intent) ?? parseCarsIntent(params.mode);
}

export const CARS_BUY_HREF = {
  pathname: "/(tabs)/search" as const,
  params: { intent: "buy" as const, carsPane: "home" as const },
};

export const CARS_BUY_SEARCH_HREF = {
  pathname: "/(tabs)/search" as const,
  params: { intent: "buy" as const, carsPane: "search" as const },
};

export const CARS_RENT_HREF = {
  pathname: "/(tabs)/rentals" as const,
  params: { intent: "rent" as const, rentPane: "home" as const },
};

export const CARS_RENT_SEARCH_HREF = {
  pathname: "/(tabs)/rentals" as const,
  params: { intent: "rent" as const, rentPane: "search" as const },
};
