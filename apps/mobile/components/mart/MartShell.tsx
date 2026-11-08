import { router } from "expo-router";
import {
  ShoppingBasket,
  Store,
  User,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ViewStyle } from "react-native";

import { VerticalShell, type VerticalTabItem } from "../VerticalShell";

/** home = Yemek (food-talabat); market = M10 MarketHome */
export type MartPane = "home" | "market" | "cart" | "account";

type Props = {
  active: MartPane;
  onPaneChange: (pane: MartPane) => void;
  children: ReactNode;
  title?: string;
  hideSubHeader?: boolean;
  /** false = AppHeader gizle (Food ink header kendi shell’inde) */
  brand?: boolean;
  headerRight?: ReactNode;
  style?: ViewStyle;
  onExit?: () => void;
};

export const MART_HOME_HREF = {
  pathname: "/(tabs)/mart" as const,
  params: { martPane: "home" as const },
};

export function martHref(pane: MartPane) {
  return {
    pathname: "/(tabs)/mart" as const,
    params: { martPane: pane },
  };
}

/**
 * Kullo Mart — Yemek · Market · Sepet · Hesap
 */
export function MartShell({
  active,
  onPaneChange,
  children,
  title,
  hideSubHeader = false,
  brand = true,
  headerRight,
  style,
  onExit,
}: Props) {
  const { t } = useTranslation();

  const go = (pane: MartPane) => {
    onPaneChange(pane);
    try {
      router.setParams({ martPane: pane });
    } catch {
      /* ignore */
    }
  };

  const tabs: VerticalTabItem[] = [
    {
      key: "home",
      label: t("mart.navFood"),
      Icon: UtensilsCrossed as LucideIcon,
      active: active === "home",
      onPress: () => go("home"),
    },
    {
      key: "market",
      label: t("mart.navMarket"),
      Icon: Store as LucideIcon,
      active: active === "market",
      onPress: () => go("market"),
    },
    {
      key: "cart",
      label: t("mart.navCart"),
      Icon: ShoppingBasket as LucideIcon,
      active: active === "cart",
      onPress: () => go("cart"),
    },
    {
      key: "account",
      label: t("mart.navAccount"),
      Icon: User as LucideIcon,
      active: active === "account",
      onPress: () => go("account"),
    },
  ];

  return (
    <VerticalShell
      title={title ?? t("mart.title")}
      hideHeader={hideSubHeader}
      brand={brand}
      onExit={onExit ?? (() => router.replace("/(tabs)"))}
      headerRight={headerRight}
      tabs={tabs}
      style={style}
      navAccent="ink"
    >
      {children}
    </VerticalShell>
  );
}
