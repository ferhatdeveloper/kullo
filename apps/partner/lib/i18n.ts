import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar/common.json";
import en from "../locales/en/common.json";
import fa from "../locales/fa/common.json";
import kuBad from "../locales/ku-bad/common.json";
import kuSor from "../locales/ku-sor/common.json";
import tr from "../locales/tr/common.json";

void i18n.use(initReactI18next).init({
  resources: {
    tr: { common: tr },
    en: { common: en },
    ar: { common: ar },
    fa: { common: fa },
    "ku-bad": { common: kuBad },
    "ku-sor": { common: kuSor },
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
