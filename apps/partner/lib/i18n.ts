import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en/common.json";
import tr from "../locales/tr/common.json";

void i18n.use(initReactI18next).init({
  resources: {
    tr: { common: tr },
    en: { common: en },
  },
  lng: "tr",
  fallbackLng: "tr",
  defaultNS: "common",
  ns: ["common"],
  compatibilityJSON: "v3",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  returnNull: false,
});

export default i18n;
