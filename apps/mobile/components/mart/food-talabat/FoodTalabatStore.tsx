/**
 * Talabat Store detail + Item sheet (ekran 5+6) — Delivered by Kullo.
 */
import { router } from "expo-router";
import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Info,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Share2,
  Star,
  Ticket,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../OfflineCover";
import { useCurrencyStore } from "../../../lib/currency-store";
import { useFoodCartStore } from "../../../lib/food-cart-store";
import type { DemoMenuItem, DemoRestaurant } from "../../../lib/demo-data";
import { TB, tbStyles as s } from "./mart-food-talabat.styles";

type Props = {
  restaurant: DemoRestaurant;
};

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k+`;
  return String(n);
}

export function FoodTalabatStore({ restaurant }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const add = useFoodCartStore((st) => st.add);
  const setQty = useFoodCartStore((st) => st.setQty);
  const lines = useFoodCartStore((st) => st.lines);
  const [tab, setTab] = useState(0);
  const [sheetItem, setSheetItem] = useState<DemoMenuItem | null>(null);
  const [sheetQty, setSheetQty] = useState(1);

  const cartFor = lines.filter((l) => l.restaurantId === restaurant.id);
  const cartCount = cartFor.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cartFor.reduce((n, l) => n + l.unitPriceIqd * l.qty, 0);
  const remain = Math.max(0, restaurant.min_order_iqd - cartTotal);

  const categories = useMemo(
    () => Array.from(new Set(restaurant.menu.map((m) => m.category))),
    [restaurant.menu],
  );

  const tabs = [
    t("food.orderAgain"),
    t("food.picksForYou", { defaultValue: "Picks for you 🔥" }),
    t("food.offers", { defaultValue: "Offers" }),
    ...categories.slice(0, 2),
  ];

  const orderAgainItems = restaurant.menu.slice(0, 4);
  const picks = [...restaurant.menu].reverse().slice(0, 4);

  const ensureAdd = async (item: DemoMenuItem, qty = 1) => {
    if (!restaurant.is_open) {
      Alert.alert(t("food.closed"), t("food.closedBody"));
      return;
    }
    if (lines.length && lines[0]?.restaurantId !== restaurant.id) {
      Alert.alert(t("food.replaceCartTitle"), t("food.replaceCartBody"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: () => {
            void (async () => {
              for (let i = 0; i < qty; i++) {
                await add({
                  restaurantId: restaurant.id,
                  restaurantName: restaurant.name,
                  itemId: item.id,
                  name: item.name,
                  unitPriceIqd: item.price_iqd,
                });
              }
            })();
          },
        },
      ]);
      return;
    }
    for (let i = 0; i < qty; i++) {
      await add({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        itemId: item.id,
        name: item.name,
        unitPriceIqd: item.price_iqd,
      });
    }
  };

  const openSheet = (item: DemoMenuItem) => {
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

  const renderRail = (items: DemoMenuItem[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
      {items.map((item, i) => {
        const line = cartFor.find((l) => l.itemId === item.id);
        return (
          <Pressable key={item.id} style={s.menuItemCard} onPress={() => openSheet(item)}>
            <View style={s.menuItemImg}>
              <OfflineCover
                uri={restaurant.cover_url}
                label={item.name}
                style={{ width: "100%", height: "100%" }}
              />
              {i === 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: TB.flame,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontFamily: "IBMPlexSans_600SemiBold", fontSize: 10, color: "#fff" }}>
                    {t("food.topRated", { defaultValue: "Top rated" })}
                  </Text>
                </View>
              ) : null}
              {line ? (
                <Pressable style={s.menuQty} onPress={() => openSheet(item)}>
                  <Text style={s.menuQtyText}>{line.qty}</Text>
                </Pressable>
              ) : (
                <Pressable style={s.menuAdd} onPress={() => void ensureAdd(item)}>
                  <Plus size={18} color={TB.white} strokeWidth={2.6} />
                </Pressable>
              )}
            </View>
            <Text style={s.menuItemName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={s.menuItemPrice}>{formatListing(item.price_iqd, "IQD")}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={s.storeRoot}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 120 : 40 }}
      >
        <View style={s.hero}>
          <OfflineCover uri={restaurant.cover_url} label={restaurant.name} style={s.heroImg} />
          <View style={[s.heroActions, { paddingTop: Math.max(insets.top, 8) }]}>
            <Pressable style={s.heroBtn} onPress={() => router.back()} hitSlop={6}>
              <ChevronLeft size={20} color={TB.ink} strokeWidth={2.3} />
            </Pressable>
            <View style={s.heroRight}>
              <Pressable style={s.heroBtn} hitSlop={6}>
                <Heart size={16} color={TB.ink} strokeWidth={2} />
              </Pressable>
              <Pressable style={s.heroBtn} hitSlop={6}>
                <Share2 size={16} color={TB.ink} strokeWidth={2} />
              </Pressable>
              <Pressable style={s.heroBtn} hitSlop={6}>
                <Search size={16} color={TB.ink} strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={s.infoCard}>
          <View style={s.infoLogo}>
            <OfflineCover
              uri={restaurant.cover_url}
              label={restaurant.name}
              style={{ width: 56, height: 56 }}
            />
          </View>
          <View style={s.infoBody}>
            <View style={s.findNameRow}>
              <Text style={s.infoName}>{restaurant.name}</Text>
              <ChevronRight size={18} color={TB.inkFaint} strokeWidth={2.2} />
            </View>
            <View style={s.popularTag}>
              <Text style={s.popularTagText}>
                {t("food.popularIn", {
                  defaultValue: "Popular in {{cuisine}}",
                  cuisine: restaurant.cuisine.split("/")[0]?.trim() ?? restaurant.cuisine,
                })}
              </Text>
            </View>
            <View style={s.findNameRow}>
              <Star size={13} color={TB.star} fill={TB.star} />
              <Text style={[s.restMeta, { color: TB.ink }]}>
                {restaurant.rating_avg.toFixed(1)} ({formatCount(restaurant.rating_count)})
              </Text>
            </View>
            <View style={s.infoMetaRow}>
              <View style={s.infoMetaItem}>
                <Clock size={13} color={TB.inkMuted} strokeWidth={2} />
                <Text style={s.infoMetaText}>
                  {restaurant.eta_min}–{restaurant.eta_min + 10} {t("food.min")}
                </Text>
              </View>
              <View style={s.infoMetaItem}>
                <Bike size={13} color={TB.inkMuted} strokeWidth={2} />
                <Text style={s.infoMetaText}>
                  {formatListing(restaurant.delivery_fee_iqd, "IQD")}
                </Text>
              </View>
              <View style={s.infoMetaItem}>
                <Text style={s.deliveredBy}>
                  {t("food.deliveredBy", { defaultValue: "Delivered by Kullo" })}
                </Text>
                <Info size={12} color={TB.inkFaint} strokeWidth={2} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.hRail, { marginTop: 14 }]}
        >
          <View style={s.voucherCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ticket size={14} color="#2F9B65" strokeWidth={2.2} />
              <Text style={s.voucherTitle} numberOfLines={2}>
                {t("food.voucherItems", {
                  defaultValue: "Up to IQD 22750 off select items",
                })}
              </Text>
            </View>
            <Text style={s.voucherSub}>
              {t("food.noMinSpend", { defaultValue: "No min. spend" })}
            </Text>
            <Text style={s.voucherLink}>
              {t("food.viewItems", { defaultValue: "View items" })}
            </Text>
          </View>
          <View style={s.voucherCard}>
            <Text style={s.voucherTitle} numberOfLines={2}>
              {t("food.voucherBank", {
                defaultValue: "50% off with bank cards",
              })}
            </Text>
            <Text style={s.voucherSub}>
              {t("food.minSpend", {
                defaultValue: "Min spend IQD 12000",
              })}
            </Text>
            <Text style={s.voucherLink}>
              {t("food.moreInfo", { defaultValue: "More info" })}
            </Text>
          </View>
        </ScrollView>

        <View style={s.menuTabs}>
          <Pressable style={{ paddingHorizontal: 8, paddingVertical: 12 }}>
            <Menu size={18} color={TB.ink} strokeWidth={2.2} />
          </Pressable>
          {tabs.map((label, i) => (
            <Pressable
              key={`${label}-${i}`}
              style={[s.menuTab, tab === i && s.menuTabOn]}
              onPress={() => setTab(i)}
            >
              <Text style={[s.menuTabText, tab === i && s.menuTabTextOn]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[s.sectionTitle, { paddingHorizontal: TB.hMargin }]}>
            {t("food.orderAgain")}
          </Text>
          {renderRail(orderAgainItems)}
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={[s.sectionTitle, { paddingHorizontal: TB.hMargin, marginBottom: 4 }]}>
            {t("food.picksForYou", { defaultValue: "Picks for you 🔥" })}
          </Text>
          <Text
            style={{
              paddingHorizontal: TB.hMargin,
              fontFamily: "IBMPlexSans_400Regular",
              fontSize: 13,
              color: TB.inkFaint,
              marginBottom: 12,
            }}
          >
            {t("food.picksSub", { defaultValue: "Trending items we think you'll love" })}
          </Text>
          {renderRail(picks)}
        </View>

        {categories.map((cat) => (
          <View key={cat} style={{ marginTop: 22 }}>
            <Text style={[s.sectionTitle, { paddingHorizontal: TB.hMargin }]}>{cat}</Text>
            {renderRail(restaurant.menu.filter((m) => m.category === cat))}
          </View>
        ))}
      </ScrollView>

      {cartCount > 0 ? (
        <View style={[s.cartBarWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {remain > 0 ? (
            <Text style={s.cartHint}>
              {t("food.addToMin", {
                defaultValue: "Add {{amount}} to start your order.",
                amount: formatListing(remain, "IQD"),
              })}
            </Text>
          ) : null}
          <Pressable style={s.cartBar} onPress={() => router.push("/food-cart")}>
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
              <OfflineCover
                uri={restaurant.cover_url}
                label={sheetItem.name}
                style={s.sheetImg}
              />
              <View style={s.sheetBody}>
                <Text style={s.sheetTitle}>{sheetItem.name}</Text>
                <Text style={s.sheetSub}>{sheetItem.description}</Text>
                <View style={s.sheetNoteRow}>
                  <MessageCircle size={16} color={TB.ink} strokeWidth={2} />
                  <Text style={s.sheetNoteLabel}>
                    {t("food.specialRequests", { defaultValue: "Any special requests?" })}
                  </Text>
                  <Text style={s.sheetNoteBtn}>
                    {t("food.addNote", { defaultValue: "Add note" })}
                  </Text>
                </View>
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
                  <Pressable
                    style={s.qtyBtn}
                    onPress={() => setSheetQty((q) => q + 1)}
                  >
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
