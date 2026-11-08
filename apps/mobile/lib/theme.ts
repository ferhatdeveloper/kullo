/**
 * Kullo brand tokens — deep green lockup + orange accent (kullo_logo_exact).
 */
import { Platform, type ViewStyle } from "react-native";

export const colors = {
  ink: "#0C2D29",
  inkMuted: "#4A4A4A",
  inkFaint: "#8A8A8A",
  line: "#E8E8E8",
  mist: "#F2F2F2",
  paper: "#F7F7F7",
  white: "#FFFFFF",

  /** Logo orange (play tip + smile) */
  flame: "#F36A1C",
  flameMid: "#FB8A3A",
  flameDeep: "#D9550E",
  flameSoft: "#FFF1E6",

  /** Brand green soft — hizmet kartları */
  brandSoft: "#E6F0ED",

  /** Aliases — existing screens use viridian* */
  viridian: "#F36A1C",
  viridianDeep: "#D9550E",
  viridianSoft: "#FFF1E6",

  brass: "#C47A2A",
  brassSoft: "#FFF6EC",
  danger: "#C43C3C",
  overlay: "rgba(10, 10, 10, 0.55)",
  overlaySoft: "rgba(10, 10, 10, 0.28)",
} as const;

export const fonts = {
  display: "Outfit_700Bold",
  displayMed: "Outfit_600SemiBold",
  displayReg: "Outfit_500Medium",
  body: "IBMPlexSans_400Regular",
  bodyMed: "IBMPlexSans_500Medium",
  bodySemi: "IBMPlexSans_600SemiBold",
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  section: 36,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const shadow = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    android: { elevation: 3 },
    default: {},
  })!,
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 1 },
    default: {},
  })!,
  float: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#FF6A00",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  })!,
} as const;
