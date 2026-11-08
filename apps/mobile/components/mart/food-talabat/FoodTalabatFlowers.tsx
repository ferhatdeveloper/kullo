/**
 * Çiçek hub — tüm çiçekler, hediyelik, çiçekçiler + sepete ekle / cart bar.
 */
import { router } from "expo-router";
import { ChevronLeft, Minus, Plus, ShoppingBag, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../OfflineCover";
import { useCurrencyStore } from "../../../lib/currency-store";
import {
  FLOWER_GIFTS as GIFTS,
  FLOWERS,
  FLOWERS_STORE_ID,
  FLORISTS,
} from "../../../lib/flowers-catalog";
import { useFoodCartStore } from "../../../lib/food-cart-store";
import { TB, tbStyles as s } from "./mart-food-talabat.styles";

type Tab = "flowers" | "gifts" | "stores";

export type { FlowerProduct, FloristStore } from "../../../lib/flowers-catalog";
export { FLOWERS, FLORISTS };

type Props = {
  onBack?: () => void;
  onGoCart?: () => void;
};

export function FoodTalabatFlowers({ onBack, onGoCart }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const add = useFoodCartStore((st) => st.add);
  const setQty = useFoodCartStore((st) => st.setQty);
  const lines = useFoodCartStore((st) => st.lines);
  const [tab, setTab] = useState<Tab>("flowers");
  const [sheetItem, setSheetItem] = useState<FlowerProduct | null>(null);
  const [sheetQty, setSheetQty] = useState(1);

  const storeName = t("food.flowersStoreName", { defaultValue: "Kullo Çiçek" });
  const cartFor = lines.filter((l) => l.restaurantId === FLOWERS_STORE_ID);
  const cartCount = cartFor.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cartFor.reduce((n, l) => n + l.unitPriceIqd * l.qty, 0);
  const bagCount = lines.reduce((n, l) => n + l.qty, 0);

  const tabs = useMemo(
    () =>
      [
        { key: "flowers" as const, label: t("food.flowersAll", { defaultValue: "Tüm çiçekler" }) },
        { key: "gifts" as const, label: t("food.flowersGifts", { defaultValue: "Hediyelik" }) },
        { key: "stores" as const, label: t("food.flowersStores", { defaultValue: "Çiçekçiler" }) },
      ] as const,
    [t],
  );

  const products = tab === "gifts" ? GIFTS : FLOWERS;

  const ensureAdd = async (item: FlowerProduct, qty = 1) => {
    if (lines.length && lines[0]?.restaurantId !== FLOWERS_STORE_ID) {
      Alert.alert(t("food.replaceCartTitle"), t("food.replaceCartBody"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: () => {
            void (async () => {
              await add(
                {
                  restaurantId: FLOWERS_STORE_ID,
                  restaurantName: storeName,
                  itemId: item.id,
                  name: t(item.nameKey),
                  unitPriceIqd: item.price_iqd,
                },
                qty,
              );
            })();
          },
        },
      ]);
      return;
    }
    await add(
      {
        restaurantId: FLOWERS_STORE_ID,
        restaurantName: storeName,
        itemId: item.id,
        name: t(item.nameKey),
        unitPriceIqd: item.price_iqd,
      },
      qty,
    );
  };

  const openSheet = (item: FlowerProduct) => {
    const line = cartFor.find((l) => l.itemId === item.id);
    setSheetQty(line?.qty ?? 1);
    setSheetItem(item);
  };

  const confirmSheet = async () => {
    if (!sheetItem) return;
    const line = cartFor.find((l) => l.itemId === sheetItem.id);
    if (line) {
      await setQty(sheetItem.id, sheetQty);
    } else {
      await ensureAdd(sheetItem, sheetQty);
    }
    setSheetItem(null);
  };

  const goCart = () => {
    if (onGoCart) onGoCart();
    else router.push("/food-cart");
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 4) }]}>
      <View style={s.listHead}>
        <View style={s.listNavRow}>
          <Pressable
            style={s.circleBtn}
            onPress={() => (onBack ? onBack() : router.back())}
            hitSlop={6}
          >
            <ChevronLeft size={20} color={TB.ink} strokeWidth={2.3} />
          </Pressable>
          <View style={s.listDeliver}>
            <Text style={s.listDeliverAddr}>{t("food.hubFlowers")}</Text>
            <Text style={s.listDeliverLabel}>
              {t("food.flowersSub", { defaultValue: "Çiçek, hediye ve çiçekçi mağazaları" })}
            </Text>
          </View>
          <Pressable style={s.circleBtn} onPress={goCart} hitSlop={6}>
            <ShoppingBag size={18} color={TB.ink} strokeWidth={2.2} />
            {bagCount > 0 ? (
              <View style={s.bagBadge}>
                <Text style={s.bagBadgeText}>{bagCount > 9 ? "9+" : bagCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={s.flowerTabRow}>
        {tabs.map((x) => {
          const on = tab === x.key;
          return (
            <Pressable
              key={x.key}
              style={[s.flowerTab, on && s.flowerTabOn]}
              onPress={() => setTab(x.key)}
            >
              <Text style={[s.flowerTabText, on && s.flowerTabTextOn]}>{x.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: (cartCount > 0 ? 120 : 28) + insets.bottom,
        }}
      >
        {tab === "stores" ? (
          FLORISTS.map((store) => (
            <Pressable key={store.id} style={s.floristCard} onPress={() => setTab("flowers")}>
              <View style={s.floristThumb}>
                <OfflineCover
                  uri={store.uri}
                  label={t(store.nameKey)}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View style={s.floristBody}>
                <Text style={s.floristName}>{t(store.nameKey)}</Text>
                <Text style={s.floristMeta}>
                  ★ {store.rating.toFixed(1)} · {store.eta_min}–{store.eta_min + 15} {t("food.min")}
                </Text>
                <View style={s.floristTag}>
                  <Text style={s.floristTagText}>
                    {t("food.floristOpen", { defaultValue: "Açık · Çiçekçi" })}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={s.flowerGrid}>
            {products.map((p) => {
              const line = cartFor.find((l) => l.itemId === p.id);
              return (
                <Pressable key={p.id} style={s.flowerCard} onPress={() => openSheet(p)}>
                  <View style={s.flowerCardImg}>
                    <OfflineCover
                      uri={p.uri}
                      label={t(p.nameKey)}
                      style={{ width: "100%", height: "100%" }}
                    />
                    {line ? (
                      <Pressable style={s.menuQty} onPress={() => openSheet(p)}>
                        <Text style={s.menuQtyText}>{line.qty}</Text>
                      </Pressable>
                    ) : (
                      <Pressable style={s.menuAdd} onPress={() => void ensureAdd(p)}>
                        <Plus size={18} color={TB.white} strokeWidth={2.6} />
                      </Pressable>
                    )}
                  </View>
                  <Text style={s.flowerCardName} numberOfLines={2}>
                    {t(p.nameKey)}
                  </Text>
                  <Text style={s.flowerCardPrice}>{formatListing(p.price_iqd, "IQD")}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {cartCount > 0 ? (
        <View style={[s.cartBarWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable style={s.cartBar} onPress={goCart}>
            <View style={s.cartBarBadge}>
              <Text style={s.cartBarBadgeText}>{cartCount}</Text>
            </View>
            <Text style={s.cartBarLabel}>
              {t("food.viewCartBar", { defaultValue: "View cart" })}
            </Text>
            <Text style={s.cartBarTotal}>{formatListing(cartTotal, "IQD")}</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={!!sheetItem}
        animationType="slide"
        transparent
        onRequestClose={() => setSheetItem(null)}
      >
        <View style={s.sheetBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setSheetItem(null)} />
          {sheetItem ? (
            <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 8) }]}>
              <Pressable style={s.sheetClose} onPress={() => setSheetItem(null)}>
                <X size={18} color={TB.ink} strokeWidth={2.4} />
              </Pressable>
              <OfflineCover uri={sheetItem.uri} label={t(sheetItem.nameKey)} style={s.sheetImg} />
              <View style={s.sheetBody}>
                <Text style={s.sheetTitle}>{t(sheetItem.nameKey)}</Text>
                <Text style={s.sheetSub}>
                  {t(sheetItem.descKey, {
                    defaultValue: t("food.flowersSub"),
                  })}
                </Text>
              </View>
              <View style={s.sheetFooter}>
                <View style={s.qtyPill}>
                  <Pressable
                    style={s.qtyBtn}
                    onPress={() => setSheetQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={18} color={TB.ink} strokeWidth={2.4} />
                  </Pressable>
                  <Text style={s.qtyNum}>{sheetQty}</Text>
                  <Pressable style={s.qtyBtn} onPress={() => setSheetQty((q) => q + 1)}>
                    <Plus size={18} color={TB.ink} strokeWidth={2.6} />
                  </Pressable>
                </View>
                <Pressable style={s.addItemBtn} onPress={() => void confirmSheet()}>
                  <Text style={s.addItemText}>
                    {t("food.addItem", { defaultValue: "Add item" })}
                  </Text>
                  <Text style={s.addItemText}>
                    {formatListing(sheetItem.price_iqd * sheetQty, "IQD")}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
