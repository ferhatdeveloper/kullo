import { Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

import type { RealtyKind } from "../lib/demo-data";
import {
  DEFAULT_REALTY_FILTERS,
  REALTY_KIND_ORDER,
  type RealtyFilters,
  type RealtyPurpose,
  type RealtySort,
} from "../lib/realty-filters";
import { colors, fonts, radius, space } from "../lib/theme";

type Props = {
  visible: boolean;
  value: RealtyFilters;
  onClose: () => void;
  onApply: (next: RealtyFilters) => void;
};

const BED_OPTS = [1, 2, 3, 4, 5];
const BATH_OPTS = [1, 2, 3, 4];
const SQM_PRESETS: Array<{ min?: number; max?: number; key: string }> = [
  { max: 80, key: "lt80" },
  { min: 80, max: 120, key: "80_120" },
  { min: 120, max: 200, key: "120_200" },
  { min: 200, key: "gt200" },
];

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

export function RealtyFilterSheet({ visible, value, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<RealtyFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const setPurpose = (purpose: RealtyPurpose) =>
    setDraft((d) => ({ ...d, purpose }));

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ ...DEFAULT_REALTY_FILTERS });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <Text style={styles.title}>{t("search.filters")}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={18} color={colors.inkMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>{t("realty.search")}</Text>
          <View style={styles.searchBox}>
            <Search size={16} color={colors.inkFaint} strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              value={draft.q ?? ""}
              onChangeText={(q) => setDraft((d) => ({ ...d, q }))}
              placeholder={t("realty.searchPlaceholder")}
              placeholderTextColor={colors.inkFaint}
              returnKeyType="search"
            />
          </View>

          <Text style={styles.label}>{t("realty.saleAndRent")}</Text>
          <View style={styles.segment}>
            {(
              [
                ["all", t("realty.purposeAll")],
                ["sale", t("realty.offer.sale")],
                ["rent", t("realty.offer.rent")],
              ] as const
            ).map(([key, label]) => {
              const on = draft.purpose === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPurpose(key)}
                  style={[styles.segmentBtn, on && styles.segmentBtnOn]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t("realty.propertyType")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("realty.allTypes")}
              selected={draft.kind === "all"}
              onPress={() => setDraft((d) => ({ ...d, kind: "all" }))}
            />
            {REALTY_KIND_ORDER.map((kind) => (
              <Chip
                key={kind}
                label={t(`realty.kinds.${kind}`)}
                selected={draft.kind === kind}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    kind: kind as RealtyKind,
                  }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>{t("realty.beds")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("realty.any")}
              selected={draft.beds == null}
              onPress={() => setDraft((d) => ({ ...d, beds: undefined }))}
            />
            {BED_OPTS.map((n) => (
              <Chip
                key={n}
                label={`${n}+`}
                selected={draft.beds === n}
                onPress={() => setDraft((d) => ({ ...d, beds: n }))}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("realty.baths")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("realty.any")}
              selected={draft.baths == null}
              onPress={() => setDraft((d) => ({ ...d, baths: undefined }))}
            />
            {BATH_OPTS.map((n) => (
              <Chip
                key={n}
                label={`${n}+`}
                selected={draft.baths === n}
                onPress={() => setDraft((d) => ({ ...d, baths: n }))}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("realty.area")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("realty.any")}
              selected={draft.minSqm == null && draft.maxSqm == null}
              onPress={() =>
                setDraft((d) => ({ ...d, minSqm: undefined, maxSqm: undefined }))
              }
            />
            {SQM_PRESETS.map((p) => {
              const selected = draft.minSqm === p.min && draft.maxSqm === p.max;
              const label =
                p.min != null && p.max != null
                  ? `${p.min}–${p.max}`
                  : p.max != null
                    ? `<${p.max}`
                    : `${p.min}+`;
              return (
                <Chip
                  key={p.key}
                  label={`${label} m²`}
                  selected={selected}
                  onPress={() =>
                    setDraft((d) => ({ ...d, minSqm: p.min, maxSqm: p.max }))
                  }
                />
              );
            })}
          </View>

          <Text style={styles.label}>{t("realty.furnishLabel")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("realty.any")}
              selected={draft.furnished == null}
              onPress={() => setDraft((d) => ({ ...d, furnished: null }))}
            />
            <Chip
              label={t("realty.furnishedYes")}
              selected={draft.furnished === true}
              onPress={() => setDraft((d) => ({ ...d, furnished: true }))}
            />
            <Chip
              label={t("realty.furnishedNo")}
              selected={draft.furnished === false}
              onPress={() => setDraft((d) => ({ ...d, furnished: false }))}
            />
          </View>

          <Text style={styles.label}>{t("realty.sort")}</Text>
          <View style={styles.row}>
            {(
              [
                ["newest", t("realty.sortNewest")],
                ["price_asc", t("realty.sortPriceAsc")],
                ["price_desc", t("realty.sortPriceDesc")],
                ["sqm_desc", t("realty.sortSqm")],
              ] as Array<[RealtySort, string]>
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
            <Text style={styles.resetText}>{t("realty.reset")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.9}>
            <Text style={styles.applyText}>{t("realty.apply")}</Text>
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.mist,
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: radius.pill,
  },
  segmentBtnOn: { backgroundColor: colors.flame },
  segmentText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  segmentTextOn: { color: colors.white },
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
    backgroundColor: colors.flame,
  },
  applyText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
});
