import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";

import { colors, fonts } from "../../lib/theme";

export type BrandScript = "latin" | "arabic" | "kurdish";

const NAMES: Record<BrandScript, string> = {
  latin: "kullo",
  arabic: "كل شيء",
  kurdish: "هەموو شت",
};

type Props = {
  /** Default UI is always Latin. Splash may cycle scripts. */
  script?: BrandScript;
  size?: number;
  tone?: "light" | "dark";
  style?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
  menStyle?: StyleProp<TextStyle>;
};

export function BrandWordmark({
  script = "latin",
  size = 32,
  tone = "light",
  style,
  nameStyle,
}: Props) {
  const nameColor = tone === "light" ? colors.white : colors.ink;
  const isRtlScript = script === "arabic" || script === "kurdish";
  const label = NAMES[script];

  return (
    <View
      style={[styles.row, isRtlScript && styles.rowRtl, style]}
      accessibilityRole="text"
      accessibilityLabel={`kullo (${script})`}
    >
      <Text
        style={[
          styles.name,
          {
            fontSize: size,
            color: nameColor,
            lineHeight: size * 1.15,
          },
          script === "latin" && styles.nameLatin,
          script !== "latin" && styles.nameRtl,
          nameStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
    maxWidth: "100%",
  },
  rowRtl: {
    flexDirection: "row",
  },
  name: {
    fontFamily: fonts.display,
    letterSpacing: -1,
    flexShrink: 1,
  },
  nameLatin: {
    letterSpacing: -0.5,
  },
  nameRtl: {
    letterSpacing: 0,
    writingDirection: "rtl",
  },
});
