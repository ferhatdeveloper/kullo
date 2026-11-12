import {
  Briefcase,
  CalendarDays,
  ChevronRight,
  FileText,
  Sparkles,
  Wallet,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  CAREER_CITY_LABEL_KEY,
  featuredJobs,
  jobTitle,
  type DemoJob,
} from "../lib/career-catalog";
import { colors, fonts } from "../lib/theme";
import { JobCard } from "./JobCard";

type Props = {
  lang: "tr" | "en";
  onSeeAllJobs: () => void;
  onOpenJob: (id: string) => void;
  onCreateAlarm: () => void;
  relativePosted: (job: DemoJob) => string;
};

/**
 * Kariyer ana sayfa gövde — AppBar Market’te (logo yok).
 * Spacing/tipografi kariyer.net home’a kilitli; ink+flame renk.
 * Filtre chip rayı yok — arama/filtre AppHeader + CareerFilterSheet.
 */
export function CareerHomeFeed({
  lang,
  onSeeAllJobs,
  onOpenJob,
  onCreateAlarm,
  relativePosted,
}: Props) {
  const { t } = useTranslation();
  const featured = featuredJobs(8);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.root}
      contentContainerStyle={styles.scroll}
    >
      {/* Benzer dens ray */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle} numberOfLines={2}>
          {t("career.similarJobs")}
        </Text>
        <Pressable onPress={onSeeAllJobs} hitSlop={8} style={styles.seeAllHit}>
          <Text style={styles.seeAll}>{t("career.seeAll")}</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railPad}
      >
        {featured.map((j) => (
          <JobCard
            key={j.id}
            job={j}
            variant="rail"
            title={jobTitle(j, lang)}
            cityLabel={`${t(CAREER_CITY_LABEL_KEY[j.city])}(${j.district.split(" ")[0]})`}
            workModelLabel={t(`career.workModel.${j.work_model}`)}
            employmentLabel={t(`career.employment.${j.employment}`)}
            relativeLabel={relativePosted(j)}
            onPress={() => onOpenJob(j.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.band} />

      {/* Kariyerini Planla */}
      <Text style={styles.planTitle}>{t("career.planTitle")}</Text>
      <View style={styles.planLeadRow}>
        <View style={styles.accentBar} />
        <Text style={styles.planLead}>{t("career.planLead")}</Text>
      </View>

      <Pressable style={styles.eventsCard}>
        <View style={styles.eventsIconWrap}>
          <CalendarDays size={22} color={colors.flame} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.eventsTitleRow}>
            <Text style={styles.eventsTitle}>{t("career.plan.events")}</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{t("career.newBadge")}</Text>
            </View>
          </View>
          <Text style={styles.eventsHint}>{t("career.plan.eventsHint")}</Text>
        </View>
      </Pressable>

      <View style={styles.planGrid}>
        {(
          [
            { key: "roles", Icon: Briefcase },
            { key: "salaries", Icon: Wallet },
            { key: "cvSamples", Icon: FileText },
          ] as const
        ).map(({ key, Icon }) => (
          <Pressable key={key} style={styles.planTile}>
            <Icon size={22} color={colors.flame} strokeWidth={2} />
            <Text style={styles.planTileText}>{t(`career.plan.${key}`)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.band} />

      {/* İş alarmı */}
      <Text style={styles.alarmTitle}>{t("career.alarmTitle")}</Text>
      <View style={styles.planLeadRow}>
        <View style={styles.accentBar} />
        <Text style={styles.planLead}>{t("career.alarmBody")}</Text>
      </View>
      <Pressable style={styles.alarmBtn} onPress={onCreateAlarm}>
        <Text style={styles.alarmBtnText}>{t("career.alarmCta")}</Text>
      </Pressable>

      {/* AI banner — kariyer.net koyu şerit dili */}
      <Pressable style={styles.aiBanner}>
        <Sparkles size={15} color={colors.flame} strokeWidth={2.2} />
        <Text style={styles.aiText}>{t("career.aiInterview")}</Text>
        <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </ScrollView>
  );
}

const H_PAD = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingTop: 10, paddingBottom: 20 },
  /** kariyer.net bölüm ayırıcı — ince gri bant */
  band: {
    height: 8,
    backgroundColor: "#F3F3F3",
    marginBottom: 12,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  seeAllHit: { paddingVertical: 2, paddingLeft: 4 },
  seeAll: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flame,
  },
  railPad: {
    paddingHorizontal: H_PAD,
    paddingBottom: 14,
  },
  planTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: "#1A1A1A",
    paddingHorizontal: H_PAD,
    marginBottom: 8,
  },
  planLeadRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: H_PAD,
    marginBottom: 12,
  },
  accentBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: colors.flame,
    alignSelf: "stretch",
  },
  planLead: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#5A5A5A",
    lineHeight: 19,
  },
  eventsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: H_PAD,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: colors.white,
  },
  eventsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.flameSoft,
  },
  eventsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventsTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "#1A1A1A",
  },
  newBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  newBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
  },
  eventsHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "#8A8A8A",
    marginTop: 2,
  },
  planGrid: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: H_PAD,
    marginBottom: 4,
  },
  planTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 84,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: colors.white,
  },
  planTileText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: "#1A1A1A",
    textAlign: "center",
  },
  alarmTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: "#1A1A1A",
    paddingHorizontal: H_PAD,
    marginBottom: 8,
  },
  alarmBtn: {
    marginHorizontal: H_PAD,
    marginBottom: 12,
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  alarmBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: H_PAD,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },
  aiText: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.white,
  },
});
