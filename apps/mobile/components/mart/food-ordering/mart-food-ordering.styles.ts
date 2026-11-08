/**
 * Food Ana — JSMastery food_ordering IA/layout (open source).
 * Ref: https://github.com/adrianhajdin/food_ordering
 * Brand: Kullo flame/ink/paper — not FE8C00 primary clone.
 * Separate from mart-food.styles.ts (Path C hybrid).
 */
import { Dimensions, Platform, StyleSheet, type ViewStyle } from "react-native";

import { colors, fonts, radius, shadow } from "../../../lib/theme";

const { width: W } = Dimensions.get("window");

export const FO = {
  ink: colors.ink,
  inkMuted: colors.inkMuted,
  inkFaint: colors.inkFaint,
  paper: colors.white,
  surface: colors.white,
  mist: colors.mist,
  line: colors.line,
  flame: colors.flame,
  flameDeep: colors.flameDeep,
  flameMid: colors.flameMid,
  flameSoft: colors.flameSoft,
  white: colors.white,
  star: "#F5A623",
  success: "#2F9B65",
  cartBadge: colors.flame,
  hMargin: 20,
  offerH: 192,
  cardGap: 14,
  menuCardW: (W - 20 * 2 - 14) / 2,
} as const;

/** Offer card fills — food_ordering palette remapped to Kullo ink/flame */
export const OFFER_COLORS = [
  colors.flameDeep,
  colors.flame,
  colors.ink,
  "#C47A2A",
] as const;

const soft: ViewStyle = shadow.soft;
const card: ViewStyle = shadow.card;

export const foStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FO.paper,
  },
  list: {
    paddingHorizontal: FO.hMargin,
    paddingBottom: 48,
    gap: FO.cardGap,
  },
  header: {
    gap: 18,
    marginBottom: 8,
    paddingTop: 12,
  },

  /* —— Title row + cart (search tab pattern) —— */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: FO.flame,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: FO.ink,
    letterSpacing: -0.2,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FO.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: FO.cartBadge,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: FO.white,
  },

  /* —— SearchBar (rounded-full + soft shadow) —— */
  searchbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FO.surface,
    borderRadius: radius.pill,
    paddingLeft: 18,
    paddingRight: 16,
    height: 52,
    gap: 10,
    ...soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: FO.ink,
    paddingVertical: 0,
  },

  /* —— Category Filter chips —— */
  filterRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: FO.surface,
    ...soft,
  },
  filterOn: {
    backgroundColor: FO.flame,
  },
  filterMarket: {
    backgroundColor: FO.flameSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FO.flame,
  },
  filterText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: FO.inkFaint,
  },
  filterTextOn: {
    color: FO.white,
    fontFamily: fonts.bodySemi,
  },
  filterTextMarket: {
    color: FO.flameDeep,
    fontFamily: fonts.bodySemi,
  },

  /* —— Offer cards (home FlatList pattern) —— */
  offersBlock: {
    gap: 4,
  },
  offerCard: {
    width: "100%",
    height: FO.offerH,
    marginVertical: 6,
    borderRadius: radius.md,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    ...card,
  },
  offerCardReverse: {
    flexDirection: "row-reverse",
  },
  offerImgWrap: {
    width: "50%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  offerCover: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  offerInfo: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    gap: 12,
  },
  offerInfoPadL: {
    paddingLeft: 20,
    paddingRight: 12,
  },
  offerInfoPadR: {
    paddingRight: 20,
    paddingLeft: 12,
  },
  offerTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: FO.white,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  offerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* —— Section —— */
  sectionHead: {
    marginTop: 8,
    marginBottom: 4,
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: FO.ink,
    letterSpacing: -0.2,
  },
  countHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: FO.inkFaint,
    marginTop: 2,
    marginBottom: 8,
  },

  /* —— 2-col MenuCard-style restaurant cards —— */
  gridRow: {
    flexDirection: "row",
    gap: FO.cardGap,
    marginBottom: 28,
  },
  menuCard: {
    width: FO.menuCardW,
    backgroundColor: FO.surface,
    borderRadius: 24,
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    ...card,
    ...(Platform.OS === "android"
      ? { elevation: 6, shadowColor: "#878787" }
      : null),
  },
  menuCardOffset: {
    marginTop: 28,
  },
  menuImgWrap: {
    position: "absolute",
    top: -28,
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    backgroundColor: FO.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCover: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  menuName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: FO.ink,
    textAlign: "center",
    marginBottom: 4,
  },
  menuMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: FO.inkFaint,
    textAlign: "center",
    marginBottom: 10,
  },
  menuCta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: FO.flame,
  },
  empty: {
    textAlign: "center",
    marginTop: 28,
    fontFamily: fonts.body,
    color: FO.inkFaint,
  },
});
