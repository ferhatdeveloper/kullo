import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { offlineImageSource } from "../lib/offline-image-map";
import { colors, fonts, radius } from "../lib/theme";

type Props = {
  uri?: string | null;
  label?: string;
  style?: StyleProp<ViewStyle | ImageStyle>;
  contentFit?: "cover" | "contain";
};

const LOAD_MS = 2500;

/**
 * Offline-safe cover — RN Image (ExpoImage native adapter kırılgan).
 * Bundled map varsa lokal; yoksa remote + timeout/onError → brand placeholder.
 */
export function OfflineCover({ uri, label, style, contentFit = "cover" }: Props) {
  const resolved = offlineImageSource(uri);
  const isLocal = typeof resolved === "number";
  const remoteUri =
    resolved && typeof resolved === "object" && "uri" in resolved ? resolved.uri : null;

  const [status, setStatus] = useState<"loading" | "ok" | "fail">(
    !resolved ? "fail" : isLocal ? "ok" : "loading",
  );

  useEffect(() => {
    if (!resolved) {
      setStatus("fail");
      return undefined;
    }
    if (isLocal) {
      setStatus("ok");
      return undefined;
    }
    setStatus("loading");
    const t = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "fail" : s));
    }, LOAD_MS);
    return () => clearTimeout(t);
  }, [uri, isLocal, remoteUri, resolved]);

  if (status === "fail" || !resolved) {
    return (
      <View style={[styles.fallback, style as StyleProp<ViewStyle>]}>
        <Text style={styles.mark}>kullo</Text>
        {label ? (
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <Image
      source={resolved}
      style={style as StyleProp<ImageStyle>}
      resizeMode={contentFit}
      onError={() => setStatus("fail")}
      onLoad={() => setStatus("ok")}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  mark: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.flame,
    letterSpacing: 0.5,
  },
  label: {
    marginTop: 6,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.white,
    textAlign: "center",
    opacity: 0.85,
  },
});
