import { Stack } from "expo-router";

import { colors } from "../../lib/theme";

export default function TravelLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="flights/search" />
      <Stack.Screen name="flights/results" />
      <Stack.Screen name="bus/search" />
      <Stack.Screen name="bus/results" />
      <Stack.Screen name="private/book" />
    </Stack>
  );
}
