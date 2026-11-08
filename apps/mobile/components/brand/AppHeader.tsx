import { router, usePathname } from "expo-router";
import { Check, ChevronLeft, MapPin, Search, Wallet } from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  localeNativeName,
  supportedLocales,
  type LocaleCode,
} from "../../lib/locales";
import { useLocalePrefsStore } from "../../lib/locale-prefs-store";
import {
  type AppCurrency,
  useCurrencyStore,
} from "../../lib/currency-store";
import {
  MARKET_CITIES,
  useCityStore,
  type MarketCity,
} from "../../lib/city-store";
import { useDeliveryAddressStore } from "../../lib/delivery-address-store";
import { iqdPerUsd } from "../../lib/hatwan-rates";
import { useWalletStore } from "../../lib/wallet-store";
import { colors, fonts, radius, space } from "../../lib/theme";
import { BrandMark } from "./BrandMark";

/** AppBar cüzdan pill — kompakt bakiye */
function formatHeaderBalance(balanceIqd: number): string {
  const n = Number.isFinite(balanceIqd) ? Math.max(0, Math.floor(balanceIqd)) : 0;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  return n.toLocaleString("tr-TR");
}

const LOCALE_SHORT: Record<LocaleCode, string> = {
  tr: "TR",
  en: "EN",
  ar: "AR",
  fa: "FA",
  "ku-bad": "KU",
  "ku-sor": "کورد",
};

type Props = {
  right?: ReactNode;
  below?: ReactNode;
  style?: ViewStyle;
  safeTop?: boolean;
  showActions?: boolean;
  /**
   * brand — logo şeridi (Hizmetler): [Bölge] → Logo (orta) → [Dil·Para] → Cüzdan
   * market — standart: Geri → Konum → Arama → [Dil·Para] → Cüzdan
   */
  variant?: "brand" | "market";
  searchPlaceholder?: string;
  onSearchPress?: () => void;
  aboveSearch?: ReactNode;
  showBack?: boolean;
  onBackPress?: () => void;
};

function isAnaRootPath(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  const p = pathname.replace(/\/+$/, "") || "/";
  return (
    p === "/" ||
    p === "/(tabs)" ||
    p === "/(tabs)/index" ||
    p.endsWith("/(tabs)/index") ||
    p === "/index"
  );
}

/**
 * AppBar —
 * brand: Bölge → Logo → Dil·Para → Cüzdan
 * market: Geri → Konum → Arama → Dil·Para → Cüzdan
 */
export function AppHeader({
  right,
  below,
  style,
  safeTop = true,
  showActions = true,
  variant = "market",
  searchPlaceholder,
  onSearchPress,
  aboveSearch,
  showBack,
  onBackPress,
}: Props) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const { width: windowWidth } = useWindowDimensions();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const display = useCurrencyStore((s) => s.display);
  const quote = useCurrencyStore((s) => s.quote);
  const setDisplay = useCurrencyStore((s) => s.setDisplay);
  const refreshRates = useCurrencyStore((s) => s.refreshRates);
  const setCity = useCityStore((s) => s.setCity);
  const hydrateCity = useCityStore((s) => s.hydrate);
  const addresses = useDeliveryAddressStore((s) => s.addresses);
  const selectedId = useDeliveryAddressStore((s) => s.selectedId);
  const selectAddress = useDeliveryAddressStore((s) => s.select);
  const hydrateAddr = useDeliveryAddressStore((s) => s.hydrate);
  const selectNearestFromDevice = useDeliveryAddressStore(
    (s) => s.selectNearestFromDevice,
  );
  const addrHydrated = useDeliveryAddressStore((s) => s.hydrated);
  const balanceIqd = useWalletStore((s) => s.balanceIqd);
  const hydrateWallet = useWalletStore((s) => s.hydrate);
  const shortLabel =
    addresses.find((a) => a.id === selectedId)?.city ??
    addresses[0]?.city ??
    "Erbil";
  const currentLocale = (supportedLocales.includes(i18n.language as LocaleCode)
    ? i18n.language
    : "tr") as LocaleCode;
  const isBrand = variant === "brand";
  /** Hizmetler logo — ekran genişliğinin ~26%’i, 72–110 arası; oran sabit */
  const brandLogoW = useMemo(() => {
    const scaled = Math.round(windowWidth * 0.26);
    return Math.max(72, Math.min(110, scaled));
  }, [windowWidth]);
  const brandLogoH = useMemo(
    () => Math.round(brandLogoW / (1024 / 509)),
    [brandLogoW],
  );
  const showBackBtn = useMemo(() => {
    if (isBrand) return false;
    if (showBack != null) return showBack;
    return !isAnaRootPath(pathname);
  }, [isBrand, showBack, pathname]);

  useEffect(() => {
    void refreshRates(false);
  }, [refreshRates]);

  useEffect(() => {
    void hydrateCity();
    void hydrateAddr();
    void hydrateWallet();
  }, [hydrateCity, hydrateAddr, hydrateWallet]);

  /** Konum izni + en yakın seed adres → global şehir ile senkron */
  useEffect(() => {
    if (!addrHydrated) return;
    let cancelled = false;
    void (async () => {
      const id = await selectNearestFromDevice();
      if (cancelled || !id) return;
      const addr = useDeliveryAddressStore.getState().addresses.find((a) => a.id === id);
      if (addr && (MARKET_CITIES as readonly string[]).includes(addr.city)) {
        await setCity(addr.city as MarketCity);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addrHydrated, selectNearestFromDevice, setCity]);

  const setLang = useLocalePrefsStore((s) => s.setLang);

  const goBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const changeLocale = (locale: LocaleCode) => {
    void setLang(locale);
  };

  const changeCurrency = (c: AppCurrency) => {
    void setDisplay(c);
  };

  const pickAddress = async (id: string) => {
    await selectAddress(id);
    const addr = addresses.find((a) => a.id === id);
    if (addr && (MARKET_CITIES as readonly string[]).includes(addr.city)) {
      await setCity(addr.city as MarketCity);
    }
    setAddrOpen(false);
  };

  const regionChip =
    showActions ? (
      <TouchableOpacity
        style={styles.marketCityChip}
        hitSlop={8}
        onPress={() => setAddrOpen(true)}
        accessibilityLabel={t("mart.deliverTo")}
        accessibilityRole="button"
      >
        <MapPin size={11} color={colors.flame} strokeWidth={2.3} />
        <Text style={styles.marketCityLabel} numberOfLines={1}>
          {shortLabel}
        </Text>
      </TouchableOpacity>
    ) : null;

  const mid = quote ? iqdPerUsd(quote, "mid") : null;
  const prefsLabel = `${LOCALE_SHORT[currentLocale]} · ${display}`;

  const openSearch =
    onSearchPress ??
    (() => router.push({ pathname: "/(tabs)/search", params: { openResults: "1" } }));

  const prefsAndWallet =
    showActions ? (
      <>
        <TouchableOpacity
          style={styles.prefsBtn}
          hitSlop={8}
          onPress={() => setPrefsOpen(true)}
          accessibilityLabel={t("header.localeCurrency")}
          accessibilityRole="button"
        >
          <Text style={styles.prefsBtnText} numberOfLines={1}>
            {prefsLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.marketWalletBtn}
          hitSlop={8}
          onPress={() => router.push("/wallet")}
          accessibilityLabel={t("ride.hub.wallet")}
          accessibilityRole="button"
        >
          <Wallet size={11} color={colors.flame} strokeWidth={2.3} />
          <Text style={styles.marketWalletText} numberOfLines={1}>
            {formatHeaderBalance(balanceIqd)}
          </Text>
        </TouchableOpacity>
      </>
    ) : null;

  const body = (
    <View style={[styles.wrap, !safeTop && styles.wrapNoSafe, style]}>
      {aboveSearch}
      {isBrand ? (
        <View style={styles.brandRow}>
          {/* Absolute center — her genişlikte logo ortada kalır */}
          <View style={styles.brandCenter} pointerEvents="box-none">
            <Pressable
              style={styles.brandMark}
              onPress={() => router.replace("/(tabs)")}
              accessibilityRole="button"
              accessibilityLabel="kullo"
            >
              <BrandMark
                width={brandLogoW}
                height={brandLogoH}
                style={styles.brandLogo}
              />
            </Pressable>
          </View>
          <View style={styles.brandLeading}>{regionChip}</View>
          <View style={styles.brandActions}>
            {prefsAndWallet}
            {right}
          </View>
        </View>
      ) : (
        <View style={styles.marketRow}>
          {showBackBtn ? (
            <TouchableOpacity
              style={styles.marketBackBtn}
              hitSlop={8}
              onPress={goBack}
              accessibilityLabel={t("common.back")}
              accessibilityRole="button"
            >
              <ChevronLeft size={18} color={colors.white} strokeWidth={2.4} />
            </TouchableOpacity>
          ) : null}
          {regionChip}
          <Pressable
            style={styles.searchPill}
            onPress={openSearch}
            accessibilityRole="search"
            accessibilityLabel={
              searchPlaceholder ?? t("superHome.searchPlaceholder")
            }
          >
            <Search size={14} color={colors.inkMuted} strokeWidth={2.2} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              {searchPlaceholder ?? t("superHome.searchPlaceholder")}
            </Text>
          </Pressable>
          {prefsAndWallet}
          {right}
        </View>
      )}
      {below}
    </View>
  );

  return (
    <>
      {safeTop ? (
        <SafeAreaView edges={["top"]} style={styles.safe}>
          {body}
        </SafeAreaView>
      ) : (
        body
      )}

      {/* Konum */}
      <Modal
        visible={addrOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAddrOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setAddrOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{t("mart.deliverTo")}</Text>
            {addresses.map((a) => {
              const selected = a.id === selectedId;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.rowOpt, selected && styles.rowOptOn]}
                  onPress={() => void pickAddress(a.id)}
                  activeOpacity={0.85}
                >
                  <MapPin
                    size={14}
                    color={selected ? colors.flameDeep : colors.inkFaint}
                    strokeWidth={2.2}
                  />
                  <View style={styles.addrBody}>
                    <Text
                      style={[styles.rowOptMain, selected && styles.rowOptMainOn]}
                      numberOfLines={1}
                    >
                      {a.label} · {a.city}
                    </Text>
                    <Text style={styles.addrLine} numberOfLines={1}>
                      {a.line}
                    </Text>
                  </View>
                  {selected ? (
                    <Check size={16} color={colors.flame} strokeWidth={2.4} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Dil + Para — tek minimal modal */}
      <Modal
        visible={prefsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPrefsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPrefsOpen(false)}>
          <Pressable style={styles.sheetMinimal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t("header.localeCurrency")}</Text>

            <Text style={styles.sectionLabel}>{t("auth.selectLanguage")}</Text>
            <View style={styles.segRow}>
              {supportedLocales.map((loc) => {
                const selected = loc === currentLocale;
                return (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.segChip, selected && styles.segChipOn]}
                    onPress={() => changeLocale(loc)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segText, selected && styles.segTextOn]}>
                      {LOCALE_SHORT[loc]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.hintMuted} numberOfLines={1}>
              {localeNativeName[currentLocale]}
            </Text>

            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
              {t("currency.label")}
            </Text>
            <View style={styles.segRow}>
              {(["IQD", "USD"] as AppCurrency[]).map((c) => {
                const selected = c === display;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.segChipWide, selected && styles.segChipOn]}
                    onPress={() => changeCurrency(c)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segText, selected && styles.segTextOn]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {mid ? (
              <Text style={styles.hintMuted}>
                {t("currency.hatwanMid", {
                  rate: mid.toLocaleString("en-US", { maximumFractionDigits: 0 }),
                })}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setPrefsOpen(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.doneBtnText}>{t("common.done")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.ink },
  wrap: {
    backgroundColor: colors.ink,
    paddingHorizontal: space.md,
    paddingTop: 0,
    paddingBottom: 5,
  },
  wrapNoSafe: { paddingTop: 6 },
  brandRow: {
    position: "relative",
    minHeight: 48,
    justifyContent: "center",
  },
  brandCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  brandMark: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "44%",
  },
  brandLogo: {
    backgroundColor: "transparent",
    maxWidth: "100%",
  },
  brandLeading: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    maxWidth: "28%",
  },
  brandActions: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 1,
  },
  marketBackBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  marketCityChip: {
    maxWidth: 72,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(243,106,28,0.45)",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  },
  marketCityLabel: {
    flexShrink: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
  },
  prefsBtn: {
    height: 32,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    maxWidth: 88,
  },
  prefsBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.2,
  },
  marketWalletBtn: {
    height: 32,
    maxWidth: 72,
    paddingHorizontal: 7,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(243,106,28,0.45)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    flexShrink: 0,
  },
  marketWalletText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  marketRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 32,
  },
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    minWidth: 0,
    paddingHorizontal: 9,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetMinimal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 22,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 10,
  },
  sheetTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  segRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  segChip: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  segChipWide: {
    flex: 1,
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  segChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  segText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  segTextOn: { color: colors.white },
  hintMuted: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  doneBtn: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  rowOpt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.mist,
  },
  rowOptOn: {
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: "rgba(243,106,28,0.35)",
  },
  rowOptMain: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  rowOptMainOn: {
    fontFamily: fonts.bodySemi,
    color: colors.flameDeep,
  },
  addrBody: { flex: 1, minWidth: 0, gap: 2 },
  addrLine: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
});
