import { router } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { Screen, ScreenHeader } from "../components/ui/Screen";
import { useCurrencyStore } from "../lib/currency-store";
import { DEMO_RESTAURANTS } from "../lib/demo-data";
import { useFoodCartStore } from "../lib/food-cart-store";
import { useMarketplaceStore } from "../lib/marketplace-store";
import { useWalletStore } from "../lib/wallet-store";
import { colors, fonts, radius, space } from "../lib/theme";

type Pay = "cash" | "wallet";

const STATUS_FLOW = [
  "pending",
  "accepted",
  "preparing",
  "on_the_way",
  "delivered",
] as const;

export default function FoodCartScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const lines = useFoodCartStore((s) => s.lines);
  const setQty = useFoodCartStore((s) => s.setQty);
  const clear = useFoodCartStore((s) => s.clear);
  const subtotal = useFoodCartStore((s) => s.subtotal);
  const spend = useWalletStore((s) => s.spend);
  const getRestaurant = useMarketplaceStore((s) => s.getRestaurant);
  const [address, setAddress] = useState("Erbil, Ankawa");
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<Pay>("cash");
  const [submitting, setSubmitting] = useState(false);

  const restaurant = useMemo(() => {
    const id = lines[0]?.restaurantId;
    if (!id) return undefined;
    return getRestaurant(id) ?? DEMO_RESTAURANTS.find((r) => r.id === id);
  }, [lines, getRestaurant]);


  const deliveryFee = restaurant?.delivery_fee_iqd ?? 0;
  const total = subtotal() + deliveryFee;
  const belowMin =
    restaurant != null && subtotal() > 0 && subtotal() < restaurant.min_order_iqd;

  const placeOrder = async () => {
    if (!lines.length || !restaurant) {
      Alert.alert(t("food.cartEmptyTitle"), t("food.cartEmptyBody"));
      return;
    }
    if (!address.trim()) {
      Alert.alert(t("food.addressRequired"));
      return;
    }
    if (belowMin) {
      Alert.alert(
        t("food.minOrderTitle"),
        t("food.minOrderBody", {
          amount: formatListing(restaurant.min_order_iqd, "IQD"),
        }),
      );
      return;
    }
    if (pay === "wallet") {
      const result = await spend(total);
      if (!result.ok) {
        Alert.alert(
          t("food.needFunds"),
          t("food.needFundsBody", { need: formatListing(result.need, "IQD") }),
        );
        return;
      }
    }

    setSubmitting(true);
    setTimeout(async () => {
      setSubmitting(false);
      await clear();
      const flow = STATUS_FLOW.map((s) => t(`food.status.${s}`)).join(" → ");
      Alert.alert(t("food.orderedTitle"), t("food.orderedBody", { flow, total: formatListing(total, "IQD") }), [
        {
          text: t("common.done"),
          onPress: () =>
            router.replace({ pathname: "/(tabs)/mart", params: { martPane: "cart" } }),
        },
      ]);
    }, 700);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("food.cartTitle")}
        subtitle={restaurant?.name}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!lines.length ? (
          <Text style={styles.empty}>{t("food.cartEmptyBody")}</Text>
        ) : (
          <>
            {lines.map((line) => (
              <View key={line.itemId} style={styles.line}>
                <View style={styles.flex}>
                  <Text style={styles.lineName}>{line.name}</Text>
                  <Text style={styles.linePrice}>
                    {formatListing(line.unitPriceIqd * line.qty, "IQD")}
                  </Text>
                </View>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => void setQty(line.itemId, line.qty - 1)}
                  >
                    <Minus size={16} color={colors.ink} />
                  </Pressable>
                  <Text style={styles.qty}>{line.qty}</Text>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => void setQty(line.itemId, line.qty + 1)}
                  >
                    <Plus size={16} color={colors.ink} />
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={styles.label}>{t("food.deliveryAddress")}</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={colors.inkFaint}
            />
            <Text style={styles.label}>{t("food.note")}</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder={t("food.notePlaceholder")}
              placeholderTextColor={colors.inkFaint}
            />

            <Text style={styles.label}>{t("food.payment")}</Text>
            <View style={styles.row}>
              <Chip
                label={t("food.payCash")}
                selected={pay === "cash"}
                onPress={() => setPay("cash")}
              />
              <Chip
                label={t("food.payWallet")}
                selected={pay === "wallet"}
                onPress={() => setPay("wallet")}
              />
            </View>

            <View style={styles.totals}>
              <Row
                label={t("food.subtotal")}
                value={formatListing(subtotal(), "IQD")}
              />
              <Row
                label={t("food.delivery")}
                value={formatListing(deliveryFee, "IQD")}
              />
              <Row
                label={t("food.total")}
                value={formatListing(total, "IQD")}
                strong
              />
            </View>

            {belowMin ? (
              <Text style={styles.warn}>
                {t("food.minOrderBody", {
                  amount: formatListing(restaurant!.min_order_iqd, "IQD"),
                })}
              </Text>
            ) : null}

            <Text style={styles.demoNote}>{t("food.demoNote")}</Text>

            <Button
              label={t("food.placeOrder")}
              onPress={() => void placeOrder()}
              loading={submitting}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
  },
  flex: { flex: 1, gap: 2 },
  lineName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink },
  linePrice: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaint },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    minWidth: 18,
    textAlign: "center",
    color: colors.ink,
  },
  label: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.inkFaint },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  totals: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted },
  totalValue: { fontFamily: fonts.bodyMed, fontSize: 14, color: colors.ink },
  strong: { fontFamily: fonts.displayMed, fontSize: 16, color: colors.ink },
  warn: { fontFamily: fonts.body, fontSize: 13, color: colors.danger },
  demoNote: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint },
});
