import { router } from "expo-router";
import { BedDouble, MapPin } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { OfflineCover } from "../../components/OfflineCover";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { DEMO_PROJECTS, type DemoProject } from "../../lib/demo-agencies";
import { useCurrencyStore } from "../../lib/currency-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

function priceRangeLabel(
  p: DemoProject,
  formatListing: (n: number, c: "USD" | "IQD") => string,
) {
  const from = formatListing(p.unitsFrom, p.currency);
  if (p.unitsTo != null) {
    return `${from} – ${formatListing(p.unitsTo, p.currency)}`;
  }
  return from;
}

/** Paya tarzı proje listesi — yazılar görselin altında, ilan kartından ayrı */
export default function RealtyProjectsScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={t("realty.projects")} onBack={() => router.back()} />
      <FlatList
        data={DEMO_PROJECTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.count}>
            {t("realty.projectsCount", { count: DEMO_PROJECTS.length })}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, shadow.card]}
            activeOpacity={0.92}
            onPress={() => router.push(`/realty/project/${item.id}`)}
          >
            <View style={styles.media}>
              <OfflineCover
                uri={item.cover_url}
                label={item.name}
                style={styles.cover}
              />
              <View style={styles.status}>
                <Text style={styles.statusText}>
                  {t(`realty.projectStatus.${item.status}`)}
                </Text>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.price} numberOfLines={2}>
                  {priceRangeLabel(item, formatListing)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.loc}>
                  <MapPin size={13} color={colors.flame} fill={colors.flame} />
                  <Text style={styles.locText} numberOfLines={1}>
                    {item.city} · {item.developer}
                  </Text>
                </View>
                {item.unitsCount != null ? (
                  <View style={styles.unitsChip}>
                    <BedDouble size={12} color={colors.inkMuted} />
                    <Text style={styles.unitsText}>
                      {t("realty.unitsCount", { count: item.unitsCount })}
                    </Text>
                  </View>
                ) : null}
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
    gap: space.lg,
    paddingBottom: space.section,
  },
  count: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  card: {
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  media: {
    height: 188,
    backgroundColor: colors.mist,
  },
  cover: { width: "100%", height: "100%" },
  status: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.flame,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  name: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 21,
  },
  price: {
    maxWidth: "46%",
    textAlign: "right",
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  loc: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  unitsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unitsText: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
  },
});
