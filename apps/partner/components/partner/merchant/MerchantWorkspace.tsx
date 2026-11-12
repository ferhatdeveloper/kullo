import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ChefHat,
  Settings2,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { PartnerShell } from "../PartnerShell";
import { PartnerSheet } from "../PartnerSheet";
import { OrderCard } from "./OrderCard";
import {
  DEMO_MENU_ITEMS,
  DEMO_MERCHANT_ORDERS,
  DEMO_MERCHANT_STATS,
  nextMerchantStatus,
  type DemoMenuItem,
  type DemoMerchantOrder,
  type MerchantOrderStatus,
} from "../../../lib/partner-demo";
import {
  usePartnerStore,
  type MerchantVertical,
} from "../../../lib/partner-store";
import { formatIqd } from "../../../lib/money";
import { colors, fonts, radius, shadow, space } from "../../../lib/theme";

type TabKey = "kitchen" | "menu" | "earnings" | "more";

export function MerchantWorkspace() {
  const { t } = useTranslation();
  const open = usePartnerStore((s) => s.merchantOpen);
  const setOpen = usePartnerStore((s) => s.setMerchantOpen);
  const vertical = usePartnerStore((s) => s.merchantVertical);
  const setVertical = usePartnerStore((s) => s.setMerchantVertical);
  const clearRole = usePartnerStore((s) => s.clearRole);

  const [tab, setTab] = useState<TabKey>("kitchen");
  const [orders, setOrders] = useState(DEMO_MERCHANT_ORDERS);
  const [menu, setMenu] = useState(DEMO_MENU_ITEMS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [statusSheet, setStatusSheet] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "done">(
    "active",
  );

  const queue = useMemo(() => {
    if (statusFilter === "all") return orders;
    if (statusFilter === "done") {
      return orders.filter(
        (o) => o.status === "handed" || o.status === "cancelled",
      );
    }
    return orders.filter(
      (o) =>
        o.status === "new" ||
        o.status === "accepted" ||
        o.status === "preparing" ||
        o.status === "ready",
    );
  }, [orders, statusFilter]);

  const newCount = orders.filter((o) => o.status === "new").length;

  const advance = (id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = nextMerchantStatus(o.status);
        return next ? { ...o, status: next } : o;
      }),
    );
  };

  const cancel = (id: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "cancelled" as MerchantOrderStatus } : o,
      ),
    );
  };

  const toggleMenu = (id: string) => {
    setMenu((prev) =>
      prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m)),
    );
  };

  const tabs = [
    { key: "kitchen", label: t("partnerHub.nav.kitchen"), Icon: ChefHat },
    { key: "menu", label: t("partnerHub.nav.menu"), Icon: UtensilsCrossed },
    { key: "earnings", label: t("partnerHub.nav.earnings"), Icon: Wallet },
    { key: "more", label: t("partnerHub.nav.more"), Icon: Settings2 },
  ];

  const verticalLabel =
    vertical === "food"
      ? t("partnerHub.merchant.vertical.food")
      : t("partnerHub.merchant.vertical.market");

  return (
    <PartnerShell
      title={t("partnerHub.merchant.title")}
      subtitle={t("partnerHub.merchant.subtitle")}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(k) => setTab(k as TabKey)}
      live={open}
      liveLabel={t("partnerHub.merchant.open")}
      onSwitchRole={async () => {
        await clearRole();
        router.replace("/role-select");
      }}
      headerRight={
        <Pressable
          onPress={() => setSheetOpen(true)}
          hitSlop={8}
          style={styles.filterBtn}
        >
          <Store size={16} color={colors.white} strokeWidth={2.2} />
        </Pressable>
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === "kitchen" ? (
          <>
            <View style={styles.openCard}>
              <View style={styles.flex}>
                <Text style={styles.openTitle}>
                  {open
                    ? t("partnerHub.merchant.open")
                    : t("partnerHub.merchant.closed")}
                </Text>
                <Text style={styles.openSub}>
                  {open
                    ? t("partnerHub.merchant.openHint")
                    : t("partnerHub.merchant.closedHint")}
                </Text>
              </View>
              <Switch
                value={open}
                onValueChange={(v) => {
                  void Haptics.selectionAsync();
                  void setOpen(v);
                }}
                trackColor={{ false: colors.line, true: colors.flame }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.statRow}>
              <Stat
                label={t("partnerHub.merchant.stats.orders")}
                value={String(DEMO_MERCHANT_STATS.todayOrders)}
              />
              <Stat
                label={t("partnerHub.merchant.stats.revenue")}
                value={formatIqd(DEMO_MERCHANT_STATS.todayRevenue, "IQD")}
              />
              <Stat
                label={t("partnerHub.merchant.stats.prep")}
                value={`${DEMO_MERCHANT_STATS.avgPrepMin}dk`}
              />
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.section}>
                {t("partnerHub.merchant.queue")}
                {newCount > 0 ? ` · ${newCount}` : ""}
              </Text>
              <View style={styles.headActions}>
                <Pressable onPress={() => setSheetOpen(true)}>
                  <Text style={styles.modeChip}>{verticalLabel}</Text>
                </Pressable>
                <Pressable onPress={() => setStatusSheet(true)}>
                  <Text style={styles.modeChip}>
                    {t(`partnerHub.merchant.filter.${statusFilter}`)}
                  </Text>
                </Pressable>
              </View>
            </View>

            {!open ? (
              <Text style={styles.empty}>{t("partnerHub.merchant.goOpen")}</Text>
            ) : queue.length === 0 ? (
              <Text style={styles.empty}>{t("partnerHub.merchant.noOrders")}</Text>
            ) : (
              queue.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  formatMoney={formatIqd}
                  onAdvance={() => advance(order.id)}
                  onCancel={() => cancel(order.id)}
                />
              ))
            )}
          </>
        ) : null}

        {tab === "menu" ? (
          <>
            <Text style={styles.section}>{t("partnerHub.merchant.menuTitle")}</Text>
            {menu.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                formatMoney={formatIqd}
                onToggle={() => toggleMenu(item.id)}
              />
            ))}
          </>
        ) : null}

        {tab === "earnings" ? (
          <>
            <View style={styles.earnHero}>
              <Text style={styles.earnLabel}>
                {t("partnerHub.merchant.stats.revenue")}
              </Text>
              <Text style={styles.earnValue}>
                {formatIqd(DEMO_MERCHANT_STATS.todayRevenue, "IQD")}
              </Text>
              <Text style={styles.earnMeta}>
                {DEMO_MERCHANT_STATS.todayOrders}{" "}
                {t("partnerHub.merchant.stats.orders").toLowerCase()} · %
                {DEMO_MERCHANT_STATS.acceptanceRate} kabul
              </Text>
            </View>
            <Pressable
              style={styles.walletRow}
              onPress={() => {}}
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
                router.replace("/role-select");
              }}
            />
            <MoreRow
              label={t("partnerHub.merchant.listingsLegacy")}
              onPress={() => {}}
            />
            <MoreRow
              label={t("hub.pay")}
              onPress={() => {}}
            />
          </>
        ) : null}
      </ScrollView>

      <PartnerSheet
        visible={sheetOpen}
        title={t("partnerHub.merchant.verticalTitle")}
        subtitle={t("partnerHub.merchant.verticalHint")}
        selected={vertical}
        onClose={() => setSheetOpen(false)}
        onSelect={(key) => {
          if (key === "market") return;
          void setVertical(key as MerchantVertical);
        }}
        options={[
          {
            key: "food",
            label: t("partnerHub.merchant.vertical.food"),
            hint: t("partnerHub.merchant.vertical.foodHint"),
          },
          {
            key: "market",
            label: t("partnerHub.merchant.vertical.market"),
            hint: t("partnerHub.merchant.vertical.marketSoon"),
            disabled: true,
          },
        ]}
      />

      <PartnerSheet
        visible={statusSheet}
        title={t("partnerHub.merchant.filterTitle")}
        selected={statusFilter}
        onClose={() => setStatusSheet(false)}
        onSelect={(key) =>
          setStatusFilter(key as "active" | "all" | "done")
        }
        options={[
          { key: "active", label: t("partnerHub.merchant.filter.active") },
          { key: "all", label: t("partnerHub.merchant.filter.all") },
          { key: "done", label: t("partnerHub.merchant.filter.done") },
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

function MenuRow({
  item,
  formatMoney,
  onToggle,
}: {
  item: DemoMenuItem;
  formatMoney: (n: number, c: string) => string;
  onToggle: () => void;
}) {
  return (
    <View style={styles.menuRow}>
      <View style={styles.flex}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuMeta}>
          {item.category} · {formatMoney(item.price, item.currency)}
        </Text>
      </View>
      <Switch
        value={item.available}
        onValueChange={onToggle}
        trackColor={{ false: colors.line, true: colors.flame }}
        thumbColor={colors.white}
      />
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
  openCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    ...shadow.soft,
  },
  openTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  openSub: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
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
    gap: 8,
  },
  headActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  menuName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  menuMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
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
