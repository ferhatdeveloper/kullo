import { router } from "expo-router";
import { Building2, Car, ChevronRight, Shirt } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type PostCategory = {
  key: string;
  titleKey: string;
  hintKey: string;
  Icon: typeof Car;
  go: () => void;
  accent: string;
  soft: string;
};

/** Ortak ilan ver — kategori seçici (Sahibinden kalıbı) */
export default function SellPickerScreen() {
  const { t } = useTranslation();

  const cats: PostCategory[] = [
    {
      key: "vehicle",
      titleKey: "sellPicker.vehicle",
      hintKey: "sellPicker.vehicleHint",
      Icon: Car,
      go: () => router.push("/vehicle-sell"),
      accent: colors.viridian,
      soft: colors.brandSoft,
    },
    {
      key: "realty",
      titleKey: "sellPicker.realty",
      hintKey: "sellPicker.realtyHint",
      Icon: Building2,
      go: () => router.push("/realty-sell"),
      accent: colors.ink,
      soft: colors.brandSoft,
    },
    {
      key: "shop",
      titleKey: "sellPicker.shop",
      hintKey: "sellPicker.shopHint",
      Icon: Shirt,
      go: () => router.push("/shop-sell"),
      accent: colors.flameDeep,
      soft: colors.flameSoft,
    },
  ];

  return (
    <Screen edges={["top"]}>
      <StatusBar style="dark" />
      <ScreenHeader title={t("sellPicker.title")} subtitle={t("sellPicker.subtitle")} />
      <View style={styles.list}>
        {cats.map((c) => (
          <Pressable
            key={c.key}
            style={styles.card}
            onPress={c.go}
            accessibilityRole="button"
          >
            <View style={[styles.iconWrap, { backgroundColor: c.soft }]}>
              <c.Icon size={22} color={c.accent} strokeWidth={2.2} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{t(c.titleKey)}</Text>
              <Text style={styles.hint}>{t(c.hintKey)}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkFaint} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: space.lg,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow.soft,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
});
