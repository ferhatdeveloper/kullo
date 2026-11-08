import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Building2 } from "lucide-react-native";

import type { DemoProject } from "../lib/demo-agencies";
import { colors, fonts, radius, space } from "../lib/theme";
import { OfflineCover } from "./OfflineCover";

const { width: SCREEN_W } = Dimensions.get("window");
/** Homele: yan kartlar hafif görünsün */
const HERO_GAP = 10;
const HERO_SIDE = 18;
const HERO_W = SCREEN_W - HERO_SIDE * 2 - HERO_GAP;
const HERO_STEP = HERO_W + HERO_GAP;
const HERO_H = 200;
/** Gradient + yazı yalnızca alt şerit — görselin çoğu açık kalsın */
const HERO_FOOTER_H = 64;
const RAIL_CARD_W = SCREEN_W * 0.74;
const RAIL_H = 168;
const RAIL_FOOTER_H = 72;
const AUTO_MS = 4200;

type Props = {
  projects: DemoProject[];
  title: string;
  viewAllLabel: string;
  fromPrice: (p: DemoProject) => string;
  onOpenAll: () => void;
  onOpenProject: (id: string) => void;
};

/** Sadece alt footer’da hafif siyah gradient */
function FooterFade({ id, height }: { id: string; height: number }) {
  const gid = `fade-${id}`;
  return (
    <View style={[styles.fadeWrap, { height }]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0" />
            <Stop offset="0.4" stopColor="#000" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.48" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gid})`} />
      </Svg>
    </View>
  );
}

/** Homele peek-slider — yazılar yalnızca footer’da */
export function ProjectsSlider({
  projects,
  title,
  viewAllLabel,
  fromPrice,
  onOpenAll,
  onOpenProject,
}: Props) {
  const heroRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (projects.length < 2) return;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % projects.length;
      indexRef.current = next;
      setIndex(next);
      heroRef.current?.scrollTo({ x: next * HERO_STEP, animated: true });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [projects.length]);

  const onHeroEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / HERO_STEP);
    const clamped = Math.max(0, Math.min(i, projects.length - 1));
    indexRef.current = clamped;
    setIndex(clamped);
  };

  if (!projects.length) return null;

  return (
    <View style={styles.root}>
      <ScrollView
        ref={heroRef}
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onHeroEnd}
        snapToInterval={HERO_STEP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.heroContent}
      >
        {projects.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.heroCard, { width: HERO_W }]}
            onPress={() => onOpenProject(p.id)}
          >
            <OfflineCover uri={p.cover_url} label={p.name} style={styles.fillImg} />
            <FooterFade id={`hero-${p.id}`} height={HERO_FOOTER_H} />
            <View style={styles.heroFooter}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {p.tagline}
              </Text>
              <Text style={styles.heroMeta} numberOfLines={1}>
                {p.city} · {fromPrice(p)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {projects.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>

      <View style={styles.sectionHead}>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Building2 size={15} color={colors.white} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <View style={styles.titleRule} />
        </View>
        <Pressable style={styles.seeAllBtn} onPress={onOpenAll} hitSlop={8}>
          <Text style={styles.seeAll}>{viewAllLabel}</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        decelerationRate="fast"
        snapToInterval={RAIL_CARD_W + 12}
        snapToAlignment="start"
      >
        {projects.map((p) => (
          <Pressable
            key={`rail-${p.id}`}
            style={styles.railCard}
            onPress={() => onOpenProject(p.id)}
          >
            <OfflineCover uri={p.cover_url} label={p.name} style={styles.fillImg} />
            <FooterFade id={`rail-${p.id}`} height={RAIL_FOOTER_H} />
            <View style={styles.railFooter}>
              <Text style={styles.railMeta} numberOfLines={1}>
                {p.city} · {p.developer}
              </Text>
              <Text style={styles.railName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.railFrom}>{fromPrice(p)}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  heroContent: {
    paddingHorizontal: HERO_SIDE,
    gap: HERO_GAP,
  },
  heroCard: {
    height: HERO_H,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  fillImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  fadeWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroFooter: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 10,
    gap: 1,
  },
  heroTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },
  heroMeta: {
    marginTop: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameMid,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  dotOn: {
    backgroundColor: colors.flame,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    marginTop: 10,
    marginBottom: 2,
  },
  titleBlock: { gap: 6, flexShrink: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  titleRule: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.flame,
    marginLeft: 36,
  },
  seeAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: "#FFD0B8",
  },
  seeAll: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
  },
  rail: {
    paddingHorizontal: space.lg,
    gap: 12,
    paddingBottom: 2,
  },
  railCard: {
    width: RAIL_CARD_W,
    height: RAIL_H,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  railFooter: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    gap: 2,
  },
  railMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.82)",
  },
  railName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
    lineHeight: 18,
  },
  railFrom: {
    marginTop: 2,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flameMid,
  },
});
