import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { DEMO_JOBS, getJob } from "./career-catalog";

const KEY = "kullo.career_applications_v1";
const META_KEY = "kullo.career_meta_v1";

export type CareerApplicationStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "rejected";

export type CareerCvSummary = {
  fullName: string;
  headline: string;
  yearsExp: number;
  skills: string;
  phone: string;
  city: string;
  note?: string;
};

export type CareerApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  city: string;
  cv: CareerCvSummary;
  createdAt: string;
  status: CareerApplicationStatus;
};

/** İşveren paneli — seed eşleştirme satırları (demo). */
export type EmployerMatchRow = {
  id: string;
  jobId: string;
  candidateName: string;
  headline: string;
  matchScore: number;
  status: CareerApplicationStatus;
  appliedAt: string;
};

type CareerMeta = {
  viewedIds: string[];
  savedIds: string[];
  openToWork: boolean;
  jobAlarmOn: boolean;
};

type State = {
  hydrated: boolean;
  applications: CareerApplication[];
  viewedIds: string[];
  savedIds: string[];
  openToWork: boolean;
  jobAlarmOn: boolean;
  hydrate: () => Promise<void>;
  apply: (input: {
    jobId: string;
    jobTitle: string;
    company: string;
    city: string;
    cv: CareerCvSummary;
  }) => Promise<CareerApplication>;
  hasApplied: (jobId: string) => boolean;
  markViewed: (jobId: string) => Promise<void>;
  toggleSaved: (jobId: string) => Promise<void>;
  isSaved: (jobId: string) => boolean;
  setOpenToWork: (on: boolean) => Promise<void>;
  setJobAlarmOn: (on: boolean) => Promise<void>;
  employerMatches: () => EmployerMatchRow[];
};

async function persistApps(applications: CareerApplication[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(applications));
  } catch {
    /* ignore */
  }
}

async function persistMeta(meta: CareerMeta) {
  try {
    await AsyncStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

const SEED_MATCHES: EmployerMatchRow[] = [
  {
    id: "em-1",
    jobId: "job-sales-erbil-01",
    candidateName: "Ranya Hassan",
    headline: "Mağaza satış · 2 yıl",
    matchScore: 86,
    status: "shortlisted",
    appliedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "em-2",
    jobId: "job-tech-erbil-04",
    candidateName: "Karwan Ali",
    headline: "React Native · 3 yıl",
    matchScore: 92,
    status: "reviewing",
    appliedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "em-3",
    jobId: "job-hotel-ankawa-02",
    candidateName: "Sara Yousif",
    headline: "Ön büro · İngilizce C1",
    matchScore: 78,
    status: "submitted",
    appliedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: "em-4",
    jobId: "job-retail-suli-08",
    candidateName: "Dilan Omar",
    headline: "Perakende müdür yardımcısı",
    matchScore: 81,
    status: "shortlisted",
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const SEED_VIEWED = ["job-tech-erbil-04", "job-sales-erbil-01", "job-hotel-ankawa-02"];
const SEED_SAVED = ["job-tech-erbil-04", "job-edu-ankawa-06"];

export const useCareerStore = create<State>((set, get) => ({
  hydrated: false,
  applications: [],
  viewedIds: [],
  savedIds: [],
  openToWork: true,
  jobAlarmOn: false,
  hydrate: async () => {
    try {
      const [rawApps, rawMeta] = await Promise.all([
        AsyncStorage.getItem(KEY),
        AsyncStorage.getItem(META_KEY),
      ]);
      const applications = rawApps
        ? (JSON.parse(rawApps) as CareerApplication[])
        : [];
      const meta = rawMeta ? (JSON.parse(rawMeta) as CareerMeta) : null;
      set({
        hydrated: true,
        applications: Array.isArray(applications) ? applications : [],
        viewedIds: meta?.viewedIds?.length ? meta.viewedIds : SEED_VIEWED,
        savedIds: meta?.savedIds?.length ? meta.savedIds : SEED_SAVED,
        openToWork: meta?.openToWork ?? true,
        jobAlarmOn: meta?.jobAlarmOn ?? false,
      });
      if (!meta) {
        await persistMeta({
          viewedIds: SEED_VIEWED,
          savedIds: SEED_SAVED,
          openToWork: true,
          jobAlarmOn: false,
        });
      }
    } catch {
      set({
        hydrated: true,
        applications: [],
        viewedIds: SEED_VIEWED,
        savedIds: SEED_SAVED,
        openToWork: true,
        jobAlarmOn: false,
      });
    }
  },
  apply: async (input) => {
    const existing = get().applications.find((a) => a.jobId === input.jobId);
    if (existing) return existing;
    const app: CareerApplication = {
      id: `ca-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      jobId: input.jobId,
      jobTitle: input.jobTitle,
      company: input.company,
      city: input.city,
      cv: input.cv,
      createdAt: new Date().toISOString(),
      status: "submitted",
    };
    const applications = [app, ...get().applications];
    set({ applications });
    await persistApps(applications);
    return app;
  },
  hasApplied: (jobId) => get().applications.some((a) => a.jobId === jobId),
  markViewed: async (jobId) => {
    const prev = get().viewedIds;
    if (prev[0] === jobId) return;
    const viewedIds = [jobId, ...prev.filter((id) => id !== jobId)].slice(0, 40);
    set({ viewedIds });
    await persistMeta({
      viewedIds,
      savedIds: get().savedIds,
      openToWork: get().openToWork,
      jobAlarmOn: get().jobAlarmOn,
    });
  },
  toggleSaved: async (jobId) => {
    const prev = get().savedIds;
    const savedIds = prev.includes(jobId)
      ? prev.filter((id) => id !== jobId)
      : [jobId, ...prev];
    set({ savedIds });
    await persistMeta({
      viewedIds: get().viewedIds,
      savedIds,
      openToWork: get().openToWork,
      jobAlarmOn: get().jobAlarmOn,
    });
  },
  isSaved: (jobId) => get().savedIds.includes(jobId),
  setOpenToWork: async (on) => {
    set({ openToWork: on });
    await persistMeta({
      viewedIds: get().viewedIds,
      savedIds: get().savedIds,
      openToWork: on,
      jobAlarmOn: get().jobAlarmOn,
    });
  },
  setJobAlarmOn: async (on) => {
    set({ jobAlarmOn: on });
    await persistMeta({
      viewedIds: get().viewedIds,
      savedIds: get().savedIds,
      openToWork: get().openToWork,
      jobAlarmOn: on,
    });
  },
  employerMatches: () => {
    const fromApps: EmployerMatchRow[] = get().applications.map((a) => ({
      id: `em-app-${a.id}`,
      jobId: a.jobId,
      candidateName: a.cv.fullName,
      headline: a.cv.headline,
      matchScore: Math.min(95, 55 + a.cv.yearsExp * 8),
      status: a.status,
      appliedAt: a.createdAt,
    }));
    const jobIds = new Set(DEMO_JOBS.map((j) => j.id));
    const seed = SEED_MATCHES.filter((m) => jobIds.has(m.jobId));
    return [...fromApps, ...seed];
  },
}));

export function employerJobLabel(jobId: string, lang: "tr" | "en"): string {
  const job = getJob(jobId);
  if (!job) return jobId;
  return lang === "tr" ? job.title_tr : job.title_en;
}
