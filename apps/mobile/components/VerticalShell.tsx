import { router } from "expo-router";
import { ChevronLeft, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "./ui/Screen";
import { colors, fonts, radius, shadow, space } from "../lib/theme";
import { CARS } from "./cars/cars-home.styles";

export type VerticalTabItem = {
  key: string;
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
  /** Orta CTA — turuncu yuvarlak (brand); cars vertical uses flat CirclePlus */
  primary?: boolean;
};

/** brand = flame; ink = Kullo green (Market); cars = Dubicars purple nav pill */
export type VerticalNavAccent = "brand" | "ink" | "cars";

type Props = {
  title: string;
  children: ReactNode;
  /** Ana Kullo’ya dönüş — varsayılan Ana sekme */
  onExit?: () => void;
  tabs?: VerticalTabItem[];
  headerRight?: ReactNode;
  style?: ViewStyle;
  /** Home hub — AppHeader brand only, no back/title strip */
  hideHeader?: boolean;
  /** AppHeader brand şeridi — Market gibi kendi TopBar’ı olan dikeylerde kapat */
  brand?: boolean;
  /** Bottom-nav active/pill colors — cars clones soft purple pill */
  navAccent?: VerticalNavAccent;
};

/**
 * Dikey hub kabuğu — AppBar (Kullo şeridi) korunur.
 * Altında ince geri + başlık; marketplace tab yerine dikey menü.
 */
export function VerticalShell({
  title,
  children,
  onExit,
  tabs,
  headerRight,
  style,
  hideHeader = false,
  brand = true,
  navAccent = "brand",
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const exit = onExit ?? (() => router.replace("/(tabs)"));
  const isCars = navAccent === "cars";
  const isInk = navAccent === "ink";
  const activeColor = isCars ? CARS.purple : isInk ? colors.ink : colors.flame;
  const activePill = isCars ? CARS.purpleSoft : isInk ? colors.brandSoft : colors.flameSoft;
  const primaryBg = isCars ? CARS.purple : isInk ? colors.ink : colors.flame;
  const primaryLabel = isCars ? CARS.purple : isInk ? colors.ink : colors.flameDeep;

  return (
    <Screen brand={brand} edges={brand ? ["top"] : []} style={style}>
      {hideHeader ? null : (
        <View style={styles.subBar}>
          <Pressable
            style={styles.backHit}
            onPress={exit}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <ChevronLeft size={20} color={colors.ink} strokeWidth={2.3} />
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </Pressable>
          {headerRight ? <View style={styles.rightSlot}>{headerRight}</View> : null}
        </View>
      )}

      <View style={[styles.body, isCars && { backgroundColor: CARS.paper }]}>{children}</View>

      {tabs && tabs.length > 0 ? (
        <View
          style={[
            styles.tabBar,
            { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 10 : 8) },
          ]}
        >
          {tabs.map((tab) => {
            if (tab.primary) {
              return (
                <Pressable
                  key={tab.key}
                  style={styles.primaryWrap}
                  onPress={tab.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <View style={[styles.primaryBtn, { backgroundColor: primaryBg }]}>
                    <tab.Icon size={22} color={colors.white} strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.primaryLabel, { color: primaryLabel }]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            }

            const color = tab.active ? activeColor : colors.inkFaint;
            const filled = isCars && tab.active;
            return (
              <Pressable
                key={tab.key}
                style={styles.tab}
                onPress={tab.onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: !!tab.active }}
                accessibilityLabel={tab.label}
              >
                <View
                  style={[
                    styles.iconWrap,
                    isCars && styles.iconWrapCars,
                    tab.active && { backgroundColor: activePill },
                  ]}
                >
                  <tab.Icon
                    size={20}
                    color={color}
                    strokeWidth={tab.active ? 2.4 : 2}
                    fill={filled ? color : "transparent"}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isCars && styles.tabLabelCars,
                    tab.active && { color: activeColor },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingVertical: 4,
    backgroundColor: colors.paper,
    gap: 6,
  },
  backHit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 32,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  rightSlot: {
    flexShrink: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  /** Dubicars measured bar ≈75dp w/ inset; content ≈52–56 + safe */
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 10,
    paddingHorizontal: 2,
    minHeight: 56,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
    minHeight: 54,
  },
  /** Active Home pill — measured ≈48×34 dp soft fill (Dubicars) */
  iconWrap: {
    width: 44,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapCars: {
    width: 52,
    height: 34,
  },
  iconWrapActive: {
    backgroundColor: colors.flameSoft,
  },
  tabLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.inkFaint,
  },
  tabLabelCars: {
    fontSize: 11,
  },
  tabLabelActive: {
    color: colors.flame,
  },
  primaryWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: -10,
    gap: 2,
  },
  primaryBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.float,
  },
  primaryLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.flameDeep,
  },
});
