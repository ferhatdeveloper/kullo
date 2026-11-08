import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius } from "../lib/theme";

export type ListingLifecycle =
  | "active"
  | "sold"
  | "rented"
  | "reserved"
  | "closed";

type Props = {
  status?: ListingLifecycle | null;
  compact?: boolean;
};

/** Satıldı / Kiralandı / Rezerve / Aktif rozeti */
export function ListingStatusBadge({ status, compact }: Props) {
  const { t } = useTranslation();
  if (!status || status === "active") return null;

  const label =
    status === "sold"
      ? t("listingStatus.sold")
      : status === "rented"
        ? t("listingStatus.rented")
        : status === "reserved"
          ? t("listingStatus.reserved")
          : t("listingStatus.closed");

  const tone =
    status === "sold"
      ? styles.sold
      : status === "rented"
        ? styles.rented
        : status === "reserved"
          ? styles.reserved
          : styles.closed;

  return (
    <View style={[styles.base, tone, compact && styles.compact]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sold: { backgroundColor: "#C43C3C" },
  rented: { backgroundColor: "#0C2D29" },
  reserved: { backgroundColor: "#C47A2A" },
  closed: { backgroundColor: "#6B6B6B" },
  text: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.2,
  },
});
