import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Phone,
  Star,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FreeMap } from "../../components/FreeMap";
import { useLiveLocation } from "../../lib/live-location";
import {
  calculateOrderETA,
  getOrderStatusColor,
  getOrderStatusText,
  Order,
  useMultiAgentStore,
} from "../../lib/multi-agent-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const DEMO_ORDER: Order = {
  id: "demo-order-1",
  type: "food",
  status: "en_route",
  pickupLocation: {
    latitude: 36.1901,
    longitude: 44.0091,
    address: "Erbil Citadel Restaurant",
    timestamp: Date.now(),
  },
  dropoffLocation: {
    latitude: 36.2023,
    longitude: 44.0189,
    address: "Empire World, Erbil",
    timestamp: Date.now(),
  },
  estimatedTime: 15,
  totalAmount: 35000,
  currency: "IQD",
  assignedAgent: {
    id: "agent-1",
    name: "Ahmed Hassan",
    type: "courier",
    status: "en_route",
    location: {
      latitude: 36.1956,
      longitude: 44.0134,
      heading: 45,
      timestamp: Date.now(),
    },
    phone: "+964 750 123 4567",
    rating: 4.8,
    vehicleType: "Motorcycle",
    vehiclePlate: "12 A 3456",
  },
  items: [
    { id: "1", name: "Kebab Plate", quantity: 2, price: 12000 },
    { id: "2", name: "Hummus", quantity: 1, price: 4000 },
    { id: "3", name: "Fresh Juice", quantity: 2, price: 7000 },
  ],
  createdAt: Date.now() - 1000 * 60 * 20,
  updatedAt: Date.now(),
};

export default function TrackOrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { userLocation, startTracking } = useLiveLocation();
  const { activeOrder, setActiveOrder, updateAgentLocation } = useMultiAgentStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    startTracking();
    setActiveOrder(DEMO_ORDER);

    const interval = setInterval(() => {
      if (activeOrder?.assignedAgent) {
        const current = activeOrder.assignedAgent.location;
        const newLat = current.latitude + (Math.random() - 0.5) * 0.001;
        const newLng = current.longitude + (Math.random() - 0.5) * 0.001;
        updateAgentLocation(activeOrder.assignedAgent.id, {
          latitude: newLat,
          longitude: newLng,
          heading: current.heading ? current.heading + (Math.random() - 0.5) * 30 : 0,
          timestamp: Date.now(),
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const order = activeOrder || DEMO_ORDER;
  const agent = order.assignedAgent;
  const statusColor = getOrderStatusColor(order.status);
  const statusText = getOrderStatusText(order.status, order.type);
  const eta = calculateOrderETA(order, userLocation);

  const route = agent
    ? [
        { latitude: order.pickupLocation.latitude, longitude: order.pickupLocation.longitude },
        { latitude: agent.location.latitude, longitude: agent.location.longitude },
        { latitude: order.dropoffLocation.latitude, longitude: order.dropoffLocation.longitude },
      ]
    : undefined;

  const markers = [
    {
      id: "pickup",
      latitude: order.pickupLocation.latitude,
      longitude: order.pickupLocation.longitude,
      title: order.pickupLocation.address,
      icon: "pickup" as const,
    },
    {
      id: "dropoff",
      latitude: order.dropoffLocation.latitude,
      longitude: order.dropoffLocation.longitude,
      title: order.dropoffLocation.address,
      icon: "destination" as const,
    },
  ];

  const callAgent = () => {
    if (agent?.phone) {
      console.log("Calling:", agent.phone);
    }
  };

  const messageAgent = () => {
    if (agent) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: `order-${order.id}` },
      });
    }
  };

  return (
    <View style={styles.container}>
      <FreeMap
        style={styles.map}
        agents={agent ? [agent] : []}
        markers={markers}
        route={route}
        userLocation={userLocation}
        showUserLocation
        interactive
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <X size={20} color={colors.ink} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.headerStatus}>{statusText}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.sheet, isExpanded && styles.sheetExpanded]}>
        <TouchableOpacity
          style={styles.sheetHandle}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.9}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.etaRow}>
            <View style={styles.etaBox}>
              <Clock size={18} color={colors.flame} strokeWidth={2} />
              <View>
                <Text style={styles.etaLabel}>{t("track.eta")}</Text>
                <Text style={styles.etaValue}>{eta}</Text>
              </View>
            </View>
            <View style={styles.etaBox}>
              <Navigation size={18} color={colors.flame} strokeWidth={2} />
              <View>
                <Text style={styles.etaLabel}>{t("track.status")}</Text>
                <Text style={[styles.etaValue, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>
          </View>

          {agent && (
            <View style={styles.agentCard}>
              <View style={styles.agentInfo}>
                {agent.avatar ? (
                  <Image source={{ uri: agent.avatar }} style={styles.agentAvatar} />
                ) : (
                  <View style={styles.agentAvatarPlaceholder}>
                    <Text style={styles.agentInitial}>{agent.name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.agentDetails}>
                  <Text style={styles.agentName}>{agent.name}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#FFC107" fill="#FFC107" />
                    <Text style={styles.ratingText}>{agent.rating?.toFixed(1)}</Text>
                    {agent.vehiclePlate && (
                      <Text style={styles.plateText}>{agent.vehiclePlate}</Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.agentActions}>
                <TouchableOpacity style={styles.agentBtn} onPress={messageAgent}>
                  <MessageCircle size={18} color={colors.flame} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.agentBtn} onPress={callAgent}>
                  <Phone size={18} color={colors.flame} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: "#4CAF50" }]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{t("track.pickup")}</Text>
                <Text style={styles.locationAddress}>{order.pickupLocation.address}</Text>
              </View>
            </View>
            <View style={styles.locationLine} />
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: colors.flame }]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{t("track.dropoff")}</Text>
                <Text style={styles.locationAddress}>{order.dropoffLocation.address}</Text>
              </View>
            </View>
          </View>

          {order.items && order.items.length > 0 && (
            <View style={styles.itemsCard}>
              <View style={styles.itemsHeader}>
                <Package size={16} color={colors.ink} strokeWidth={2} />
                <Text style={styles.itemsTitle}>
                  {t("track.items")} ({order.items.length})
                </Text>
                <ChevronRight size={16} color={colors.inkMuted} />
              </View>
              {order.items.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemQty}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString()} {order.currency}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t("track.total")}</Text>
                <Text style={styles.totalValue}>
                  {order.totalAmount.toLocaleString()} {order.currency}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.supportBtn} activeOpacity={0.85}>
            <Text style={styles.supportText}>{t("track.support")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerStatus: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  headerRight: {
    width: 40,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.card,
  },
  sheetExpanded: {
    height: "75%",
  },
  sheetHandle: {
    alignItems: "center",
    paddingVertical: space.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkFaint,
  },
  sheetScroll: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  etaRow: {
    flexDirection: "row",
    gap: space.md,
    marginBottom: space.lg,
  },
  etaBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.flameSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  etaLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  etaValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.mist,
    marginBottom: space.md,
  },
  agentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  agentAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  agentInitial: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
  },
  agentDetails: {
    gap: 2,
  },
  agentName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  plateText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginLeft: 6,
  },
  agentActions: {
    flexDirection: "row",
    gap: space.sm,
  },
  agentBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.mist,
    marginBottom: space.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  locationLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.mist,
    marginLeft: 5,
    marginVertical: 4,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  locationAddress: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
    marginTop: 2,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.mist,
    marginBottom: space.md,
  },
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.sm,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.mist,
  },
  itemsTitle: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.xs,
  },
  itemQty: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
    width: 28,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  itemPrice: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  totalLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.flame,
  },
  supportBtn: {
    alignItems: "center",
    paddingVertical: space.md,
  },
  supportText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.flame,
  },
});
