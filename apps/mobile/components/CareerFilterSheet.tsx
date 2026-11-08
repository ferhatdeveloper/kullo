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
  CAREER_CATEGORIES,
  CAREER_CITIES,
  CAREER_CITY_LABEL_KEY,
  DEFAULT_CAREER_FILTERS,
  type CareerCategory,
  type CareerCity,
  type CareerListFilters,
  type CareerSort,
  type EmploymentType,
  type WorkModel,
} from "../lib/career-catalog";
import { colors, fonts, radius, space } from "../lib/theme";

type Props = {
  visible: boolean;
  value: CareerListFilters;
  onClose: () => void;
  onApply: (next: CareerListFilters) => void;
};

const EMPLOYMENT: Array<EmploymentType | null> = [
  null,
  "full_time",
  "part_time",
  "contract",
  "internship",
];

const WORK_MODELS: Array<WorkModel | null> = [null, "office", "hybrid", "remote"];

const SORTS: CareerSort[] = ["featured", "recommended", "newest", "oldest"];

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

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.radioLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export function CareerFilterSheet({ visible, value, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<CareerListFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ ...DEFAULT_CAREER_FILTERS, q: draft.q });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headTitleRow}>
            <SlidersHorizontal size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.title}>{t("career.filtersTitle")}</Text>
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
          <Text style={styles.label}>{t("career.filterSort")}</Text>
          {SORTS.map((key) => (
            <RadioRow
              key={key}
              label={t(`career.sort.${key}`)}
              selected={draft.sort === key}
              onPress={() => setDraft((d) => ({ ...d, sort: key }))}
            />
          ))}

          <Text style={styles.label}>{t("career.filterCity")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("career.cities.all")}
              selected={draft.city == null}
              onPress={() => setDraft((d) => ({ ...d, city: null }))}
            />
            {CAREER_CITIES.map((c) => (
              <Chip
                key={c}
                label={t(CAREER_CITY_LABEL_KEY[c])}
                selected={draft.city === c}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    city: (d.city === c ? null : c) as CareerCity | null,
                  }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>{t("career.filterWorkModel")}</Text>
          <View style={styles.row}>
            {WORK_MODELS.map((key) => (
              <Chip
                key={String(key)}
                label={
                  key == null
                    ? t("career.workModel.all")
                    : t(`career.workModel.${key}`)
                }
                selected={draft.workModel === key}
                onPress={() => setDraft((d) => ({ ...d, workModel: key }))}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("career.filterCategory")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("career.category.all")}
              selected={draft.category == null}
              onPress={() => setDraft((d) => ({ ...d, category: null }))}
            />
            {CAREER_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={t(`career.category.${c}`)}
                selected={draft.category === c}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    category: (d.category === c ? null : c) as CareerCategory | null,
                  }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>{t("career.filterEmployment")}</Text>
          <View style={styles.row}>
            {EMPLOYMENT.map((key) => (
              <Chip
                key={String(key)}
                label={
                  key == null
                    ? t("career.employment.all")
                    : t(`career.employment.${key}`)
                }
                selected={draft.employment === key}
                onPress={() => setDraft((d) => ({ ...d, employment: key }))}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
            <Text style={styles.resetText}>{t("career.resetFilters")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.9}>
            <Text style={styles.applyText}>{t("career.applyFilters")}</Text>
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
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  radioLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: colors.ink },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.ink,
  },
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
