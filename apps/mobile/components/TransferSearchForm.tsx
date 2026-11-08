import {
  ArrowDownUp,
  CalendarDays,
  Clock,
  MapPin,
  User,
  X,
} from "lucide-react-native";
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

export type TransferSearchDraft = {
  from: string;
  to: string;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  adults: number;
};

type Props = {
  initial?: Partial<TransferSearchDraft>;
  onSubmit: (draft: TransferSearchDraft) => void;
};

const BOX = 10;
const DEFAULT_DATE = "2026-11-20";

function formatDay(iso: string, lang: "tr" | "en") {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "long",
  });
}

export function TransferSearchForm({ initial, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [date, setDate] = useState(initial?.date ?? DEFAULT_DATE);
  const [time, setTime] = useState(initial?.time ?? "16:00");
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? "");
  const [returnTime, setReturnTime] = useState(initial?.returnTime ?? "");
  const [adults, setAdults] = useState(initial?.adults ?? 1);
  const [paxOpen, setPaxOpen] = useState(false);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = () => {
    onSubmit({
      from: from.trim() || "EBL",
      to: to.trim() || "hotel",
      date,
      time,
      returnDate,
      returnTime,
      adults: Math.max(1, adults),
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.routeStack}>
        <View style={styles.field}>
          <MapPin size={18} color={colors.inkFaint} strokeWidth={2} />
          <TextInput
            value={from}
            onChangeText={setFrom}
            placeholder={t("travel.transferFromPlaceholder")}
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
          />
        </View>
        <View style={[styles.field, styles.fieldTo]}>
          <MapPin size={18} color={colors.inkFaint} strokeWidth={2} />
          <TextInput
            value={to}
            onChangeText={setTo}
            placeholder={t("travel.transferToPlaceholder")}
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
          />
        </View>
        <Pressable
          onPress={swap}
          style={styles.swapFab}
          accessibilityRole="button"
          accessibilityLabel={t("travel.swap")}
        >
          <ArrowDownUp size={16} color={colors.inkMuted} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        <View style={styles.cell}>
          <CalendarDays size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.departDate")}</Text>
            <Text style={styles.cellValue} numberOfLines={1}>
              {formatDay(date, lang)}
            </Text>
          </View>
        </View>
        <View style={styles.cell}>
          <Clock size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.transferDepartTime")}</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              style={styles.cellValueInput}
              placeholder="16:00"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
        </View>
        <Pressable
          onPress={() =>
            setReturnDate((v) => (v ? "" : "2026-11-21"))
          }
          style={styles.cell}
          accessibilityRole="button"
        >
          <CalendarDays size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text
              style={[
                styles.cellValue,
                !returnDate && styles.placeholder,
              ]}
              numberOfLines={1}
            >
              {returnDate
                ? formatDay(returnDate, lang)
                : t("travel.addReturn")}
            </Text>
          </View>
        </Pressable>
        <View style={styles.cell}>
          <Clock size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.transferReturnTime")}</Text>
            <TextInput
              value={returnTime}
              onChangeText={setReturnTime}
              style={[
                styles.cellValueInput,
                !returnDate && styles.placeholder,
              ]}
              placeholder="--"
              placeholderTextColor={colors.inkFaint}
              editable={!!returnDate}
            />
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => setPaxOpen(true)}
        style={styles.field}
        accessibilityRole="button"
      >
        <User size={18} color={colors.inkFaint} strokeWidth={2} />
        <Text style={styles.guests}>{t("travel.hotelAdults", { count: adults })}</Text>
      </Pressable>

      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>{t("travel.searchTransfer")}</Text>
      </Pressable>

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
          <Pressable
            onPress={() => setPaxOpen(false)}
            style={styles.paxDone}
            accessibilityRole="button"
          >
            <Text style={styles.paxDoneText}>{t("travel.ok")}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  routeStack: { position: "relative", gap: 8 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: BOX,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingRight: 52,
    minHeight: 54,
    ...shadow.soft,
  },
  fieldTo: {},
  input: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
  },
  swapFab: {
    position: "absolute",
    right: 10,
    top: 42,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: {
    width: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: BOX,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 58,
    ...shadow.soft,
  },
  cellBody: { flex: 1, minWidth: 0 },
  cellLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
    marginBottom: 2,
  },
  cellValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  cellValueInput: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    padding: 0,
    margin: 0,
  },
  placeholder: {
    color: colors.inkFaint,
    fontFamily: fonts.bodyMed,
  },
  guests: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  cta: {
    marginTop: 2,
    height: 50,
    borderRadius: BOX,
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
    paddingHorizontal: space.lg,
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
  paxLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  paxName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
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
    marginTop: space.md,
    marginBottom: space.sm,
    height: 48,
    borderRadius: BOX,
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
