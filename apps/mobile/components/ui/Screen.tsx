import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../brand/AppHeader";
import { colors, fonts, radius, space } from "../../lib/theme";

interface ScreenProps {
  children: ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
  style?: ViewStyle;
  /**
   * AppBar göster — her zaman Market standardı.
   * false = AppHeader yok (özel header’lı ekranlar).
   */
  brand?: boolean;
  brandRight?: ReactNode;
  brandBelow?: ReactNode;
  searchPlaceholder?: string;
  onSearchPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export function Screen({
  children,
  edges = ["top"],
  style,
  brand = true,
  brandRight,
  brandBelow,
  searchPlaceholder,
  onSearchPress,
  showBack,
  onBackPress,
}: ScreenProps) {
  const edgesWithoutTop = edges.filter((e) => e !== "top") as ScreenProps["edges"];
  const useBrand = brand;
  const safeEdges = useBrand ? edgesWithoutTop ?? [] : edges;

  return (
    <View style={[styles.root, style]}>
      {useBrand ? (
        <AppHeader
          variant="market"
          right={brandRight}
          below={brandBelow}
          searchPlaceholder={searchPlaceholder}
          onSearchPress={onSearchPress}
          showBack={showBack}
          onBackPress={onBackPress}
        />
      ) : null}
      <SafeAreaView style={styles.screen} edges={safeEdges ?? []}>
        {children}
      </SafeAreaView>
    </View>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  large?: boolean;
  /**
   * Geri — AppHeader Market’te zaten var; varsayılan gizli.
   * Yalnız brand={false} özel ekranlarda showBack={true} kullan.
   */
  showBack?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  large,
  showBack = false,
}: HeaderProps) {
  const backVisible = showBack;

  return (
    <View style={[styles.header, large && styles.headerLarge]}>
      <View style={styles.headerRow}>
        {backVisible ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack ?? (() => router.back())}
            hitSlop={10}
          >
            <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerCenter}>
          <Text style={[styles.title, large && styles.titleLarge]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.rightSlot}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.paper,
  },
  headerLarge: {
    paddingTop: space.md,
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerCenter: { flex: 1 },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  titleLarge: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-end",
    marginLeft: 8,
  },
});
