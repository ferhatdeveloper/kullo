import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  CAREER_CITY_LABEL_KEY,
  getJob,
  jobTitle,
} from "../../lib/career-catalog";
import { useCareerStore } from "../../lib/career-store";
import { colors, fonts, radius, space } from "../../lib/theme";

export default function CareerApplyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Array.isArray(id) ? id[0] : id;
  const { t, i18n } = useTranslation();
  const hydrate = useCareerStore((s) => s.hydrate);
  const apply = useCareerStore((s) => s.apply);
  const hasApplied = useCareerStore((s) => s.hasApplied);
  const job = jobId ? getJob(jobId) : undefined;
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [yearsExp, setYearsExp] = useState("2");
  const [skills, setSkills] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!job) return;
    setCity(t(CAREER_CITY_LABEL_KEY[job.city]));
    setHeadline(
      lang === "tr"
        ? `${job.title_tr} adayı`
        : `${job.title_en} candidate`,
    );
  }, [job, lang, t]);

  if (!job) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("career.applyTitle")} onBack={() => router.back()} />
        <Text style={styles.notFound}>{t("career.notFound")}</Text>
      </Screen>
    );
  }

  const title = jobTitle(job, lang);
  const already = hasApplied(job.id);

  const submit = async () => {
    if (already) {
      router.replace("/career/employer");
      return;
    }
    if (!fullName.trim() || !headline.trim() || !phone.trim()) {
      Alert.alert(t("career.applyRequiredTitle"), t("career.applyRequiredBody"));
      return;
    }
    const years = Number.parseInt(yearsExp, 10);
    setSubmitting(true);
    try {
      await apply({
        jobId: job.id,
        jobTitle: title,
        company: job.company,
        city: t(CAREER_CITY_LABEL_KEY[job.city]),
        cv: {
          fullName: fullName.trim(),
          headline: headline.trim(),
          yearsExp: Number.isFinite(years) ? years : 0,
          skills: skills.trim(),
          phone: phone.trim(),
          city: city.trim() || t(CAREER_CITY_LABEL_KEY[job.city]),
          note: note.trim() || undefined,
        },
      });
      Alert.alert(t("career.appliedTitle"), t("career.appliedBody", { title }), [
        {
          text: t("career.employerPanel"),
          onPress: () => router.replace("/career/employer"),
        },
        {
          text: t("career.browseJobs"),
          onPress: () => router.replace("/career"),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("career.applyTitle")}
        subtitle={title}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>{t("career.applyLead")}</Text>
        <Text style={styles.company}>
          {job.company} · {t(CAREER_CITY_LABEL_KEY[job.city])}
        </Text>

        <Field
          label={t("career.cv.fullName")}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("career.cv.fullNamePh")}
        />
        <Field
          label={t("career.cv.headline")}
          value={headline}
          onChangeText={setHeadline}
          placeholder={t("career.cv.headlinePh")}
        />
        <Field
          label={t("career.cv.yearsExp")}
          value={yearsExp}
          onChangeText={setYearsExp}
          placeholder="2"
          keyboardType="number-pad"
        />
        <Field
          label={t("career.cv.skills")}
          value={skills}
          onChangeText={setSkills}
          placeholder={t("career.cv.skillsPh")}
        />
        <Field
          label={t("career.cv.phone")}
          value={phone}
          onChangeText={setPhone}
          placeholder={t("career.cv.phonePh")}
          keyboardType="phone-pad"
        />
        <Field
          label={t("career.cv.city")}
          value={city}
          onChangeText={setCity}
          placeholder={t("career.cv.cityPh")}
        />
        <Field
          label={t("career.cv.note")}
          value={note}
          onChangeText={setNote}
          placeholder={t("career.cv.notePh")}
          multiline
        />

        <Text style={styles.demoNote}>{t("career.demoNote")}</Text>

        <Button
          label={
            already
              ? t("career.alreadyApplied")
              : submitting
                ? t("career.submitting")
                : t("career.submitApply")
          }
          onPress={() => void submit()}
          disabled={submitting || already}
        />
      </ScrollView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, multiline && styles.inputMulti]}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: 40,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  company: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginBottom: space.md,
  },
  field: { marginBottom: space.md },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputMulti: { minHeight: 88, paddingTop: 11 },
  demoNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginBottom: space.md,
  },
});
