import {
  Image,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
} from "react-native";

/** Latin-only lockup (Arapça satır yok) — light = açık zemin için, default = koyu zemin. */
const logoLightBg = require("../../assets/brand/kullo-lockup-latin-dark.png");
const logoDarkBg = require("../../assets/brand/kullo-lockup-latin.png");

/** Kaynak PNG en/boy oranı (1024×509). */
const ASPECT = 1024 / 509;

type Size = "sm" | "md" | "lg" | "xl";
/** dark = koyu metin (açık header); light = açık metin (koyu header). */
type Tone = "auto" | "dark" | "light" | "mono-dark" | "mono-light";

/** size = genişlik; yükseklik oranla hesaplanır */
const SIZES: Record<Size, number> = {
  sm: 72,
  md: 96,
  lg: 140,
  xl: 180,
};

type Props = {
  size?: Size | number;
  /** Hero / header — genişlik öncelikli */
  width?: number;
  height?: number;
  tone?: Tone;
  style?: StyleProp<ImageStyle>;
};

/** App mark — kullo wordmark + gülümseme (Arapça yok), local PNG. */
export function BrandMark({
  size = "md",
  width,
  height,
  tone = "light",
  style,
}: Props) {
  const base = typeof size === "number" ? size : SIZES[size];
  const w = width ?? (height != null ? Math.round(height * ASPECT) : base);
  const h = height ?? Math.round(w / ASPECT);
  /** dark/mono-dark → koyu metin (açık zemin); light/default → açık metin. */
  const darkGlyph = tone === "dark" || tone === "mono-dark";

  return (
    <Image
      source={darkGlyph ? logoLightBg : logoDarkBg}
      accessibilityLabel="kullo"
      style={[styles.mark, { width: w, height: h }, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: "transparent",
  },
});
