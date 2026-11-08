import { Plus, Search, Snowflake } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  CATEGORIES,
  productLabel,
  productsForAisle,
  type MartProduct,
} from "../../lib/mart-catalog";
import { useMartCartStore } from "../../lib/mart-cart-store";
import { useCurrencyStore } from "../../lib/currency-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const { width: W } = Dimensions.get("window");
const PAD = 16;

/** Market aisle / kategori grid + seçili aisle ürünleri */
export function MartMarket() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const add = useMartCartStore((s) => s.add);
  const [aisle, setAisle] = useState(CATEGORIES[0]?.id ?? "fruit");
  const [q, setQ] = useState("");

  const products = useMemo(() => {
    const base = productsForAisle(aisle);
    const qq = q.trim().toLowerCase();
    if (!qq) return base;
    return base.filter((p) => productLabel(p, lang).toLowerCase().includes(qq));
  }, [aisle, q, lang]);

  const onAdd = (p: MartProduct) => {
    void add({
      productId: p.id,
      name: productLabel(p, lang),
      unitPriceIqd: p.price,
      imageUri: typeof p.image === "object" && "uri" in p.image ? p.image.uri : undefined,
      aisle,
    });
  };

  const header = (
    <View>
      <View style={styles.searchBox}>
        <Search size={16} color={colors.inkFaint} strokeWidth={2.2} />
        <TextInput
          style={styles.searchInput}
          value={q}
          onChangeText={setQ}
          placeholder={t("mart.searchPlaceholder")}
          placeholderTextColor={colors.inkFaint}
        />
      </View>

      <Text style={styles.section}>{t("mart.shopByCategory")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.aisleRow}
      >
        {CATEGORIES.map((c) => {
          const on = aisle === c.id;
          return (
            <Pressable
              key={c.id}
              style={[styles.aisleChip, on && styles.aisleChipOn]}
              onPress={() => setAisle(c.id)}
            >
              <Image source={c.image} style={styles.aisleImg} resizeMode="contain" />
              {c.snow ? (
                <View style={styles.snow}>
                  <Snowflake size={9} color={colors.white} strokeWidth={2.4} />
                </View>
              ) : null}
              <Text style={[styles.aisleLabel, on && styles.aisleLabelOn]} numberOfLines={2}>
                {productLabel(c, lang)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.section}>
        {productLabel(CATEGORIES.find((c) => c.id === aisle) ?? CATEGORIES[0]!, lang)}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(p, i) => `${p.id}-${i}`}
      numColumns={2}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.cols}
      ListEmptyComponent={<Text style={styles.empty}>{t("mart.emptyAisle")}</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardImg}>
            <Image source={item.image} style={styles.fill} resizeMode="contain" />
            <Pressable style={styles.add} onPress={() => onAdd(item)}>
              <Plus size={18} color={colors.white} strokeWidth={2.6} />
            </Pressable>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {productLabel(item, lang)}
          </Text>
          <Text style={styles.price}>{formatListing(item.price, "IQD")}</Text>
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const cardW = (W - PAD * 2 - 12) / 2;

const styles = StyleSheet.create({
  list: { paddingHorizontal: PAD, paddingBottom: space.xxl * 2 },
  cols: { gap: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  section: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
    marginBottom: space.sm,
    marginTop: 4,
  },
  aisleRow: { gap: 10, paddingBottom: space.md },
  aisleChip: {
    width: 88,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  aisleChipOn: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  aisleImg: { width: 56, height: 56 },
  snow: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  aisleLabel: {
    marginTop: 4,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.inkMuted,
    textAlign: "center",
    minHeight: 26,
  },
  aisleLabelOn: { color: colors.ink, fontFamily: fonts.bodySemi },
  card: {
    width: cardW,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 12,
    ...shadow.soft,
  },
  cardImg: {
    height: cardW * 0.75,
    borderRadius: 12,
    backgroundColor: colors.mist,
    overflow: "hidden",
  },
  fill: { width: "100%", height: "100%" },
  add: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 8,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.ink,
    minHeight: 34,
  },
  price: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  empty: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
});
