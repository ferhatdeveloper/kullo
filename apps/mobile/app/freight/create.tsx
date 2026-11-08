import { router } from "expo-router";
import { Calendar, MapPin, Package, Truck, Weight } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen, ScreenHeader } from "../../components/ui/Screen";
import {
  getLoadCategoryLabel,
  getTruckTypeLabel,
  Load,
  LoadCategory,
  TruckType,
  useFreightStore,
} from "../../lib/freight-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const CATEGORIES: LoadCategory[] = [
  "general",
  "construction",
  "agriculture",
  "food",
  "furniture",
  "machinery",
  "vehicles",
  "chemicals",
  "other",
];

const TRUCK_TYPES: TruckType[] = [
  "flatbed",
  "dry_van",
  "reefer",
  "tanker",
  "container",
  "pickup",
  "other",
];

export default function CreateLoadScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { addLoad } = useFreightStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LoadCategory>("general");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "ton">("ton");
  const [truckType, setTruckType] = useState<TruckType>("flatbed");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "negotiable">("fixed");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert(t("freight.error"), t("freight.enterTitle"));
      return false;
    }
    if (!weight.trim() || isNaN(Number(weight))) {
      Alert.alert(t("freight.error"), t("freight.enterWeight"));
      return false;
    }
    if (!pickupCity.trim()) {
      Alert.alert(t("freight.error"), t("freight.enterPickupCity"));
      return false;
    }
    if (!deliveryCity.trim()) {
      Alert.alert(t("freight.error"), t("freight.enterDeliveryCity"));
      return false;
    }
    if (!pickupDate.trim()) {
      Alert.alert(t("freight.error"), t("freight.enterPickupDate"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newLoad: Load = {
      id: `load-${Date.now()}`,
      shipperId: "current-user",
      shipperName: "Yük Sahibi",
      shipperRating: 4.5,
      shipperVerified: false,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      weight: Number(weight),
      weightUnit,
      truckType,
      pickup: {
        address: pickupAddress.trim() || pickupCity,
        city: pickupCity.trim(),
        coordinates: { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
      },
      delivery: {
        address: deliveryAddress.trim() || deliveryCity,
        city: deliveryCity.trim(),
        coordinates: { latitude: 36.8671, longitude: 42.9503, timestamp: Date.now() },
      },
      pickupDate: pickupDate.trim(),
      price: price ? Number(price) * 1000 : undefined,
      priceType: price ? priceType : "negotiable",
      currency: "IQD",
      status: "posted",
      bidsCount: 0,
      requirements: requirements ? requirements.split(",").map((r) => r.trim()) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addLoad(newLoad);
    setIsSubmitting(false);

    Alert.alert(t("freight.loadCreated"), t("freight.loadCreatedBody"), [
      { text: t("common.ok"), onPress: () => router.back() },
    ]);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={t("freight.createLoad")} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("freight.loadInfo")}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.title")} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t("freight.titlePlaceholder")}
                placeholderTextColor={colors.inkFaint}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("freight.descriptionPlaceholder")}
                placeholderTextColor={colors.inkFaint}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.category")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, category === cat && styles.chipActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                        {getLoadCategoryLabel(cat)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("freight.cargoDetails")}</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>{t("freight.weight")} *</Text>
                <View style={styles.inputWithIcon}>
                  <Weight size={18} color={colors.inkMuted} strokeWidth={2} />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="0"
                    placeholderTextColor={colors.inkFaint}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t("freight.unit")}</Text>
                <View style={styles.unitRow}>
                  <TouchableOpacity
                    style={[styles.unitBtn, weightUnit === "kg" && styles.unitBtnActive]}
                    onPress={() => setWeightUnit("kg")}
                  >
                    <Text style={[styles.unitText, weightUnit === "kg" && styles.unitTextActive]}>
                      KG
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitBtn, weightUnit === "ton" && styles.unitBtnActive]}
                    onPress={() => setWeightUnit("ton")}
                  >
                    <Text style={[styles.unitText, weightUnit === "ton" && styles.unitTextActive]}>
                      TON
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.truckType")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {TRUCK_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chip, truckType === type && styles.chipActive]}
                      onPress={() => setTruckType(type)}
                    >
                      <Truck size={14} color={truckType === type ? colors.white : colors.inkMuted} />
                      <Text style={[styles.chipText, truckType === type && styles.chipTextActive]}>
                        {getTruckTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("freight.route")}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.pickupCity")} *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={18} color="#4CAF50" strokeWidth={2} />
                <TextInput
                  style={styles.inputInner}
                  placeholder={t("freight.cityPlaceholder")}
                  placeholderTextColor={colors.inkFaint}
                  value={pickupCity}
                  onChangeText={setPickupCity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.pickupAddress")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("freight.addressPlaceholder")}
                placeholderTextColor={colors.inkFaint}
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.deliveryCity")} *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={18} color={colors.flame} strokeWidth={2} />
                <TextInput
                  style={styles.inputInner}
                  placeholder={t("freight.cityPlaceholder")}
                  placeholderTextColor={colors.inkFaint}
                  value={deliveryCity}
                  onChangeText={setDeliveryCity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.deliveryAddress")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("freight.addressPlaceholder")}
                placeholderTextColor={colors.inkFaint}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("freight.pickupDate")} *</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={18} color={colors.inkMuted} strokeWidth={2} />
                <TextInput
                  style={styles.inputInner}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.inkFaint}
                  value={pickupDate}
                  onChangeText={setPickupDate}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("freight.pricing")}</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>{t("freight.price")}</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyLabel}>IQD</Text>
                  <TextInput
                    style={styles.inputInner}
                    placeholder={t("freight.pricePlaceholder")}
                    placeholderTextColor={colors.inkFaint}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                  <Text style={styles.thousandLabel}>x1000</Text>
                </View>
              </View>
            </View>

            <View style={styles.priceTypeRow}>
              <TouchableOpacity
                style={[styles.priceTypeBtn, priceType === "fixed" && styles.priceTypeBtnActive]}
                onPress={() => setPriceType("fixed")}
              >
                <Text
                  style={[
                    styles.priceTypeText,
                    priceType === "fixed" && styles.priceTypeTextActive,
                  ]}
                >
                  {t("freight.fixedPrice")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceTypeBtn,
                  priceType === "negotiable" && styles.priceTypeBtnActive,
                ]}
                onPress={() => setPriceType("negotiable")}
              >
                <Text
                  style={[
                    styles.priceTypeText,
                    priceType === "negotiable" && styles.priceTypeTextActive,
                  ]}
                >
                  {t("freight.negotiable")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("freight.requirements")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t("freight.requirementsPlaceholder")}
              placeholderTextColor={colors.inkFaint}
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={2}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            <Package size={20} color={colors.white} strokeWidth={2} />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? t("freight.posting") : t("freight.postLoad")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: space.md,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md,
    ...shadow.soft,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
    marginBottom: space.md,
  },
  inputGroup: {
    marginBottom: space.md,
  },
  label: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  inputInner: {
    flex: 1,
    paddingVertical: space.sm,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  currencyLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
  },
  thousandLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  row: {
    flexDirection: "row",
    gap: space.md,
  },
  unitRow: {
    flexDirection: "row",
    gap: space.xs,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: space.sm,
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
  },
  unitBtnActive: {
    backgroundColor: colors.flame,
  },
  unitText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
  },
  unitTextActive: {
    color: colors.white,
  },
  chipRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.mist,
    borderRadius: radius.pill,
  },
  chipActive: {
    backgroundColor: colors.flame,
  },
  chipText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  chipTextActive: {
    color: colors.white,
  },
  priceTypeRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  priceTypeBtn: {
    flex: 1,
    paddingVertical: space.md,
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
  },
  priceTypeBtnActive: {
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: colors.flame,
  },
  priceTypeText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
  },
  priceTypeTextActive: {
    color: colors.flame,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    backgroundColor: colors.flame,
    paddingVertical: space.md,
    borderRadius: radius.md,
    ...shadow.float,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
});
