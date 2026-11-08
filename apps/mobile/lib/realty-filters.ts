import type { DemoRealtyListing, RealtyKind } from "./demo-data";

export type RealtyPurpose = "sale" | "rent" | "all";
export type RealtySort = "newest" | "price_asc" | "price_desc" | "sqm_desc";

export type RealtyFilters = {
  purpose: RealtyPurpose;
  kind: RealtyKind | "all";
  beds?: number;
  baths?: number;
  minSqm?: number;
  maxSqm?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: "IQD" | "USD" | "all";
  furnished?: boolean | null;
  sort: RealtySort;
  city?: string | null;
  q?: string;
};

export const DEFAULT_REALTY_FILTERS: RealtyFilters = {
  purpose: "all",
  kind: "all",
  currency: "all",
  furnished: null,
  sort: "newest",
};

export const REALTY_KIND_ORDER: RealtyKind[] = [
  "apartment",
  "villa",
  "house",
  "duplex",
  "land",
  "office",
  "shop",
  "farm",
];

export function applyRealtyFilters(
  listings: DemoRealtyListing[],
  filters: RealtyFilters,
): DemoRealtyListing[] {
  let rows = listings.filter((l) => {
    if (filters.purpose !== "all" && l.offer_type !== filters.purpose) return false;
    if (filters.kind !== "all" && l.kind !== filters.kind) return false;

    if (filters.beds != null && (l.bedrooms == null || l.bedrooms < filters.beds))
      return false;
    if (filters.baths != null && (l.bathrooms == null || l.bathrooms < filters.baths))
      return false;
    if (filters.minSqm != null && l.area_m2 < filters.minSqm) return false;
    if (filters.maxSqm != null && l.area_m2 > filters.maxSqm) return false;

    if (filters.currency && filters.currency !== "all") {
      if (l.price_currency !== filters.currency) return false;
    }
    if (filters.minPrice != null && l.price_amount < filters.minPrice) return false;
    if (filters.maxPrice != null && l.price_amount > filters.maxPrice) return false;

    if (filters.furnished === true && l.furnished !== true) return false;
    if (filters.furnished === false && l.furnished !== false) return false;

    if (filters.city && filters.city !== "all") {
      if (l.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    }

    const qq = filters.q?.trim().toLowerCase();
    if (
      qq &&
      !`${l.title} ${l.city} ${l.district ?? ""} ${l.seller_name} ${l.kind}`
        .toLowerCase()
        .includes(qq)
    ) {
      return false;
    }

    return true;
  });

  rows = [...rows].sort((a, b) => {
    switch (filters.sort) {
      case "price_asc":
        return a.price_amount - b.price_amount;
      case "price_desc":
        return b.price_amount - a.price_amount;
      case "sqm_desc":
        return b.area_m2 - a.area_m2;
      case "newest":
      default:
        // Demo listings lack created_at — featured first, then title
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    }
  });

  return rows;
}

export function countActiveRealtyFilters(f: RealtyFilters): number {
  let n = 0;
  if (f.purpose !== "all") n++;
  if (f.kind !== "all") n++;
  if (f.beds != null) n++;
  if (f.baths != null) n++;
  if (f.minSqm != null || f.maxSqm != null) n++;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.currency && f.currency !== "all") n++;
  if (f.furnished != null) n++;
  if (f.sort !== "newest") n++;
  return n;
}

/** Natural-language → filter parse (AI search) */
export function parseRealtyQuery(q: string): RealtyFilters {
  const s = q.toLowerCase();
  const f: RealtyFilters = { ...DEFAULT_REALTY_FILTERS };
  if (/kira|rent|إيجار/.test(s)) f.purpose = "rent";
  if (/satı|sale|بيع/.test(s)) f.purpose = "sale";
  if (/villa|فيلا/.test(s)) f.kind = "villa";
  if (/arsa|land|أرض/.test(s)) f.kind = "land";
  if (/ofis|office|مكتب/.test(s)) f.kind = "office";
  if (/çiftlik|farm|مزرعة/.test(s)) f.kind = "farm";
  if (/dükkan|shop|دكان|كشك/.test(s)) f.kind = "shop";
  if (/daire|apartment|شقة|3\+1|2\+1/.test(s)) f.kind = "apartment";
  if (/3\+/.test(s) || /\b3\b/.test(s)) f.beds = 3;
  else if (/2\+/.test(s) || /\b2\b/.test(s)) f.beds = 2;
  if (/erbil|أربيل/.test(s)) f.city = "Erbil";
  if (/bağdat|baghdad|بغداد/.test(s)) f.city = "Baghdad";
  if (/süleym|sulay|السليمان/.test(s)) f.city = "Sulaymaniyah";
  if (/duhok|دهوك/.test(s)) f.city = "Duhok";
  if (/basra|البصرة/.test(s)) f.city = "Basra";
  if (/100/.test(s)) f.maxSqm = 100;
  return f;
}
