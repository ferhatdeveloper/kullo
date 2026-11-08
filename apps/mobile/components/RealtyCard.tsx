import {
  Bath,
  BedDouble,
  Building2,
  Flame,
  Heart,
  MapPin,
  Maximize2,
} from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { DemoRealtyListing } from "../lib/demo-data";
import { colors, fonts, radius, shadow, space } from "../lib/theme";
import { OfflineCover } from "./OfflineCover";

type Props = {
  item: DemoRealtyListing;
  priceLabel: string;
  saleLabel: string;
  rentLabel: string;
  hotLabel: string;
  typeLabel?: string;
  /** rail = Hot Sale; pair = dual grid overlay; feed = full width */
  variant?: "rail" | "pair" | "feed";
  favorited?: boolean;
  onPress: () => void;
  onFavorite?: () => void;
};

export function RealtyCard({
  item,
  priceLabel,
  saleLabel,
  rentLabel,
  hotLabel,
  typeLabel,
  variant = "feed",
  favorited = false,
  onPress,
  onFavorite,
}: Props) {
  const purpose = item.offer_type;
  const beds = item.bedrooms;
  const baths = item.bathrooms;
  const sqm = item.area_m2;
  const place = [item.district, item.city].filter(Boolean).join(", ");
  const showHot = Boolean(item.featured);

  if (variant === "pair") {
    const pairPlace = item.district || item.city || item.title;
    return (
      <TouchableOpacity
        style={[styles.pairCard, shadow.soft]}
        onPress={onPress}
        activeOpacity={0.92}
      >
        <OfflineCover uri={item.cover_url} label={item.title} style={styles.pairImage} />
        <View style={styles.pairScrimTop} />
        <View style={styles.pairScrimBottom} />
        <View
          style={[
            styles.purpose,
            styles.purposeTopRight,
            purpose === "rent" ? styles.purposeRent : styles.purposeSale,
          ]}
        >
          <Text style={styles.purposeText}>
            {purpose === "rent" ? rentLabel : saleLabel}
          </Text>
        </View>
        <View style={styles.pairBottom}>
          <Text style={styles.pairPrice}>{priceLabel}</Text>
          {pairPlace ? (
            <View style={styles.placeRow}>
              <MapPin size={12} color={colors.flame} fill={colors.flame} />
              <Text style={styles.pairPlace} numberOfLines={1}>
                {pairPlace}
              </Text>
            </View>
          ) : null}
          <View style={styles.pairSpecs}>
            {typeLabel ? (
              <View style={styles.pairChip}>
                <Building2 size={10} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.pairChipText} numberOfLines={1}>
                  {typeLabel}
                </Text>
              </View>
            ) : null}
            {beds != null ? (
              <View style={styles.pairChip}>
                <BedDouble size={10} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.pairChipText}>{beds}</Text>
              </View>
            ) : null}
            {baths != null ? (
              <View style={styles.pairChip}>
                <Bath size={10} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.pairChipText}>{baths}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const isRail = variant === "rail";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isRail ? styles.rail : styles.feed,
        isRail && styles.railBorder,
        shadow.card,
      ]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={[styles.media, isRail ? styles.mediaRail : styles.mediaFeed]}>
        <OfflineCover uri={item.cover_url} label={item.title} style={styles.image} />
        <View
          style={[
            styles.purpose,
            purpose === "rent" ? styles.purposeRent : styles.purposeSale,
          ]}
        >
          <Text style={styles.purposeText}>
            {purpose === "rent" ? rentLabel : saleLabel}
          </Text>
        </View>
        {showHot ? (
          <View style={[styles.hot, isRail && styles.hotRail]}>
            <Flame size={11} color={colors.white} fill={colors.white} />
            <Text style={styles.hotText}>{hotLabel}</Text>
          </View>
        ) : null}
        {onFavorite ? (
          <TouchableOpacity
            style={styles.fav}
            onPress={(e) => {
              e.stopPropagation?.();
              onFavorite();
            }}
            hitSlop={10}
          >
            <Heart
              size={16}
              color={colors.white}
              fill={favorited ? colors.flame : "transparent"}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={[styles.price, !isRail && styles.priceFeed]}>{priceLabel}</Text>
        {place ? (
          <View style={styles.placeRow}>
            <MapPin size={12} color={colors.inkFaint} />
            <Text style={styles.place} numberOfLines={1}>
              {place}
            </Text>
          </View>
        ) : (
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        )}
        <View style={styles.specsRow}>
          {typeLabel && !isRail ? (
            <Text style={styles.specDarkMuted} numberOfLines={1}>
              {typeLabel}
            </Text>
          ) : null}
          {sqm != null ? (
            <View style={styles.specItemDark}>
              <Maximize2 size={12} color={colors.inkMuted} />
              <Text style={styles.specDark}>{sqm} m²</Text>
            </View>
          ) : null}
          {beds != null ? (
            <View style={styles.specItemDark}>
              <BedDouble size={12} color={colors.inkMuted} />
              <Text style={styles.specDark}>{beds}</Text>
            </View>
          ) : null}
          {baths != null ? (
            <View style={styles.specItemDark}>
              <Bath size={12} color={colors.inkMuted} />
              <Text style={styles.specDark}>{baths}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  rail: { width: 208 },
  railBorder: {
    borderWidth: 1.5,
    borderColor: "#FFD0B8",
  },
  feed: { width: "100%", marginBottom: space.md },
  media: { position: "relative", backgroundColor: colors.mist },
  mediaRail: { height: 124 },
  mediaFeed: { height: 228 },
  image: { width: "100%", height: "100%" },
  purpose: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  purposeTopRight: { left: undefined, right: 10 },
  purposeSale: { backgroundColor: "#E23B3B" },
  purposeRent: { backgroundColor: "#1F8A4C" },
  purposeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  hot: {
    position: "absolute",
    top: 10,
    left: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.flame,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hotRail: { left: 10, top: 40 },
  hotText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  fav: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: space.md, gap: 5 },
  price: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  priceFeed: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  placeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  place: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  specsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  specItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  specText: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.white,
  },
  specItemDark: { flexDirection: "row", alignItems: "center", gap: 4 },
  specDark: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  specDarkMuted: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkFaint,
  },
  pairCard: {
    flex: 1,
    height: 210,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.mist,
  },
  pairImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  pairScrimTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  pairScrimBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 118,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  pairBottom: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    gap: 5,
  },
  pairPrice: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pairPlace: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
  },
  pairSpecs: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 2,
  },
  pairChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(20,20,20,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: "48%",
  },
  pairChipText: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.white,
    flexShrink: 1,
  },
});
