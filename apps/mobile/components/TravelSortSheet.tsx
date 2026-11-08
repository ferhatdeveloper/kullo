import { Check, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { TravelResultSort } from "../lib/travel";
import { colors, fonts, radius, space } from "../lib/theme";

const SORTS: TravelResultSort[] = ["price_asc", "duration_asc", "depart_asc"];

type Props = {
  visible: boolean;
  value: TravelResultSort;
  onClose: () => void;
  onSelect: (sort: TravelResultSort) => void;
};

export function TravelSortSheet({ visible, value, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.head}>
          <Text style={styles.title}>{t("travel.sortTitle")}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
            <X size={18} color={colors.inkMuted} />
          </Pressable>
        </View>
        {SORTS.map((s) => {
          const on = value === s;
          return (
            <Pressable
              key={s}
              onPress={() => {
                onSelect(s);
                onClose();
              }}
              style={styles.row}
            >
              <Text style={[styles.rowText, on && styles.rowTextOn]}>
                {t(`travel.sort.${s}`)}
              </Text>
              {on ? (
                <Check size={18} color={colors.flame} strokeWidth={2.4} />
              ) : null}
            </Pressable>
          );
        })}
        <Text style={styles.note}>{t("travel.sortNote")}</Text>
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
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: space.md,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  rowTextOn: {
    fontFamily: fonts.bodySemi,
  },
  note: {
    marginTop: space.md,
    marginHorizontal: space.lg,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    lineHeight: 16,
  },
});
