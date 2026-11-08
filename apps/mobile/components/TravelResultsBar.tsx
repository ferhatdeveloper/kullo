import { Filter, Settings2, Share2 } from "lucide-react-native";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "../lib/theme";

type Props = {
  sortLabel: string;
  filterLabel: string;
  shareLabel?: string;
  shareMessage?: string;
  onSort: () => void;
  onFilter: () => void;
};

/** Ucuzabilet alt bar: Sırala | Filtrele | Paylaş — dikey ikon+metin, reklam yok */
export function TravelResultsBar({
  sortLabel,
  filterLabel,
  shareLabel,
  shareMessage,
  onSort,
  onFilter,
}: Props) {
  const insets = useSafeAreaInsets();
  const showShare = Boolean(shareLabel);

  const onShare = () => {
    void Share.share({
      message: shareMessage ?? shareLabel ?? "",
    });
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <Pressable
        onPress={onSort}
        style={styles.item}
        accessibilityRole="button"
      >
        <Settings2 size={20} color={colors.white} strokeWidth={2} />
        <Text style={styles.label}>{sortLabel}</Text>
      </Pressable>
      <View style={styles.sep} />
      <Pressable
        onPress={onFilter}
        style={styles.item}
        accessibilityRole="button"
      >
        <Filter size={20} color={colors.white} strokeWidth={2} />
        <Text style={styles.label}>{filterLabel}</Text>
      </Pressable>
      {showShare ? (
        <>
          <View style={styles.sep} />
          <Pressable
            onPress={onShare}
            style={styles.item}
            accessibilityRole="button"
          >
            <Share2 size={20} color={colors.white} strokeWidth={2} />
            <Text style={styles.label}>{shareLabel}</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    paddingTop: 10,
    borderTopWidth: 0,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  sep: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.28)",
    marginVertical: 6,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.white,
  },
});
