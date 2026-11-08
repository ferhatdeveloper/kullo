import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { brandLogoCandidates } from "../lib/brand-logos";
import { colors, fonts } from "../lib/theme";

type Props = {
  name: string;
  /** English name for CDN slug (localized labels break Latin paths) */
  nameEn?: string | null;
  logoUrl?: string | null;
  size?: number;
  style?: ViewStyle;
};

/** Marka logosu — CDN zinciri; yüklenene kadar / hepsi başarısızsa baş harf (asla boş kutu yok) */
export function BrandLogo({ name, nameEn, logoUrl, size = 40, style }: Props) {
  const candidates = brandLogoCandidates(name, logoUrl, nameEn);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIdx(0);
    setLoaded(false);
  }, [name, nameEn, logoUrl]);

  const uri = candidates[idx] ?? null;
  const exhausted = !uri;
  const initial = (name || "?").charAt(0).toUpperCase();
  const box = { width: size, height: size, borderRadius: size * 0.22 };
  const showLetter = exhausted || !loaded;

  return (
    <View
      style={[
        exhausted ? styles.fallback : styles.wrap,
        box,
        style,
      ]}
    >
      {showLetter ? (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      ) : null}
      {uri ? (
        <Image
          key={uri}
          source={{ uri }}
          style={{
            width: size * 0.72,
            height: size * 0.72,
            opacity: loaded ? 1 : 0,
            position: loaded ? "relative" : "absolute",
          }}
          resizeMode="contain"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setIdx((i) => i + 1);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: colors.flameSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontFamily: fonts.display,
    color: colors.flameDeep,
  },
});
