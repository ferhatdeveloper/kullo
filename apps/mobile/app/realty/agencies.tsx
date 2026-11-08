import { router } from "expo-router";
import { BadgeCheck, MapPin, Star } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { OfflineCover } from "../../components/OfflineCover";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { DEMO_AGENCIES } from "../../lib/demo-agencies";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function RealtyAgenciesScreen() {
  const { t } = useTranslation();

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={t("realty.agencies")} onBack={() => router.back()} />
      <FlatList
        data={DEMO_AGENCIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, shadow.soft]} activeOpacity={0.92}>
            <OfflineCover uri={item.cover_url} label={item.name} style={styles.cover} />
            <View style={styles.body}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.verified ? <BadgeCheck size={16} color={colors.flame} /> : null}
              </View>
              <View style={styles.metaRow}>
                <MapPin size={12} color={colors.inkFaint} />
                <Text style={styles.meta} numberOfLines={1}>
                  {[item.district, item.city].filter(Boolean).join(", ")}
                </Text>
              </View>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Star size={12} color={colors.flame} fill={colors.flame} />
                  <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.statText}>
                  {item.listings} {t("realty.listingsCount")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: space.lg,
    gap: space.md,
    paddingBottom: space.section,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cover: { width: 96, height: 96 },
  body: {
    flex: 1,
    padding: space.md,
    justifyContent: "center",
    gap: 4,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  stats: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
