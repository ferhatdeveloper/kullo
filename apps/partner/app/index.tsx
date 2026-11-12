import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { usePartnerStore } from "../lib/partner-store";
import { colors } from "../lib/theme";

export default function PartnerIndex() {
  const hydrated = usePartnerStore((s) => s.hydrated);
  const role = usePartnerStore((s) => s.role);

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.flame} />
      </View>
    );
  }

  if (role === "driver") return <Redirect href="/driver" />;
  if (role === "merchant") return <Redirect href="/merchant" />;
  return <Redirect href="/role-select" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
});
