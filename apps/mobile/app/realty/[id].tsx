import { router, useLocalSearchParams } from "expo-router";
import {
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ListingStatusBadge } from "../../components/ListingStatusBadge";
import { OfflineCover } from "../../components/OfflineCover";
import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { useRealtyFavorites } from "../../lib/realty-favorites-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const W = Dimensions.get("window").width;
const DEMO_PHONE = "+9647500000000";

export default function RealtyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const getRealty = useMarketplaceStore((s) => s.getRealty);
  const all = useMarketplaceStore((s) => s.realty);
  const item = getRealty(id ?? "");
  const [photo, setPhoto] = useState(0);
  const favHydrate = useRealtyFavorites((s) => s.hydrate);
  const favToggle = useRealtyFavorites((s) => s.toggle);
  const favHas = useRealtyFavorites((s) => s.has);

  useEffect(() => {
    void favHydrate();
  }, [favHydrate]);

  const gallery = useMemo(() => {
    if (!item) return [];
    const g = item.gallery?.length ? item.gallery : [item.cover_url];
    return g.filter(Boolean);
  }, [item]);

  const similar = useMemo(() => {
    if (!item) return [];
    return all
      .filter(
        (r) =>
          r.id !== item.id &&
          (r.kind === item.kind || r.city === item.city) &&
          r.listing_status !== "sold" &&
          r.listing_status !== "rented",
      )
      .slice(0, 4);
  }, [all, item]);

  if (!item) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("realty.title")} onBack={() => router.back()} />
        <Text style={styles.notFound}>{t("realty.notFound")}</Text>
      </Screen>
    );
  }

  const favorited = favHas(item.id);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t(`realty.kinds.${item.kind}`)}
        subtitle={[item.district, item.city].filter(Boolean).join(" · ")}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() => void favToggle(item.id)}
            hitSlop={10}
            accessibilityLabel={t("realty.favorites")}
          >
            <Heart
              size={22}
              color={favorited ? colors.flame : colors.ink}
              fill={favorited ? colors.flame : "transparent"}
              strokeWidth={2.2}
            />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.galleryBlock}>
          <View style={styles.coverWrap}>
            <OfflineCover
              uri={gallery[photo] ?? item.cover_url}
              label={item.title}
              style={styles.cover}
            />
            <View style={styles.coverBadges}>
              <Text
                style={[
                  styles.offerPill,
                  item.offer_type === "rent" ? styles.offerRent : styles.offerSale,
                ]}
              >
                {t(`realty.offer.${item.offer_type}`)}
              </Text>
              <ListingStatusBadge status={item.listing_status} />
            </View>
            {gallery.length > 1 ? (
              <View style={styles.galleryMeta}>
                <Text style={styles.galleryCount}>
                  {photo + 1}/{gallery.length}
                </Text>
              </View>
            ) : null}
          </View>
          {gallery.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbs}
            >
              {gallery.map((uri, i) => (
                <Pressable key={`${uri}-${i}`} onPress={() => setPhoto(i)}>
                  <OfflineCover
                    uri={uri}
                    label={`${i + 1}`}
                    style={[styles.thumb, i === photo && styles.thumbOn]}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <Text style={styles.price}>
          {formatListing(item.price_amount, item.price_currency)}
          {item.offer_type === "rent" ? t("realty.perMonth") : ""}
        </Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.locRow}>
          <MapPin size={14} color={colors.inkFaint} strokeWidth={2.2} />
          <Text style={styles.loc}>
            {[item.district, item.city].filter(Boolean).join(" · ")}
          </Text>
        </View>

        <View style={styles.quickSpecs}>
          {item.bedrooms != null ? (
            <Quick icon={<BedDouble size={16} color={colors.flame} />} label={t("realty.rooms")} value={String(item.bedrooms)} />
          ) : null}
          {item.bathrooms != null ? (
            <Quick icon={<Bath size={16} color={colors.flame} />} label={t("realty.bathrooms")} value={String(item.bathrooms)} />
          ) : null}
          <Quick label={t("realty.area")} value={`${item.area_m2} m²`} />
          {item.furnished != null ? (
            <Quick
              label={t("realty.furnishLabel")}
              value={item.furnished ? t("realty.furnished") : t("realty.unfurnished")}
            />
          ) : null}
        </View>

        <Text style={styles.section}>{t("realty.about")}</Text>
        <Text style={styles.desc}>{item.description}</Text>

        <View style={styles.specs}>
          <Spec label={t("realty.offerLabel")} value={t(`realty.offer.${item.offer_type}`)} />
          <Spec label={t("realty.typesLabel")} value={t(`realty.kinds.${item.kind}`)} />
          {item.floor != null ? (
            <Spec label={t("realty.floor")} value={String(item.floor)} />
          ) : null}
          {item.year_built ? (
            <Spec label={t("realty.yearBuilt")} value={String(item.year_built)} />
          ) : null}
          {item.deed_status ? (
            <Spec label={t("realty.deed")} value={item.deed_status} />
          ) : null}
          {item.zoning ? <Spec label={t("realty.zoning")} value={item.zoning} /> : null}
        </View>

        {item.amenities && item.amenities.length > 0 ? (
          <View>
            <Text style={styles.section}>{t("realty.amenities")}</Text>
            <View style={styles.amenityGrid}>
              {item.amenities.map((a) => (
                <View key={a} style={styles.amenity}>
                  <Text style={styles.amenityText}>
                    {t(`realty.amenity.${a}`, { defaultValue: a })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.agent}>
          <View style={styles.agentTop}>
            <Text style={styles.agentName}>{item.seller_name}</Text>
            {item.agent_verified ? (
              <View style={styles.agentBadge}>
                <ShieldCheck size={12} color={colors.flame} strokeWidth={2.4} />
                <Text style={styles.agentBadgeText}>{t("realty.verified")}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.agentHint}>{t("realty.agentHint")}</Text>
        </View>

        <View style={styles.contactBar}>
          <Pressable
            style={styles.secondaryCta}
            onPress={() => void Linking.openURL(`tel:${DEMO_PHONE}`)}
          >
            <Phone size={16} color={colors.ink} strokeWidth={2.3} />
            <Text style={styles.secondaryCtaText}>{t("realty.call")}</Text>
          </Pressable>
          <Pressable
            style={styles.whatsappCta}
            onPress={() =>
              void Linking.openURL(
                `https://wa.me/${DEMO_PHONE.replace("+", "")}?text=${encodeURIComponent(item.title)}`,
              )
            }
          >
            <Text style={styles.whatsappText}>{t("realty.whatsapp")}</Text>
          </Pressable>
        </View>
        <View style={styles.cta}>
          <Button
            label={t("realty.contact")}
            onPress={() =>
              Alert.alert(t("realty.contactTitle"), t("realty.contactBody"))
            }
          />
        </View>

        {similar.length > 0 ? (
          <View>
            <Text style={styles.section}>{t("realty.similar")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
              {similar.map((r) => (
                <Pressable
                  key={r.id}
                  style={styles.similarCard}
                  onPress={() => router.push(`/realty/${r.id}`)}
                >
                  <OfflineCover uri={r.cover_url} label={r.title} style={styles.similarCover} />
                  <Text style={styles.similarPrice} numberOfLines={1}>
                    {formatListing(r.price_amount, r.price_currency)}
                  </Text>
                  <Text style={styles.similarTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Quick({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.quick}>
      {icon}
      <Text style={styles.quickValue}>{value}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.xl * 2, gap: space.md },
  galleryBlock: { gap: 0 },
  coverWrap: { width: W, height: 300, position: "relative" },
  cover: { width: W, height: 300, borderRadius: 0 },
  coverBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offerPill: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  offerSale: { backgroundColor: "#E23B3B" },
  offerRent: { backgroundColor: "#1F8A4C" },
  galleryMeta: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  galleryCount: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  thumbs: { paddingHorizontal: space.lg, gap: 8, paddingTop: space.sm },
  thumb: {
    width: 72,
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbOn: { borderColor: colors.flame },
  price: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    paddingHorizontal: space.lg,
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    paddingHorizontal: space.lg,
    marginTop: -4,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: space.lg,
  },
  loc: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaint },
  quickSpecs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: space.lg,
  },
  quick: {
    width: (W - space.lg * 2 - 24) / 4,
    minWidth: 72,
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickValue: { fontFamily: fonts.displayMed, fontSize: 15, color: colors.ink },
  quickLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkFaint },
  desc: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
    paddingHorizontal: space.lg,
  },
  specs: {
    marginHorizontal: space.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  spec: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.md,
    paddingVertical: 4,
  },
  specLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.inkFaint },
  specValue: { fontFamily: fonts.bodyMed, fontSize: 14, color: colors.ink },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: space.lg,
    marginBottom: 4,
  },
  amenityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: space.lg,
  },
  amenity: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  amenityText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.ink },
  agent: {
    marginHorizontal: space.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 4,
    ...shadow.soft,
  },
  agentTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  agentName: { fontFamily: fonts.displayMed, fontSize: 16, color: colors.ink, flex: 1 },
  agentBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  agentBadgeText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.flame },
  agentHint: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint },
  contactBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: space.lg,
  },
  secondaryCta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  secondaryCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  whatsappCta: {
    flex: 1.15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F8A4C",
    borderRadius: radius.lg,
    paddingVertical: 15,
  },
  whatsappText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  cta: { paddingHorizontal: space.lg },
  similarRow: { paddingHorizontal: space.lg, gap: 10 },
  similarCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  similarCover: { width: 140, height: 90 },
  similarPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 12,
    color: colors.flameDeep,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  similarTitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  notFound: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
