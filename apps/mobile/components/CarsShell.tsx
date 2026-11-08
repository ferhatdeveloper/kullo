import { router } from "expo-router";
import { Heart, Home, Menu, Search, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ViewStyle } from "react-native";

import { VerticalShell, type VerticalTabItem } from "./VerticalShell";
import { CARS_BUY_HREF, CARS_BUY_SEARCH_HREF } from "../lib/cars-routes";

export type CarsPane = "home" | "search" | "sell" | "saved" | "more";

type Props = {
  active: CarsPane;
  children: ReactNode;
  title?: string;
  /** Hide back+title sub-bar (home uses AppHeader brand only) */
  hideSubHeader?: boolean;
  headerRight?: ReactNode;
  style?: ViewStyle;
  onHome?: () => void;
  onSearch?: () => void;
  onSaved?: () => void;
  onMore?: () => void;
  /** Marketplace’e dönüş — varsayılan Ana sekme */
  onExit?: () => void;
};

/** Satın al (Araç al) dikeyi varsayılan giriş — her zaman Ana (hub), filtre değil */
export const CARS_HOME_HREF = CARS_BUY_HREF;

/**
 * Dubicars IA — **satın alma** dikeyi alt menü (kirala ayrı: RentalsShell):
 * Ana · Ara · Sat · Kayıtlı · Daha
 */
export function CarsShell({
  active,
  children,
  title,
  hideSubHeader = false,
  headerRight,
  style,
  onHome,
  onSearch,
  onSaved,
  onMore,
  onExit,
}: Props) {
  const { t } = useTranslation();

  const tabs: VerticalTabItem[] = [
    {
      key: "home",
      label: t("cars.navHome"),
      Icon: Home as LucideIcon,
      active: active === "home",
      onPress: () => {
        if (onHome) onHome();
        else router.replace(CARS_BUY_HREF);
      },
    },
    {
      key: "search",
      label: t("cars.navSearch"),
      Icon: Search as LucideIcon,
      active: active === "search",
      onPress: () => {
        if (onSearch) onSearch();
        else router.replace(CARS_BUY_SEARCH_HREF);
      },
    },
    {
      key: "saved",
      label: t("cars.navSaved"),
      Icon: Heart as LucideIcon,
      active: active === "saved",
      onPress: () => {
        if (onSaved) onSaved();
        else
          router.replace({
            pathname: "/(tabs)/search",
            params: { intent: "buy", carsPane: "saved" },
          });
      },
    },
    {
      key: "more",
      label: t("cars.navMore"),
      Icon: Menu as LucideIcon,
      active: active === "more",
      onPress: () => {
        if (onMore) onMore();
        else
          router.replace({
            pathname: "/(tabs)/search",
            params: { intent: "buy", carsPane: "more" },
          });
      },
    },
  ];

  return (
    <VerticalShell
      title={title ?? t("cars.buyTitle")}
      hideHeader={hideSubHeader}
      onExit={onExit ?? (() => router.replace("/(tabs)"))}
      headerRight={headerRight}
      tabs={tabs}
      style={style}
      navAccent="cars"
    >
      {children}
    </VerticalShell>
  );
}
