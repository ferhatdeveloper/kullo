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
  DEFAULT_HOTEL_FILTERS,
  HOTEL_CITIES,
  HOTEL_CITY_LABEL_KEY,
  HOTEL_FILTER_AMENITIES,
  HOTEL_PRICE_PRESETS,
  type HotelAmenity,
  type HotelCity,
  type HotelListFilters,
  type HotelSort,
} from "../lib/hotels-catalog";
import { colors, fonts, radius, space } from "../lib/theme";

type Props = {
  visible: boolean;
  value: HotelListFilters;
  onClose: () => void;
  onApply: (next: HotelListFilters) => void;
};

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

export function HotelFilterSheet({ visible, value, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<HotelListFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const toggleAmenity = (a: HotelAmenity) => {
    setDraft((d) => {
      const cur = d.amenities ?? [];
      const next = cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a];
      return { ...d, amenities: next };
    });
  };

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ ...DEFAULT_HOTEL_FILTERS, q: draft.q });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headTitleRow}>
            <SlidersHorizontal size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.title}>{t("hotels.filtersTitle")}</Text>
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
          <Text style={styles.label}>{t("hotels.filterCity")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("hotels.cities.all")}
              selected={draft.city == null}
              onPress={() => setDraft((d) => ({ ...d, city: null }))}
            />
            {HOTEL_CITIES.map((c) => (
              <Chip
                key={c}
                label={t(HOTEL_CITY_LABEL_KEY[c])}
                selected={draft.city === c}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    city: (d.city === c ? null : c) as HotelCity | null,
                  }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>{t("hotels.filterPrice")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("hotels.any")}
              selected={draft.minPrice == null && draft.maxPrice == null}
              onPress={() =>
                setDraft((d) => ({ ...d, minPrice: null, maxPrice: null }))
              }
            />
            {HOTEL_PRICE_PRESETS.map((p) => {
              const selected =
                draft.minPrice === (p.min ?? null) &&
                draft.maxPrice === (p.max ?? null);
              return (
                <Chip
                  key={p.key}
                  label={t(`hotels.pricePreset.${p.key}`)}
                  selected={selected}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      minPrice: p.min ?? null,
                      maxPrice: p.max ?? null,
                    }))
                  }
                />
              );
            })}
          </View>

          <Text style={styles.label}>{t("hotels.filterStars")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("hotels.any")}
              selected={draft.minStars == null}
              onPress={() => setDraft((d) => ({ ...d, minStars: null }))}
            />
            {([3, 4, 5] as const).map((n) => (
              <Chip
                key={n}
                label={`${n}+ ★`}
                selected={draft.minStars === n}
                onPress={() => setDraft((d) => ({ ...d, minStars: n }))}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("hotels.filterAmenities")}</Text>
          <View style={styles.row}>
            {HOTEL_FILTER_AMENITIES.map((a) => (
              <Chip
                key={a}
                label={t(`hotels.amenity.${a}`)}
                selected={(draft.amenities ?? []).includes(a)}
                onPress={() => toggleAmenity(a)}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("hotels.filterSort")}</Text>
          <View style={styles.row}>
            {(
              [
                ["rating_desc", t("hotels.sortRating")],
                ["price_asc", t("hotels.sortPriceAsc")],
                ["price_desc", t("hotels.sortPriceDesc")],
              ] as Array<[HotelSort, string]>
            ).map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                selected={draft.sort === key}
                onPress={() => setDraft((d) => ({ ...d, sort: key }))}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
            <Text style={styles.resetText}>{t("hotels.resetFilters")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.9}>
            <Text style={styles.applyText}>{t("hotels.applyFilters")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.45)",
  },
  sheet: {
    marginTop: "auto",
    maxHeight: "88%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  headTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    gap: 4,
  },
  label: {
    marginTop: space.md,
    marginBottom: space.sm,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: {
    backgroundColor: colors.flameSoft,
    borderColor: colors.flame,
  },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextOn: { color: colors.flameDeep },
  footer: {
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  resetBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.mist,
  },
  resetText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.inkMuted,
  },
  applyBtn: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  applyText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
});
