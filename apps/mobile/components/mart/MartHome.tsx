import { router } from "expo-router";
import { MapPin, Plus, Search, Snowflake, Zap } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BEVERAGES,
  BEST_SELLERS,
  BRANDS,
  BUY_AGAIN,
  CATEGORIES,
  DAIRY,
  EXPLORE,
  LOGO_BRANDS,
  NESCAFE_ROW,
  SNACKS,
  TOP_SAVERS,
  WORLD,
  productLabel,
  type MartProduct,
} from "../../lib/mart-catalog";
import { useMartCartStore } from "../../lib/mart-cart-store";
import { useCityStore } from "../../lib/city-store";
import { useCurrencyStore } from "../../lib/currency-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";
import { martHref } from "./MartShell";

const { width: W } = Dimensions.get("window");
const PAD = 16;
const GAP = 10;

function AddBtn({ onPress, size = 30 }: { onPress: () => void; size?: number }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={[styles.addBtn, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Plus size={size * 0.55} color={colors.white} strokeWidth={2.6} />
    </Pressable>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProductChip({
  product,
  lang,
  onAdd,
  width = 110,
  showSave,
}: {
  product: MartProduct;
  lang: string;
  onAdd: () => void;
  width?: number;
  showSave?: boolean;
}) {
  const formatListing = useCurrencyStore((s) => s.formatListing);
  return (
    <View style={[styles.chip, { width }]}>
      <View style={styles.chipImgWrap}>
        <Image source={product.image} style={styles.chipImg} resizeMode="contain" />
        {showSave && product.save ? (
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>-{product.save}%</Text>
          </View>
        ) : null}
        <View style={styles.chipAdd}>
          <AddBtn onPress={onAdd} />
        </View>
      </View>
      <Text style={styles.chipName} numberOfLines={2}>
        {productLabel(product, lang)}
      </Text>
      <Text style={styles.chipPrice}>{formatListing(product.price, "IQD")}</Text>
    </View>
  );
}

function ProductRow({
  title,
  action,
  onAction,
  products,
  lang,
  onAdd,
  showSave,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  products: MartProduct[];
  lang: string;
  onAdd: (p: MartProduct) => void;
  showSave?: boolean;
}) {
  return (
    <View style={styles.rowBlock}>
      <SectionTitle title={title} action={action} onAction={onAction} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hPad}
      >
        {products.map((p, i) => (
          <ProductChip
            key={`${p.id}-${i}`}
            product={p}
            lang={lang}
            onAdd={() => onAdd(p)}
            showSave={showSave}
          />
        ))}
      </ScrollView>
    </View>
  );
}

/** M10 Home anatomisi — Kullo token’larıyla */
export function MartHome() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const insets = useSafeAreaInsets();
  const city = useCityStore((s) => s.city);
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const add = useMartCartStore((s) => s.add);
  const cartCount = useMartCartStore((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const cartTotal = useMartCartStore((s) =>
    s.lines.reduce((s2, l) => s2 + l.unitPriceIqd * l.qty, 0),
  );

  const [flashLeft, setFlashLeft] = useState(2 * 60 * 60 + 14 * 60 + 37);
  useEffect(() => {
    const id = setInterval(() => setFlashLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const addressLabel = city === "all" ? "Erbil, Ankawa" : String(city);
  const logoTile = Math.floor((W - PAD * 2 - GAP * 3) / 4);
  const exploreW = Math.floor((W - PAD * 2 - GAP) / 2);
  const flashProducts = useMemo(() => TOP_SAVERS.slice(0, 8), []);

  const h = Math.floor(flashLeft / 3600);
  const m = Math.floor((flashLeft % 3600) / 60);
  const s = flashLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const cells = [pad(h), pad(m), pad(s)];

  const onAdd = (p: MartProduct) => {
    void add({
      productId: p.id,
      name: productLabel(p, lang),
      unitPriceIqd: p.price,
      imageUri: typeof p.image === "object" && "uri" in p.image ? p.image.uri : undefined,
      aisle: "produce",
    });
  };

  const goMarket = () => router.replace(martHref("market"));
  const goCart = () => router.replace(martHref("cart"));
  const goFood = () => router.replace(martHref("food"));

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable style={styles.addr} onPress={() => {}}>
          <MapPin size={16} color={colors.flame} strokeWidth={2.3} />
          <View style={styles.flex}>
            <Text style={styles.deliverTo}>{t("mart.deliverTo")}</Text>
            <Text style={styles.address} numberOfLines={1}>
              {addressLabel}
            </Text>
          </View>
        </Pressable>
        <View style={styles.modeChips}>
          <Pressable style={[styles.modeChip, styles.modeChipOn]} onPress={() => {}}>
            <Text style={[styles.modeChipText, styles.modeChipTextOn]}>{t("mart.chipMarket")}</Text>
          </Pressable>
          <Pressable style={styles.modeChip} onPress={goFood}>
            <Text style={styles.modeChipText}>{t("mart.chipFood")}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.searchBox} onPress={goMarket}>
        <Search size={16} color={colors.inkFaint} strokeWidth={2.2} />
        <Text style={styles.searchPh}>{t("mart.searchPlaceholder")}</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 110 + insets.bottom : 28 }}
      >
        {/* Flash sale */}
        <View style={styles.flash}>
          <Pressable style={styles.flashHead} onPress={goMarket}>
            <View style={styles.flashZap}>
              <Zap size={16} color={colors.white} fill={colors.white} strokeWidth={2.4} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.flashTitle}>{t("mart.flashSale")}</Text>
              <Text style={styles.flashEnds}>{t("mart.endsIn")}</Text>
            </View>
            <View style={styles.timerRow}>
              {cells.map((cell, i) => (
                <View key={`${i}-${cell}`} style={styles.timerCellWrap}>
                  {i > 0 ? <Text style={styles.timerColon}>:</Text> : null}
                  <View style={styles.timerCell}>
                    <Text style={styles.timerText}>{cell}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 12 }}
          >
            {flashProducts.map((p, i) => (
              <ProductChip
                key={`flash-${p.id}-${i}`}
                product={p}
                lang={lang}
                onAdd={() => onAdd(p)}
                showSave
                width={104}
              />
            ))}
          </ScrollView>
        </View>

        {/* Brands rail */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.hPad, { paddingTop: 8 }]}
        >
          {BRANDS.map((b) => (
            <Pressable key={b.id} style={styles.brandCard} onPress={goMarket}>
              <View style={[styles.brandAccent, { backgroundColor: b.accent }]} />
              {b.image ? (
                <Image source={b.image} style={styles.brandImg} resizeMode="contain" />
              ) : null}
              <Text style={styles.brandName}>{b.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ProductRow
          title={t("mart.buyAgain")}
          action={t("mart.viewAll")}
          onAction={goMarket}
          products={BUY_AGAIN}
          lang={lang}
          onAdd={onAdd}
        />

        {/* Categories 3×4 */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle title={t("mart.shopByCategory")} />
          <View style={styles.catGrid}>
            {CATEGORIES.slice(0, 12).map((c) => (
              <Pressable key={c.id} style={styles.catTile} onPress={goMarket}>
                <View style={styles.catImgWrap}>
                  <Image source={c.image} style={styles.catImg} resizeMode="contain" />
                  {c.snow ? (
                    <View style={styles.snowBadge}>
                      <Snowflake size={10} color={colors.white} strokeWidth={2.4} />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.catLabel} numberOfLines={2}>
                  {productLabel(c, lang)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Shop by brand */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle title={t("mart.shopByBrand")} />
          <View style={styles.logoGrid}>
            {LOGO_BRANDS.map((b) => (
              <Pressable
                key={b.id}
                onPress={goMarket}
                style={[
                  styles.logoTile,
                  { width: logoTile, height: logoTile, backgroundColor: b.color },
                ]}
              >
                <Text style={styles.logoText}>{b.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Around the world */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle title={t("mart.aroundWorld")} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hPad}
          >
            {WORLD.map((w) => (
              <Pressable key={w.id} style={styles.worldItem} onPress={goMarket}>
                <View style={[styles.worldCircle, { backgroundColor: w.bg }]}>
                  <Text style={styles.worldEmoji}>{w.emoji}</Text>
                </View>
                <Text style={styles.worldLabel}>
                  {lang.startsWith("tr") ? w.names.tr : w.names.en}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Fresh banner + row */}
        <View style={{ marginTop: 18 }}>
          <Pressable style={styles.bannerFresh} onPress={goMarket}>
            <Text style={styles.bannerTitle}>{t("mart.freshProduce")}</Text>
            <Text style={styles.bannerSub}>{t("mart.freshProduceSub")}</Text>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.hPad, { paddingTop: 12 }]}
          >
            {BEST_SELLERS.map((p, i) => (
              <ProductChip
                key={`fresh-${p.id}-${i}`}
                product={p}
                lang={lang}
                onAdd={() => onAdd(p)}
                width={118}
              />
            ))}
          </ScrollView>
        </View>

        {/* NESCAFÉ */}
        <View style={{ marginTop: 18 }}>
          <Pressable style={styles.bannerNescafe} onPress={goMarket}>
            <Text style={styles.bannerTitleLight}>NESCAFÉ</Text>
            <Text style={styles.bannerSubLight}>{t("mart.nescafeSub")}</Text>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.hPad, { paddingTop: 12 }]}
          >
            {NESCAFE_ROW.map((p, i) => (
              <ProductChip
                key={`nescafe-${p.id}-${i}`}
                product={p}
                lang={lang}
                onAdd={() => onAdd(p)}
                width={118}
              />
            ))}
          </ScrollView>
        </View>

        <ProductRow
          title={t("mart.topSavers")}
          action={t("mart.viewAll")}
          onAction={goMarket}
          products={TOP_SAVERS}
          lang={lang}
          onAdd={onAdd}
          showSave
        />
        <ProductRow
          title={t("mart.dairy")}
          action={t("mart.viewAll")}
          onAction={goMarket}
          products={DAIRY}
          lang={lang}
          onAdd={onAdd}
        />
        <ProductRow
          title={t("mart.snacks")}
          action={t("mart.viewAll")}
          onAction={goMarket}
          products={SNACKS}
          lang={lang}
          onAdd={onAdd}
        />
        <ProductRow
          title={t("mart.drinks")}
          action={t("mart.viewAll")}
          onAction={goMarket}
          products={BEVERAGES}
          lang={lang}
          onAdd={onAdd}
        />

        {/* Explore grid */}
        <View style={{ marginTop: 18, marginBottom: 12 }}>
          <SectionTitle title={t("mart.explore")} />
          <View style={styles.exploreGrid}>
            {EXPLORE.map((p, i) => (
              <View key={`ex-${p.id}-${i}`} style={{ width: exploreW, marginBottom: 14 }}>
                <View style={[styles.exploreImg, { width: exploreW, height: exploreW * 0.85 }]}>
                  <Image source={p.image} style={styles.fill} resizeMode="contain" />
                  <View style={styles.exploreAdd}>
                    <AddBtn onPress={() => onAdd(p)} size={34} />
                  </View>
                </View>
                <Text numberOfLines={2} style={styles.exploreName}>
                  {productLabel(p, lang)}
                </Text>
                <Text style={styles.explorePrice}>{formatListing(p.price, "IQD")}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {cartCount > 0 ? (
        <Pressable
          style={[styles.stickyCart, { bottom: Math.max(insets.bottom, 8) + 4 }]}
          onPress={goCart}
        >
          <View style={styles.stickyBadge}>
            <Text style={styles.stickyBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.stickyLabel}>{t("mart.viewCart")}</Text>
          <Text style={styles.stickyTotal}>{formatListing(cartTotal, "IQD")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1, minWidth: 0 },
  topBar: {
    paddingHorizontal: PAD,
    paddingTop: 4,
    gap: 8,
  },
  addr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliverTo: { fontFamily: fonts.body, fontSize: 11, color: colors.inkFaint },
  address: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  modeChips: { flexDirection: "row", gap: 8, marginBottom: 4 },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modeChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  modeChipText: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.inkMuted,
  },
  modeChipTextOn: { color: colors.white, fontFamily: fonts.bodySemi },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: PAD,
    marginTop: 6,
    marginBottom: 4,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchPh: { fontFamily: fonts.body, fontSize: 14, color: colors.inkFaint },
  flash: {
    marginHorizontal: PAD,
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  flashHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255,255,255,0.18)",
  },
  flashZap: {
    width: 34,
    height: 34,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.flameDeep,
    transform: [{ rotate: "-6deg" }],
  },
  flashTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  flashEnds: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  timerCellWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  timerColon: { fontFamily: fonts.display, fontSize: 14, color: colors.white },
  timerCell: {
    minWidth: 26,
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: colors.flame,
    alignItems: "center",
  },
  timerText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
    fontVariant: ["tabular-nums"],
  },
  hPad: { paddingHorizontal: PAD, gap: 10 },
  brandCard: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.white,
    marginRight: 10,
    overflow: "hidden",
    ...shadow.soft,
  },
  brandAccent: { height: 6, width: "100%" },
  brandImg: { flex: 1, width: "100%", marginTop: 8 },
  brandName: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    textAlign: "center",
    paddingVertical: 8,
  },
  rowBlock: { marginTop: 18 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PAD,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 17,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    textDecorationLine: "underline",
  },
  chip: { marginRight: 10 },
  chipImgWrap: {
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: "hidden",
    ...shadow.soft,
  },
  chipImg: { width: "100%", height: "100%" },
  chipAdd: { position: "absolute", right: 6, bottom: 6 },
  chipName: {
    marginTop: 6,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.ink,
    minHeight: 32,
  },
  chipPrice: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  addBtn: {
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  saveBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: colors.flameSoft,
    borderWidth: 1,
    borderColor: colors.flame,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.flameDeep },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
    gap: GAP,
  },
  catTile: { width: (W - PAD * 2 - GAP * 2) / 3 - 0.5, alignItems: "center" },
  catImgWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: "hidden",
    ...shadow.soft,
  },
  catImg: { width: "100%", height: "100%" },
  snowBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: {
    marginTop: 6,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
    minHeight: 28,
  },
  logoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
    gap: GAP,
  },
  logoTile: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  logoText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  worldItem: { alignItems: "center", marginRight: 14, width: 76 },
  worldCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  worldEmoji: { fontSize: 28 },
  worldLabel: {
    marginTop: 6,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  bannerFresh: {
    marginHorizontal: PAD,
    borderRadius: 16,
    padding: space.lg,
    backgroundColor: colors.flameSoft,
    minHeight: 88,
    justifyContent: "center",
  },
  bannerNescafe: {
    marginHorizontal: PAD,
    borderRadius: 16,
    padding: space.lg,
    backgroundColor: colors.ink,
    minHeight: 88,
    justifyContent: "center",
  },
  bannerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  bannerSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.85,
    marginTop: 4,
  },
  bannerTitleLight: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
  },
  bannerSubLight: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
    justifyContent: "space-between",
  },
  exploreImg: {
    borderRadius: 16,
    backgroundColor: colors.mist,
    overflow: "hidden",
  },
  fill: { width: "100%", height: "100%" },
  exploreAdd: { position: "absolute", right: 10, bottom: 10 },
  exploreName: {
    marginTop: 8,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  explorePrice: {
    marginTop: 2,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  stickyCart: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...shadow.float,
  },
  stickyBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  stickyBadgeText: {
    fontFamily: fonts.displayMed,
    fontSize: 14,
    color: colors.white,
  },
  stickyLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.white,
  },
  stickyTotal: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
});
