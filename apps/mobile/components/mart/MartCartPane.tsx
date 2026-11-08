import { router } from "expo-router";
import { Minus, Plus, ShoppingBasket, UtensilsCrossed } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MART_MIN_ORDER_IQD } from "../../lib/mart-catalog";
import { useMartCartStore } from "../../lib/mart-cart-store";
import { useCurrencyStore } from "../../lib/currency-store";
import { useFoodCartStore } from "../../lib/food-cart-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type Props = {
  onGoMarket?: () => void;
  onGoFood?: () => void;
};

/** Birleşik Sepet — Market | Food bölümleri */
export function MartCartPane({ onGoMarket, onGoFood }: Props) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);

  const martLines = useMartCartStore((s) => s.lines);
  const setMartQty = useMartCartStore((s) => s.setQty);
  const martSub = useMartCartStore((s) => s.subtotal);

  const foodLines = useFoodCartStore((s) => s.lines);
  const setFoodQty = useFoodCartStore((s) => s.setQty);
  const foodSub = useFoodCartStore((s) => s.subtotal);

  const martTotal = martSub();
  const foodTotal = foodSub();
  const remain = Math.max(0, MART_MIN_ORDER_IQD - martTotal);
  const empty = martLines.length === 0 && foodLines.length === 0;

  if (empty) {
    return (
      <View style={styles.emptyWrap}>
        <ShoppingBasket size={40} color={colors.inkFaint} strokeWidth={1.8} />
        <Text style={styles.emptyTitle}>{t("mart.cartEmptyTitle")}</Text>
        <Text style={styles.emptyBody}>{t("mart.cartEmptyBody")}</Text>
        <View style={styles.emptyActions}>
          <Pressable
            style={styles.cta}
            onPress={() => onGoMarket?.()}
          >
            <Text style={styles.ctaText}>{t("mart.browseMarket")}</Text>
          </Pressable>
          <Pressable
            style={[styles.cta, styles.ctaGhost]}
            onPress={() => onGoFood?.()}
          >
            <Text style={[styles.ctaText, styles.ctaGhostText]}>{t("mart.browseFood")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {martLines.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <ShoppingBasket size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>{t("mart.cartMarket")}</Text>
            <Text style={styles.sectionSum}>{formatListing(martTotal, "IQD")}</Text>
          </View>
          {martLines.map((l) => (
            <View key={l.productId} style={styles.row}>
              {l.imageUri ? (
                <Image source={{ uri: l.imageUri }} style={styles.thumb} resizeMode="contain" />
              ) : (
                <View style={[styles.thumb, styles.thumbPh]} />
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowName} numberOfLines={2}>
                  {l.name}
                </Text>
                <Text style={styles.rowPrice}>
                  {formatListing(l.unitPriceIqd * l.qty, "IQD")}
                </Text>
              </View>
              <View style={styles.qty}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => void setMartQty(l.productId, l.qty - 1)}
                >
                  <Minus size={14} color={colors.ink} strokeWidth={2.4} />
                </Pressable>
                <Text style={styles.qtyN}>{l.qty}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => void setMartQty(l.productId, l.qty + 1)}
                >
                  <Plus size={14} color={colors.ink} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>
          ))}
          {remain > 0 ? (
            <Text style={styles.minWarn}>
              {t("mart.minOrderRemain", { amount: formatListing(remain, "IQD") })}
            </Text>
          ) : (
            <Text style={styles.minOk}>{t("mart.minOrderMet")}</Text>
          )}
          <Pressable
            style={[styles.checkout, remain > 0 && styles.checkoutDisabled]}
            disabled={remain > 0}
            onPress={() => {}}
          >
            <Text style={styles.checkoutText}>{t("mart.checkoutMarket")}</Text>
          </Pressable>
        </View>
      ) : null}

      {foodLines.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <UtensilsCrossed size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>{t("mart.cartFood")}</Text>
            <Text style={styles.sectionSum}>{formatListing(foodTotal, "IQD")}</Text>
          </View>
          <Text style={styles.restName}>{foodLines[0]?.restaurantName}</Text>
          {foodLines.map((l) => (
            <View key={l.itemId} style={styles.row}>
              <View style={[styles.thumb, styles.thumbPh]} />
              <View style={styles.rowBody}>
                <Text style={styles.rowName} numberOfLines={2}>
                  {l.name}
                </Text>
                <Text style={styles.rowPrice}>
                  {formatListing(l.unitPriceIqd * l.qty, "IQD")}
                </Text>
              </View>
              <View style={styles.qty}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => void setFoodQty(l.itemId, l.qty - 1)}
                >
                  <Minus size={14} color={colors.ink} strokeWidth={2.4} />
                </Pressable>
                <Text style={styles.qtyN}>{l.qty}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => void setFoodQty(l.itemId, l.qty + 1)}
                >
                  <Plus size={14} color={colors.ink} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>
          ))}
          <Pressable style={styles.checkout} onPress={() => router.push("/food-cart")}>
            <Text style={styles.checkoutText}>{t("mart.checkoutFood")}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl * 2, gap: space.md },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: space.xl,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    marginTop: 8,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
  },
  emptyActions: { marginTop: 16, gap: 10, width: "100%", maxWidth: 280 },
  cta: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaGhost: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  ctaGhostText: { color: colors.ink },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 10,
    ...shadow.soft,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  sectionSum: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.flameDeep,
  },
  restName: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: -4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.mist,
  },
  thumbPh: { backgroundColor: colors.brandSoft },
  rowBody: { flex: 1, minWidth: 0, gap: 2 },
  rowName: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.ink },
  rowPrice: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  qty: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyN: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
    minWidth: 18,
    textAlign: "center",
  },
  minWarn: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.danger,
  },
  minOk: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.viridian,
  },
  checkout: {
    marginTop: 4,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
  },
  checkoutDisabled: { opacity: 0.45 },
  checkoutText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
});
