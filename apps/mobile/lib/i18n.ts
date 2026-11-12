import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import {
  resources,
  supportedLocales,
  defaultLocale,
  resolveLocale,
  type LocaleCode,
} from "./locales";

const deviceLocales = Localization.getLocales();
const deviceTag = deviceLocales[0]?.languageTag ?? defaultLocale;
const initialLocale: LocaleCode = resolveLocale(deviceTag);

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLocale,
    fallbackLng: defaultLocale,
    defaultNS: "common",
    ns: ["common"],
    compatibilityJSON: "v3",
    // ku-bad / ku-sor: i18next default casing turns these into ku-BAD / ku-SOR.
    // lowerCaseLng + resources alias (ku-BAD / ku-SOR) together keep lookups working.
    lowerCaseLng: true,
    load: "currentOnly",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
  })
  .then(() => {
    /** Hyphenli KU kodlarında i18next’in bölge büyütmesini kapat. */
    const langUtils = i18n.services?.languageUtils as
      | { formatLanguageCode?: (code: string) => string }
      | undefined;
    if (langUtils) {
      langUtils.formatLanguageCode = (code: string) => resolveLocale(code);
    }
    // Tercih zaten ku-* ise casing yüzünden TR’de kalmış olabilir — yeniden hizala.
    const aligned = resolveLocale(i18n.language);
    if (aligned !== i18n.language) {
      void i18n.changeLanguage(aligned);
    }
  });

export default i18n;
export { supportedLocales, defaultLocale };
export type { LocaleCode };