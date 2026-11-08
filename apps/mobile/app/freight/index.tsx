import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Box,
  ChevronRight,
  Filter,
  MapPin,
  Package,
  Plus,
  Search,
  Star,
  Truck,
  Weight,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "../../components/brand";
import {
  formatDistance,
  formatWeight,
  getLoadCategoryLabel,
  getLoadStatusColor,
  getLoadStatusLabel,
  getTruckTypeLabel,
  Load,
  LoadCategory,
  TruckType,
  useFreightStore,
} from "../../lib/freight-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const { width: SCREEN_W } = Dimensions.get("window");

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
    pickupDate: "2026-11-10",
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
      coordinates: { latitude: 35.5570, longitude: 45.4351, timestamp: Date.now() },
    },
    delivery: {
      address: "Süpermarket Deposu",
      city: "Erbil",
      coordinates: { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
    },
    distance: 210,
    pickupDate: "2026-11-09",
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
    pickupDate: "2026-11-11",
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
      coordinates: { latitude: 36.3350, longitude: 43.1189, timestamp: Date.now() },
    },
    delivery: {
      address: "Un Fabrikası",
      city: "Erbil",
      coordinates: { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
    },
    distance: 88,
    pickupDate: "2026-11-12",
    price: 400000,
    priceType: "fixed",
    currency: "IQD",
    status: "posted",
    bidsCount: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    updatedAt: Date.now(),
  },
];

const CATEGORIES: { key: LoadCategory | "all"; icon: typeof Package }[] = [
  { key: "all", icon: Box },
  { key: "construction", icon: Package },
  { key: "food", icon: Package },
  { key: "agriculture", icon: Package },
  { key: "furniture", icon: Package },
  { key: "machinery", icon: Package },
];

export default function FreightScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { loads, setLoads, filters, setFilters, isLoading } = useFreightStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<LoadCategory | "all">("all");

  useEffect(() => {
    setLoads(DEMO_LOADS);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoads(DEMO_LOADS);
    setRefreshing(false);
  };

  const filteredLoads = loads.filter((load) => {
    if (activeCategory !== "all" && load.category !== activeCategory) {
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

  const openLoad = (loadId: string) => {
    router.push({
      pathname: "/freight/[id]",
      params: { id: loadId },
    });
  };

  const createLoad = () => {
    router.push("/freight/create");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <AppHeader
        variant="default"
        showBack
        searchPlaceholder={t("freight.searchPlaceholder")}
        onSearchPress={() => {}}
        onBackPress={() => router.back()}
      />

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
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
          <Filter size={18} color={colors.flame} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.85}
            >
              <Icon
                size={14}
                color={isActive ? colors.white : colors.inkMuted}
                strokeWidth={2}
              />
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {cat.key === "all" ? t("freight.allCategories") : getLoadCategoryLabel(cat.key)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.flame]} />
        }
      >
        <View style={styles.statsRow}>
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
                  <View style={[styles.statusBadge, { backgroundColor: getLoadStatusColor(load.status) }]}>
                    <Text style={styles.statusText}>{getLoadStatusLabel(load.status)}</Text>
                  </View>
                  <Text style={styles.timeAgo}>
                    {Math.round((Date.now() - load.createdAt) / 60000)} dk önce
                  </Text>
                </View>
                {load.shipperVerified && (
                  <View style={styles.verifiedBadge}>
                    <Star size={10} color={colors.white} fill={colors.white} />
                  </View>
                )}
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
                {load.distance && (
                  <Text style={styles.distanceText}>{formatDistance(load.distance)}</Text>
                )}
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
      >
        <Plus size={24} color={colors.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
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
  categoryScroll: {
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    gap: space.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  categoryChipActive: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  categoryText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  categoryTextActive: {
    color: colors.white,
  },
  list: {
    flex: 1,
    paddingHorizontal: space.md,
  },
  statsRow: {
    paddingVertical: space.sm,
  },
  statsText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
  loader: {
    marginTop: space.section,
  },
  empty: {
    alignItems: "center",
    paddingTop: space.section * 2,
    gap: space.md,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
  },
  loadCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
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
