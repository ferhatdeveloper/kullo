import { router } from "expo-router";
import {
  Briefcase,
  Building2,
  CarTaxiFront,
  Droplets,
  Hammer,
  Home,
  Hotel,
  KeyRound,
  Newspaper,
  Plane,
  Rocket,
  Search,
  Share2,
  Shirt,
  ShoppingBasket,
  Stethoscope,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react-native";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppHeader } from "./brand";
import { SoftGradient } from "./SoftGradient";
import { useFoodCartStore } from "../lib/food-cart-store";
import { useMartCartStore } from "../lib/mart-cart-store";
import { useMarketplaceStore } from "../lib/marketplace-store";
import { type AppMode, useModeStore } from "../lib/mode-store";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

type ServiceItem = {
  key: string;
  Icon: typeof Search;
  titleKey: string;
  hintKey: string;
  mode?: AppMode;
  go: () => void;
  accent: string;
  soft: string;
  badge?: string;
  count?: number;
  featured?: boolean;
};

/**
 * Hizmetler sekmesi — işlevsel dikey hub (emlak, alışveriş, yemek önde).
 */
export function ServicesHub() {
  const { t } = useTranslation();
  const choose = useModeStore((s) => s.choose);
  const realty = useMarketplaceStore((s) => s.realty);
  const goods = useMarketplaceStore((s) => s.goods);
  const restaurants = useMarketplaceStore((s) => s.restaurants);
  const foodLines = useFoodCartStore((s) => s.lines);
  const martLines = useMartCartStore((s) => s.lines);
  const [q, setQ] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const foodCartCount = foodLines.reduce((n, l) => n + l.qty, 0);
  const marketCartCount = martLines.reduce((n, l) => n + l.qty, 0);
  const openRestaurants = restaurants.filter((r) => r.is_open).length;

  const marketplace: ServiceItem[] = useMemo(
    () => [
      {
        key: "food",
        Icon: UtensilsCrossed,
        titleKey: "hub.food",
        hintKey: "modeSelect.hintFood",
        mode: "food",
        go: () =>
          router.replace({ pathname: "/(tabs)/mart", params: { martPane: "home" } }),
        accent: colors.flame,
        soft: colors.flameSoft,
        count: openRestaurants,
        badge: foodCartCount > 0 ? String(foodCartCount) : undefined,
        featured: true,
      },
      {
        key: "market",
        Icon: ShoppingBasket,
        titleKey: "hub.market",
        hintKey: "modeSelect.hintMarket",
        mode: "mart",
        go: () =>
          router.replace({
            pathname: "/(tabs)/mart",
            params: { martPane: "market" },
          }),
        accent: colors.flameDeep,
        soft: colors.flameSoft,
        badge: marketCartCount > 0 ? String(marketCartCount) : undefined,
        featured: true,
      },
      {
        key: "taxi",
        Icon: CarTaxiFront,
        titleKey: "hub.taxi",
        hintKey: "modeSelect.hintTaxi",
        mode: "ride",
        go: () => router.push("/taxi"),
        accent: colors.flame,
        soft: colors.flameSoft,
        featured: true,
      },
      {
        key: "realty",
        Icon: Building2,
        titleKey: "hub.realty",
        hintKey: "modeSelect.hintRealty",
        mode: "realty",
        go: () => router.replace("/(tabs)/realty"),
        accent: colors.ink,
        soft: colors.brandSoft,
        count: realty.length,
        featured: true,
      },
      {
        key: "buy",
        Icon: Search,
        titleKey: "hub.buy",
        hintKey: "modeSelect.hintBuy",
        mode: "buy",
        go: () =>
          router.replace({
            pathname: "/(tabs)/search",
            params: { intent: "buy", carsPane: "home" },
          }),
        accent: colors.flame,
        soft: colors.flameSoft,
        featured: true,
      },
      {
        key: "rent",
        Icon: KeyRound,
        titleKey: "hub.rent",
        hintKey: "modeSelect.hintRent",
        mode: "rent",
        go: () =>
          router.replace({
            pathname: "/(tabs)/rentals",
            params: { intent: "rent", rentPane: "home" },
          }),
        accent: colors.ink,
        soft: colors.brandSoft,
        featured: true,
      },
      {
        key: "shop",
        Icon: Shirt,
        titleKey: "hub.fashion",
        hintKey: "modeSelect.hintShop",
        mode: "shop",
        go: () => router.replace("/(tabs)/shop"),
        accent: colors.flameDeep,
        soft: colors.flameSoft,
        count: goods.length,
        featured: true,
      },
      {
        key: "health",
        Icon: Stethoscope,
        titleKey: "hub.health",
        hintKey: "modeSelect.hintHealth",
        go: () => router.push("/health"),
        accent: colors.flame,
        soft: colors.flameSoft,
        featured: true,
      },
      {
        key: "hotels",
        Icon: Hotel,
        titleKey: "hub.hotels",
        hintKey: "modeSelect.hintHotels",
        go: () => router.push("/hotels"),
        accent: colors.ink,
        soft: colors.brandSoft,
        featured: true,
      },
      {
        key: "b2b",
        Icon: Warehouse,
        titleKey: "hub.wholesale",
        hintKey: "modeSelect.hintWholesale",
        go: () => router.push("/b2b"),
        accent: colors.flame,
        soft: colors.flameSoft,
        featured: true,
      },
      {
        key: "trades",
        Icon: Hammer,
        titleKey: "hub.trades",
        hintKey: "modeSelect.hintTrades",
        go: () => router.push("/trades"),
        accent: colors.flameDeep,
        soft: colors.flameSoft,
        featured: true,
      },
      {
        key: "career",
        Icon: Briefcase,
        titleKey: "hub.career",
        hintKey: "modeSelect.hintCareer",
        go: () => router.push("/career"),
        accent: colors.ink,
        soft: colors.brandSoft,
        featured: true,
      },
      {
        key: "social",
        Icon: Share2,
        titleKey: "hub.socialAgency",
        hintKey: "modeSelect.hintSocial",
        go: () => router.push("/social-agency"),
        accent: colors.flame,
        soft: colors.flameSoft,
        featured: true,
      },
      {
        key: "stores-directory",
        Icon: Store,
        titleKey: "storesDirectory.title",
        hintKey: "storesDirectory.subtitle",
        go: () => router.replace("/(tabs)/stores"),
        accent: colors.ink,
        soft: colors.brandSoft,
        featured: true,
      },
    ],
    [realty.length, goods.length, openRestaurants, foodCartCount, marketCartCount],
  );

  /** Yolculuk & bakım — Rehber + Yüküm var önde; dens kart. */
  const mobility: ServiceItem[] = [
    {
      key: "guide",
      Icon: Newspaper,
      titleKey: "hub.guide",
      hintKey: "modeSelect.hintGuide",
      go: () => router.push("/guide"),
      accent: colors.flame,
      soft: colors.flameSoft,
      featured: true,
    },
    {
      key: "freight",
      Icon: Truck,
      titleKey: "hub.freight",
      hintKey: "modeSelect.hintFreight",
      go: () => router.push("/freight"),
      accent: colors.flame,
      soft: colors.flameSoft,
      featured: true,
    },
    {
      key: "travel",
      Icon: Plane,
      titleKey: "hub.travel",
      hintKey: "modeSelect.hintTravel",
      go: () => router.push("/travel"),
      accent: colors.ink,
      soft: colors.brandSoft,
      featured: true,
    },
    {
      key: "shared",
      Icon: Users,
      titleKey: "hub.sharedRide",
      hintKey: "modeSelect.hintShared",
      go: () => router.push("/shared-ride"),
      accent: colors.flame,
      soft: colors.flameSoft,
      featured: true,
    },
    {
      key: "wash",
      Icon: Droplets,
      titleKey: "hub.wash",
      hintKey: "modeSelect.hintWash",
      go: () => router.push("/car-wash"),
      accent: colors.flame,
      soft: colors.flameSoft,
      featured: true,
    },
    {
      key: "boost",
      Icon: Rocket,
      titleKey: "hub.boost",
      hintKey: "modeSelect.hintBoost",
      go: () => router.push("/boost"),
      accent: colors.ink,
      soft: colors.brandSoft,
      featured: true,
    },
  ];

  const openService = async (item: ServiceItem) => {
    if (item.mode) await choose(item.mode);
    item.go();
  };

  const matchQ = (item: ServiceItem) => {
    const qq = q.trim().toLowerCase();
    if (!qq) return true;
    const hay = `${t(item.titleKey)} ${t(item.hintKey)}`.toLowerCase();
    return hay.includes(qq);
  };

  const filteredMarket = marketplace.filter(matchQ);
  const filteredMobility = mobility.filter(matchQ);

  return (
    <View style={styles.root}>
      <SoftGradient
        colors={[colors.ink, "#071F1C"]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppHeader variant="brand" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchBlock}>
          <View style={styles.searchRow}>
            <Pressable
              style={({ pressed }) => [styles.homeChip, pressed && styles.pressed]}
              onPress={() => router.replace("/(tabs)")}
              accessibilityRole="button"
              accessibilityLabel={t("tabs.home")}
            >
              <Home size={15} color={colors.flame} strokeWidth={2.3} />
              <Text style={styles.homeChipText}>{t("tabs.home")}</Text>
            </Pressable>
            <View style={styles.searchWrap}>
              <Search size={16} color={colors.inkFaint} strokeWidth={2.2} />
              <TextInput
                style={styles.search}
                value={q}
                onChangeText={setQ}
                placeholder={t("servicesHub.searchPlaceholder")}
                placeholderTextColor={colors.inkFaint}
                autoFocus={searchFocus}
                onBlur={() => setSearchFocus(false)}
              />
            </View>
          </View>
          <Text style={styles.sub}>{t("servicesHub.subtitle")}</Text>
        </View>

        {filteredMarket.length > 0 ? (
          <Section title={t("servicesHub.marketplace")}>
            <View style={styles.grid}>
              {filteredMarket.map((item) => (
                <FeaturedCard
                  key={item.key}
                  item={item}
                  title={t(item.titleKey)}
                  hint={t(item.hintKey)}
                  onPress={() => void openService(item)}
                />
              ))}
            </View>
          </Section>
        ) : null}

        {filteredMobility.length > 0 ? (
          <Section title={t("servicesHub.mobility")}>
            <View style={styles.grid}>
              {filteredMobility.map((item) => (
                <FeaturedCard
                  key={item.key}
                  item={item}
                  title={t(item.titleKey)}
                  hint={t(item.hintKey)}
                  emphasize={item.key === "guide" || item.key === "freight"}
                  onPress={() => void openService(item)}
                />
              ))}
            </View>
          </Section>
        ) : null}

        {!filteredMarket.length && !filteredMobility.length ? (
          <Text style={styles.empty}>{t("servicesHub.empty")}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FeaturedCard({
  item,
  title,
  hint,
  emphasize,
  onPress,
}: {
  item: ServiceItem;
  title: string;
  hint: string;
  /** Rehber vb. — flame kenar vurgusu */
  emphasize?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.featured,
        emphasize && styles.featuredEmphasize,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.featuredRow}>
        <View style={[styles.featuredIcon, { backgroundColor: item.soft }]}>
          <item.Icon size={15} color={item.accent} strokeWidth={2.3} />
          {item.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.featuredHint} numberOfLines={2}>
        {hint}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl * 2,
    gap: space.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    marginBottom: 6,
  },
  brandMini: { marginLeft: -6 },
  topPrefs: { flexDirection: "row", gap: 6, maxWidth: "62%" },
  topChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    maxWidth: 136,
  },
  topChipOn: {
    borderColor: "rgba(255,106,0,0.55)",
    backgroundColor: "rgba(255,106,0,0.14)",
  },
  topChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
    flexShrink: 1,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  sheetTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
  },
  sheetHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: space.md,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: 6,
    backgroundColor: colors.mist,
  },
  sheetOptionOn: {
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: "rgba(255,106,0,0.35)",
  },
  sheetOptionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  sheetOptionTextOn: {
    fontFamily: fonts.bodySemi,
    color: colors.flameDeep,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.3,
  },
  searchBlock: {
    gap: 8,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.62)",
    paddingHorizontal: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    ...shadow.soft,
  },
  homeChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    ...shadow.soft,
  },
  search: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  section: { gap: 8, marginTop: 6 },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  featured: {
    width: "31.4%",
    flexGrow: 0,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(12,45,41,0.08)",
  },
  featuredEmphasize: {
    borderWidth: 1.5,
    borderColor: "rgba(243,106,28,0.55)",
    backgroundColor: colors.flameSoft,
  },
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 4,
  },
  featuredIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 8,
    color: colors.white,
  },
  featuredTitle: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 13,
    lineHeight: 16,
    color: colors.ink,
    letterSpacing: -0.15,
  },
  featuredHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 13,
    color: colors.inkMuted,
  },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: "rgba(255,255,255,0.55)",
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
});
