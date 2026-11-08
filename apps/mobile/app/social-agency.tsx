import { router } from "expo-router";
import { Clapperboard, ChevronRight, Sparkles, Stars } from "lucide-react-native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";

import { Screen, ScreenHeader } from "../components/ui/Screen";
import { colors, fonts, radius, space } from "../lib/theme";

const PACKS = [
  {
    key: "basic",
    Icon: Clapperboard,
    titleKey: "socialAgency.packBasic",
    bodyKey: "socialAgency.packBasicBody",
    price: "150K IQD/ay",
  },
  {
    key: "pro",
    Icon: Sparkles,
    titleKey: "socialAgency.packPro",
    bodyKey: "socialAgency.packProBody",
    price: "350K IQD/ay",
  },
  {
    key: "agency",
    Icon: Stars,
    titleKey: "socialAgency.packAgency",
    bodyKey: "socialAgency.packAgencyBody",
    price: "Özel",
  },
] as const;

/** Dens paket satırları — Kariyer JobCard yoğunluğu; tek şişkin kart yok. */
export default function SocialAgencyScreen() {
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
    }, []),
  );

  const request = (packTitle: string) => {
    Alert.alert(t("socialAgency.sentTitle"), t("socialAgency.sentBody", { pack: packTitle }));
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("socialAgency.title")}
        subtitle={t("socialAgency.subtitle")}
        onBack={() => router.back()}
      />
      <FlatList
        data={PACKS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.lead}>{t("socialAgency.lead")}</Text>
        }
        renderItem={({ item: p }) => {
          const Icon = p.Icon;
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => request(t(p.titleKey))}
              accessibilityRole="button"
              accessibilityLabel={`${t(p.titleKey)}, ${t("socialAgency.cta")}`}
            >
              <View style={styles.icon}>
                <Icon size={16} color={colors.flame} strokeWidth={2.2} />
              </View>
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                  {t(p.titleKey)}
                </Text>
                <Text style={styles.hint} numberOfLines={1}>
                  {t(p.bodyKey)}
                </Text>
              </View>
              <Text style={styles.price} numberOfLines={1}>
                {p.price}
              </Text>
              <ChevronRight size={16} color={colors.inkFaint} strokeWidth={2.2} />
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.section,
    gap: 6,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(12,45,41,0.1)",
    minHeight: 56,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0, gap: 1 },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  price: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.flameDeep,
    flexShrink: 0,
    maxWidth: 88,
    textAlign: "right",
  },
  pressed: { opacity: 0.92 },
});
