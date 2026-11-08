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
  DEFAULT_HEALTH_FILTERS,
  HEALTH_CITIES,
  HEALTH_CITY_LABEL_KEY,
  HEALTH_SPECIALTIES,
  type HealthCity,
  type HealthListFilters,
  type HealthSpecialty,
  type MeetingType,
} from "../lib/health-catalog";
import { colors, fonts, radius, space } from "../lib/theme";

type Props = {
  visible: boolean;
  value: HealthListFilters;
  onClose: () => void;
  onApply: (next: HealthListFilters) => void;
};

const MEETINGS: Array<MeetingType | null> = [null, "video", "phone", "chat"];

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

export function HealthFilterSheet({ visible, value, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<HealthListFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ ...DEFAULT_HEALTH_FILTERS, q: draft.q });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headTitleRow}>
            <SlidersHorizontal size={16} color={colors.flame} strokeWidth={2.2} />
            <Text style={styles.title}>{t("health.filtersTitle")}</Text>
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
          <Text style={styles.label}>{t("health.filterCity")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("health.cities.all")}
              selected={draft.city == null}
              onPress={() => setDraft((d) => ({ ...d, city: null }))}
            />
            {HEALTH_CITIES.map((c) => (
              <Chip
                key={c}
                label={t(HEALTH_CITY_LABEL_KEY[c])}
                selected={draft.city === c}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    city: (d.city === c ? null : c) as HealthCity | null,
                  }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>{t("health.filterSpecialty")}</Text>
          <View style={styles.row}>
            <Chip
              label={t("health.specialty.all")}
              selected={draft.specialty == null}
              onPress={() => setDraft((d) => ({ ...d, specialty: null }))}
            />
            {HEALTH_SPECIALTIES.map((s) => (
              <Chip
                key={s}
                label={t(`health.specialty.${s}`)}
                selected={draft.specialty === s}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    specialty: (d.specialty === s ? null : s) as HealthSpecialty | null,
                  }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>{t("health.filterMeeting")}</Text>
          <View style={styles.row}>
            {MEETINGS.map((key) => (
              <Chip
                key={String(key)}
                label={
                  key == null ? t("health.meeting.all") : t(`health.meeting.${key}`)
                }
                selected={draft.meetingType === key}
                onPress={() => setDraft((d) => ({ ...d, meetingType: key }))}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
            <Text style={styles.resetText}>{t("health.resetFilters")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.9}>
            <Text style={styles.applyText}>{t("health.applyFilters")}</Text>
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
