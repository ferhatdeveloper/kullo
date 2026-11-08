import { router } from "expo-router";
import {
  Heart,
  Percent,
  Search,
  Star,
  Store,
  Truck,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ListingStatusBadge } from "../../components/ListingStatusBadge";
import { OfflineCover } from "../../components/OfflineCover";
import { Chip } from "../../components/ui/Chip";
import { VerticalShell } from "../../components/VerticalShell";
import { useCityStore } from "../../lib/city-store";
import { useCurrencyStore } from "../../lib/currency-store";
import type { DemoGoodsListing, GoodsCategory } from "../../lib/demo-data";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type CatKey = "all" | "women" | "men" | "kids" | GoodsCategory;
type CondFilter = "all" | "new" | "like_new" | "used";
type SortKey = "featured" | "price_asc" | "price_desc" | "rating";

const CATEGORIES: { key: CatKey; labelKey: string; emoji: string }[] = [
  { key: "all", labelKey: "shop.catAll", emoji: "✦" },
  { key: "women", labelKey: "shop.catWomen", emoji: "👗" },
  { key: "men", labelKey: "shop.catMen", emoji: "👔" },
  { key: "kids", labelKey: "shop.catKids", emoji: "🧒" },
  { key: "dress", labelKey: "shop.cats.dress", emoji: "◇" },
  { key: "shoes", labelKey: "shop.cats.shoes", emoji: "👟" },
  { key: "bags", labelKey: "shop.cats.bags", emoji: "👜" },
  { key: "modest", labelKey: "shop.cats.modest", emoji: "◈" },
  { key: "accessories", labelKey: "shop.cats.accessories", emoji: "✦" },
  { key: "outerwear", labelKey: "shop.cats.outerwear", emoji: "🧥" },
];

/** Trendyol-benzeri zengin giyim keşif ekranı */
export default function ShopHomeScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const city = useCityStore((s) => s.city);
  const goods = useMarketplaceStore((s) => s.goods);
  const shops = useMarketplaceStore((s) => s.shops);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CatKey>("all");
  const [cond, setCond] = useState<CondFilter>("all");
  const [onlyShip, setOnlyShip] = useState(false);
  const [onlyDeal, setOnlyDeal] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let rows = goods.filter((g) => {
      if (city !== "all" && g.city !== city) return false;
      if (cat === "women" && g.gender !== "women") return false;
      if (cat === "men" && g.gender !== "men") return false;
      if (cat === "kids" && g.gender !== "kids") return false;
      if (
        cat !== "all" &&
        cat !== "women" &&
        cat !== "men" &&
        cat !== "kids" &&
        g.category !== cat
      )
        return false;
      if (cond !== "all" && g.condition !== cond) return false;
      if (onlyShip && !g.free_shipping) return false;
      if (onlyDeal && !(g.discount_pct || g.featured)) return false;
      if (qq && !`${g.title} ${g.brand} ${g.shop_name} ${g.category}`.toLowerCase().includes(qq))
        return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "price_asc") return a.price_amount - b.price_amount;
      if (sort === "price_desc") return b.price_amount - a.price_amount;
      if (sort === "rating") return (b.rating_avg ?? 0) - (a.rating_avg ?? 0);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
    return rows;
  }, [goods, city, cat, cond, onlyShip, onlyDeal, sort, q]);

  const flash = useMemo(
    () =>
      filtered.filter(
        (g) => (g.featured || g.discount_pct) && g.listing_status !== "sold",
      ),
    [filtered],
  );

  const brands = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of goods) {
      if (city !== "all" && g.city !== city) continue;
      map.set(g.brand, (map.get(g.brand) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [goods, city]);

  const shopList = useMemo(
    () => shops.filter((s) => city === "all" || s.city === city),
    [shops, city],
  );

  const renderProduct = ({ item }: { item: DemoGoodsListing }) => (
    <Pressable style={styles.product} onPress={() => router.push(`/shop/${item.id}`)}>
      <View>
        <OfflineCover uri={item.cover_url} label={item.title} style={styles.productImg} />
        {item.discount_pct ? (
          <View style={styles.dealTag}>
            <Text style={styles.dealTagText}>-%{item.discount_pct}</Text>
          </View>
        ) : item.featured && item.listing_status !== "sold" ? (
          <View style={styles.dealTag}>
            <Text style={styles.dealTagText}>{t("shop.deal")}</Text>
          </View>
        ) : null}
        {item.free_shipping ? (
          <View style={styles.shipTag}>
            <Truck size={10} color={colors.white} strokeWidth={2.4} />
            <Text style={styles.shipTagText}>{t("shop.freeShipShort")}</Text>
          </View>
        ) : null}
        <View style={styles.statusOverlay}>
          <ListingStatusBadge status={item.listing_status} compact />
        </View>
      </View>
      <Text style={styles.productBrand} numberOfLines={1}>
        {item.brand}
      </Text>
      <Text style={styles.productTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.rating_avg != null ? (
        <View style={styles.ratingRow}>
          <Star size={11} color={colors.flame} fill={colors.flame} strokeWidth={0} />
          <Text style={styles.ratingText}>
            {item.rating_avg.toFixed(1)}
            {item.rating_count ? ` (${item.rating_count})` : ""}
          </Text>
        </View>
      ) : null}
      <Text style={styles.productMeta}>
        {item.size_label} · {t(`shop.condition.${item.condition}`)}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>
          {formatListing(item.price_amount, item.price_currency)}
        </Text>
        {item.compare_at ? (
          <Text style={styles.compareAt}>
            {formatListing(item.compare_at, item.price_currency)}
          </Text>
        ) : null}
      </View>
      <Text style={styles.productShop} numberOfLines={1}>
        {item.shop_name}
      </Text>
    </Pressable>
  );

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.inkFaint} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            value={q}
            onChangeText={setQ}
            placeholder={t("shop.searchPlaceholder")}
            placeholderTextColor={colors.inkFaint}
          />
        </View>
        <Pressable style={styles.iconCircleSoft} onPress={() => {}}>
          <Heart size={18} color={colors.flame} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map((c) => {
          const on = cat === c.key;
          return (
            <Pressable key={c.key} style={styles.catItem} onPress={() => setCat(c.key)}>
              <View style={[styles.catCircle, on && styles.catCircleOn]}>
                <Text style={styles.catEmoji}>{c.emoji}</Text>
              </View>
              <Text style={[styles.catLabel, on && styles.catLabelOn]} numberOfLines={1}>
                {t(c.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.banner}>
        <View style={styles.bannerBadge}>
          <Percent size={12} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.bannerBadgeText}>{t("shop.flashBadge")}</Text>
        </View>
        <Text style={styles.bannerTitle}>{t("shop.flashTitle")}</Text>
        <Text style={styles.bannerSub}>{t("shop.flashSub")}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Chip
          label={t("shop.freeShip")}
          selected={onlyShip}
          onPress={() => setOnlyShip((v) => !v)}
        />
        <Chip
          label={t("shop.dealsOnly")}
          selected={onlyDeal}
          onPress={() => setOnlyDeal((v) => !v)}
        />
        {(["all", "new", "like_new", "used"] as const).map((c) => (
          <Chip
            key={c}
            label={c === "all" ? t("shop.conditionLabel") : t(`shop.condition.${c}`)}
            selected={cond === c}
            onPress={() => setCond(c)}
          />
        ))}
        <Chip
          label={t("shop.sortFeatured")}
          selected={sort === "featured"}
          onPress={() => setSort("featured")}
        />
        <Chip
          label={t("shop.sortPriceAsc")}
          selected={sort === "price_asc"}
          onPress={() => setSort("price_asc")}
        />
        <Chip
          label={t("shop.sortPriceDesc")}
          selected={sort === "price_desc"}
          onPress={() => setSort("price_desc")}
        />
        <Chip
          label={t("shop.sortRating")}
          selected={sort === "rating"}
          onPress={() => setSort("rating")}
        />
      </ScrollView>

      {brands.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("shop.brands")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
            {brands.map((b) => (
              <Pressable
                key={b}
                style={[styles.brandChip, q === b && styles.brandChipOn]}
                onPress={() => setQ(q === b ? "" : b)}
              >
                <Text style={[styles.brandChipText, q === b && styles.brandChipTextOn]}>{b}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {shopList.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t("shop.boutiques")}</Text>
            <Pressable onPress={() => router.push("/(tabs)/stores")}>
              <Text style={styles.seeAll}>{t("home.seeAll")}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boutiques}>
            {shopList.map((s) => (
              <Pressable
                key={s.id}
                style={styles.boutique}
                onPress={() => router.push(`/shop-store/${s.id}`)}
              >
                <OfflineCover uri={s.cover_url} label={s.name} style={styles.boutiqueCover} />
                <View style={styles.boutiqueBody}>
                  <Store size={12} color={colors.flame} strokeWidth={2.2} />
                  <Text style={styles.boutiqueName} numberOfLines={1}>
                    {s.name}
                  </Text>
                </View>
                {s.rating_avg != null ? (
                  <Text style={styles.boutiqueMeta}>
                    ★ {s.rating_avg.toFixed(1)} · {s.listing_ids.length} {t("shop.itemsShort")}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {flash.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("shop.flashDeals")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashRow}>
            {flash.slice(0, 8).map((g) => (
              <Pressable
                key={g.id}
                style={styles.flashCard}
                onPress={() => router.push(`/shop/${g.id}`)}
              >
                <OfflineCover uri={g.cover_url} label={g.title} style={styles.flashCover} />
                {g.discount_pct ? (
                  <Text style={styles.flashDisc}>-%{g.discount_pct}</Text>
                ) : null}
                <Text style={styles.flashPrice} numberOfLines={1}>
                  {formatListing(g.price_amount, g.price_currency)}
                </Text>
                <Text style={styles.flashTitle} numberOfLines={2}>
                  {g.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Text style={styles.results}>{t("shop.resultsCount", { count: filtered.length })}</Text>
    </View>
  );

  return (
    <VerticalShell
      title={t("shop.title")}
      onExit={() => router.replace("/(tabs)")}
      tabs={[
        {
          key: "explore",
          label: t("shop.items"),
          Icon: Search,
          active: true,
          onPress: () => {},
        },
        {
          key: "stores",
          label: t("shop.stores"),
          Icon: Store,
          onPress: () => router.push("/(tabs)/stores"),
        },
        {
          key: "deals",
          label: t("shop.deal"),
          Icon: Percent,
          onPress: () => setOnlyDeal(true),
        },
        {
          key: "boutiques",
          label: t("shop.boutiques"),
          Icon: Star,
          onPress: () => {},
        },
      ]}
    >
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{t("shop.empty")}</Text>}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
      />
    </VerticalShell>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: space.xl * 2 },
  headerBlock: { paddingBottom: space.sm },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSoft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  catRow: { paddingHorizontal: space.lg, gap: 12, paddingBottom: space.md },
  catItem: { alignItems: "center", width: 64, gap: 6 },
  catCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  catCircleOn: { borderColor: colors.flame, backgroundColor: colors.flameSoft },
  catEmoji: { fontSize: 20 },
  catLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "center",
  },
  catLabelOn: { fontFamily: fonts.bodySemi, color: colors.flameDeep },
  banner: {
    marginHorizontal: space.lg,
    marginBottom: space.md,
    backgroundColor: colors.flame,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  bannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  bannerBadgeText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.white },
  bannerTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.white, marginBottom: 4 },
  bannerSub: { fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.88)" },
  filterRow: { paddingHorizontal: space.lg, gap: 8, paddingBottom: space.md },
  section: { marginBottom: space.md },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  seeAll: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.flame },
  brandRow: { paddingHorizontal: space.lg, gap: 8 },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  brandChipOn: { borderColor: colors.flame, backgroundColor: colors.flameSoft },
  brandChipText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.ink },
  brandChipTextOn: { color: colors.flameDeep, fontFamily: fonts.bodySemi },
  boutiques: { paddingHorizontal: space.lg, gap: 10 },
  boutique: {
    width: 132,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  boutiqueCover: { width: 132, height: 76, borderRadius: 0 },
  boutiqueBody: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingTop: 8 },
  boutiqueName: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 11, color: colors.ink },
  boutiqueMeta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  flashRow: { paddingHorizontal: space.lg, gap: 10 },
  flashCard: {
    width: 128,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  flashCover: { width: 128, height: 110 },
  flashDisc: {
    position: "absolute",
    top: 8,
    left: 8,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    backgroundColor: colors.flame,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  flashPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 13,
    color: colors.flameDeep,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  flashTitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  results: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  gridRow: { paddingHorizontal: space.lg, gap: 10, marginBottom: 10 },
  product: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  productImg: { width: "100%", height: 158, borderRadius: 0 },
  statusOverlay: { position: "absolute", left: 8, bottom: 8 },
  dealTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.flame,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dealTagText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.white },
  shipTag: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(12,45,41,0.78)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  shipTagText: { fontFamily: fonts.bodySemi, fontSize: 9, color: colors.white },
  productBrand: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkMuted,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  productTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    paddingHorizontal: 8,
    minHeight: 34,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
  },
  ratingText: { fontFamily: fonts.body, fontSize: 11, color: colors.inkMuted },
  productMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    paddingHorizontal: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  productPrice: { fontFamily: fonts.display, fontSize: 15, color: colors.flameDeep },
  compareAt: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    textDecorationLine: "line-through",
  },
  productShop: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
    paddingHorizontal: 8,
    paddingBottom: 10,
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
