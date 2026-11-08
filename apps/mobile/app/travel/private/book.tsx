import { router, useLocalSearchParams } from "expo-router";
import { Car, Clock3, Route } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OsmMap } from "../../../components/OsmMap";
import {
  TravelSearchForm,
  type TravelSearchDraft,
} from "../../../components/TravelSearchForm";
import { Screen, ScreenHeader } from "../../../components/ui/Screen";
import { useCurrencyStore } from "../../../lib/currency-store";
import {
  placeLabel,
  privateMarkers,
  quotePrivateTransfer,
  type PrivateTransferQuote,
  type PrivateVehicleClass,
} from "../../../lib/travel";
import { colors, fonts, radius, shadow, space } from "../../../lib/theme";

export default function PrivateBookScreen() {
  const { t, i18n } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    vehicle?: string;
  }>();

  const [from, setFrom] = useState(String(params.from ?? "EBL").toUpperCase());
  const [to, setTo] = useState(String(params.to ?? "ISU").toUpperCase());
  const [vehicle, setVehicle] = useState<PrivateVehicleClass | null>(
    (params.vehicle as PrivateVehicleClass) || null,
  );
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<PrivateTransferQuote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void quotePrivateTransfer({ from, to, vehicle })
      .then((list) => {
        if (cancelled) return;
        setQuotes(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, vehicle]);

  const markers = useMemo(() => privateMarkers(from, to), [from, to]);
  const selected = quotes.find((q) => q.id === selectedId) ?? quotes[0];

  const onSearch = (draft: TravelSearchDraft) => {
    setFrom(draft.from);
    setTo(draft.to);
    setVehicle((draft.vehicle as PrivateVehicleClass) || null);
  };

  const book = () => {
    if (!selected) return;
    Alert.alert(
      t("travel.privateBookTitle"),
      t("travel.privateBookBody", {
        vehicle: t(`travel.vehicle.${selected.vehicle}`),
        price: formatListing(selected.price_iqd, "IQD"),
      }),
      [{ text: t("travel.ok") }],
    );
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("travel.privateTitle")}
        subtitle={`${placeLabel(from, lang)} → ${placeLabel(to, lang)}`}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapWrap}>
          {markers.length >= 2 ? (
            <OsmMap markers={markers} selectedId="pickup" zoom={7} />
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackText}>{t("travel.mapSoon")}</Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <TravelSearchForm
            mode="private"
            initial={{ from, to, vehicle: vehicle ?? "sedan" }}
            onSubmit={onSearch}
          />
        </View>

        <Text style={styles.section}>{t("travel.privateQuotes")}</Text>
        {loading ? (
          <ActivityIndicator color={colors.flame} style={{ marginTop: 16 }} />
        ) : (
          quotes.map((q) => {
            const on = q.id === (selected?.id ?? null);
            return (
              <Pressable
                key={q.id}
                onPress={() => setSelectedId(q.id)}
                style={[styles.quote, on && styles.quoteOn]}
              >
                <View style={styles.quoteIcon}>
                  <Car
                    size={16}
                    color={on ? colors.white : colors.flame}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quoteTitle, on && styles.quoteTitleOn]}>
                    {t(`travel.vehicle.${q.vehicle}`)}
                  </Text>
                  <View style={styles.metaRow}>
                    <Route size={12} color={on ? "#C8D6D2" : colors.inkFaint} />
                    <Text style={[styles.meta, on && styles.metaOn]}>
                      {t("travel.distanceKm", { n: q.distanceKm })}
                    </Text>
                    <Clock3
                      size={12}
                      color={on ? "#C8D6D2" : colors.inkFaint}
                    />
                    <Text style={[styles.meta, on && styles.metaOn]}>
                      {t("travel.durationHm", {
                        h: Math.floor(q.durationMin / 60),
                        m: q.durationMin % 60,
                      })}
                    </Text>
                  </View>
                  {q.fee_iqd ? (
                    <Text style={[styles.fee, on && styles.metaOn]}>
                      {t("travel.feeIncl", {
                        fee: formatListing(q.fee_iqd, "IQD"),
                      })}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.price, on && styles.quoteTitleOn]}>
                  {formatListing(q.price_iqd, "IQD")}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={styles.sticky}>
        <View>
          <Text style={styles.stickyLabel}>{t("travel.total")}</Text>
          <Text style={styles.stickyPrice}>
            {selected
              ? formatListing(selected.price_iqd, "IQD")
              : "—"}
          </Text>
        </View>
        <Pressable
          onPress={book}
          disabled={!selected}
          style={({ pressed }) => [
            styles.bookBtn,
            (!selected || pressed) && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.bookText}>{t("travel.bookPrivate")}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: space.lg,
    paddingBottom: 120,
  },
  mapWrap: {
    height: 180,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
  mapFallbackText: {
    fontFamily: fonts.body,
    color: colors.inkMuted,
  },
  formCard: {
    backgroundColor: colors.mist,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.lg,
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginBottom: space.sm,
  },
  quote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.sm,
    ...shadow.soft,
  },
  quoteOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  quoteIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  quoteTitleOn: { color: colors.white },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    flexWrap: "wrap",
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginRight: 8,
  },
  metaOn: { color: "#C8D6D2" },
  fee: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
  },
  price: {
    fontFamily: fonts.displayMed,
    fontSize: 15,
    color: colors.ink,
  },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadow.card,
  },
  stickyLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  stickyPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  bookBtn: {
    backgroundColor: colors.flame,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  bookText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.white,
  },
});
