import { router } from "expo-router";
import {
  Building2,
  Car,
  ChevronRight,
  Shirt,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react-native";
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

import { OfflineCover } from "../../components/OfflineCover";
import { Chip } from "../../components/ui/Chip";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCityStore } from "../../lib/city-store";
import { DEMO_STORES } from "../../lib/demo-data";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export type StoreCategory = "all" | "vehicle" | "realty" | "shop" | "food";

type DirectoryStore = {
  id: string;
  name: string;
  city: string;
  category: StoreCategory;
  cover_url?: string;
  verified?: boolean;
  rating_avg?: number;
  listing_count: number;
  bio?: string;
  go: () => void;
};

/** Tüm kategorilerde mağaza / galeri / emlak / restoran dizini */
export default function StoresDirectoryScreen() {
  const { t } = useTranslation();
  const city = useCityStore((s) => s.city);
  const shops = useMarketplaceStore((s) => s.shops);
  const restaurants = useMarketplaceStore((s) => s.restaurants);
  const realty = useMarketplaceStore((s) => s.realty);
  const [cat, setCat] = useState<StoreCategory>("all");
  const [q, setQ] = useState("");

  const all = useMemo(() => {
    const rows: DirectoryStore[] = [];

    for (const s of DEMO_STORES) {
      rows.push({
        id: `vehicle-${s.user_id}`,
        name: s.display_name,
        city: s.city,
        category: "vehicle",
        cover_url: s.cover_url,
        verified: s.verified,
        rating_avg: s.rating_avg,
        listing_count: s.posts?.length ?? 0,
        bio: s.bio,
        go: () => router.push(`/seller/${s.user_id}`),
      });
    }

    const realtyBySeller = new Map<string, number>();
    for (const r of realty) {
      const key = r.seller_name;
      realtyBySeller.set(key, (realtyBySeller.get(key) ?? 0) + 1);
    }
    for (const [name, count] of realtyBySeller) {
      const sample = realty.find((r) => r.seller_name === name)!;
      rows.push({
        id: `realty-${name}`,
        name,
        city: sample.city,
        category: "realty",
        cover_url: sample.cover_url,
        verified: true,
        listing_count: count,
        bio: t("storesDirectory.realtyBio"),
        go: () => router.push("/(tabs)/realty"),
      });
    }

    for (const s of shops) {
      rows.push({
        id: `shop-${s.id}`,
        name: s.name,
        city: s.city,
        category: "shop",
        cover_url: s.cover_url,
        verified: s.verified,
        listing_count: s.listing_ids.length,
        bio: s.bio,
        go: () => router.push(`/shop-store/${s.id}`),
      });
    }

    for (const r of restaurants) {
      rows.push({
        id: `food-${r.id}`,
        name: r.name,
        city: r.city,
        category: "food",
        cover_url: r.cover_url,
        verified: r.is_open,
        rating_avg: r.rating_avg,
        listing_count: r.menu.length,
        bio: r.cuisine,
        go: () => router.push(`/food/${r.id}`),
      });
    }

    return rows;
  }, [shops, restaurants, realty, t]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return all.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (city !== "all" && s.city !== city) return false;
      if (qq && !`${s.name} ${s.bio ?? ""} ${s.city}`.toLowerCase().includes(qq))
        return false;
      return true;
    });
  }, [all, cat, city, q]);

  const catIcon = (c: StoreCategory) => {
    if (c === "vehicle") return Car;
    if (c === "realty") return Building2;
    if (c === "shop") return Shirt;
    if (c === "food") return UtensilsCrossed;
    return Store;
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("storesDirectory.title")}
        subtitle={t("storesDirectory.subtitle")}
      />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={q}
          onChangeText={setQ}
          placeholder={t("storesDirectory.search")}
          placeholderTextColor={colors.inkFaint}
        />
      </View>

      <View style={styles.filters}>
        {(["all", "vehicle", "realty", "shop", "food"] as const).map((key) => (
          <Chip
            key={key}
            label={t(`storesDirectory.cat.${key}`)}
            selected={cat === key}
            onPress={() => setCat(key)}
          />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("storesDirectory.empty")}</Text>
        }
        renderItem={({ item }) => {
          const Icon = catIcon(item.category);
          return (
            <Pressable style={styles.card} onPress={item.go}>
              <OfflineCover
                uri={item.cover_url}
                label={item.name}
                style={styles.cover}
              />
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Icon size={14} color={colors.flame} strokeWidth={2.2} />
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.verified ? (
                    <Text style={styles.verified}>{t("shop.verified")}</Text>
                  ) : null}
                </View>
                <Text style={styles.meta} numberOfLines={1}>
                  {t(`storesDirectory.cat.${item.category}`)} · {item.city}
                  {item.rating_avg != null
                    ? ` · ★ ${item.rating_avg.toFixed(1)}`
                    : ""}
                </Text>
                {item.bio ? (
                  <Text style={styles.bio} numberOfLines={2}>
                    {item.bio}
                  </Text>
                ) : null}
                <Text style={styles.count}>
                  {t("storesDirectory.count", { count: item.listing_count })}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.inkFaint} />
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  search: {
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
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  list: { padding: space.lg, paddingBottom: space.xl * 2, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    paddingRight: 8,
    ...shadow.soft,
  },
  cover: { width: 88, height: 88, borderRadius: 0 },
  body: { flex: 1, paddingVertical: 10, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  verified: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.viridian,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint },
  bio: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  count: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.flame,
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
