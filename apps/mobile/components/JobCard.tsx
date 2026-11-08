import { Bookmark, Clock } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DemoJob } from "../lib/career-catalog";
import { colors, fonts } from "../lib/theme";
import { OfflineCover } from "./OfflineCover";

type Props = {
  job: DemoJob;
  title: string;
  cityLabel: string;
  workModelLabel: string;
  employmentLabel: string;
  relativeLabel: string;
  sponsoredLabel?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  /** list = dens satır; rail = öne çıkan yatay kompakt */
  variant?: "list" | "rail";
  onPress: () => void;
};

function CompanyLogo({
  job,
  size,
}: {
  job: DemoJob;
  size: number;
}) {
  return (
    <View
      style={[
        styles.logoShell,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.18),
          backgroundColor: job.logo_bg || colors.brandSoft,
        },
      ]}
    >
      <OfflineCover
        uri={job.cover_url}
        label={job.company}
        style={styles.logoImg}
        contentFit="cover"
      />
    </View>
  );
}

/**
 * Dens iş kartı — logo sol (offline görsel, full opacity) + başlık/şirket/konum.
 * 16:9 cover yok.
 */
export function JobCard({
  job,
  title,
  cityLabel,
  workModelLabel,
  employmentLabel,
  relativeLabel,
  sponsoredLabel,
  saved,
  onToggleSave,
  variant = "list",
  onPress,
}: Props) {
  const isRail = variant === "rail";
  const loc = `${cityLabel} · ${workModelLabel}`;

  if (isRail) {
    return (
      <Pressable
        style={styles.railCard}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <CompanyLogo job={job} size={52} />
        <View style={styles.railBody}>
          <Text style={styles.railTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.railCompany} numberOfLines={1}>
            {job.company}
          </Text>
          <Text style={styles.railLoc} numberOfLines={1}>
            {cityLabel}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {job.sponsored && sponsoredLabel ? (
        <Text style={styles.sponsored}>{sponsoredLabel}</Text>
      ) : null}
      <View style={styles.main}>
        <CompanyLogo job={job} size={48} />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {onToggleSave ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  onToggleSave();
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="save"
              >
                <Bookmark
                  size={18}
                  color={saved ? colors.flame : colors.inkFaint}
                  fill={saved ? colors.flame : "transparent"}
                  strokeWidth={2}
                />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.company} numberOfLines={1}>
            {job.company}
          </Text>
          <Text style={styles.loc} numberOfLines={1}>
            {loc}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.employment}>{employmentLabel}</Text>
            <View style={styles.timeRow}>
              <Clock size={11} color={colors.inkFaint} strokeWidth={2} />
              <Text style={styles.relative}>{relativeLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoShell: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6E6E6",
    flexShrink: 0,
  },
  logoImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.white,
  },
  sponsored: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 6,
    marginLeft: 60,
  },
  main: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  body: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  company: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#333333",
    marginTop: 1,
  },
  loc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "#8A8A8A",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  employment: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: "#1A1A1A",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  relative: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "#8A8A8A",
  },
  /** kariyer.net dens featured card ~288–310 wide */
  railCard: {
    width: 300,
    marginRight: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: colors.white,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  railBody: { flex: 1, minWidth: 0, gap: 2 },
  railTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 19,
  },
  railCompany: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#333333",
  },
  railLoc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "#8A8A8A",
  },
});
