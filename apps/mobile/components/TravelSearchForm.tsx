import {
  ArrowDownUp,
  CalendarDays,
  ChevronDown,
  MapPin,
  PlaneLanding,
  PlaneTakeoff,
  Users,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TRAVEL_PLACES, type TravelMode, type TravelPlace } from "../lib/travel";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

export type TravelSearchDraft = {
  from: string;
  to: string;
  date: string;
  adults: number;
  children: number;
  vehicle?: string;
  cabin?: "economy" | "business";
  nonstopOnly?: boolean;
};

type Props = {
  mode: TravelMode;
  initial?: Partial<TravelSearchDraft>;
  onSubmit: (draft: TravelSearchDraft) => void;
};

const DEFAULT_DATE = "2026-11-20";

type PickerTarget = "from" | "to" | "pax" | "cabin" | null;

function placeLabel(p: TravelPlace, lang: "tr" | "en") {
  return lang === "tr" ? p.city_tr : p.city_en;
}

function placeCountry(p: TravelPlace, lang: "tr" | "en") {
  return lang === "tr" ? p.country_tr : p.country_en;
}

/** Ucuzabilet tarzı: "EBL, Erbil, Irak" */
function placeLine(p: TravelPlace | undefined, code: string, lang: "tr" | "en") {
  if (!p) return code;
  return `${p.code}, ${placeLabel(p, lang)}, ${placeCountry(p, lang)}`;
}

/** "20 Kas Cumartesi" */
function formatDisplayDate(iso: string, lang: "tr" | "en"): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "long",
  });
}

export function TravelSearchForm({ mode, initial, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const [from, setFrom] = useState(initial?.from ?? "EBL");
  const [to, setTo] = useState(
    initial?.to ?? (mode === "flight" ? "IST" : mode === "bus" ? "BGW" : "ISU"),
  );
  const [date, setDate] = useState(initial?.date ?? DEFAULT_DATE);
  const [adults, setAdults] = useState(initial?.adults ?? 1);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [vehicle, setVehicle] = useState(initial?.vehicle ?? "sedan");
  const [cabin, setCabin] = useState<"economy" | "business">(
    initial?.cabin ?? "economy",
  );
  const [nonstopOnly, setNonstopOnly] = useState(initial?.nonstopOnly ?? false);
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [query, setQuery] = useState("");
  const [dateEdit, setDateEdit] = useState(false);

  const places = useMemo(() => TRAVEL_PLACES, []);
  const fromPlace = places.find((p) => p.code === from);
  const toPlace = places.find((p) => p.code === to);

  const filteredPlaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => {
      const hay = `${p.code} ${p.city_tr} ${p.city_en} ${p.country_tr} ${p.country_en}`.toLowerCase();
      return hay.includes(q);
    });
  }, [places, query]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const paxSummary = () => {
    const total = adults + children;
    return t("travel.paxSummaryShort", { count: total });
  };

  const submit = () => {
    if (!from || !to || from === to) return;
    onSubmit({
      from,
      to,
      date: date.trim() || DEFAULT_DATE,
      adults: Math.max(1, adults),
      children: Math.max(0, children),
      vehicle: mode === "private" ? vehicle : undefined,
      cabin: mode === "flight" ? cabin : undefined,
      nonstopOnly: mode === "flight" ? nonstopOnly : undefined,
    });
  };

  const pickPlace = (code: string) => {
    if (picker === "from") setFrom(code);
    if (picker === "to") setTo(code);
    setPicker(null);
    setQuery("");
  };

  const RouteIcon =
    mode === "flight" ? (
      <>
        <PlaneTakeoff size={18} color={colors.inkFaint} strokeWidth={2} />
      </>
    ) : (
      <MapPin size={18} color={colors.inkFaint} strokeWidth={2} />
    );

  const ToIcon =
    mode === "flight" ? (
      <PlaneLanding size={18} color={colors.inkFaint} strokeWidth={2} />
    ) : (
      <MapPin size={18} color={colors.inkFaint} strokeWidth={2} />
    );

  return (
    <View style={styles.wrap}>
      {/* Nereden / Nereye — dikey stack + sağ swap (Ucuzabilet) */}
      <View style={styles.routeStack}>
        <Pressable
          onPress={() => {
            setQuery("");
            setPicker("from");
          }}
          style={styles.routeBox}
          accessibilityRole="button"
        >
          {RouteIcon}
          <View style={styles.fieldBody}>
            <Text style={styles.fieldLabel}>{t("travel.from")}</Text>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {placeLine(fromPlace, from, lang)}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            setQuery("");
            setPicker("to");
          }}
          style={[styles.routeBox, styles.routeBoxTo]}
          accessibilityRole="button"
        >
          {ToIcon}
          <View style={styles.fieldBody}>
            <Text style={styles.fieldLabel}>{t("travel.to")}</Text>
            <Text
              style={[
                styles.fieldValue,
                !toPlace && styles.fieldPlaceholder,
              ]}
              numberOfLines={1}
            >
              {toPlace
                ? placeLine(toPlace, to, lang)
                : t("travel.toPlaceholder")}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={swap}
          style={styles.swapFab}
          accessibilityRole="button"
          accessibilityLabel={t("travel.swap")}
        >
          <ArrowDownUp size={16} color={colors.inkMuted} strokeWidth={2.4} />
        </Pressable>
      </View>

      {mode !== "private" ? (
        <>
          {/* Tarih | Dönüş — yan yana eşit */}
          <View style={styles.metaRow}>
            <Pressable
              onPress={() => setDateEdit((v) => !v)}
              style={[styles.metaBox, { flex: 1 }]}
              accessibilityRole="button"
            >
              <CalendarDays size={16} color={colors.inkFaint} strokeWidth={2} />
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>
                  {mode === "bus"
                    ? t("travel.departDate")
                    : t("travel.departFlight")}
                </Text>
                {dateEdit ? (
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    onBlur={() => setDateEdit(false)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.inkFaint}
                    style={styles.dateInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                ) : (
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {formatDisplayDate(date, lang)}
                  </Text>
                )}
              </View>
            </Pressable>
            <Pressable
              style={[styles.metaBox, { flex: 1 }]}
              accessibilityRole="button"
            >
              <CalendarDays size={16} color={colors.inkFaint} strokeWidth={2} />
              <View style={styles.fieldBody}>
                <Text style={[styles.fieldValue, styles.fieldPlaceholder]}>
                  {t("travel.addReturn")}
                </Text>
              </View>
            </Pressable>
          </View>

          {mode === "flight" ? (
            <>
              {/* Yolcu | Kabin */}
              <View style={styles.metaRow}>
                <Pressable
                  onPress={() => setPicker("pax")}
                  style={[styles.metaBox, { flex: 1 }]}
                  accessibilityRole="button"
                >
                  <Users size={16} color={colors.inkFaint} strokeWidth={2} />
                  <View style={styles.fieldBody}>
                    <Text style={styles.fieldValue} numberOfLines={1}>
                      {paxSummary()}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setPicker("cabin")}
                  style={[styles.metaBox, { flex: 1 }]}
                  accessibilityRole="button"
                >
                  <View style={styles.fieldBody}>
                    <Text style={styles.fieldValue} numberOfLines={1}>
                      {t(`travel.class.${cabin}`)}
                    </Text>
                  </View>
                  <ChevronDown size={16} color={colors.inkFaint} />
                </Pressable>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  {t("travel.nonstopOnly")}
                </Text>
                <Switch
                  value={nonstopOnly}
                  onValueChange={setNonstopOnly}
                  trackColor={{
                    false: colors.line,
                    true: colors.flameMid,
                  }}
                  thumbColor={colors.white}
                />
              </View>
            </>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.sectionLabel}>{t("travel.vehicleClass")}</Text>
          <View style={styles.classRow}>
            {(["sedan", "suv", "van", "luxury"] as const).map((v) => {
              const on = vehicle === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setVehicle(v)}
                  style={[styles.classChip, on && styles.classChipOn]}
                >
                  <Text
                    style={[styles.classChipText, on && styles.classChipTextOn]}
                  >
                    {t(`travel.vehicle.${v}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>
          {mode === "private"
            ? t("travel.getQuotes")
            : mode === "bus"
              ? t("travel.searchBus")
              : t("travel.searchFlight")}
        </Text>
      </Pressable>

      <Modal
        visible={picker === "from" || picker === "to"}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPicker(null)} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              {picker === "from" ? t("travel.from") : t("travel.to")}
            </Text>
            <Pressable
              onPress={() => setPicker(null)}
              hitSlop={10}
              style={styles.sheetClose}
            >
              <X size={18} color={colors.inkMuted} />
            </Pressable>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("travel.placeSearch")}
              placeholderTextColor={colors.inkFaint}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.placeList}
          >
            {filteredPlaces.map((p) => {
              const selected =
                (picker === "from" && p.code === from) ||
                (picker === "to" && p.code === to);
              return (
                <Pressable
                  key={p.code}
                  onPress={() => pickPlace(p.code)}
                  style={[styles.placeRow, selected && styles.placeRowOn]}
                >
                  <View>
                    <Text style={styles.placeCity}>
                      {p.code}, {placeLabel(p, lang)}
                    </Text>
                    <Text style={styles.placeCountry}>
                      {placeCountry(p, lang)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={picker === "pax"}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPicker(null)} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{t("travel.passengers")}</Text>
            <Pressable
              onPress={() => setPicker(null)}
              hitSlop={10}
              style={styles.sheetClose}
            >
              <X size={18} color={colors.inkMuted} />
            </Pressable>
          </View>
          <View style={styles.paxSheet}>
            <View style={styles.paxLine}>
              <Text style={styles.paxName}>{t("travel.adults")}</Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => setAdults((n) => Math.max(1, n - 1))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Text style={styles.stepVal}>{adults}</Text>
                <Pressable
                  onPress={() => setAdults((n) => Math.min(9, n + 1))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.paxLine}>
              <Text style={styles.paxName}>{t("travel.children")}</Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => setChildren((n) => Math.max(0, n - 1))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Text style={styles.stepVal}>{children}</Text>
                <Pressable
                  onPress={() => setChildren((n) => Math.min(6, n + 1))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={() => setPicker(null)}
              style={styles.paxDone}
              accessibilityRole="button"
            >
              <Text style={styles.paxDoneText}>{t("travel.ok")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={picker === "cabin"}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPicker(null)} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{t("travel.filterCabin")}</Text>
            <Pressable
              onPress={() => setPicker(null)}
              hitSlop={10}
              style={styles.sheetClose}
            >
              <X size={18} color={colors.inkMuted} />
            </Pressable>
          </View>
          {(["economy", "business"] as const).map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                setCabin(c);
                setPicker(null);
              }}
              style={styles.cabinRow}
            >
              <Text style={styles.cabinText}>{t(`travel.class.${c}`)}</Text>
              {cabin === c ? (
                <Text style={styles.cabinCheck}>✓</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const BOX_RADIUS = 10;

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  routeStack: {
    position: "relative",
    gap: 8,
  },
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: BOX_RADIUS,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 52,
    minHeight: 62,
    ...shadow.soft,
  },
  routeBoxTo: {},
  fieldBody: { flex: 1, minWidth: 0 },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
  },
  fieldPlaceholder: {
    color: colors.inkFaint,
    fontFamily: fonts.bodyMed,
  },
  swapFab: {
    position: "absolute",
    right: 10,
    /** İki kutu (64) + gap (8) ortası — Ucuzabilet sağ swap */
    top: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 3,
    ...shadow.soft,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
  },
  metaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: BOX_RADIUS,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 60,
    ...shadow.soft,
  },
  dateInput: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
    margin: 0,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  toggleLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
    flex: 1,
    paddingRight: 12,
  },
  sectionLabel: {
    marginTop: space.sm,
    marginBottom: 4,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  classRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  classChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  classChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  classChipText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
  },
  classChipTextOn: { color: colors.white },
  cta: {
    marginTop: 8,
    height: 50,
    borderRadius: BOX_RADIUS,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "78%",
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 8,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  sheetTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
  searchBox: {
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.mist,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",
  },
  searchInput: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  placeList: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  placeRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  placeRowOn: {
    backgroundColor: colors.flameSoft,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  placeCity: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  placeCountry: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  paxSheet: { paddingHorizontal: space.lg, gap: space.md },
  paxLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  paxName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTxt: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  stepVal: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
    minWidth: 24,
    textAlign: "center",
  },
  paxDone: {
    marginTop: space.sm,
    height: 48,
    borderRadius: BOX_RADIUS,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  paxDoneText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
  cabinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  cabinText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  cabinCheck: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.flame,
  },
});
