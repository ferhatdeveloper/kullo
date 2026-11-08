/**
 * Food Ana — JSMastery food_ordering home+search IA.
 * Ref: https://github.com/adrianhajdin/food_ordering (open source; no LICENSE file).
 * Address pin stays on AppHeader — no Deliver To chrome here.
 */
import { router } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, Text, View } from "react-native";

import { useCityStore } from "../../../lib/city-store";
import { useCurrencyStore } from "../../../lib/currency-store";
import { useDeliveryAddressStore } from "../../../lib/delivery-address-store";
import { useFoodCartStore } from "../../../lib/food-cart-store";
import { useMarketplaceStore } from "../../../lib/marketplace-store";
import { OrderingCategoryFilter } from "./CategoryFilter";
import { OrderingOfferCard } from "./OfferCard";
import { OrderingRestaurantCard } from "./RestaurantMenuCard";
import { OrderingSearchBar } from "./SearchBar";
import {
  FO,
  OFFER_COLORS,
  foStyles as styles,
} from "./mart-food-ordering.styles";

const CUISINE = [
  { key: "all", labelKey: "food.cuisineAll", match: null as string | null },
  { key: "local", labelKey: "food.cuisineLocal", match: "kürt|irak|yerel|local|middle" },
  { key: "pizza", labelKey: "food.cuisinePizza", match: "pizza|ital" },
  { key: "burger", labelKey: "food.cuisineBurger", match: "burger" },
  { key: "fast", labelKey: "food.cuisineFast", match: "fast|shawarma|kebab" },
  { key: "coffee", labelKey: "food.hubCoffee", match: "kahve|coffee|cafe" },
  { key: "sweets", labelKey: "food.hubSweets", match: "tatlı|sweet|dessert" },
  {
    key: "market",
    labelKey: "mart.navMarket",
    match: null as string | null,
    goMarket: true,
  },
] as const;

type Props = {
  onGoMarket?: () => void;
  onGoCart?: () => void;
};

type Rest = ReturnType<typeof useMarketplaceStore.getState>["restaurants"][0];

export function FoodOrderingHome({ onGoMarket, onGoCart }: Props) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const city = useCityStore((s) => s.city);
  const deliveryCity = useDeliveryAddressStore((s) => {
    const a = s.addresses.find((x) => x.id === s.selectedId);
    return a?.city ?? null;
  });
  const restaurants = useMarketplaceStore((s) => s.restaurants);
  const cartLines = useFoodCartStore((s) => s.lines);
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("all");

  const cartCount = cartLines.reduce((n, l) => n + l.qty, 0);
  const scopeCity = city !== "all" ? city : deliveryCity;

  const cuisineMatch = useMemo(() => {
    const tile = CUISINE.find((c) => c.key === cuisine);
    return tile?.match ?? null;
  }, [cuisine]);

  const data = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const filterOne = (r: Rest) => {
      if (!r.is_open) return false;
      if (qq && !`${r.name} ${r.cuisine}`.toLowerCase().includes(qq)) return false;
      if (cuisineMatch) {
        const hay = `${r.name} ${r.cuisine}`.toLowerCase();
        if (!new RegExp(cuisineMatch, "i").test(hay)) return false;
      }
      return true;
    };
    let list = restaurants.filter((r) => {
      if (scopeCity && r.city !== scopeCity) return false;
      return filterOne(r);
    });
    if (list.length === 0 && scopeCity) {
      list = restaurants.filter(filterOne);
    }
    return list;
  }, [restaurants, scopeCity, q, cuisineMatch]);

  const offers = useMemo(() => {
    const ranked = [...data].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 4);
    return ranked.map((r, i) => ({
      id: r.id,
      title: r.name.toUpperCase(),
      coverUrl: r.cover_url,
      color: OFFER_COLORS[i % OFFER_COLORS.length],
    }));
  }, [data]);

  const pairs = useMemo(() => {
    const out: Rest[][] = [];
    for (let i = 0; i < data.length; i += 2) {
      out.push(data.slice(i, i + 2));
    }
    return out;
  }, [data]);

  const categories = CUISINE.map((c) => ({
    key: c.key,
    label: t(c.labelKey),
    goMarket: "goMarket" in c && !!c.goMarket,
  }));

  const onChip = (key: string, goMarket?: boolean) => {
    if (goMarket) {
      onGoMarket?.();
      return;
    }
    setCuisine(key);
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>
            {t("food.orderingEyebrow", { defaultValue: "Yemek" })}
          </Text>
          <Text style={styles.title}>
            {t("food.orderingTitle", { defaultValue: "Favori lezzetini bul" })}
          </Text>
        </View>
        <Pressable style={styles.cartBtn} onPress={() => onGoCart?.()}>
          <ShoppingBag size={18} color={FO.white} strokeWidth={2.3} />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 9 ? "9+" : cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <OrderingSearchBar
        value={q}
        onChangeText={setQ}
        placeholder={t("food.searchHome")}
      />

      <OrderingCategoryFilter
        categories={categories}
        active={cuisine}
        onSelect={onChip}
      />

      {offers.length > 0 ? (
        <View style={styles.offersBlock}>
          {offers.map((o, i) => (
            <OrderingOfferCard
              key={o.id}
              title={o.title}
              coverUrl={o.coverUrl}
              color={o.color}
              reverse={i % 2 === 0}
              onPress={() => router.push(`/food/${o.id}`)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.sectionHead}>
        <Text style={styles.section}>{t("food.allRestaurants")}</Text>
        <Text style={styles.countHint}>
          {t("servicesHub.count", { count: data.length })}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.root}
      data={pairs}
      keyExtractor={(row) => row.map((r) => r.id).join("-")}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>{t("food.empty")}</Text>}
      renderItem={({ item: row }) => (
        <View style={styles.gridRow}>
          {row.map((r, col) => (
            <OrderingRestaurantCard
              key={r.id}
              name={r.name}
              coverUrl={r.cover_url}
              meta={`${r.rating_avg.toFixed(1)} · ${r.eta_min}–${r.eta_min + 15} ${t("food.min")} · ${formatListing(r.delivery_fee_iqd, "IQD")}`}
              cta={t("food.orderingOpen", { defaultValue: "Menüye git →" })}
              offset={col === 1}
              onPress={() => router.push(`/food/${r.id}`)}
            />
          ))}
          {row.length === 1 ? <View style={{ width: FO.menuCardW }} /> : null}
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
