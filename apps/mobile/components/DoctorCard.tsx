import { MapPin, Star, Stethoscope, Video } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DemoProvider } from "../lib/health-catalog";
import { colors, fonts, radius, shadow, space } from "../lib/theme";
import { OfflineCover } from "./OfflineCover";
import { SoftGradient as LinearGradient } from "./SoftGradient";

type Props = {
  provider: DemoProvider;
  price: string;
  cityLabel: string;
  specialtyLabel: string;
  feeLabel: string;
  badgeLabel?: string;
  /** list = /health; rail = SuperHomeFeed yatay */
  variant?: "list" | "rail";
  onPress: () => void;
};

/**
 * Sağlık kartı — cover + şehir chip + ücret + ★; Kullo ink/flame.
 */
export function DoctorCard({
  provider,
  price,
  cityLabel,
  specialtyLabel,
  feeLabel,
  badgeLabel,
  variant = "list",
  onPress,
}: Props) {
  const isRail = variant === "rail";
  const hasVideo = provider.meeting_types.includes("video");

  return (
    <Pressable
      style={[styles.card, isRail ? styles.cardRail : styles.cardList, shadow.card]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={provider.name}
    >
      <View style={[styles.media, isRail ? styles.mediaRail : styles.mediaList]}>
        <OfflineCover
          uri={provider.cover_url}
          label={provider.name}
          style={styles.cover}
        />
        <LinearGradient
          colors={["transparent", "rgba(12,45,41,0.78)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.scrim}
        />
        <View style={styles.cityChip}>
          <MapPin size={10} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.cityChipText} numberOfLines={1}>
            {cityLabel}
          </Text>
        </View>
        {badgeLabel && provider.featured ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
        <View style={styles.priceTag}>
          <Text style={styles.priceTagValue}>{price}</Text>
          <Text style={styles.priceTagNight}>{feeLabel}</Text>
        </View>
      </View>

      <View style={[styles.body, isRail && styles.bodyRail]}>
        <View style={styles.nameRow}>
          <Stethoscope size={14} color={colors.flame} strokeWidth={2.2} />
          <Text style={[styles.name, isRail && styles.nameRail]} numberOfLines={1}>
            {provider.name}
          </Text>
        </View>
        <Text style={styles.specialty} numberOfLines={1}>
          {specialtyLabel} · {provider.clinic}
        </Text>
        <View style={styles.metaRow}>
          <Star size={12} color={colors.flame} fill={colors.flame} strokeWidth={0} />
          <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({provider.review_count})</Text>
          {hasVideo ? (
            <View style={styles.videoPill}>
              <Video size={10} color={colors.ink} strokeWidth={2.4} />
            </View>
          ) : null}
        </View>
        {!isRail ? (
          <Text style={styles.district} numberOfLines={1}>
            {provider.district}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardList: { marginBottom: space.md },
  cardRail: { width: 220, marginRight: 10 },
  media: { backgroundColor: colors.ink, position: "relative" },
  mediaList: { aspectRatio: 16 / 9 },
  mediaRail: { aspectRatio: 3 / 2 },
  cover: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  scrim: { ...StyleSheet.absoluteFillObject },
  cityChip: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(12,45,41,0.72)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  cityChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
    maxWidth: 110,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.flame,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
  },
  priceTag: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: "flex-end",
  },
  priceTagValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  priceTagNight: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: "rgba(255,255,255,0.72)",
  },
  body: { padding: space.md, gap: 4 },
  bodyRail: { padding: space.sm },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  nameRail: { fontSize: 14 },
  specialty: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  reviews: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  videoPill: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  district: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
});
