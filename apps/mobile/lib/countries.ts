/**
 * Pazar ülke seed’i (ISO 3166-1 alpha-2).
 * Seyahat dikeyi IATA/şehir kodları (EBL, IST…) kullanır — buradaki
 * countryCode ile karıştırılmaz; travel from/to bağımsız kalır.
 */

import type { AppCurrency } from "./hatwan-rates";
import type { LocaleCode } from "./locales";

export const MARKET_COUNTRIES = [
  {
    code: "IQ",
    name_tr: "Irak",
    name_en: "Iraq",
    currency: "IQD" as AppCurrency,
    defaultLocale: "tr" as LocaleCode,
  },
  {
    code: "TR",
    name_tr: "Türkiye",
    name_en: "Turkey",
    currency: "USD" as AppCurrency,
    defaultLocale: "tr" as LocaleCode,
  },
  {
    code: "AE",
    name_tr: "BAE",
    name_en: "UAE",
    currency: "USD" as AppCurrency,
    defaultLocale: "en" as LocaleCode,
  },
  {
    code: "SA",
    name_tr: "Suudi Arabistan",
    name_en: "Saudi Arabia",
    currency: "USD" as AppCurrency,
    defaultLocale: "ar" as LocaleCode,
  },
  {
    code: "DE",
    name_tr: "Almanya",
    name_en: "Germany",
    currency: "USD" as AppCurrency,
    defaultLocale: "en" as LocaleCode,
  },
  {
    code: "GB",
    name_tr: "İngiltere",
    name_en: "United Kingdom",
    currency: "USD" as AppCurrency,
    defaultLocale: "en" as LocaleCode,
  },
  {
    code: "US",
    name_tr: "ABD",
    name_en: "United States",
    currency: "USD" as AppCurrency,
    defaultLocale: "en" as LocaleCode,
  },
] as const;

export type CountryCode = (typeof MARKET_COUNTRIES)[number]["code"];
export const defaultCountryCode: CountryCode = "IQ";

export function isCountryCode(raw: string | null | undefined): raw is CountryCode {
  return !!raw && MARKET_COUNTRIES.some((c) => c.code === raw);
}

export function countryByCode(code: CountryCode) {
  return MARKET_COUNTRIES.find((c) => c.code === code) ?? MARKET_COUNTRIES[0];
}

export function countryLabel(code: CountryCode, lang: "tr" | "en" = "tr"): string {
  const c = countryByCode(code);
  return lang === "en" ? c.name_en : c.name_tr;
}
