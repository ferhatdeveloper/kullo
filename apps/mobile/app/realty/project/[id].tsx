import { router, useLocalSearchParams } from "expo-router";
import {
  BedDouble,
  Building2,
  Image as ImageIcon,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../../components/OfflineCover";
import { Screen } from "../../../components/ui/Screen";
import { getDemoProject } from "../../../lib/demo-agencies";
import { useCurrencyStore } from "../../../lib/currency-store";
import { colors, fonts, radius, shadow, space } from "../../../lib/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const HERO_H = 280;

/**
 * Paya + Homele karışımı proje detayı:
 * - Paya: galeri slider, başlık+status, 3 spec kart, about, amenities, contact
 * - Homele: starting from, details satırları, Call + WhatsApp sticky
 * Yazılar görselin altında — ilan detayından ayrı IA
 */
export default function RealtyProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const project = getDemoProject(id ?? "");
  const [photo, setPhoto] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const gallery = useMemo(() => {
    if (!project) return [];
    const g = project.gallery?.length ? project.gallery : [project.cover_url];
    return g.filter(Boolean);
  }, [project]);

  if (!project) {
    return (
      <Screen edges={["top"]}>
        <View style={styles.missingHead}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backTxt}>←</Text>
          </Pressable>
          <Text style={styles.missingTitle}>{t("realty.projects")}</Text>
        </View>
        <Text style={styles.notFound}>{t("realty.projectNotFound")}</Text>
      </Screen>
    );
  }

  const statusLabel = t(`realty.projectStatus.${project.status}`);
  const from = formatListing(project.unitsFrom, project.currency);
  const priceRange =
    project.unitsTo != null
      ? `${from} – ${formatListing(project.unitsTo, project.currency)}`
      : from;
  const areaLine =
    project.areaMinM2 != null && project.areaMaxM2 != null
      ? `${project.areaMinM2} – ${project.areaMaxM2} m²`
      : null;
  const phone = project.phone;
  const wa = phone?.replace(/\D/g, "");
  const typesLabel = project.unitTypes.map((u) => t(`realty.kinds.${u}`)).join(", ");

  const onHeroEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhoto(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
  };

  const openTel = () => {
    if (!phone) return;
    void Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert(t("realty.contactTitle"), t("realty.contactBody")),
    );
  };
  const openWa = () => {
    if (!wa) return;
    void Linking.openURL(`https://wa.me/${wa}`).catch(() =>
      Alert.alert(t("realty.contactTitle"), t("realty.contactBody")),
    );
  };
  const onShare = () => {
    void Share.share({
      message: `${project.name} — ${project.city} · ${priceRange}`,
    }).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Paya/Homele — full-bleed galeri */}
        <View style={[styles.hero, { height: HERO_H + insets.top }]}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onHeroEnd}
            style={StyleSheet.absoluteFill}
          >
            {gallery.map((uri, i) => (
              <OfflineCover
                key={`${uri}-${i}`}
                uri={uri}
                label={project.name}
                style={{ width: SCREEN_W, height: HERO_H + insets.top }}
              />
            ))}
          </ScrollView>

          <View style={[styles.heroTop, { paddingTop: insets.top + 8 }]}>
            <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.circleArrow}>←</Text>
            </Pressable>
            <View style={styles.heroTopRight}>
              <Pressable style={styles.circleBtn} onPress={onShare} hitSlop={8}>
                <Share2 size={16} color={colors.ink} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>

          {/* Paya media chips — görsel üstünde ama alt kenarda, yazı bloğu değil */}
          <View style={styles.mediaBar}>
            <View style={styles.mediaChip}>
              <ImageIcon size={13} color={colors.ink} strokeWidth={2.2} />
              <Text style={styles.mediaChipText}>{gallery.length}</Text>
            </View>
            <Pressable
              style={styles.mediaChip}
              onPress={() => router.push("/realty/map")}
            >
              <MapPin size={13} color={colors.flame} strokeWidth={2.2} />
              <Text style={styles.mediaChipText}>{t("realty.navMap")}</Text>
            </Pressable>
          </View>

          {gallery.length > 1 ? (
            <View style={styles.dots}>
              {gallery.map((_, i) => (
                <View key={i} style={[styles.dot, i === photo && styles.dotOn]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {/* Paya: title + status */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{project.name}</Text>
            <View style={styles.status}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
          <View style={styles.locRow}>
            <MapPin size={14} color={colors.flame} fill={colors.flame} />
            <Text style={styles.locText}>
              {project.city} · {project.developer}
            </Text>
          </View>
          <Text style={styles.tagline}>{project.tagline}</Text>

          {/* Homele: starting from */}
          <Text style={styles.starting}>{t("realty.startingFrom")}</Text>
          <Text style={styles.price}>{priceRange}</Text>
          {areaLine ? <Text style={styles.areaSub}>{areaLine}</Text> : null}

          {/* Paya: 3 spec cards */}
          <View style={styles.specRow}>
            {areaLine ? (
              <View style={styles.specCard}>
                <Maximize2 size={16} color={colors.flame} strokeWidth={2.2} />
                <Text style={styles.specValue} numberOfLines={2}>
                  {areaLine}
                </Text>
              </View>
            ) : null}
            <View style={styles.specCard}>
              <Building2 size={16} color={colors.flame} strokeWidth={2.2} />
              <Text style={styles.specValue} numberOfLines={2}>
                {t("realty.fromPrice", { price: from })}
              </Text>
            </View>
            {project.unitsCount != null ? (
              <View style={styles.specCard}>
                <BedDouble size={16} color={colors.flame} strokeWidth={2.2} />
                <Text style={styles.specValue} numberOfLines={2}>
                  {t("realty.unitsCount", { count: project.unitsCount })}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Homele: Details */}
          <Text style={styles.section}>{t("realty.projectDetails")}</Text>
          <View style={styles.detailList}>
            <DetailRow label={t("realty.status")} value={statusLabel} />
            <DetailRow label={t("realty.developer")} value={project.developer} />
            <DetailRow label={t("realty.unitTypes")} value={typesLabel} />
            <DetailRow label={t("realty.priceRange")} value={priceRange} />
            {project.unitsCount != null ? (
              <DetailRow
                label={t("realty.units")}
                value={String(project.unitsCount)}
              />
            ) : null}
            {areaLine ? (
              <DetailRow label={t("realty.area")} value={areaLine} />
            ) : null}
          </View>

          {/* Paya: About */}
          <Text style={styles.section}>{t("realty.projectAbout")}</Text>
          <Text style={styles.about}>{project.description}</Text>

          {/* Amenities */}
          <Text style={styles.section}>{t("realty.amenities")}</Text>
          <View style={styles.amenityGrid}>
            {project.amenities.map((a) => (
              <View key={a} style={styles.amenityCard}>
                <Building2 size={18} color={colors.flame} strokeWidth={2} />
                <Text style={styles.amenityText}>{t(`realty.amenity.${a}`)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Homele sticky Call / WhatsApp */}
      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={[styles.cta, styles.ctaCall]} onPress={openTel}>
          <Phone size={16} color={colors.white} />
          <Text style={styles.ctaText}>{t("realty.call")}</Text>
        </Pressable>
        <Pressable style={[styles.cta, styles.ctaWa]} onPress={openWa}>
          <MessageCircle size={16} color={colors.white} />
          <Text style={styles.ctaText}>{t("realty.whatsapp")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper ?? "#F7F6F3" },
  missingHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: space.lg,
  },
  backTxt: { fontSize: 22, color: colors.ink },
  missingTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  notFound: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
  hero: {
    width: SCREEN_W,
    backgroundColor: colors.mist,
  },
  heroTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  heroTopRight: { flexDirection: "row", gap: 8 },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  circleArrow: {
    fontSize: 18,
    color: colors.ink,
    marginTop: -1,
  },
  mediaBar: {
    position: "absolute",
    left: 14,
    bottom: 28,
    flexDirection: "row",
    gap: 8,
  },
  mediaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  mediaChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotOn: {
    backgroundColor: colors.white,
    width: 16,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  name: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 22,
    color: colors.ink,
    lineHeight: 28,
  },
  status: {
    backgroundColor: colors.flame,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  statusText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  locText: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  starting: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  areaSub: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  specRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  specCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  specValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
  },
  section: {
    marginTop: 16,
    marginBottom: 6,
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  detailList: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  detailLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  about: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  amenityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenityCard: {
    width: "30%",
    minWidth: 96,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  amenityText: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "center",
  },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: space.lg,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  cta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  ctaCall: { backgroundColor: colors.ink },
  ctaWa: { backgroundColor: "#25D366" },
  ctaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
});
