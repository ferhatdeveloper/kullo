import { router } from "expo-router";
import { CalendarDays, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useMemo, useState } from "react";
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

import { DoctorCard } from "../../components/DoctorCard";
import { HealthFilterSheet } from "../../components/HealthFilterSheet";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import {
  DEFAULT_HEALTH_FILTERS,
  filterProviders,
  HEALTH_CITY_LABEL_KEY,
  type HealthListFilters,
} from "../../lib/health-catalog";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function HealthListScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const [filters, setFilters] = useState<HealthListFilters>({
    ...DEFAULT_HEALTH_FILTERS,
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const providers = useMemo(() => filterProviders(filters), [filters]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.city) n += 1;
    if (filters.specialty) n += 1;
    if (filters.meetingType) n += 1;
    return n;
  }, [filters]);

  const summaryChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (filters.city) {
      chips.push({
        key: "city",
        label: t(HEALTH_CITY_LABEL_KEY[filters.city]),
        clear: () => setFilters((f) => ({ ...f, city: null })),
      });
    }
    if (filters.specialty) {
      chips.push({
        key: "specialty",
        label: t(`health.specialty.${filters.specialty}`),
        clear: () => setFilters((f) => ({ ...f, specialty: null })),
      });
    }
    if (filters.meetingType) {
      chips.push({
        key: "meeting",
        label: t(`health.meeting.${filters.meetingType}`),
        clear: () => setFilters((f) => ({ ...f, meetingType: null })),
      });
    }
    return chips;
  }, [filters, t]);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("health.title")}
        subtitle={t("health.subtitle")}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() => router.push("/health/appointments")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("health.myAppointments")}
          >
            <CalendarDays size={18} color={colors.flame} strokeWidth={2} />
          </Pressable>
        }
      />

      <View style={styles.searchRow}>
        <Search size={16} color={colors.inkFaint} strokeWidth={2} />
        <TextInput
          value={filters.q ?? ""}
          onChangeText={(q) => setFilters((f) => ({ ...f, q }))}
          placeholder={t("health.searchPlaceholder")}
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
          accessibilityLabel={t("health.filtersTitle")}
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
            {t("health.filterCta")}
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
              accessibilityLabel={`${c.label}, ${t("health.resetFilters")}`}
            >
              <Text style={styles.summaryChipText}>{c.label}</Text>
              <X size={12} color={colors.flameDeep} strokeWidth={2.4} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.count}>
        {t("health.resultCount", { count: providers.length })}
      </Text>

      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("health.empty")}</Text>
        }
        renderItem={({ item }) => (
          <DoctorCard
            provider={item}
            price={formatListing(item.fee_iqd, item.price_currency)}
            cityLabel={t(HEALTH_CITY_LABEL_KEY[item.city])}
            specialtyLabel={t(`health.specialty.${item.specialty}`)}
            feeLabel={t("health.perVisit")}
            badgeLabel={t("health.featured")}
            onPress={() => router.push(`/health/${item.id}`)}
          />
        )}
      />

      <HealthFilterSheet
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
  count: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 40,
  },
});
