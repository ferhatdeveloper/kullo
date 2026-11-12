import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CarTaxiFront,
  ChevronRight,
  Package,
  Store,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePartnerStore, type PartnerRole } from "../../lib/partner-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type RoleCard = {
  role: PartnerRole;
  titleKey: string;
  bodyKey: string;
  Icon: typeof Store;
  enabled: boolean;
};

const ROLES: RoleCard[] = [
  {
    role: "merchant",
    titleKey: "partnerHub.roles.merchant.title",
    bodyKey: "partnerHub.roles.merchant.body",
    Icon: Store,
    enabled: true,
  },
  {
    role: "driver",
    titleKey: "partnerHub.roles.driver.title",
    bodyKey: "partnerHub.roles.driver.body",
    Icon: CarTaxiFront,
    enabled: true,
  },
  {
    role: "courier",
    titleKey: "partnerHub.roles.courier.title",
    bodyKey: "partnerHub.roles.courier.body",
    Icon: Package,
    enabled: false,
  },
];

export default function PartnerRoleSelectScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const setRole = usePartnerStore((s) => s.setRole);

  const pick = async (role: PartnerRole, enabled: boolean) => {
    if (!enabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setRole(role);
    if (role === "driver") router.replace("/partner/driver");
    else if (role === "merchant") router.replace("/partner/merchant");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
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
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.replace("/(tabs)/profile")}
          hitSlop={8}
          style={styles.exit}
        >
          <Text style={styles.exitText}>{t("partnerHub.exitConsumer")}</Text>
        </Pressable>

        <Text style={styles.brand}>{t("partnerHub.brand")}</Text>
        <Text style={styles.headline}>{t("partnerHub.roleSelect.title")}</Text>
        <Text style={styles.sub}>{t("partnerHub.roleSelect.subtitle")}</Text>

        <View style={styles.cards}>
          {ROLES.map((card) => {
            const Icon = card.Icon;
            return (
              <Pressable
                key={card.role}
                disabled={!card.enabled}
                onPress={() => void pick(card.role, card.enabled)}
                style={({ pressed }) => [
                  styles.card,
                  !card.enabled && styles.cardDisabled,
                  pressed && card.enabled && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: card.enabled ? colors.flameSoft : colors.mist },
                  ]}
                >
                  <Icon
                    size={22}
                    color={card.enabled ? colors.flame : colors.inkFaint}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{t(card.titleKey)}</Text>
                  <Text style={styles.cardDesc}>{t(card.bodyKey)}</Text>
                  {!card.enabled ? (
                    <Text style={styles.soon}>{t("partnerHub.courierSoon")}</Text>
                  ) : null}
                </View>
                {card.enabled ? (
                  <ChevronRight size={18} color={colors.inkFaint} strokeWidth={2.2} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.footnote}>{t("partnerHub.roleSelect.footnote")}</Text>
      </ScrollView>
    </View>
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
    paddingTop: space.md,
  },
  exit: { alignSelf: "flex-start", marginBottom: space.xl },
  exitText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
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
  cards: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: space.lg,
    ...shadow.card,
  },
  cardPressed: { transform: [{ scale: 0.985 }] },
  cardDisabled: { opacity: 0.72 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1 },
  cardTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
  },
  cardDesc: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  soon: {
    marginTop: 6,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.flameDeep,
  },
  footnote: {
    marginTop: space.xl,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
});
