import { router, useLocalSearchParams } from "expo-router";
import { Hotel, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { HotelCard } from "../../components/HotelCard";
import { HotelFilterSheet } from "../../components/HotelFilterSheet";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import {
  DEFAULT_HOTEL_FILTERS,
  filterHotels,
  HOTEL_CITY_LABEL_KEY,
  HOTEL_PRICE_PRESETS,
  type HotelListFilters,
} from "../../lib/hotels-catalog";
import { useHotelsInventory } from "../../lib/hotels-inventory-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function HotelsListScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    q?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
  }>();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const hydrate = useHotelsInventory((s) => s.hydrate);
  const byHotel = useHotelsInventory((s) => s.byHotel);
  const minPriceFor = useHotelsInventory((s) => s.minPriceFor);

  const [filters, setFilters] = useState<HotelListFilters>({
    ...DEFAULT_HOTEL_FILTERS,
    q: typeof params.q === "string" ? params.q : "",
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof params.q === "string") {
      setFilters((f) => ({ ...f, q: params.q ?? "" }));
    }
  }, [params.q]);

  const priceByHotel = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const id of Object.keys(byHotel)) {
      map[id] = minPriceFor(id);
    }
    return map;
  }, [byHotel, minPriceFor]);

  const hotels = useMemo(
    () => filterHotels(filters, priceByHotel),
    [filters, priceByHotel],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.city) n += 1;
    if (filters.minStars) n += 1;
    if (filters.minPrice != null || filters.maxPrice != null) n += 1;
    if ((filters.amenities ?? []).length) n += 1;
    if (filters.sort && filters.sort !== "rating_desc") n += 1;
    return n;
  }, [filters]);

  const summaryChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (filters.city) {
      chips.push({
        key: "city",
        label: t(HOTEL_CITY_LABEL_KEY[filters.city]),
        clear: () => setFilters((f) => ({ ...f, city: null })),
      });
    }
    if (filters.minPrice != null || filters.maxPrice != null) {
      const preset = HOTEL_PRICE_PRESETS.find(
        (p) =>
          (p.min ?? null) === (filters.minPrice ?? null) &&
          (p.max ?? null) === (filters.maxPrice ?? null),
      );
      chips.push({
        key: "price",
        label: preset
          ? t(`hotels.pricePreset.${preset.key}`)
          : t("hotels.filterPrice"),
        clear: () =>
          setFilters((f) => ({ ...f, minPrice: null, maxPrice: null })),
      });
    }
    if (filters.minStars) {
      chips.push({
        key: "stars",
        label: `${filters.minStars}+ ★`,
        clear: () => setFilters((f) => ({ ...f, minStars: null })),
      });
    }
    for (const a of filters.amenities ?? []) {
      chips.push({
        key: `amenity-${a}`,
        label: t(`hotels.amenity.${a}`),
        clear: () =>
          setFilters((f) => ({
            ...f,
            amenities: (f.amenities ?? []).filter((x) => x !== a),
          })),
      });
    }
    if (filters.sort && filters.sort !== "rating_desc") {
      const sortLabel =
        filters.sort === "price_asc"
          ? t("hotels.sortPriceAsc")
          : t("hotels.sortPriceDesc");
      chips.push({
        key: "sort",
        label: sortLabel,
        clear: () => setFilters((f) => ({ ...f, sort: "rating_desc" })),
      });
    }
    return chips;
  }, [filters, t]);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("hotels.title")}
        subtitle={t("hotels.subtitle")}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() => router.push("/hotels/manage")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("hotels.manageShort")}
          >
            <Hotel size={18} color={colors.flame} strokeWidth={2} />
          </Pressable>
        }
      />

      <View style={styles.searchRow}>
        <Search size={16} color={colors.inkFaint} strokeWidth={2} />
        <TextInput
          value={filters.q ?? ""}
          onChangeText={(q) => setFilters((f) => ({ ...f, q }))}
          placeholder={t("hotels.searchPlaceholder")}
          placeholderTextColor={colors.inkFaint}
          style={styles.searchInput}
          returnKeyType="search"
        />
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.filterBtn,
            activeFilterCount > 0 && styles.filterBtnOn,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("hotels.filtersTitle")}
        >
          <SlidersHorizontal
            size={15}
            color={activeFilterCount > 0 ? colors.white : colors.ink}
            strokeWidth={2.2}
          />
          <Text
            style={[
              styles.filterBtnLabel,
              activeFilterCount > 0 && styles.filterBtnLabelOn,
            ]}
          >
            {t("hotels.filterCta")}
            {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
          </Text>
        </Pressable>
      </View>

      {summaryChips.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.summaryScroll}
          contentContainerStyle={styles.summaryRow}
        >
          {summaryChips.map((c) => (
            <Pressable
              key={c.key}
              onPress={c.clear}
              style={styles.summaryChip}
              accessibilityRole="button"
              accessibilityLabel={`${c.label}, ${t("hotels.resetFilters")}`}
            >
              <Text style={styles.summaryChipText}>{c.label}</Text>
              <X size={12} color={colors.flameDeep} strokeWidth={2.4} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.resultCount}>
        {t("hotels.resultCount", { count: hotels.length })}
      </Text>

      <FlatList
        style={styles.listFlex}
        data={hotels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("hotels.empty")}</Text>
        }
        renderItem={({ item }) => {
          const from =
            priceByHotel[item.id] != null
              ? Number(priceByHotel[item.id])
              : item.price_amount;
          return (
            <HotelCard
              hotel={item}
              price={formatListing(from, item.price_currency)}
              cityLabel={t(HOTEL_CITY_LABEL_KEY[item.city])}
              nightLabel={t("hotels.perNight")}
              reviewsLabel={t("hotels.reviews")}
              badgeLabel={t("hotels.featured")}
              onPress={() => router.push(`/hotels/${item.id}`)}
            />
          );
        }}
      />

      <HotelFilterSheet
        visible={sheetOpen}
        value={filters}
        onClose={() => setSheetOpen(false)}
        onApply={setFilters}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: space.lg,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterBtnOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  filterBtnLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  filterBtnLabelOn: {
    color: colors.white,
  },
  summaryScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  summaryRow: {
    paddingHorizontal: space.lg,
    gap: 8,
    paddingBottom: 8,
    alignItems: "center",
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: colors.flame,
  },
  summaryChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
  },
  resultCount: {
    marginHorizontal: space.lg,
    marginBottom: 8,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkFaint,
  },
  listFlex: { flex: 1 },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: 40,
    gap: 14,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
