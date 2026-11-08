import { router } from "expo-router";

import { FoodTalabatFlowers } from "../../components/mart/food-talabat";

export default function FlowersScreen() {
  return (
    <FoodTalabatFlowers
      onBack={() => router.back()}
      onGoCart={() => router.push("/food-cart")}
    />
  );
}
