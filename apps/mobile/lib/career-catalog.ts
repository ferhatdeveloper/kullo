/**
 * Kariyer — iş ilanı seed (işveren ↔ işçi).
 * Dens kart: logo + başlık + şirket + konum·model + çalışma şekli + göreli tarih.
 * Erbil / Ankawa / Suli / Duhok. Kapak URI’leri OfflineCover + offline-image-map (logo karesi).
 */

export type CareerCity = "Erbil" | "Ankawa" | "Sulaymaniyah" | "Duhok";

export type CareerCategory =
  | "sales"
  | "hospitality"
  | "admin"
  | "tech"
  | "logistics"
  | "education"
  | "healthcare"
  | "retail";

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";

export type ExperienceLevel = "entry" | "mid" | "senior";

export type WorkModel = "office" | "hybrid" | "remote";

export type CareerSort = "featured" | "recommended" | "newest" | "oldest";

export type DemoJob = {
  id: string;
  title_tr: string;
  title_en: string;
  company: string;
  /** Kısa logo metni (2–3 harf) — görsel yoksa */
  logo_initials: string;
  /** Logo karesi marka rengi (avatar arka plan) */
  logo_bg: string;
  category: CareerCategory;
  city: CareerCity;
  district: string;
  employment: EmploymentType;
  experience: ExperienceLevel;
  work_model: WorkModel;
  /** Aylık brüt IQD (gösterim) */
  salary_min_iqd: number;
  salary_max_iqd: number;
  price_currency: "IQD";
  cover_url: string;
  languages: string[];
  remote_ok: boolean;
  featured?: boolean;
  sponsored?: boolean;
  applicants_mock: number;
  posted_days_ago: number;
  /** 0 gün için saat meta */
  posted_hours_ago?: number;
  description_tr: string;
  description_en: string;
  requirements_tr: string[];
  requirements_en: string[];
};

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;

/** Offline ofis / workspace id’leri — OfflineCover lokal. */
/** Hepsi offline-image-map’te mevcut */
export const CAREER_PHOTO_IDS = [
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
  "photo-1555529669-e69e7aa0ba9a",
  "photo-1548036328-c9fa89d128fa",
] as const;


export const CAREER_CITIES: CareerCity[] = [
  "Erbil",
  "Ankawa",
  "Sulaymaniyah",
  "Duhok",
];

export const CAREER_CATEGORIES: CareerCategory[] = [
  "sales",
  "hospitality",
  "admin",
  "tech",
  "logistics",
  "education",
  "healthcare",
  "retail",
];

export const CAREER_CITY_LABEL_KEY: Record<CareerCity, string> = {
  Erbil: "career.cities.Erbil",
  Ankawa: "career.cities.Ankawa",
  Sulaymaniyah: "career.cities.Sulaymaniyah",
  Duhok: "career.cities.Duhok",
};

/** Ana sayfa — canlıdaki «Son Aramalar» chip’leri (zengin seed) */
export const RECENT_SEARCHES = [
  { id: "rs-yazilim", q: "Yazılım", labelKey: "career.recent.software" },
  { id: "rs-mobile", q: "Mobil", labelKey: "career.recent.mobile" },
  { id: "rs-sales", q: "Satış", labelKey: "career.recent.sales" },
  { id: "rs-front", q: "Resepsiyon", labelKey: "career.recent.frontDesk" },
  { id: "rs-erbil", q: "Erbil", labelKey: "career.recent.erbil" },
  { id: "rs-hybrid", q: "Hibrit", labelKey: "career.recent.hybrid" },
  { id: "rs-hr", q: "İnsan Kaynakları", labelKey: "career.recent.hr" },
  { id: "rs-remote", q: "Uzaktan", labelKey: "career.recent.remote" },
] as const;

/** Geriye uyum */
export const POPULAR_SEARCHES = RECENT_SEARCHES;

export const DEMO_JOBS: DemoJob[] = [
  {
    id: "job-sales-erbil-01",
    title_tr: "Satış Danışmanı",
    title_en: "Sales Advisor",
    company: "Kullo Retail Hub",
    logo_initials: "KR",
    logo_bg: "#E8F5E9",
    category: "sales",
    city: "Erbil",
    district: "100 Meter Road",
    employment: "full_time",
    experience: "entry",
    work_model: "office",
    salary_min_iqd: 450_000,
    salary_max_iqd: 650_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[0]),
    languages: ["tr", "ar", "ku"],
    remote_ok: false,
    featured: true,
    sponsored: true,
    applicants_mock: 28,
    posted_days_ago: 1,
    description_tr:
      "Mağaza vitrininde müşteri karşılama, ürün sunumu ve satış hedeflerine katkı. Eğitim verilir.",
    description_en:
      "Floor sales, product demos and monthly targets. Onboarding provided.",
    requirements_tr: ["İletişim becerisi", "Esnek vardiya", "Temel Excel"],
    requirements_en: ["Communication skills", "Flexible shifts", "Basic Excel"],
  },
  {
    id: "job-hotel-ankawa-02",
    title_tr: "Resepsiyon Görevlisi",
    title_en: "Front Desk Agent",
    company: "Ankawa Grand Stay",
    logo_initials: "AG",
    logo_bg: "#E3F2FD",
    category: "hospitality",
    city: "Ankawa",
    district: "Christian Quarter",
    employment: "full_time",
    experience: "mid",
    work_model: "office",
    salary_min_iqd: 500_000,
    salary_max_iqd: 720_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[1]),
    languages: ["en", "ar", "ku"],
    remote_ok: false,
    featured: true,
    applicants_mock: 41,
    posted_days_ago: 2,
    description_tr:
      "Check-in/out, misafir karşılama ve rezervasyon sistemi. Gece vardiyası opsiyonel.",
    description_en:
      "Check-in/out, guest greeting and PMS. Night shift optional.",
    requirements_tr: ["2+ yıl otel deneyimi", "İngilizce konuşma", "Güleryüz"],
    requirements_en: ["2+ years hotel experience", "Spoken English", "Hospitality mindset"],
  },
  {
    id: "job-admin-suli-03",
    title_tr: "Ofis Asistanı",
    title_en: "Office Assistant",
    company: "Zagros Trade Co.",
    logo_initials: "ZT",
    logo_bg: "#FFF3E0",
    category: "admin",
    city: "Sulaymaniyah",
    district: "Salim Street",
    employment: "full_time",
    experience: "entry",
    work_model: "office",
    salary_min_iqd: 400_000,
    salary_max_iqd: 550_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[2]),
    languages: ["ku", "ar", "en"],
    remote_ok: false,
    featured: true,
    applicants_mock: 19,
    posted_days_ago: 3,
    description_tr:
      "Randevu takibi, evrak düzeni ve ofis lojistiği. Küçük ekiple hızlı tempo.",
    description_en:
      "Calendar, filing and office logistics. Fast-paced small team.",
    requirements_tr: ["Düzenli çalışma", "MS Office", "Telefonla iletişim"],
    requirements_en: ["Organized", "MS Office", "Phone etiquette"],
  },
  {
    id: "job-tech-erbil-04",
    title_tr: "Mobil Uygulama Geliştirici",
    title_en: "Mobile App Developer",
    company: "Kullo Labs",
    logo_initials: "KL",
    logo_bg: "#F3E5F5",
    category: "tech",
    city: "Erbil",
    district: "Dream City",
    employment: "full_time",
    experience: "mid",
    work_model: "hybrid",
    salary_min_iqd: 1_200_000,
    salary_max_iqd: 1_800_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[3]),
    languages: ["en", "tr"],
    remote_ok: true,
    featured: true,
    sponsored: true,
    applicants_mock: 212,
    posted_days_ago: 0,
    posted_hours_ago: 11,
    description_tr:
      "React Native ile ürün ekranları, offline-first akışlar ve API entegrasyonu.\n\nKullo Labs’ta Neye Değer Veriyoruz?\nÜrün sahipliği, net iletişim ve kullanıcıya dokunan kalite.",
    description_en:
      "React Native product screens, offline-first flows and API integration.\n\nWhat we value at Kullo Labs\nOwnership, clear communication and user-facing quality.",
    requirements_tr: ["RN / TypeScript", "Git", "2+ yıl mobil"],
    requirements_en: ["RN / TypeScript", "Git", "2+ years mobile"],
  },
  {
    id: "job-logistics-duhok-05",
    title_tr: "Depo Operasyon Elemanı",
    title_en: "Warehouse Operator",
    company: "North Link Logistics",
    logo_initials: "NL",
    logo_bg: "#E0F7FA",
    category: "logistics",
    city: "Duhok",
    district: "Industrial Zone",
    employment: "full_time",
    experience: "entry",
    work_model: "office",
    salary_min_iqd: 380_000,
    salary_max_iqd: 480_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[4]),
    languages: ["ku", "ar"],
    remote_ok: false,
    featured: true,
    applicants_mock: 33,
    posted_days_ago: 4,
    description_tr:
      "Mal kabul, raf yerleştirme ve sevkiyat hazırlığı. Fiziksel tempo.",
    description_en:
      "Receiving, shelving and outbound prep. Physical pace.",
    requirements_tr: ["Fiziksel uygunluk", "Ekip çalışması", "Ehliyet artı"],
    requirements_en: ["Physical fitness", "Teamwork", "License a plus"],
  },
  {
    id: "job-edu-ankawa-06",
    title_tr: "İngilizce Öğretmeni",
    title_en: "English Teacher",
    company: "Ankawa Language Center",
    logo_initials: "AL",
    logo_bg: "#FFF8E1",
    category: "education",
    city: "Ankawa",
    district: "Gulan Street",
    employment: "part_time",
    experience: "mid",
    work_model: "hybrid",
    salary_min_iqd: 350_000,
    salary_max_iqd: 600_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[5]),
    languages: ["en"],
    remote_ok: true,
    featured: true,
    applicants_mock: 22,
    posted_days_ago: 1,
    description_tr:
      "Yetişkin ve genç gruplara konuşma odaklı dersler. Hibrit sınıf mümkün.",
    description_en:
      "Conversation-focused classes for adults and teens. Hybrid optional.",
    requirements_tr: ["C1 İngilizce", "Öğretim deneyimi", "Ders planı"],
    requirements_en: ["C1 English", "Teaching experience", "Lesson planning"],
  },
  {
    id: "job-health-erbil-07",
    title_tr: "Klinik Resepsiyonisti",
    title_en: "Clinic Receptionist",
    company: "Erbil Care Clinic",
    logo_initials: "EC",
    logo_bg: "#FCE4EC",
    category: "healthcare",
    city: "Erbil",
    district: "Italian Village",
    employment: "full_time",
    experience: "entry",
    work_model: "office",
    salary_min_iqd: 420_000,
    salary_max_iqd: 580_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[6]),
    languages: ["ar", "ku", "en"],
    remote_ok: false,
    featured: true,
    applicants_mock: 17,
    posted_days_ago: 5,
    description_tr:
      "Hasta kayıt, randevu ve fatura yönlendirme. Klinik ortamı.",
    description_en:
      "Patient intake, appointments and billing handoff. Clinic setting.",
    requirements_tr: ["Hasta iletişimi", "Düzenli kayıt", "Gizlilik"],
    requirements_en: ["Patient communication", "Accurate records", "Confidentiality"],
  },
  {
    id: "job-retail-suli-08",
    title_tr: "Mağaza Müdürü Yardımcısı",
    title_en: "Assistant Store Manager",
    company: "Suli Fashion House",
    logo_initials: "SF",
    logo_bg: "#E8EAF6",
    category: "retail",
    city: "Sulaymaniyah",
    district: "Bakrajo",
    employment: "full_time",
    experience: "senior",
    work_model: "office",
    salary_min_iqd: 700_000,
    salary_max_iqd: 950_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[7]),
    languages: ["ku", "ar", "en"],
    remote_ok: false,
    featured: true,
    applicants_mock: 9,
    posted_days_ago: 2,
    description_tr:
      "Vardiya planı, stok ve ekip koçluğu. Hafta sonu açık mağaza.",
    description_en:
      "Shift planning, stock and team coaching. Weekend retail hours.",
    requirements_tr: ["3+ yıl perakende", "Ekip yönetimi", "KPI takibi"],
    requirements_en: ["3+ years retail", "Team leadership", "KPI tracking"],
  },
  {
    id: "job-tech-suli-09",
    title_tr: "Destek Uzmanı (Staj)",
    title_en: "Support Specialist (Intern)",
    company: "Cloud Nine Soft",
    logo_initials: "CN",
    logo_bg: "#E0F2F1",
    category: "tech",
    city: "Sulaymaniyah",
    district: "Chwar Chra",
    employment: "internship",
    experience: "entry",
    work_model: "remote",
    salary_min_iqd: 200_000,
    salary_max_iqd: 300_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[8]),
    languages: ["en", "ku"],
    remote_ok: true,
    applicants_mock: 45,
    posted_days_ago: 0,
    posted_hours_ago: 3,
    description_tr:
      "Kullanıcı ticket’ları, FAQ güncelleme ve ürün ekibiyle köprü. 3 aylık staj.",
    description_en:
      "User tickets, FAQ updates and product bridge. 3-month internship.",
    requirements_tr: ["Temel İngilizce", "Sabırlı iletişim", "Öğrenme isteği"],
    requirements_en: ["Basic English", "Patient communication", "Willingness to learn"],
  },
  {
    id: "job-sales-duhok-10",
    title_tr: "Bölge Satış Temsilcisi",
    title_en: "Field Sales Rep",
    company: "Duhok Wholesale Partners",
    logo_initials: "DW",
    logo_bg: "#FBE9E7",
    category: "sales",
    city: "Duhok",
    district: "Malta",
    employment: "contract",
    experience: "mid",
    work_model: "office",
    salary_min_iqd: 550_000,
    salary_max_iqd: 900_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[9]),
    languages: ["ku", "ar"],
    remote_ok: false,
    applicants_mock: 14,
    posted_days_ago: 6,
    description_tr:
      "Sahada bayi ziyareti, sipariş toplama ve tahsilat. Araç sağlanır.",
    description_en:
      "Dealer visits, order collection and receivables. Vehicle provided.",
    requirements_tr: ["Saha deneyimi", "B ehliyet", "Hedef odaklı"],
    requirements_en: ["Field experience", "Class B license", "Target-driven"],
  },
  {
    id: "job-tech-erbil-11",
    title_tr: "Yazılım Geliştirme Mühendisi",
    title_en: "Software Development Engineer",
    company: "Zagros Digital",
    logo_initials: "ZD",
    logo_bg: "#F1F8E9",
    category: "tech",
    city: "Erbil",
    district: "Empire World",
    employment: "full_time",
    experience: "mid",
    work_model: "hybrid",
    salary_min_iqd: 1_000_000,
    salary_max_iqd: 1_600_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[10]),
    languages: ["en", "ku"],
    remote_ok: true,
    featured: true,
    sponsored: true,
    applicants_mock: 88,
    posted_days_ago: 3,
    description_tr:
      "Backend ve mobil API’ler, code review ve sprint ritmi. Hibrit ofis.",
    description_en:
      "Backend and mobile APIs, code review and sprint cadence. Hybrid office.",
    requirements_tr: ["TypeScript / Node", "SQL", "2+ yıl"],
    requirements_en: ["TypeScript / Node", "SQL", "2+ years"],
  },
  {
    id: "job-admin-erbil-12",
    title_tr: "İnsan Kaynakları Uzmanı",
    title_en: "HR Specialist",
    company: "Kurdistan People Ops",
    logo_initials: "KP",
    logo_bg: "#EDE7F6",
    category: "admin",
    city: "Erbil",
    district: "Gulan",
    employment: "full_time",
    experience: "mid",
    work_model: "office",
    salary_min_iqd: 650_000,
    salary_max_iqd: 900_000,
    price_currency: "IQD",
    cover_url: u(CAREER_PHOTO_IDS[11]),
    languages: ["ku", "ar", "en"],
    remote_ok: false,
    applicants_mock: 26,
    posted_days_ago: 2,
    description_tr:
      "İşe alım, özgeçmiş tarama ve aday görüşme koordinasyonu.",
    description_en:
      "Hiring, CV screening and interview coordination.",
    requirements_tr: ["İK deneyimi", "Gizlilik", "Excel"],
    requirements_en: ["HR experience", "Confidentiality", "Excel"],
  },
];

export type CareerListFilters = {
  q?: string;
  city: CareerCity | null;
  category: CareerCategory | null;
  employment: EmploymentType | null;
  workModel: WorkModel | null;
  sort: CareerSort;
};

export const DEFAULT_CAREER_FILTERS: CareerListFilters = {
  q: "",
  city: null,
  category: null,
  employment: null,
  workModel: null,
  sort: "recommended",
};

export function getJob(id: string): DemoJob | undefined {
  return DEMO_JOBS.find((j) => j.id === id);
}

export function featuredJobs(limit = 6): DemoJob[] {
  const featured = DEMO_JOBS.filter((j) => j.featured);
  return (featured.length ? featured : DEMO_JOBS).slice(0, limit);
}

export function jobTitle(job: DemoJob, lang: "tr" | "en"): string {
  return lang === "tr" ? job.title_tr : job.title_en;
}

export function jobDescription(job: DemoJob, lang: "tr" | "en"): string {
  return lang === "tr" ? job.description_tr : job.description_en;
}

export function jobRequirements(job: DemoJob, lang: "tr" | "en"): string[] {
  return lang === "tr" ? job.requirements_tr : job.requirements_en;
}

export function jobLocationLine(
  job: DemoJob,
  cityLabel: string,
  workModelLabel: string,
): string {
  return `${cityLabel} · ${workModelLabel}`;
}

export function filterJobs(filters: CareerListFilters): DemoJob[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  const remoteQ = q === "uzaktan" || q === "remote";
  let list = DEMO_JOBS.filter((j) => {
    if (filters.city && j.city !== filters.city) return false;
    if (filters.category && j.category !== filters.category) return false;
    if (filters.employment && j.employment !== filters.employment) return false;
    if (filters.workModel && j.work_model !== filters.workModel) return false;
    if (!q) return true;
    if (remoteQ) return j.remote_ok || j.work_model !== "office";
    const hay =
      `${j.title_tr} ${j.title_en} ${j.company} ${j.district} ${j.category} ${j.city}`.toLowerCase();
    return hay.includes(q);
  });

  list = [...list].sort((a, b) => {
    switch (filters.sort) {
      case "featured":
        return Number(!!b.featured) - Number(!!a.featured) || a.posted_days_ago - b.posted_days_ago;
      case "newest":
        return a.posted_days_ago - b.posted_days_ago;
      case "oldest":
        return b.posted_days_ago - a.posted_days_ago;
      case "recommended":
      default:
        return (
          Number(!!b.sponsored) - Number(!!a.sponsored) ||
          Number(!!b.featured) - Number(!!a.featured) ||
          a.posted_days_ago - b.posted_days_ago
        );
    }
  });

  return list;
}
