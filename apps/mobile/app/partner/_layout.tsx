import { Stack } from "expo-router";

import { colors } from "../../lib/theme";

export default function PartnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="index" options={{ animation: "fade" }} />
      <Stack.Screen name="role-select" options={{ animation: "fade" }} />
      <Stack.Screen name="driver" />
      <Stack.Screen name="merchant" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="contract" />
    </Stack>
  );
}
