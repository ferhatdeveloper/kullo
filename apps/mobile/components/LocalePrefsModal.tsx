import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  MARKET_COUNTRIES,
  countryLabel,
  type CountryCode,
} from "../lib/countries";
import {
  localeNativeName,
  supportedLocales,
  type LocaleCode,
} from "../lib/locales";
import { useLocalePrefsStore } from "../lib/locale-prefs-store";
import { colors, fonts, radius, space } from "../lib/theme";

const LOCALE_SHORT: Record<LocaleCode, string> = {
  tr: "TR",
  en: "EN",
  ar: "AR",
  fa: "FA",
  "ku-bad": "KU",
  "ku-sor": "کورد",
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Dil + pazar ülkesi bottom sheet.
 * Ülke kodu ISO; seyahat from/to (IATA) ile paylaşılmaz.
 */
export function LocalePrefsModal({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = useLocalePrefsStore((s) => s.lang);
  const countryCode = useLocalePrefsStore((s) => s.countryCode);
  const setLang = useLocalePrefsStore((s) => s.setLang);
  const setCountryCode = useLocalePrefsStore((s) => s.setCountryCode);

  const currentLocale = (
    supportedLocales.includes(i18n.language as LocaleCode)
      ? i18n.language
      : lang
  ) as LocaleCode;

  const labelLang = currentLocale.startsWith("tr") ? "tr" : "en";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t("auth.regionPrefs")}</Text>
          <Text style={styles.hint}>{t("auth.regionPrefsHint")}</Text>

          <ScrollView
            showsVerticalScrollIndicator
            bounces={false}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.section}>{t("auth.selectLanguage")}</Text>
            {supportedLocales.map((loc) => {
              const selected = loc === currentLocale;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.option, selected && styles.optionOn]}
                  onPress={() => void setLang(loc)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.code, selected && styles.codeOn]}>
                    {LOCALE_SHORT[loc]}
                  </Text>
                  <Text style={[styles.name, selected && styles.nameOn]}>
                    {localeNativeName[loc]}
                  </Text>
                  {selected ? (
                    <Check size={16} color={colors.flame} strokeWidth={2.4} />
                  ) : null}
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.section, styles.sectionGap]}>
              {t("auth.selectCountry")}
            </Text>
            {MARKET_COUNTRIES.map((c) => {
              const selected = c.code === countryCode;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.option, selected && styles.optionOn]}
                  onPress={() => void setCountryCode(c.code as CountryCode)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.code, selected && styles.codeOn]}>
                    {c.code}
                  </Text>
                  <View style={styles.nameCol}>
                    <Text style={[styles.name, selected && styles.nameOn]}>
                      {countryLabel(c.code, labelLang)}
                    </Text>
                    <Text style={styles.meta}>
                      {c.currency} · {LOCALE_SHORT[c.defaultLocale]}
                    </Text>
                  </View>
                  {selected ? (
                    <Check size={16} color={colors.flame} strokeWidth={2.4} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.done} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.doneText}>{t("common.done")}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    maxHeight: "86%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.mist,
    marginBottom: space.md,
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: space.md,
  },
  scroll: { maxHeight: 520, flexGrow: 0 },
  scrollContent: { paddingBottom: space.sm },
  section: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkFaint,
    letterSpacing: 0.3,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionGap: { marginTop: space.lg },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: 5,
    backgroundColor: colors.mist,
  },
  optionOn: {
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: "rgba(255,106,0,0.35)",
  },
  code: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
    width: 40,
  },
  codeOn: { color: colors.flameDeep },
  nameCol: { flex: 1, gap: 2 },
  name: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  nameOn: {
    fontFamily: fonts.bodySemi,
    color: colors.flameDeep,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  done: {
    marginTop: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
});
