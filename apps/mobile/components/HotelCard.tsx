import { MapPin, Star } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DemoHotel } from "../lib/hotels-catalog";
import { colors, fonts, radius, shadow, space } from "../lib/theme";
import { OfflineCover } from "./OfflineCover";
import { SoftGradient as LinearGradient } from "./SoftGradient";

type Props = {
  hotel: DemoHotel;
  price: string;
  cityLabel: string;
  nightLabel: string;
  reviewsLabel: string;
  badgeLabel?: string;
  /** list = /hotels; rail = SuperHomeFeed yatay */
  variant?: "list" | "rail";
  onPress: () => void;
};

/**
 * Booking / Holidu IA — büyük cover, şehir chip, ★+yorum, fiyat sağ alt.
 * Marka asset kopyası yok; Kullo ink/flame.
 */
export function HotelCard({
  hotel,
  price,
  cityLabel,
  nightLabel,
  reviewsLabel,
  badgeLabel,
  variant = "list",
  onPress,
}: Props) {
  const isRail = variant === "rail";

  return (
    <Pressable
      style={[styles.card, isRail ? styles.cardRail : styles.cardList, shadow.card]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hotel.name}
    >
      <View style={[styles.media, isRail ? styles.mediaRail : styles.mediaList]}>
        <OfflineCover
          uri={hotel.cover_url}
          label={hotel.name}
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
        {badgeLabel && hotel.featured ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
        <View style={styles.priceTag}>
          <Text style={styles.priceTagValue}>{price}</Text>
          <Text style={styles.priceTagNight}>/ {nightLabel}</Text>
        </View>
      </View>

      <View style={[styles.body, isRail && styles.bodyRail]}>
        <Text style={[styles.name, isRail && styles.nameRail]} numberOfLines={1}>
          {hotel.name}
        </Text>
        <View style={styles.metaRow}>
          <Star size={12} color={colors.flame} fill={colors.flame} strokeWidth={0} />
          <Text style={styles.rating}>{hotel.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>
            ({hotel.review_count.toLocaleString()} {reviewsLabel})
          </Text>
          <Text style={styles.stars}>{"★".repeat(hotel.stars)}</Text>
        </View>
        {!isRail ? (
          <Text style={styles.district} numberOfLines={1}>
            {hotel.district}
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
  cardList: {
    width: "100%",
  },
  cardRail: {
    width: 196,
  },
  media: {
    position: "relative",
    backgroundColor: colors.mist,
  },
  /** ~16:9 list */
  mediaList: {
    aspectRatio: 16 / 9,
    width: "100%",
  },
  /** ~3:2 rail */
  mediaRail: {
    width: 196,
    height: 130,
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%",
  },
  cityChip: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(12,45,41,0.72)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    maxWidth: "58%",
  },
  cityChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
    flexShrink: 1,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.flame,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.2,
  },
  priceTag: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  priceTagValue: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.ink,
  },
  priceTagNight: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
  },
  body: {
    paddingHorizontal: space.md,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 4,
  },
  bodyRail: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  name: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  nameRail: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  rating: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  reviews: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  stars: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.flame,
    marginLeft: 2,
  },
  district: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 1,
  },
});
