/**
 * Cars-vertical first page — standalone Dubicars visual clone tokens.
 * Measured from dubicars-first-*.png @ 1080×2412 (density 420 → ÷2.625).
 * Purple accent for cars only; does not touch global theme.
 */
import { Platform, StyleSheet, type ViewStyle } from "react-native";

import { fonts } from "../../lib/theme";

/** Hardcoded cars-home palette (screenshot-measured) */
export const CARS = {
  purple: "#990099",
  purpleSoft: "#E8DEF8",
  purpleMid: "#B84AB8",
  /** Cars home page bg — pure white (Dubicars dealers area) */
  paper: "#FFFFFF",
  white: "#FFFFFF",
  ink: "#1A1A1A",
  inkMuted: "#5C5C5C",
  inkFaint: "#8A8A8A",
  /** Dubicars dealer-card meta grey */
  dealerMeta: "#757575",
  /** Dubicars dealer-card border */
  dealerBorder: "#E0E0E0",
  line: "#E5E5EA",
  searchFill: "#E0E0E0",
  serviceBody: "#F5F5F7",
  mist: "#EEEEF0",
} as const;

export const CARS_HOME = {
  hMargin: 16,
  /** Measured Dubicars ≈22–24dp */
  heroRadius: 22,
  heroMinHeight: 420,
  searchHeight: 48,
  ctaHeight: 48,
  serviceCardWidth: 200,
  serviceImageHeight: 138,
  /** Full-bleed Ana promo (HAVAL etc.) */
  promoHeight: 132,
  promoRadius: 14,
  sectionTitleSize: 17,
  pickWidth: 248,
  pickImageHeight: 168,
  /**
   * Featured dealer CARD — image flush left, text padded right.
   * White card, #E0E0E0 border, radius 9.
   * Left image ~39% full card height (cover, no letterbox).
   */
  dealerCardW: 312,
  dealerCardH: 116,
  dealerPad: 12,
  /** ~39% of 312 — full-bleed media pane */
  dealerImgW: 122,
  dealerImgH: 116,
  dealerRadius: 9,
  dealerRailGap: 10,
  dealerBlockGap: 28,
  dealerLogo: 26,
  navPillH: 34,
  navPillW: 52,
} as const;

const softShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 2 },
  default: {},
})!;

const cardShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
  default: {},
})!;

export const carsHomeStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CARS.paper,
  },
  pad: {
    paddingBottom: 36,
    backgroundColor: CARS.paper,
  },

  /* —— Hero —— */
  hero: {
    marginHorizontal: CARS_HOME.hMargin,
    marginTop: 10,
    marginBottom: 28,
    borderRadius: CARS_HOME.heroRadius,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 88,
    paddingBottom: 18,
    minHeight: CARS_HOME.heroMinHeight,
    justifyContent: "flex-end",
    gap: 14,
    ...cardShadow,
  },
  heroImage: {
    borderRadius: CARS_HOME.heroRadius,
  },
  heroScrimTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,8,12,0.18)",
  },
  heroScrimBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "52%",
    backgroundColor: "rgba(8,8,12,0.58)",
  },
  heroCopy: {
    gap: 6,
    marginBottom: 4,
  },
  heroLead: {
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: CARS.white,
    letterSpacing: -0.1,
  },
  heroFind: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: CARS.white,
    letterSpacing: -0.7,
    lineHeight: 36,
  },
  heroAccent: {
    color: CARS.purple,
    fontFamily: fonts.display,
  },
  heroSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CARS.searchFill,
    borderRadius: 999,
    paddingHorizontal: 18,
    height: CARS_HOME.searchHeight,
  },
  heroSearchText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: CARS.inkMuted,
  },
  heroCta: {
    backgroundColor: CARS.purple,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    height: CARS_HOME.ctaHeight,
  },
  heroCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: CARS.white,
  },

  /* —— Sections —— */
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: CARS_HOME.sectionTitleSize,
    color: CARS.ink,
    letterSpacing: -0.25,
    marginHorizontal: CARS_HOME.hMargin,
    marginBottom: 12,
  },
  sectionTitleFlush: {
    fontFamily: fonts.displayMed,
    fontSize: CARS_HOME.sectionTitleSize,
    color: CARS.ink,
    letterSpacing: -0.25,
    flex: 1,
  },

  /* —— Smart services —— */
  servicesRail: {
    paddingHorizontal: CARS_HOME.hMargin,
    gap: 12,
    marginBottom: 28,
  },
  serviceCard: {
    width: CARS_HOME.serviceCardWidth,
    backgroundColor: CARS.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARS.line,
    ...softShadow,
  },
  serviceImage: {
    width: "100%",
    height: CARS_HOME.serviceImageHeight,
    backgroundColor: CARS.mist,
  },
  serviceBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
    backgroundColor: CARS.serviceBody,
    minHeight: 78,
  },
  serviceTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: CARS.ink,
  },
  serviceHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: CARS.inkFaint,
    lineHeight: 16,
  },

  /* —— Promo banner (after Smart services) —— */
  promoWrap: {
    marginHorizontal: CARS_HOME.hMargin,
    marginBottom: 28,
    height: CARS_HOME.promoHeight,
    borderRadius: CARS_HOME.promoRadius,
    overflow: "hidden",
    backgroundColor: CARS.mist,
  },
  promoImage: {
    width: "100%",
    height: "100%",
  },

  /* —— Top picks —— */
  block: {
    marginBottom: 24,
  },
  blockHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: CARS_HOME.hMargin,
    marginBottom: 12,
    gap: 8,
  },
  /** Purple “Tümü >” — right-aligned, cars accent #990099 */
  seeAllHit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    marginLeft: "auto",
  },
  seeAll: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: CARS.purple,
    letterSpacing: -0.1,
  },
  picksRail: {
    paddingHorizontal: CARS_HOME.hMargin,
    gap: 12,
  },
  pickCard: {
    width: CARS_HOME.pickWidth,
    backgroundColor: CARS.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARS.line,
    ...softShadow,
  },
  pickImageWrap: {
    position: "relative",
  },
  pickImage: {
    width: "100%",
    height: CARS_HOME.pickImageHeight,
    backgroundColor: CARS.mist,
  },
  pickBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: CARS.purple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pickBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: CARS.white,
  },
  pickBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 2,
  },
  pickTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: CARS.ink,
    letterSpacing: -0.2,
  },
  pickPrice: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 16,
    color: CARS.ink,
    letterSpacing: -0.3,
  },
  pickMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: CARS.inkFaint,
  },

  /* —— Featured dealers — 1:1 LMG Motors close-up card —— */
  dealersHeading: {
    marginHorizontal: CARS_HOME.hMargin,
    marginBottom: 16,
    flex: undefined,
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: CARS.ink,
    letterSpacing: -0.3,
    backgroundColor: CARS.white,
  },
  dealerBlock: {
    marginBottom: CARS_HOME.dealerBlockGap,
    backgroundColor: CARS.white,
  },
  /** Bold dealer name ABOVE the card — no chrome */
  dealerNameOnly: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: CARS.ink,
    letterSpacing: -0.15,
    paddingHorizontal: CARS_HOME.hMargin,
    marginBottom: 10,
  },
  dealerRail: {
    paddingHorizontal: CARS_HOME.hMargin,
    gap: CARS_HOME.dealerRailGap,
    paddingRight: CARS_HOME.hMargin + 8,
  },
  /**
   * Landscape white card:
   * #E0E0E0 border, radius 9, no shadow.
   * Row: full-height cover image ~39% | padded text column.
   */
  dealerRow: {
    flexDirection: "row",
    alignItems: "stretch",
    width: CARS_HOME.dealerCardW,
    height: CARS_HOME.dealerCardH,
    backgroundColor: CARS.white,
    borderRadius: CARS_HOME.dealerRadius,
    borderWidth: 1,
    borderColor: CARS.dealerBorder,
    overflow: "hidden",
  },
  /** Left ~39% — flush full card height; left corners via parent overflow */
  dealerImgWrap: {
    width: CARS_HOME.dealerImgW,
    height: CARS_HOME.dealerImgH,
    backgroundColor: CARS.mist,
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: CARS_HOME.dealerRadius - 1,
    borderBottomLeftRadius: CARS_HOME.dealerRadius - 1,
    flexShrink: 0,
  },
  /** Explicit dp size — Android cover needs concrete width/height */
  dealerThumb: {
    width: CARS_HOME.dealerImgW,
    height: CARS_HOME.dealerImgH,
  },
  /** Small dealer initials — top-right of image pane */
  dealerLogoWrap: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 2,
  },
  dealerLogo: {
    width: CARS_HOME.dealerLogo,
    height: CARS_HOME.dealerLogo,
    borderRadius: 3,
    backgroundColor: CARS.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARS.dealerBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dealerLogoText: {
    fontFamily: fonts.bodySemi,
    fontSize: 9,
    color: CARS.ink,
    letterSpacing: -0.2,
  },
  /** Right text — vertically centered, padded away from media */
  dealerRowBody: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
    minWidth: 0,
    paddingHorizontal: CARS_HOME.dealerPad,
    paddingVertical: 10,
  },
  dealerRowTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: CARS.ink,
    letterSpacing: -0.2,
  },
  dealerRowPrice: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: CARS.ink,
    letterSpacing: -0.15,
    marginTop: 1,
  },
  dealerRowMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: CARS.dealerMeta,
    marginTop: 3,
  },

  bottomPad: { height: 20 },
});
