import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  TRADE_CATEGORIES,
  TRADE_CITIES,
  TRADE_CITY_LABEL_KEY,
  useTradesStore,
  type TradeCategory,
  type TradeCity,
} from "../../lib/trades-store";
import { colors, fonts, radius, space } from "../../lib/theme";

export default function TradesCreateScreen() {
  const { t } = useTranslation();
  const createJob = useTradesStore((s) => s.createJob);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TradeCategory>("general");
  const [city, setCity] = useState<TradeCity>("Erbil");
  const [budget, setBudget] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const name = customerName.trim() || t("trades.defaultCustomer");
    const budgetNum = Number(String(budget).replace(/[^\d]/g, ""));

    if (!trimmedTitle || !trimmedDesc) {
      Alert.alert(t("trades.createRequiredTitle"), t("trades.createRequiredBody"));
      return;
    }
    if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
      Alert.alert(t("trades.createRequiredTitle"), t("trades.createBudgetBody"));
      return;
    }

    setSaving(true);
    try {
      const job = await createJob({
        title: trimmedTitle,
        description: trimmedDesc,
        category,
        city,
        budget_iqd: budgetNum,
        customerName: name,
      });
      router.replace(`/trades/${job.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("trades.createTitle")}
        subtitle={t("trades.createSubtitle")}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label={t("trades.fields.title")}>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t("trades.fields.titlePh")}
            placeholderTextColor={colors.inkFaint}
          />
        </Field>

        <Field label={t("trades.fields.description")}>
          <TextInput
            style={[styles.input, styles.area]}
            value={description}
            onChangeText={setDescription}
            placeholder={t("trades.fields.descriptionPh")}
            placeholderTextColor={colors.inkFaint}
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Field label={t("trades.fields.category")}>
          <View style={styles.wrap}>
            {TRADE_CATEGORIES.map((c) => {
              const on = category === c;
              return (
                <Pressable
                  key={c}
                  style={[styles.pick, on && styles.pickOn]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.pickText, on && styles.pickTextOn]}>
                    {t(`trades.category.${c}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label={t("trades.fields.city")}>
          <View style={styles.wrap}>
            {TRADE_CITIES.map((c) => {
              const on = city === c;
              return (
                <Pressable
                  key={c}
                  style={[styles.pick, on && styles.pickOnInk]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.pickText, on && styles.pickTextOnInk]}>
                    {t(TRADE_CITY_LABEL_KEY[c])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label={t("trades.fields.budget")}>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder={t("trades.fields.budgetPh")}
            placeholderTextColor={colors.inkFaint}
            keyboardType="number-pad"
          />
        </Field>

        <Field label={t("trades.fields.customerName")}>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder={t("trades.fields.customerNamePh")}
            placeholderTextColor={colors.inkFaint}
          />
        </Field>

        <Text style={styles.note}>{t("trades.createNote")}</Text>

        <Button
          label={t("trades.publish")}
          onPress={() => void onSubmit()}
          loading={saving}
          variant="primary"
        />
      </ScrollView>
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
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl * 2,
    gap: space.md,
  },
  field: { gap: 6 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  area: { minHeight: 96 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pick: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pickOn: {
    backgroundColor: colors.flameSoft,
    borderColor: "#FFD8B8",
  },
  pickOnInk: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pickText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  pickTextOn: {
    color: colors.flameDeep,
    fontFamily: fonts.bodySemi,
  },
  pickTextOnInk: {
    color: colors.white,
    fontFamily: fonts.bodySemi,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkFaint,
  },
});
