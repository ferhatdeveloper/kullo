import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ListingStatusBadge } from "./ListingStatusBadge";
import { OfflineCover } from "./OfflineCover";
import { useCityStore } from "../lib/city-store";
import { useCurrencyStore } from "../lib/currency-store";
import { useMarketplaceStore } from "../lib/marketplace-store";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

export type ExploreVertical = "vehicles" | "realty" | "shop" | "food";

type Props = {
  vertical: Exclude<ExploreVertical, "vehicles">;
};

/** Ara sekmesi — emlak / alışveriş / yemek sonuçları */
export function MarketplaceExplore({ vertical }: Props) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const city = useCityStore((s) => s.city);
  const realty = useMarketplaceStore((s) => s.realty);
  const goods = useMarketplaceStore((s) => s.goods);
  const restaurants = useMarketplaceStore((s) => s.restaurants);
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (vertical === "realty") {
      return realty
        .filter((r) => {
          if (city !== "all" && r.city !== city) return false;
          if (qq && !`${r.title} ${r.city} ${r.seller_name}`.toLowerCase().includes(qq))
            return false;
          return true;
        })
        .map((r) => ({
          id: r.id,
          title: r.title,
          meta: `${r.city} · ${t(`realty.offer.${r.offer_type}`)}`,
          price: formatListing(r.price_amount, r.price_currency),
          cover: r.cover_url,
          status: r.listing_status,
          go: () => router.push(`/realty/${r.id}`),
        }));
    }
    if (vertical === "shop") {
      return goods
        .filter((g) => {
          if (city !== "all" && g.city !== city) return false;
          if (qq && !`${g.title} ${g.brand} ${g.shop_name}`.toLowerCase().includes(qq))
            return false;
          return true;
        })
        .map((g) => ({
          id: g.id,
          title: g.title,
          meta: `${g.brand} · ${g.shop_name}`,
          price: formatListing(g.price_amount, g.price_currency),
          cover: g.cover_url,
          status: g.listing_status,
          go: () => router.push(`/shop/${g.id}`),
        }));
    }
    return restaurants
      .filter((r) => {
        if (city !== "all" && r.city !== city) return false;
        if (qq && !`${r.name} ${r.cuisine} ${r.city}`.toLowerCase().includes(qq))
          return false;
        return true;
      })
      .map((r) => ({
        id: r.id,
        title: r.name,
        meta: `${r.cuisine} · ★ ${r.rating_avg.toFixed(1)} · ${r.eta_min} ${t("food.min")}`,
        price: r.is_open ? t("food.openOnly") : t("food.closed"),
        cover: r.cover_url,
        status: undefined as undefined,
        go: () => router.push(`/food/${r.id}`),
      }));
  }, [vertical, realty, goods, restaurants, city, q, formatListing, t]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        value={q}
        onChangeText={setQ}
        placeholder={t("search.explorePlaceholder")}
        placeholderTextColor={colors.inkFaint}
      />
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("search.noResults")}</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={item.go}>
            <OfflineCover uri={item.cover} label={item.title} style={styles.cover} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <ListingStatusBadge status={item.status} compact />
              </View>
              <Text style={styles.meta} numberOfLines={1}>
                {item.meta}
              </Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  search: {
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: 11,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  list: { padding: space.lg, paddingBottom: space.xl * 2, gap: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.soft,
  },
  cover: { width: 96, height: 96 },
  body: { flex: 1, padding: 10, gap: 4, justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  title: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint },
  price: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.flameDeep,
  },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
