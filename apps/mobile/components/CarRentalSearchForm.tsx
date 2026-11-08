import { CalendarDays, Clock, MapPin } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, fonts, shadow } from "../lib/theme";

export type CarRentalDraft = {
  pickup: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  differentDropoff: boolean;
};

type Props = {
  initial?: Partial<CarRentalDraft>;
  onSubmit: (draft: CarRentalDraft) => void;
};

const BOX = 10;
const DEFAULT_DATE = "2026-11-20";

function formatDay(iso: string, lang: "tr" | "en") {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

export function CarRentalSearchForm({ initial, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const [pickup, setPickup] = useState(initial?.pickup ?? "");
  const [pickupDate, setPickupDate] = useState(
    initial?.pickupDate ?? DEFAULT_DATE,
  );
  const [pickupTime, setPickupTime] = useState(initial?.pickupTime ?? "10:00");
  const [returnDate, setReturnDate] = useState(
    initial?.returnDate ?? "2026-11-22",
  );
  const [returnTime, setReturnTime] = useState(initial?.returnTime ?? "10:00");
  const [differentDropoff, setDifferentDropoff] = useState(
    initial?.differentDropoff ?? false,
  );

  const submit = () => {
    onSubmit({
      pickup: pickup.trim(),
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      differentDropoff,
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <MapPin size={18} color={colors.inkFaint} strokeWidth={2} />
        <TextInput
          value={pickup}
          onChangeText={setPickup}
          placeholder={t("travel.carPickupPlaceholder")}
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
        />
      </View>

      <View style={styles.grid}>
        <View style={[styles.cell, styles.cellWide]}>
          <CalendarDays size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.carPickupDate")}</Text>
            <Text style={styles.cellValue} numberOfLines={1}>
              {formatDay(pickupDate, lang)}
            </Text>
          </View>
        </View>
        <View style={styles.cell}>
          <Clock size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.carPickupTime")}</Text>
            <TextInput
              value={pickupTime}
              onChangeText={setPickupTime}
              style={styles.cellValueInput}
              placeholder="10:00"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
        </View>
        <View style={[styles.cell, styles.cellWide]}>
          <CalendarDays size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.carReturnDate")}</Text>
            <Text style={styles.cellValue} numberOfLines={1}>
              {formatDay(returnDate, lang)}
            </Text>
          </View>
        </View>
        <View style={styles.cell}>
          <Clock size={15} color={colors.inkFaint} strokeWidth={2} />
          <View style={styles.cellBody}>
            <Text style={styles.cellLabel}>{t("travel.carReturnTime")}</Text>
            <TextInput
              value={returnTime}
              onChangeText={setReturnTime}
              style={styles.cellValueInput}
              placeholder="10:00"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{t("travel.carDifferentDropoff")}</Text>
        <Switch
          value={differentDropoff}
          onValueChange={setDifferentDropoff}
          trackColor={{ false: colors.line, true: colors.flameMid }}
          thumbColor={colors.white}
        />
      </View>

      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>{t("travel.searchCar")}</Text>
      </Pressable>
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
    borderRadius: BOX,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 54,
    ...shadow.soft,
  },
  input: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
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
  cellWide: {},
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  toggleLabel: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
    paddingRight: 12,
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
});
