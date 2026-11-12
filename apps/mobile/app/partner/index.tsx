import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { usePartnerStore } from "../../lib/partner-store";
import { colors } from "../../lib/theme";

/**
 * Partner giriş kapısı — kayıtlı rol varsa doğrudan workspace’e.
 */
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

  if (role === "driver") return <Redirect href="/partner/driver" />;
  if (role === "merchant") return <Redirect href="/partner/merchant" />;
  return <Redirect href="/partner/role-select" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
});
