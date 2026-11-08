import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "kullo.trades_v1";

export type TradeRole = "customer" | "worker";

export type TradeCategory =
  | "electrical"
  | "plumbing"
  | "paint"
  | "carpentry"
  | "ac"
  | "cleaning"
  | "moving"
  | "general";

export type TradeCity = "Erbil" | "Ankawa" | "Sulaymaniyah" | "Duhok";

export type TradeJobStatus = "open" | "awarded" | "closed";
export type TradeOfferStatus = "pending" | "accepted" | "rejected";

export type TradeJob = {
  id: string;
  title: string;
  description: string;
  category: TradeCategory;
  city: TradeCity;
  /** Müşteri bütçe bandı (gösterim); teklif tutarı ayrı */
  budget_iqd: number;
  customerName: string;
  status: TradeJobStatus;
  createdAt: string;
  awardedOfferId?: string;
};

export type TradeOffer = {
  id: string;
  jobId: string;
  workerName: string;
  workerTitle: string;
  amount_iqd: number;
  note: string;
  /** Tahmini süre (gün) */
  days: number;
  status: TradeOfferStatus;
  createdAt: string;
};

export const TRADE_CATEGORIES: TradeCategory[] = [
  "electrical",
  "plumbing",
  "paint",
  "carpentry",
  "ac",
  "cleaning",
  "moving",
  "general",
];

export const TRADE_CITIES: TradeCity[] = [
  "Erbil",
  "Ankawa",
  "Sulaymaniyah",
  "Duhok",
];

export const TRADE_CITY_LABEL_KEY: Record<TradeCity, string> = {
  Erbil: "trades.cities.Erbil",
  Ankawa: "trades.cities.Ankawa",
  Sulaymaniyah: "trades.cities.Sulaymaniyah",
  Duhok: "trades.cities.Duhok",
};

type Persisted = {
  role: TradeRole;
  jobs: TradeJob[];
  offers: TradeOffer[];
};

type State = {
  hydrated: boolean;
  role: TradeRole;
  jobs: TradeJob[];
  offers: TradeOffer[];
  hydrate: () => Promise<void>;
  setRole: (role: TradeRole) => Promise<void>;
  createJob: (
    input: Omit<TradeJob, "id" | "createdAt" | "status" | "awardedOfferId">,
  ) => Promise<TradeJob>;
  submitOffer: (
    input: Omit<TradeOffer, "id" | "createdAt" | "status">,
  ) => Promise<TradeOffer>;
  acceptOffer: (jobId: string, offerId: string) => Promise<void>;
  closeJob: (jobId: string) => Promise<void>;
  jobById: (id: string) => TradeJob | undefined;
  offersForJob: (jobId: string) => TradeOffer[];
};

function seed(): Persisted {
  const now = Date.now();
  const iso = (minsAgo: number) =>
    new Date(now - minsAgo * 60_000).toISOString();

  const jobs: TradeJob[] = [
    {
      id: "tj-1",
      title: "Salon elektrik tesisatı yenileme",
      description:
        "3 odalı dairede salon ve mutfak priz hatları yenilenecek. Sigorta panosu kontrolü dahil.",
      category: "electrical",
      city: "Erbil",
      budget_iqd: 450_000,
      customerName: "Hêmin A.",
      status: "open",
      createdAt: iso(180),
    },
    {
      id: "tj-2",
      title: "Banyo tesisat kaçağı",
      description:
        "Lavabo altı sızıntı ve duş gider tıkanıklığı. Aynı gün müdahale tercih.",
      category: "plumbing",
      city: "Ankawa",
      budget_iqd: 180_000,
      customerName: "Sara K.",
      status: "open",
      createdAt: iso(95),
    },
    {
      id: "tj-3",
      title: "2+1 daire boya badana",
      description:
        "Tavan ve duvarlar. Malzeme müşteriden; usta işçilik + zemin koruma.",
      category: "paint",
      city: "Erbil",
      budget_iqd: 650_000,
      customerName: "Rêbwar M.",
      status: "open",
      createdAt: iso(60),
    },
    {
      id: "tj-4",
      title: "Split klima montajı (2 adet)",
      description:
        "Salon + yatak odası. Delik, vakum ve ilk çalışma dahil.",
      category: "ac",
      city: "Sulaymaniyah",
      budget_iqd: 320_000,
      customerName: "Dilan S.",
      status: "open",
      createdAt: iso(40),
    },
    {
      id: "tj-5",
      title: "Mutfak dolabı tamiri",
      description:
        "Kapak menteşeleri + tezgah kenarı. Yerinde ölçü alınacak.",
      category: "carpentry",
      city: "Duhok",
      budget_iqd: 220_000,
      customerName: "Azad T.",
      status: "awarded",
      createdAt: iso(400),
      awardedOfferId: "to-5a",
    },
    {
      id: "tj-6",
      title: "Ofis taşınma — 1 kamyonet",
      description:
        "Erbil merkez → Ankawa. 8 masa + dolap. Merdiven 2. kat.",
      category: "moving",
      city: "Erbil",
      budget_iqd: 150_000,
      customerName: "Nûjen Office",
      status: "open",
      createdAt: iso(25),
    },
  ];

  const offers: TradeOffer[] = [
    {
      id: "to-1a",
      jobId: "tj-1",
      workerName: "Karwan Elektrik",
      workerTitle: "Elektrik ustası",
      amount_iqd: 420_000,
      note: "Malzeme ayrı; 1,5 gün. Paneli de yenilerim.",
      days: 2,
      status: "pending",
      createdAt: iso(120),
    },
    {
      id: "to-1b",
      jobId: "tj-1",
      workerName: "Baran Teknik",
      workerTitle: "Elektrikçi",
      amount_iqd: 390_000,
      note: "Aynı gün başlarım. Garantili işçilik.",
      days: 1,
      status: "pending",
      createdAt: iso(90),
    },
    {
      id: "to-2a",
      jobId: "tj-2",
      workerName: "Aras Tesisat",
      workerTitle: "Tesisatçı",
      amount_iqd: 165_000,
      note: "Kaçak + gider açma birlikte.",
      days: 1,
      status: "pending",
      createdAt: iso(50),
    },
    {
      id: "to-3a",
      jobId: "tj-3",
      workerName: "Roj Boya",
      workerTitle: "Boya ustası",
      amount_iqd: 600_000,
      note: "2 usta + 1 yardımcı. 3 gün.",
      days: 3,
      status: "pending",
      createdAt: iso(30),
    },
    {
      id: "to-4a",
      jobId: "tj-4",
      workerName: "CoolFix Suli",
      workerTitle: "Klima teknisyeni",
      amount_iqd: 300_000,
      note: "2 cihaz montaj + gaz kontrol.",
      days: 1,
      status: "pending",
      createdAt: iso(20),
    },
    {
      id: "to-5a",
      jobId: "tj-5",
      workerName: "Şivan Marangoz",
      workerTitle: "Marangoz",
      amount_iqd: 210_000,
      note: "Kapak + kenar bandı.",
      days: 2,
      status: "accepted",
      createdAt: iso(350),
    },
    {
      id: "to-5b",
      jobId: "tj-5",
      workerName: "Zagros Ahşap",
      workerTitle: "Marangoz",
      amount_iqd: 240_000,
      note: "Yeni kapak seçeneği de var.",
      days: 2,
      status: "rejected",
      createdAt: iso(340),
    },
    {
      id: "to-6a",
      jobId: "tj-6",
      workerName: "Erbil Move",
      workerTitle: "Nakliye",
      amount_iqd: 140_000,
      note: "Kamyonet + 2 kişi.",
      days: 1,
      status: "pending",
      createdAt: iso(10),
    },
  ];

  return { role: "customer", jobs, offers };
}

async function persist(slice: Persisted) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(slice));
  } catch {
    /* ignore */
  }
}

function snapshot(get: () => State): Persisted {
  const s = get();
  return { role: s.role, jobs: s.jobs, offers: s.offers };
}

export const useTradesStore = create<State>((set, get) => ({
  hydrated: false,
  role: "customer",
  jobs: [],
  offers: [],

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (
          parsed &&
          Array.isArray(parsed.jobs) &&
          Array.isArray(parsed.offers)
        ) {
          set({
            hydrated: true,
            role: parsed.role === "worker" ? "worker" : "customer",
            jobs: parsed.jobs,
            offers: parsed.offers,
          });
          return;
        }
      }
      const seeded = seed();
      set({
        hydrated: true,
        role: seeded.role,
        jobs: seeded.jobs,
        offers: seeded.offers,
      });
      await persist(seeded);
    } catch {
      const seeded = seed();
      set({
        hydrated: true,
        role: seeded.role,
        jobs: seeded.jobs,
        offers: seeded.offers,
      });
    }
  },

  setRole: async (role) => {
    set({ role });
    await persist(snapshot(get));
  },

  createJob: async (input) => {
    const job: TradeJob = {
      ...input,
      id: `tj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: "open",
    };
    set({ jobs: [job, ...get().jobs] });
    await persist(snapshot(get));
    return job;
  },

  submitOffer: async (input) => {
    const offer: TradeOffer = {
      ...input,
      id: `to-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    set({ offers: [offer, ...get().offers] });
    await persist(snapshot(get));
    return offer;
  },

  acceptOffer: async (jobId, offerId) => {
    const jobs = get().jobs.map((j) =>
      j.id === jobId
        ? ({
            ...j,
            status: "awarded" as const,
            awardedOfferId: offerId,
          } satisfies TradeJob)
        : j,
    );
    const offers = get().offers.map((o) => {
      if (o.jobId !== jobId) return o;
      if (o.id === offerId) {
        return { ...o, status: "accepted" as const };
      }
      if (o.status === "pending") {
        return { ...o, status: "rejected" as const };
      }
      return o;
    });
    set({ jobs, offers });
    await persist(snapshot(get));
  },

  closeJob: async (jobId) => {
    const jobs = get().jobs.map((j) =>
      j.id === jobId ? { ...j, status: "closed" as const } : j,
    );
    set({ jobs });
    await persist(snapshot(get));
  },

  jobById: (id) => get().jobs.find((j) => j.id === id),

  offersForJob: (jobId) =>
    get()
      .offers.filter((o) => o.jobId === jobId)
      .sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
          a.amount_iqd - b.amount_iqd,
      ),
}));
