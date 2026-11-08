import { useQueryClient } from "@tanstack/react-query";
import { SoftGradient as LinearGradient } from "./SoftGradient";
import { router } from "expo-router";
import {
  Calendar,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Settings2,
  ShieldCheck,
  Tag,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ListingStatusBadge } from "./ListingStatusBadge";
import { OfflineCover } from "./OfflineCover";
import { Badge } from "./ui/Badge";
import { api } from "../lib/api";
import { storage } from "../lib/clients";
import { useCurrencyStore } from "../lib/currency-store";
import { getAuctionForVehicle, getDemoSeller } from "../lib/demo-data";
import { isGoodDeal, isResponsiveDealer } from "../lib/marketplace-heuristics";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

/** Matches queryKey / queryFn in app/vehicle/[id].tsx for warm cache on press. */
async function fetchVehicleDetail(id: string) {
  const demo = api.getDemoVehicle(String(id));
  if (demo) {
    const store = getDemoSeller(String(demo.seller_id ?? "demo-seller")) ?? getDemoSeller("demo-seller")!;
    return {
      id: demo.id,
      title_original: demo.title ?? `${demo.make_name} ${demo.model}`,
      description_original: `${demo.year} model ${demo.make_name} ${demo.model}. ${demo.mileage_km?.toLocaleString("tr-TR")} km, ${demo.fuel_name}, ${demo.transmission_name}. Demo ilan — gerçek API bağlanınca canlı veri gelecek.`,
      description_translations: {},
      title_translations: {},
      make_id: 0,
      model: demo.model ?? "",
      trim: null,
      year: demo.year ?? 0,
      mileage_km: demo.mileage_km ?? null,
      fuel_type_id: 0,
      transmission_id: 0,
      body_type_id: 0,
      color_id: 0,
      condition: "used",
      price_amount: demo.price_amount != null ? Number(demo.price_amount) : null,
      price_currency: demo.price_currency ?? "TRY",
      negotiable: true,
      country_code: demo.country_code ?? "TR",
      city: demo.city ?? null,
      geo_lat: null,
      geo_lng: null,
      status: "active",
      views_count: 128,
      favorites_count: 12,
      features: [],
      created_at: demo.created_at ?? new Date().toISOString(),
      seller_id: store.user_id,
      ai_analysis: [],
      media: demo.cover_url
        ? [{ id: "1", url: demo.cover_url, type: "image" as const, is_cover: true }]
        : [],
      seller: {
        display_name: store.display_name,
        avatar_url: store.avatar_url,
        verified: store.verified,
        rating_avg: store.rating_avg,
        rating_count: store.rating_count,
      },
      fuel_name: demo.fuel_name ?? "—",
      transmission_name: demo.transmission_name ?? "—",
      body_name: demo.body_name ?? "—",
    };
  }

  const rows = await api.get<unknown[]>(
    `/vehicles?id=eq.${id}&select=*,ai_vehicle_analysis(*),vehicle_media(*),seller:users!seller_id(user_profiles(*))`,
  );
  return Array.isArray(rows) ? rows[0] : rows;
}

export interface VehicleListItem {
  id: string;
  title?: string | null;
  make_name?: string | null;
  model?: string | null;
  year?: number | null;
  mileage_km?: number | null;
  fuel_name?: string | null;
  transmission_name?: string | null;
  body_name?: string | null;
  color_name?: string | null;
  price_amount?: number | string | null;
  price_currency?: string | null;
  country_code?: string | null;
  city?: string | null;
  cover_url?: string | null;
  /** Total media count when known from feed/API. */
  media_count?: number | null;
  /** Optional media list; length used when media_count is absent. */
  media?: Array<{ id?: string; url?: string | null }> | null;
  created_at?: string | null;
  verified?: boolean;
  /** Seller verification flag when provided separately from vehicle.verified. */
  seller_verified?: boolean;
  /** Seller rating when provided (responsive dealer heuristic). */
  seller_rating_avg?: number | null;
  featured?: boolean;
  seller_id?: string | null;
  seller_name?: string | null;
  /** active | sold | rented | reserved */
  listing_status?: "active" | "sold" | "rented" | "reserved" | "closed" | null;
}

interface Props {
  vehicle: VehicleListItem;
  onFavoriteChange?: (id: string, isFavorite: boolean) => void;
  initialFavorite?: boolean;
  index?: number;
  /** list = stacked Dubicars card; row = IQCars thumb+meta; featured = rail/carousel */
  variant?: "list" | "row" | "featured";
}

type SpecItem = { key: string; label: string; Icon: LucideIcon };

function resolveMediaTotal(vehicle: VehicleListItem): number | null {
  if (typeof vehicle.media_count === "number" && vehicle.media_count > 0) {
    return vehicle.media_count;
  }
  if (Array.isArray(vehicle.media) && vehicle.media.length > 0) {
    return vehicle.media.length;
  }
  return null;
}

/** DubiCars-style "1/N"; falls back to "1" when only cover is known. */
function photoCounterLabel(vehicle: VehicleListItem): string | null {
  const total = resolveMediaTotal(vehicle);
  if (total != null) return `1/${total}`;
  if (vehicle.cover_url) return "1";
  return null;
}

function buildSpecItems(
  vehicle: VehicleListItem,
  mileageLabel: (km: number) => string,
): SpecItem[] {
  const items: SpecItem[] = [];
  if (vehicle.year != null) {
    items.push({ key: "year", label: String(vehicle.year), Icon: Calendar });
  }
  if (vehicle.mileage_km != null) {
    items.push({
      key: "mileage",
      label: mileageLabel(vehicle.mileage_km),
      Icon: Gauge,
    });
  }
  if (vehicle.fuel_name) {
    items.push({ key: "fuel", label: vehicle.fuel_name, Icon: Fuel });
  }
  if (vehicle.transmission_name) {
    items.push({
      key: "transmission",
      label: vehicle.transmission_name,
      Icon: Settings2,
    });
  }
  return items;
}

function SpecIconRow({
  items,
  compact = false,
}: {
  items: SpecItem[];
  compact?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <View style={[styles.specRow, compact && styles.specRowCompact]}>
      {items.map((item, i) => (
        <View key={item.key} style={styles.specItem}>
          {i > 0 ? <Text style={styles.specDot}>·</Text> : null}
          <item.Icon
            size={compact ? 11 : 13}
            color={colors.inkFaint}
            strokeWidth={2}
          />
          <Text style={[styles.specText, compact && styles.specTextCompact]} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** IQCars-style outlined year / km / trim chips (no brand chrome). */
function SpecChipRow({ labels }: { labels: string[] }) {
  const chips = labels.filter(Boolean).slice(0, 3);
  if (chips.length === 0) return null;
  return (
    <View style={styles.chipRow}>
      {chips.map((label) => (
        <View key={label} style={styles.specChip}>
          <Text style={styles.specChipText} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function VehicleCard({
  vehicle,
  onFavoriteChange,
  initialFavorite = false,
  index = 0,
  variant = "list",
}: Props) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const fade = useRef(new Animated.Value(0)).current;
  const qc = useQueryClient();
  const { t, i18n } = useTranslation();

  const prefetchDetail = () => {
    void qc.prefetchQuery({
      queryKey: ["vehicle", vehicle.id, i18n.language],
      queryFn: () => fetchVehicleDetail(vehicle.id),
      staleTime: 30_000,
    });
  };

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 380,
      delay: Math.min(index, 6) * 45,
      useNativeDriver: true,
    }).start();
  }, [fade, index]);

  const toggleFavorite = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    onFavoriteChange?.(vehicle.id, next);

    try {
      if (next) {
        await api.post("/favorites", { vehicle_id: vehicle.id });
      } else {
        await api.delete(`/favorites?vehicle_id=eq.${vehicle.id}`);
      }
    } catch {
      setFavorite(!next);
    }
  };

  const formatListing = useCurrencyStore((s) => s.formatListing);
  const price = formatListing(vehicle.price_amount, vehicle.price_currency);
  const makeModel = ((vehicle.make_name ?? "") + " " + (vehicle.model ?? "")).trim();
  const title = vehicle.title ?? (makeModel || t("vehicle.fallbackTitle"));
  const imageUri = vehicle.cover_url
    ? vehicle.cover_url.startsWith("http")
      ? vehicle.cover_url
      : `${storage.url}/${vehicle.cover_url}`
    : null;
  const auction = getAuctionForVehicle(vehicle.id);
  const auctionLive = auction?.status === "live";
  const isVerified = Boolean(vehicle.verified || vehicle.seller_verified);
  const demoSeller =
    vehicle.seller_id != null ? getDemoSeller(String(vehicle.seller_id)) : undefined;
  const ratingAvg = vehicle.seller_rating_avg ?? demoSeller?.rating_avg ?? null;
  const storeName = vehicle.seller_name ?? demoSeller?.display_name ?? null;
  const storeId = vehicle.seller_id ?? demoSeller?.user_id ?? null;
  const responsive = isResponsiveDealer({
    verified: isVerified || demoSeller?.verified,
    rating_avg: ratingAvg,
  });
  const goodDeal = isGoodDeal({
    price_amount: vehicle.price_amount,
    year: vehicle.year,
    make_name: vehicle.make_name,
  });
  const photoLabel = photoCounterLabel(vehicle);
  const specs = buildSpecItems(vehicle, (km) =>
    t("vehicle.mileageShort", { count: Math.round(km / 1000) }),
  );

  const trustBadges = (
    <>
      {auctionLive ? <Badge label={t("vehicle.auctionBadge")} tone="ink" /> : null}
      {vehicle.featured ? <Badge label={t("vehicle.featuredBadge")} tone="brass" /> : null}
      {goodDeal ? (
        <Badge
          label={t("vehicle.goodDealBadge")}
          tone="brass"
          icon={<Tag size={11} color={colors.brass} strokeWidth={2.5} />}
        />
      ) : null}
      {isVerified ? (
        <Badge
          label={t("vehicle.verifiedBadge")}
          tone="viridian"
          icon={<ShieldCheck size={11} color={colors.viridianDeep} strokeWidth={2.5} />}
        />
      ) : null}
      {responsive ? (
        <Badge
          label={t("vehicle.responsiveBadge")}
          tone="mist"
          icon={<Zap size={11} color={colors.flameDeep} strokeWidth={2.5} />}
        />
      ) : null}
    </>
  );
  const showBadges =
    auctionLive || vehicle.featured || isVerified || responsive || goodDeal;

  if (variant === "featured") {
    const metaBits = [
      vehicle.city,
      vehicle.body_name ?? vehicle.transmission_name,
      vehicle.year != null ? String(vehicle.year) : null,
      vehicle.mileage_km != null
        ? t("vehicle.mileageShort", { count: Math.round(vehicle.mileage_km / 1000) })
        : null,
    ].filter(Boolean) as string[];

    return (
      <Animated.View style={{ opacity: fade }}>
        <TouchableOpacity
          style={styles.featured}
          onPressIn={prefetchDetail}
          onPress={() => router.push(`/vehicle/${vehicle.id}`)}
          activeOpacity={0.92}
        >
          <View style={styles.featuredImageWrap}>
            {imageUri ? (
              <OfflineCover uri={imageUri} label={title} style={styles.featuredImage} />
            ) : (
              <View style={[styles.featuredImage, styles.placeholder]}>
                <Text style={styles.placeholderText}>{t("vehicle.noPhoto")}</Text>
              </View>
            )}
            <View style={styles.featuredTopPick}>
              <Text style={styles.featuredTopPickText}>
                {t("cars.topPickBadge", { defaultValue: t("vehicle.featuredBadge") })}
              </Text>
            </View>
          </View>
          <View style={styles.featuredBody}>
            <Text style={styles.featuredTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.featuredPrice}>{price}</Text>
            {metaBits.length > 0 ? (
              <Text style={styles.featuredMetaLine} numberOfLines={1}>
                {metaBits.join("  ·  ")}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === "row") {
    const pipeBits = [
      vehicle.body_name ?? vehicle.transmission_name ?? vehicle.fuel_name,
      vehicle.year != null ? String(vehicle.year) : null,
      vehicle.mileage_km != null
        ? `${Math.round(vehicle.mileage_km).toLocaleString("tr-TR")} km`
        : null,
    ].filter(Boolean) as string[];

    return (
      <Animated.View style={{ opacity: fade }}>
        <TouchableOpacity
          style={styles.rowCard}
          onPressIn={prefetchDetail}
          onPress={() => router.push(`/vehicle/${vehicle.id}`)}
          activeOpacity={0.92}
        >
          <View style={styles.rowThumbWrap}>
            {imageUri ? (
              <OfflineCover uri={imageUri} label={title} style={styles.rowThumb} />
            ) : (
              <View style={[styles.rowThumb, styles.placeholder]}>
                <Text style={styles.placeholderText}>{t("vehicle.noPhoto")}</Text>
              </View>
            )}
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.rowPrice} numberOfLines={1}>
              {price}
            </Text>
            {pipeBits.length > 0 ? (
              <Text style={styles.rowPipeMeta} numberOfLines={1}>
                {pipeBits.join("  |  ")}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: fade }}>
      <TouchableOpacity
        style={styles.card}
        onPressIn={prefetchDetail}
        onPress={() => router.push(`/vehicle/${vehicle.id}`)}
        activeOpacity={0.92}
      >
        <View style={styles.imageWrap}>
          {imageUri ? (
            <OfflineCover uri={imageUri} label={title} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderText}>{t("vehicle.noPhoto")}</Text>
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(10,10,10,0.35)"]}
            style={styles.imageGrad}
          />

          {showBadges ? <View style={styles.badgeRow}>{trustBadges}</View> : null}
          <View style={styles.statusCorner}>
            <ListingStatusBadge status={vehicle.listing_status} compact />
          </View>

          {photoLabel ? (
            <View style={[styles.photoCounter, styles.photoCounterList]}>
              <Text style={styles.photoCounterText}>{photoLabel}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.favBtn} onPress={toggleFavorite} hitSlop={8}>
            <Heart
              size={17}
              color={favorite ? colors.danger : colors.ink}
              fill={favorite ? colors.danger : "transparent"}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.priceRow}>
            <View style={styles.priceCol}>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.saleLabel}>{t("cars.salePrice")}</Text>
            </View>
            {vehicle.featured ? (
              <Text style={styles.topPickLabel}>{t("vehicle.featuredBadge")}</Text>
            ) : null}
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {makeModel || title}
          </Text>
          {makeModel && vehicle.title && vehicle.title !== makeModel ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {vehicle.title}
            </Text>
          ) : null}

          {storeName && storeId ? (
            <TouchableOpacity
              onPress={() => router.push(`/seller/${storeId}`)}
              hitSlop={6}
              style={styles.sellerRow}
            >
              <Text style={styles.storeName} numberOfLines={1}>
                {storeName}
              </Text>
              {isVerified ? (
                <ShieldCheck size={13} color={colors.flame} strokeWidth={2.4} />
              ) : null}
            </TouchableOpacity>
          ) : null}

          <View style={styles.serpSpecRow}>
            {vehicle.city ? (
              <View style={styles.specItem}>
                <MapPin size={13} color={colors.inkFaint} strokeWidth={2} />
                <Text style={styles.specText} numberOfLines={1}>
                  {vehicle.city}
                </Text>
              </View>
            ) : null}
            <SpecIconRow items={specs.slice(0, 3)} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={(e) => {
                e.stopPropagation();
                void Linking.openURL("tel:+905551234567");
              }}
              activeOpacity={0.85}
            >
              <Phone size={14} color={colors.flameDeep} strokeWidth={2.2} />
              <Text style={[styles.actionText, styles.actionCallText]}>
                {t("vehicle.callSeller")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionWa]}
              onPress={(e) => {
                e.stopPropagation();
                const msg = encodeURIComponent(
                  t("vehicle.whatsappPrefill", { title }),
                );
                void Linking.openURL(`https://wa.me/905551234567?text=${msg}`);
              }}
              activeOpacity={0.85}
            >
              <MessageCircle size={14} color={colors.white} strokeWidth={2.2} />
              <Text style={[styles.actionText, styles.actionWaSolidText]}>
                {t("vehicle.whatsappSeller")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: space.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  imageWrap: { position: "relative", backgroundColor: colors.mist },
  image: { width: "100%", height: 196 },
  imageGrad: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
  placeholder: {
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.inkFaint,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 56,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statusCorner: {
    position: "absolute",
    left: 12,
    bottom: 12,
  },
  photoCounter: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(10,10,10,0.72)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  photoCounterList: {
    bottom: 10,
    left: 12,
    right: undefined,
  },
  photoCounterText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fonts.bodySemi,
    letterSpacing: 0.2,
  },
  favBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  body: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  priceCol: { flexShrink: 1, gap: 2 },
  price: {
    fontSize: 20,
    fontFamily: fonts.display,
    color: colors.ink,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  saleLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  topPickLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flame,
  },
  title: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: fonts.displayMed,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
  serpSpecRow: {
    marginTop: 8,
    gap: 4,
  },
  sellerRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  storeName: {
    fontSize: 12,
    fontFamily: fonts.bodySemi,
    color: colors.flame,
    flexShrink: 1,
  },
  specRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8,
    gap: 2,
  },
  specRowCompact: {
    marginTop: 6,
    flexWrap: "nowrap",
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
  },
  specDot: {
    marginHorizontal: 4,
    fontSize: 12,
    color: colors.inkFaint,
    fontFamily: fonts.body,
  },
  specText: {
    fontSize: 12,
    fontFamily: fonts.bodyMed,
    color: colors.inkMuted,
  },
  specTextCompact: {
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  locationRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  location: {
    fontSize: 12,
    color: colors.inkFaint,
    marginLeft: 4,
    fontFamily: fonts.body,
  },
  time: {
    fontSize: 11,
    color: colors.inkFaint,
    fontFamily: fonts.body,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.flame,
    backgroundColor: colors.white,
  },
  actionWa: {
    borderColor: colors.flame,
    backgroundColor: colors.flame,
  },
  actionText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  actionCallText: {
    color: colors.flameDeep,
  },
  actionWaSolidText: {
    color: colors.white,
  },

  featured: {
    width: 248,
    marginRight: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  featuredImageWrap: { position: "relative" },
  featuredImage: { width: "100%", height: 156 },
  featuredTopPick: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.flame,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  featuredTopPickText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  featuredBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 2 },
  featuredTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  featuredPrice: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  featuredMetaLine: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    width: 312,
    height: 100,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  rowThumbWrap: {
    width: 108,
    height: 100,
    backgroundColor: colors.mist,
  },
  rowThumb: { width: 108, height: 100 },
  rowStatus: {
    position: "absolute",
    left: 6,
    bottom: 6,
  },
  rowBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    gap: 4,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  rowPipeMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  specChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: colors.paper,
  },
  specChipText: {
    fontSize: 11,
    fontFamily: fonts.bodyMed,
    color: colors.inkMuted,
  },
  rowFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  rowLoc: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 3,
  },
  rowLocText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.inkFaint,
    flexShrink: 1,
  },
  rowPrice: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: -0.3,
  },
});
