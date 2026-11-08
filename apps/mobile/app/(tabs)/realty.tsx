import { router } from "expo-router";
import {
  ArrowDownUp,
  ArrowRight,
  Building2,
  Flame,
  Heart,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OfflineCover } from "../../components/OfflineCover";
import { ProjectsSlider } from "../../components/ProjectsSlider";
import { RealtyCard } from "../../components/RealtyCard";
import { RealtyFilterSheet } from "../../components/RealtyFilterSheet";
import { VerticalShell } from "../../components/VerticalShell";
import { CITY_COVERS, DEMO_PROJECTS } from "../../lib/demo-agencies";
import { useCityStore } from "../../lib/city-store";
import { useCurrencyStore } from "../../lib/currency-store";
import type { DemoRealtyListing } from "../../lib/demo-data";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { useRealtyFavorites } from "../../lib/realty-favorites-store";
import {
  DEFAULT_REALTY_FILTERS,
  applyRealtyFilters,
  countActiveRealtyFilters,
  type RealtyFilters,
} from "../../lib/realty-filters";
import { colors, fonts, radius, space } from "../../lib/theme";

const HUB_CITIES = ["Erbil", "Baghdad", "Sulaymaniyah", "Basra"] as const;

/** Paya + Homele IA — Kullo marka token’larıyla emlak hub */
export default function RealtyScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const city = useCityStore((s) => s.city);
  const setCity = useCityStore((s) => s.setCity);
  const realty = useMarketplaceStore((s) => s.realty);
  const favHydrate = useRealtyFavorites((s) => s.hydrate);
  const favToggle = useRealtyFavorites((s) => s.toggle);
  const favHas = useRealtyFavorites((s) => s.has);
  const favCount = useRealtyFavorites((s) => s.ids.length);

  const [filters, setFilters] = useState<RealtyFilters>(() => ({
    ...DEFAULT_REALTY_FILTERS,
    city: city === "all" ? null : city,
  }));
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    void favHydrate();
  }, [favHydrate]);

  useEffect(() => {
    setFilters((f) => ({ ...f, city: city === "all" ? null : city }));
  }, [city]);

  const data = useMemo(
    () => applyRealtyFilters(realty, filters),
    [realty, filters],
  );
  const hot = data.filter((r) => r.featured).slice(0, 6);
  const pair = data.slice(0, 2);
  const activeFilterCount = countActiveRealtyFilters(filters);
  const cityLabel =
    filters.city ?? (city !== "all" ? city : t("realty.navExplore"));

  const labels = {
    saleLabel: t("realty.offer.sale"),
    rentLabel: t("realty.offer.rent"),
    hotLabel: t("realty.hot"),
  };

  const openListing = (id: string) => router.push(`/realty/${id}`);

  const renderCard = ({ item }: { item: DemoRealtyListing }) => (
    <View style={styles.cardPad}>
      <RealtyCard
        item={item}
        variant="feed"
        favorited={favHas(item.id)}
        priceLabel={formatListing(item.price_amount, item.price_currency)}
        typeLabel={t(`realty.kinds.${item.kind}`)}
        {...labels}
        onPress={() => openListing(item.id)}
        onFavorite={() => void favToggle(item.id)}
      />
    </View>
  );

  const header = (
    <View style={styles.headerBlock}>
      {/* Homele — projeler hero + yatay slider */}
      <ProjectsSlider
        projects={DEMO_PROJECTS}
        title={t("realty.projects")}
        viewAllLabel={t("realty.viewAll")}
        fromPrice={(p) =>
          t("realty.fromPrice", {
            price: formatListing(p.unitsFrom, p.currency),
          })
        }
        onOpenAll={() => router.push("/realty/projects")}
        onOpenProject={(id) => router.push(`/realty/project/${id}`)}
      />

      {/* Arama / amaç / tip → RealtyFilterSheet */}
      <Pressable
        style={styles.aiBanner}
        onPress={() => router.push("/realty/ai-search")}
      >
        <View style={styles.aiIcon}>
          <Sparkles size={16} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>{t("realty.aiTitle")}</Text>
          <Text style={styles.aiSub} numberOfLines={1}>
            {t("realty.aiSub")}
          </Text>
        </View>
        <ArrowRight size={16} color={colors.flameDeep} />
      </Pressable>

      {/* 6 — Cities */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityRow}
      >
        {HUB_CITIES.map((c) => (
          <Pressable
            key={c}
            style={styles.cityCard}
            onPress={() => {
              const next = filters.city === c ? null : c;
              setFilters((f) => ({ ...f, city: next }));
              void setCity(next ?? "all");
            }}
          >
            <OfflineCover uri={CITY_COVERS[c]} label={c} style={styles.cityImg} />
            <View
              style={[styles.cityScrim, filters.city === c && styles.cityScrimOn]}
            />
            <Text style={styles.cityCardLabel}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Paya pair grid — iki kolon vitrin */}
      {pair.length === 2 ? (
        <View style={styles.pairRow}>
          {pair.map((item) => (
            <View key={item.id} style={styles.pairCell}>
              <RealtyCard
                item={item}
                variant="pair"
                favorited={favHas(item.id)}
                priceLabel={formatListing(item.price_amount, item.price_currency)}
                typeLabel={t(`realty.kinds.${item.kind}`)}
                {...labels}
                onPress={() => openListing(item.id)}
                onFavorite={() => void favToggle(item.id)}
              />
            </View>
          ))}
        </View>
      ) : null}

      {/* Compact shortcuts */}
      <View style={styles.hubRow}>
        <HubBtn
          Icon={Building2}
          label={t("realty.projects")}
          onPress={() => router.push("/realty/projects")}
        />
        <HubBtn
          Icon={Users}
          label={t("realty.agencies")}
          onPress={() => router.push("/realty/agencies")}
        />
      </View>

      {/* Hot rail — Homele */}
      {hot.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.hotTitleRow}>
              <Flame size={18} color={colors.flame} fill={colors.flame} />
              <Text style={styles.sectionTitleInline}>{t("realty.hotSale")}</Text>
            </View>
            <Pressable onPress={() => setFilterOpen(true)}>
              <Text style={styles.seeAll}>
                {t("realty.viewAll")} · {data.length}
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotRow}
          >
            {hot.map((item) => (
              <RealtyCard
                key={item.id}
                item={item}
                variant="rail"
                favorited={favHas(item.id)}
                priceLabel={formatListing(item.price_amount, item.price_currency)}
                typeLabel={t(`realty.kinds.${item.kind}`)}
                {...labels}
                onPress={() => openListing(item.id)}
                onFavorite={() => void favToggle(item.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Text style={styles.results}>
        {t("realty.resultsCount", { count: data.length })}
      </Text>
    </View>
  );

  return (
    <VerticalShell
      title={t("realty.title")}
      onExit={() => router.replace("/(tabs)")}
      headerRight={
        <View style={styles.toolRow}>
          <Pressable
            style={styles.cityChip}
            onPress={() => setFilterOpen(true)}
            accessibilityLabel={cityLabel}
            hitSlop={4}
          >
            <MapPin size={13} color={colors.flame} strokeWidth={2.3} />
            <Text style={styles.cityChipText} numberOfLines={1}>
              {cityLabel}
            </Text>
          </Pressable>
          <Pressable
            style={styles.toolBtn}
            onPress={() => {
              const order = ["newest", "price_asc", "price_desc", "sqm_desc"] as const;
              const i = order.indexOf(filters.sort);
              setFilters((f) => ({
                ...f,
                sort: order[(i + 1) % order.length]!,
              }));
            }}
            accessibilityLabel={t("realty.sort")}
            hitSlop={4}
          >
            <ArrowDownUp size={18} color={colors.ink} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            style={[styles.toolBtn, activeFilterCount > 0 && styles.toolBtnOn]}
            onPress={() => setFilterOpen(true)}
            accessibilityLabel={t("search.filters")}
            hitSlop={4}
          >
            <SlidersHorizontal
              size={18}
              color={activeFilterCount > 0 ? colors.flame : colors.ink}
              strokeWidth={2.2}
            />
            {activeFilterCount > 0 ? (
              <View style={styles.toolDot}>
                <Text style={styles.toolDotText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={styles.toolBtn}
            onPress={() => router.push("/realty/map")}
            accessibilityLabel={t("realty.exploreMap")}
            hitSlop={4}
          >
            <Map size={18} color={colors.ink} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            style={styles.toolBtn}
            onPress={() => router.push("/realty/favorites")}
            accessibilityLabel={t("realty.favorites")}
            hitSlop={4}
          >
            <Heart
              size={18}
              color={favCount ? colors.flame : colors.ink}
              fill={favCount ? colors.flame : "transparent"}
              strokeWidth={2.2}
            />
            {favCount > 0 ? (
              <View style={styles.favBadge}>
                <Text style={styles.favBadgeText}>{favCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      }
      tabs={[
        {
          key: "explore",
          label: t("realty.navExplore"),
          Icon: Search,
          active: true,
          onPress: () => {},
        },
        {
          key: "map",
          label: t("realty.navMap"),
          Icon: Map,
          onPress: () => router.push("/realty/map"),
        },
        {
          key: "fav",
          label: t("realty.navFav"),
          Icon: Heart,
          onPress: () => router.push("/realty/favorites"),
        },
        {
          key: "projects",
          label: t("realty.projects"),
          Icon: Building2,
          onPress: () => router.push("/realty/projects"),
        },
      ]}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{t("realty.empty")}</Text>}
        showsVerticalScrollIndicator={false}
      />

      <RealtyFilterSheet
        visible={filterOpen}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => setFilters(next)}
      />
    </VerticalShell>
  );
}

function HubBtn({
  Icon,
  label,
  onPress,
  accent,
}: {
  Icon: typeof Map;
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable
      style={[styles.hubBtn, accent && styles.hubBtnAccent]}
      onPress={onPress}
    >
      <Icon
        size={15}
        color={accent ? colors.white : colors.flameDeep}
        strokeWidth={2.2}
      />
      <Text
        style={[styles.hubLabel, accent && styles.hubLabelAccent]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingBottom: space.md,
    gap: space.lg,
    paddingTop: space.sm,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  cityChip: {
    maxWidth: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    marginRight: 2,
  },
  cityChipText: {
    flexShrink: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
  },
  pairRow: {
    flexDirection: "row",
    paddingHorizontal: space.lg,
    gap: 10,
  },
  pairCell: { flex: 1 },
  toolBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  toolBtnOn: {
    backgroundColor: colors.flameSoft,
  },
  toolDot: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toolDotText: {
    fontFamily: fonts.bodySemi,
    fontSize: 8,
    color: colors.white,
  },
  favBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  favBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 8,
    color: colors.white,
  },
  aiBanner: {
    marginHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  aiIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.white },
  aiSub: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.72)" },
  cityRow: { paddingHorizontal: space.lg, gap: 10 },
  cityCard: {
    width: 108,
    height: 76,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  cityImg: { width: "100%", height: "100%" },
  cityScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  cityScrimOn: { backgroundColor: "rgba(243,106,28,0.48)" },
  cityCardLabel: {
    position: "absolute",
    left: 8,
    bottom: 8,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
  },
  hubRow: {
    flexDirection: "row",
    paddingHorizontal: space.lg,
    gap: 8,
  },
  hubBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  hubBtnAccent: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  hubLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
  },
  hubLabelAccent: { color: colors.white },
  section: { gap: 8 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
  },
  hotTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitleInline: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  seeAll: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.flame,
  },
  hotRow: { paddingHorizontal: space.lg, gap: 10 },
  results: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    paddingHorizontal: space.lg,
  },
  list: {
    paddingBottom: space.xl * 2,
  },
  cardPad: { paddingHorizontal: space.lg },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
