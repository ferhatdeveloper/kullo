/**
 * Talabat Search + results (ekran 4 + 7).
 */
import { router } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Heart,
  Search,
  ShoppingBag,
  TrendingUp,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../OfflineCover";
import { useCurrencyStore } from "../../../lib/currency-store";
import { useFoodCartStore } from "../../../lib/food-cart-store";
import { useMarketplaceStore } from "../../../lib/marketplace-store";
import { TB, tbStyles as s } from "./mart-food-talabat.styles";

type Props = {
  onBack?: () => void;
  onGoCart?: () => void;
};

const CRAVINGS = [
  { key: "fast", label: "Fast Food", emoji: "🍟" },
  { key: "grills", label: "Grills", emoji: "🍢" },
  { key: "pizza", label: "Pizza", emoji: "🍕" },
  { key: "sandwiches", label: "Sandwiches", emoji: "🥪" },
  { key: "burgers", label: "Burgers", emoji: "🍔" },
];

const RECENT = ["naly", "mersin tantuni", "kfc", "adana kebab"];
const POPULAR = ["pizza", "burger king", "pizza hut", "burger", "dominos", "shawarma"];

const RESULT_TABS = ["All", "Food", "Groceries", "Stores", "Health+"] as const;

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k+`;
  return String(n);
}

export function FoodTalabatSearch({ onBack, onGoCart }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const restaurants = useMarketplaceStore((st) => st.restaurants);
  const cartCount = useFoodCartStore((st) => st.lines.reduce((n, l) => n + l.qty, 0));
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof RESULT_TABS)[number]>("Food");
  const [filter, setFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return [];
    return restaurants.filter((r) =>
      `${r.name} ${r.cuisine}`.toLowerCase().includes(qq),
    );
  }, [q, restaurants]);

  const showingResults = q.trim().length > 0;

  return (
    <View style={[s.searchScreen, { paddingTop: Math.max(insets.top, 4) }]}>
      <View style={s.searchTop}>
        <Pressable style={s.circleBtn} onPress={onBack} hitSlop={6}>
          <ChevronLeft size={20} color={TB.ink} strokeWidth={2.3} />
        </Pressable>
        <View style={s.searchField}>
          <Search size={16} color={TB.inkFaint} strokeWidth={2.2} />
          <TextInput
            style={s.searchInput}
            value={q}
            onChangeText={setQ}
            placeholder={t("food.searchDishes", {
              defaultValue: "Search for restaurants or dishes",
            })}
            placeholderTextColor={TB.inkFaint}
            autoFocus
            returnKeyType="search"
          />
          {q ? (
            <Pressable onPress={() => setQ("")} hitSlop={8}>
              <X size={16} color={TB.inkFaint} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={s.circleBtn} onPress={() => onGoCart?.()} hitSlop={6}>
          <ShoppingBag size={18} color={TB.ink} strokeWidth={2.2} />
          {cartCount > 0 ? (
            <View style={s.bagBadge}>
              <Text style={s.bagBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {!showingResults ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text
            style={[
              s.sectionTitle,
              { paddingHorizontal: TB.hMargin, marginTop: 16, marginBottom: 12 },
            ]}
          >
            {t("food.craving", { defaultValue: "What are you craving today?" })}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail}>
            {CRAVINGS.map((c) => (
              <Pressable
                key={c.key}
                style={s.cuisineItem}
                onPress={() => setQ(c.label.toLowerCase())}
              >
                <View style={s.cuisineCircle}>
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                  </View>
                </View>
                <Text style={s.cuisineLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[s.sectionTitle, { paddingHorizontal: TB.hMargin, marginTop: 24, fontSize: 17 }]}>
            {t("food.recentSearches", { defaultValue: "Recent searches" })}
          </Text>
          <View style={[s.chipGrid, { marginTop: 4 }]}>
            {RECENT.map((term) => (
              <Pressable key={term} style={s.historyChip} onPress={() => setQ(term)}>
                <Clock size={14} color={TB.inkFaint} strokeWidth={2} />
                <Text style={s.historyChipText}>{term}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[s.sectionTitle, { paddingHorizontal: TB.hMargin, marginTop: 24, fontSize: 17 }]}>
            {t("food.popularSearches", { defaultValue: "Popular searches" })}
          </Text>
          <View style={[s.chipGrid, { marginTop: 4 }]}>
            {POPULAR.map((term) => (
              <Pressable key={term} style={s.historyChip} onPress={() => setQ(term)}>
                <TrendingUp size={14} color={TB.inkFaint} strokeWidth={2} />
                <Text style={s.historyChipText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, backgroundColor: TB.paper }}>
          <View style={s.resultTabs}>
            {RESULT_TABS.map((tabKey) => (
              <Pressable
                key={tabKey}
                style={[s.resultTab, tab === tabKey && s.resultTabOn]}
                onPress={() => setTab(tabKey)}
              >
                <Text style={[s.resultTabText, tab === tabKey && s.resultTabTextOn]}>
                  {tabKey === "Food"
                    ? t("mart.chipFood")
                    : tabKey === "All"
                      ? t("food.cuisineAll")
                      : tabKey}
                </Text>
              </Pressable>
            ))}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: TB.hMargin, paddingVertical: 12 }}
          >
            {(
              [
                ["sort", "Sort by"],
                ["free", "Free delivery"],
                ["top", "Top rated"],
                ["fast", "Fast delivery"],
              ] as const
            ).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  s.filterChip,
                  filter === key && s.filterChipOn,
                ]}
                onPress={() => setFilter((c) => (c === key ? null : key))}
              >
                <Text style={s.filterChipText}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView showsVerticalScrollIndicator={false}>
            {results.length === 0 ? (
              <Text style={s.empty}>{t("food.empty")}</Text>
            ) : (
              results.map((r, i) => (
                <Pressable
                  key={r.id}
                  style={s.restRow}
                  onPress={() => router.push(`/food/${r.id}`)}
                >
                  <View style={s.restThumb}>
                    <OfflineCover uri={r.cover_url} label={r.name} style={s.restThumbImg} />
                    <View style={[s.heartBtn, { top: 6, right: 6 }]}>
                      <Heart size={12} color={TB.ink} strokeWidth={2} />
                    </View>
                    {!r.is_open ? (
                      <View style={s.restClosed}>
                        <Text style={s.restClosedText}>{t("food.closed").toUpperCase()}</Text>
                      </View>
                    ) : null}
                    {i === 0 ? (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 6,
                          left: 6,
                          backgroundColor: "rgba(0,0,0,0.55)",
                          borderRadius: 4,
                          paddingHorizontal: 5,
                          paddingVertical: 1,
                        }}
                      >
                        <Text style={{ fontFamily: "IBMPlexSans_600SemiBold", fontSize: 10, color: "#fff" }}>
                          Ad
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={s.restBody}>
                    {i % 2 === 0 ? (
                      <View style={s.popularTag}>
                        <TrendingUp size={12} color={TB.popularBlue} strokeWidth={2.4} />
                        <Text style={s.popularTagText}>
                          {t("food.popularIn", {
                            defaultValue: "Popular in {{cuisine}}",
                            cuisine: r.cuisine.split("/")[0]?.trim() ?? r.cuisine,
                          })}
                        </Text>
                      </View>
                    ) : null}
                    <View style={s.findNameRow}>
                      <Text style={s.restName} numberOfLines={1}>
                        {r.name}
                      </Text>
                      {i % 2 === 1 ? (
                        <View style={s.proBadge}>
                          <Text style={s.proBadgeText}>pro</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={s.restMeta}>
                      ★ {r.rating_avg.toFixed(1)} ({formatCount(r.rating_count)}) · {r.eta_min}–
                      {r.eta_min + 10} {t("food.min")} · {formatListing(r.delivery_fee_iqd, "IQD")}
                    </Text>
                    <View style={s.restDeals}>
                      <View style={s.offerPill}>
                        <Text style={s.offerPillText}>{[20, 50, 30][i % 3]}% off</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
