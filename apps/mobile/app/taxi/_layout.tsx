import { Stack } from "expo-router";

import { colors } from "../../lib/theme";

export default function TaxiLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="book" />
    </Stack>
  );
}
