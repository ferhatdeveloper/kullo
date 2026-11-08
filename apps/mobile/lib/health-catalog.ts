/**
 * Sağlık / doktor-klinik seed — Erbil / Ankawa / Suli / Duhok.
 * Kapak URI’leri OfflineCover + offline-image-map (home ofis foto id’leri).
 */

export type HealthCity = "Erbil" | "Ankawa" | "Sulaymaniyah" | "Duhok";

export type HealthSpecialty =
  | "general"
  | "cardiology"
  | "dermatology"
  | "pediatrics"
  | "dentistry"
  | "gynecology"
  | "orthopedics"
  | "ophthalmology";

export type MeetingType = "video" | "phone" | "chat";

export type DemoProvider = {
  id: string;
  name: string;
  kind: "doctor" | "clinic";
  specialty: HealthSpecialty;
  clinic: string;
  city: HealthCity;
  district: string;
  rating: number;
  review_count: number;
  /** Konsültasyon ücreti (IQD) */
  fee_iqd: number;
  price_currency: "IQD";
  cover_url: string;
  languages: string[];
  meeting_types: MeetingType[];
  /** HH:mm slot’lar (bugün/yarın seçimi book ekranında) */
  slots: string[];
  bio_tr: string;
  bio_en: string;
  phone?: string;
  featured?: boolean;
};

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;

/** Offline home ofis / interior id’leri — OfflineCover lokal. */
export const HEALTH_PHOTO_IDS = [
  "photo-1497366216548-37526070297c",
  "photo-1497366811353-6870744d04b2",
  "photo-1519238263530-99bdd11df2ea",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1502672260266-1c1ef2d93688",
  "photo-1613490493576-7fde63acd811",
  "photo-1564013799919-ab600027ffc6",
  "photo-1570129477492-45c003edd2be",
  "photo-1500382017468-9049fed747ef",
  "photo-1490481651871-ab68de25d43d",
] as const;

const DAY_SLOTS = ["09:00", "09:30", "10:00", "11:00", "14:00", "15:30", "16:00", "17:30"];

export const HEALTH_CITIES: HealthCity[] = [
  "Erbil",
  "Ankawa",
  "Sulaymaniyah",
  "Duhok",
];

export const HEALTH_SPECIALTIES: HealthSpecialty[] = [
  "general",
  "cardiology",
  "dermatology",
  "pediatrics",
  "dentistry",
  "gynecology",
  "orthopedics",
  "ophthalmology",
];

export const HEALTH_CITY_LABEL_KEY: Record<HealthCity, string> = {
  Erbil: "health.cities.Erbil",
  Ankawa: "health.cities.Ankawa",
  Sulaymaniyah: "health.cities.Sulaymaniyah",
  Duhok: "health.cities.Duhok",
};

export const DEMO_PROVIDERS: DemoProvider[] = [
  {
    id: "doc-rasheed-erbil",
    name: "Dr. Ahmad Rasheed",
    kind: "doctor",
    specialty: "cardiology",
    clinic: "Erbil Heart Center",
    city: "Erbil",
    district: "100 Meter Road",
    rating: 4.8,
    review_count: 312,
    fee_iqd: 45_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[0]),
    languages: ["ku", "ar", "en"],
    meeting_types: ["video", "phone", "chat"],
    slots: DAY_SLOTS.slice(0, 6),
    bio_tr: "Erbil’de kardiyoloji; online ve klinik muayene.",
    bio_en: "Cardiology in Erbil; online and in-clinic consults.",
    phone: "+9647501002001",
    featured: true,
  },
  {
    id: "doc-sara-ankawa",
    name: "Dr. Sara Yousif",
    kind: "doctor",
    specialty: "dermatology",
    clinic: "Ankawa Skin Clinic",
    city: "Ankawa",
    district: "Ankawa Center",
    rating: 4.7,
    review_count: 198,
    fee_iqd: 35_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[1]),
    languages: ["ku", "en"],
    meeting_types: ["video", "chat"],
    slots: ["10:00", "11:30", "13:00", "15:00", "16:30"],
    bio_tr: "Cilt hastalıkları ve tele-dermatoloji.",
    bio_en: "Dermatology and tele-dermatology.",
    phone: "+9647501002002",
    featured: true,
  },
  {
    id: "clinic-family-erbil",
    name: "Family Care Clinic",
    kind: "clinic",
    specialty: "general",
    clinic: "Family Care Clinic",
    city: "Erbil",
    district: "Gulan Street",
    rating: 4.5,
    review_count: 540,
    fee_iqd: 25_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[2]),
    languages: ["ku", "ar", "en", "tr"],
    meeting_types: ["video", "phone", "chat"],
    slots: DAY_SLOTS,
    bio_tr: "Aile hekimliği — hızlı randevu ve mesajlaşma.",
    bio_en: "Family medicine — quick booking and messaging.",
    phone: "+9647501002003",
    featured: true,
  },
  {
    id: "doc-nermin-pedi",
    name: "Dr. Nermin Hassan",
    kind: "doctor",
    specialty: "pediatrics",
    clinic: "Little Stars Pediatrics",
    city: "Erbil",
    district: "Italian Village",
    rating: 4.9,
    review_count: 421,
    fee_iqd: 40_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[3]),
    languages: ["ku", "ar", "en"],
    meeting_types: ["video", "phone"],
    slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    bio_tr: "Çocuk sağlığı; görüntülü takip ve danışma.",
    bio_en: "Child health; video follow-up and advice.",
    phone: "+9647501002004",
    featured: true,
  },
  {
    id: "clinic-dental-ankawa",
    name: "Ankawa Smile Dental",
    kind: "clinic",
    specialty: "dentistry",
    clinic: "Ankawa Smile Dental",
    city: "Ankawa",
    district: "St. Joseph Street",
    rating: 4.6,
    review_count: 267,
    fee_iqd: 30_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[4]),
    languages: ["ku", "en", "ar"],
    meeting_types: ["video", "phone", "chat"],
    slots: ["09:30", "11:00", "13:30", "16:00", "17:30"],
    bio_tr: "Diş muayenesi ve online ön değerlendirme.",
    bio_en: "Dental consults and online pre-assessment.",
    phone: "+9647501002005",
  },
  {
    id: "doc-layan-gyn",
    name: "Dr. Layan Omar",
    kind: "doctor",
    specialty: "gynecology",
    clinic: "Women’s Health Hub",
    city: "Sulaymaniyah",
    district: "Salim Street",
    rating: 4.7,
    review_count: 156,
    fee_iqd: 50_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[5]),
    languages: ["ku", "en"],
    meeting_types: ["video", "chat"],
    slots: ["10:00", "12:00", "14:30", "16:00"],
    bio_tr: "Kadın sağlığı; gizlilik odaklı tele-görüşme.",
    bio_en: "Women’s health; privacy-first tele consults.",
    phone: "+9647501002006",
  },
  {
    id: "doc-karim-ortho",
    name: "Dr. Karim Abdullah",
    kind: "doctor",
    specialty: "orthopedics",
    clinic: "Suli Bone & Joint",
    city: "Sulaymaniyah",
    district: "Malik Mahmud Circle",
    rating: 4.4,
    review_count: 189,
    fee_iqd: 55_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[6]),
    languages: ["ku", "ar", "en"],
    meeting_types: ["video", "phone"],
    slots: ["09:00", "11:30", "15:00", "17:00"],
    bio_tr: "Ortopedi; görüntü paylaşımı ile ön değerlendirme.",
    bio_en: "Orthopedics; image-share pre-assessment.",
    phone: "+9647501002007",
  },
  {
    id: "clinic-eye-duhok",
    name: "Duhok Vision Clinic",
    kind: "clinic",
    specialty: "ophthalmology",
    clinic: "Duhok Vision Clinic",
    city: "Duhok",
    district: "Zakho Road",
    rating: 4.5,
    review_count: 134,
    fee_iqd: 28_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[7]),
    languages: ["ku", "ar"],
    meeting_types: ["video", "phone", "chat"],
    slots: ["09:00", "10:30", "13:00", "15:30", "17:00"],
    bio_tr: "Göz muayenesi ve tele-ofalmoloji.",
    bio_en: "Eye care and tele-ophthalmology.",
    phone: "+9647501002008",
  },
  {
    id: "doc-barzan-gen",
    name: "Dr. Barzan Ali",
    kind: "doctor",
    specialty: "general",
    clinic: "Duhok Family Practice",
    city: "Duhok",
    district: "Media City",
    rating: 4.3,
    review_count: 98,
    fee_iqd: 22_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[8]),
    languages: ["ku", "ar", "tr"],
    meeting_types: ["phone", "chat", "video"],
    slots: ["08:30", "10:00", "12:00", "14:00", "16:00"],
    bio_tr: "Genel muayene; telefon ve mesaj ile hızlı yanıt.",
    bio_en: "General practice; quick phone and chat replies.",
    phone: "+9647501002009",
  },
  {
    id: "clinic-cardio-erbil",
    name: "Kurdistan Cardio Lab",
    kind: "clinic",
    specialty: "cardiology",
    clinic: "Kurdistan Cardio Lab",
    city: "Erbil",
    district: "Empire World",
    rating: 4.6,
    review_count: 210,
    fee_iqd: 60_000,
    price_currency: "IQD",
    cover_url: u(HEALTH_PHOTO_IDS[9]),
    languages: ["ku", "en", "ar"],
    meeting_types: ["video", "phone"],
    slots: ["09:00", "11:00", "13:30", "16:00"],
    bio_tr: "Kalp check-up ve online sonuç görüşmesi.",
    bio_en: "Heart check-ups and online results review.",
    phone: "+9647501002010",
    featured: true,
  },
];

export type HealthListFilters = {
  q?: string;
  city: HealthCity | null;
  specialty: HealthSpecialty | null;
  meetingType: MeetingType | null;
};

export const DEFAULT_HEALTH_FILTERS: HealthListFilters = {
  q: "",
  city: null,
  specialty: null,
  meetingType: null,
};

export function getProvider(id: string): DemoProvider | undefined {
  return DEMO_PROVIDERS.find((p) => p.id === id);
}

export function featuredProviders(limit = 8): DemoProvider[] {
  const featured = DEMO_PROVIDERS.filter((p) => p.featured);
  const rest = DEMO_PROVIDERS.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function filterProviders(filters: HealthListFilters): DemoProvider[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  return DEMO_PROVIDERS.filter((p) => {
    if (filters.city && p.city !== filters.city) return false;
    if (filters.specialty && p.specialty !== filters.specialty) return false;
    if (filters.meetingType && !p.meeting_types.includes(filters.meetingType)) {
      return false;
    }
    if (!q) return true;
    const hay = `${p.name} ${p.clinic} ${p.district} ${p.specialty}`.toLowerCase();
    return hay.includes(q);
  });
}
