import { FlashList } from "@shopify/flash-list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  KeyRound,
  RotateCcw,
  Search,
  SearchX,
  Share2,
  Tag,
  User,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLogo } from "../../components/BrandLogo";
import { CarsShell } from "../../components/CarsShell";
import { DubicarsHome } from "../../components/cars/DubicarsHome";
import { VehicleCardSkeleton } from "../../components/Skeleton";
import { VehicleCard, type VehicleListItem } from "../../components/VehicleCard";
import { type VehicleFilters } from "../../components/FilterSheet";
import { Chip } from "../../components/ui/Chip";
import { api } from "../../lib/api";
import { withBrandLogos } from "../../lib/brand-logos";
import { MARKET_CITIES, useCityStore, type SelectedCity } from "../../lib/city-store";
import {
  DEMO_BRANDS,
  DEMO_FAVORITES,
  DEMO_STORES,
  DEMO_VEHICLES,
  withStoreAttribution,
} from "../../lib/demo-data";
import {
  readVehiclesSnapshot,
  writeVehiclesSnapshot,
} from "../../lib/offline-snapshot";
import {
  buildSearchShareMessage,
  savedSearchesStore,
  type SavedSearchParams,
} from "../../lib/saved-searches-store";
import { useModeStore } from "../../lib/mode-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type CarsMode = "home" | "filter" | "results" | "saved" | "more";
type ConditionKey = "all" | "used" | "new";
type PickerKind =
  | "model"
  | "minYear"
  | "maxYear"
  | "minPrice"
  | "maxPrice"
  | "minMileage"
  | "maxMileage"
  | "city"
  | null;

type RefItem = { id: number; name: string; code?: string };
type ReferenceData = {
  brands: Array<{ id: number; name: string }>;
  fuel_types?: RefItem[];
  transmission_types?: RefItem[];
};

const YEARS = Array.from({ length: 30 }, (_, i) => 2026 - i);
const CITIES = [...MARKET_CITIES];

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const choose = useModeStore((s) => s.choose);
  const storedCity = useCityStore((s) => s.city);
  const setStoredCity = useCityStore((s) => s.setCity);

  /** Default / first paint = Ana hub — never filter */
  const [mode, setMode] = useState<CarsMode>("home");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [savedTab, setSavedTab] = useState<"ads" | "searches">("ads");
  const [picker, setPicker] = useState<PickerKind>(null);
  const [model, setModel] = useState<string | null>(null);
  const [condition, setCondition] = useState<ConditionKey>("all");
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(
    params.makeId ? Number(params.makeId) : null,
  );
  const [filters, setFilters] = useState<VehicleFilters>(() => ({
    q: params.make ? String(params.make) : params.q ? String(params.q) : undefined,
    makeIds: params.makeId ? [Number(params.makeId)] : undefined,
    city:
      params.city != null
        ? String(params.city)
        : storedCity !== "all"
          ? storedCity
          : undefined,
    sortBy: "created_at",
    sortDir: "desc",
  }));

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
      void choose("buy");
    }, [choose]),
  );

  /** intent/mode=rent → Kirala dikeyine (buy SERP karışmasın) */
  useEffect(() => {
    const intent = String(params.intent ?? params.mode ?? "");
    if (intent === "rent") {
      router.replace({
        pathname: "/(tabs)/rentals",
        params: { intent: "rent", rentPane: "home" },
      });
    }
  }, [params.intent, params.mode, router]);

  /** Marketplace Search tab → always Ana hub (not sticky filter) */
  useEffect(() => {
    const unsub = navigation.addListener("tabPress" as never, () => {
      setMode("home");
      router.setParams({ intent: "buy", carsPane: "home" });
    });
    return unsub;
  }, [navigation, router]);

  useEffect(() => {
    const pane = String(params.carsPane ?? "");
    if (pane === "more") {
      setMode("more");
      return;
    }
    if (pane === "saved") {
      setMode("saved");
      return;
    }
    if (pane === "home") {
      setMode("home");
      return;
    }
    if (pane === "search") {
      setMode("filter");
      return;
    }

    const hasRouteParams =
      params.makeId != null ||
      params.make != null ||
      params.q != null ||
      params.minPrice != null ||
      params.maxPrice != null ||
      params.minYear != null ||
      params.maxYear != null ||
      params.minMileage != null ||
      params.maxMileage != null ||
      params.city != null ||
      params.condition != null ||
      params.openResults != null;

    if (!hasRouteParams) return;

    const openResults = String(params.openResults ?? "") === "1";
    const makeIdRaw = params.makeId != null ? Number(params.makeId) : null;
    const makeId = makeIdRaw != null && Number.isFinite(makeIdRaw) ? makeIdRaw : null;
    const condRaw = params.condition != null ? String(params.condition) : null;
    const nextCondition: ConditionKey =
      condRaw === "new" || condRaw === "used" || condRaw === "all" ? condRaw : "all";

    const numOrUndef = (v: unknown): number | undefined => {
      if (v == null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    if (params.makeId != null || openResults) setSelectedMakeId(makeId);
    if (condRaw || openResults) setCondition(condRaw ? nextCondition : "all");

    setFilters((f) => {
      const base: VehicleFilters = openResults
        ? { sortBy: "created_at", sortDir: "desc" }
        : { ...f };
      return {
        ...base,
        q: params.make
          ? String(params.make)
          : params.q
            ? String(params.q)
            : openResults
              ? undefined
              : base.q,
        makeIds: makeId != null ? [makeId] : openResults ? undefined : base.makeIds,
        minPrice: numOrUndef(params.minPrice) ?? (openResults ? undefined : base.minPrice),
        maxPrice: numOrUndef(params.maxPrice) ?? (openResults ? undefined : base.maxPrice),
        minYear: numOrUndef(params.minYear) ?? (openResults ? undefined : base.minYear),
        maxYear: numOrUndef(params.maxYear) ?? (openResults ? undefined : base.maxYear),
        minMileage: numOrUndef(params.minMileage) ?? (openResults ? undefined : base.minMileage),
        maxMileage: numOrUndef(params.maxMileage) ?? (openResults ? undefined : base.maxMileage),
        city:
          params.city != null
            ? String(params.city)
            : openResults
              ? undefined
              : (base.city ?? (storedCity !== "all" ? storedCity : undefined)),
        sortBy:
          params.sortBy === "price" || params.sortBy === "created_at"
            ? params.sortBy
            : (base.sortBy ?? "created_at"),
        sortDir:
          params.sortDir === "asc" || params.sortDir === "desc"
            ? params.sortDir
            : (base.sortDir ?? "desc"),
      };
    });

    if (openResults) setMode("results");
  }, [
    params.make,
    params.makeId,
    params.q,
    params.minPrice,
    params.maxPrice,
    params.minYear,
    params.maxYear,
    params.minMileage,
    params.maxMileage,
    params.city,
    params.condition,
    params.sortBy,
    params.sortDir,
    params.openResults,
    params.carsPane,
    storedCity,
  ]);

  const { data: refs } = useQuery({
    queryKey: ["reference", i18n.language],
    queryFn: () =>
      api.rpc<ReferenceData>("list_reference_data", {
        p_locale: i18n.language,
      }),
    staleTime: 60 * 60 * 1000,
  });

  const brands = useMemo(() => {
    const raw =
      Array.isArray(refs?.brands) && refs.brands.length > 0 ? refs.brands : DEMO_BRANDS;
    return withBrandLogos(raw);
  }, [refs?.brands]);

  useEffect(() => {
    for (const b of brands.slice(0, 16)) {
      if (b.logo_url) void Image.prefetch(b.logo_url).catch(() => undefined);
    }
  }, [brands]);

  const currentSearchParams = useMemo((): SavedSearchParams => {
    const out: SavedSearchParams = {};
    if (filters.q) out.q = filters.q;
    if (selectedMakeId != null) {
      out.makeId = String(selectedMakeId);
      const brand = brands.find((b) => b.id === selectedMakeId);
      if (brand?.name) out.make = brand.name;
      else if (filters.q) out.make = filters.q;
    } else if (filters.q) {
      out.make = filters.q;
    }
    if (filters.minPrice != null) out.minPrice = String(filters.minPrice);
    if (filters.maxPrice != null) out.maxPrice = String(filters.maxPrice);
    if (filters.minYear != null) out.minYear = String(filters.minYear);
    if (filters.maxYear != null) out.maxYear = String(filters.maxYear);
    if (filters.minMileage != null) out.minMileage = String(filters.minMileage);
    if (filters.maxMileage != null) out.maxMileage = String(filters.maxMileage);
    if (filters.city) out.city = filters.city;
    if (condition !== "all") out.condition = condition;
    if (filters.sortBy) out.sortBy = filters.sortBy;
    if (filters.sortDir) out.sortDir = filters.sortDir;
    return out;
  }, [filters, selectedMakeId, condition, brands]);

  const onSaveSearch = async () => {
    try {
      await savedSearchesStore.save(currentSearchParams);
      Alert.alert(t("search.savedTitle"), t("search.savedBody"));
    } catch {
      Alert.alert(t("common.error"), t("search.saveFailed"));
    }
  };

  const onShareSearch = async () => {
    try {
      await Share.share({
        message: buildSearchShareMessage(
          currentSearchParams,
          currentSearchParams.make ?? currentSearchParams.q,
        ),
      });
    } catch {
      /* dismissed */
    }
  };

  const queryFilters = useMemo((): VehicleFilters => {
    const qParts = [filters.q, model].filter(Boolean);
    return {
      ...filters,
      q: qParts.length ? qParts.join(" ") : undefined,
      makeIds: selectedMakeId != null ? [selectedMakeId] : filters.makeIds,
      condition: condition === "all" ? undefined : condition === "new" ? "new" : "used",
    };
  }, [filters, model, selectedMakeId, condition]);

  const resultsHeading = useMemo(() => {
    const parts: string[] = [];
    if (selectedMakeId != null) {
      const brand = brands.find((b) => b.id === selectedMakeId);
      if (brand?.name) parts.push(brand.name);
    } else if (filters.q) {
      parts.push(filters.q);
    }
    if (model) parts.push(model);
    if (filters.city) parts.push(filters.city);
    if (condition === "new") parts.push(t("search.conditionNew"));
    else if (condition === "used") parts.push(t("search.conditionUsed"));
    return parts.length > 0 ? parts.join(" · ") : t("search.allListings");
  }, [selectedMakeId, brands, filters.q, filters.city, model, condition, t]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["vehicles-iq", queryFilters, i18n.language],
    queryFn: async () => {
      try {
        const rows = await api.rpc<VehicleListItem[]>("search_vehicles", {
          p_q: queryFilters.q || null,
          p_make_ids: queryFilters.makeIds ?? null,
          p_body_type_ids: null,
          p_fuel_type_ids: queryFilters.fuelTypeIds ?? null,
          p_transmission_ids: queryFilters.transmissionIds ?? null,
          p_color_ids: null,
          p_country_code: queryFilters.countryCode ?? null,
          p_city: queryFilters.city ?? null,
          p_min_year: queryFilters.minYear ?? null,
          p_max_year: queryFilters.maxYear ?? null,
          p_min_price: queryFilters.minPrice ?? null,
          p_max_price: queryFilters.maxPrice ?? null,
          p_min_mileage: queryFilters.minMileage ?? null,
          p_max_mileage: queryFilters.maxMileage ?? null,
          p_condition_filter: queryFilters.condition ?? null,
          p_lat: null,
          p_lng: null,
          p_radius_km: null,
          p_locale: i18n.language,
          p_sort_by: queryFilters.sortBy ?? "created_at",
          p_sort_dir: queryFilters.sortDir ?? "desc",
          p_page_size: 40,
          p_page_offset: 0,
        });
        if (Array.isArray(rows) && rows.length > 0) {
          void writeVehiclesSnapshot(rows);
          return rows;
        }
      } catch {
        /* fall through */
      }
      const snap = await readVehiclesSnapshot();
      if (snap && snap.length > 0) return snap;
      return DEMO_VEHICLES;
    },
    initialData: DEMO_VEHICLES,
    staleTime: 20_000,
    placeholderData: keepPreviousData,
  });

  const results = withStoreAttribution(data?.length ? data : DEMO_VEHICLES);
  const count = results.length;
  const topPicks = useMemo(() => {
    const featured = results.filter((v) => v.featured);
    const seen = new Set(featured.map((v) => v.id));
    const rest = results.filter((v) => !seen.has(v.id));
    return [...featured, ...rest].slice(0, 8);
  }, [results]);
  const featuredDealers = useMemo(() => DEMO_STORES.slice(0, 3), []);

  /** URL + mode senkron — sticky filter / hub karışmasını önler; her zaman intent=buy */
  const goHome = useCallback(() => {
    setMode("home");
    router.setParams({ intent: "buy", carsPane: "home" });
  }, [router]);
  const goSearch = useCallback(() => {
    setMode("filter");
    router.setParams({ intent: "buy", carsPane: "search" });
  }, [router]);
  /** Öne çıkanlar “Tümü” — filtresiz tüm araç sonuç listesi */
  const goAllResults = useCallback(() => {
    setSelectedMakeId(null);
    setModel(null);
    setCondition("all");
    setFilters({
      sortBy: "created_at",
      sortDir: "desc",
    });
    setMode("results");
  }, []);
  const goSaved = useCallback(() => {
    setMode("saved");
    router.setParams({ intent: "buy", carsPane: "saved" });
  }, [router]);
  const goMore = useCallback(() => {
    setMode("more");
    router.setParams({ intent: "buy", carsPane: "more" });
  }, [router]);
  const exitCars = useCallback(() => {
    setMode("home");
    router.replace("/(tabs)");
  }, [router]);


  const reset = () => {
    setSelectedMakeId(null);
    setModel(null);
    setCondition("all");
    setFilters({
      sortBy: "created_at",
      sortDir: "desc",
      city: storedCity !== "all" ? storedCity : undefined,
    });
  };

  const selectBrand = (id: number, openResults = true) => {
    const next = selectedMakeId === id ? null : id;
    setSelectedMakeId(next);
    const brand = brands.find((b) => b.id === next);
    setFilters((f) => ({
      ...f,
      makeIds: next != null ? [next] : undefined,
      q: brand?.name,
    }));
    setModel(null);
    if (openResults) setMode("results");
  };

  const pickerOptions = useMemo(() => {
    switch (picker) {
      case "minYear":
      case "maxYear":
        return YEARS.map(String);
      case "minPrice":
      case "maxPrice":
        return ["5000000", "10000000", "15000000", "25000000", "40000000", "60000000"];
      case "minMileage":
      case "maxMileage":
        return ["0", "25000", "50000", "75000", "100000", "150000", "200000"];
      case "city":
        return CITIES;
      case "model":
        return ["Corolla", "Civic", "3 Series", "A4", "Sportage", "Tiguan", "C 200"];
      default:
        return [];
    }
  }, [picker]);

  const applyPicker = (value: string) => {
    const num = Number(value);
    switch (picker) {
      case "model":
        setModel(value);
        break;
      case "minYear":
        setFilters((f) => ({ ...f, minYear: num }));
        break;
      case "maxYear":
        setFilters((f) => ({ ...f, maxYear: num }));
        break;
      case "minPrice":
        setFilters((f) => ({ ...f, minPrice: num }));
        break;
      case "maxPrice":
        setFilters((f) => ({ ...f, maxPrice: num }));
        break;
      case "minMileage":
        setFilters((f) => ({ ...f, minMileage: num }));
        break;
      case "maxMileage":
        setFilters((f) => ({ ...f, maxMileage: num }));
        break;
      case "city":
        setFilters((f) => ({ ...f, city: value }));
        void setStoredCity(
          (MARKET_CITIES as readonly string[]).includes(value)
            ? (value as SelectedCity)
            : "all",
        );
        break;
    }
    setPicker(null);
  };

  const formatPrice = (n?: number) =>
    n == null ? null : `${n.toLocaleString("tr-TR")} IQD`;

  const searchSheets = (
    <>
      <Modal visible={showAllBrands} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("search.make")}</Text>
            <TouchableOpacity onPress={() => setShowAllBrands(false)}>
              <Text style={styles.modalDone}>{t("common.done")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.allBrands}>
            {brands.map((b) => {
              const active = selectedMakeId === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.allBrandCell, active && styles.brandCellActive]}
                  onPress={() => {
                    selectBrand(b.id, mode === "home" || mode === "results");
                    setShowAllBrands(false);
                  }}
                >
                  <BrandLogo
                    name={b.name}
                    nameEn={b.name_en ?? b.name}
                    logoUrl={b.logo_url}
                    size={44}
                  />
                  <Text style={styles.allBrandName} numberOfLines={1}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={picker != null} transparent animationType="fade">
        <Pressable style={styles.pickerBackdrop} onPress={() => setPicker(null)}>
          <Pressable style={styles.pickerSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>{t("common.select")}</Text>
            <ScrollView style={styles.pickerList}>
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  if (!picker) return;
                  if (picker === "model") setModel(null);
                  else if (picker === "city") {
                    setFilters((f) => ({ ...f, city: undefined }));
                    void setStoredCity("all");
                  } else if (picker === "minYear")
                    setFilters((f) => ({ ...f, minYear: undefined }));
                  else if (picker === "maxYear")
                    setFilters((f) => ({ ...f, maxYear: undefined }));
                  else if (picker === "minPrice")
                    setFilters((f) => ({ ...f, minPrice: undefined }));
                  else if (picker === "maxPrice")
                    setFilters((f) => ({ ...f, maxPrice: undefined }));
                  else if (picker === "minMileage")
                    setFilters((f) => ({ ...f, minMileage: undefined }));
                  else if (picker === "maxMileage")
                    setFilters((f) => ({ ...f, maxMileage: undefined }));
                  setPicker(null);
                }}
              >
                <Text style={styles.pickerItemText}>{t("common.all")}</Text>
              </TouchableOpacity>
              {pickerOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.pickerItem}
                  onPress={() => applyPicker(opt)}
                >
                  <Text style={styles.pickerItemText}>
                    {picker === "minPrice" || picker === "maxPrice"
                      ? `${Number(opt).toLocaleString("tr-TR")} IQD`
                      : picker === "minMileage" || picker === "maxMileage"
                        ? `${Number(opt).toLocaleString("tr-TR")} ${t("common.km")}`
                        : opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );

  if (mode === "more") {
    return (
      <CarsShell
        active="more"
        onHome={goHome}
        onSearch={goSearch}
        onSaved={goSaved}
        onMore={goMore}
        onExit={exitCars}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.morePad}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.moreLoginCard}>
            <Text style={styles.moreLoginText}>{t("cars.moreLogin")}</Text>
            <TouchableOpacity
              style={styles.moreLoginBtn}
              activeOpacity={0.9}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.moreLoginBtnText}>{t("cars.moreLoginCta")}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.moreSection}>{t("cars.moreServices")}</Text>
          <View style={styles.moreGroup}>
            <MoreRow
              icon={<KeyRound size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("cars.moreRent")}
              onPress={() => router.push("/cars/rent")}
            />
          </View>

          <Text style={styles.moreSection}>{t("cars.moreExplore")}</Text>
          <View style={styles.moreGroup}>
            <MoreRow
              icon={<Bookmark size={18} color={colors.flame} strokeWidth={2.2} />}
              label={t("cars.moreSavedSearches")}
              onPress={() => router.push("/saved-searches")}
            />
            <MoreRow
              icon={<Heart size={18} color={colors.flame} strokeWidth={2.2} />}
              label={t("cars.moreFavorites")}
              onPress={() => setMode("saved")}
            />
            <MoreRow
              icon={<Search size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("cars.navSearch")}
              onPress={goSearch}
            />
          </View>

          <Text style={styles.moreSection}>{t("cars.moreSupport")}</Text>
          <View style={styles.moreGroup}>
            <MoreRow
              icon={<User size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("cars.moreProfile")}
              onPress={() => router.replace("/(tabs)/profile")}
            />
            <MoreRow
              icon={<Info size={18} color={colors.ink} strokeWidth={2.2} />}
              label={t("cars.moreContact")}
              onPress={() => router.push("/about")}
            />
          </View>
        </ScrollView>
      </CarsShell>
    );
  }

  if (mode === "saved") {
    return (
      <CarsShell
        active="saved"
        title={t("cars.navSaved")}
        onHome={goHome}
        onSearch={goSearch}
        onSaved={goSaved}
        onMore={goMore}
        onExit={exitCars}
      >
        <View style={styles.savedTabs}>
          <TouchableOpacity
            style={[styles.savedTab, savedTab === "ads" && styles.savedTabOn]}
            onPress={() => setSavedTab("ads")}
          >
            <Text style={[styles.savedTabText, savedTab === "ads" && styles.savedTabTextOn]}>
              {t("cars.savedAds")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.savedTab, savedTab === "searches" && styles.savedTabOn]}
            onPress={() => setSavedTab("searches")}
          >
            <Text
              style={[styles.savedTabText, savedTab === "searches" && styles.savedTabTextOn]}
            >
              {t("cars.savedSearches")}
            </Text>
          </TouchableOpacity>
        </View>
        {savedTab === "ads" ? (
          <FlashList
            data={DEMO_FAVORITES.map((f) => f.vehicle)}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.cardWrap}>
                <VehicleCard vehicle={item} index={index} variant="list" />
              </View>
            )}
            contentContainerStyle={styles.listPad}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Heart size={28} color={colors.inkFaint} strokeWidth={1.8} />
                <Text style={styles.emptyTitle}>{t("cars.savedEmptyAds")}</Text>
              </View>
            }
          />
        ) : (
          <ScrollView contentContainerStyle={styles.morePad}>
            <TouchableOpacity
              style={styles.savedSearchCard}
              onPress={() => router.push("/saved-searches")}
              activeOpacity={0.88}
            >
              <Bookmark size={18} color={colors.flame} strokeWidth={2.2} />
              <Text style={styles.savedSearchText}>{t("cars.moreSavedSearches")}</Text>
              <ChevronRight size={18} color={colors.inkFaint} strokeWidth={2} />
            </TouchableOpacity>
          </ScrollView>
        )}
      </CarsShell>
    );
  }

  if (mode === "filter") {
    return (
      <CarsShell
        active="search"
        title={t("common.filter")}
        hideSubHeader
        onHome={goHome}
        onSearch={goSearch}
        onSaved={goSaved}
        onMore={goMore}
        onExit={exitCars}
      >
        <View style={styles.filterRoot}>
          <View style={styles.topBar}>
            <Text style={styles.topTitle}>{t("common.filter")}</Text>
            <TouchableOpacity style={styles.iconHit} onPress={reset} hitSlop={8}>
              <RotateCcw size={18} color={colors.inkMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionLabel}>{t("search.city")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cityFilterRow}
            >
              <Chip
                label={t("common.all")}
                selected={!filters.city}
                onPress={() => {
                  setFilters((f) => ({ ...f, city: undefined }));
                  void setStoredCity("all");
                }}
                style={styles.quickChip}
              />
              {CITIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={filters.city === c}
                  onPress={() => {
                    const next = filters.city === c ? undefined : c;
                    setFilters((f) => ({ ...f, city: next }));
                    void setStoredCity(next ? (next as SelectedCity) : "all");
                  }}
                  style={styles.quickChip}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>{t("search.brands")}</Text>
            <View style={styles.brandGrid}>
              {brands.slice(0, 8).map((b) => {
                const active = selectedMakeId === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.brandCell, active && styles.brandCellActive]}
                    onPress={() => selectBrand(b.id, false)}
                    activeOpacity={0.85}
                  >
                    <BrandLogo
                      name={b.name}
                      nameEn={b.name_en ?? b.name}
                      logoUrl={b.logo_url}
                      size={40}
                    />
                    <Text
                      style={[styles.brandCellName, active && styles.brandCellNameOn]}
                      numberOfLines={1}
                    >
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.brandCell}
                onPress={() => setShowAllBrands(true)}
                activeOpacity={0.85}
              >
                <ChevronRight size={22} color={colors.inkMuted} strokeWidth={2} />
                <Text style={styles.brandCellName}>{t("common.all")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row2}>
              <SelectField
                label={t("search.model")}
                value={model}
                onPress={() => setPicker("model")}
                style={styles.half}
                allLabel={t("common.all")}
              />
              <SelectField
                label={t("search.city")}
                value={filters.city ?? null}
                onPress={() => setPicker("city")}
                style={styles.half}
                allLabel={t("common.all")}
              />
            </View>
            <View style={styles.row2}>
              <SelectField
                label={t("search.fromYear")}
                value={filters.minYear != null ? String(filters.minYear) : null}
                onPress={() => setPicker("minYear")}
                style={styles.half}
                allLabel={t("common.all")}
              />
              <SelectField
                label={t("search.toYear")}
                value={filters.maxYear != null ? String(filters.maxYear) : null}
                onPress={() => setPicker("maxYear")}
                style={styles.half}
                allLabel={t("common.all")}
              />
            </View>
            <View style={styles.row2}>
              <SelectField
                label={t("search.minPrice")}
                value={formatPrice(filters.minPrice)}
                onPress={() => setPicker("minPrice")}
                style={styles.half}
                allLabel={t("common.all")}
              />
              <SelectField
                label={t("search.maxPrice")}
                value={formatPrice(filters.maxPrice)}
                onPress={() => setPicker("maxPrice")}
                style={styles.half}
                allLabel={t("common.all")}
              />
            </View>
            <View style={styles.row2}>
              <SelectField
                label={t("search.minMileage")}
                value={
                  filters.minMileage != null
                    ? `${filters.minMileage.toLocaleString("tr-TR")} ${t("common.km")}`
                    : null
                }
                onPress={() => setPicker("minMileage")}
                style={styles.half}
                allLabel={t("common.all")}
              />
              <SelectField
                label={t("search.maxMileage")}
                value={
                  filters.maxMileage != null
                    ? `${filters.maxMileage.toLocaleString("tr-TR")} ${t("common.km")}`
                    : null
                }
                onPress={() => setPicker("maxMileage")}
                style={styles.half}
                allLabel={t("common.all")}
              />
            </View>

            <Text style={[styles.sectionLabel, styles.conditionLabel]}>{t("search.condition")}</Text>
            <View style={styles.conditionRow}>
              {(
                [
                  { key: "all" as const, labelKey: "common.all" },
                  { key: "used" as const, labelKey: "search.conditionUsed" },
                  { key: "new" as const, labelKey: "search.conditionNew" },
                ] as const
              ).map((c) => {
                const active = condition === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.conditionChip, active && styles.conditionChipActive]}
                    onPress={() => setCondition(c.key)}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.conditionText, active && styles.conditionTextActive]}>
                      {t(c.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity onPress={reset} hitSlop={8}>
              <Text style={styles.resetLink}>{t("search.reset")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.showBtn}
              activeOpacity={0.9}
              onPress={() => setMode("results")}
            >
              {isFetching ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.showBtnText}>{t("search.showCars", { count })}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {searchSheets}
      </CarsShell>
    );
  }

  if (mode === "results") {
    return (
      <CarsShell
        active="search"
        hideSubHeader
        onHome={goHome}
        onSearch={goSearch}
        onSaved={goSaved}
        onMore={goMore}
        onExit={exitCars}
      >
        <View style={styles.resultsRoot}>
          <View style={styles.resultsSticky}>
            <View style={styles.resultsNav}>
              <TouchableOpacity
                style={styles.iconHit}
                onPress={goSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t("search.filters")}
              >
                <ChevronLeft size={22} color={colors.ink} strokeWidth={2.2} />
              </TouchableOpacity>

              <View style={styles.resultsNavCenter}>
                <Text style={styles.resultsHeading} numberOfLines={1}>
                  {resultsHeading}
                </Text>
                <Text style={styles.resultsCountLine}>
                  {isLoading
                    ? t("search.searching")
                    : t("search.resultsCount", { count })}
                </Text>
              </View>

              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.iconHit}
                  onPress={() => void onSaveSearch()}
                  hitSlop={8}
                >
                  <Bookmark size={19} color={colors.flame} strokeWidth={2.2} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconHit}
                  onPress={() => void onShareSearch()}
                  hitSlop={8}
                >
                  <Share2 size={19} color={colors.ink} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {isLoading && results.length === 0 ? (
            <View style={styles.listPad}>
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
            </View>
          ) : (
            <FlashList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.cardWrap}>
                  <VehicleCard vehicle={item} index={index} />
                </View>
              )}
              contentContainerStyle={styles.listPad}
              style={styles.flex}
              refreshing={isFetching && !isLoading}
              onRefresh={() => refetch()}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIcon}>
                    <SearchX size={28} color={colors.inkFaint} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.emptyTitle}>{t("search.noResults")}</Text>
                  <Text style={styles.emptyHint}>{t("search.noResultsHint")}</Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={goSearch}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.emptyBtnText}>{t("search.filters")}</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
        {searchSheets}
      </CarsShell>
    );
  }

  /* —— HOME hub — dedicated DubicarsHome (not filter) —— */
  return (
    <CarsShell
      active="home"
      hideSubHeader
      onHome={goHome}
      onSearch={goSearch}
      onSaved={goSaved}
      onMore={goMore}
      onExit={exitCars}
    >
      <DubicarsHome
        count={Math.max(count, DEMO_VEHICLES.length)}
        loading={isFetching}
        topPicks={topPicks}
        dealers={featuredDealers}
        catalog={results}
        onSearch={goSearch}
        onSeeAllPicks={goAllResults}
      />
      {searchSheets}
    </CarsShell>
  );
}


function MoreRow({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.moreRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.moreRowIcon}>{icon}</View>
      <Text style={styles.moreRowLabel}>{label}</Text>
      <ChevronRight size={18} color={colors.inkFaint} strokeWidth={2} />
    </TouchableOpacity>
  );
}

function SelectField({
  label,
  value,
  onPress,
  style,
  allLabel = "All",
}: {
  label: string;
  value: string | null;
  onPress: () => void;
  style?: object;
  allLabel?: string;
}) {
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBox} onPress={onPress} activeOpacity={0.85}>
        <Text style={[styles.selectValue, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {value ?? allLabel}
        </Text>
        <ChevronDown size={16} color={colors.inkFaint} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  homePad: {
    paddingBottom: space.xl,
    backgroundColor: colors.white,
  },
  hero: {
    marginHorizontal: space.lg,
    marginTop: space.sm,
    borderRadius: radius.lg,
    overflow: "hidden",
    minHeight: 280,
    padding: space.lg,
    justifyContent: "flex-end",
    gap: space.md,
  },
  heroImage: { borderRadius: radius.lg },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,45,41,0.45)",
  },
  heroTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  heroSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 13,
  },
  heroSearchText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkFaint,
  },
  heroCta: {
    backgroundColor: colors.flame,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  heroCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
  sectionHead: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.md,
    marginHorizontal: space.lg,
    letterSpacing: -0.2,
  },
  sectionHeadTight: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  bandPad: {
    marginTop: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.paper,
    marginHorizontal: 0,
    paddingHorizontal: space.lg,
    marginBottom: 0,
    paddingBottom: space.md,
  },
  railHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: space.lg,
    marginTop: space.xl,
    marginBottom: space.md,
  },
  seeAll: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.flame,
  },
  servicesRail: {
    paddingHorizontal: space.lg,
    gap: 12,
  },
  serviceCard: {
    width: 220,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  serviceImage: {
    width: "100%",
    height: 110,
    backgroundColor: colors.mist,
  },
  serviceBody: {
    padding: space.md,
    backgroundColor: colors.paper,
    gap: 4,
    minHeight: 78,
  },
  serviceTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  serviceHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    lineHeight: 16,
  },
  topPicksPad: {
    paddingHorizontal: space.lg,
    gap: 12,
    paddingBottom: space.sm,
  },
  dealerBlock: {
    backgroundColor: colors.paper,
    paddingBottom: space.md,
    marginBottom: space.sm,
  },
  dealerHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  dealerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dealerInitial: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
  },
  dealerMeta: { flex: 1, minWidth: 0 },
  dealerName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  dealerLoc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  dealerCity: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  brandRailScroll: { maxHeight: 96 },
  brandRail: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: 12,
    alignItems: "flex-start",
  },
  brandRailCell: {
    width: 72,
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  brandRailCellOn: {
    opacity: 1,
  },
  brandRailName: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "center",
    maxWidth: 72,
  },
  brandRailNameOn: {
    fontFamily: fonts.bodySemi,
    color: colors.flameDeep,
  },
  brandRailMore: {
    width: 56,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.mist,
  },
  brandRailMoreText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkMuted,
  },
  filterRoot: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  topTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  iconHit: {
    minWidth: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  form: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    backgroundColor: colors.white,
  },
  conditionLabel: { marginTop: space.sm },
  bottomSpacer: { height: 24 },
  resultsRoot: { flex: 1, backgroundColor: colors.paper },
  quickChip: { flexShrink: 0, paddingHorizontal: 12, paddingVertical: 8 },
  resultsSticky: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    zIndex: 2,
  },
  resultsNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    paddingBottom: space.sm,
    gap: 4,
  },
  resultsNavCenter: { flex: 1, minWidth: 0, paddingHorizontal: 4 },
  resultsHeading: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  resultsCountLine: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  resultsActions: { flexDirection: "row", alignItems: "center" },
  listPad: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.section,
  },
  cardWrap: { marginBottom: space.md },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xxl,
    paddingTop: 64,
    paddingBottom: space.section,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  emptyTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  emptyHint: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: space.xl,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
  },
  emptyBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  savedTabs: {
    flexDirection: "row",
    marginHorizontal: space.lg,
    marginTop: space.sm,
    marginBottom: space.md,
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    padding: 4,
  },
  savedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  savedTabOn: { backgroundColor: colors.white, ...shadow.soft },
  savedTabText: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    color: colors.inkFaint,
  },
  savedTabTextOn: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
  },
  savedSearchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.lg,
  },
  savedSearchText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  morePad: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
  moreLoginCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    gap: space.md,
    marginBottom: space.md,
  },
  moreLoginText: {
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  moreLoginBtn: {
    backgroundColor: colors.flame,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  moreLoginBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
  moreSection: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: space.md,
    marginBottom: space.xs,
    marginHorizontal: 4,
  },
  moreGroup: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: "hidden",
  },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  moreRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  moreRowLabel: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
  },
  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  modalTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  modalDone: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.flame,
  },
  filterPad: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  filterFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    gap: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  resetLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.inkMuted,
  },
  showBtn: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  showBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
    marginBottom: space.sm,
  },
  cityFilterRow: {
    gap: 8,
    marginBottom: space.xl,
    paddingRight: space.sm,
  },
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: space.xl,
  },
  brandCell: {
    width: "22%",
    minWidth: 72,
    flexGrow: 1,
    maxWidth: "24%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  brandCellActive: {
    borderColor: colors.flame,
    backgroundColor: colors.flameSoft,
  },
  brandCellName: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "center",
  },
  brandCellNameOn: {
    fontFamily: fonts.bodySemi,
    color: colors.flameDeep,
  },
  allBrands: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: space.lg,
    gap: 12,
  },
  allBrandCell: {
    width: "30%",
    flexGrow: 1,
    maxWidth: "32%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  allBrandName: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.ink,
  },
  row2: {
    flexDirection: "row",
    gap: 12,
    marginBottom: space.md,
  },
  half: { flex: 1 },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginBottom: 6,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 13,
    minHeight: 48,
  },
  selectValue: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginRight: 6,
  },
  selectPlaceholder: { color: colors.inkFaint },
  conditionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  conditionChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  conditionChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  conditionText: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    color: colors.ink,
  },
  conditionTextActive: {
    color: colors.white,
    fontFamily: fonts.bodySemi,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "55%",
    paddingBottom: space.xl,
  },
  pickerTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    padding: space.lg,
  },
  pickerList: { maxHeight: 320 },
  pickerItem: {
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  pickerItemText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
});
