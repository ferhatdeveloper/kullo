import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { FoodTalabatStore } from "../../components/mart/food-talabat";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import { colors, fonts, space } from "../../lib/theme";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const restaurant = useMarketplaceStore((s) => s.getRestaurant(id ?? ""));

  if (!restaurant) {
    return (
      <Screen edges={["top"]} brand={false}>
        <ScreenHeader title={t("food.title")} onBack={() => router.back()} />
        <Text style={styles.muted}>{t("food.notFound")}</Text>
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <FoodTalabatStore restaurant={restaurant} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  muted: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
