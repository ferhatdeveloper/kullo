/** Demo agencies & projects — Paya / Homele hub pattern, adapted for realty */

export type DemoAgency = {
  id: string;
  name: string;
  city: string;
  district?: string;
  listings: number;
  rating: number;
  phone?: string;
  cover_url: string;
  verified?: boolean;
};

export type DemoProject = {
  id: string;
  name: string;
  city: string;
  developer: string;
  cover_url: string;
  /** Galeri (slider); yoksa cover kullanılır */
  gallery?: string[];
  unitsFrom: number;
  /** Üst fiyat (opsiyonel aralık) */
  unitsTo?: number;
  currency: "USD" | "IQD";
  tagline: string;
  description: string;
  unitTypes: string[];
  amenities: string[];
  status: "selling" | "upcoming" | "sold_out" | "constructing";
  /** Toplam ünite sayısı (liste kartı) */
  unitsCount?: number;
  areaMinM2?: number;
  areaMaxM2?: number;
  phone?: string;
};

export const DEMO_AGENCIES: DemoAgency[] = [
  {
    id: "ag-1",
    name: "Empire Realty",
    city: "Erbil",
    district: "Empire Square",
    listings: 48,
    rating: 4.8,
    phone: "+9647500000001",
    cover_url:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    verified: true,
  },
  {
    id: "ag-2",
    name: "Dream City Brokers",
    city: "Erbil",
    district: "Dream City",
    listings: 32,
    rating: 4.6,
    cover_url:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    verified: true,
  },
  {
    id: "ag-3",
    name: "Karrada Homes",
    city: "Baghdad",
    district: "Karrada",
    listings: 21,
    rating: 4.4,
    cover_url:
      "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ag-4",
    name: "Suli Estates",
    city: "Sulaymaniyah",
    listings: 17,
    rating: 4.5,
    cover_url:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
  },
];

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: "pr-1",
    name: "Royal Garden View City",
    city: "Erbil",
    developer: "Royal Developments",
    cover_url:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    unitsFrom: 52000,
    unitsTo: 165000,
    currency: "USD",
    tagline: "A royal facade for a peaceful life",
    description:
      "Garden villas and mid-rise residences with shared green courts, security and generator backup — minutes from Empire Square.",
    unitTypes: ["apartment", "villa", "house"],
    amenities: ["garden", "parking", "security", "generator", "pool"],
    status: "constructing",
    unitsCount: 240,
    areaMinM2: 90,
    areaMaxM2: 280,
    phone: "+9647501110001",
  },
  {
    id: "pr-2",
    name: "Erbil World Trade Center",
    city: "Erbil",
    developer: "WTC Erbil",
    cover_url:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    ],
    unitsFrom: 85000,
    unitsTo: 210000,
    currency: "USD",
    tagline: "Offices & residences downtown",
    description:
      "Mixed-use tower with office floors and premium residences overlooking the citadel corridor.",
    unitTypes: ["apartment", "office"],
    amenities: ["elevator", "parking", "security", "ac"],
    status: "selling",
    unitsCount: 180,
    areaMinM2: 70,
    areaMaxM2: 220,
    phone: "+9647501110002",
  },
  {
    id: "pr-3",
    name: "Saffen Tower",
    city: "Erbil",
    developer: "Saffen Group",
    cover_url:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    ],
    unitsFrom: 132000,
    unitsTo: 310000,
    currency: "USD",
    tagline: "Mountain view residences",
    description:
      "High-rise residences with mountain views, concierge and furnished delivery options.",
    unitTypes: ["apartment", "duplex"],
    amenities: ["pool", "parking", "security", "furnished"],
    status: "selling",
    unitsCount: 96,
    areaMinM2: 110,
    areaMaxM2: 340,
    phone: "+9647501110003",
  },
  {
    id: "pr-4",
    name: "Empire Heights",
    city: "Erbil",
    developer: "Empire Group",
    cover_url:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    unitsFrom: 98000,
    unitsTo: 190000,
    currency: "USD",
    tagline: "Skyline living near Empire Square",
    description:
      "Corner units and sky lounges near Empire Square retail — flexible payment plans.",
    unitTypes: ["apartment"],
    amenities: ["elevator", "parking", "security", "ac"],
    status: "upcoming",
    unitsCount: 128,
    areaMinM2: 85,
    areaMaxM2: 190,
    phone: "+9647501110004",
  },
  {
    id: "pr-5",
    name: "Baghdad River Residences",
    city: "Baghdad",
    developer: "Tigris Homes",
    cover_url:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    ],
    unitsFrom: 72000,
    unitsTo: 148000,
    currency: "USD",
    tagline: "Waterfront apartments in Karrada",
    description:
      "River-facing apartments in Karrada with promenade access and 24/7 security.",
    unitTypes: ["apartment", "villa"],
    amenities: ["parking", "security", "generator", "garden"],
    status: "constructing",
    unitsCount: 160,
    areaMinM2: 95,
    areaMaxM2: 260,
    phone: "+9647701110005",
  },
];

export function getDemoProject(id: string): DemoProject | undefined {
  return DEMO_PROJECTS.find((p) => p.id === id);
}

export const CITY_COVERS: Record<string, string> = {
  Erbil:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80",
  Baghdad:
    "https://images.unsplash.com/photo-1581872168464-9fc1d0a8b3b8?auto=format&fit=crop&w=600&q=80",
  Sulaymaniyah:
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=80",
  Basra:
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
  Mosul:
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=600&q=80",
};
