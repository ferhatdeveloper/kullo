import { router } from "expo-router";
import { Building2, Package, Plus, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  B2BFilterSheet,
  type B2BStatusFilter,
} from "../../components/B2BFilterSheet";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  useB2BStore,
  type B2BRequest,
  type B2BRole,
} from "../../lib/b2b-store";
import { KULLO_COMMISSION_RATE } from "../../lib/kullo-commission";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function B2BListScreen() {
  const { t } = useTranslation();
  const hydrate = useB2BStore((s) => s.hydrate);
  const hydrated = useB2BStore((s) => s.hydrated);
  const requests = useB2BStore((s) => s.requests);
  const offers = useB2BStore((s) => s.offers);
  const role = useB2BStore((s) => s.role);
  const setRole = useB2BStore((s) => s.setRole);
  const [status, setStatus] = useState<B2BStatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const filtered = useMemo(() => {
    const list =
      status === "all" ? requests : requests.filter((r) => r.status === status);
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [requests, status]);

  const offerCount = (id: string) =>
    offers.filter((o) => o.requestId === id).length;

  const activeFilterCount = status === "all" ? 0 : 1;

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("b2b.title")}
        subtitle={t("b2b.subtitle", {
          percent: Math.round(KULLO_COMMISSION_RATE * 100),
        })}
        onBack={() => router.back()}
        right={
          role === "company" ? (
            <Pressable
              onPress={() => router.push("/b2b/create")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("b2b.createCta")}
              style={styles.plusBtn}
            >
              <Plus size={18} color={colors.white} strokeWidth={2.4} />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.roleRow}>
        <RoleChip
          active={role === "company"}
          label={t("b2b.role.company")}
          onPress={() => void setRole("company")}
        />
        <RoleChip
          active={role === "wholesale"}
          label={t("b2b.role.wholesale")}
          onPress={() => void setRole("wholesale")}
        />
      </View>

      <Text style={styles.roleHint}>
        {role === "company" ? t("b2b.roleHint.company") : t("b2b.roleHint.wholesale")}
      </Text>

      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.filterBtn,
            activeFilterCount > 0 && styles.filterBtnOn,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("b2b.filtersTitle")}
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
            {t("b2b.filterCta")}
            {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
          </Text>
        </Pressable>

        {status !== "all" ? (
          <Pressable
            onPress={() => setStatus("all")}
            style={styles.summaryChip}
            accessibilityRole="button"
            accessibilityLabel={`${t(`b2b.status.${status}`)}, ${t("b2b.resetFilters")}`}
          >
            <Text style={styles.summaryChipText}>
              {t(`b2b.status.${status}`)}
            </Text>
            <X size={12} color={colors.flameDeep} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>

      {!hydrated ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.flame} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{t("b2b.empty")}</Text>
          }
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              offerCount={offerCount(item.id)}
              role={role}
              onPress={() => router.push(`/b2b/${item.id}`)}
            />
          )}
        />
      )}

      <B2BFilterSheet
        visible={sheetOpen}
        value={status}
        onClose={() => setSheetOpen(false)}
        onApply={setStatus}
      />
    </Screen>
  );
}

function RoleChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleChip, active && styles.roleChipOn]}
    >
      <Text style={[styles.roleChipText, active && styles.roleChipTextOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

function RequestCard({
  item,
  offerCount,
  role,
  onPress,
}: {
  item: B2BRequest;
  offerCount: number;
  role: B2BRole;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.category === "building" ? Building2 : Package;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardIcon}>
        <Icon size={20} color={colors.flame} strokeWidth={2.2} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardMeta}>
          {item.companyName} · {item.city}
        </Text>
        <Text style={styles.cardQty}>
          {item.quantity} {item.unit} · {t(`b2b.category.${item.category}`)}
        </Text>
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusPill,
              item.status === "open" && styles.statusOpen,
              item.status === "accepted" && styles.statusAccepted,
            ]}
          >
            <Text style={styles.statusText}>
              {t(`b2b.status.${item.status}`)}
            </Text>
          </View>
          <Text style={styles.offerCount}>
            {t("b2b.offerCount", { count: offerCount })}
            {role === "wholesale" && item.status === "open"
              ? ` · ${t("b2b.tapToBid")}`
              : ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  roleRow: {
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  roleChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  roleChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  roleChipTextOn: {
    color: colors.white,
  },
  roleHint: {
    paddingHorizontal: space.lg,
    marginBottom: space.md,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
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
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.section,
    gap: space.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: 48,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
  card: {
    flexDirection: "row",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow.card,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 2,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  cardQty: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.sm,
    flexWrap: "wrap",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  statusOpen: { backgroundColor: colors.brandSoft },
  statusAccepted: { backgroundColor: colors.flameSoft },
  statusText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
  },
  offerCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
});
