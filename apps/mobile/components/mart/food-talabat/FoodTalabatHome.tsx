/**
 * Talabat Hub + Home feed — servis kategorileri yatay slider + marka/mutfak rayları.
 * AppBar: ortak AppHeader — [Geri] → Konum → Arama → Dil → IQD → Cüzdan.
 */
import { router } from "expo-router";
import {
  ChevronRight,
  Heart,
  Sparkles,
  Ticket,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../../brand";
import { OfflineCover } from "../../OfflineCover";
import { useCityStore } from "../../../lib/city-store";
import { useCurrencyStore } from "../../../lib/currency-store";
import { useDeliveryAddressStore } from "../../../lib/delivery-address-store";
import { useMarketplaceStore } from "../../../lib/marketplace-store";
import { orderAgainImageUri } from "./food-order-again-images";
import { TB, tbStyles as s } from "./mart-food-talabat.styles";

const { width: W } = Dimensions.get("window");

type Props = {
  onGoMarket?: () => void;
  onGoCart?: () => void;
  onOpenFood?: () => void;
  onOpenSearch?: () => void;
};

type Rest = ReturnType<typeof useMarketplaceStore.getState>["restaurants"][0];

/** Servis hub — Mutfaklar gibi oval foto + etiket. */
const HUB = [
  {
    key: "food",
    labelKey: "mart.chipFood",
    uri: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80",
    action: "food" as const,
  },
  {
    key: "mart",
    labelKey: "food.kulloMart",
    uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
    action: "market" as const,
  },
  {
    key: "groceries",
    labelKey: "food.hubGroceries",
    uri: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80",
    action: "market" as const,
  },
  {
    key: "stores",
    labelKey: "food.hubStores",
    uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
    action: "market" as const,
  },
  {
    key: "health",
    labelKey: "food.hubHealth",
    uri: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    action: "market" as const,
  },
  {
    key: "flowers",
    labelKey: "food.hubFlowers",
    uri: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=400&q=80",
    action: "flowers" as const,
  },
  {
    key: "coffee",
    labelKey: "food.hubCoffee",
    uri: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
    action: "food" as const,
  },
  {
    key: "sweets",
    labelKey: "food.hubSweets",
    uri: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
    action: "food" as const,
  },
] as const;

/** Mutfak daireleri — cover / order-again / dish örnekleriyle ayrı Unsplash id. */
const CUISINE_EXAMPLES = [
  {
    key: "pizza",
    label: "Pizza",
    uri: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
    match: /pizza|ital/i,
  },
  {
    key: "burger",
    label: "Burger",
    uri: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80",
    match: /burger/i,
  },
  {
    key: "sushi",
    label: "Sushi",
    uri: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80",
    match: /sushi|asya/i,
  },
  {
    key: "kebab",
    label: "Kebab",
    uri: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    match: /kebab|grill|ızgara/i,
  },
  {
    key: "shawarma",
    label: "Shawarma",
    uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80",
    match: /shawarma|fast/i,
  },
  {
    key: "chicken",
    label: "Tavuk",
    uri: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80",
    match: /tavuk|chicken|crispy/i,
  },
  {
    key: "pasta",
    label: "Pasta",
    uri: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80",
    match: /pasta|ital/i,
  },
  {
    key: "coffee",
    label: "Kahve",
    uri: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80",
    match: /kahve|coffee|cafe|tatlı/i,
  },
  {
    key: "dessert",
    label: "Tatlı",
    uri: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
    match: /tatlı|sweet|dessert|cafe/i,
  },
  {
    key: "local",
    label: "Yerel",
    uri: "https://images.unsplash.com/photo-1636141186543-476c0defe0f0?auto=format&fit=crop&w=400&q=80",
    match: /kürt|irak|dolma|ortadoğu/i,
  },
] as const;

/** Yatay yemek örnekleri — cover / order-again / mutfak daireleriyle ayrı id. */
const DISH_EXAMPLES = [
  {
    id: "d1",
    name: "Pepperoni pizza",
    uri: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
    match: /pizza/i,
  },
  {
    id: "d2",
    name: "Smash burger",
    uri: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    match: /burger/i,
  },
  {
    id: "d3",
    name: "Salmon roll",
    uri: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80",
    match: /sushi/i,
  },
  {
    id: "d4",
    name: "Adana kebab",
    uri: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
    match: /kebab|grill/i,
  },
  {
    id: "d5",
    name: "Shawarma dürüm",
    uri: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80",
    match: /shawarma/i,
  },
  {
    id: "d6",
    name: "Crispy bucket",
    uri: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80",
    match: /chicken|tavuk|crispy/i,
  },
  {
    id: "d7",
    name: "Carbonara",
    uri: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    match: /pasta/i,
  },
  {
    id: "d8",
    name: "Flat white",
    uri: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80",
    match: /kahve|cafe|coffee/i,
  },
] as const;

const PROMOS = [
  { id: "p1", title: "Flash Sale", sub: "50% off + IQD 500 delivery", color: TB.ink },
  { id: "p2", title: "Chicken Fries", sub: "Limited time deal", color: "#1A1A1A" },
  { id: "p3", title: "Best sellers", sub: "30% off · Pro +10%", color: "#2D1B4E" },
  { id: "p4", title: "Order & Win", sub: "Daily prizes", color: "#0B6E4F" },
  { id: "p5", title: "Free delivery", sub: "On Kullo Pro", color: "#C45C26" },
];

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k+`;
  return String(n);
}

function pickForMatch(list: Rest[], re: RegExp, fallback: Rest | undefined) {
  return list.find((r) => re.test(`${r.name} ${r.cuisine}`)) ?? fallback;
}

export function FoodTalabatHome({
  onGoMarket,
  onGoCart,
  onOpenFood,
  onOpenSearch,
}: Props) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const city = useCityStore((st) => st.city);
  const addresses = useDeliveryAddressStore((st) => st.addresses);
  const selectedId = useDeliveryAddressStore((st) => st.selectedId);
  const restaurants = useMarketplaceStore((st) => st.restaurants);
  const [promoIdx, setPromoIdx] = useState(0);
  const promoRef = useRef<FlatList>(null);

  const selected = addresses.find((a) => a.id === selectedId) ?? addresses[0];

  const scoped = useMemo(() => {
    const scopeCity = city !== "all" ? city : selected?.city ?? null;
    let list = restaurants;
    if (scopeCity) {
      const filtered = restaurants.filter((r) => r.city === scopeCity);
      if (filtered.length) list = filtered;
    }
    return list;
  }, [restaurants, city, selected?.city]);

  const openOnes = useMemo(() => scoped.filter((r) => r.is_open), [scoped]);
  /** Popüler markalar — 8–12 tile, yatay peek. */
  const brands = openOnes.slice(0, 12);
  const coffee = openOnes.filter((r) => /kahve|coffee|cafe|tatlı|sweet/i.test(`${r.name} ${r.cuisine}`));
  const coffeeRail = coffee.length >= 2 ? coffee : openOnes.slice(0, 6);
  const again = useMemo(() => {
    const base = [...openOnes].reverse();
    return base.length >= 8 ? base.slice(0, 10) : [...base, ...openOnes].slice(0, 10);
  }, [openOnes]);
  const finds = openOnes.slice(0, 6);

  const onHub = (action: "food" | "market" | "flowers") => {
    if (action === "food") onOpenFood?.();
    else if (action === "market") onGoMarket?.();
    else if (action === "flowers") router.push("/food/flowers");
  };

  const onPromoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / (W - TB.hMargin * 2 + 10));
    if (i !== promoIdx && i >= 0 && i < PROMOS.length) setPromoIdx(i);
  };

  const goRest = (id: string) => router.push(`/food/${id}`);

  const openCuisine = (match: RegExp) => {
    const hit = pickForMatch(openOnes, match, openOnes[0]);
    if (hit) goRest(hit.id);
    else onOpenFood?.();
  };

  const metaLine = (r: Rest) =>
    `★ ${r.rating_avg.toFixed(1)} (${formatCount(r.rating_count)}) · ${r.eta_min}–${r.eta_min + 15} ${t("food.min")} · ${formatListing(r.delivery_fee_iqd, "IQD")}`;

  return (
    <View style={s.root}>
      <AppHeader
        variant="market"
        showBack
        searchPlaceholder={t("superHome.searchPlaceholder")}
        onSearchPress={() => onOpenSearch?.()}
        onBackPress={() => router.replace("/(tabs)")}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={s.hubRailContent}
          style={s.hubRail}
        >
          {HUB.map((h) => (
            <Pressable key={h.key} style={s.hubTile} onPress={() => onHub(h.action)}>
              <View style={s.hubCircle}>
                <OfflineCover
                  uri={h.uri}
                  label={h.key === "mart" ? "Kullo Mart" : t(h.labelKey)}
                  style={s.hubCircleImg}
                  contentFit="cover"
                />
              </View>
              <Text style={s.hubLabel} numberOfLines={1}>
                {h.key === "mart"
                  ? t("food.kulloMart", { defaultValue: "Kullo Mart" })
                  : t(h.labelKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[s.sectionPad, { marginTop: 18 }]}>
          <Text style={s.sectionTitle}>{t("food.popularBrands")}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
          {brands.map((r) => (
            <Pressable key={r.id} style={s.brandCard} onPress={() => goRest(r.id)}>
              <OfflineCover uri={r.cover_url} label={r.name} style={s.brandImg} />
              <View style={s.heartBtn}>
                <Heart size={14} color={TB.ink} strokeWidth={2} />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>
            {t("food.cuisines", { defaultValue: "Mutfaklar" })}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
          {CUISINE_EXAMPLES.map((c) => (
            <Pressable key={c.key} style={s.cuisineItem} onPress={() => openCuisine(c.match)}>
              <View style={s.cuisineCircle}>
                <OfflineCover uri={c.uri} label={c.label} style={s.cuisineImg} />
              </View>
              <Text style={s.cuisineLabel} numberOfLines={1}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>
            {t("food.dishExamples", { defaultValue: "Yemek örnekleri" })}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
          {DISH_EXAMPLES.map((d) => {
            const hit = pickForMatch(openOnes, d.match, openOnes[0]);
            return (
              <Pressable
                key={d.id}
                style={s.dishCard}
                onPress={() => (hit ? goRest(hit.id) : onOpenFood?.())}
              >
                <OfflineCover uri={d.uri} label={d.name} style={s.dishImg} />
                <Text style={s.dishName} numberOfLines={2}>
                  {d.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={s.promoWrap}>
          <FlatList
            ref={promoRef}
            data={PROMOS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.id}
            snapToInterval={W - TB.hMargin * 2 + 10}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 10 }}
            onMomentumScrollEnd={onPromoScroll}
            renderItem={({ item }) => (
              <Pressable
                style={[s.promoCard, { backgroundColor: item.color, width: W - TB.hMargin * 2 }]}
                onPress={() => onOpenFood?.()}
              >
                <View style={s.promoOverlay}>
                  <Text style={s.promoTitle}>{item.title}</Text>
                  <Text style={s.promoSub}>{item.sub}</Text>
                </View>
              </Pressable>
            )}
          />
          <View style={s.dots}>
            {PROMOS.map((p, i) => (
              <View key={p.id} style={[s.dot, i === promoIdx && s.dotOn]} />
            ))}
          </View>
        </View>

        <View style={s.proBanner}>
          <View style={s.proTop}>
            <Text style={s.proTitle}>
              {t("food.proBannerKullo", {
                defaultValue: "Subscribe to Kullo Pro with cash",
              })}
            </Text>
            <Text style={s.proJoin}>{t("food.proJoin")}</Text>
          </View>
          <View style={s.proBottom}>
            <Text style={s.proSub}>{t("food.proSub")}</Text>
          </View>
        </View>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>{t("food.redeemSave")}</Text>
          <View style={s.redeemRow}>
            <View style={s.redeemCard}>
              <View style={s.redeemIcon}>
                <Sparkles size={14} color={TB.flame} strokeWidth={2.4} />
              </View>
              <Text style={s.redeemText}>
                {t("food.points", { defaultValue: "1,963 points" })}
              </Text>
            </View>
            <View style={s.redeemCard}>
              <View style={s.redeemIcon}>
                <Ticket size={14} color={TB.flame} strokeWidth={2.4} />
              </View>
              <Text style={s.redeemText}>
                {t("food.vouchers", { defaultValue: "Vouchers" })}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.findsBand}>
          <Pressable style={s.findsHead} onPress={() => onOpenFood?.()}>
            <Sparkles size={18} color={TB.flame} strokeWidth={2.4} />
            <View style={{ flex: 1 }}>
              <Text style={s.findsTitle}>{t("food.newFinds")}</Text>
              <Text style={s.findsSub}>{t("food.newFindsSub")}</Text>
            </View>
            <ChevronRight size={20} color={TB.ink} strokeWidth={2.2} />
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
            {finds.map((r, i) => (
              <Pressable key={r.id} style={s.findCard} onPress={() => goRest(r.id)}>
                <View style={s.findLogoWrap}>
                  <View style={s.findLogo}>
                    <OfflineCover uri={r.cover_url} label={r.name} style={{ width: 64, height: 64 }} />
                  </View>
                  <View style={s.findDeal}>
                    <Text style={s.findDealText}>{[30, 20, 50, 15, 25, 40][i % 6]}% off</Text>
                  </View>
                </View>
                <View style={s.findBody}>
                  <View style={s.findNameRow}>
                    <Text style={s.findName} numberOfLines={1}>
                      {r.name}
                    </Text>
                    {i % 2 === 0 ? (
                      <View style={s.proBadge}>
                        <Text style={s.proBadgeText}>pro</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={s.findMeta} numberOfLines={2}>
                    {metaLine(r)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>{t("food.hubCoffee")}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
          {coffeeRail.map((r) => (
            <Pressable key={`c-${r.id}`} style={s.brandCard} onPress={() => goRest(r.id)}>
              <OfflineCover uri={r.cover_url} label={r.name} style={s.brandImg} />
              <View style={s.heartBtn}>
                <Heart size={14} color={TB.ink} strokeWidth={2} />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.sectionPad}>
          <Text style={s.sectionTitle}>{t("food.orderAgain")}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.hRail, { paddingBottom: 8 }]}
        >
          {again.map((r, i) => (
            <Pressable key={`a-${r.id}-${i}`} style={s.brandCard} onPress={() => goRest(r.id)}>
              <OfflineCover
                uri={orderAgainImageUri(i, r.cover_url)}
                label={r.name}
                style={s.brandImg}
              />
              {i === 0 ? (
                <View style={s.offerPill}>
                  <Text style={s.offerPillText}>50% off</Text>
                </View>
              ) : i === 1 ? (
                <View style={s.offerPill}>
                  <Text style={s.offerPillText}>
                    {t("food.offers", { defaultValue: "Offers" })}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
