import { router, useLocalSearchParams } from "expo-router";
import {
  MessageCircle,
  Phone,
  Video,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { useHealthAppointments } from "../../lib/health-appointments-store";
import {
  getProvider,
  type MeetingType,
} from "../../lib/health-catalog";
import { colors, fonts, radius, space } from "../../lib/theme";

type DayKey = "today" | "tomorrow";

function ymdOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MEETING_META: {
  key: MeetingType;
  Icon: typeof Video;
}[] = [
  { key: "video", Icon: Video },
  { key: "phone", Icon: Phone },
  { key: "chat", Icon: MessageCircle },
];

export default function HealthBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const providerId = Array.isArray(id) ? id[0] : id;
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const hydrate = useHealthAppointments((s) => s.hydrate);
  const add = useHealthAppointments((s) => s.add);
  const provider = providerId ? getProvider(providerId) : undefined;

  const [day, setDay] = useState<DayKey>("today");
  const [time, setTime] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<MeetingType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!provider) return;
    setTime(provider.slots[0] ?? null);
    setMeeting(provider.meeting_types[0] ?? null);
  }, [provider]);

  const dateStr = useMemo(
    () => ymdOffset(day === "today" ? 0 : 1),
    [day],
  );

  if (!provider) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("health.bookTitle")} onBack={() => router.back()} />
        <Text style={styles.notFound}>{t("health.notFound")}</Text>
      </Screen>
    );
  }

  const fee = formatListing(provider.fee_iqd, provider.price_currency);
  const availableMeetings = MEETING_META.filter((m) =>
    provider.meeting_types.includes(m.key),
  );

  const confirm = async () => {
    if (!time || !meeting) {
      Alert.alert(t("health.pickRequiredTitle"), t("health.pickRequiredBody"));
      return;
    }
    setSubmitting(true);
    try {
      const appt = await add({
        providerId: provider.id,
        providerName: provider.name,
        specialty: provider.specialty,
        clinic: provider.clinic,
        city: provider.city,
        date: dateStr,
        time,
        meetingType: meeting,
        fee_iqd: provider.fee_iqd,
        phone: provider.phone,
      });
      Alert.alert(
        t("health.bookedTitle"),
        t("health.bookedBody", {
          name: provider.name,
          date: dateStr,
          time,
          type: t(`health.meeting.${meeting}`),
          amount: fee,
        }),
        [
          {
            text: t("health.viewAppointments"),
            onPress: () =>
              router.replace({
                pathname: "/health/appointments",
                params: { highlight: appt.id },
              }),
          },
          {
            text: t("common.done"),
            onPress: () => router.replace("/health"),
          },
        ],
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("health.bookTitle")}
        subtitle={provider.name}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>{t("health.pickDay")}</Text>
        <View style={styles.row}>
          {(
            [
              ["today", t("health.today")],
              ["tomorrow", t("health.tomorrow")],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.dayChip, day === key && styles.dayChipOn]}
              onPress={() => setDay(key)}
            >
              <Text style={[styles.dayText, day === key && styles.dayTextOn]}>
                {label}
              </Text>
              <Text style={[styles.daySub, day === key && styles.dayTextOn]}>
                {ymdOffset(key === "today" ? 0 : 1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>{t("health.pickTime")}</Text>
        <View style={styles.wrap}>
          {provider.slots.map((s) => {
            const on = time === s;
            return (
              <Pressable
                key={s}
                style={[styles.slot, on && styles.slotOn]}
                onPress={() => setTime(s)}
              >
                <Text style={[styles.slotText, on && styles.slotTextOn]}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t("health.pickMeeting")}</Text>
        <Text style={styles.hint}>{t("health.pickMeetingHint")}</Text>
        <View style={styles.meetingCol}>
          {availableMeetings.map(({ key, Icon }) => {
            const on = meeting === key;
            return (
              <Pressable
                key={key}
                style={[styles.meetingCard, on && styles.meetingCardOn]}
                onPress={() => setMeeting(key)}
              >
                <View style={[styles.meetingIcon, on && styles.meetingIconOn]}>
                  <Icon
                    size={18}
                    color={on ? colors.white : colors.flame}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.meetingBody}>
                  <Text
                    style={[styles.meetingTitle, on && styles.meetingTitleOn]}
                  >
                    {t(`health.meeting.${key}`)}
                  </Text>
                  <Text style={styles.meetingHint}>
                    {t(`health.meetingHint.${key}`)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>{t("health.consultation")}</Text>
          <Text style={styles.summaryValue}>{fee}</Text>
        </View>
        <Text style={styles.demoNote}>{t("health.demoNote")}</Text>

        <Button
          label={t("health.confirmBook")}
          variant="ink"
          loading={submitting}
          onPress={() => void confirm()}
          style={styles.cta}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 48,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginBottom: space.sm,
  },
  row: { flexDirection: "row", gap: 10 },
  dayChip: {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  dayChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  dayText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  daySub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
  },
  dayTextOn: { color: colors.white },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  slotOn: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  slotText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  slotTextOn: { color: colors.white },
  meetingCol: { gap: 10 },
  meetingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  meetingCardOn: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  meetingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  meetingIconOn: { backgroundColor: colors.ink },
  meetingBody: { flex: 1 },
  meetingTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  meetingTitleOn: { color: colors.ink },
  meetingHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  summary: {
    marginTop: space.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  summaryValue: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.white,
  },
  demoNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: space.sm,
    marginBottom: space.md,
  },
  cta: { marginTop: space.sm },
});
