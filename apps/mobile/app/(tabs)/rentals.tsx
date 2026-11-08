import { FlashList } from "@shopify/flash-list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import {
  Calendar,
  CalendarCheck,
  Info,
  KeyRound,
  MapPin,
  Plane,
  Sparkles,
  ChevronRight,
  Globe2,
  Heart,
  User,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { OfflineCover } from "../../components/OfflineCover";
import { RentalsShell, type RentalsPane } from "../../components/RentalsShell";
import { VehicleCardSkeleton } from "../../components/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { Chip } from "../../components/ui/Chip";
import { api } from "../../lib/api";
import { MARKET_CITIES, useCityStore, type SelectedCity } from "../../lib/city-store";
import { storage } from "../../lib/clients";
import { useCurrencyStore } from "../../lib/currency-store";
import { DEMO_RENTALS } from "../../lib/demo-data";
import { chauffeurDailyFee } from "../../lib/marketplace-heuristics";
import { useModeStore } from "../../lib/mode-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";
import { CARS_BUY_HREF } from "../../lib/cars-routes";

const BORDER_FLAME = "#FFD8B8";

/** Rental destinations — market cities + Kurdistan hubs */
const RENTAL_CITIES = [
  "Erbil",
  "Baghdad",
  "Sulaymaniyah",
  "Duhok",
  "Basra",
  "Mosul",
  "Kirkuk",
] as const;

const CITY_SHORT: Record<string, string> = {
  Sulaymaniyah: "Suli",
  Baghdad: "Baghdad",
  Erbil: "Erbil",
  Duhok: "Duhok",
  Basra: "Basra",
  Mosul: "Mosul",
  Kirkuk: "Kirkuk",
};

type RatePeriod = "daily" | "monthly";

interface Rental {
  id: string;
  vehicle_id: string;
  daily_rate_amount: number;
  daily_rate_currency: string;
  weekly_rate_amount: number | null;
  monthly_rate_amount: number | null;
  deposit_amount: number | null;
  min_days: number;
  max_days: number;
  insurance_included: boolean;
  instant_book: boolean;
  delivery_available?: boolean;
  airport_delivery?: boolean;
  airport_delivery_fee?: number;
  country_code: string | null;
  city: string | null;
  vehicle: {
    title_original: string | null;
    year: number | null;
    cover_url: string | null;
  };
}

export default function RentalsScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();
  const choose = useModeStore((s) => s.choose);
  const storedCity = useCityStore((s) => s.city);
  const setStoredCity = useCityStore((s) => s.setCity);
  const [pane, setPane] = useState<RentalsPane>("home");
  const [city, setCity] = useState<string | "all">(
    storedCity !== "all" ? storedCity : "all",
  );
  const [withDriver, setWithDriver] = useState(false);
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>("daily");
  const [instantOnly, setInstantOnly] = useState(false);
  const formatListing = useCurrencyStore((s) => s.formatListing);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
      setCity(storedCity !== "all" ? storedCity : "all");
      void choose("rent");
    }, [storedCity, choose]),
  );

  useEffect(() => {
    const raw = String(params.rentPane ?? params.carsPane ?? "");
    if (raw === "search" || raw === "book" || raw === "saved" || raw === "more" || raw === "home") {
      setPane(raw);
    }
  }, [params.rentPane, params.carsPane]);

  /** intent/mode=buy → satın alma dikeyine yönlendir (karışmasın) */
  useEffect(() => {
    const intent = String(params.intent ?? params.mode ?? "rent");
    if (intent === "buy") {
      router.replace({
        pathname: "/(tabs)/search",
        params: { intent: "buy", carsPane: "home" },
      });
    }
  }, [params.intent, params.mode]);

  const selectCity = useCallback(
    (next: string | "all") => {
      setCity(next);
      const persistable =
        next === "all"
          ? "all"
          : (MARKET_CITIES as readonly string[]).includes(next)
            ? (next as SelectedCity)
            : "all";
      void setStoredCity(persistable);
    },
    [setStoredCity],
  );

  const goHome = useCallback(() => {
    setPane("home");
    router.setParams({ intent: "rent", rentPane: "home" });
  }, []);
  const goSearch = useCallback(() => {
    setPane("search");
    router.setParams({ intent: "rent", rentPane: "search" });
  }, []);
  const goBook = useCallback(() => {
    setPane("book");
    router.setParams({ intent: "rent", rentPane: "book" });
  }, []);
  const goSaved = useCallback(() => {
    setPane("saved");
    router.setParams({ intent: "rent", rentPane: "saved" });
  }, []);
  const goMore = useCallback(() => {
    setPane("more");
    router.setParams({ intent: "rent", rentPane: "more" });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["rentals", i18n.language],
    queryFn: () =>
      api.get(
        "/rentals?status=eq.active&select=*,vehicle:vehicles(id,title_original,year,media:vehicle_media(url,is_cover))&order=created_at.desc&limit=30",
      ),
    initialData: DEMO_RENTALS as unknown as Rental[],
    placeholderData: keepPreviousData,
  });

  const catalog = useMemo(() => {
    const apiList = (data as Rental[] | undefined) ?? [];
    return apiList.length ? apiList : (DEMO_RENTALS as unknown as Rental[]);
  }, [data]);

  const rentals = useMemo(() => {
    let list = catalog;
    if (city !== "all") {
      list = list.filter((r) => (r.city ?? "").toLowerCase() === city.toLowerCase());
    }
    if (instantOnly) {
      list = list.filter((r) => r.instant_book);
    }
    return list;
  }, [catalog, city, instantOnly]);

  const cityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of catalog) {
      const key = (r.city ?? "").trim();
      if (!key) continue;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [catalog]);

  const filterHeader = (
    <View>
      {pane === "home" ? (
        <>
          <View style={styles.hint}>
            <Sparkles size={14} color={colors.flame} />
            <Text style={styles.hintText}>
              {t("rentals.dynamicPricing")}: {t("rentals.dynamicPricingHint")}
            </Text>
          </View>
          <View style={styles.familyHint}>
            <Text style={styles.familyHintText}>{t("rentals.familyHint")}</Text>
          </View>
        </>
      ) : null}

      <View style={styles.rateRow}>
        <Chip
          label={t("rentals.perDay")}
          selected={ratePeriod === "daily"}
          onPress={() => setRatePeriod("daily")}
        />
        <Chip
          label={t("rentals.perMonth")}
          selected={ratePeriod === "monthly"}
          onPress={() => setRatePeriod("monthly")}
        />
        <Chip
          label={t("rentals.instantBook")}
          selected={instantOnly}
          onPress={() => setInstantOnly((v) => !v)}
        />
      </View>

      <View style={styles.citySection}>
        <Text style={styles.citySectionLabel}>{t("search.city")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityRow}
          decelerationRate="fast"
        >
          <Pressable
            onPress={() => selectCity("all")}
            style={({ pressed }) => [
              styles.cityTile,
              city === "all" && styles.cityTileOn,
              pressed && styles.cityTilePressed,
            ]}
          >
            <View
              style={[styles.cityIconWrap, city === "all" && styles.cityIconWrapOn]}
            >
              <Globe2
                size={18}
                color={city === "all" ? colors.white : colors.flame}
                strokeWidth={2.2}
              />
            </View>
            <Text
              style={[styles.cityTileLabel, city === "all" && styles.cityTileLabelOn]}
              numberOfLines={1}
            >
              {t("common.all")}
            </Text>
            <Text
              style={[styles.cityTileMeta, city === "all" && styles.cityTileMetaOn]}
            >
              {catalog.length}
            </Text>
          </Pressable>

          {RENTAL_CITIES.map((c) => {
            const selected = city === c;
            const count = cityCounts[c] ?? 0;
            return (
              <Pressable
                key={c}
                onPress={() => selectCity(c)}
                style={({ pressed }) => [
                  styles.cityTile,
                  selected && styles.cityTileOn,
                  pressed && styles.cityTilePressed,
                ]}
              >
                <View
                  style={[styles.cityIconWrap, selected && styles.cityIconWrapOn]}
                >
                  <MapPin
                    size={18}
                    color={selected ? colors.white : colors.flame}
                    strokeWidth={2.2}
                  />
                </View>
                <Text
                  style={[styles.cityTileLabel, selected && styles.cityTileLabelOn]}
                  numberOfLines={1}
                >
                  {CITY_SHORT[c] ?? c}
                </Text>
                <Text
                  style={[styles.cityTileMeta, selected && styles.cityTileMetaOn]}
                >
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.packageRow}>
        <Chip
          label={t("rentals.withDriver")}
          selected={withDriver}
          onPress={() => setWithDriver((v) => !v)}
        />
        <Text style={styles.packageHint}>
          {t("rentals.withDriverFee", {
            fee: formatListing(chauffeurDailyFee(null), "IQD"),
          })}
        </Text>
      </View>

      <Text style={styles.resultsCount}>
        {t("rentals.resultsCount", { count: rentals.length })}
      </Text>
    </View>
  );

  if (pane === "more") {
    return (
      <RentalsShell
        active="more"
        onHome={goHome}
        onSearch={goSearch}
        onBook={goBook}
        onSaved={goSaved}
        onMore={goMore}
      >
        <ScrollView
          style={styles.listFlex}
          contentContainerStyle={styles.morePad}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.moreSection}>{t("rentals.moreExplore")}</Text>
          <View style={styles.moreGroup}>
            <MoreRow
              icon={<KeyRound size={18} color={colors.flame} strokeWidth={2.2} />}
              label={t("rentals.navSearch")}
              onPress={goSearch}
            />
            <MoreRow
              icon={<CalendarCheck size={18} color={colors.flame} strokeWidth={2.2} />}
              label={t("rentals.navBook")}
              onPress={goBook}
            />
            <MoreRow
              icon={<Heart size={18} color={colors.flame} strokeWidth={2.2} />}
              label={t("rentals.navSaved")}
              onPress={goSaved}
            />
            <MoreRow
              icon={<Sparkles size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("rentals.moreBuy")}
              onPress={() => router.push(CARS_BUY_HREF)}
            />
          </View>
          <Text style={styles.moreSection}>{t("rentals.moreSupport")}</Text>
          <View style={styles.moreGroup}>
            <MoreRow
              icon={<User size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("cars.moreProfile")}
              onPress={() => router.replace("/(tabs)/profile")}
            />
            <MoreRow
              icon={<Info size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("cars.moreContact")}
              onPress={() => router.push("/about")}
            />
          </View>
        </ScrollView>
      </RentalsShell>
    );
  }

  if (pane === "saved") {
    return (
      <RentalsShell
        active="saved"
        title={t("rentals.navSaved")}
        onHome={goHome}
        onSearch={goSearch}
        onBook={goBook}
        onSaved={goSaved}
        onMore={goMore}
      >
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Heart size={36} color={colors.flame} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>{t("rentals.savedEmpty")}</Text>
          <Text style={styles.emptySub}>{t("rentals.savedEmptySub")}</Text>
          <TouchableOpacity style={styles.emptyCta} onPress={goSearch} activeOpacity={0.9}>
            <Text style={styles.emptyCtaText}>{t("rentals.browseCta")}</Text>
          </TouchableOpacity>
        </View>
      </RentalsShell>
    );
  }

  if (pane === "book") {
    return (
      <RentalsShell
        active="book"
        title={t("rentals.navBook")}
        onHome={goHome}
        onSearch={goSearch}
        onBook={goBook}
        onSaved={goSaved}
        onMore={goMore}
      >
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <CalendarCheck size={36} color={colors.flame} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>{t("rentals.bookEmpty")}</Text>
          <Text style={styles.emptySub}>{t("rentals.bookEmptySub")}</Text>
          <TouchableOpacity style={styles.emptyCta} onPress={goSearch} activeOpacity={0.9}>
            <Text style={styles.emptyCtaText}>{t("rentals.browseCta")}</Text>
          </TouchableOpacity>
        </View>
      </RentalsShell>
    );
  }

  const shellActive: RentalsPane = pane === "search" ? "search" : "home";

  return (
    <RentalsShell
      active={shellActive}
      title={pane === "search" ? t("rentals.navSearch") : t("rentals.title")}
      hideSubHeader={pane === "home"}
      onHome={goHome}
      onSearch={goSearch}
      onBook={goBook}
      onSaved={goSaved}
      onMore={goMore}
    >
      <FlashList
        data={rentals}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RentalCard
            rental={item}
            withDriverPreferred={withDriver}
            ratePeriod={ratePeriod}
          />
        )}
        ListHeaderComponent={filterHeader}
        ListEmptyComponent={
          isLoading && rentals.length === 0 ? (
            <View style={styles.skeletonWrap}>
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Calendar size={36} color={colors.flame} strokeWidth={1.8} />
              </View>
              <Text style={styles.emptyTitle}>{t("rentals.emptyTitle")}</Text>
              <Text style={styles.emptySub}>{t("rentals.emptySub")}</Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        style={styles.listFlex}
      />
    </RentalsShell>
  );
}

function MoreRow({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.moreRow} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.moreRowIcon}>{icon}</View>
      <Text style={styles.moreRowLabel}>{label}</Text>
      <ChevronRight size={16} color={colors.inkFaint} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

function RentalCard({
  rental,
  withDriverPreferred,
  ratePeriod,
}: {
  rental: Rental;
  withDriverPreferred: boolean;
  ratePeriod: RatePeriod;
}) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const cover = rental.vehicle?.cover_url;
  const showMonthly = ratePeriod === "monthly" && rental.monthly_rate_amount != null;
  const primaryAmount = showMonthly
    ? rental.monthly_rate_amount!
    : rental.daily_rate_amount;
  const primaryLabel = showMonthly ? t("rentals.perMonth") : t("rentals.perDay");
  const primaryRate = formatListing(primaryAmount, rental.daily_rate_currency);
  const depositLabel =
    rental.deposit_amount != null
      ? formatListing(rental.deposit_amount, rental.daily_rate_currency)
      : null;
  const chauffeurFee = chauffeurDailyFee(rental.daily_rate_amount);
  const chauffeurFeeLabel = formatListing(chauffeurFee, rental.daily_rate_currency);
  const showAirport = Boolean(rental.airport_delivery);
  const available =
    rental.instant_book
      ? t("rentals.availabilityInstant")
      : t("rentals.availabilityRequest");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/rental/[id]",
          params: {
            id: rental.id,
            intent: "rent",
            ...(withDriverPreferred ? { withDriver: "1" } : {}),
          },
        })
      }
      activeOpacity={0.92}
    >
      <View>
        {cover ? (
          <OfflineCover
            uri={cover.startsWith("http") ? cover : `${storage.url}/${cover}`}
            label={rental.vehicle?.title_original ?? t("rentals.title")}
            style={styles.coverImg}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText}>{t("vehicle.noPhoto")}</Text>
          </View>
        )}

        {showAirport ? (
          <View style={styles.badgeAirport}>
            <Plane size={11} color={colors.white} strokeWidth={2.4} />
            <Text style={styles.badgeAirportText}>{t("rentals.airportDelivery")}</Text>
          </View>
        ) : (
          <View style={styles.badgeDaily}>
            <Calendar size={12} color={colors.white} />
            <Text style={styles.badgeDailyText}>{primaryLabel}</Text>
          </View>
        )}

        {rental.instant_book ? (
          <View style={styles.badgeInstant}>
            <Text style={styles.badgeInstantText}>{t("rentals.instantBook")}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {rental.vehicle?.title_original ?? t("vehicle.fallbackTitle")}{" "}
          {rental.vehicle?.year ? `(${rental.vehicle.year})` : ""}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={12} color={colors.inkFaint} />
          <Text style={styles.locationText}>
            {[rental.city, rental.country_code].filter(Boolean).join(", ") || "—"}
          </Text>
        </View>

        <Text style={styles.availability}>{available}</Text>

        {depositLabel ? (
          <Text style={styles.deposit}>
            {t("rentals.deposit")}: {depositLabel}
          </Text>
        ) : null}

        <View style={styles.packageChipWrap}>
          <Badge
            label={`${t("rentals.withDriver")} · ${t("rentals.withDriverFee", {
              fee: chauffeurFeeLabel,
            })}`}
            tone={withDriverPreferred ? "viridian" : "mist"}
          />
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{primaryRate}</Text>
            <Text style={styles.perDay}>{primaryLabel}</Text>
            {!showMonthly && rental.monthly_rate_amount != null ? (
              <Text style={styles.altRate}>
                {formatListing(rental.monthly_rate_amount, rental.daily_rate_currency)}{" "}
                {t("rentals.perMonth")}
              </Text>
            ) : null}
          </View>
          <View style={styles.arrowBtn}>
            <ChevronRight size={20} color={colors.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: space.xl,
    marginBottom: space.md,
    padding: space.md,
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: BORDER_FLAME,
    borderRadius: radius.md,
    gap: space.sm,
  },
  hintText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.flameDeep,
    lineHeight: 17,
  },
  familyHint: {
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  familyHintText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 17,
  },
  rateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  citySection: {
    marginBottom: space.sm,
  },
  citySectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
    letterSpacing: 0.2,
  },
  cityRow: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    gap: 10,
  },
  cityTile: {
    width: 84,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    gap: 6,
    ...shadow.soft,
  },
  cityTileOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  cityTilePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  cityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cityIconWrapOn: {
    backgroundColor: colors.flame,
  },
  cityTileLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
    textAlign: "center",
  },
  cityTileLabelOn: {
    color: colors.white,
  },
  cityTileMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  cityTileMetaOn: {
    color: "rgba(255,255,255,0.65)",
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  packageHint: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  resultsCount: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  packageChipWrap: {
    marginTop: 10,
  },
  listFlex: { flex: 1 },
  list: { paddingBottom: 40 },
  skeletonWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: 14,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xxl,
    paddingTop: space.xxl,
    paddingBottom: space.section,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: BORDER_FLAME,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  emptyTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 20,
    color: colors.ink,
    marginTop: space.xl,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: space.sm,
    lineHeight: 21,
    maxWidth: 280,
  },
  emptyCta: {
    marginTop: space.lg,
    backgroundColor: colors.flame,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  emptyCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginHorizontal: space.lg,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  coverImg: { width: "100%", height: 176 },
  coverPlaceholder: {
    width: "100%",
    height: 176,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  coverPlaceholderText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaint },
  badgeDaily: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.flameDeep,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeDailyText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  badgeAirport: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B7A4E",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  badgeAirportText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  badgeInstant: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.brass,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeInstantText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  cardBody: { padding: space.lg },
  cardTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  locationText: {
    marginLeft: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  availability: {
    marginTop: 6,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.viridian,
  },
  deposit: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.flame,
    letterSpacing: -0.3,
  },
  perDay: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
  },
  altRate: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  morePad: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
  },
  moreSection: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
    letterSpacing: 0.3,
    marginTop: space.sm,
  },
  moreGroup: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  moreRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  moreRowLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
});
