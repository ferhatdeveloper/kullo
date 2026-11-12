import {
  Check,
  MapPin,
  Navigation,
  CarTaxiFront,
  Package,
  Plane,
  Users,
  X,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Badge } from "../../ui/Badge";
import type { DemoDriverTrip, DriverTripKind } from "../../../lib/demo-data";
import { colors, fonts, radius, shadow, space } from "../../../lib/theme";

function kindIcon(kind: DriverTripKind) {
  if (kind === "shared") return Users;
  if (kind === "airport") return Plane;
  if (kind === "parcel") return Package;
  return CarTaxiFront;
}

type Props = {
  trip: DemoDriverTrip;
  formatFare: (n: number, c: string) => string;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
};

export function TripCard({
  trip,
  formatFare,
  onAccept,
  onReject,
  onComplete,
}: Props) {
  const { t } = useTranslation();
  const Icon = kindIcon(trip.kind);
  const tone =
    trip.status === "incoming"
      ? ("brass" as const)
      : trip.status === "active"
        ? ("viridian" as const)
        : ("mist" as const);

  return (
    <View style={[styles.card, trip.status === "incoming" && styles.cardIncoming]}>
      <View style={styles.top}>
        <View style={styles.kindRow}>
          <View style={styles.kindIcon}>
            <Icon size={15} color={colors.flame} strokeWidth={2.3} />
          </View>
          <Text style={styles.kind}>{t(`driver.modes.${trip.kind}`)}</Text>
        </View>
        <Badge label={t(`driver.status.${trip.status}`)} tone={tone} />
      </View>

      <View style={styles.route}>
        <MapPin size={14} color={colors.inkFaint} />
        <Text style={styles.routeText}>{trip.from}</Text>
      </View>
      <View style={styles.route}>
        <Navigation size={14} color={colors.flame} />
        <Text style={styles.routeText}>{trip.to}</Text>
      </View>

      <Text style={styles.fare}>
        {formatFare(trip.fare, trip.currency)}
        {trip.seats
          ? ` · ${trip.seats} ${t("driver.seats")}`
          : trip.etaMin > 0
            ? ` · ${trip.etaMin} dk`
            : ""}
      </Text>

      {trip.status === "incoming" ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.reject} onPress={onReject} activeOpacity={0.88}>
            <X size={16} color={colors.danger} strokeWidth={2.2} />
            <Text style={styles.rejectText}>{t("driver.reject")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accept} onPress={onAccept} activeOpacity={0.88}>
            <Check size={16} color={colors.white} strokeWidth={2.2} />
            <Text style={styles.acceptText}>{t("driver.accept")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {trip.status === "active" ? (
        <TouchableOpacity style={styles.finish} onPress={onComplete} activeOpacity={0.9}>
          <Text style={styles.finishText}>{t("driver.complete")}</Text>
        </TouchableOpacity>
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
  cardIncoming: {
    borderColor: "#FFD8B8",
    backgroundColor: "#FFFAF6",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kindRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  kindIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  kind: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  route: { flexDirection: "row", alignItems: "center", gap: 6 },
  routeText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  fare: {
    marginTop: 4,
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.flameDeep,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: space.sm },
  reject: {
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
  rejectText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.danger,
  },
  accept: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.flame,
    paddingVertical: 12,
  },
  acceptText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  finish: {
    marginTop: space.sm,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
  },
  finishText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
});
