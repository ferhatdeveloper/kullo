import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bike,
  Calendar,
  CarTaxiFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crosshair,
  Heart,
  MapPin,
  Menu,
  MoreVertical,
  Navigation,
  Package,
  Plane,
  Plus,
  SlidersHorizontal,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { OsmMap, type OsmMapMarker } from "../../components/OsmMap";
import { Button, Chip } from "../../components/ui";
import { api } from "../../lib/api";
import { orchestrator } from "../../lib/clients";
import { CITY_COORDS } from "../../lib/realty-map";
import {
  TAXI_METHODS,
  getPayMethod,
  isPayMethodId,
  type PayMethodId,
} from "../../lib/payment-methods";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type ServiceMode = "passenger" | "parcel";
type RideMode = "city" | "shared" | "airport";
type VehicleType = "ekonomi" | "konfor" | "vip";
type ParcelSize = "small" | "medium" | "large";
/** Careem-style booking steps */
type BookStep = "pickup" | "search" | "options" | "quote";

type MatchedDriver = {
  id: string;
  name: string;
  etaMin: number;
  distanceM: number;
  source: "rpc" | "dispatch" | "demo";
};

type Place = {
  id: string;
  nameKey: string;
  address: string;
  lat: number;
  lng: number;
  km: number;
  kind: "pin" | "airport";
};

const ERBIL = CITY_COORDS.Erbil!;

const PLACES: Place[] = [
  {
    id: "downtown",
    nameKey: "downtown",
    address: "Erbil Citadel area, Erbil",
    lat: 36.1911,
    lng: 44.0093,
    km: 0.4,
    kind: "pin",
  },
  {
    id: "royal",
    nameKey: "royal",
    address: "Erbil District, Erbil Central Subdistrict, Erbil Governorate, Iraq",
    lat: 36.1985,
    lng: 44.015,
    km: 1.2,
    kind: "pin",
  },
  {
    id: "ankawa",
    nameKey: "ankawa",
    address: "Ankawa, Erbil",
    lat: 36.23,
    lng: 44.0,
    km: 3.1,
    kind: "pin",
  },
  {
    id: "airport",
    nameKey: "airport",
    address: "6XM4+C56, Erbil Governorate 44000",
    lat: 36.2376,
    lng: 43.9631,
    km: 4.0,
    kind: "airport",
  },
  {
    id: "hertz",
    nameKey: "hertz",
    address: "Erbil International Airport area",
    lat: 36.236,
    lng: 43.965,
    km: 2.5,
    kind: "pin",
  },
  {
    id: "meet",
    nameKey: "meet",
    address: "Erbil International Airport (EIA)",
    lat: 36.238,
    lng: 43.962,
    km: 2.5,
    kind: "pin",
  },
  {
    id: "mall",
    nameKey: "mall",
    address: "100 Meter Road, Erbil",
    lat: 36.204,
    lng: 44.025,
    km: 2.5,
    kind: "pin",
  },
];

const VEHICLE_TYPES = [
  { key: "ekonomi" as const, price: 185, sharedPrice: 95, airportPrice: 420, etaMin: 4, etaMax: 7 },
  { key: "konfor" as const, price: 265, sharedPrice: 140, airportPrice: 580, etaMin: 3, etaMax: 6 },
  { key: "vip" as const, price: 420, sharedPrice: 220, airportPrice: 890, etaMin: 5, etaMax: 9 },
];

const PARCEL_SIZES = [
  { key: "small" as const, price: 95, etaMin: 12, etaMax: 18 },
  { key: "medium" as const, price: 165, etaMin: 15, etaMax: 25 },
  { key: "large" as const, price: 280, etaMin: 20, etaMax: 35 },
];

function resolveService(raw?: string): ServiceMode {
  if (raw === "parcel" || raw === "delivery" || raw === "paket") return "parcel";
  return "passenger";
}

function resolveMode(raw?: string): RideMode {
  if (raw === "airport" || raw === "shared") return raw;
  return "city";
}

function priceFor(mode: RideMode, v: (typeof VEHICLE_TYPES)[number]) {
  if (mode === "airport") return v.airportPrice;
  if (mode === "shared") return v.sharedPrice;
  return v.price;
}

function newDemoRideId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function demoDriver(etaMin: number): MatchedDriver {
  return { id: "demo-driver-1", name: "Ahmed K.", etaMin, distanceM: 920, source: "demo" };
}

export default function TaxiBookScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string; service?: string; pay?: string }>();

  const [service, setService] = useState<ServiceMode>(() => resolveService(params.service));
  const [mode, setMode] = useState<RideMode>(() => resolveMode(params.mode));
  const [step, setStep] = useState<BookStep>(() =>
    resolveService(params.service) === "parcel" ? "quote" : "pickup",
  );
  const [pickupPlace, setPickupPlace] = useState<Place>(PLACES[1]!); // Royal City
  const [destPlace, setDestPlace] = useState<Place | null>(null);
  const [destQuery, setDestQuery] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("ekonomi");
  const [parcelSize, setParcelSize] = useState<ParcelSize>("small");
  const [payMethod, setPayMethod] = useState<PayMethodId>(
    isPayMethodId(params.pay) ? params.pay : "cash",
  );
  const [calling, setCalling] = useState(false);
  const [matched, setMatched] = useState<MatchedDriver | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);

  useEffect(() => {
    const svc = resolveService(params.service);
    setService(svc);
    const next = resolveMode(params.mode);
    setMode(next);
    if (svc === "parcel") setStep("quote");
    else setStep("pickup");
    if (next === "airport") {
      setPickupPlace(PLACES.find((p) => p.id === "airport") ?? PLACES[0]!);
    }
    if (isPayMethodId(params.pay)) setPayMethod(params.pay);
  }, [params.mode, params.service, params.pay]);

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.key === vehicleType) ?? VEHICLE_TYPES[0]!;
  const selectedParcel = PARCEL_SIZES.find((p) => p.key === parcelSize) ?? PARCEL_SIZES[0]!;
  const price =
    service === "parcel" ? selectedParcel.price : priceFor(mode, selectedVehicle);
  const etaMin = service === "parcel" ? selectedParcel.etaMin : selectedVehicle.etaMin;
  const etaMax = service === "parcel" ? selectedParcel.etaMax : selectedVehicle.etaMax;

  const markers: OsmMapMarker[] = useMemo(() => {
    const list: OsmMapMarker[] = [
      {
        id: "pickup",
        lat: pickupPlace.lat,
        lng: pickupPlace.lng,
        label: service === "parcel" ? t("ride.map.pickup") : "A",
        selected: true,
      },
    ];
    if (destPlace) {
      list.push({
        id: "drop",
        lat: destPlace.lat,
        lng: destPlace.lng,
        label: service === "parcel" ? t("ride.map.drop") : "B",
        selected: false,
      });
    }
    return list;
  }, [pickupPlace, destPlace, service, t]);

  const filteredPlaces = useMemo(() => {
    const q = destQuery.trim().toLowerCase();
    return PLACES.filter((p) => {
      if (p.id === pickupPlace.id) return false;
      if (!q) return true;
      const name = t(`ride.pickupPlaces.${p.nameKey}`).toLowerCase();
      return name.includes(q) || p.address.toLowerCase().includes(q);
    });
  }, [destQuery, pickupPlace.id, t]);

  const goBack = () => {
    if (step === "quote" && service === "passenger") {
      setStep("options");
      return;
    }
    if (step === "options") {
      setStep("search");
      return;
    }
    if (step === "search") {
      setStep("pickup");
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace("/taxi");
  };

  const handleCall = async () => {
    if (service === "passenger" && !destPlace) {
      Alert.alert(t("ride.missingTitle"), t("ride.missingBody"));
      return;
    }
    setCalling(true);
    setMatched(null);
    try {
      const ride = await api.rpc<{ id?: string } | null>("request_ride", {
        p_pickup_lat: pickupPlace.lat,
        p_pickup_lng: pickupPlace.lng,
        p_dropoff_lat: destPlace?.lat ?? ERBIL.lat + 0.01,
        p_dropoff_lng: destPlace?.lng ?? ERBIL.lng + 0.01,
        p_gender_pref: null,
      });
      const id =
        ride && typeof ride === "object" && typeof ride.id === "string"
          ? ride.id
          : newDemoRideId();
      try {
        await fetch(`${orchestrator.url}/rides/dispatch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rideId: id,
            pickupLat: pickupPlace.lat,
            pickupLng: pickupPlace.lng,
          }),
        });
      } catch {
        /* demo ok */
      }
      const driver = demoDriver(etaMin);
      setMatched(driver);
      Alert.alert(
        service === "parcel" ? t("ride.matchedCourierTitle") : t("ride.matchedTitle"),
        `${driver.name} · ~${driver.etaMin} ${t("ride.minutes")} · ~${price.toLocaleString("tr-TR")} IQD · ${getPayMethod(payMethod).brand}`,
        [
          { text: t("common.done") },
          { text: t("ride.goHome"), onPress: () => router.replace("/(tabs)") },
        ],
      );
    } catch {
      const driver = demoDriver(etaMin);
      setMatched(driver);
      Alert.alert(
        service === "parcel" ? t("ride.matchedCourierTitle") : t("ride.matchedTitle"),
        `${driver.name} · ~${driver.etaMin} ${t("ride.minutes")}`,
      );
    } finally {
      setCalling(false);
    }
  };

  const placeName = (p: Place) => t(`ride.pickupPlaces.${p.nameKey}`);

  const showMap = step === "pickup" || step === "quote" || step === "options" || optionsOpen;

  return (
    <View style={[styles.root, step === "search" && styles.rootSearch]}>
      <StatusBar style="dark" />

      {showMap ? (
        <View style={styles.mapPane}>
          <OsmMap key={mapKey} markers={markers} selectedId="pickup" zoom={14} />
          <View style={[styles.mapChrome, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.roundBtn} onPress={goBack} hitSlop={10}>
              <ChevronLeft size={22} color={colors.ink} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.flex} />
            <TouchableOpacity
              style={[styles.roundBtn, styles.menuBtn]}
              onPress={() => router.push("/driver")}
              hitSlop={10}
            >
              <Menu size={18} color={colors.white} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          {step === "pickup" || step === "quote" ? (
            <Pressable
              style={[styles.recenter, step === "pickup" && styles.recenterPickup]}
              onPress={() => setMapKey((k) => k + 1)}
              accessibilityLabel={t("ride.recenter")}
            >
              <Crosshair size={18} color={colors.ink} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* ——— DESTINATION search (Obr full-screen white) ——— */}
      {step === "search" && (
        <View style={[styles.searchScreen, { paddingTop: insets.top + 6 }]}>
          <View style={styles.searchTopBar}>
            <TouchableOpacity style={styles.roundBtn} onPress={goBack} hitSlop={10}>
              <ChevronLeft size={22} color={colors.ink} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.nowForMe}>
              <TouchableOpacity style={styles.nowChip} onPress={() => setOptionsOpen(true)}>
                <Text style={styles.nowChipText}>{t("ride.now")}</Text>
              </TouchableOpacity>
              <Text style={styles.nowSep}>|</Text>
              <TouchableOpacity
                style={styles.forMeChip}
                onPress={() => setOptionsOpen(true)}
              >
                <Text style={styles.forMeText}>{t("ride.forMe")}</Text>
                <ChevronDown size={14} color={colors.ink} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.roundBtn, styles.menuBtn]}
              onPress={() => router.push("/driver")}
              hitSlop={10}
            >
              <Menu size={18} color={colors.white} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={styles.routeCard}>
            <View style={styles.routeCol}>
              <View style={styles.routeIcon}>
                <UserRound size={14} color={colors.white} strokeWidth={2.2} />
              </View>
              <View style={styles.routeLine} />
              <View style={[styles.routeIcon, styles.routeIconDest]}>
                <Navigation size={12} color={colors.ink} strokeWidth={2.2} />
              </View>
            </View>
            <View style={styles.routeFields}>
              <Text style={styles.routePickup} numberOfLines={1}>
                {placeName(pickupPlace)}
              </Text>
              <View style={styles.routeDivider} />
              <View style={styles.routeDestRow}>
                <TextInput
                  style={[styles.routeInput, styles.flex]}
                  value={destQuery}
                  onChangeText={setDestQuery}
                  placeholder={t("ride.wherePlaceholder")}
                  placeholderTextColor={colors.inkFaint}
                  autoFocus
                />
                {destQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setDestQuery("")} style={styles.clearBtn}>
                    <X size={16} color={colors.inkFaint} />
                  </TouchableOpacity>
                ) : null}
                <View style={styles.mapThumb}>
                  <MapPin size={14} color={colors.ink} strokeWidth={2.2} />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addStop}
              onPress={() => {}}
              accessibilityLabel={t("ride.addStop")}
            >
              <Plus size={18} color={colors.ink} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.suggestList}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredPlaces.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.suggestRow}
                onPress={() => {
                  setDestPlace(p);
                  setDestQuery(placeName(p));
                  setStep("options");
                  setOptionsOpen(true);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.suggestIcon}>
                  {p.kind === "airport" ? (
                    <Plane size={16} color={colors.ink} strokeWidth={2.2} />
                  ) : (
                    <MapPin size={16} color={colors.ink} strokeWidth={2.2} />
                  )}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.suggestName}>{placeName(p)}</Text>
                  <Text style={styles.suggestAddr} numberOfLines={1}>
                    {t("ride.kmAway", { km: p.km })} · {p.address}
                  </Text>
                </View>
                <MoreVertical size={18} color={colors.inkFaint} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ——— PICKUP confirm sheet ——— */}
      {step === "pickup" && (
        <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.pickupRow}>
            <View style={styles.hailIcon}>
              <UserRound size={20} color={colors.white} strokeWidth={2.2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.pickupTitle}>{placeName(pickupPlace)}</Text>
              <Text style={styles.pickupSub}>{pickupPlace.address}</Text>
            </View>
            <Heart size={20} color={colors.inkFaint} strokeWidth={2} />
          </View>
          <View style={styles.pickupActions}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setStep("search")}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmBtnText}>{t("ride.confirmPickup")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slidersBtn}
              onPress={() => setOptionsOpen(true)}
            >
              <SlidersHorizontal size={18} color={colors.ink} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ——— QUOTE / call sheet ——— */}
      {step === "quote" && (
        <View style={[styles.quoteSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <View style={styles.serviceToggle}>
              <TouchableOpacity
                style={[styles.serviceSeg, service === "passenger" && styles.serviceSegOn]}
                onPress={() => setService("passenger")}
              >
                <CarTaxiFront
                  size={15}
                  color={service === "passenger" ? colors.white : colors.ink}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.serviceSegText,
                    service === "passenger" && styles.serviceSegTextOn,
                  ]}
                >
                  {t("ride.service.passenger")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceSeg, service === "parcel" && styles.serviceSegOn]}
                onPress={() => setService("parcel")}
              >
                <Package
                  size={15}
                  color={service === "parcel" ? colors.white : colors.ink}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.serviceSegText,
                    service === "parcel" && styles.serviceSegTextOn,
                  ]}
                >
                  {t("ride.service.parcel")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routeSummary}>
              <Text style={styles.routeSummaryLine} numberOfLines={1}>
                {placeName(pickupPlace)}
                {destPlace ? ` → ${placeName(destPlace)}` : ""}
              </Text>
            </View>

            {service === "passenger" ? (
              <>
                <View style={styles.modeRow}>
                  {(["city", "shared", "airport"] as const).map((m) => (
                    <Chip
                      key={m}
                      label={t(`ride.modes.${m}`)}
                      selected={mode === m}
                      onPress={() => setMode(m)}
                      icon={
                        m === "airport" ? (
                          <Plane size={14} color={mode === m ? colors.white : colors.flame} />
                        ) : m === "shared" ? (
                          <Users size={14} color={mode === m ? colors.white : colors.flame} />
                        ) : (
                          <CarTaxiFront
                            size={14}
                            color={mode === m ? colors.white : colors.flame}
                          />
                        )
                      }
                    />
                  ))}
                </View>
                <Text style={styles.sectionLabel}>{t("ride.vehicleType")}</Text>
                <View style={styles.vehicleGrid}>
                  {VEHICLE_TYPES.map((v) => {
                    const on = vehicleType === v.key;
                    return (
                      <TouchableOpacity
                        key={v.key}
                        style={[styles.vehicleCard, on && styles.vehicleCardOn]}
                        onPress={() => setVehicleType(v.key)}
                      >
                        {v.key === "ekonomi" ? (
                          <Bike size={20} color={on ? colors.flame : colors.inkMuted} />
                        ) : (
                          <CarTaxiFront size={20} color={on ? colors.flame : colors.inkMuted} />
                        )}
                        <Text style={[styles.vehicleLabel, on && styles.vehicleLabelOn]}>
                          {t(`ride.vehicles.${v.key}`)}
                        </Text>
                        <Text style={styles.vehiclePrice}>
                          ~{priceFor(mode, v).toLocaleString("tr-TR")}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.sectionLabel}>{t("ride.parcelSize")}</Text>
                <View style={styles.vehicleGrid}>
                  {PARCEL_SIZES.map((p) => {
                    const on = parcelSize === p.key;
                    return (
                      <TouchableOpacity
                        key={p.key}
                        style={[styles.vehicleCard, on && styles.vehicleCardOn]}
                        onPress={() => setParcelSize(p.key)}
                      >
                        <Package size={20} color={on ? colors.flame : colors.inkMuted} />
                        <Text style={[styles.vehicleLabel, on && styles.vehicleLabelOn]}>
                          {t(`ride.parcels.${p.key}`)}
                        </Text>
                        <Text style={styles.vehiclePrice}>
                          ~{p.price.toLocaleString("tr-TR")}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.sectionLabel}>{t("ride.payment")}</Text>
            <View style={styles.chipRow}>
              {TAXI_METHODS.map((m) => (
                <Chip
                  key={m.id}
                  label={m.brand}
                  selected={payMethod === m.id}
                  onPress={() => setPayMethod(m.id)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.morePay}
              onPress={() => router.push("/wallet")}
            >
              <Wallet size={14} color={colors.flame} strokeWidth={2.2} />
              <Text style={styles.morePayText}>{t("ride.allMethods")}</Text>
            </TouchableOpacity>

            <View style={styles.estimateCard}>
              <View style={styles.estimateRow}>
                <Clock size={18} color={colors.flame} strokeWidth={2.2} />
                <View style={styles.flex}>
                  <Text style={styles.estimateLabel}>{t("ride.eta")}</Text>
                  <Text style={styles.estimateValue}>
                    {matched
                      ? `~${matched.etaMin} ${t("ride.minutes")}`
                      : `${etaMin}–${etaMax} ${t("ride.minutes")}`}
                  </Text>
                </View>
              </View>
              <View style={styles.estimateDivider} />
              <View style={styles.estimateRow}>
                {service === "parcel" ? (
                  <Package size={18} color={colors.flame} strokeWidth={2.2} />
                ) : (
                  <CarTaxiFront size={18} color={colors.flame} strokeWidth={2.2} />
                )}
                <View style={styles.flex}>
                  <Text style={styles.estimateLabel}>{t("ride.fare")}</Text>
                  <Text style={styles.estimateValue}>
                    ~{price.toLocaleString("tr-TR")} IQD
                  </Text>
                </View>
              </View>
            </View>

            <Button
              label={
                calling
                  ? service === "parcel"
                    ? t("ride.matchingCourier")
                    : t("ride.matching")
                  : service === "parcel"
                    ? t("ride.ctaParcel")
                    : t("ride.ctaCity")
              }
              variant="primary"
              loading={calling}
              onPress={() => void handleCall()}
              style={styles.cta}
            />
            <TouchableOpacity
              style={styles.driverLink}
              onPress={() => router.push("/driver")}
            >
              <Text style={styles.driverLinkText}>{t("ride.openDriver")}</Text>
            </TouchableOpacity>
            <Text style={styles.demoNote}>{t("ride.demoNote")}</Text>
          </ScrollView>
        </View>
      )}

      {/* Booking options modal */}
      <Modal
        visible={optionsOpen || step === "options"}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setOptionsOpen(false);
          if (step === "options" && destPlace) setStep("quote");
        }}
      >
        <Pressable
          style={styles.modalScrim}
          onPress={() => {
            setOptionsOpen(false);
            if (step === "options") setStep(destPlace ? "quote" : "search");
          }}
        />
        <View style={[styles.optionsSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <Text style={styles.optionsTitle}>{t("ride.bookingOptions")}</Text>
          <TouchableOpacity style={styles.optionRow} onPress={() => {}}>
            <View style={styles.optionIcon}>
              <Calendar size={18} color={colors.ink} strokeWidth={2.2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.optionLabel}>{t("ride.dateTime")}</Text>
              <Text style={styles.optionValue}>{t("ride.now")}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkFaint} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} onPress={() => {}}>
            <View style={styles.optionIcon}>
              <UserRound size={18} color={colors.ink} strokeWidth={2.2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.optionLabel}>{t("ride.bookingFor")}</Text>
              <Text style={styles.optionValue}>{t("ride.bookingForMe")}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkFaint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, styles.optionsConfirm]}
            onPress={() => {
              setOptionsOpen(false);
              setStep("quote");
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.confirmBtnText}>{t("ride.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  rootSearch: { backgroundColor: colors.white },
  flex: { flex: 1 },
  mapPane: { flex: 1, backgroundColor: "#e8eef2" },
  mapChrome: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.lg,
    gap: 8,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  menuBtn: {
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
  },
  nowForMe: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nowChip: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  nowChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  nowSep: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
  },
  forMeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  forMeText: {
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
  },
  recenter: {
    position: "absolute",
    right: space.lg,
    bottom: 220,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  recenterPickup: {
    bottom: 200,
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    ...shadow.card,
  },
  searchScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    paddingHorizontal: space.lg,
  },
  searchTopBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: space.md,
  },
  quoteSheet: {
    maxHeight: "58%",
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    ...shadow.card,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: space.md,
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.lg,
  },
  hailIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  pickupTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.ink,
  },
  pickupSub: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  pickupActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: "#7DFF9A",
  },
  optionsConfirm: {
    marginTop: space.lg,
  },
  slidersBtn: {
    width: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  routeCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: space.md,
    paddingRight: 44,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
    overflow: "visible",
    ...shadow.soft,
  },
  routeCol: { alignItems: "center", paddingTop: 4 },
  routeIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  routeIconDest: {
    backgroundColor: colors.mist,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: colors.line,
    marginVertical: 4,
  },
  routeFields: { flex: 1, justifyContent: "center", paddingRight: 28 },
  routePickup: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 6,
  },
  routeDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  routeDestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeInput: {
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 8,
  },
  addStop: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  mapThumb: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestList: { flex: 1, marginTop: space.md },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  suggestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  suggestAddr: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  serviceToggle: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FFD8B8",
    padding: 4,
    marginBottom: space.md,
  },
  serviceSeg: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.sm,
  },
  serviceSegOn: { backgroundColor: colors.ink },
  serviceSegText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  serviceSegTextOn: { color: colors.white },
  routeSummary: {
    marginBottom: space.md,
    padding: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  routeSummaryLine: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: space.md,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  vehicleGrid: { flexDirection: "row", gap: 8, marginBottom: space.lg },
  vehicleCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  vehicleCardOn: {
    backgroundColor: colors.flameSoft,
    borderColor: colors.flame,
  },
  vehicleLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  vehicleLabelOn: {
    color: colors.ink,
    fontFamily: fonts.bodySemi,
  },
  vehiclePrice: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.flameDeep,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: space.md,
  },
  morePay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: space.lg,
  },
  morePayText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.flameDeep,
  },
  estimateCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.lg,
    gap: 4,
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  estimateLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  estimateValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
    marginTop: 2,
  },
  estimateDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: space.sm,
  },
  cta: { ...shadow.float },
  driverLink: {
    marginTop: space.md,
    alignItems: "center",
    paddingVertical: space.sm,
  },
  driverLinkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flameDeep,
  },
  demoNote: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: "center",
  },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.45)",
  },
  optionsSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  optionsTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
    marginBottom: space.lg,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  optionValue: {
    marginTop: 2,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
  },
});
