import { router } from "expo-router";
import {
  Hammer,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react-native";
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

import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  TradesFilterSheet,
  type TradesListFilters,
} from "../../components/TradesFilterSheet";
import { useCurrencyStore } from "../../lib/currency-store";
import { KULLO_COMMISSION_RATE } from "../../lib/kullo-commission";
import {
  TRADE_CITY_LABEL_KEY,
  useTradesStore,
  type TradeJob,
  type TradeRole,
} from "../../lib/trades-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function TradesListScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const hydrate = useTradesStore((s) => s.hydrate);
  const hydrated = useTradesStore((s) => s.hydrated);
  const jobs = useTradesStore((s) => s.jobs);
  const offers = useTradesStore((s) => s.offers);
  const role = useTradesStore((s) => s.role);
  const setRole = useTradesStore((s) => s.setRole);

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<TradesListFilters>({
    city: null,
    category: null,
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return jobs
      .filter((j) => (filters.city ? j.city === filters.city : true))
      .filter((j) => (filters.category ? j.category === filters.category : true))
      .filter((j) => {
        if (!qq) return true;
        const hay =
          `${j.title} ${j.description} ${j.customerName} ${j.category}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [jobs, filters, q]);

  const offerCount = (jobId: string) =>
    offers.filter((o) => o.jobId === jobId).length;

  const ratePct = Math.round(KULLO_COMMISSION_RATE * 100);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.city) n += 1;
    if (filters.category) n += 1;
    return n;
  }, [filters]);

  const summaryChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (filters.city) {
      chips.push({
        key: "city",
        label: t(TRADE_CITY_LABEL_KEY[filters.city]),
        clear: () => setFilters((f) => ({ ...f, city: null })),
      });
    }
    if (filters.category) {
      chips.push({
        key: "category",
        label: t(`trades.category.${filters.category}`),
        clear: () => setFilters((f) => ({ ...f, category: null })),
      });
    }
    return chips;
  }, [filters, t]);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("trades.title")}
        subtitle={t("trades.subtitle", { rate: ratePct })}
        onBack={() => router.back()}
        right={
          role === "customer" ? (
            <Pressable
              onPress={() => router.push("/trades/create")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("trades.createCta")}
            >
              <Plus size={20} color={colors.flame} strokeWidth={2.4} />
            </Pressable>
          ) : null
        }
      />

      <RoleToggle role={role} onChange={(r) => void setRole(r)} />

      <View style={styles.searchRow}>
        <Search size={16} color={colors.inkFaint} strokeWidth={2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t("trades.searchPlaceholder")}
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
          accessibilityLabel={t("trades.filtersTitle")}
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
            {t("trades.filterCta")}
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
              accessibilityLabel={`${c.label}, ${t("trades.resetFilters")}`}
            >
              <Text style={styles.summaryChipText}>{c.label}</Text>
              <X size={12} color={colors.flameDeep} strokeWidth={2.4} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.count}>
        {t("trades.resultCount", { count: filtered.length })}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("trades.empty")}</Text>
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            offerCount={offerCount(item.id)}
            budget={formatListing(item.budget_iqd, "IQD")}
            onPress={() => router.push(`/trades/${item.id}`)}
          />
        )}
      />

      <TradesFilterSheet
        visible={sheetOpen}
        value={filters}
        onClose={() => setSheetOpen(false)}
        onApply={setFilters}
      />
    </Screen>
  );
}

function RoleToggle({
  role,
  onChange,
}: {
  role: TradeRole;
  onChange: (r: TradeRole) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.roleRow}>
      {(
        [
          ["customer", t("trades.role.customer")],
          ["worker", t("trades.role.worker")],
        ] as const
      ).map(([key, label]) => {
        const on = role === key;
        return (
          <Pressable
            key={key}
            style={[styles.roleChip, on && styles.roleChipOn]}
            onPress={() => onChange(key)}
          >
            {key === "customer" ? (
              <Hammer
                size={14}
                color={on ? colors.white : colors.ink}
                strokeWidth={2.2}
              />
            ) : (
              <Wrench
                size={14}
                color={on ? colors.white : colors.ink}
                strokeWidth={2.2}
              />
            )}
            <Text style={[styles.roleText, on && styles.roleTextOn]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function JobCard({
  job,
  offerCount,
  budget,
  onPress,
}: {
  job: TradeJob;
  offerCount: number;
  budget: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>
            {t(`trades.category.${job.category}`)}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            job.status === "open" && styles.statusOpen,
            job.status === "awarded" && styles.statusAwarded,
            job.status === "closed" && styles.statusClosed,
          ]}
        >
          <Text style={styles.statusText}>
            {t(`trades.status.${job.status}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {job.title}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {job.description}
      </Text>
      <View style={styles.cardMeta}>
        <View style={styles.metaLeft}>
          <MapPin size={13} color={colors.inkFaint} strokeWidth={2.2} />
          <Text style={styles.metaText}>
            {t(TRADE_CITY_LABEL_KEY[job.city])} · {job.customerName}
          </Text>
        </View>
        <Text style={styles.budget}>{budget}</Text>
      </View>
      <Text style={styles.offerHint}>
        {t("trades.offerCount", { count: offerCount })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  roleChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roleChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  roleText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  roleTextOn: { color: colors.white },
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
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkFaint,
    paddingHorizontal: space.lg,
    marginBottom: 6,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl * 2,
    gap: 10,
  },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  catBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusOpen: { backgroundColor: colors.flameSoft },
  statusAwarded: { backgroundColor: colors.brandSoft },
  statusClosed: { backgroundColor: colors.mist },
  statusText: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.inkMuted,
  },
  cardTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaLeft: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    flexShrink: 1,
  },
  budget: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flameDeep,
  },
  offerHint: {
    marginTop: 8,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.viridian,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
});
