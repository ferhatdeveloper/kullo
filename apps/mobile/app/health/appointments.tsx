import { router, useLocalSearchParams } from "expo-router";
import {
  MessageCircle,
  Phone,
  Stethoscope,
  Video,
} from "lucide-react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import {
  useHealthAppointments,
  type HealthAppointment,
} from "../../lib/health-appointments-store";
import type { MeetingType } from "../../lib/health-catalog";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const ICON: Record<MeetingType, typeof Video> = {
  video: Video,
  phone: Phone,
  chat: MessageCircle,
};

export default function HealthAppointmentsScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const hydrate = useHealthAppointments((s) => s.hydrate);
  const items = useHealthAppointments((s) => s.items);
  const cancel = useHealthAppointments((s) => s.cancel);
  const params = useLocalSearchParams<{ highlight?: string }>();
  const highlight = Array.isArray(params.highlight)
    ? params.highlight[0]
    : params.highlight;

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const startSession = (a: HealthAppointment) => {
    if (a.status !== "upcoming") {
      Alert.alert(t("health.sessionUnavailableTitle"), t("health.sessionUnavailableBody"));
      return;
    }
    if (a.meetingType === "video") {
      // Deep-link iskeleti → mevcut meet mock (WebRTC sonra)
      router.push({
        pathname: "/meet/[id]",
        params: { id: a.id, name: a.providerName },
      });
      return;
    }
    if (a.meetingType === "phone") {
      const tel = a.phone ?? "+9647500000000";
      Alert.alert(
        t("health.startPhoneTitle"),
        t("health.startPhoneBody", { phone: tel }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("health.callNow"),
            onPress: () => {
              void Linking.openURL(`tel:${tel}`);
            },
          },
        ],
      );
      return;
    }
    // chat
    router.push({
      pathname: "/chat/[id]",
      params: { id: a.providerId },
    });
  };

  const onCancel = (a: HealthAppointment) => {
    Alert.alert(t("health.cancelTitle"), a.providerName, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("health.cancelConfirm"),
        style: "destructive",
        onPress: () => void cancel(a.id),
      },
    ]);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("health.myAppointments")}
        subtitle={t("health.appointmentsSubtitle")}
        onBack={() => router.back()}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Stethoscope size={28} color={colors.inkFaint} strokeWidth={1.8} />
            <Text style={styles.empty}>{t("health.appointmentsEmpty")}</Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => router.replace("/health")}
            >
              <Text style={styles.emptyCtaText}>{t("health.browseDoctors")}</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const Icon = ICON[item.meetingType];
          const hi = highlight === item.id;
          const cancelled = item.status === "cancelled";
          return (
            <View style={[styles.card, hi && styles.cardHi, shadow.card]}>
              <View style={styles.cardTop}>
                <View style={styles.iconBubble}>
                  <Icon size={16} color={colors.flame} strokeWidth={2.2} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.providerName}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {t(`health.specialty.${item.specialty}`)} · {item.clinic}
                  </Text>
                  <Text style={styles.when}>
                    {item.date} · {item.time} · {t(`health.meeting.${item.meetingType}`)}
                  </Text>
                  <Text style={styles.fee}>
                    {formatListing(item.fee_iqd, "IQD")}
                    {cancelled ? ` · ${t("health.status.cancelled")}` : ""}
                  </Text>
                </View>
              </View>
              {!cancelled ? (
                <View style={styles.actions}>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => startSession(item)}
                  >
                    <Text style={styles.primaryBtnText}>
                      {t("health.startSession")}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.ghostBtn}
                    onPress={() => onCancel(item)}
                  >
                    <Text style={styles.ghostBtnText}>{t("health.cancelConfirm")}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 64,
    gap: 10,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  emptyCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardHi: {
    borderColor: colors.flame,
    borderWidth: 1.5,
  },
  cardTop: { flexDirection: "row", gap: 12 },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 2 },
  name: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  when: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
    marginTop: 4,
  },
  fee: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.flameDeep,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  ghostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
});
