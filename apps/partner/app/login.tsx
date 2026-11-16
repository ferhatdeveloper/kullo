import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, Phone } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { partnerAuth } from "../lib/auth";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Hata", "Telefon ve şifre gerekli");
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    const result = await partnerAuth.login(identifier, password);
    setLoading(false);

    if (result.success) {
      router.replace("/role-select");
    } else {
      Alert.alert("Giriş Başarısız", result.error ?? "Tekrar deneyin");
    }
  };

  const skipLogin = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/role-select");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#0C2D29", "#143D37", "#0C2D29"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>{t("partnerHub.brand")}</Text>
        <Text style={styles.headline}>Partner Girişi</Text>
        <Text style={styles.sub}>
          Sürücü veya merchant olarak giriş yap
        </Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Phone size={18} color={colors.inkFaint} strokeWidth={2} />
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Telefon veya e-posta"
              placeholderTextColor={colors.inkFaint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrap}>
            <Lock size={18} color={colors.inkFaint} strokeWidth={2} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifre"
              placeholderTextColor={colors.inkFaint}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.inkFaint} strokeWidth={2} />
              ) : (
                <Eye size={18} color={colors.inkFaint} strokeWidth={2} />
              )}
            </Pressable>
          </View>

          <Pressable
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginText}>Giriş Yap</Text>
            )}
          </Pressable>

          <Pressable style={styles.skipBtn} onPress={skipLogin}>
            <Text style={styles.skipText}>Demo modda devam et →</Text>
          </Pressable>
        </View>

        <Text style={styles.footnote}>
          Henüz hesabın yok mu? Tüketici uygulamasından kayıt ol.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  glow: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(243,106,28,0.18)",
  },
  content: {
    paddingHorizontal: space.lg,
    flexGrow: 1,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.flameMid,
    marginBottom: space.sm,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.white,
  },
  sub: {
    marginTop: space.sm,
    marginBottom: space.xl,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.68)",
  },
  form: {
    gap: space.md,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    ...shadow.soft,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  loginBtn: {
    backgroundColor: colors.flame,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: space.sm,
    ...shadow.float,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginText: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.white,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: space.md,
  },
  skipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.flameMid,
  },
  footnote: {
    marginTop: "auto",
    paddingTop: space.xl,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
});
