import { router } from "expo-router";
import { Briefcase, Star, Users } from "lucide-react-native";
import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { DEMO_JOBS, featuredJobs, jobTitle } from "../../lib/career-catalog";
import {
  employerJobLabel,
  useCareerStore,
  type CareerApplicationStatus,
} from "../../lib/career-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function CareerEmployerScreen() {
  const { t, i18n } = useTranslation();
  const hydrate = useCareerStore((s) => s.hydrate);
  const applications = useCareerStore((s) => s.applications);
  const employerMatches = useCareerStore((s) => s.employerMatches);
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const matches = useMemo(() => employerMatches(), [employerMatches, applications]);
  const myJobs = featuredJobs(4);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("career.employerTitle")}
        subtitle={t("career.employerSubtitle")}
        onBack={() => router.back()}
      />

      <View style={styles.statsRow}>
        <Stat
          icon={<Briefcase size={16} color={colors.flame} strokeWidth={2.2} />}
          label={t("career.statOpen")}
          value={String(DEMO_JOBS.length)}
        />
        <Stat
          icon={<Users size={16} color={colors.flame} strokeWidth={2.2} />}
          label={t("career.statMatches")}
          value={String(matches.length)}
        />
        <Stat
          icon={<Star size={16} color={colors.flame} strokeWidth={2.2} />}
          label={t("career.statMine")}
          value={String(applications.length)}
        />
      </View>

      <Text style={styles.section}>{t("career.myListings")}</Text>
      <View style={styles.jobRail}>
        {myJobs.map((j) => (
          <Pressable
            key={j.id}
            style={styles.jobChip}
            onPress={() => router.push(`/career/${j.id}`)}
          >
            <Text style={styles.jobChipTitle} numberOfLines={1}>
              {jobTitle(j, lang)}
            </Text>
            <Text style={styles.jobChipMeta} numberOfLines={1}>
              {j.company} · {t(`career.applicants`, { count: j.applicants_mock })}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>{t("career.matchList")}</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("career.matchesEmpty")}</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, shadow.card]}
            onPress={() => router.push(`/career/${item.jobId}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.candidate} numberOfLines={1}>
                {item.candidateName}
              </Text>
              <View style={styles.scorePill}>
                <Text style={styles.scoreText}>%{item.matchScore}</Text>
              </View>
            </View>
            <Text style={styles.headline} numberOfLines={1}>
              {item.headline}
            </Text>
            <Text style={styles.jobLine} numberOfLines={1}>
              {employerJobLabel(item.jobId, lang)}
            </Text>
            <View style={styles.statusRow}>
              <StatusChip status={item.status} label={t(`career.status.${item.status}`)} />
              <Text style={styles.date}>
                {new Date(item.appliedAt).toLocaleDateString(
                  lang === "tr" ? "tr-TR" : "en-GB",
                )}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function StatusChip({
  status,
  label,
}: {
  status: CareerApplicationStatus;
  label: string;
}) {
  const tone =
    status === "shortlisted"
      ? styles.statusShort
      : status === "rejected"
        ? styles.statusReject
        : status === "reviewing"
          ? styles.statusReview
          : styles.statusSubmit;
  return (
    <View style={[styles.statusChip, tone]}>
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.ink,
    marginHorizontal: space.lg,
    marginBottom: 8,
  },
  jobRail: {
    paddingHorizontal: space.lg,
    gap: 8,
    marginBottom: space.md,
  },
  jobChip: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  jobChipTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  jobChipMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  candidate: {
    flex: 1,
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  scorePill: {
    backgroundColor: colors.flameSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  scoreText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
  },
  headline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
  },
  jobLine: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusSubmit: { backgroundColor: colors.mist },
  statusReview: { backgroundColor: colors.brandSoft },
  statusShort: { backgroundColor: colors.flameSoft },
  statusReject: { backgroundColor: "#FCE8E8" },
  statusText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
});
