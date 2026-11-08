import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
  offerCommission,
  useB2BStore,
  type B2BOffer,
} from "../../lib/b2b-store";
import { useCurrencyStore } from "../../lib/currency-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function B2BDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrate = useB2BStore((s) => s.hydrate);
  const hydrated = useB2BStore((s) => s.hydrated);
  const role = useB2BStore((s) => s.role);
  const requests = useB2BStore((s) => s.requests);
  const allOffers = useB2BStore((s) => s.offers);
  const addOffer = useB2BStore((s) => s.addOffer);
  const acceptOffer = useB2BStore((s) => s.acceptOffer);
  const formatListing = useCurrencyStore((s) => s.formatListing);

  const [wholesalerName, setWholesalerName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const request = useMemo(
    () => (hydrated && id ? requests.find((r) => r.id === id) : undefined),
    [hydrated, id, requests],
  );
  const offers = useMemo(
    () =>
      hydrated && id
        ? allOffers
            .filter((o) => o.requestId === id)
            .sort((a, b) => a.totalPrice_iqd - b.totalPrice_iqd)
        : [],
    [hydrated, id, allOffers],
  );

  if (hydrated && !request) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader
          title={t("b2b.notFound")}
          onBack={() => router.back()}
        />
      </Screen>
    );
  }

  if (!request) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("b2b.title")} onBack={() => router.back()} />
      </Screen>
    );
  }

  const submitOffer = async () => {
    const unit = Number(unitPrice.replace(/[^\d]/g, ""));
    const days = Number(deliveryDays.replace(/[^\d]/g, ""));
    if (!wholesalerName.trim() || !Number.isFinite(unit) || unit <= 0) {
      Alert.alert(t("b2b.offerInvalidTitle"), t("b2b.offerInvalidBody"));
      return;
    }
    setBusy(true);
    try {
      await addOffer({
        requestId: request.id,
        wholesalerName: wholesalerName.trim(),
        unitPrice_iqd: unit,
        totalPrice_iqd: unit * request.quantity,
        deliveryDays: Number.isFinite(days) && days > 0 ? days : 3,
        note: note.trim() || undefined,
      });
      setWholesalerName("");
      setUnitPrice("");
      setNote("");
    } finally {
      setBusy(false);
    }
  };

  const onAccept = (offer: B2BOffer) => {
    const c = offerCommission(offer.totalPrice_iqd);
    Alert.alert(
      t("b2b.acceptTitle"),
      t("b2b.acceptBody", {
        wholesaler: offer.wholesalerName,
        gross: formatListing(c.gross, "IQD", i18n.language),
        commission: formatListing(c.commission, "IQD", i18n.language),
        net: formatListing(c.net, "IQD", i18n.language),
        percent: c.ratePercent,
      }),
      [
        { text: t("b2b.cancel"), style: "cancel" },
        {
          text: t("b2b.acceptConfirm"),
          onPress: () => void acceptOffer(request.id, offer.id),
        },
      ],
    );
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("b2b.detailTitle")}
        subtitle={request.companyName}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.pad}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{request.title}</Text>
            <Text style={styles.heroMeta}>
              {request.quantity} {request.unit} · {request.city} ·{" "}
              {t(`b2b.category.${request.category}`)}
            </Text>
            {request.notes ? (
              <Text style={styles.notes}>{request.notes}</Text>
            ) : null}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                {t(`b2b.status.${request.status}`)}
              </Text>
            </View>
          </View>

          <Text style={styles.section}>
            {t("b2b.offersSection", { count: offers.length })}
          </Text>

          {offers.length === 0 ? (
            <Text style={styles.empty}>{t("b2b.noOffers")}</Text>
          ) : (
            offers.map((o) => {
              const c = offerCommission(o.totalPrice_iqd);
              return (
                <View key={o.id} style={styles.offerCard}>
                  <Text style={styles.offerName}>{o.wholesalerName}</Text>
                  <Text style={styles.offerPrice}>
                    {formatListing(o.totalPrice_iqd, "IQD", i18n.language)}
                  </Text>
                  <Text style={styles.offerMeta}>
                    {t("b2b.unitPrice")}:{" "}
                    {formatListing(o.unitPrice_iqd, "IQD", i18n.language)} ·{" "}
                    {t("b2b.deliveryDays", { days: o.deliveryDays })}
                  </Text>
                  <View style={styles.commBox}>
                    <Text style={styles.commTitle}>
                      {t("b2b.commissionLabel", { percent: c.ratePercent })}
                    </Text>
                    <Text style={styles.commLine}>
                      {t("b2b.commissionAmount")}:{" "}
                      {formatListing(c.commission, "IQD", i18n.language)}
                    </Text>
                    <Text style={styles.commLine}>
                      {t("b2b.netToWholesaler")}:{" "}
                      {formatListing(c.net, "IQD", i18n.language)}
                    </Text>
                  </View>
                  {o.note ? <Text style={styles.offerNote}>{o.note}</Text> : null}
                  {o.status === "accepted" ? (
                    <Text style={styles.acceptedBadge}>
                      {t("b2b.status.accepted")}
                    </Text>
                  ) : null}
                  {role === "company" &&
                  request.status === "open" &&
                  o.status === "pending" ? (
                    <Pressable
                      style={styles.acceptBtn}
                      onPress={() => onAccept(o)}
                    >
                      <Text style={styles.acceptBtnText}>
                        {t("b2b.acceptOffer")}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}

          {role === "wholesale" && request.status === "open" ? (
            <View style={styles.form}>
              <Text style={styles.section}>{t("b2b.placeOffer")}</Text>
              <TextInput
                value={wholesalerName}
                onChangeText={setWholesalerName}
                placeholder={t("b2b.placeholder.wholesaler")}
                placeholderTextColor={colors.inkFaint}
                style={styles.input}
              />
              <TextInput
                value={unitPrice}
                onChangeText={setUnitPrice}
                placeholder={t("b2b.placeholder.unitPrice")}
                placeholderTextColor={colors.inkFaint}
                keyboardType="number-pad"
                style={styles.input}
              />
              <TextInput
                value={deliveryDays}
                onChangeText={setDeliveryDays}
                placeholder={t("b2b.placeholder.delivery")}
                placeholderTextColor={colors.inkFaint}
                keyboardType="number-pad"
                style={styles.input}
              />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t("b2b.placeholder.offerNote")}
                placeholderTextColor={colors.inkFaint}
                style={styles.input}
              />
              {unitPrice ? (
                <Text style={styles.preview}>
                  {t("b2b.totalPreview", {
                    amount: formatListing(
                      Number(unitPrice.replace(/[^\d]/g, "") || 0) *
                        request.quantity,
                      "IQD",
                      i18n.language,
                    ),
                  })}
                </Text>
              ) : null}
              <Pressable
                style={[styles.cta, busy && { opacity: 0.6 }]}
                disabled={busy}
                onPress={() => void submitOffer()}
              >
                <Text style={styles.ctaText}>{t("b2b.submitOffer")}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: space.lg,
    paddingBottom: space.section,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.lg,
    ...shadow.card,
  },
  heroTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 6,
  },
  heroMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  notes: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
  },
  statusRow: { marginTop: space.md },
  statusLabel: {
    alignSelf: "flex-start",
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
    backgroundColor: colors.flameSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginBottom: space.sm,
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.inkFaint,
    marginBottom: space.lg,
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    ...shadow.soft,
  },
  offerName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  offerPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.flame,
    marginTop: 4,
  },
  offerMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  commBox: {
    marginTop: space.sm,
    backgroundColor: colors.brandSoft,
    borderRadius: radius.md,
    padding: space.sm,
  },
  commTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  commLine: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  offerNote: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  acceptedBadge: {
    marginTop: space.sm,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.flameDeep,
  },
  acceptBtn: {
    marginTop: space.md,
    backgroundColor: colors.flame,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  acceptBtnText: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.white,
  },
  form: { marginTop: space.md },
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
    marginBottom: space.sm,
  },
  preview: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  cta: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.white,
  },
});
