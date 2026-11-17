import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { partnerAuth } from "../lib/auth";
import { usePartnerStore } from "../lib/partner-store";
import { colors } from "../lib/theme";

export default function PartnerIndex() {
  const hydrated = usePartnerStore((s) => s.hydrated);
  const role = usePartnerStore((s) => s.role);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await partnerAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
      setAuthChecked(true);
    };
    void checkAuth();
  }, []);

  if (!hydrated || !authChecked) {
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
