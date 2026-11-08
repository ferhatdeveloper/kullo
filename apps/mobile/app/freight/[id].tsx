import { router, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Send,
  Star,
  Truck,
  User,
  Weight,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FreeMap } from "../../components/FreeMap";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  Bid,
  formatDistance,
  formatWeight,
  getLoadCategoryLabel,
  getLoadStatusColor,
  getLoadStatusLabel,
  getTruckTypeLabel,
  Load,
  useFreightStore,
} from "../../lib/freight-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const DEMO_BIDS: Bid[] = [
  {
    id: "bid-1",
    loadId: "load-1",
    carrierId: "carrier-1",
    carrierName: "Hızlı Nakliyat",
    carrierRating: 4.7,
    carrierVerified: true,
    truckType: "flatbed",
    truckPlate: "33 ABC 123",
    driverName: "Ahmet Yılmaz",
    price: 480000,
    currency: "IQD",
    message: "Uygun araç mevcut, hemen başlayabiliriz.",
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 15,
    updatedAt: Date.now(),
  },
  {
    id: "bid-2",
    loadId: "load-1",
    carrierId: "carrier-2",
    carrierName: "Güvenli Taşıma",
    carrierRating: 4.9,
    carrierVerified: true,
    truckType: "flatbed",
    truckPlate: "06 DEF 456",
    driverName: "Mehmet Kaya",
    price: 520000,
    currency: "IQD",
    message: "10 yıllık tecrübe, sigortalı taşıma.",
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 45,
    updatedAt: Date.now(),
  },
  {
    id: "bid-3",
    loadId: "load-1",
    carrierId: "carrier-3",
    carrierName: "Express Kargo",
    carrierRating: 4.3,
    truckType: "flatbed",
    price: 450000,
    currency: "IQD",
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now(),
  },
];

export default function LoadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { loads } = useFreightStore();
  const [activeTab, setActiveTab] = useState<"details" | "bids">("details");
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = loads.find((l) => l.id === id);

  if (!load) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("freight.loadDetails")} onBack={() => router.back()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t("freight.loadNotFound")}</Text>
        </View>
      </Screen>
    );
  }

  const mapMarkers = [
    {
      id: "pickup",
      latitude: load.pickup.coordinates.latitude,
      longitude: load.pickup.coordinates.longitude,
      title: load.pickup.address,
      icon: "pickup" as const,
    },
    {
      id: "delivery",
      latitude: load.delivery.coordinates.latitude,
      longitude: load.delivery.coordinates.longitude,
      title: load.delivery.address,
      icon: "destination" as const,
    },
  ];

  const route = [
    { latitude: load.pickup.coordinates.latitude, longitude: load.pickup.coordinates.longitude },
    { latitude: load.delivery.coordinates.latitude, longitude: load.delivery.coordinates.longitude },
  ];

  const submitBid = async () => {
    if (!bidPrice.trim()) {
      Alert.alert(t("freight.error"), t("freight.enterPrice"));
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    Alert.alert(t("freight.bidSubmitted"), t("freight.bidSubmittedBody"), [
      { text: t("common.ok"), onPress: () => router.back() },
    ]);
  };

  const acceptBid = (bid: Bid) => {
    Alert.alert(t("freight.acceptBid"), t("freight.acceptBidConfirm", { name: bid.carrierName }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.accept"),
        onPress: () => {
          Alert.alert(t("freight.bidAccepted"), t("freight.bidAcceptedBody"));
        },
      },
    ]);
  };

  const contactShipper = () => {
    if (load.shipperPhone) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: `freight-${load.id}` },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("freight.loadDetails")}
        onBack={() => router.back()}
        right={
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
            <Phone size={18} color={colors.flame} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      <FreeMap style={styles.map} markers={mapMarkers} route={route} zoom={8} interactive={false} />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "details" && styles.tabActive]}
          onPress={() => setActiveTab("details")}
        >
          <Text style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}>
            {t("freight.details")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "bids" && styles.tabActive]}
          onPress={() => setActiveTab("bids")}
        >
          <Text style={[styles.tabText, activeTab === "bids" && styles.tabTextActive]}>
            {t("freight.bids")} ({load.bidsCount})
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "details" ? (
            <>
              <View style={styles.headerCard}>
                <View style={styles.headerRow}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: getLoadStatusColor(load.status) }]}
                  >
                    <Text style={styles.statusText}>{getLoadStatusLabel(load.status)}</Text>
                  </View>
                  <Text style={styles.category}>{getLoadCategoryLabel(load.category)}</Text>
                </View>
                <Text style={styles.title}>{load.title}</Text>
                {load.description && <Text style={styles.description}>{load.description}</Text>}
              </View>

              <View style={styles.shipperCard}>
                <View style={styles.shipperAvatar}>
                  <User size={20} color={colors.white} strokeWidth={2} />
                </View>
                <View style={styles.shipperInfo}>
                  <View style={styles.shipperNameRow}>
                    <Text style={styles.shipperName}>{load.shipperName}</Text>
                    {load.shipperVerified && (
                      <View style={styles.verifiedBadge}>
                        <Check size={10} color={colors.white} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  {load.shipperRating && (
                    <View style={styles.ratingRow}>
                      <Star size={12} color="#FFC107" fill="#FFC107" />
                      <Text style={styles.ratingText}>{load.shipperRating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.contactBtn} onPress={contactShipper}>
                  <MessageCircle size={18} color={colors.flame} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.routeCard}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: "#4CAF50" }]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>{t("freight.pickup")}</Text>
                    <Text style={styles.routeCity}>{load.pickup.city}</Text>
                    <Text style={styles.routeAddress}>{load.pickup.address}</Text>
                  </View>
                </View>
                <View style={styles.routeLineVertical} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: colors.flame }]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>{t("freight.delivery")}</Text>
                    <Text style={styles.routeCity}>{load.delivery.city}</Text>
                    <Text style={styles.routeAddress}>{load.delivery.address}</Text>
                  </View>
                </View>
                {load.distance && (
                  <View style={styles.distanceBadge}>
                    <MapPin size={12} color={colors.inkMuted} strokeWidth={2} />
                    <Text style={styles.distanceText}>{formatDistance(load.distance)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Weight size={20} color={colors.flame} strokeWidth={2} />
                  <Text style={styles.detailLabel}>{t("freight.weight")}</Text>
                  <Text style={styles.detailValue}>
                    {formatWeight(load.weight, load.weightUnit)}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <Truck size={20} color={colors.flame} strokeWidth={2} />
                  <Text style={styles.detailLabel}>{t("freight.truckType")}</Text>
                  <Text style={styles.detailValue}>{getTruckTypeLabel(load.truckType)}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Calendar size={20} color={colors.flame} strokeWidth={2} />
                  <Text style={styles.detailLabel}>{t("freight.pickupDate")}</Text>
                  <Text style={styles.detailValue}>{load.pickupDate}</Text>
                </View>
                {load.pickupTimeWindow && (
                  <View style={styles.detailCard}>
                    <Clock size={20} color={colors.flame} strokeWidth={2} />
                    <Text style={styles.detailLabel}>{t("freight.timeWindow")}</Text>
                    <Text style={styles.detailValue}>
                      {load.pickupTimeWindow.from} - {load.pickupTimeWindow.to}
                    </Text>
                  </View>
                )}
              </View>

              {load.requirements && load.requirements.length > 0 && (
                <View style={styles.requirementsCard}>
                  <Text style={styles.sectionTitle}>{t("freight.requirements")}</Text>
                  <View style={styles.requirementsList}>
                    {load.requirements.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Check size={14} color="#4CAF50" strokeWidth={2.5} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              {DEMO_BIDS.length === 0 ? (
                <View style={styles.noBids}>
                  <Package size={48} color={colors.inkFaint} strokeWidth={1.5} />
                  <Text style={styles.noBidsText}>{t("freight.noBidsYet")}</Text>
                </View>
              ) : (
                DEMO_BIDS.map((bid) => (
                  <View key={bid.id} style={styles.bidCard}>
                    <View style={styles.bidHeader}>
                      <View style={styles.bidCarrier}>
                        <View style={styles.carrierAvatar}>
                          <Truck size={16} color={colors.white} strokeWidth={2} />
                        </View>
                        <View>
                          <View style={styles.carrierNameRow}>
                            <Text style={styles.carrierName}>{bid.carrierName}</Text>
                            {bid.carrierVerified && (
                              <View style={styles.verifiedBadgeSmall}>
                                <Check size={8} color={colors.white} strokeWidth={3} />
                              </View>
                            )}
                          </View>
                          {bid.carrierRating && (
                            <View style={styles.ratingRow}>
                              <Star size={10} color="#FFC107" fill="#FFC107" />
                              <Text style={styles.ratingTextSmall}>
                                {bid.carrierRating.toFixed(1)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.bidPrice}>
                        {bid.price.toLocaleString()} {bid.currency}
                      </Text>
                    </View>
                    {bid.message && <Text style={styles.bidMessage}>{bid.message}</Text>}
                    {bid.truckPlate && (
                      <Text style={styles.bidPlate}>
                        {t("freight.plate")}: {bid.truckPlate}
                      </Text>
                    )}
                    <View style={styles.bidActions}>
                      <TouchableOpacity style={styles.bidActionBtn} activeOpacity={0.85}>
                        <MessageCircle size={16} color={colors.flame} strokeWidth={2} />
                        <Text style={styles.bidActionText}>{t("freight.message")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => acceptBid(bid)}
                        activeOpacity={0.85}
                      >
                        <Check size={16} color={colors.white} strokeWidth={2.5} />
                        <Text style={styles.acceptBtnText}>{t("freight.accept")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>

        {activeTab === "details" && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
            <View style={styles.priceBox}>
              {load.price ? (
                <>
                  <Text style={styles.priceLabel}>{t("freight.askingPrice")}</Text>
                  <Text style={styles.price}>
                    {load.price.toLocaleString()} {load.currency}
                  </Text>
                </>
              ) : (
                <Text style={styles.negotiablePrice}>{t("freight.negotiable")}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.bidBtn}
              onPress={() => setActiveTab("bids")}
              activeOpacity={0.9}
            >
              <Send size={18} color={colors.white} strokeWidth={2} />
              <Text style={styles.bidBtnText}>{t("freight.placeBid")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "bids" && (
          <View style={[styles.bidFooter, { paddingBottom: insets.bottom + space.md }]}>
            <TextInput
              style={styles.bidInput}
              placeholder={t("freight.yourBidPrice")}
              placeholderTextColor={colors.inkFaint}
              keyboardType="numeric"
              value={bidPrice}
              onChangeText={setBidPrice}
            />
            <TouchableOpacity
              style={[styles.submitBidBtn, isSubmitting && styles.submitBidBtnDisabled]}
              onPress={submitBid}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Send size={18} color={colors.white} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    height: 180,
    marginHorizontal: space.md,
    marginBottom: space.sm,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 4,
    ...shadow.soft,
  },
  tab: {
    flex: 1,
    paddingVertical: space.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.flame,
  },
  tabText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    ...shadow.soft,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
  },
  category: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: space.xs,
    lineHeight: 20,
  },
  shipperCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    ...shadow.soft,
  },
  shipperAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  shipperInfo: {
    flex: 1,
    marginLeft: space.sm,
  },
  shipperNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shipperName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    ...shadow.soft,
  },
  routePoint: {
    flexDirection: "row",
    gap: space.sm,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  routeCity: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  routeAddress: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  routeLineVertical: {
    width: 2,
    height: 20,
    backgroundColor: colors.mist,
    marginLeft: 5,
    marginVertical: 4,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    right: space.md,
    top: space.md,
    backgroundColor: colors.mist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  distanceText: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.sm,
  },
  detailCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    alignItems: "center",
    gap: 4,
    ...shadow.soft,
  },
  detailLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  detailValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  requirementsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    ...shadow.soft,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
    marginBottom: space.sm,
  },
  requirementsList: {
    gap: space.xs,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  requirementText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  noBids: {
    alignItems: "center",
    paddingTop: space.section,
    gap: space.md,
  },
  noBidsText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
  },
  bidCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    ...shadow.soft,
  },
  bidHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bidCarrier: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  carrierAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  carrierNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carrierName: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  verifiedBadgeSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingTextSmall: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
  },
  bidPrice: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.flame,
  },
  bidMessage: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: space.sm,
    lineHeight: 18,
  },
  bidPlate: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: space.xs,
  },
  bidActions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  bidActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: space.sm,
    backgroundColor: colors.flameSoft,
    borderRadius: radius.sm,
  },
  bidActionText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flame,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: space.sm,
    backgroundColor: "#4CAF50",
    borderRadius: radius.sm,
  },
  acceptBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  priceBox: {},
  priceLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.flame,
  },
  negotiablePrice: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.inkMuted,
  },
  bidBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.flame,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    ...shadow.float,
  },
  bidBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  bidFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  bidInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  submitBidBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.float,
  },
  submitBidBtnDisabled: {
    opacity: 0.5,
  },
});
