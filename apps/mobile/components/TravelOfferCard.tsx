import { Bus, Info, Luggage, Plane } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { BusOffer, FlightOffer } from "../lib/travel";
import { colors, fonts, shadow, space } from "../lib/theme";

type Props = {
  offer: FlightOffer | BusOffer;
  fromCode: string;
  toCode: string;
  priceLabel: string;
  durationLabel: string;
  stopsLabel: string;
  cabinOrSeatLabel: string;
  detailLabel: string;
  baggageLabel?: string;
  onPress: () => void;
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function TravelOfferCard({
  offer,
  fromCode,
  toCode,
  priceLabel,
  durationLabel,
  stopsLabel,
  cabinOrSeatLabel,
  detailLabel,
  baggageLabel,
  onPress,
}: Props) {
  const isFlight = offer.mode === "flight";
  const carrier = isFlight ? offer.airline : offer.operator;
  const code = isFlight ? offer.flightNo : offer.busNo;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.94 }]}
      accessibilityRole="button"
      accessibilityLabel={`${carrier} ${priceLabel}`}
    >
      <View style={styles.body}>
        {/* Sol: logo + carrier — ~18% */}
        <View style={styles.carrierCol}>
          <View style={styles.logo}>
            {isFlight ? (
              <Plane size={16} color={colors.flame} strokeWidth={2.2} />
            ) : (
              <Bus size={16} color={colors.flame} strokeWidth={2.2} />
            )}
          </View>
          <Text style={styles.carrier} numberOfLines={2}>
            {carrier}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {code}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {cabinOrSeatLabel}
          </Text>
        </View>

        {/* Orta: saat / süre / aktarma — flex */}
        <View style={styles.midCol}>
          <View style={styles.timesRow}>
            <View style={styles.leg}>
              <Text style={styles.timeDepart}>{fmtTime(offer.departAt)}</Text>
              <Text style={styles.code}>{fromCode}</Text>
            </View>
            <View style={styles.mid}>
              <Text style={styles.duration} numberOfLines={1}>
                {durationLabel}
              </Text>
              <View style={styles.lineRow}>
                <View style={styles.line} />
                <View style={styles.dot} />
                <View style={styles.line} />
              </View>
              <Text style={styles.stops} numberOfLines={1}>
                {stopsLabel}
              </Text>
            </View>
            <View style={[styles.leg, styles.legEnd]}>
              <Text
                style={[styles.timeArrive, isFlight && styles.timeArriveFlight]}
              >
                {fmtTime(offer.arriveAt)}
              </Text>
              <Text style={styles.code}>{toCode}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            {baggageLabel ? (
              <View style={styles.bagRow}>
                <Luggage size={13} color={colors.inkMuted} strokeWidth={2} />
                <Text style={styles.bagText}>{baggageLabel}</Text>
              </View>
            ) : (
              <View />
            )}
            <View style={styles.detailRow}>
              <Info size={13} color={colors.inkMuted} strokeWidth={2} />
              <Text style={styles.detailText}>{detailLabel}</Text>
            </View>
          </View>
        </View>

        {/* Sağ: fiyat — kesik dikey çizgi */}
        <View style={styles.priceRail}>
          <View style={styles.dash} />
          <View style={styles.priceCol}>
            <Text style={styles.price}>{priceLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const CARD_RADIUS = 8;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: CARD_RADIUS,
    marginBottom: 8,
    marginHorizontal: space.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  body: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 10,
    paddingLeft: 10,
    minHeight: 100,
  },
  carrierCol: {
    width: 68,
    paddingRight: 4,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  carrier: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
    lineHeight: 14,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
    marginTop: 1,
  },
  midCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 2,
  },
  timesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leg: { width: 52 },
  legEnd: { alignItems: "flex-end", width: 52 },
  timeDepart: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  timeArrive: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  timeArriveFlight: {
    color: colors.danger,
  },
  code: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  mid: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
    marginBottom: 3,
    textAlign: "center",
  },
  stops: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.inkMuted,
    marginTop: 3,
    textAlign: "center",
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#C8C8C8",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C8C8C8",
    backgroundColor: colors.white,
    marginHorizontal: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  bagRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bagText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  detailText: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
  },
  priceRail: {
    flexDirection: "row",
    alignItems: "stretch",
    width: 108,
  },
  dash: {
    width: 1,
    borderStyle: "dashed",
    borderWidth: 0,
    borderLeftWidth: 1,
    borderColor: "#CFCFCF",
    marginVertical: 2,
  },
  priceCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.ink,
    textAlign: "center",
  },
});
