import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ChevronRight,
  Filter,
  MapPin,
  Plus,
  Search,
  Star,
  Truck,
  Weight,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FreightFilterSheet,
  type FreightListFilters,
} from "../../components/FreightFilterSheet";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  formatDistance,
  formatWeight,
  getLoadStatusColor,
  getLoadStatusLabel,
  getTruckTypeLabel,
  Load,
  useFreightStore,
} from "../../lib/freight-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const DEMO_LOADS: Load[] = [
  {
    id: "load-1",
    shipperId: "shipper-1",
    shipperName: "ABC Nakliyat",
    shipperRating: 4.8,
    shipperVerified: true,
    title: "İnşaat Malzemesi - Çimento",
    description: "20 ton çimento, paletli",
    category: "construction",
    weight: 20,
    weightUnit: "ton",
    truckType: "flatbed",
    pickup: {
      address: "Organize Sanayi Bölgesi",
      city: "Erbil",
      coordinates: { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
    },
    delivery: {
      address: "Şehir Merkezi İnşaat",
      city: "Duhok",
      coordinates: { latitude: 36.8671, longitude: 42.9503, timestamp: Date.now() },
    },
    distance: 145,
    pickupDate: "2026-11-14",
    pickupTimeWindow: { from: "08:00", to: "12:00" },
    price: 500000,
    priceType: "fixed",
    currency: "IQD",
    status: "posted",
    bidsCount: 3,
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now(),
  },
  {
    id: "load-2",
    shipperId: "shipper-2",
    shipperName: "Fresh Foods Co",
    shipperRating: 4.5,
    shipperVerified: true,
    title: "Soğuk Zincir - Meyve Sebze",
    description: "Taze meyve ve sebze, frigorifik araç gerekli",
    category: "food",
    weight: 8,
    weightUnit: "ton",
    truckType: "reefer",
    pickup: {
      address: "Toptan Hal",
      city: "Sulaymaniyah",
      coordinates: { latitude: 35.557, longitude: 45.4351, timestamp: Date.now() },
    },
    delivery: {
      address: "Süpermarket Deposu",
      city: "Erbil",
      coordinates: { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
    },
    distance: 210,
    pickupDate: "2026-11-13",
    price: 750000,
    priceType: "fixed",
    currency: "IQD",
    status: "bidding",
    bidsCount: 7,
    requirements: ["Frigorifik", "Tecrübeli Sürücü"],
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now(),
  },
  {
    id: "load-3",
    shipperId: "shipper-3",
    shipperName: "Mobilya Market",
    shipperRating: 4.2,
    title: "Mobilya Taşıma",
    description: "Ev eşyası ve mobilya, dikkatli taşıma gerekli",
    category: "furniture",
    weight: 3500,
    weightUnit: "kg",
    truckType: "dry_van",
    pickup: {
      address: "Mobilya Fabrikası",
      city: "Erbil",
      coordinates: { latitude: 36.2023, longitude: 44.0189, timestamp: Date.now() },
    },
    delivery: {
      address: "Ev Adresi",
      city: "Kirkuk",
      coordinates: { latitude: 35.4681, longitude: 44.3922, timestamp: Date.now() },
    },
    distance: 95,
    pickupDate: "2026-11-15",
    priceType: "negotiable",
    currency: "IQD",
    status: "posted",
    bidsCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    updatedAt: Date.now(),
  },
  {
    id: "load-4",
    shipperId: "shipper-4",
    shipperName: "Ziraat Kooperatifi",
    shipperRating: 4.9,
    shipperVerified: true,
    title: "Tarım Ürünleri - Buğday",
    description: "25 ton buğday, silobas tercih edilir",
    category: "agriculture",
    weight: 25,
    weightUnit: "ton",
    truckType: "dry_van",
    pickup: {
      address: "Çiftlik",
      city: "Mosul",
      coordinates: { latitude: 36.335, longitude: 43.1189, timestamp: Date.now() },
    },
    delivery: {
      address: "Un Fabrikası",
      city: "Erbil",
      coordinates: { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
    },
    distance: 88,
    pickupDate: "2026-11-16",
    price: 400000,
    priceType: "fixed",
    currency: "IQD",
    status: "posted",
    bidsCount: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    updatedAt: Date.now(),
  },
  {
    id: "load-5",
    shipperId: "shipper-5",
    shipperName: "Kuzey Makine",
    shipperRating: 4.6,
    shipperVerified: true,
    title: "Makine Ekipmanı",
    description: "CNC tezgah, lowboy gerekli",
    category: "machinery",
    weight: 12,
    weightUnit: "ton",
    truckType: "lowboy",
    pickup: {
      address: "Sanayi sitesi",
      city: "Erbil",
      coordinates: { latitude: 36.191, longitude: 44.01, timestamp: Date.now() },
    },
    delivery: {
      address: "Fabrika",
      city: "Baghdad",
      coordinates: { latitude: 33.3152, longitude: 44.3661, timestamp: Date.now() },
    },
    distance: 360,
    pickupDate: "2026-11-18",
    price: 1200000,
    priceType: "fixed",
    currency: "IQD",
    status: "posted",
    bidsCount: 2,
    createdAt: Date.now() - 1000 * 60 * 45,
    updatedAt: Date.now(),
  },
];

export default function FreightScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { loads, setLoads, isLoading } = useFreightStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FreightListFilters>({ category: null });
  const [filterOpen, setFilterOpen] = useState(false);
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    setLoads(DEMO_LOADS);
  }, [setLoads]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoads(DEMO_LOADS);
    setRefreshing(false);
  };

  const filteredLoads = loads.filter((load) => {
    if (filters.category && load.category !== filters.category) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        load.title.toLowerCase().includes(query) ||
        load.pickup.city.toLowerCase().includes(query) ||
        load.delivery.city.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const filterActive = filters.category != null;

  const openLoad = (loadId: string) => {
    router.push({
      pathname: "/freight/[id]",
      params: { id: loadId },
    });
  };

  const createLoad = () => {
    router.push("/freight/create");
  };

  const focusBoard = () => {
    listRef.current?.scrollTo({ y: 220, animated: true });
  };

  return (
    <Screen edges={["top"]} brand={false} style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader
        title={t("freight.hubTitle")}
        subtitle={t("freight.subtitle")}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        ref={listRef}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.flame]} />
        }
      >
        <View style={styles.hubCard}>
          <View style={styles.hubIcon}>
            <Truck size={22} color={colors.flame} strokeWidth={2.3} />
          </View>
          <Text style={styles.hubTitle}>{t("freight.hubTitle")}</Text>
          <Text style={styles.hubSubtitle}>{t("freight.subtitle")}</Text>
          <View style={styles.hubActions}>
            <TouchableOpacity style={styles.hubBtnPrimary} onPress={focusBoard} activeOpacity={0.9}>
              <Search size={16} color={colors.white} strokeWidth={2.4} />
              <Text style={styles.hubBtnPrimaryText}>{t("freight.findLoad")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hubBtnSecondary} onPress={createLoad} activeOpacity={0.9}>
              <Plus size={16} color={colors.flame} strokeWidth={2.4} />
              <Text style={styles.hubBtnSecondaryText}>{t("freight.postAd")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={colors.inkMuted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder={t("freight.searchPlaceholder")}
              placeholderTextColor={colors.inkFaint}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, filterActive && styles.filterBtnOn]}
            onPress={() => setFilterOpen(true)}
            activeOpacity={0.85}
            accessibilityLabel={t("freight.filtersTitle")}
          >
            <Filter
              size={18}
              color={filterActive ? colors.white : colors.flame}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsHeading}>{t("freight.openLoads")}</Text>
          <Text style={styles.statsText}>
            {t("freight.availableLoads", { count: filteredLoads.length })}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.flame} style={styles.loader} />
        ) : filteredLoads.length === 0 ? (
          <View style={styles.empty}>
            <Truck size={48} color={colors.inkFaint} strokeWidth={1.5} />
            <Text style={styles.emptyText}>{t("freight.noLoads")}</Text>
            <TouchableOpacity style={styles.emptyCta} onPress={createLoad} activeOpacity={0.9}>
              <Text style={styles.emptyCtaText}>{t("freight.postAd")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredLoads.map((load) => (
            <TouchableOpacity
              key={load.id}
              style={styles.loadCard}
              onPress={() => openLoad(load.id)}
              activeOpacity={0.9}
            >
              <View style={styles.loadHeader}>
                <View style={styles.loadMeta}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: getLoadStatusColor(load.status) }]}
                  >
                    <Text style={styles.statusText}>{getLoadStatusLabel(load.status)}</Text>
                  </View>
                  <Text style={styles.timeAgo}>
                    {Math.round((Date.now() - load.createdAt) / 60000)} dk önce
                  </Text>
                </View>
                {load.shipperVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Star size={10} color={colors.white} fill={colors.white} />
                  </View>
                ) : null}
              </View>

              <Text style={styles.loadTitle}>{load.title}</Text>

              <View style={styles.routeRow}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: "#4CAF50" }]} />
                  <Text style={styles.routeCity}>{load.pickup.city}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: colors.flame }]} />
                  <Text style={styles.routeCity}>{load.delivery.city}</Text>
                </View>
                {load.distance ? (
                  <Text style={styles.distanceText}>{formatDistance(load.distance)}</Text>
                ) : null}
              </View>

              <View style={styles.loadDetails}>
                <View style={styles.detailItem}>
                  <Weight size={14} color={colors.inkMuted} strokeWidth={2} />
                  <Text style={styles.detailText}>
                    {formatWeight(load.weight, load.weightUnit)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Truck size={14} color={colors.inkMuted} strokeWidth={2} />
                  <Text style={styles.detailText}>{getTruckTypeLabel(load.truckType)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MapPin size={14} color={colors.inkMuted} strokeWidth={2} />
                  <Text style={styles.detailText}>{load.pickupDate}</Text>
                </View>
              </View>

              <View style={styles.loadFooter}>
                <View style={styles.priceBox}>
                  {load.price ? (
                    <Text style={styles.priceText}>
                      {load.price.toLocaleString()} {load.currency}
                    </Text>
                  ) : (
                    <Text style={styles.negotiableText}>{t("freight.negotiable")}</Text>
                  )}
                </View>
                <View style={styles.bidsBox}>
                  <Text style={styles.bidsText}>
                    {load.bidsCount} {t("freight.bids")}
                  </Text>
                  <ChevronRight size={16} color={colors.inkMuted} strokeWidth={2} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={createLoad}
        activeOpacity={0.9}
        accessibilityLabel={t("freight.postAd")}
      >
        <Plus size={24} color={colors.white} strokeWidth={2.5} />
      </TouchableOpacity>

      <FreightFilterSheet
        visible={filterOpen}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  hubCard: {
    marginHorizontal: space.md,
    marginTop: space.sm,
    marginBottom: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1.5,
    borderColor: "rgba(243,106,28,0.35)",
    ...shadow.soft,
  },
  hubIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  hubTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  hubSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginBottom: space.md,
  },
  hubActions: {
    flexDirection: "row",
    gap: space.sm,
  },
  hubBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.flame,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  hubBtnPrimaryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  hubBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.flameSoft,
    borderRadius: radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(243,106,28,0.35)",
  },
  hubBtnSecondaryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flameDeep,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    gap: space.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    gap: space.sm,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  filterBtnOn: {
    backgroundColor: colors.flame,
  },
  list: {
    flex: 1,
  },
  statsRow: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  statsHeading: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  statsText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  loader: {
    marginTop: space.section,
  },
  empty: {
    alignItems: "center",
    paddingTop: space.section * 2,
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
  },
  emptyCta: {
    backgroundColor: colors.flame,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  emptyCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  loadCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginHorizontal: space.md,
    marginBottom: space.sm,
    ...shadow.soft,
  },
  loadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },
  loadMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
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
  timeAgo: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  loadTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
    marginBottom: space.sm,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space.sm,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeCity: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.mist,
    marginHorizontal: space.sm,
  },
  distanceText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    marginLeft: space.sm,
  },
  loadDetails: {
    flexDirection: "row",
    gap: space.md,
    marginBottom: space.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  loadFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  priceBox: {},
  priceText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.flame,
  },
  negotiableText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  bidsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bidsText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  fab: {
    position: "absolute",
    right: space.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
});
