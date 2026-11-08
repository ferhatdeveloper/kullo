import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FoodExplore } from "../../components/mart/FoodExplore";
import { MartAccount } from "../../components/mart/MartAccount";
import { MartCartPane } from "../../components/mart/MartCartPane";
import MarketHome from "../../components/mart/MarketHome";
import { MartShell, type MartPane } from "../../components/mart/MartShell";
import { useFoodCartStore } from "../../lib/food-cart-store";
import { useMartCartStore } from "../../lib/mart-cart-store";
import { colors } from "../../lib/theme";

const PANES: MartPane[] = ["home", "market", "cart", "account"];

function parsePane(raw: unknown): MartPane {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const s = String(v ?? "home");
  if (s === "food") return "home";
  return (PANES.includes(s as MartPane) ? s : "home") as MartPane;
}

export default function MartScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [pane, setPane] = useState<MartPane>(() => parsePane(params.martPane));

  const hydrateMart = useMartCartStore((s) => s.hydrate);
  const hydrateFood = useFoodCartStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateMart();
    void hydrateFood();
  }, [hydrateMart, hydrateFood]);

  /** Deep-link / dışarıdan gelen params */
  useEffect(() => {
    const next = parsePane(params.martPane);
    setPane((cur) => (cur === next ? cur : next));
  }, [params.martPane]);

  const title = useMemo(() => {
    switch (pane) {
      case "market":
        return t("mart.navMarket");
      case "cart":
        return t("mart.navCart");
      case "account":
        return t("mart.navAccount");
      default:
        return t("mart.navFood");
    }
  }, [pane, t]);

  return (
    <MartShell
      active={pane}
      onPaneChange={setPane}
      title={title}
      hideSubHeader={pane === "home" || pane === "market"}
      /** Ana + Market kendi header’ları (ink-ağır TopBar / Deliver to) */
      brand={pane === "cart" || pane === "account"}
      onExit={() => router.replace("/(tabs)")}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: pane === "market" || pane === "home" ? colors.white : colors.paper,
        }}
      >
        {pane === "home" ? (
          <FoodExplore onGoMarket={() => setPane("market")} onGoCart={() => setPane("cart")} />
        ) : null}
        {pane === "market" ? (
          <MarketHome onGoCart={() => setPane("cart")} onGoAccount={() => setPane("account")} />
        ) : null}
        {pane === "cart" ? (
          <MartCartPane
            onGoMarket={() => setPane("market")}
            onGoFood={() => setPane("home")}
          />
        ) : null}
        {pane === "account" ? <MartAccount /> : null}
      </View>
    </MartShell>
  );
}
