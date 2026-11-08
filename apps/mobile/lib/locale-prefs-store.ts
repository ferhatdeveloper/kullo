import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  countryByCode,
  defaultCountryCode,
  isCountryCode,
  type CountryCode,
} from "./countries";
import { useCurrencyStore } from "./currency-store";
import i18n from "./i18n";
import {
  defaultLocale,
  supportedLocales,
  type LocaleCode,
} from "./locales";

/** Dil + pazar ülkesi (ISO). Travel from/to ile paylaşılmaz. */
export const LOCALE_PREFS_KEY = "seyyare.locale_prefs_v1";

type Persisted = {
  lang: LocaleCode;
  countryCode: CountryCode;
};

function parseLang(raw: unknown): LocaleCode {
  if (typeof raw === "string" && supportedLocales.includes(raw as LocaleCode)) {
    return raw as LocaleCode;
  }
  return defaultLocale;
}

function parseCountry(raw: unknown): CountryCode {
  if (typeof raw === "string" && isCountryCode(raw)) return raw;
  return defaultCountryCode;
}

type LocalePrefsState = {
  hydrated: boolean;
  lang: LocaleCode;
  countryCode: CountryCode;
  hydrate: () => Promise<void>;
  setLang: (lang: LocaleCode) => Promise<void>;
  setCountryCode: (code: CountryCode, opts?: { syncCurrency?: boolean }) => Promise<void>;
};

async function persist(next: Persisted) {
  await AsyncStorage.setItem(LOCALE_PREFS_KEY, JSON.stringify(next));
}

export const useLocalePrefsStore = create<LocalePrefsState>((set, get) => ({
  hydrated: false,
  lang: defaultLocale,
  countryCode: defaultCountryCode,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCALE_PREFS_KEY);
      if (!raw) {
        const lang = parseLang(i18n.language);
        set({ hydrated: true, lang, countryCode: defaultCountryCode });
        if (i18n.language !== lang) void i18n.changeLanguage(lang);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      const lang = parseLang(parsed.lang);
      const countryCode = parseCountry(parsed.countryCode);
      set({ hydrated: true, lang, countryCode });
      if (i18n.language !== lang) void i18n.changeLanguage(lang);
    } catch {
      set({
        hydrated: true,
        lang: defaultLocale,
        countryCode: defaultCountryCode,
      });
    }
  },

  setLang: async (lang) => {
    set({ lang });
    void i18n.changeLanguage(lang);
    const { countryCode } = get();
    await persist({ lang, countryCode });
  },

  setCountryCode: async (code, opts) => {
    const syncCurrency = opts?.syncCurrency !== false;
    set({ countryCode: code });
    const { lang } = get();
    await persist({ lang, countryCode: code });
    if (syncCurrency) {
      const currency = countryByCode(code).currency;
      void useCurrencyStore.getState().setDisplay(currency);
    }
  },
}));
