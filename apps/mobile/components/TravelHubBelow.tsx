import { ChevronRight, Plane, Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HOTEL_PHOTO_IDS } from "../lib/hotels-catalog";
import { colors, fonts, space } from "../lib/theme";
import { OfflineCover } from "./OfflineCover";
import { SoftGradient } from "./SoftGradient";

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`;

const PROMO_CARDS = [
  {
    id: "p1",
    uri: u(HOTEL_PHOTO_IDS[0]),
    titleKey: "travel.promo1Title",
  },
  {
    id: "p2",
    uri: u(HOTEL_PHOTO_IDS[2]),
    titleKey: "travel.promo2Title",
  },
  {
    id: "p3",
    uri: u(HOTEL_PHOTO_IDS[4]),
    titleKey: "travel.promo3Title",
  },
] as const;

type Props = {
  onSeeAllCampaigns?: () => void;
};

export function TravelHubBelow({ onSeeAllCampaigns }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.disclaimer}>{t("travel.disclaimer")}</Text>

      <View style={styles.featureRow}>
        <SoftGradient colors={["#F36A1C", "#FB8A3A"]} style={styles.featureCard}>
          <Plane size={28} color="rgba(255,255,255,0.35)" strokeWidth={1.6} />
          <Text style={styles.featureTitle}>{t("travel.featureShakeTitle")}</Text>
          <Text style={styles.featureHint}>{t("travel.featureShakeHint")}</Text>
        </SoftGradient>
        <SoftGradient colors={[colors.ink, "#163F39"]} style={styles.featureCard}>
          <Sparkles size={28} color="rgba(255,255,255,0.35)" strokeWidth={1.6} />
          <Text style={styles.featureTitle}>{t("travel.featureDealsTitle")}</Text>
          <Text style={styles.featureHint}>{t("travel.featureDealsHint")}</Text>
        </SoftGradient>
      </View>

      <View>
        <View style={styles.campaignHead}>
          <Text style={styles.campaignTitle}>{t("travel.campaigns")}</Text>
          <Pressable
            onPress={onSeeAllCampaigns}
            hitSlop={8}
            style={styles.seeAll}
            accessibilityRole="button"
          >
            <Text style={styles.seeAllText}>{t("travel.campaignsAll")}</Text>
            <ChevronRight size={14} color={colors.flame} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoRow}
          decelerationRate="fast"
        >
          {PROMO_CARDS.map((c) => (
            <Pressable key={c.id} style={styles.promoCard} accessibilityRole="button">
              <OfflineCover uri={c.uri} style={styles.promoImg} />
              <SoftGradient
                colors={["transparent", "rgba(0,0,0,0.72)"]}
                style={styles.promoFade}
              />
              <Text style={styles.promoTitle} numberOfLines={3}>
                {t(c.titleKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.md,
    gap: space.md,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
  },
  featureCard: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 96,
    justifyContent: "flex-end",
    gap: 2,
    overflow: "hidden",
  },
  featureTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
    marginTop: 6,
  },
  featureHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 14,
  },
  campaignHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  campaignTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flame,
  },
  promoRow: {
    gap: 10,
    paddingRight: 4,
  },
  promoCard: {
    width: 260,
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.mist,
  },
  promoImg: {
    ...StyleSheet.absoluteFillObject,
  },
  promoFade: {
    ...StyleSheet.absoluteFillObject,
  },
  promoTitle: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
    lineHeight: 18,
  },
});
