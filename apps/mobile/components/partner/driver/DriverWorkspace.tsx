import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Filter,
  LayoutDashboard,
  ListOrdered,
  Power,
  Settings2,
  Wallet,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PartnerShell } from "../PartnerShell";
import { PartnerSheet } from "../PartnerSheet";
import { TripCard } from "./TripCard";
import {
  DEMO_DRIVER_STATS,
  DEMO_DRIVER_TRIPS,
  type DemoDriverTrip,
} from "../../../lib/demo-data";
import { useCurrencyStore } from "../../../lib/currency-store";
import {
  usePartnerStore,
  type DriverMode,
} from "../../../lib/partner-store";
import { colors, fonts, radius, shadow, space } from "../../../lib/theme";

type TabKey = "home" | "trips" | "earnings" | "more";

export function DriverWorkspace() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const online = usePartnerStore((s) => s.driverOnline);
  const setOnline = usePartnerStore((s) => s.setDriverOnline);
  const mode = usePartnerStore((s) => s.driverMode);
  const setMode = usePartnerStore((s) => s.setDriverMode);
  const clearRole = usePartnerStore((s) => s.clearRole);

  const [tab, setTab] = useState<TabKey>("home");
  const [trips, setTrips] = useState(DEMO_DRIVER_TRIPS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    if (mode === "all") return trips.filter((x) => x.kind !== "parcel");
    return trips.filter((x) => x.kind === mode);
  }, [trips, mode]);

  const incoming = filtered.filter((x) => x.status === "incoming");
  const active = filtered.filter((x) => x.status === "active");
  const done = filtered.filter((x) => x.status === "done");

  const setStatus = (id: string, status: DemoDriverTrip["status"]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTrips((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const tabs = [
    { key: "home", label: t("partnerHub.nav.live"), Icon: LayoutDashboard },
    { key: "trips", label: t("partnerHub.nav.trips"), Icon: ListOrdered },
    { key: "earnings", label: t("partnerHub.nav.earnings"), Icon: Wallet },
    { key: "more", label: t("partnerHub.nav.more"), Icon: Settings2 },
  ];

  const modeLabel =
    mode === "all"
      ? t("driver.modes.all")
      : t(`driver.modes.${mode}`);

  return (
    <PartnerShell
      title={t("partnerHub.driver.title")}
      subtitle={t("partnerHub.driver.subtitle")}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(k) => setTab(k as TabKey)}
      live={online}
      liveLabel={t("driver.online")}
      onSwitchRole={async () => {
        await clearRole();
        router.replace("/partner/role-select");
      }}
      headerRight={
        <Pressable
          onPress={() => setSheetOpen(true)}
          hitSlop={8}
          style={styles.filterBtn}
        >
          <Filter size={16} color={colors.white} strokeWidth={2.2} />
        </Pressable>
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === "home" ? (
          <>
            <Pressable
              style={[styles.onlineCard, online ? styles.onlineOn : styles.onlineOff]}
              onPress={() => {
                void Haptics.notificationAsync(
                  online
                    ? Haptics.NotificationFeedbackType.Warning
                    : Haptics.NotificationFeedbackType.Success,
                );
                void setOnline(!online);
              }}
            >
              <View style={styles.onlineIcon}>
                <Power size={22} color={colors.white} strokeWidth={2.4} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.onlineTitle}>
                  {online ? t("driver.online") : t("driver.offline")}
                </Text>
                <Text style={styles.onlineSub}>
                  {online ? t("driver.onlineHint") : t("driver.offlineHint")}
                </Text>
              </View>
              {incoming.length > 0 && online ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{incoming.length}</Text>
                </View>
              ) : null}
            </Pressable>

            <View style={styles.statRow}>
              <Stat
                label={t("driver.stats.earnings")}
                value={formatListing(DEMO_DRIVER_STATS.todayEarnings, "IQD")}
              />
              <Stat
                label={t("driver.stats.trips")}
                value={String(DEMO_DRIVER_STATS.tripsToday)}
              />
              <Stat
                label={t("driver.stats.rating")}
                value={DEMO_DRIVER_STATS.rating.toFixed(1)}
              />
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.section}>{t("partnerHub.driver.incoming")}</Text>
              <Pressable onPress={() => setSheetOpen(true)}>
                <Text style={styles.modeChip}>{modeLabel}</Text>
              </Pressable>
            </View>

            {!online ? (
              <Text style={styles.empty}>{t("driver.goOnline")}</Text>
            ) : incoming.length === 0 && active.length === 0 ? (
              <Text style={styles.empty}>{t("partnerHub.driver.noTrips")}</Text>
            ) : (
              <>
                {incoming.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    formatFare={formatListing}
                    onAccept={() => setStatus(trip.id, "active")}
                    onReject={() => setStatus(trip.id, "done")}
                    onComplete={() => setStatus(trip.id, "done")}
                  />
                ))}
                {active.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    formatFare={formatListing}
                    onAccept={() => {}}
                    onReject={() => {}}
                    onComplete={() => setStatus(trip.id, "done")}
                  />
                ))}
              </>
            )}
          </>
        ) : null}

        {tab === "trips" ? (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.section}>{t("driver.trips")}</Text>
              <Pressable onPress={() => setSheetOpen(true)}>
                <Text style={styles.modeChip}>{modeLabel}</Text>
              </Pressable>
            </View>
            {filtered.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                formatFare={formatListing}
                onAccept={() => setStatus(trip.id, "active")}
                onReject={() => setStatus(trip.id, "done")}
                onComplete={() => setStatus(trip.id, "done")}
              />
            ))}
            {done.length === 0 && filtered.length === 0 ? (
              <Text style={styles.empty}>{t("partnerHub.driver.noTrips")}</Text>
            ) : null}
          </>
        ) : null}

        {tab === "earnings" ? (
          <>
            <View style={styles.earnHero}>
              <Text style={styles.earnLabel}>{t("driver.stats.earnings")}</Text>
              <Text style={styles.earnValue}>
                {formatListing(DEMO_DRIVER_STATS.todayEarnings, "IQD")}
              </Text>
              <Text style={styles.earnMeta}>
                {DEMO_DRIVER_STATS.tripsToday} {t("driver.stats.trips").toLowerCase()} ·{" "}
                {DEMO_DRIVER_STATS.onlineHours}s online
              </Text>
            </View>
            <Pressable
              style={styles.walletRow}
              onPress={() => router.push("/wallet")}
            >
              <Wallet size={18} color={colors.flame} />
              <Text style={styles.walletText}>{t("driver.payouts")}</Text>
            </Pressable>
          </>
        ) : null}

        {tab === "more" ? (
          <>
            <MoreRow
              label={t("partnerHub.switchRole")}
              onPress={async () => {
                await clearRole();
                router.replace("/partner/role-select");
              }}
            />
            <MoreRow
              label={t("partnerHub.driver.listingsLegacy")}
              onPress={() => router.push("/partner/listings")}
            />
            <MoreRow
              label={t("hub.pay")}
              onPress={() => router.push("/wallet")}
            />
          </>
        ) : null}
      </ScrollView>

      <PartnerSheet
        visible={sheetOpen}
        title={t("partnerHub.driver.filterTitle")}
        subtitle={t("partnerHub.driver.filterHint")}
        selected={mode}
        onClose={() => setSheetOpen(false)}
        onSelect={(key) => void setMode(key as DriverMode | "all")}
        options={[
          { key: "all", label: t("driver.modes.all"), hint: t("partnerHub.driver.filterAllHint") },
          { key: "taxi", label: t("driver.modes.taxi") },
          { key: "shared", label: t("driver.modes.shared") },
          { key: "airport", label: t("driver.modes.airport") },
          {
            key: "parcel",
            label: t("driver.modes.parcel"),
            hint: t("partnerHub.courierSoon"),
          },
        ]}
      />
    </PartnerShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function MoreRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.moreRow} onPress={onPress}>
      <Text style={styles.moreText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.lg,
    paddingBottom: space.section,
    gap: space.sm,
  },
  flex: { flex: 1 },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  onlineCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderRadius: radius.xl,
    padding: space.lg,
    ...shadow.soft,
  },
  onlineOn: { backgroundColor: colors.flame },
  onlineOff: { backgroundColor: colors.inkMuted },
  onlineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.white,
  },
  onlineSub: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
  },
  statRow: { flexDirection: "row", gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  statValue: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  sectionHead: {
    marginTop: space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  modeChip: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
    backgroundColor: colors.flameSoft,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
    paddingVertical: space.xl,
    textAlign: "center",
  },
  earnHero: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: space.xl,
    ...shadow.soft,
  },
  earnLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  earnValue: {
    marginTop: 6,
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.white,
  },
  earnMeta: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.flameMid,
  },
  walletRow: {
    marginTop: space.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  walletText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  moreRow: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  moreText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
});
