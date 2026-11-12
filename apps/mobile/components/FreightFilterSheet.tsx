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
  getLoadCategoryLabel,
  type LoadCategory,
} from "../lib/freight-store";
import { colors, fonts, radius, space } from "../lib/theme";

const CATEGORIES: LoadCategory[] = [
  "construction",
  "food",
  "agriculture",
  "furniture",
  "machinery",
  "general",
  "vehicles",
  "other",
];

export type FreightListFilters = {
  category: LoadCategory | null;
};

type Props = {
  visible: boolean;
  value: FreightListFilters;
  onClose: () => void;
  onApply: (next: FreightListFilters) => void;
};

function Option({
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
      style={[styles.option, selected && styles.optionOn]}
      activeOpacity={0.85}
    >
      <Text style={[styles.optionText, selected && styles.optionTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function FreightFilterSheet({ visible, value, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<FreightListFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ category: null });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headTitleRow}>
            <SlidersHorizontal size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.title}>{t("freight.filtersTitle")}</Text>
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
          <Text style={styles.label}>{t("freight.filterCategory")}</Text>
          <View style={styles.list}>
            <Option
              label={t("freight.allCategories")}
              selected={draft.category == null}
              onPress={() => setDraft({ category: null })}
            />
            {CATEGORIES.map((c) => (
              <Option
                key={c}
                label={getLoadCategoryLabel(c)}
                selected={draft.category === c}
                onPress={() =>
                  setDraft({
                    category: draft.category === c ? null : c,
                  })
                }
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
            <Text style={styles.resetText}>{t("freight.resetFilters")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.9}>
            <Text style={styles.applyText}>{t("freight.applyFilters")}</Text>
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
  },
  label: {
    marginTop: space.sm,
    marginBottom: space.sm,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  list: {
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  optionOn: {
    backgroundColor: colors.flameSoft,
    borderColor: colors.flame,
  },
  optionText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  optionTextOn: { color: colors.flameDeep },
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
