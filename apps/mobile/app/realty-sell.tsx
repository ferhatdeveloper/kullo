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

type PropertyType = "housing" | "land" | "commercial";
type OfferType = "sale" | "rent";

export default function RealtySellScreen() {
  const { t } = useTranslation();
  const addRealty = useMarketplaceStore((s) => s.addRealty);
  const [property, setProperty] = useState<PropertyType>("housing");
  const [offer, setOffer] = useState<OfferType>("sale");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("Erbil");
  const [submitting, setSubmitting] = useState(false);

  const publish = async () => {
    if (!title.trim() || !price.trim() || !area.trim()) {
      Alert.alert(t("realty.sell.missingTitle"), t("realty.sell.missingBody"));
      return;
    }
    setSubmitting(true);
    const id = `realty-local-${Date.now()}`;
    await addRealty({
      id,
      title: title.trim(),
      description: t("realty.sell.publishedBody"),
      property_type: property,
      kind:
        property === "land"
          ? "land"
          : property === "commercial"
            ? "shop"
            : "apartment",
      offer_type: offer,
      area_m2: Number(area) || 0,
      rooms: rooms.trim() || undefined,
      bedrooms: rooms.trim() ? Number(rooms.trim().split("+")[0]) || undefined : undefined,
      price_amount: Number(price) || 0,
      price_currency: "USD",
      city: city.trim() || "Erbil",
      cover_url: "",
      seller_name: "Sen (offline)",
      agent_verified: false,
      featured: true,
    });
    setSubmitting(false);
    Alert.alert(t("realty.sell.publishedTitle"), t("realty.sell.publishedBody"), [
      { text: t("common.done"), onPress: () => router.replace("/(tabs)/realty") },
    ]);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("realty.sell.title")}
        subtitle={t("realty.sell.subtitle")}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>{t("realty.typesLabel")}</Text>
        <View style={styles.row}>
          {(["housing", "land", "commercial"] as const).map((k) => (
            <Chip
              key={k}
              label={t(`realty.types.${k}`)}
              selected={property === k}
              onPress={() => setProperty(k)}
            />
          ))}
        </View>

        <Text style={styles.label}>{t("realty.offerLabel")}</Text>
        <View style={styles.row}>
          {(["sale", "rent"] as const).map((k) => (
            <Chip
              key={k}
              label={t(`realty.offer.${k}`)}
              selected={offer === k}
              onPress={() => setOffer(k)}
            />
          ))}
        </View>

        <Field label={t("realty.sell.titleField")} value={title} onChangeText={setTitle} />
        <Field
          label={t("realty.area")}
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
          placeholder="m²"
        />
        {property === "housing" ? (
          <Field label={t("realty.rooms")} value={rooms} onChangeText={setRooms} placeholder="3+1" />
        ) : null}
        <Field
          label={t("realty.sell.price")}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Field label={t("search.city")} value={city} onChangeText={setCity} />

        <Button
          label={t("realty.sell.publish")}
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
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xl * 2, gap: space.md },
  label: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkFaint,
    marginBottom: 4,
  },
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
