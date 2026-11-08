import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OsmMap } from "../../components/OsmMap";
import { RealtyCard } from "../../components/RealtyCard";
import { useCurrencyStore } from "../../lib/currency-store";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { coordsForListing } from "../../lib/realty-map";
import { useRealtyFavorites } from "../../lib/realty-favorites-store";
import { colors, fonts, radius, space } from "../../lib/theme";

const MAP_H = Dimensions.get("window").height * 0.58;

export default function RealtyMapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const realty = useMarketplaceStore((s) => s.realty);
  const favToggle = useRealtyFavorites((s) => s.toggle);
  const favHas = useRealtyFavorites((s) => s.has);

  const properties = useMemo(
    () =>
      realty.filter(
        (r) => r.listing_status !== "sold" && r.listing_status !== "rented",
      ),
    [realty],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    () => properties[0]?.id ?? null,
  );

  const active =
    properties.find((p) => p.id === selectedId) ?? properties[0] ?? null;

  /** Aynı şehirdeki pinler — ülke ölçeğinde dağılmayı önler */
  const cityProperties = useMemo(() => {
    if (!active) return properties.slice(0, 8);
    const same = properties.filter((p) => p.city === active.city);
    return same.length > 0 ? same : [active];
  }, [properties, active]);

  const markers = useMemo(
    () =>
      cityProperties.map((p) => {
        const { lat, lng } = coordsForListing(p.id, p.city, p.district);
        const label =
          p.offer_type === "rent"
            ? t("realty.offer.rent")
            : p.price_currency === "USD"
              ? `$${Math.round(p.price_amount / 1000)}k`
              : formatListing(p.price_amount, p.price_currency);
        return {
          id: p.id,
          lat,
          lng,
          label,
          selected: p.id === (active?.id ?? selectedId),
        };
      }),
    [cityProperties, active?.id, selectedId, formatListing, t],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.mapBox, { height: MAP_H }]}>
        <OsmMap
          markers={markers}
          selectedId={active?.id ?? selectedId}
          onSelect={setSelectedId}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2.3} />
        </Pressable>
        <View style={styles.titlePill}>
          <Text style={styles.title}>{t("realty.exploreMap")}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.near}>
          {t("realty.nearYou")}
          {active?.city ? ` · ${active.city}` : ""}
        </Text>
        {active ? (
          <RealtyCard
            item={active}
            variant="feed"
            favorited={favHas(active.id)}
            priceLabel={formatListing(active.price_amount, active.price_currency)}
            saleLabel={t("realty.offer.sale")}
            rentLabel={t("realty.offer.rent")}
            hotLabel={t("realty.hot")}
            typeLabel={t(`realty.kinds.${active.kind}`)}
            onPress={() => router.push(`/realty/${active.id}`)}
            onFavorite={() => void favToggle(active.id)}
          />
        ) : (
          <Text style={styles.empty}>{t("realty.empty")}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  mapBox: { width: "100%", backgroundColor: "#e8eef2" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  titlePill: {
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  sheet: {
    flex: 1,
    marginTop: -20,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: space.md,
  },
  near: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginBottom: space.sm,
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: space.lg,
  },
});
