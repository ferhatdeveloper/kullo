import { SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DEFAULT_TRAVEL_FILTERS,
  type TravelListFilters,
  type TravelMode,
  type TravelResultSort,
} from "../lib/travel";
import { colors, fonts, radius, space } from "../lib/theme";

type Props = {
  visible: boolean;
  mode: TravelMode;
  value: TravelListFilters;
  onClose: () => void;
  onApply: (next: TravelListFilters) => void;
};

const STOPS: Array<0 | 1 | 2 | null> = [null, 0, 1, 2];
const SORTS: TravelResultSort[] = ["price_asc", "duration_asc", "depart_asc"];
const PRICE_CAPS = [null, 100_000, 200_000, 350_000, 500_000] as const;

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function TravelFilterSheet({
  visible,
  mode,
  value,
  onClose,
  onApply,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TravelListFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ ...DEFAULT_TRAVEL_FILTERS });

  const cabinOptions =
    mode === "flight"
      ? [null, "economy", "business"]
      : mode === "bus"
        ? [null, "standard", "vip"]
        : [null];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headTitleRow}>
            <SlidersHorizontal size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.title}>{t("travel.filtersTitle")}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={18} color={colors.inkMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>{t("travel.filterStops")}</Text>
          <View style={styles.row}>
            {STOPS.map((s) => (
              <Chip
                key={String(s)}
                label={
                  s == null
                    ? t("travel.stopsAny")
                    : s === 0
                      ? t("travel.stopsDirect")
                      : t("travel.stopsMax", { n: s })
                }
                selected={draft.maxStops === s}
                onPress={() => setDraft((d) => ({ ...d, maxStops: s }))}
              />
            ))}
          </View>

          {mode !== "private" ? (
            <>
              <Text style={styles.label}>
                {mode === "flight"
                  ? t("travel.filterCabin")
                  : t("travel.filterSeat")}
              </Text>
              <View style={styles.row}>
                {cabinOptions.map((c) => (
                  <Chip
                    key={String(c)}
                    label={
                      c == null
                        ? t("travel.any")
                        : t(`travel.class.${c}`)
                    }
                    selected={draft.cabinOrSeat === c}
                    onPress={() =>
                      setDraft((d) => ({ ...d, cabinOrSeat: c }))
                    }
                  />
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.label}>{t("travel.filterPrice")}</Text>
          <View style={styles.row}>
            {PRICE_CAPS.map((p) => (
              <Chip
                key={String(p)}
                label={
                  p == null
                    ? t("travel.any")
                    : t("travel.priceUpTo", { n: p.toLocaleString("tr-TR") })
                }
                selected={draft.maxPrice === p}
                onPress={() => setDraft((d) => ({ ...d, maxPrice: p }))}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("travel.filterSort")}</Text>
          <View style={styles.row}>
            {SORTS.map((s) => (
              <Chip
                key={s}
                label={t(`travel.sort.${s}`)}
                selected={draft.sort === s}
                onPress={() => setDraft((d) => ({ ...d, sort: s }))}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={reset} style={styles.resetBtn}>
            <Text style={styles.resetText}>{t("travel.resetFilters")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={apply} style={styles.applyBtn}>
            <Text style={styles.applyText}>{t("travel.applyFilters")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
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
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  headTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
  body: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: 4 },
  label: {
    marginTop: space.md,
    marginBottom: space.sm,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextOn: { color: colors.white },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
  resetText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  applyBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.flame,
  },
  applyText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
});
