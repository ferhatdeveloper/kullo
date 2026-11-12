import tr from "../locales/tr/common.json";
import en from "../locales/en/common.json";
import ar from "../locales/ar/common.json";
import fa from "../locales/fa/common.json";
import kuBad from "../locales/ku-bad/common.json";
import kuSor from "../locales/ku-sor/common.json";

export const supportedLocales = ["tr", "en", "ar", "fa", "ku-bad", "ku-sor"] as const;
export type LocaleCode = (typeof supportedLocales)[number];
export const defaultLocale: LocaleCode = "tr";

/** Normalize i18next / device tags (ku-BAD, ku_sor, …) to a supported code. */
export function resolveLocale(raw?: string | null): LocaleCode {
  if (!raw) return defaultLocale;
  const normalized = raw.toLowerCase().replace(/_/g, "-");
  if ((supportedLocales as readonly string[]).includes(normalized)) {
    return normalized as LocaleCode;
  }
  const exact = supportedLocales.find((l) => normalized === l || normalized.startsWith(`${l}-`));
  return exact ?? defaultLocale;
}

export const isRTL = (locale: LocaleCode): boolean =>
  locale === "ar" || locale === "fa" || locale === "ku-sor";

export const localeNativeName: Record<LocaleCode, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  fa: "فارسی",
  "ku-bad": "Kurmancî (Badînî)",
  "ku-sor": "کوردی (سۆرانی)",
};

/**
 * i18next (lowerCaseLng kapalıyken) `ku-bad` → `ku-BAD` yapar.
 * Resource yalnızca küçük harfli anahtardaysa TR’ye düşer.
 * Her iki casing’i de kaydet — cihaz/Hermes’te lowerCaseLng kaçsa bile çalışır.
 */
const kuBadBundle = { common: kuBad };
const kuSorBundle = { common: kuSor };

export const resources = {
  tr: { common: tr },
  en: { common: en },
  ar: { common: ar },
  fa: { common: fa },
  "ku-bad": kuBadBundle,
  "ku-BAD": kuBadBundle,
  "ku-sor": kuSorBundle,
  "ku-SOR": kuSorBundle,
};