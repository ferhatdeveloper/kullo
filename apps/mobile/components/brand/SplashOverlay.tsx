import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { BrandMark } from "./BrandMark";

type Props = {
  visible: boolean;
  onFinish: () => void;
};

const HOLD_MS = 1300;
const FADE_MS = 380;

/** Tek splash — kullo_logo_exact (BrandMark). */
export function SplashOverlay({ visible, onFinish }: Props) {
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.94)).current;
  const doneRef = useRef(false);

  useEffect(() => {
    if (!visible || doneRef.current) return;

    Animated.parallel([
      Animated.timing(markOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(markScale, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      Animated.timing(rootOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, HOLD_MS);

    return () => clearTimeout(t);
  }, [visible, onFinish, rootOpacity, markOpacity, markScale]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.root, { opacity: rootOpacity }]}
      pointerEvents="auto"
    >
      <Animated.View
        style={{
          opacity: markOpacity,
          transform: [{ scale: markScale }],
        }}
      >
        <BrandMark width={220} height={110} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: "#0C2D29",
    alignItems: "center",
    justifyContent: "center",
  },
});
