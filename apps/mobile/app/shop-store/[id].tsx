import { router, useLocalSearchParams } from "expo-router";
import { ShieldCheck, Star } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { OfflineCover } from "../../components/OfflineCover";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function ShopStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const shop = useMarketplaceStore((s) => s.getShop(id ?? ""));
  const goods = useMarketplaceStore((s) => s.goods);
  const items = useMemo(
    () => goods.filter((g) => g.shop_id === id),
    [goods, id],
  );

  if (!shop) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("shop.stores")} onBack={() => router.back()} />
        <Text style={styles.muted}>{t("shop.emptyShops")}</Text>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={shop.name} subtitle={shop.city} onBack={() => router.back()} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <OfflineCover uri={shop.cover_url} label={shop.name} style={styles.cover} />
            <View style={styles.metaRow}>
              {shop.verified ? (
                <View style={styles.verified}>
                  <ShieldCheck size={13} color={colors.flame} strokeWidth={2.4} />
                  <Text style={styles.verifiedText}>{t("shop.verified")}</Text>
                </View>
              ) : null}
              {shop.rating_avg != null ? (
                <View style={styles.rating}>
                  <Star size={12} color={colors.flame} fill={colors.flame} strokeWidth={0} />
                  <Text style={styles.ratingText}>{shop.rating_avg.toFixed(1)}</Text>
                </View>
              ) : null}
              {shop.followers != null ? (
                <Text style={styles.followers}>
                  {shop.followers} {t("shop.followers")}
                </Text>
              ) : null}
            </View>
            <Text style={styles.bio}>{shop.bio}</Text>
            <Text style={styles.section}>
              {t("shop.items")} · {items.length}
            </Text>
          </View>
        }
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/shop/${item.id}`)}>
            <OfflineCover uri={item.cover_url} label={item.title} style={styles.thumb} />
            {item.discount_pct ? (
              <Text style={styles.disc}>-%{item.discount_pct}</Text>
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.meta}>
              {item.size_label} · {t(`shop.condition.${item.condition}`)}
            </Text>
            <Text style={styles.price}>
              {formatListing(item.price_amount, item.price_currency)}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, marginBottom: space.md },
  cover: { width: "100%", height: 180, borderRadius: radius.lg },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  verified: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.flame },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.ink },
  followers: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint },
  bio: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, lineHeight: 20 },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginTop: space.sm,
  },
  list: { paddingBottom: space.xl * 2 },
  grid: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  thumb: { width: "100%", height: 140, borderRadius: 0 },
  disc: {
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
  title: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    paddingHorizontal: 8,
    paddingTop: 8,
    minHeight: 36,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    paddingHorizontal: 8,
  },
  price: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.flameDeep,
    paddingHorizontal: 8,
    paddingBottom: 10,
    marginTop: 2,
  },
  muted: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
