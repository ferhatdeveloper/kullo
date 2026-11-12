import { router } from "expo-router";
import {
  ChevronLeft,
  type LucideIcon,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export type PartnerTab = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

type Props = {
  title: string;
  subtitle?: string;
  tabs: PartnerTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: ReactNode;
  headerRight?: ReactNode;
  /** Rol seçimine dön */
  onSwitchRole?: () => void;
  /** Tüketici app’e çık */
  onExit?: () => void;
  live?: boolean;
  liveLabel?: string;
};

/**
 * Partner mini-app kabuğu — tüketici AppHeader yok; ink + flame, mobil-first.
 */
export function PartnerShell({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  headerRight,
  onSwitchRole,
  onExit,
  live,
  liveLabel,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const exit = () => {
    if (onExit) onExit();
    else router.replace("/role-select");
  };

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
        <View style={styles.heroTop}>
          <Pressable
            onPress={exit}
            hitSlop={8}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <ChevronLeft size={20} color={colors.white} strokeWidth={2.4} />
          </Pressable>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>{t("partnerHub.brand")}</Text>
            {live ? (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  {liveLabel ?? t("partnerHub.live")}
                </Text>
              </View>
            ) : null}
          </View>
          {headerRight ? <View style={styles.right}>{headerRight}</View> : (
            <View style={styles.rightSpacer} />
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {onSwitchRole ? (
          <Pressable onPress={onSwitchRole} style={styles.switchRole} hitSlop={6}>
            <Text style={styles.switchRoleText}>{t("partnerHub.switchRole")}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>{children}</View>

      <View
        style={[
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 10 : 8) },
        ]}
      >
        {tabs.map((tab) => {
          const on = tab.key === activeTab;
          const Icon = tab.Icon;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => {
                void Haptics.selectionAsync();
                onTabChange(tab.key);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <View style={[styles.tabIconWrap, on && styles.tabIconOn]}>
                <Icon
                  size={20}
                  color={on ? colors.flame : colors.inkFaint}
                  strokeWidth={on ? 2.4 : 2}
                />
              </View>
              <Text style={[styles.tabLabel, on && styles.tabLabelOn]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  brandBlock: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 0.4,
    color: colors.white,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(243,106,28,0.22)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.flame,
  },
  liveText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.flameMid,
  },
  right: { minWidth: 36, alignItems: "flex-end" },
  rightSpacer: { width: 36 },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.white,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  switchRole: { marginTop: space.sm, alignSelf: "flex-start" },
  switchRoleText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameMid,
  },
  body: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 8,
    ...shadow.soft,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconOn: { backgroundColor: colors.flameSoft },
  tabLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkFaint,
  },
  tabLabelOn: {
    color: colors.ink,
    fontFamily: fonts.bodySemi,
  },
});
