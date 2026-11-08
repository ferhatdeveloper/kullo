import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pencil } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TravelFilterSheet } from "../../../components/TravelFilterSheet";
import { TravelOfferCard } from "../../../components/TravelOfferCard";
import { TravelResultsBar } from "../../../components/TravelResultsBar";
import { TravelSortSheet } from "../../../components/TravelSortSheet";
import { Screen } from "../../../components/ui/Screen";
import { useCurrencyStore } from "../../../lib/currency-store";
import {
  DEFAULT_TRAVEL_FILTERS,
  filterBusOffers,
  getBusProvider,
  placeLabel,
  type BusOffer,
  type TravelListFilters,
} from "../../../lib/travel";
import { colors, fonts, space } from "../../../lib/theme";

function durationLabel(min: number, t: (k: string, o?: object) => string) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return t("travel.durationMin", { m });
  return t("travel.durationHm", { h, m });
}

function stopsLabel(stops: number, t: (k: string, o?: object) => string) {
  if (stops === 0) return t("travel.stopsDirect");
  return t("travel.stopsCount", { n: stops });
}

function cityName(code: string, lang: "tr" | "en") {
  return placeLabel(code, lang).replace(/\s*\([^)]*\)\s*$/, "");
}

function dateChipLabel(iso: string, lang: "tr" | "en") {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BusResultsScreen() {
  const { t, i18n } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    date?: string;
    adults?: string;
    children?: string;
  }>();

  const from = String(params.from ?? "EBL").toUpperCase();
  const to = String(params.to ?? "BGW").toUpperCase();
  const date = String(params.date ?? "2026-11-20");
  const adults = Number(params.adults ?? 1) || 1;
  const children = Number(params.children ?? 0) || 0;

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<BusOffer[]>([]);
  const [filters, setFilters] = useState<TravelListFilters>({
    ...DEFAULT_TRAVEL_FILTERS,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const dateOptions = useMemo(
    () => [-1, 0, 1, 2, 3].map((d) => shiftDate(date, d)),
    [date],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getBusProvider()
      .search({
        from,
        to,
        date,
        pax: { adults, children, infants: 0 },
      })
      .then((list) => {
        if (!cancelled) setOffers(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, date, adults, children]);

  const filtered = useMemo(
    () => filterBusOffers(offers, filters),
    [offers, filters],
  );

  const selectOffer = (offer: BusOffer) => {
    Alert.alert(
      t("travel.selectTitle"),
      t("travel.selectBusBody", {
        bus: offer.busNo,
        price: formatListing(offer.price_iqd, "IQD"),
      }),
      [{ text: t("travel.ok") }],
    );
  };

  const editSearch = () =>
    router.push({
      pathname: "/travel/bus/search",
      params: {
        from,
        to,
        date,
        adults: String(adults),
        children: String(children),
      },
    });

  const shareMsg = `${cityName(from, lang)} → ${cityName(to, lang)} · ${date}`;

  return (
    <Screen edges={["top"]} brand={false} style={styles.root}>
      {/* Ucuzabilet: koyu rota header — AppHeader yok, alt reklam yok */}
      <View style={styles.routeHead}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.white} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.routeCenter}>
          <Text style={styles.routeTitle} numberOfLines={1}>
            {cityName(from, lang)}{" "}
            <Text style={styles.routeArrow}>→</Text> {cityName(to, lang)}
          </Text>
          <Text style={styles.routeInfo} numberOfLines={1}>
            {t("travel.priceInfo")}
          </Text>
        </View>
        <Pressable
          onPress={editSearch}
          style={styles.editBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("travel.editSearch")}
        >
          <Pencil size={16} color={colors.flameMid} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Tarih şeridi */}
      <View style={styles.dateStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateStripInner}
        >
          {dateOptions.map((iso) => {
            const on = iso === date;
            const minPrice =
              on && filtered[0]
                ? formatListing(filtered[0].price_iqd, "IQD")
                : undefined;
            return (
              <Pressable
                key={iso}
                onPress={() => {
                  if (iso === date) return;
                  router.setParams({ date: iso });
                }}
                style={[styles.dateChip, on && styles.dateChipOn]}
              >
                <Text style={[styles.dateChipDay, on && styles.dateChipDayOn]}>
                  {dateChipLabel(iso, lang)}
                </Text>
                {minPrice ? (
                  <Text style={[styles.dateChipPrice, on && styles.dateChipDayOn]}>
                    {minPrice}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.flame} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          style={styles.listFlex}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{t("travel.empty")}</Text>
          }
          renderItem={({ item }) => (
            <TravelOfferCard
              offer={item}
              fromCode={item.from}
              toCode={item.to}
              priceLabel={formatListing(item.price_iqd, "IQD")}
              durationLabel={durationLabel(item.durationMin, t)}
              stopsLabel={stopsLabel(item.stops, t)}
              cabinOrSeatLabel={t(`travel.class.${item.seatType}`)}
              detailLabel={t("travel.detail")}
              onPress={() => selectOffer(item)}
            />
          )}
        />
      )}

      <TravelResultsBar
        sortLabel={t("travel.sortTitle")}
        filterLabel={t("travel.filterBar")}
        shareLabel={t("travel.share")}
        shareMessage={shareMsg}
        onSort={() => setSortOpen(true)}
        onFilter={() => setFilterOpen(true)}
      />

      <TravelSortSheet
        visible={sortOpen}
        value={filters.sort}
        onClose={() => setSortOpen(false)}
        onSelect={(sort) => setFilters((f) => ({ ...f, sort }))}
      />

      <TravelFilterSheet
        visible={filterOpen}
        mode="bus"
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#1A3A5C" },
  routeHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A3A5C",
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  routeCenter: { flex: 1, minWidth: 0, paddingHorizontal: 4 },
  routeTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
  },
  routeArrow: { color: colors.flameMid },
  routeInfo: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
  },
  editBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dateStrip: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  dateStripInner: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.line,
    minWidth: 92,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  dateChipOn: {
    backgroundColor: "#F5C518",
  },
  dateChipDay: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.ink,
  },
  dateChipDayOn: { color: colors.ink, fontFamily: fonts.bodySemi },
  dateChipPrice: {
    marginTop: 2,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
  },
  listFlex: {
    flex: 1,
    backgroundColor: "#E8EEF4",
  },
  list: {
    paddingTop: 10,
    paddingBottom: space.lg,
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EEF4",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontFamily: fonts.body,
    color: colors.inkMuted,
  },
});
