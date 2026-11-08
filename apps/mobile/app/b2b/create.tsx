import { router } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  B2B_CATEGORIES,
  B2B_CITIES,
  useB2BStore,
  type B2BCategory,
} from "../../lib/b2b-store";
import { colors, fonts, radius, space } from "../../lib/theme";

export default function B2BCreateScreen() {
  const { t } = useTranslation();
  const createRequest = useB2BStore((s) => s.createRequest);

  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<B2BCategory>("grocery");
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("adet");
  const [city, setCity] = useState<(typeof B2B_CITIES)[number]>("Erbil");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const qty = Number(quantity.replace(/[^\d]/g, ""));
    if (!companyName.trim() || !title.trim() || !Number.isFinite(qty) || qty <= 0) {
      Alert.alert(t("b2b.createInvalidTitle"), t("b2b.createInvalidBody"));
      return;
    }
    setSaving(true);
    try {
      const req = await createRequest({
        companyName: companyName.trim(),
        title: title.trim(),
        category,
        quantity: qty,
        unit: unit.trim() || "adet",
        city,
        notes: notes.trim() || undefined,
      });
      router.replace(`/b2b/${req.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("b2b.createTitle")}
        subtitle={t("b2b.createSubtitle")}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.pad}
          keyboardShouldPersistTaps="handled"
        >
          <Field label={t("b2b.field.company")}>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder={t("b2b.placeholder.company")}
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />
          </Field>

          <Field label={t("b2b.field.title")}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t("b2b.placeholder.title")}
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />
          </Field>

          <Field label={t("b2b.field.category")}>
            <View style={styles.chips}>
              {B2B_CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.chip, category === c && styles.chipOn]}
                >
                  <Text
                    style={[styles.chipText, category === c && styles.chipTextOn]}
                  >
                    {t(`b2b.category.${c}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label={t("b2b.field.quantity")}>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label={t("b2b.field.unit")}>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  style={styles.input}
                />
              </Field>
            </View>
          </View>

          <Field label={t("b2b.field.city")}>
            <View style={styles.chips}>
              {B2B_CITIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCity(c)}
                  style={[styles.chip, city === c && styles.chipOn]}
                >
                  <Text
                    style={[styles.chipText, city === c && styles.chipTextOn]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={t("b2b.field.notes")}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={t("b2b.placeholder.notes")}
              placeholderTextColor={colors.inkFaint}
              style={[styles.input, styles.notes]}
              multiline
            />
          </Field>

          <Pressable
            onPress={() => void submit()}
            disabled={saving}
            style={[styles.cta, saving && { opacity: 0.6 }]}
          >
            <Text style={styles.ctaText}>{t("b2b.publish")}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: space.lg,
    paddingBottom: space.section,
  },
  field: { marginBottom: space.md },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  notes: { minHeight: 88, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  chipOn: { backgroundColor: colors.ink },
  chipText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  chipTextOn: { color: colors.white },
  row: { flexDirection: "row", gap: space.md },
  cta: {
    marginTop: space.lg,
    backgroundColor: colors.flame,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.white,
  },
});
