import { router } from "expo-router";
import {
  ChevronRight,
  MapPin,
  Package,
  Shirt,
  User,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export function MartAccount() {
  const { t } = useTranslation();

  const rows = [
    {
      key: "orders",
      Icon: Package,
      title: t("mart.orders"),
      hint: t("mart.ordersHint"),
      onPress: () => router.push("/(tabs)/profile"),
    },
    {
      key: "address",
      Icon: MapPin,
      title: t("mart.addresses"),
      hint: t("mart.addressesHint"),
      onPress: () => {},
    },
    {
      key: "profile",
      Icon: User,
      title: t("mart.profile"),
      hint: t("mart.profileHint"),
      onPress: () => router.push("/(tabs)/profile"),
    },
    {
      key: "fashion",
      Icon: Shirt,
      title: t("mart.fashion"),
      hint: t("mart.fashionHint"),
      onPress: () => router.push("/(tabs)/shop"),
    },
  ];

  return (
    <View style={styles.root}>
      <Text style={styles.lead}>{t("mart.accountLead")}</Text>
      {rows.map((r) => (
        <Pressable
          key={r.key}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={r.onPress}
        >
          <View style={styles.icon}>
            <r.Icon size={17} color={colors.flame} strokeWidth={2.3} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.hint} numberOfLines={1}>
              {r.hint}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.inkFaint} strokeWidth={2.2} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: space.lg,
    gap: 10,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    ...shadow.soft,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 1 },
  title: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.inkFaint },
  pressed: { opacity: 0.92 },
});
