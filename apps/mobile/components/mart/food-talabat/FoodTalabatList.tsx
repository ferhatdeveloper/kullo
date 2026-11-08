/**
 * Talabat Food vertical / restaurant list (ekran 3).
 */
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  Heart,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../OfflineCover";
import { useCityStore } from "../../../lib/city-store";
import { useCurrencyStore } from "../../../lib/currency-store";
import { useDeliveryAddressStore } from "../../../lib/delivery-address-store";
import { useFoodCartStore } from "../../../lib/food-cart-store";
import { useMarketplaceStore } from "../../../lib/marketplace-store";
import { orderAgainImageUri } from "./food-order-again-images";
import { TB, tbStyles as s } from "./mart-food-talabat.styles";

type Props = {
  onBack?: () => void;
  onGoCart?: () => void;
  onOpenSearch?: () => void;
};

type Rest = ReturnType<typeof useMarketplaceStore.getState>["restaurants"][0];

const CUISINES = [
  { key: "fast", label: "Fast Food", match: /fast|shawarma|kebab/i, emoji: "🍟" },
  { key: "grills", label: "Grills", match: /grill|kebab|kürt|irak/i, emoji: "🍢" },
  { key: "burgers", label: "Burgers", match: /burger/i, emoji: "🍔" },
  { key: "sandwiches", label: "Sandwiches", match: /sandwich|shawarma/i, emoji: "🥪" },
  { key: "pizza", label: "Pizza", match: /pizza|ital/i, emoji: "🍕" },
] as const;

const FILTERS = [
  { key: "sort", labelKey: "food.sortBy", icon: "chevron" as const },
  { key: "offers", labelKey: "food.offers", icon: null },
  { key: "rating", labelKey: "food.rating40", icon: null },
  { key: "fast", labelKey: "food.fastDelivery", icon: "rocket" as const },
] as const;

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k+`;
  return String(n);
}

export function FoodTalabatList({ onBack, onGoCart, onOpenSearch }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const city = useCityStore((st) => st.city);
  const selected = useDeliveryAddressStore((st) => {
    const a = st.addresses.find((x) => x.id === st.selectedId);
    return a ?? st.addresses[0];
  });
  const restaurants = useMarketplaceStore((st) => st.restaurants);
  const cartCount = useFoodCartStore((st) => st.lines.reduce((n, l) => n + l.qty, 0));
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const addrLine = selected?.line ?? selected?.city ?? "Erbil";

  const data = useMemo(() => {
    const scopeCity = city !== "all" ? city : selected?.city ?? null;
    let list = [...restaurants];
    if (scopeCity) {
      const f = list.filter((r) => r.city === scopeCity);
      if (f.length) list = f;
    }
    if (cuisine) {
      const c = CUISINES.find((x) => x.key === cuisine);
      if (c) list = list.filter((r) => c.match.test(`${r.name} ${r.cuisine}`));
    }
    if (filter === "rating") list = list.filter((r) => r.rating_avg >= 4);
    if (filter === "offers") list = list.filter((r) => r.is_open);
    if (filter === "fast") list = [...list].sort((a, b) => a.eta_min - b.eta_min);
    return list;
  }, [restaurants, city, selected?.city, cuisine, filter]);

  const again = useMemo(() => data.filter((r) => r.is_open).slice(0, 5), [data]);

  const goRest = (id: string) => router.push(`/food/${id}`);

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 4) }]}>
      <View style={s.listHead}>
        <View style={s.listNavRow}>
          <Pressable style={s.circleBtn} onPress={onBack} hitSlop={6}>
            <ChevronLeft size={20} color={TB.ink} strokeWidth={2.3} />
          </Pressable>
          <View style={s.listDeliver}>
            <Text style={s.listDeliverLabel}>{t("food.deliverTo")}</Text>
            <Text style={s.listDeliverAddr} numberOfLines={1}>
              {addrLine}
            </Text>
          </View>
          <Pressable style={s.circleBtn} hitSlop={6}>
            <Heart size={18} color={TB.ink} strokeWidth={2} />
          </Pressable>
          <Pressable style={s.circleBtn} onPress={() => onGoCart?.()} hitSlop={6}>
            <ShoppingBag size={18} color={TB.ink} strokeWidth={2.2} />
            {cartCount > 0 ? (
              <View style={s.bagBadge}>
                <Text style={s.bagBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        <Pressable style={s.listSearch} onPress={() => onOpenSearch?.()}>
          <Search size={18} color={TB.inkFaint} strokeWidth={2.2} />
          <Text style={s.searchPh}>
            {t("food.searchRestaurants", { defaultValue: "Search for restaurants" })}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 72 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: TB.hMargin, paddingBottom: 8 }}
        >
          <Pressable style={[s.promoChip, { backgroundColor: TB.beige }]}>
            <Sparkles size={16} color={TB.flame} strokeWidth={2.4} />
            <Text style={[s.promoChipTitle, { color: TB.flame }]}>{t("food.newFinds")}</Text>
          </Pressable>
          <Pressable style={[s.promoChip, { backgroundColor: TB.ink }]}>
            <Text style={s.promoChipTitle}>FLASH SALE{"\n"}50% off</Text>
          </Pressable>
          <Pressable style={[s.promoChip, { backgroundColor: TB.inkMuted }]}>
            <Text style={s.promoChipTitle}>Best sellers{"\n"}30% off</Text>
          </Pressable>
        </ScrollView>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>{t("food.orderAgain")}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
          {again.map((r, i) => (
            <Pressable key={r.id} style={s.brandCard} onPress={() => goRest(r.id)}>
              <OfflineCover
                uri={orderAgainImageUri(i, r.cover_url)}
                label={r.name}
                style={s.brandImg}
              />
              {i === 0 ? (
                <View style={s.offerPill}>
                  <Text style={s.offerPillText}>50% off</Text>
                </View>
              ) : (
                <View style={s.fastPill}>
                  <Rocket size={10} color={TB.flame} strokeWidth={2.4} />
                  <Text style={s.fastPillText}>{t("food.fast", { defaultValue: "Fast" })}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>{t("food.allRestaurants")}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
          {CUISINES.map((c) => (
            <Pressable
              key={c.key}
              style={s.cuisineItem}
              onPress={() => setCuisine((cur) => (cur === c.key ? null : c.key))}
            >
              <View
                style={[
                  s.cuisineCircle,
                  cuisine === c.key && { borderWidth: 2, borderColor: TB.ink },
                ]}
              >
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                </View>
              </View>
              <Text style={s.cuisineLabel} numberOfLines={1}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: TB.hMargin, paddingVertical: 14 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[
                s.filterChip,
                filter === f.key && s.filterChipOn,
              ]}
              onPress={() => setFilter((cur) => (cur === f.key ? null : f.key))}
            >
              {f.icon === "rocket" ? (
                <Rocket size={12} color={TB.ink} strokeWidth={2.2} />
              ) : null}
              <Text style={s.filterChipText}>
                {t(f.labelKey, {
                  defaultValue:
                    f.key === "sort"
                      ? "Sort by"
                      : f.key === "offers"
                        ? "Offers"
                        : f.key === "rating"
                          ? "Rating 4.0+"
                          : "Fast delivery",
                })}
              </Text>
              {f.icon === "chevron" ? (
                <ChevronDown size={14} color={TB.ink} strokeWidth={2.2} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>

        {data.length === 0 ? (
          <Text style={s.empty}>{t("food.empty")}</Text>
        ) : (
          data.map((r, i) => <RestaurantRow key={r.id} r={r} index={i} formatListing={formatListing} t={t} />)
        )}
      </ScrollView>

      <Pressable style={[s.floatPill, { bottom: 16 }]} onPress={() => setFilter("offers")}>
        <Sparkles size={14} color={TB.dealGreen} strokeWidth={2.4} />
        <View style={s.floatPillGreen}>
          <Text style={s.floatPillGreenText}>New finds</Text>
        </View>
        <Text style={s.floatPillText}>up to 30% off</Text>
      </Pressable>
    </View>
  );
}

function RestaurantRow({
  r,
  index,
  formatListing,
  t,
}: {
  r: Rest;
  index: number;
  formatListing: (n: number, c: "IQD") => string;
  t: (k: string, o?: Record<string, unknown>) => string;
}) {
  const deal = [20, 50, null, 30][index % 4];
  return (
    <Pressable style={s.restRow} onPress={() => router.push(`/food/${r.id}`)}>
      <View style={s.restThumb}>
        <OfflineCover uri={r.cover_url} label={r.name} style={s.restThumbImg} />
        <View style={s.restLogoMini}>
          <OfflineCover uri={r.cover_url} label={r.name} style={{ width: 28, height: 28 }} />
        </View>
        <View style={[s.heartBtn, { top: 6, right: 6 }]}>
          <Heart size={12} color={TB.ink} strokeWidth={2} />
        </View>
        {!r.is_open ? (
          <View style={s.restClosed}>
            <Text style={s.restClosedText}>{t("food.closed").toUpperCase()}</Text>
          </View>
        ) : null}
      </View>
      <View style={s.restBody}>
        {index % 3 === 0 ? (
          <View style={s.popularTag}>
            <TrendingUp size={12} color={TB.popularBlue} strokeWidth={2.4} />
            <Text style={s.popularTagText}>
              {t("food.popularIn", {
                defaultValue: "Popular in {{cuisine}}",
                cuisine: r.cuisine.split("/")[0]?.trim() ?? r.cuisine,
              })}
            </Text>
          </View>
        ) : null}
        <View style={s.findNameRow}>
          <Text style={s.restName} numberOfLines={1}>
            {r.name}
          </Text>
          {index % 2 === 1 ? (
            <View style={s.proBadge}>
              <Text style={s.proBadgeText}>pro</Text>
            </View>
          ) : null}
        </View>
        <View style={[s.findNameRow, { gap: 4 }]}>
          <Star size={11} color={TB.flame} fill={TB.flame} />
          <Text style={s.restMeta}>
            {r.rating_avg.toFixed(1)} ({formatCount(r.rating_count)}) · {r.eta_min}–
            {r.eta_min + 10} {t("food.min")} · {formatListing(r.delivery_fee_iqd, "IQD")}
          </Text>
        </View>
        {deal != null ? (
          <View style={s.restDeals}>
            <View style={s.offerPill}>
              <Text style={s.offerPillText}>{deal}% off</Text>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
