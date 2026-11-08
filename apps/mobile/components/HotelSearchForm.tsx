import { CalendarDays, MapPin, User, X } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, radius, shadow, space } from "../lib/theme";

export type HotelSearchDraft = {
  q: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
};

type Props = {
  initial?: Partial<HotelSearchDraft>;
  onSubmit: (draft: HotelSearchDraft) => void;
};

const BOX_RADIUS = 10;

/** "20 Kas" tarzı kısa tarih */
function formatShortDate(iso: string, lang: "tr" | "en"): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function HotelSearchForm({ initial, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const [q, setQ] = useState(initial?.q ?? "");
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? "");
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [dateTarget, setDateTarget] = useState<"in" | "out" | null>(null);
  const [dateDraft, setDateDraft] = useState("");
  const [paxOpen, setPaxOpen] = useState(false);

  const guestsLabel = () => {
    if (children > 0) {
      return t("travel.hotelGuestsMixed", {
        adults,
        children,
      });
    }
    return t("travel.hotelAdults", { count: adults });
  };

  const submit = () => {
    onSubmit({
      q: q.trim(),
      checkIn: checkIn.trim(),
      checkOut: checkOut.trim(),
      adults: Math.max(1, adults),
      children: Math.max(0, children),
    });
  };

  const openDate = (target: "in" | "out") => {
    setDateTarget(target);
    setDateDraft(target === "in" ? checkIn : checkOut);
  };

  const applyDate = () => {
    const v = dateDraft.trim();
    if (dateTarget === "in") setCheckIn(v);
    if (dateTarget === "out") setCheckOut(v);
    setDateTarget(null);
    setDateDraft("");
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {}}
        style={styles.field}
        accessibilityRole="button"
      >
        <MapPin size={18} color={colors.inkFaint} strokeWidth={2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t("travel.hotelPlacePlaceholder")}
          placeholderTextColor={colors.inkFaint}
          style={styles.placeInput}
          returnKeyType="search"
          onSubmitEditing={submit}
        />
      </Pressable>

      <View style={styles.row}>
        <Pressable
          onPress={() => openDate("in")}
          style={[styles.field, styles.half]}
          accessibilityRole="button"
        >
          <CalendarDays size={16} color={colors.inkFaint} strokeWidth={2} />
          <Text
            style={[
              styles.fieldText,
              !checkIn && styles.fieldPlaceholder,
            ]}
            numberOfLines={1}
          >
            {checkIn
              ? formatShortDate(checkIn, lang)
              : t("travel.hotelCheckIn")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => openDate("out")}
          style={[styles.field, styles.half]}
          accessibilityRole="button"
        >
          <CalendarDays size={16} color={colors.inkFaint} strokeWidth={2} />
          <Text
            style={[
              styles.fieldText,
              !checkOut && styles.fieldPlaceholder,
            ]}
            numberOfLines={1}
          >
            {checkOut
              ? formatShortDate(checkOut, lang)
              : t("travel.hotelCheckOut")}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setPaxOpen(true)}
        style={styles.field}
        accessibilityRole="button"
      >
        <User size={18} color={colors.inkFaint} strokeWidth={2} />
        <Text style={styles.fieldText} numberOfLines={1}>
          {guestsLabel()}
        </Text>
      </Pressable>

      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>{t("travel.searchHotel")}</Text>
      </Pressable>

      <Modal
        visible={dateTarget != null}
        animationType="slide"
        transparent
        onRequestClose={() => setDateTarget(null)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setDateTarget(null)}
        />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              {dateTarget === "in"
                ? t("travel.hotelCheckIn")
                : t("travel.hotelCheckOut")}
            </Text>
            <Pressable
              onPress={() => setDateTarget(null)}
              hitSlop={10}
              style={styles.sheetClose}
            >
              <X size={18} color={colors.inkMuted} />
            </Pressable>
          </View>
          <View style={styles.dateBox}>
            <TextInput
              value={dateDraft}
              onChangeText={setDateDraft}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.inkFaint}
              style={styles.dateInput}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>
          <Pressable
            onPress={applyDate}
            style={styles.paxDone}
            accessibilityRole="button"
          >
            <Text style={styles.paxDoneText}>{t("travel.ok")}</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={paxOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPaxOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPaxOpen(false)} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{t("travel.passengers")}</Text>
            <Pressable
              onPress={() => setPaxOpen(false)}
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
              onPress={() => setPaxOpen(false)}
              style={styles.paxDone}
              accessibilityRole="button"
            >
              <Text style={styles.paxDoneText}>{t("travel.ok")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: BOX_RADIUS,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 54,
    ...shadow.soft,
  },
  half: { flex: 1 },
  row: { flexDirection: "row", gap: 8 },
  placeInput: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
    margin: 0,
  },
  fieldText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  fieldPlaceholder: {
    color: colors.inkFaint,
    fontFamily: fonts.bodyMed,
  },
  cta: {
    marginTop: 4,
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
  dateBox: {
    marginHorizontal: space.lg,
    marginBottom: space.md,
    borderRadius: BOX_RADIUS,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.mist,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  dateInput: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
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
    marginHorizontal: space.lg,
    marginTop: space.sm,
    marginBottom: space.sm,
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
});
