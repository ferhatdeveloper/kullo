import { router } from "expo-router";
import {
  CalendarCheck,
  Heart,
  Home,
  Menu,
  Search,
  type LucideIcon,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ViewStyle } from "react-native";

import { VerticalShell, type VerticalTabItem } from "./VerticalShell";
import { CARS_RENT_HREF, CARS_RENT_SEARCH_HREF } from "../lib/cars-routes";

export type RentalsPane = "home" | "search" | "book" | "saved" | "more";

type Props = {
  active: RentalsPane;
  children: ReactNode;
  title?: string;
  hideSubHeader?: boolean;
  headerRight?: ReactNode;
  style?: ViewStyle;
  onHome?: () => void;
  onSearch?: () => void;
  onBook?: () => void;
  onSaved?: () => void;
  onMore?: () => void;
  onExit?: () => void;
};

/**
 * Kirala dikeyi alt menü — buy CarsShell’den tamamen ayrı.
 * Ana · Ara · Rezerve · Kayıtlı · Daha
 */
export function RentalsShell({
  active,
  children,
  title,
  hideSubHeader = false,
  headerRight,
  style,
  onHome,
  onSearch,
  onBook,
  onSaved,
  onMore,
  onExit,
}: Props) {
  const { t } = useTranslation();

  const tabs: VerticalTabItem[] = [
    {
      key: "home",
      label: t("rentals.navHome"),
      Icon: Home as LucideIcon,
      active: active === "home",
      onPress: () => {
        if (onHome) onHome();
        else router.replace(CARS_RENT_HREF);
      },
    },
    {
      key: "search",
      label: t("rentals.navSearch"),
      Icon: Search as LucideIcon,
      active: active === "search",
      onPress: () => {
        if (onSearch) onSearch();
        else router.replace(CARS_RENT_SEARCH_HREF);
      },
    },
    {
      key: "book",
      label: t("rentals.navBook"),
      Icon: CalendarCheck as LucideIcon,
      active: active === "book",
      onPress: () => {
        if (onBook) onBook();
        else
          router.replace({
            pathname: "/(tabs)/rentals",
            params: { intent: "rent", rentPane: "book" },
          });
      },
    },
    {
      key: "saved",
      label: t("rentals.navSaved"),
      Icon: Heart as LucideIcon,
      active: active === "saved",
      onPress: () => {
        if (onSaved) onSaved();
        else
          router.replace({
            pathname: "/(tabs)/rentals",
            params: { intent: "rent", rentPane: "saved" },
          });
      },
    },
    {
      key: "more",
      label: t("rentals.navMore"),
      Icon: Menu as LucideIcon,
      active: active === "more",
      onPress: () => {
        if (onMore) onMore();
        else
          router.replace({
            pathname: "/(tabs)/rentals",
            params: { intent: "rent", rentPane: "more" },
          });
      },
    },
  ];

  return (
    <VerticalShell
      title={title ?? t("rentals.title")}
      hideHeader={hideSubHeader}
      onExit={onExit ?? (() => router.replace("/(tabs)"))}
      headerRight={headerRight}
      tabs={tabs}
      style={style}
      navAccent="brand"
    >
      {children}
    </VerticalShell>
  );
}
