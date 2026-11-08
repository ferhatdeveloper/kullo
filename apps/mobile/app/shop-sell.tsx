import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { Screen, ScreenHeader } from "../components/ui/Screen";
import { useMarketplaceStore } from "../lib/marketplace-store";
import { colors, fonts, radius, space } from "../lib/theme";

export default function ShopSellScreen() {
  const { t } = useTranslation();
  const addGoods = useMarketplaceStore((s) => s.addGoods);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState<"new" | "like_new" | "used">("new");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const publish = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert(t("shop.sell.missingTitle"), t("shop.sell.missingBody"));
      return;
    }
    setSubmitting(true);
    const id = `goods-local-${Date.now()}`;
    await addGoods({
      id,
      title: title.trim(),
      description: t("shop.sell.publishedBody"),
      brand: brand.trim() || "Local",
      category: "tops",
      size_label: size,
      sizes: [size],
      color_label: "—",
      condition,
      gender: "unisex",
      stock_qty: Math.max(1, Number(stock) || 1),
      price_amount: Number(price) || 0,
      price_currency: "IQD",
      city: "Erbil",
      cover_url: "",
      shop_name: "Sen (offline)",
      shop_id: "shop-ankawa",
      featured: true,
    });
    setSubmitting(false);
    Alert.alert(t("shop.sell.publishedTitle"), t("shop.sell.publishedBody"), [
      { text: t("common.done"), onPress: () => router.replace("/(tabs)/shop") },
    ]);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("shop.sell.title")}
        subtitle={t("shop.sell.subtitle")}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label={t("shop.sell.titleField")} value={title} onChangeText={setTitle} />
        <Field label={t("shop.brand")} value={brand} onChangeText={setBrand} />
        <Text style={styles.label}>{t("shop.size")}</Text>
        <View style={styles.row}>
          {["XS", "S", "M", "L", "XL", "42"].map((s) => (
            <Chip key={s} label={s} selected={size === s} onPress={() => setSize(s)} />
          ))}
        </View>
        <Text style={styles.label}>{t("shop.conditionLabel")}</Text>
        <View style={styles.row}>
          {(["new", "like_new", "used"] as const).map((c) => (
            <Chip
              key={c}
              label={t(`shop.condition.${c}`)}
              selected={condition === c}
              onPress={() => setCondition(c)}
            />
          ))}
        </View>
        <Field
          label={t("shop.sell.price")}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Field
          label={t("shop.stockLabel")}
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />
        <Button
          label={t("shop.sell.publish")}
          onPress={() => void publish()}
          loading={submitting}
        />
      </ScrollView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.inkFaint}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 },
  label: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.inkFaint, marginBottom: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  field: { gap: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
