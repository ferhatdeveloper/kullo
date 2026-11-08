import { router, useLocalSearchParams } from "expo-router";
import {
  BedDouble,
  Calendar,
  Car,
  ConciergeBell,
  Dumbbell,
  MapPin,
  Plane,
  Sparkles,
  Star,
  Users,
  Utensils,
  Waves,
  Wifi,
  Wind,
} from "lucide-react-native";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../components/OfflineCover";
import { SoftGradient as LinearGradient } from "../../components/SoftGradient";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Screen } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import {
  getHotel,
  HOTEL_CITY_LABEL_KEY,
  type HotelAmenity,
} from "../../lib/hotels-catalog";
import {
  useHotelsInventory,
  type HotelRoom,
} from "../../lib/hotels-inventory-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const W = Dimensions.get("window").width;

const AMENITY_ICON: Record<
  HotelAmenity,
  ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  wifi: Wifi,
  pool: Waves,
  parking: Car,
  breakfast: Utensils,
  gym: Dumbbell,
  spa: Sparkles,
  airport: Plane,
  restaurant: Utensils,
  ac: Wind,
  desk: ConciergeBell,
};

const NIGHT_OPTIONS = [1, 2, 3, 5, 7] as const;
const GUEST_OPTIONS = [1, 2, 3, 4] as const;

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const insets = useSafeAreaInsets();
  const hotel = getHotel(id ?? "");
  const hydrate = useHotelsInventory((s) => s.hydrate);
  const roomsFor = useHotelsInventory((s) => s.roomsFor);
  const byHotel = useHotelsInventory((s) => s.byHotel);

  const [photo, setPhoto] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [nights, setNights] = useState<(typeof NIGHT_OPTIONS)[number]>(2);
  const [guests, setGuests] = useState<(typeof GUEST_OPTIONS)[number]>(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [previewRoomId, setPreviewRoomId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const rooms = useMemo(() => {
    if (!hotel) return [] as HotelRoom[];
    return byHotel[hotel.id] ?? roomsFor(hotel.id);
  }, [hotel, byHotel, roomsFor]);

  useEffect(() => {
    if (!rooms.length) {
      setSelectedRoomId(null);
      return;
    }
    const available = rooms.find((r) => r.stock > 0) ?? rooms[0];
    setSelectedRoomId((cur) =>
      cur && rooms.some((r) => r.id === cur) ? cur : available.id,
    );
  }, [rooms]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;
  const previewRoom = rooms.find((r) => r.id === previewRoomId) ?? null;

  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const gallery = useMemo(() => {
    if (!hotel) return [];
    return (hotel.gallery?.length ? hotel.gallery : [hotel.cover_url]).filter(Boolean);
  }, [hotel]);

  const nightPrice = selectedRoom?.price_amount ?? hotel?.price_amount ?? 0;
  const total = nightPrice * nights;

  if (!hotel) {
    return (
      <Screen edges={["top"]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backFab} onPress={() => router.back()}>
            <Text style={styles.backFabText}>←</Text>
          </Pressable>
        </View>
        <Text style={styles.notFound}>{t("hotels.notFound")}</Text>
      </Screen>
    );
  }

  const confirmBook = () => {
    if (!selectedRoom || selectedRoom.stock <= 0) {
      Alert.alert(t("hotels.noRoomTitle"), t("hotels.noRoomBody"));
      return;
    }
    if (guests > selectedRoom.capacity) {
      Alert.alert(
        t("hotels.capacityTitle"),
        t("hotels.capacityBody", { n: selectedRoom.capacity }),
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setBookOpen(false);
      Alert.alert(
        t("hotels.bookedTitle"),
        t("hotels.bookedBodyRoom", {
          hotel: hotel.name,
          room: selectedRoom.name,
          nights,
          guests,
          amount: formatListing(total, "IQD"),
        }),
        [
          { text: t("common.done") },
          { text: t("hotels.backToList"), onPress: () => router.replace("/hotels") },
        ],
      );
    }, 500);
  };

  const cityLabel = t(HOTEL_CITY_LABEL_KEY[hotel.city]);
  const footerPrice = formatListing(nightPrice, hotel.price_currency);

  return (
    <Screen edges={[]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <OfflineCover
            uri={gallery[photo] ?? hotel.cover_url}
            label={hotel.name}
            style={styles.heroCover}
          />
          <LinearGradient
            colors={["rgba(12,45,41,0.45)", "transparent", "rgba(12,45,41,0.55)"]}
            style={styles.heroScrim}
          />
          <Pressable
            style={[styles.backFab, { top: insets.top + 10 }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Text style={styles.backFabText}>←</Text>
          </Pressable>
          {hotel.featured ? (
            <View style={[styles.heroBadge, { top: insets.top + 14 }]}>
              <Text style={styles.heroBadgeText}>{t("hotels.featured")}</Text>
            </View>
          ) : null}
          {gallery.length > 1 ? (
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>
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
                  label={hotel.name}
                  style={[styles.thumb, i === photo && styles.thumbOn]}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.pad}>
          <Text style={styles.name}>{hotel.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingPill}>
              <Star size={13} color={colors.white} fill={colors.white} strokeWidth={0} />
              <Text style={styles.ratingPillText}>{hotel.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingMeta}>
              {hotel.review_count.toLocaleString()} {t("hotels.reviews")}
            </Text>
            <Text style={styles.starGlyphs}>{"★".repeat(hotel.stars)}</Text>
          </View>

          <View style={styles.locRow}>
            <MapPin size={14} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.locText}>
              {cityLabel} · {hotel.district}
            </Text>
          </View>

          <Text style={styles.desc}>
            {lang === "tr" ? hotel.description_tr : hotel.description_en}
          </Text>

          <Text style={styles.sectionTitle}>{t("hotels.roomsSection")}</Text>
          <Text style={styles.sectionHint}>{t("hotels.roomsHint")}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roomRail}
        >
          {rooms.map((room) => {
            const selected = room.id === selectedRoomId;
            const soldOut = room.stock <= 0;
            return (
              <Pressable
                key={room.id}
                onPress={() => {
                  if (soldOut) return;
                  setSelectedRoomId(room.id);
                }}
                onLongPress={() => setPreviewRoomId(room.id)}
                style={[
                  styles.roomPick,
                  selected && styles.roomPickOn,
                  soldOut && styles.roomPickSold,
                  shadow.soft,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: soldOut }}
              >
                <View style={styles.roomMedia}>
                  <OfflineCover
                    uri={room.cover_url}
                    label={room.name}
                    style={styles.roomCover}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(12,45,41,0.7)"]}
                    style={styles.roomScrim}
                  />
                  {soldOut ? (
                    <View style={styles.soldBadge}>
                      <Text style={styles.soldBadgeText}>{t("hotels.soldOut")}</Text>
                    </View>
                  ) : selected ? (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>{t("hotels.selected")}</Text>
                    </View>
                  ) : null}
                  <Pressable
                    style={styles.galleryFab}
                    onPress={() => setPreviewRoomId(room.id)}
                    hitSlop={6}
                  >
                    <Text style={styles.galleryFabText}>
                      {room.gallery.length} {t("hotels.photos")}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.roomPickBody}>
                  <Text style={styles.roomPickName} numberOfLines={1}>
                    {room.name}
                  </Text>
                  <View style={styles.roomPickMeta}>
                    <Users size={12} color={colors.inkMuted} strokeWidth={2} />
                    <Text style={styles.roomPickMetaText}>
                      {t("hotels.manageCapacity", { n: room.capacity })}
                    </Text>
                    <BedDouble size={12} color={colors.inkMuted} strokeWidth={2} />
                    <Text style={styles.roomPickMetaText}>
                      {t("hotels.manageStock", { n: room.stock })}
                    </Text>
                  </View>
                  <Text style={styles.roomPickPrice}>
                    {formatListing(room.price_amount, "IQD")}
                    <Text style={styles.roomPickNight}> / {t("hotels.perNight")}</Text>
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.pad}>
          <Text style={styles.sectionTitle}>{t("hotels.amenities")}</Text>
          <View style={styles.amenityGrid}>
            {hotel.amenities.map((a) => {
              const Icon = AMENITY_ICON[a];
              return (
                <View key={a} style={styles.amenity}>
                  <View style={styles.amenityIcon}>
                    <Icon size={16} color={colors.ink} strokeWidth={2} />
                  </View>
                  <Text style={styles.amenityLabel}>{t(`hotels.amenity.${a}`)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 12) },
          shadow.float,
        ]}
      >
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>
            {selectedRoom
              ? t("hotels.selectedRoomPrice", { room: selectedRoom.name })
              : t("hotels.fromPerNight")}
          </Text>
          <Text style={styles.footerValue}>{footerPrice}</Text>
        </View>
        <Button
          label={t("hotels.bookCta")}
          variant="ink"
          onPress={() => setBookOpen(true)}
          style={styles.footerCta}
          disabled={!selectedRoom || selectedRoom.stock <= 0}
        />
      </View>

      <Modal
        visible={bookOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setBookOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setBookOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t("hotels.bookTitle")}</Text>
            <Text style={styles.sheetSub}>{hotel.name}</Text>

            {selectedRoom ? (
              <View style={styles.bookRoomRow}>
                <OfflineCover
                  uri={selectedRoom.cover_url}
                  label={selectedRoom.name}
                  style={styles.bookRoomCover}
                />
                <View style={styles.bookRoomBody}>
                  <Text style={styles.bookRoomName}>{selectedRoom.name}</Text>
                  <Text style={styles.sheetMetaText}>
                    {t(`hotels.room.${selectedRoom.room_type}`)} · {cityLabel} ·{" "}
                    {t("hotels.manageCapacity", { n: selectedRoom.capacity })}
                  </Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.fieldLabel}>{t("hotels.nights")}</Text>
            <View style={styles.chipWrap}>
              {NIGHT_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  label={`${n}`}
                  selected={nights === n}
                  onPress={() => setNights(n)}
                  icon={
                    <Calendar
                      size={12}
                      color={nights === n ? colors.flameDeep : colors.ink}
                    />
                  }
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>{t("hotels.guests")}</Text>
            <View style={styles.chipWrap}>
              {GUEST_OPTIONS.map((g) => (
                <Chip
                  key={g}
                  label={`${g}`}
                  selected={guests === g}
                  onPress={() => setGuests(g)}
                  icon={
                    <Users
                      size={12}
                      color={guests === g ? colors.flameDeep : colors.ink}
                    />
                  }
                />
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("hotels.total")}</Text>
              <Text style={styles.totalValue}>{formatListing(total, "IQD")}</Text>
            </View>
            <Text style={styles.demoNote}>{t("hotels.demoNote")}</Text>

            <Button
              label={t("hotels.confirmBook")}
              variant="ink"
              onPress={confirmBook}
              loading={submitting}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!previewRoom}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewRoomId(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setPreviewRoomId(null)}
        >
          {previewRoom ? (
            <Pressable
              style={[styles.previewSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.previewTitle}>{previewRoom.name}</Text>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.previewPager}
              >
                {previewRoom.gallery.map((uri, i) => (
                  <OfflineCover
                    key={`${previewRoom.id}-g-${i}`}
                    uri={uri}
                    label={previewRoom.name}
                    style={styles.previewImage}
                  />
                ))}
              </ScrollView>
              <Text style={styles.previewMeta}>
                {formatListing(previewRoom.price_amount, "IQD")} / {t("hotels.perNight")} ·{" "}
                {t("hotels.manageCapacity", { n: previewRoom.capacity })}
              </Text>
              <Button
                label={
                  previewRoom.stock > 0
                    ? t("hotels.selectThisRoom")
                    : t("hotels.soldOut")
                }
                variant="ink"
                disabled={previewRoom.stock <= 0}
                onPress={() => {
                  if (previewRoom.stock > 0) setSelectedRoomId(previewRoom.id);
                  setPreviewRoomId(null);
                }}
              />
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 0,
  },
  notFound: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 40,
  },
  topBar: {
    paddingHorizontal: space.lg,
  },
  hero: {
    width: W,
    height: Math.round(W * 0.72),
    backgroundColor: colors.mist,
  },
  heroCover: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  backFab: {
    position: "absolute",
    left: space.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  backFabText: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    marginTop: -1,
  },
  heroBadge: {
    position: "absolute",
    right: space.lg,
    backgroundColor: colors.flame,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  heroBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  photoCount: {
    position: "absolute",
    right: space.lg,
    bottom: 14,
    backgroundColor: "rgba(12,45,41,0.72)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  photoCountText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  thumbs: {
    paddingHorizontal: space.lg,
    paddingTop: 12,
    gap: 8,
  },
  thumb: {
    width: 72,
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbOn: { borderColor: colors.ink },
  pad: {
    paddingHorizontal: space.lg,
    paddingTop: 14,
    gap: 10,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  ratingPillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
  },
  ratingMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  starGlyphs: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.flame,
  },
  locRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 21,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
    marginTop: 10,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: -4,
  },
  roomRail: {
    paddingHorizontal: space.lg,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  roomPick: {
    width: 212,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.line,
  },
  roomPickOn: {
    borderColor: colors.ink,
  },
  roomPickSold: {
    opacity: 0.55,
  },
  roomMedia: {
    height: 132,
    backgroundColor: colors.mist,
  },
  roomCover: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  roomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  selectedBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
  },
  soldBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  soldBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
  },
  galleryFab: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  galleryFabText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.ink,
  },
  roomPickBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 4,
  },
  roomPickName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  roomPickMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  roomPickMetaText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    marginRight: 4,
  },
  roomPickPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.flameDeep,
    marginTop: 2,
  },
  roomPickNight: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  amenityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenity: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  amenityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  amenityLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.ink,
    flexShrink: 1,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.lg,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerPrice: { flex: 1, gap: 2 },
  footerLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  footerValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  footerCta: {
    minWidth: 148,
    paddingHorizontal: 18,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: 10,
    gap: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  sheetSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: -6,
  },
  bookRoomRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: radius.md,
    padding: 10,
  },
  bookRoomCover: {
    width: 64,
    height: 52,
    borderRadius: radius.sm,
  },
  bookRoomBody: { flex: 1, gap: 2 },
  bookRoomName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  sheetMetaText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.ink,
  },
  fieldLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  totalLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  demoNote: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 4,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  previewSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: 16,
    gap: 12,
  },
  previewTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  previewPager: {
    height: Math.round(W * 0.55),
  },
  previewImage: {
    width: W - space.lg * 2,
    height: Math.round(W * 0.55),
    borderRadius: radius.lg,
    marginRight: 0,
  },
  previewMeta: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
});
