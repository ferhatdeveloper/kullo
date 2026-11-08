import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { RealtyCard } from "../../components/RealtyCard";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { useMarketplaceStore } from "../../lib/marketplace-store";
import {
  applyRealtyFilters,
  parseRealtyQuery,
} from "../../lib/realty-filters";
import { useRealtyFavorites } from "../../lib/realty-favorites-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const SUGGESTIONS = [
  "Erbil’de 3+1 satılık daire",
  "Bağdat kiralık 2 yatak",
  "Villa + havuz Shaqlawa",
  "100 m² altı ofis",
];

export default function RealtyAiSearchScreen() {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const realty = useMarketplaceStore((s) => s.realty);
  const favToggle = useRealtyFavorites((s) => s.toggle);
  const favHas = useRealtyFavorites((s) => s.has);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    return applyRealtyFilters(realty, parseRealtyQuery(submitted));
  }, [submitted, realty]);

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={t("realty.aiTitle")} onBack={() => router.back()} />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Sparkles size={22} color={colors.white} />
        </View>
        <Text style={styles.heroTitle}>{t("realty.aiTitle")}</Text>
        <Text style={styles.heroSub}>{t("realty.aiSub")}</Text>
      </View>

      <View style={styles.searchBox}>
        <Sparkles size={18} color={colors.flame} />
        <TextInput
          style={styles.input}
          placeholder={t("realty.aiPlaceholder")}
          placeholderTextColor={colors.inkFaint}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmitted(query)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.go}
          onPress={() => setSubmitted(query)}
          activeOpacity={0.9}
        >
          <Text style={styles.goText}>{t("realty.search")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>{t("realty.aiHint")}</Text>
        <View style={styles.sugRow}>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.sug}
              onPress={() => {
                setQuery(s);
                setSubmitted(s);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.sugText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {submitted ? (
          <>
            <Text style={styles.results}>
              {t("realty.resultsCount", { count: results.length })}
            </Text>
            {results.length === 0 ? (
              <Text style={styles.empty}>{t("realty.empty")}</Text>
            ) : (
              results.map((item) => (
                <RealtyCard
                  key={item.id}
                  item={item}
                  variant="feed"
                  favorited={favHas(item.id)}
                  priceLabel={formatListing(item.price_amount, item.price_currency)}
                  saleLabel={t("realty.offer.sale")}
                  rentLabel={t("realty.offer.rent")}
                  hotLabel={t("realty.hot")}
                  typeLabel={t(`realty.kinds.${item.kind}`)}
                  onPress={() => router.push(`/realty/${item.id}`)}
                  onFavorite={() => void favToggle(item.id)}
                />
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: space.lg,
    marginBottom: space.md,
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: space.lg,
    alignItems: "flex-start",
    gap: 6,
    ...shadow.soft,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.white,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: space.lg,
    marginBottom: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.flameSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  go: {
    backgroundColor: colors.flame,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  goText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl * 2,
    gap: space.sm,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  sugRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: space.md },
  sug: {
    backgroundColor: colors.flameSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FFD0B8",
  },
  sugText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.flameDeep,
  },
  results: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
