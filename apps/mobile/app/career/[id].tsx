import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "../../components/brand";
import {
  CAREER_CITY_LABEL_KEY,
  getJob,
  jobDescription,
  jobRequirements,
  jobTitle,
} from "../../lib/career-catalog";
import { useCareerStore } from "../../lib/career-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function CareerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Array.isArray(id) ? id[0] : id;
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const hydrate = useCareerStore((s) => s.hydrate);
  const hasApplied = useCareerStore((s) => s.hasApplied);
  const markViewed = useCareerStore((s) => s.markViewed);
  const toggleSaved = useCareerStore((s) => s.toggleSaved);
  const isSaved = useCareerStore((s) => s.isSaved);
  const jobAlarmOn = useCareerStore((s) => s.jobAlarmOn);
  const setJobAlarmOn = useCareerStore((s) => s.setJobAlarmOn);
  const job = jobId ? getJob(jobId) : undefined;
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (job?.id) void markViewed(job.id);
  }, [job?.id, markViewed]);

  if (!job) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <AppHeader
          variant="market"
          showBack
          searchPlaceholder={t("career.searchPlaceholder")}
          onBackPress={() => router.back()}
          onSearchPress={() => router.replace("/career")}
        />
        <Text style={styles.notFound}>{t("career.notFound")}</Text>
      </View>
    );
  }

  const title = jobTitle(job, lang);
  const cityLabel = t(CAREER_CITY_LABEL_KEY[job.city]);
  const applied = hasApplied(job.id);
  const saved = isSaved(job.id);
  const reqs = jobRequirements(job, lang);
  const desc = jobDescription(job, lang);
  const descShort = desc.length > 280 && !expanded ? `${desc.slice(0, 280)}…` : desc;

  const tags = [
    t(`career.workModel.${job.work_model}`),
    t(`career.employment.${job.employment}`),
    t(`career.experience.${job.experience}`),
    t(`career.category.${job.category}`),
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader
        variant="market"
        showBack
        searchPlaceholder={t("career.searchPlaceholder")}
        onBackPress={() => router.back()}
        onSearchPress={() => router.replace("/career")}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.company}>{job.company}</Text>
        <Text style={styles.loc}>
          {cityLabel}({job.district})
        </Text>

        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.stats}>
            {t("career.applicantsPlus", { count: job.applicants_mock })}
          </Text>
          <Text style={styles.statsMuted}>
            {job.posted_days_ago <= 0
              ? t("career.updatedHours", { hours: job.posted_hours_ago ?? 3 })
              : t("career.updatedDays", { days: job.posted_days_ago })}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t("career.aboutJob")}</Text>
        <Text style={styles.body}>{descShort}</Text>
        {desc.length > 280 ? (
          <Pressable
            style={styles.moreRow}
            onPress={() => setExpanded((v) => !v)}
          >
            <Text style={styles.moreText}>
              {expanded ? t("career.showLess") : t("career.showMore")}
            </Text>
            {expanded ? (
              <ChevronUp size={14} color={colors.flame} />
            ) : (
              <ChevronDown size={14} color={colors.flame} />
            )}
          </Pressable>
        ) : null}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
          {t("career.requirements")}
        </Text>
        {reqs.map((r) => (
          <Text key={r} style={styles.req}>
            · {r}
          </Text>
        ))}

        <View style={styles.alarmCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.alarmTitle}>{t("career.similarAlarm")}</Text>
            <Text style={styles.alarmSub} numberOfLines={1}>
              {title} · {cityLabel}
            </Text>
          </View>
          <Switch
            value={jobAlarmOn}
            onValueChange={(v) => void setJobAlarmOn(v)}
            trackColor={{ false: colors.line, true: colors.flameMid }}
            thumbColor={colors.white}
          />
        </View>

        <Text style={styles.demoNote}>{t("career.demoNote")}</Text>
      </ScrollView>

      <View
        style={[
          styles.sticky,
          shadow.card,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <Pressable
          style={[styles.saveBtn, saved && styles.saveBtnOn]}
          onPress={() => void toggleSaved(job.id)}
          accessibilityRole="button"
        >
          <Bookmark
            size={16}
            color={saved ? colors.white : colors.ink}
            fill={saved ? colors.white : "transparent"}
            strokeWidth={2}
          />
          <Text style={[styles.saveText, saved && styles.saveTextOn]}>
            {saved ? t("career.saved") : t("career.save")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.applyBtn, applied && styles.applyBtnDisabled]}
          onPress={() =>
            router.push({ pathname: "/career/apply", params: { id: job.id } })
          }
          disabled={applied}
          accessibilityRole="button"
        >
          <Text style={styles.applyText}>
            {applied ? t("career.alreadyApplied") : t("career.applyCta")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  notFound: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 40,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: 110,
  },
  title: {
    fontFamily: fonts.displayMed,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 6,
  },
  company: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  loc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stats: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  statsMuted: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 8,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
  },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  moreText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flame,
  },
  req: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  alarmCard: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  alarmTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  alarmSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  demoNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 16,
  },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: space.lg,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  saveBtnOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  saveText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  saveTextOn: { color: colors.white },
  applyBtn: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
  },
  applyBtnDisabled: { opacity: 0.55 },
  applyText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
});
