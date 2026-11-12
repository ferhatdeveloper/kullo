import { Check, ChefHat, Package, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Badge } from "../../ui/Badge";
import {
  nextMerchantStatus,
  type DemoMerchantOrder,
  type MerchantOrderStatus,
} from "../../../lib/partner-demo";
import { colors, fonts, radius, shadow, space } from "../../../lib/theme";

function statusTone(status: MerchantOrderStatus) {
  if (status === "new") return "brass" as const;
  if (status === "accepted" || status === "preparing") return "viridian" as const;
  if (status === "ready") return "viridian" as const;
  if (status === "cancelled") return "danger" as const;
  return "mist" as const;
}

function nextLabel(
  status: MerchantOrderStatus,
  t: (k: string) => string,
): string | null {
  const next = nextMerchantStatus(status);
  if (!next) return null;
  return t(`partnerHub.merchant.advance.${next}`);
}

type Props = {
  order: DemoMerchantOrder;
  formatMoney: (n: number, c: string) => string;
  onAdvance: () => void;
  onCancel: () => void;
};

export function OrderCard({ order, formatMoney, onAdvance, onCancel }: Props) {
  const { t } = useTranslation();
  const advance = nextLabel(order.status, t);
  const isNew = order.status === "new";

  return (
    <View style={[styles.card, isNew && styles.cardNew]}>
      <View style={styles.top}>
        <View>
          <Text style={styles.code}>{order.code}</Text>
          <Text style={styles.customer}>
            {order.customer} · {order.placedAt}
          </Text>
        </View>
        <Badge
          label={t(`partnerHub.merchant.status.${order.status}`)}
          tone={statusTone(order.status)}
        />
      </View>

      <View style={styles.items}>
        {order.items.map((it) => (
          <Text key={`${order.id}-${it.name}`} style={styles.item}>
            {it.qty}× {it.name}
          </Text>
        ))}
      </View>

      {order.note ? <Text style={styles.note}>{order.note}</Text> : null}
      {order.courierName ? (
        <Text style={styles.courier}>{order.courierName}</Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.total}>{formatMoney(order.total, order.currency)}</Text>
        {order.etaMin > 0 ? (
          <Text style={styles.eta}>{order.etaMin} dk</Text>
        ) : null}
      </View>

      {advance ? (
        <View style={styles.actions}>
          {isNew ? (
            <TouchableOpacity style={styles.cancel} onPress={onCancel} activeOpacity={0.88}>
              <X size={16} color={colors.danger} strokeWidth={2.2} />
              <Text style={styles.cancelText}>{t("partnerHub.merchant.reject")}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.advance} onPress={onAdvance} activeOpacity={0.88}>
            {order.status === "preparing" ? (
              <ChefHat size={16} color={colors.white} strokeWidth={2.2} />
            ) : order.status === "ready" ? (
              <Package size={16} color={colors.white} strokeWidth={2.2} />
            ) : (
              <Check size={16} color={colors.white} strokeWidth={2.2} />
            )}
            <Text style={styles.advanceText}>{advance}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: 6,
    ...shadow.soft,
  },
  cardNew: {
    borderColor: colors.flame,
    borderWidth: 1.5,
    backgroundColor: "#FFFAF6",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  code: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  customer: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  items: { marginTop: 4, gap: 2 },
  item: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
  note: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    fontStyle: "italic",
    color: colors.brass,
  },
  courier: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
  },
  footer: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  total: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.flameDeep,
  },
  eta: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkFaint,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: space.sm },
  cancel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#F0CACA",
    backgroundColor: "#FCECEC",
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.danger,
  },
  advance: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.flame,
    paddingVertical: 12,
  },
  advanceText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
});
