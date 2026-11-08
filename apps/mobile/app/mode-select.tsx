import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { ServicesHub } from "../components/ServicesHub";
import { colors } from "../lib/theme";

/**
 * İlk giriş kapısı — alt menü yok, tam ekran hizmetler.
 * Her uygulama açılışında buraya yönlendirilir.
 */
export default function ModeSelectScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ServicesHub />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
});
