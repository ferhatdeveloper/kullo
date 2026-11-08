import { router, useLocalSearchParams } from "expo-router";
import { ShieldCheck, Star, Truck } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ListingStatusBadge } from "../../components/ListingStatusBadge";
import { OfflineCover } from "../../components/OfflineCover";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const W = Dimensions.get("window").width;

export default function ShopItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const getGoods = useMarketplaceStore((s) => s.getGoods);
  const getShop = useMarketplaceStore((s) => s.getShop);
  const all = useMarketplaceStore((s) => s.goods);
  const item = getGoods(id ?? "");
  const shop = item ? getShop(item.shop_id) : undefined;
  const [photo, setPhoto] = useState(0);
  const [size, setSize] = useState(item?.size_label ?? "");
  const [color, setColor] = useState(item?.color_label ?? "");

  const gallery = useMemo(() => {
    if (!item) return [];
    return (item.gallery?.length ? item.gallery : [item.cover_url]).filter(Boolean);
  }, [item]);

  const similar = useMemo(() => {
    if (!item) return [];
    return all
      .filter(
        (g) =>
          g.id !== item.id &&
          (g.category === item.category || g.gender === item.gender) &&
          g.listing_status !== "sold",
      )
      .slice(0, 6);
  }, [all, item]);

  if (!item) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("shop.title")} onBack={() => router.back()} />
        <Text style={styles.muted}>{t("shop.notFound")}</Text>
      </Screen>
    );
  }

  const sizes = item.sizes?.length ? item.sizes : [item.size_label];
  const colorsList = item.colors?.length ? item.colors : [item.color_label];

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={item.shop_name} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <OfflineCover
            uri={gallery[photo] ?? item.cover_url}
            label={item.title}
            style={styles.cover}
          />
          <View style={styles.coverBadges}>
            {item.discount_pct ? (
              <Text style={styles.discPill}>-%{item.discount_pct}</Text>
            ) : (
              <View />
            )}
            <ListingStatusBadge status={item.listing_status} />
          </View>
          {gallery.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbs}
            >
              {gallery.map((uri, i) => (
                <Pressable key={`${uri}-${i}`} onPress={() => setPhoto(i)}>
                  <OfflineCover
                    uri={uri}
                    label={`${i + 1}`}
                    style={[styles.thumb, i === photo && styles.thumbOn]}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.pad}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.title}>{item.title}</Text>
          {item.rating_avg != null ? (
            <View style={styles.ratingRow}>
              <Star size={14} color={colors.flame} fill={colors.flame} strokeWidth={0} />
              <Text style={styles.ratingText}>
                {item.rating_avg.toFixed(1)}
                {item.rating_count ? ` · ${item.rating_count} ${t("shop.reviews")}` : ""}
              </Text>
            </View>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatListing(item.price_amount, item.price_currency)}
            </Text>
            {item.compare_at ? (
              <Text style={styles.compare}>
                {formatListing(item.compare_at, item.price_currency)}
              </Text>
            ) : null}
          </View>

          {item.free_shipping ? (
            <View style={styles.shipRow}>
              <Truck size={14} color={colors.viridian} strokeWidth={2.2} />
              <Text style={styles.shipText}>{t("shop.freeShip")}</Text>
            </View>
          ) : null}

          <Text style={styles.desc}>{item.description}</Text>

          <Text style={styles.label}>{t("shop.size")}</Text>
          <View style={styles.chipRow}>
            {sizes.map((s) => (
              <Chip key={s} label={s} selected={(size || item.size_label) === s} onPress={() => setSize(s)} />
            ))}
          </View>

          <Text style={styles.label}>{t("shop.color")}</Text>
          <View style={styles.chipRow}>
            {colorsList.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={(color || item.color_label) === c}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <View style={styles.specs}>
            <Row label={t("shop.conditionLabel")} value={t(`shop.condition.${item.condition}`)} />
            <Row label={t("shop.catsLabel")} value={t(`shop.cats.${item.category}`)} />
            <Row
              label={t("shop.stockLabel")}
              value={
                item.stock_qty > 0
                  ? t("shop.stock", { count: item.stock_qty })
                  : t("shop.outOfStock")
              }
            />
          </View>

          {shop ? (
            <Pressable
              style={styles.storeCard}
              onPress={() => router.push(`/shop-store/${shop.id}`)}
            >
              <View style={styles.storeTop}>
                <Text style={styles.storeName}>{shop.name}</Text>
                {shop.verified ? (
                  <View style={styles.verified}>
                    <ShieldCheck size={12} color={colors.flame} strokeWidth={2.4} />
                    <Text style={styles.verifiedText}>{t("shop.verified")}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.storeBio} numberOfLines={2}>
                {shop.bio}
              </Text>
              {shop.rating_avg != null ? (
                <Text style={styles.storeMeta}>
                  ★ {shop.rating_avg.toFixed(1)}
                  {shop.followers ? ` · ${shop.followers} ${t("shop.followers")}` : ""}
                </Text>
              ) : null}
            </Pressable>
          ) : null}

          <Button
            label={t("shop.contact")}
            onPress={() => Alert.alert(t("shop.contactTitle"), t("shop.contactBody"))}
          />
          <Button
            label={t("shop.viewStore")}
            variant="soft"
            onPress={() => router.push(`/shop-store/${item.shop_id}`)}
          />
        </View>

        {similar.length > 0 ? (
          <View>
            <Text style={styles.similarTitle}>{t("shop.similar")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarRow}
            >
              {similar.map((g) => (
                <Pressable
                  key={g.id}
                  style={styles.similarCard}
                  onPress={() => router.push(`/shop/${g.id}`)}
                >
                  <OfflineCover uri={g.cover_url} label={g.title} style={styles.similarCover} />
                  <Text style={styles.similarPrice} numberOfLines={1}>
                    {formatListing(g.price_amount, g.price_currency)}
                  </Text>
                  <Text style={styles.similarName} numberOfLines={2}>
                    {g.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.xl * 2, gap: space.md },
  cover: { width: W, height: 360, borderRadius: 0 },
  coverBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discPill: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
    backgroundColor: colors.flame,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  thumbs: { paddingHorizontal: space.lg, gap: 8, paddingTop: space.sm },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbOn: { borderColor: colors.flame },
  pad: { paddingHorizontal: space.lg, gap: space.sm },
  brand: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkMuted },
  title: { fontFamily: fonts.displayMed, fontSize: 22, color: colors.ink },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { fontFamily: fonts.display, fontSize: 22, color: colors.flameDeep },
  compare: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textDecorationLine: "line-through",
  },
  shipRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  shipText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.viridian },
  desc: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted, lineHeight: 22 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specs: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
    marginTop: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.inkFaint },
  rowValue: { fontFamily: fonts.bodyMed, fontSize: 14, color: colors.ink },
  storeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 4,
    ...shadow.soft,
  },
  storeTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  storeName: { flex: 1, fontFamily: fonts.displayMed, fontSize: 16, color: colors.ink },
  verified: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.flame },
  storeBio: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted },
  storeMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint },
  similarTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: space.lg,
  },
  similarRow: { paddingHorizontal: space.lg, gap: 10 },
  similarCard: {
    width: 128,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  similarCover: { width: 128, height: 120 },
  similarPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 12,
    color: colors.flameDeep,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  similarName: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  muted: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
