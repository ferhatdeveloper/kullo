import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  ChevronRight,
  Home,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "../../components/brand";
import { CareerFilterSheet } from "../../components/CareerFilterSheet";
import { CareerHomeFeed } from "../../components/CareerHomeFeed";
import { JobCard } from "../../components/JobCard";
import {
  CAREER_CITY_LABEL_KEY,
  DEFAULT_CAREER_FILTERS,
  DEMO_JOBS,
  filterJobs,
  getJob,
  jobTitle,
  type CareerListFilters,
  type DemoJob,
} from "../../lib/career-catalog";
import { useCareerStore } from "../../lib/career-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

type MainTab = "home" | "jobs" | "alerts" | "account";
type MyJobsChip = "viewed" | "saved" | "applied";
type MyJobsTop = "listings" | "prefs" | "interviews";

function relativePosted(
  job: DemoJob,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (job.posted_days_ago <= 0) {
    const h = job.posted_hours_ago ?? 3;
    return t("career.postedHours", { hours: h });
  }
  if (job.posted_days_ago === 1) return t("career.postedDay");
  return t("career.postedDaysShort", { days: job.posted_days_ago });
}

export default function CareerHomeScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";

  const hydrate = useCareerStore((s) => s.hydrate);
  const viewedIds = useCareerStore((s) => s.viewedIds);
  const savedIds = useCareerStore((s) => s.savedIds);
  const applications = useCareerStore((s) => s.applications);
  const toggleSaved = useCareerStore((s) => s.toggleSaved);
  const isSaved = useCareerStore((s) => s.isSaved);
  const openToWork = useCareerStore((s) => s.openToWork);
  const setOpenToWork = useCareerStore((s) => s.setOpenToWork);
  const jobAlarmOn = useCareerStore((s) => s.jobAlarmOn);
  const setJobAlarmOn = useCareerStore((s) => s.setJobAlarmOn);

  const [tab, setTab] = useState<MainTab>("home");
  const [filters, setFilters] = useState<CareerListFilters>({
    ...DEFAULT_CAREER_FILTERS,
  });
  const [browsing, setBrowsing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [myTop, setMyTop] = useState<MyJobsTop>("listings");
  const [myChip, setMyChip] = useState<MyJobsChip>("viewed");
  const [draftQ, setDraftQ] = useState("");

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const jobs = useMemo(() => filterJobs(filters), [filters]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.city) n += 1;
    if (filters.category) n += 1;
    if (filters.employment) n += 1;
    if (filters.workModel) n += 1;
    if (filters.sort !== "recommended") n += 1;
    return n;
  }, [filters]);

  const myJobsList = useMemo(() => {
    const ids =
      myChip === "viewed"
        ? viewedIds
        : myChip === "saved"
          ? savedIds
          : applications.map((a) => a.jobId);
    return ids
      .map((id) => getJob(id))
      .filter((j): j is DemoJob => Boolean(j));
  }, [myChip, viewedIds, savedIds, applications]);

  const openJob = (id: string) => router.push(`/career/${id}`);

  const runSearch = (q: string) => {
    setFilters((f) => ({ ...f, q }));
    setDraftQ(q);
    setBrowsing(true);
    setTab("home");
  };

  const renderJobRow = (item: DemoJob) => (
    <JobCard
      job={item}
      title={jobTitle(item, lang)}
      cityLabel={t(CAREER_CITY_LABEL_KEY[item.city])}
      workModelLabel={t(`career.workModel.${item.work_model}`)}
      employmentLabel={t(`career.employment.${item.employment}`)}
      relativeLabel={relativePosted(item, t)}
      sponsoredLabel={t("career.sponsored")}
      saved={isSaved(item.id)}
      onToggleSave={() => void toggleSaved(item.id)}
      onPress={() => openJob(item.id)}
    />
  );

  const homeDiscovery = (
    <CareerHomeFeed
      lang={lang}
      onSeeAllJobs={() => {
        setFilters({ ...DEFAULT_CAREER_FILTERS });
        setDraftQ("");
        setBrowsing(true);
      }}
      onOpenJob={openJob}
      onCreateAlarm={() => void setJobAlarmOn(true)}
      relativePosted={(job) => relativePosted(job, t)}
    />
  );

  const homeResults = (
    <View style={{ flex: 1 }}>
      <View style={styles.resultsHead}>
        <Pressable
          onPress={() => {
            setBrowsing(false);
            setFilters({ ...DEFAULT_CAREER_FILTERS });
            setDraftQ("");
          }}
          hitSlop={8}
        >
          <Text style={styles.backText}>{t("career.backHome")}</Text>
        </Pressable>
        <View style={styles.resultsSearchRow}>
          <View style={styles.resultsSearch}>
            <Search size={14} color={colors.inkFaint} strokeWidth={2} />
            <TextInput
              value={draftQ}
              onChangeText={setDraftQ}
              onSubmitEditing={() => runSearch(draftQ)}
              placeholder={t("career.searchPlaceholder")}
              placeholderTextColor={colors.inkFaint}
              style={styles.resultsInput}
              returnKeyType="search"
            />
            <Text style={styles.resultsCount}>
              {t("career.resultCount", { count: jobs.length })}
            </Text>
          </View>
          <Pressable
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnOn]}
            onPress={() => setSheetOpen(true)}
            accessibilityLabel={t("career.filtersTitle")}
          >
            <SlidersHorizontal
              size={16}
              color={activeFilterCount > 0 ? colors.white : colors.flame}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("career.empty")}</Text>
        }
        renderItem={({ item }) => renderJobRow(item)}
      />

      <View style={[styles.stickyAlarm, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Bell size={16} color="#2E7D32" strokeWidth={2.2} />
        <Text style={styles.stickyAlarmText}>{t("career.jobAlarmToggle")}</Text>
        <Switch
          value={jobAlarmOn}
          onValueChange={(v) => void setJobAlarmOn(v)}
          trackColor={{ false: colors.line, true: colors.flameMid }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );

  const jobsTab = (
    <View style={{ flex: 1 }}>
      <View style={styles.myTopTabs}>
        {(
          [
            ["listings", "career.myJobs.listings"],
            ["prefs", "career.myJobs.prefs"],
            ["interviews", "career.myJobs.interviews"],
          ] as const
        ).map(([key, labelKey]) => (
          <Pressable
            key={key}
            style={styles.myTopTab}
            onPress={() => setMyTop(key)}
          >
            <Text
              style={[
                styles.myTopTabText,
                myTop === key && styles.myTopTabTextOn,
              ]}
            >
              {t(labelKey)}
            </Text>
            {myTop === key ? <View style={styles.myTopUnderline} /> : null}
          </Pressable>
        ))}
      </View>

      {myTop === "listings" ? (
        <>
          <View style={styles.mySubTabs}>
            {(
              [
                ["viewed", "career.myJobs.viewed"],
                ["saved", "career.myJobs.saved"],
                ["applied", "career.myJobs.applied"],
              ] as const
            ).map(([key, labelKey]) => (
              <Pressable
                key={key}
                style={styles.mySubTab}
                onPress={() => setMyChip(key)}
              >
                <Text
                  style={[
                    styles.mySubTabText,
                    myChip === key && styles.mySubTabTextOn,
                  ]}
                >
                  {t(labelKey)}
                </Text>
                {myChip === key ? <View style={styles.myTopUnderline} /> : null}
              </Pressable>
            ))}
          </View>

          {myJobsList.length === 0 ? (
            <View style={styles.emptyState}>
              <Bookmark size={40} color={colors.flame} strokeWidth={1.6} />
              <Text style={styles.emptyTitle}>
                {myChip === "viewed"
                  ? t("career.myJobs.emptyViewed")
                  : myChip === "saved"
                    ? t("career.myJobs.emptySaved")
                    : t("career.myJobs.emptyApplied")}
              </Text>
              <Text style={styles.emptyHint}>{t("career.myJobs.emptyHint")}</Text>
              <Pressable
                style={styles.outlineBtn}
                onPress={() => {
                  setTab("home");
                  setBrowsing(true);
                  setFilters({ ...DEFAULT_CAREER_FILTERS });
                }}
              >
                <Text style={styles.outlineBtnText}>{t("career.myJobs.seeJobs")}</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={myJobsList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPad}
              renderItem={({ item }) => renderJobRow(item)}
            />
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {myTop === "prefs"
              ? t("career.myJobs.prefsEmpty")
              : t("career.myJobs.interviewsEmpty")}
          </Text>
          <Text style={styles.emptyHint}>{t("career.demoNote")}</Text>
        </View>
      )}
    </View>
  );

  const alertsTab = (
    <View style={styles.emptyState}>
      <Bell size={36} color={colors.inkFaint} strokeWidth={1.6} />
      <Text style={styles.emptyTitle}>{t("career.alertsEmpty")}</Text>
      <Text style={styles.emptyHint}>{t("career.alertsHint")}</Text>
    </View>
  );

  const accountTab = (
    <ScrollView contentContainerStyle={styles.accountPad}>
      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <UserRound size={28} color={colors.ink} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.accountName}>{t("career.account.guest")}</Text>
          <View style={styles.openRow}>
            <Text style={styles.openLabel}>{t("career.account.openToWork")}</Text>
            <Switch
              value={openToWork}
              onValueChange={(v) => void setOpenToWork(v)}
              trackColor={{ false: colors.line, true: colors.flameMid }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      <View style={styles.cvCard}>
        <Text style={styles.cvTitle}>{t("career.account.resumes")}</Text>
        <View style={styles.cvPowerRow}>
          <Text style={styles.cvPowerLabel}>{t("career.account.power")}</Text>
          <Text style={styles.cvPowerValue}>62%</Text>
        </View>
        <View style={styles.cvBarTrack}>
          <View style={[styles.cvBarFill, { width: "62%" }]} />
        </View>
        <Text style={styles.cvHint}>{t("career.account.powerHint")}</Text>
        <Pressable
          style={styles.alarmBtn}
          onPress={() => router.push("/career/apply?id=job-tech-erbil-04")}
        >
          <Text style={styles.alarmBtnText}>{t("career.account.editCv")}</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.linkRow}
        onPress={() => router.push("/career/employer")}
      >
        <Building2 size={18} color={colors.flame} strokeWidth={2} />
        <Text style={styles.linkText}>{t("career.employerPanel")}</Text>
        <ChevronRight size={16} color={colors.inkFaint} />
      </Pressable>
      <Text style={styles.seedMeta}>
        {t("career.seedMeta", { count: DEMO_JOBS.length })}
      </Text>
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader
        variant="market"
        showBack
        searchPlaceholder={t("career.searchPlaceholder")}
        onSearchPress={() => {
          setTab("home");
          setBrowsing(true);
        }}
        onBackPress={() => {
          if (browsing) {
            setBrowsing(false);
            setFilters({ ...DEFAULT_CAREER_FILTERS });
            setDraftQ("");
            return;
          }
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)");
        }}
      />

      <View style={styles.body}>
        {tab === "home"
          ? browsing
            ? homeResults
            : homeDiscovery
          : null}
        {tab === "jobs" ? jobsTab : null}
        {tab === "alerts" ? alertsTab : null}
        {tab === "account" ? accountTab : null}
      </View>

      <View
        style={[
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, 8) },
          shadow.soft,
        ]}
      >
        {(
          [
            ["home", Home, "career.tabs.home"],
            ["jobs", Briefcase, "career.tabs.jobs"],
            ["alerts", Bell, "career.tabs.alerts"],
            ["account", UserRound, "career.tabs.account"],
          ] as const
        ).map(([key, Icon, labelKey]) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              style={styles.tabItem}
              onPress={() => {
                setTab(key);
                if (key === "home") setBrowsing(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Icon
                size={20}
                color={on ? colors.ink : colors.inkFaint}
                strokeWidth={on ? 2.4 : 2}
              />
              <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <CareerFilterSheet
        visible={sheetOpen}
        value={filters}
        onClose={() => setSheetOpen(false)}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { flex: 1, backgroundColor: colors.white },
  homeScroll: { paddingBottom: 24 },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    paddingHorizontal: space.lg,
    paddingTop: 4,
    marginBottom: 12,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
  },
  brandSub: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    color: colors.flame,
    flex: 1,
  },
  employerBtn: { padding: 4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: space.lg,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  searchPlaceholder: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
    marginHorizontal: space.lg,
    marginBottom: 8,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  seeAll: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flame,
  },
  featuredRail: {
    paddingHorizontal: space.lg,
    paddingBottom: 20,
  },
  planBlock: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: space.lg,
    marginBottom: 18,
    paddingBottom: 8,
  },
  planAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.flame,
    alignSelf: "stretch",
  },
  planLead: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 10,
    lineHeight: 18,
  },
  planWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  planWideTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  planWideTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  newBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 9,
    color: colors.white,
  },
  planWideHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  planGrid: {
    flexDirection: "row",
    gap: 8,
  },
  planTile: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  planTileText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
  },
  alarmBlock: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: space.lg,
    marginBottom: 12,
  },
  alarmTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 6,
  },
  alarmBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  alarmBtn: {
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: "center",
  },
  alarmBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  resultsHead: {
    paddingHorizontal: space.lg,
    paddingTop: 4,
    gap: 8,
    marginBottom: 8,
  },
  backText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.flame,
  },
  resultsSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultsSearch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  resultsInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  resultsCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnOn: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  listPad: {
    paddingHorizontal: space.lg,
    paddingBottom: 72,
  },
  stickyAlarm: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.lg,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  stickyAlarmText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: "#2E7D32",
  },
  myTopTabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    paddingHorizontal: space.sm,
  },
  myTopTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  myTopTabText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkFaint,
  },
  myTopTabTextOn: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
  },
  myTopUnderline: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.ink,
  },
  mySubTabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    paddingHorizontal: space.sm,
  },
  mySubTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  mySubTabText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkFaint,
  },
  mySubTabTextOn: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    textAlign: "center",
  },
  emptyHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: "center",
    lineHeight: 18,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 40,
  },
  outlineBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  outlineBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  accountPad: {
    padding: space.lg,
    gap: 14,
    paddingBottom: 32,
  },
  accountCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  openRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  openLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  cvCard: {
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    gap: 8,
  },
  cvTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  cvPowerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cvPowerLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  cvPowerValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flame,
  },
  cvBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.mist,
    overflow: "hidden",
  },
  cvBarFill: {
    height: "100%",
    backgroundColor: colors.flame,
  },
  cvHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  linkText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  seedMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  tabLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkFaint,
  },
  tabLabelOn: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
  },
});
