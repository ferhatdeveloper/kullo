import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  CarTaxiFront,
  ChevronRight,
  Compass,
  FileText,
  MapPinned,
  Plane,
  Route,
  UserRound,
  Wallet,
} from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppHeader } from "../../components/brand";
import { OfflineCover } from "../../components/OfflineCover";
import { offlineImageSource } from "../../lib/offline-image-map";
import { colors, fonts, radius } from "../../lib/theme";

function offlineBg(uri: string) {
  return offlineImageSource(uri) ?? { uri };
}

const SCREEN_W = Dimensions.get("window").width;
const H_PAD = 12;
/** Kompakt promo satır yüksekliği — tek büyük kart yok (density kuralı). */
const PROMO_ROW_H = 64;
const SERVICE_GAP = 8;
const SERVICE_TILE = Math.floor((SCREEN_W - H_PAD * 2 - SERVICE_GAP * 3) / 4);

type HubTab = "home" | "activity" | "pay" | "inbox" | "account";

const SERVICE_ART = {
  ride: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80",
  multistop:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
  intercity:
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80",
  airport:
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80",
} as const;

const PROMOS = [
  {
    key: "coming",
    image:
      "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "discover",
    gallery: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    key: "connect",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "support",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

export default function TaxiHubScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<HubTab>("home");

  const openBook = (service: "passenger" | "parcel", mode?: "city" | "shared" | "airport") => {
    router.push({
      pathname: "/taxi/book",
      params: {
        service,
        ...(mode ? { mode } : {}),
      },
    });
  };

  const services = [
    {
      key: "ride" as const,
      label: t("ride.hub.bookRide"),
      Icon: MapPinned,
      art: SERVICE_ART.ride,
      onPress: () => openBook("passenger", "city"),
    },
    {
      key: "multistop" as const,
      label: t("ride.hub.multistop"),
      Icon: Route,
      art: SERVICE_ART.multistop,
      onPress: () => openBook("passenger", "shared"),
    },
    {
      key: "intercity" as const,
      label: t("ride.hub.intercity"),
      Icon: CarTaxiFront,
      art: SERVICE_ART.intercity,
      onPress: () => router.push("/shared-ride"),
    },
    {
      key: "airport" as const,
      label: t("ride.hub.airport"),
      Icon: Plane,
      art: SERVICE_ART.airport,
      onPress: () => openBook("passenger", "airport"),
    },
  ];

  const onTab = (next: HubTab) => {
    setTab(next);
    if (next === "home") return;
    if (next === "pay") {
      router.push("/wallet");
      return;
    }
    if (next === "inbox") {
      router.push("/notifications");
      return;
    }
    if (next === "account") {
      router.push("/partner/driver");
      return;
    }
    if (next === "activity") {
      router.push("/shared-ride");
    }
  };

  const promoPress = (key: string) => {
    if (key === "support") {
      openBook("parcel");
      return;
    }
    if (key === "connect") {
      router.push("/partner/driver");
      return;
    }
    openBook("passenger", "city");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader
        variant="market"
        showBack
        searchPlaceholder={t("ride.wherePlaceholder")}
        onSearchPress={() => openBook("passenger", "city")}
        onBackPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)");
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 92 + Math.max(insets.bottom, 8) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.serviceRow}>
          {services.map((s) => {
            const Icon = s.Icon;
            return (
              <TouchableOpacity
                key={s.key}
                style={styles.serviceCell}
                onPress={s.onPress}
                activeOpacity={0.88}
              >
                <View
                  style={[
                    styles.serviceTile,
                    { width: SERVICE_TILE, height: Math.round(SERVICE_TILE * 0.86) },
                  ]}
                >
                  <OfflineCover uri={s.art} label={s.label} style={StyleSheet.absoluteFillObject} />
                  <View style={styles.serviceDim} />
                  <View style={styles.serviceIconBadge}>
                    <Icon size={18} color={colors.white} strokeWidth={2.2} />
                  </View>
                </View>
                <Text style={styles.serviceLabel} numberOfLines={2}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Yoğun promo satırları — tek büyük hero kart yok */}
        <View style={styles.promoList}>
          {PROMOS.map((p) => {
            const thumb =
              p.key === "discover" && "gallery" in p
                ? p.gallery[0]
                : "image" in p
                  ? p.image
                  : "";
            return (
              <TouchableOpacity
                key={p.key}
                style={styles.promoRow}
                activeOpacity={0.88}
                onPress={() => promoPress(p.key)}
              >
                <View style={styles.promoThumb}>
                  <ImageBackground
                    source={offlineBg(thumb)}
                    style={StyleSheet.absoluteFillObject}
                    imageStyle={styles.promoThumbImg}
                  >
                    <View style={styles.promoThumbShade} />
                  </ImageBackground>
                </View>
                <View style={styles.promoBody}>
                  <Text style={styles.promoTitle} numberOfLines={1}>
                    {t(`ride.hub.promo.${p.key}.title`)}
                  </Text>
                  <Text style={styles.promoSub} numberOfLines={2}>
                    {t(`ride.hub.promo.${p.key}.body`)}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.inkMuted} strokeWidth={2.2} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {(
          [
            { key: "home" as const, label: t("ride.hub.nav.home"), Icon: Compass },
            { key: "activity" as const, label: t("ride.hub.nav.activity"), Icon: FileText },
            { key: "pay" as const, label: t("ride.hub.nav.pay"), Icon: Wallet },
            { key: "inbox" as const, label: t("ride.hub.nav.inbox"), Icon: Bell, badge: true },
            { key: "account" as const, label: t("ride.hub.nav.account"), Icon: UserRound },
          ] as const
        ).map((item) => {
          const on = tab === item.key;
          const Icon = item.Icon;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => onTab(item.key)}
              activeOpacity={0.85}
            >
              <View>
                <Icon
                  size={22}
                  color={on ? colors.flame : "#9A9A9A"}
                  strokeWidth={on ? 2.4 : 1.8}
                />
                {"badge" in item && item.badge ? <View style={styles.navBadge} /> : null}
              </View>
              <Text style={[styles.navLabel, on && styles.navLabelOn]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  serviceRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceCell: {
    width: SERVICE_TILE,
    alignItems: "center",
    gap: 5,
  },
  serviceTile: {
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.mist,
  },
  serviceDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,45,41,0.28)",
  },
  serviceIconBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 12,
    minHeight: 24,
  },
  promoList: {
    marginTop: 12,
    gap: 6,
  },
  promoRow: {
    height: PROMO_ROW_H,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(12,45,41,0.1)",
  },
  promoThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  promoThumbImg: {
    borderRadius: radius.sm,
  },
  promoThumbShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,45,41,0.2)",
  },
  promoBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  promoTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  promoSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    lineHeight: 14,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2A2A2A",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: "#9A9A9A",
  },
  navLabelOn: {
    color: colors.flame,
  },
  navBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E53935",
  },
});
