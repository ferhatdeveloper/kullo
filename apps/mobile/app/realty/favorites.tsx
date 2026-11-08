import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { RealtyCard } from "../../components/RealtyCard";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { useRealtyFavorites } from "../../lib/realty-favorites-store";
import { colors, fonts, radius, space } from "../../lib/theme";

export default function RealtyFavoritesScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const realty = useMarketplaceStore((s) => s.realty);
  const hydrate = useRealtyFavorites((s) => s.hydrate);
  const ids = useRealtyFavorites((s) => s.ids);
  const toggle = useRealtyFavorites((s) => s.toggle);
  const has = useRealtyFavorites((s) => s.has);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const items = useMemo(
    () => realty.filter((l) => ids.includes(l.id)),
    [realty, ids],
  );

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={t("realty.favorites")} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Heart size={36} color={colors.inkFaint} />
            <Text style={styles.emptyText}>{t("realty.favoritesEmpty")}</Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => router.replace("/(tabs)/realty")}
            >
              <Text style={styles.ctaText}>{t("realty.browse")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <RealtyCard
              key={item.id}
              item={item}
              variant="feed"
              favorited={has(item.id)}
              priceLabel={formatListing(item.price_amount, item.price_currency)}
              saleLabel={t("realty.offer.sale")}
              rentLabel={t("realty.offer.rent")}
              hotLabel={t("realty.hot")}
              typeLabel={t(`realty.kinds.${item.kind}`)}
              onPress={() => router.push(`/realty/${item.id}`)}
              onFavorite={() => void toggle(item.id)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl * 2,
  },
  empty: {
    alignItems: "center",
    gap: space.md,
    marginTop: space.xl * 2,
    paddingHorizontal: space.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkFaint,
    textAlign: "center",
  },
  cta: {
    marginTop: space.sm,
    backgroundColor: colors.flame,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
});
