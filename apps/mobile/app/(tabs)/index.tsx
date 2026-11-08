import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Briefcase,
  Building2,
  Car,
  CarTaxiFront,
  Flower2,
  Hammer,
  Hotel,
  KeyRound,
  LayoutDashboard,
  Plane,
  Shirt,
  ShoppingBasket,
  Stethoscope,
  UtensilsCrossed,
  Warehouse,
  Wrench,
} from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SoftGradient as LinearGradient } from "../../components/SoftGradient";
import { AppHeader } from "../../components/brand";
import { OfflineCover } from "../../components/OfflineCover";
import { SuperHomeFeed } from "../../components/SuperHomeFeed";
import { type VehicleListItem } from "../../components/VehicleCard";
import { api } from "../../lib/api";
import { DEMO_VEHICLES, withStoreAttribution } from "../../lib/demo-data";
import { hasOfflineBundle } from "../../lib/offline-image-map";
import {
  readVehiclesSnapshot,
  writeVehiclesSnapshot,
} from "../../lib/offline-snapshot";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const SCREEN_W = Dimensions.get("window").width;
const BANNER_W = SCREEN_W - space.lg * 2;

/** Snapshot/API cover remote ise offline map’teki demo cover’a düş. */
function withBundledCovers(list: VehicleListItem[]): VehicleListItem[] {
  return list.map((v, i) => {
    if (hasOfflineBundle(v.cover_url)) return v;
    const demo = DEMO_VEHICLES[i % DEMO_VEHICLES.length];
    return { ...v, cover_url: demo?.cover_url ?? v.cover_url };
  });
}

type Banner = {
  key: string;
  uri: string;
  eyebrowKey: string;
  titleKey: string;
  subKey: string;
  go: () => void;
};

const BANNERS: Banner[] = [
  {
    key: "deals",
    uri: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
    eyebrowKey: "superHome.deals",
    titleKey: "superHome.bannerHeroTitle",
    subKey: "superHome.bannerHeroSub",
    go: () =>
      router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } }),
  },
  {
    key: "cars",
    uri: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    eyebrowKey: "superHome.bannerCars",
    titleKey: "superHome.bannerCarsTitle",
    subKey: "superHome.bannerCarsSub",
    go: () =>
      router.push({
        pathname: "/(tabs)/search",
        params: { intent: "buy", carsPane: "home" },
      }),
  },
  {
    key: "realty",
    uri: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    eyebrowKey: "superHome.bannerRealty",
    titleKey: "superHome.bannerRealtyTitle",
    subKey: "superHome.bannerRealtySub",
    go: () => router.push("/(tabs)/realty"),
  },
  {
    key: "food",
    uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    eyebrowKey: "hub.food",
    titleKey: "superHome.bannerFoodTitle",
    subKey: "superHome.bannerFoodSub",
    go: () =>
      router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } }),
  },
];

/** Tek keşif katmanı — dairesel dikey kısayollar (Hizmetler featured sırasıyla uyumlu) */
const CIRCLES = [
  {
    key: "food",
    Icon: UtensilsCrossed,
    labelKey: "hub.food",
    go: () =>
      router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } }),
  },
  {
    key: "market",
    Icon: ShoppingBasket,
    labelKey: "hub.market",
    go: () =>
      router.push({ pathname: "/(tabs)/mart", params: { martPane: "market" } }),
  },
  {
    key: "taxi",
    Icon: CarTaxiFront,
    labelKey: "hub.taxi",
    go: () => router.push("/taxi"),
  },
  {
    key: "realty",
    Icon: Building2,
    labelKey: "hub.realty",
    go: () => router.push("/(tabs)/realty"),
  },
  {
    key: "cars-buy",
    Icon: Car,
    labelKey: "hub.buy",
    go: () =>
      router.push({
        pathname: "/(tabs)/search",
        params: { intent: "buy", carsPane: "home" },
      }),
  },
  {
    key: "cars-rent",
    Icon: KeyRound,
    labelKey: "hub.rent",
    go: () =>
      router.push({
        pathname: "/(tabs)/rentals",
        params: { intent: "rent", rentPane: "home" },
      }),
  },
  {
    key: "fashion",
    Icon: Shirt,
    labelKey: "hub.fashion",
    go: () => router.push("/(tabs)/shop"),
  },
  {
    key: "health",
    Icon: Stethoscope,
    labelKey: "hub.health",
    go: () => router.push("/health"),
  },
  {
    key: "career",
    Icon: Briefcase,
    labelKey: "hub.career",
    go: () => router.push("/career"),
  },
  {
    key: "travel",
    Icon: Plane,
    labelKey: "hub.travel",
    go: () => router.push("/travel"),
  },
  {
    key: "hotels",
    Icon: Hotel,
    labelKey: "hub.hotels",
    go: () => router.push("/hotels"),
  },
  {
    key: "b2b",
    Icon: Warehouse,
    labelKey: "hub.wholesale",
    go: () => router.push("/b2b"),
  },
  {
    key: "trades",
    Icon: Hammer,
    labelKey: "hub.trades",
    go: () => router.push("/trades"),
  },
  {
    key: "flowers",
    Icon: Flower2,
    labelKey: "hub.flowers",
    go: () => router.push("/food/flowers"),
  },
  {
    key: "services",
    Icon: Wrench,
    labelKey: "tabs.services",
    go: () => router.push("/(tabs)/services"),
  },
  {
    key: "all",
    Icon: LayoutDashboard,
    labelKey: "home.allServices",
    go: () => router.push("/mode-select"),
  },
] as const;

/** Süper-app Ana — yoğun marketplace keşif (ink + flame) */
export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerRef = useRef<ScrollView>(null);

  const { data: recent } = useQuery({
    queryKey: ["vehicles-recent-home", i18n.language],
    queryFn: async () => {
      try {
        const feed = await api.rpc<VehicleListItem[]>("list_active_listings_feed", {
          p_limit: 12,
          p_offset: 0,
          p_locale: i18n.language,
        });
        if (Array.isArray(feed) && feed.length > 0) {
          void writeVehiclesSnapshot(feed);
          return feed;
        }
      } catch {
        /* fall through */
      }
      const snap = await readVehiclesSnapshot();
      return withBundledCovers(
        (snap ?? DEMO_VEHICLES) as VehicleListItem[],
      );
    },
    initialData: DEMO_VEHICLES as VehicleListItem[],
    staleTime: 60_000,
  });

  const vehicles = withStoreAttribution(
    withBundledCovers(recent ?? (DEMO_VEHICLES as VehicleListItem[])),
  );

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / (BANNER_W + 10));
    if (i !== bannerIdx && i >= 0 && i < BANNERS.length) setBannerIdx(i);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader
        variant="market"
        searchPlaceholder={t("superHome.searchPlaceholder")}
        onSearchPress={() =>
          router.push({ pathname: "/(tabs)/search", params: { openResults: "1" } })
        }
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <View style={styles.bannerShell}>
            <ScrollView
              ref={bannerRef}
              horizontal
              pagingEnabled={false}
              decelerationRate="fast"
              snapToInterval={BANNER_W + 10}
              snapToAlignment="start"
              showsHorizontalScrollIndicator={false}
              onScroll={onBannerScroll}
              scrollEventThrottle={16}
              style={styles.bannerScroll}
              contentContainerStyle={styles.bannerRow}
            >
              {BANNERS.map((b) => (
                <Pressable
                  key={b.key}
                  style={[styles.heroBanner, { width: BANNER_W }]}
                  onPress={b.go}
                >
                  <OfflineCover uri={b.uri} style={styles.heroImage} />
                  <LinearGradient
                    colors={["rgba(12,45,41,0.35)", "rgba(12,45,41,0.88)"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.heroGradient}
                  >
                    <Text style={styles.heroEyebrow}>{t(b.eyebrowKey)}</Text>
                    <Text style={styles.heroTitle}>{t(b.titleKey)}</Text>
                    <Text style={styles.heroSub}>{t(b.subKey)}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.dots}>
              {BANNERS.map((b, i) => (
                <View
                  key={b.key}
                  style={[styles.dot, i === bannerIdx && styles.dotOn]}
                />
              ))}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.circleScroll}
            contentContainerStyle={styles.circleRow}
          >
            {CIRCLES.map((c) => (
              <Pressable key={c.key} style={styles.circleItem} onPress={c.go}>
                <View style={styles.circleIcon}>
                  <c.Icon size={22} color={colors.flame} strokeWidth={2.2} />
                </View>
                <Text style={styles.circleLabel} numberOfLines={2}>
                  {t(c.labelKey)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <SuperHomeFeed vehicles={vehicles} compact />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  flex: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: space.xxl },
  sheet: {
    backgroundColor: colors.white,
    paddingTop: space.md,
    minHeight: "100%",
  },
  bannerShell: { marginBottom: 4 },
  bannerScroll: { height: 118 },
  bannerRow: {
    paddingHorizontal: space.lg,
    gap: 10,
    alignItems: "stretch",
  },
  heroBanner: {
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 118,
    backgroundColor: colors.ink,
    ...shadow.soft,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: space.lg,
    paddingVertical: 18,
    justifyContent: "center",
  },
  heroEyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.flameMid,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
    marginTop: 4,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: space.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(12,45,41,0.18)",
  },
  dotOn: {
    backgroundColor: colors.flame,
    width: 16,
  },
  circleScroll: { maxHeight: 100, marginBottom: space.md },
  circleRow: {
    paddingHorizontal: space.lg,
    gap: 14,
    alignItems: "flex-start",
  },
  circleItem: {
    width: 70,
    alignItems: "center",
    gap: 6,
  },
  circleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "rgba(243,106,28,0.35)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  circleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
  },
});
