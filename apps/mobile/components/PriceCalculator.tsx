import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Fuel,
  MapPin,
  Route,
  Truck,
} from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  calculateFreightPrice,
  formatDuration,
  formatPrice,
  getCityDistance,
  getFuelConsumptionInfo,
  getSuggestedPrice,
  getTruckFuelType,
  IRAQ_CITIES_DISTANCES,
  PriceBreakdown,
  usePricingStore,
} from "../lib/freight-pricing";
import { getTruckTypeLabel, TruckType } from "../lib/freight-store";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

interface PriceCalculatorProps {
  pickupCity?: string;
  deliveryCity?: string;
  truckType?: TruckType;
  weightTons?: number;
  onPriceCalculated?: (breakdown: PriceBreakdown) => void;
  showSuggested?: boolean;
  compact?: boolean;
}

export function PriceCalculator({
  pickupCity: initialPickup,
  deliveryCity: initialDelivery,
  truckType: initialTruck = "flatbed",
  weightTons: initialWeight = 0,
  onPriceCalculated,
  showSuggested = true,
  compact = false,
}: PriceCalculatorProps) {
  const { t } = useTranslation();
  const { fuelPrices, customFuelPrice, useCustomFuelPrice, setCustomFuelPrice, toggleCustomFuelPrice, getCurrentFuelPrice } = usePricingStore();

  const [pickupCity, setPickupCity] = useState(initialPickup || "");
  const [deliveryCity, setDeliveryCity] = useState(initialDelivery || "");
  const [truckType, setTruckType] = useState<TruckType>(initialTruck);
  const [weightTons, setWeightTons] = useState(initialWeight.toString());
  const [customDistance, setCustomDistance] = useState("");
  const [includeReturn, setIncludeReturn] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<PriceBreakdown | null>(null);

  const cities = Object.keys(IRAQ_CITIES_DISTANCES);
  const fuelType = getTruckFuelType(truckType);
  const fuelPrice = getCurrentFuelPrice(fuelType);
  const consumption = getFuelConsumptionInfo(truckType);

  const distance = customDistance
    ? parseFloat(customDistance)
    : getCityDistance(pickupCity, deliveryCity) || 0;

  const calculate = () => {
    if (distance <= 0) return;

    const weight = parseFloat(weightTons) || 0;
    const breakdown = calculateFreightPrice(
      distance,
      truckType,
      fuelPrice,
      weight,
      includeReturn
    );

    setCalculatedPrice(breakdown);
    onPriceCalculated?.(breakdown);
  };

  const suggested = distance > 0
    ? getSuggestedPrice(distance, truckType, fuelPrice, parseFloat(weightTons) || 0)
    : null;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactRow}>
          <View style={styles.compactItem}>
            <Fuel size={14} color={colors.flame} strokeWidth={2} />
            <Text style={styles.compactLabel}>{t("pricing.fuel")}</Text>
            <Text style={styles.compactValue}>{fuelPrice} IQD/L</Text>
          </View>
          <View style={styles.compactItem}>
            <Route size={14} color={colors.flame} strokeWidth={2} />
            <Text style={styles.compactLabel}>{t("pricing.distance")}</Text>
            <Text style={styles.compactValue}>{distance} km</Text>
          </View>
          <View style={styles.compactItem}>
            <Truck size={14} color={colors.flame} strokeWidth={2} />
            <Text style={styles.compactLabel}>{t("pricing.consumption")}</Text>
            <Text style={styles.compactValue}>{consumption.loaded}</Text>
          </View>
        </View>
        {suggested && (
          <View style={styles.compactSuggested}>
            <Text style={styles.compactSuggestedLabel}>{t("pricing.suggestedPrice")}</Text>
            <Text style={styles.compactSuggestedValue}>{formatPrice(suggested.suggested)}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calculator size={20} color={colors.flame} strokeWidth={2} />
        <Text style={styles.title}>{t("pricing.calculator")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("pricing.fuelPrice")}</Text>
        <View style={styles.fuelRow}>
          <View style={styles.fuelInfo}>
            <Text style={styles.fuelType}>
              {fuelType === "diesel" ? t("pricing.diesel") : t("pricing.regular")}
            </Text>
            <Text style={styles.fuelPrice}>
              {useCustomFuelPrice && customFuelPrice
                ? `${customFuelPrice} IQD/L`
                : `${fuelPrices[fuelType]} IQD/L`}
            </Text>
          </View>
          <View style={styles.fuelToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, !useCustomFuelPrice && styles.toggleBtnActive]}
              onPress={() => toggleCustomFuelPrice(false)}
            >
              <Text style={[styles.toggleText, !useCustomFuelPrice && styles.toggleTextActive]}>
                {t("pricing.market")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, useCustomFuelPrice && styles.toggleBtnActive]}
              onPress={() => toggleCustomFuelPrice(true)}
            >
              <Text style={[styles.toggleText, useCustomFuelPrice && styles.toggleTextActive]}>
                {t("pricing.custom")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {useCustomFuelPrice && (
          <TextInput
            style={styles.input}
            placeholder={t("pricing.enterFuelPrice")}
            placeholderTextColor={colors.inkFaint}
            keyboardType="numeric"
            value={customFuelPrice?.toString() || ""}
            onChangeText={(v) => setCustomFuelPrice(v ? parseFloat(v) : null)}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("pricing.route")}</Text>
        <View style={styles.routeInputs}>
          <View style={styles.routeInput}>
            <MapPin size={16} color="#4CAF50" strokeWidth={2} />
            <TextInput
              style={styles.cityInput}
              placeholder={t("pricing.pickupCity")}
              placeholderTextColor={colors.inkFaint}
              value={pickupCity}
              onChangeText={setPickupCity}
            />
          </View>
          <View style={styles.routeInput}>
            <MapPin size={16} color={colors.flame} strokeWidth={2} />
            <TextInput
              style={styles.cityInput}
              placeholder={t("pricing.deliveryCity")}
              placeholderTextColor={colors.inkFaint}
              value={deliveryCity}
              onChangeText={setDeliveryCity}
            />
          </View>
        </View>
        <View style={styles.distanceRow}>
          <Text style={styles.distanceLabel}>{t("pricing.orEnterDistance")}</Text>
          <TextInput
            style={styles.distanceInput}
            placeholder="0"
            placeholderTextColor={colors.inkFaint}
            keyboardType="numeric"
            value={customDistance}
            onChangeText={setCustomDistance}
          />
          <Text style={styles.distanceUnit}>km</Text>
        </View>
        {distance > 0 && !customDistance && (
          <View style={styles.calculatedDistance}>
            <Route size={14} color={colors.inkMuted} strokeWidth={2} />
            <Text style={styles.calculatedDistanceText}>
              {t("pricing.calculatedDistance")}: {distance} km (~{formatDuration(Math.round(distance / 60 * 60))})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("pricing.vehicleInfo")}</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>{t("pricing.truckType")}</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>{getTruckTypeLabel(truckType)}</Text>
            </View>
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>{t("pricing.weight")}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.weightInput}
                placeholder="0"
                placeholderTextColor={colors.inkFaint}
                keyboardType="numeric"
                value={weightTons}
                onChangeText={setWeightTons}
              />
              <Text style={styles.weightUnit}>ton</Text>
            </View>
          </View>
        </View>
        <View style={styles.consumptionInfo}>
          <Text style={styles.consumptionLabel}>{t("pricing.fuelConsumption")}:</Text>
          <Text style={styles.consumptionValue}>
            {t("pricing.empty")}: {consumption.empty} | {t("pricing.loaded")}: {consumption.loaded}
          </Text>
        </View>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.optionBtn, includeReturn && styles.optionBtnActive]}
          onPress={() => setIncludeReturn(!includeReturn)}
        >
          <Text style={[styles.optionText, includeReturn && styles.optionTextActive]}>
            {t("pricing.includeReturn")}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.calculateBtn, distance <= 0 && styles.calculateBtnDisabled]}
        onPress={calculate}
        disabled={distance <= 0}
        activeOpacity={0.9}
      >
        <Calculator size={18} color={colors.white} strokeWidth={2} />
        <Text style={styles.calculateBtnText}>{t("pricing.calculate")}</Text>
      </TouchableOpacity>

      {calculatedPrice && (
        <View style={styles.resultCard}>
          <TouchableOpacity
            style={styles.resultHeader}
            onPress={() => setShowDetails(!showDetails)}
          >
            <View>
              <Text style={styles.resultLabel}>{t("pricing.estimatedPrice")}</Text>
              <Text style={styles.resultPrice}>{formatPrice(calculatedPrice.total)}</Text>
              <Text style={styles.resultPerKm}>
                {formatPrice(calculatedPrice.pricePerKm)}/km
              </Text>
            </View>
            {showDetails ? (
              <ChevronUp size={20} color={colors.inkMuted} />
            ) : (
              <ChevronDown size={20} color={colors.inkMuted} />
            )}
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t("pricing.fuelCost")}</Text>
                <Text style={styles.breakdownValue}>
                  {formatPrice(calculatedPrice.fuelCost)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t("pricing.driverFee")}</Text>
                <Text style={styles.breakdownValue}>
                  {formatPrice(calculatedPrice.driverFee)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t("pricing.tollFees")}</Text>
                <Text style={styles.breakdownValue}>
                  {formatPrice(calculatedPrice.tollFees)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t("pricing.serviceFee")}</Text>
                <Text style={styles.breakdownValue}>
                  {formatPrice(calculatedPrice.serviceFee)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t("pricing.insurance")}</Text>
                <Text style={styles.breakdownValue}>
                  {formatPrice(calculatedPrice.insuranceFee)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {showSuggested && suggested && (
        <View style={styles.suggestedCard}>
          <Text style={styles.suggestedTitle}>{t("pricing.suggestedPrices")}</Text>
          <View style={styles.suggestedRow}>
            <View style={styles.suggestedItem}>
              <Text style={styles.suggestedLabel}>{t("pricing.minimum")}</Text>
              <Text style={styles.suggestedValue}>{formatPrice(suggested.min)}</Text>
            </View>
            <View style={[styles.suggestedItem, styles.suggestedItemMain]}>
              <Text style={styles.suggestedLabel}>{t("pricing.recommended")}</Text>
              <Text style={styles.suggestedValueMain}>{formatPrice(suggested.suggested)}</Text>
            </View>
            <View style={styles.suggestedItem}>
              <Text style={styles.suggestedLabel}>{t("pricing.maximum")}</Text>
              <Text style={styles.suggestedValue}>{formatPrice(suggested.max)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    ...shadow.soft,
  },
  compactContainer: {
    backgroundColor: colors.flameSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  compactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  compactItem: {
    alignItems: "center",
    gap: 4,
  },
  compactLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkMuted,
  },
  compactValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  compactSuggested: {
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,106,0,0.2)",
    alignItems: "center",
  },
  compactSuggestedLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  compactSuggestedValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.flame,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.md,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
  },
  section: {
    marginBottom: space.md,
  },
  sectionTitle: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  fuelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fuelInfo: {},
  fuelType: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  fuelPrice: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  fuelToggle: {
    flexDirection: "row",
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.flame,
  },
  toggleText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  input: {
    marginTop: space.sm,
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  routeInputs: {
    gap: space.sm,
  },
  routeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  cityInput: {
    flex: 1,
    paddingVertical: space.sm,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space.sm,
    gap: space.sm,
  },
  distanceLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  distanceInput: {
    width: 80,
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    textAlign: "center",
  },
  distanceUnit: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  calculatedDistance: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginTop: space.sm,
    padding: space.sm,
    backgroundColor: colors.flameSoft,
    borderRadius: radius.sm,
  },
  calculatedDistanceText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.flame,
  },
  row: {
    flexDirection: "row",
    gap: space.md,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 4,
  },
  selectBox: {
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  selectText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
  },
  weightInput: {
    flex: 1,
    paddingVertical: space.sm,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  weightUnit: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  consumptionInfo: {
    marginTop: space.sm,
    padding: space.sm,
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
  },
  consumptionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  consumptionValue: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.ink,
    marginTop: 2,
  },
  optionsRow: {
    marginBottom: space.md,
  },
  optionBtn: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.mist,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  optionBtnActive: {
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: colors.flame,
  },
  optionText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  optionTextActive: {
    color: colors.flame,
  },
  calculateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    backgroundColor: colors.flame,
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
  calculateBtnDisabled: {
    opacity: 0.5,
  },
  calculateBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  resultCard: {
    marginTop: space.md,
    padding: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  resultPrice: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.white,
  },
  resultPerKm: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  breakdown: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.xs,
  },
  breakdownLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  breakdownValue: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.white,
  },
  suggestedCard: {
    marginTop: space.md,
    padding: space.md,
    backgroundColor: colors.flameSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,106,0,0.2)",
  },
  suggestedTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginBottom: space.sm,
    textAlign: "center",
  },
  suggestedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  suggestedItem: {
    alignItems: "center",
    flex: 1,
  },
  suggestedItemMain: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: space.sm,
    marginHorizontal: space.xs,
  },
  suggestedLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkMuted,
  },
  suggestedValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  suggestedValueMain: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.flame,
  },
});
