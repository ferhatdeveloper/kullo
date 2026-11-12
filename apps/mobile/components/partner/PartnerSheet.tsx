import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, radius, space } from "../../lib/theme";

type Option = {
  key: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: Option[];
  selected?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  footer?: ReactNode;
  style?: ViewStyle;
};

/**
 * Tek sheet — chip satırı yerine filtre / seçim.
 */
export function PartnerSheet({
  visible,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  onClose,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.list}>
          {options.map((opt) => {
            const on = selected === opt.key;
            return (
              <Pressable
                key={opt.key}
                disabled={opt.disabled}
                onPress={() => {
                  if (opt.disabled) return;
                  onSelect(opt.key);
                  onClose();
                }}
                style={[
                  styles.row,
                  on && styles.rowOn,
                  opt.disabled && styles.rowDisabled,
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, on && styles.rowLabelOn]}>
                    {opt.label}
                  </Text>
                  {opt.hint ? (
                    <Text style={styles.rowHint}>{opt.hint}</Text>
                  ) : null}
                </View>
                <View style={[styles.dot, on && styles.dotOn]} />
              </Pressable>
            );
          })}
        </View>
        {footer}
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
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: space.md,
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: space.sm,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
  },
  list: { gap: 8, marginTop: space.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  rowOn: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  rowDisabled: { opacity: 0.45 },
  rowText: { flex: 1, paddingRight: space.md },
  rowLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  rowLabelOn: { color: colors.ink },
  rowHint: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.line,
  },
  dotOn: {
    borderColor: colors.ink,
    backgroundColor: colors.flame,
  },
});
