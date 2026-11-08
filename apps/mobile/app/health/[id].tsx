import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Stethoscope,
  Video,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { OfflineCover } from "../../components/OfflineCover";
import { SoftGradient as LinearGradient } from "../../components/SoftGradient";
import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import {
  getProvider,
  HEALTH_CITY_LABEL_KEY,
  type MeetingType,
} from "../../lib/health-catalog";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const MEETING_ICON: Record<
  MeetingType,
  typeof Video
> = {
  video: Video,
  phone: Phone,
  chat: MessageCircle,
};

export default function HealthDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const providerId = Array.isArray(id) ? id[0] : id;
  const { t, i18n } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const provider = providerId ? getProvider(providerId) : undefined;
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  if (!provider) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("health.title")} onBack={() => router.back()} />
        <Text style={styles.notFound}>{t("health.notFound")}</Text>
      </Screen>
    );
  }

  const cityLabel = t(HEALTH_CITY_LABEL_KEY[provider.city]);
  const specialtyLabel = t(`health.specialty.${provider.specialty}`);
  const fee = formatListing(provider.fee_iqd, provider.price_currency);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={provider.name}
        subtitle={specialtyLabel}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() => router.push("/health/appointments")}
            hitSlop={8}
          >
            <CalendarDays size={18} color={colors.flame} strokeWidth={2} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <OfflineCover
            uri={provider.cover_url}
            label={provider.name}
            style={styles.heroImg}
          />
          <LinearGradient
            colors={["transparent", "rgba(12,45,41,0.85)"]}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroScrim}
          />
          {provider.featured ? (
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{t("health.featured")}</Text>
            </View>
          ) : null}
          <View style={styles.heroMeta}>
            <Text style={styles.heroFee}>{fee}</Text>
            <Text style={styles.heroFeeHint}>{t("health.perVisit")}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.nameRow}>
            <Stethoscope size={18} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.name}>{provider.name}</Text>
          </View>
          <Text style={styles.clinic}>{provider.clinic}</Text>
          <View style={styles.ratingRow}>
            <Star size={14} color={colors.flame} fill={colors.flame} strokeWidth={0} />
            <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>
              {provider.review_count.toLocaleString()} {t("health.reviews")}
            </Text>
            <Text style={styles.kind}>
              · {t(`health.kind.${provider.kind}`)}
            </Text>
          </View>
          <View style={styles.locRow}>
            <MapPin size={14} color={colors.inkMuted} strokeWidth={2} />
            <Text style={styles.loc}>
              {cityLabel} · {provider.district}
            </Text>
          </View>
          <Text style={styles.bio}>
            {lang === "tr" ? provider.bio_tr : provider.bio_en}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>{t("health.meetingTypes")}</Text>
          <View style={styles.meetingRow}>
            {provider.meeting_types.map((m) => {
              const Icon = MEETING_ICON[m];
              return (
                <View key={m} style={styles.meetingChip}>
                  <Icon size={14} color={colors.flame} strokeWidth={2.2} />
                  <Text style={styles.meetingChipText}>
                    {t(`health.meeting.${m}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>{t("health.availableSlots")}</Text>
          <Text style={styles.sectionHint}>{t("health.slotsHint")}</Text>
          <View style={styles.slotGrid}>
            {provider.slots.map((s) => (
              <View key={s} style={styles.slotPill}>
                <Text style={styles.slotText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 88 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{t("health.consultation")}</Text>
          <Text style={styles.footerPrice}>{fee}</Text>
        </View>
        <Button
          label={t("health.bookCta")}
          variant="ink"
          style={styles.footerBtn}
          onPress={() =>
            router.push({
              pathname: "/health/book",
              params: { id: provider.id },
            })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 48,
  },
  content: { paddingBottom: space.lg },
  hero: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 200,
    backgroundColor: colors.ink,
    ...shadow.soft,
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroScrim: { ...StyleSheet.absoluteFillObject },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.flame,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  heroBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  heroMeta: {
    position: "absolute",
    right: 12,
    bottom: 12,
    alignItems: "flex-end",
  },
  heroFee: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.white,
  },
  heroFeeHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  block: {
    marginTop: space.lg,
    marginHorizontal: space.lg,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  clinic: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  rating: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  reviews: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  kind: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  loc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  bio: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 6,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginBottom: 10,
  },
  meetingRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meetingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.flameSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  meetingChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
  },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  slotText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadow.soft,
  },
  footerLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  footerPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  footerBtn: { flex: 1, maxWidth: 200 },
});
