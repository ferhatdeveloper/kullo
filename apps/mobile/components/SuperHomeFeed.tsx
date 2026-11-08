import { router } from "expo-router";
import {
  Briefcase,
  Building2,
  Car,
  CarTaxiFront,
  ChevronRight,
  Droplets,
  Hammer,
  Hotel,
  KeyRound,
  Plane,
  ShoppingBasket,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

import { ListingStatusBadge } from "./ListingStatusBadge";
import { OfflineCover } from "./OfflineCover";
import { SoftGradient as LinearGradient } from "./SoftGradient";
import { useCurrencyStore } from "../lib/currency-store";
import {
  DEMO_RENTALS,
  DEMO_VEHICLES,
  type DemoGoodsListing,
  type DemoRealtyListing,
  type DemoRestaurant,
  type DemoShop,
} from "../lib/demo-data";
import { BUY_AGAIN, TOP_SAVERS, type MartProduct } from "../lib/mart-catalog";
import { useMarketplaceStore } from "../lib/marketplace-store";
import { FLOWERS, FLORISTS } from "../lib/flowers-catalog";
import {
  featuredHotels,
  HOTEL_CITY_LABEL_KEY,
} from "../lib/hotels-catalog";
import {
  featuredProviders,
  HEALTH_CITY_LABEL_KEY,
} from "../lib/health-catalog";
import {
  CAREER_CITY_LABEL_KEY,
  featuredJobs,
  jobTitle,
} from "../lib/career-catalog";
import { DoctorCard } from "./DoctorCard";
import { HotelCard } from "./HotelCard";
import { JobCard } from "./JobCard";
import { VehicleCard, type VehicleListItem } from "./VehicleCard";
import { colors, fonts, radius, shadow, space } from "../lib/theme";

type Props = {
  vehicles?: VehicleListItem[];
  /** market Ana: üstteki hub/circle zaten var — hero + entry gizle */
  compact?: boolean;
};

const PROMO_MID_URI =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80";

const SERVICE_RAIL: {
  key: string;
  titleKey: string;
  hintKey: string;
  uri: string;
  Icon: typeof Car;
  go: () => void;
}[] = [
  {
    key: "ride",
    titleKey: "hub.ride",
    hintKey: "modeSelect.hintRide",
    uri: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    Icon: CarTaxiFront,
    go: () => router.push("/taxi"),
  },
  {
    key: "wash",
    titleKey: "hub.wash",
    hintKey: "modeSelect.hintWash",
    uri: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
    Icon: Droplets,
    go: () => router.push("/car-wash"),
  },
  {
    key: "travel",
    titleKey: "hub.travel",
    hintKey: "modeSelect.hintTravel",
    uri: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    Icon: Plane,
    go: () => router.push("/travel"),
  },
  {
    key: "hotels",
    titleKey: "hub.hotels",
    hintKey: "modeSelect.hintHotels",
    uri: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    Icon: Hotel,
    go: () => router.push("/hotels"),
  },
  {
    key: "health",
    titleKey: "hub.health",
    hintKey: "modeSelect.hintHealth",
    uri: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    Icon: Stethoscope,
    go: () => router.push("/health"),
  },
  {
    key: "career",
    titleKey: "hub.career",
    hintKey: "modeSelect.hintCareer",
    uri: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    Icon: Briefcase,
    go: () => router.push("/career"),
  },
  {
    key: "trades",
    titleKey: "hub.trades",
    hintKey: "modeSelect.hintTrades",
    uri: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    Icon: Hammer,
    go: () => router.push("/trades"),
  },
  {
    key: "services",
    titleKey: "tabs.services",
    hintKey: "servicesHub.subtitle",
    uri: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
    Icon: Wrench,
    go: () => router.push("/(tabs)/services"),
  },
];

/** Ana ana ekran — yoğun marketplace keşif (her dikeyden ray). */
export function SuperHomeFeed({ vehicles, compact = false }: Props) {
  const { t, i18n } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const realty = useMarketplaceStore((s) => s.realty);
  const goods = useMarketplaceStore((s) => s.goods);
  const shops = useMarketplaceStore((s) => s.shops);
  const restaurants = useMarketplaceStore((s) => s.restaurants);
  const lang = (i18n.language?.startsWith("tr") ? "tr" : "en") as "tr" | "en";

  const cars = (vehicles?.length ? vehicles : DEMO_VEHICLES).slice(0, 10);
  const homes = (realty.length ? realty : []).slice(0, 10);
  const fashion = (goods.length ? goods : []).slice(0, 10);
  const food = restaurants.filter((r) => r.is_open).slice(0, 10);
  const storeRail = (shops.length ? shops : []).slice(0, 8);
  const flash = [...TOP_SAVERS, ...BUY_AGAIN].slice(0, 10);
  const rentals = DEMO_RENTALS.slice(0, 8);
  const hotels = featuredHotels(8);
  const doctors = featuredProviders(6);
  const jobs = featuredJobs(6);

  const forYou = [
    ...fashion.filter((g) => g.featured).slice(0, 3),
    ...homes.slice(0, 2),
    ...food.slice(0, 2),
  ].slice(0, 8);

  return (
    <View style={styles.wrap}>
      {!compact ? (
        <>
          <Text style={styles.hero}>{t("superHome.title")}</Text>
          <Text style={styles.heroSub}>{t("superHome.subtitle")}</Text>

          <View style={styles.entryRow}>
            <Entry
              Icon={UtensilsCrossed}
              label={t("hub.food")}
              onPress={() =>
                router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } })
              }
            />
            <Entry
              Icon={ShoppingBasket}
              label={t("hub.market")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/mart",
                  params: { martPane: "market" },
                })
              }
            />
            <Entry
              Icon={CarTaxiFront}
              label={t("hub.taxi")}
              onPress={() => router.push("/taxi")}
            />
            <Entry
              Icon={Building2}
              label={t("hub.realty")}
              onPress={() => router.push("/(tabs)/realty")}
            />
            <Entry
              Icon={Car}
              label={t("hub.buy")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/search",
                  params: { intent: "buy", carsPane: "home" },
                })
              }
            />
            <Entry
              Icon={KeyRound}
              label={t("hub.rent")}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/rentals",
                  params: { intent: "rent", rentPane: "home" },
                })
              }
            />
          </View>
        </>
      ) : null}

      <Section
        title={t("superHome.forYouFeed")}
        seeAll={t("home.seeAll")}
        onSeeAll={() =>
          router.push({
            pathname: "/(tabs)/search",
            params: { intent: "buy", openResults: "1" },
          })
        }
      >
        <HScroll>
          {forYou.map((item) => {
            if ("cuisine" in item) {
              const r = item as DemoRestaurant;
              return (
                <Card
                  key={`fy-${r.id}`}
                  uri={r.cover_url}
                  title={r.name}
                  price={`★ ${r.rating_avg.toFixed(1)} · ${r.eta_min} ${t("food.min")}`}
                  onPress={() => router.push(`/food/${r.id}`)}
                />
              );
            }
            if ("shop_id" in item) {
              const g = item as DemoGoodsListing;
              return (
                <Card
                  key={`fy-${g.id}`}
                  uri={g.cover_url}
                  title={g.title}
                  price={formatListing(g.price_amount, g.price_currency)}
                  status={g.listing_status}
                  onPress={() => router.push(`/shop/${g.id}`)}
                />
              );
            }
            const r = item as DemoRealtyListing;
            return (
              <Card
                key={`fy-${r.id}`}
                uri={r.cover_url}
                title={r.title}
                price={formatListing(r.price_amount, r.price_currency)}
                status={r.listing_status}
                onPress={() => router.push(`/realty/${r.id}`)}
              />
            );
          })}
          {cars.slice(0, 3).map((v, i) => (
            <VehicleCard key={`fy-car-${v.id}`} vehicle={v} index={i} variant="featured" />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.flowers")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/food/flowers")}
      >
        <HScroll>
          {FLOWERS.map((f) => (
            <Card
              key={f.id}
              uri={f.uri}
              title={t(f.nameKey)}
              price={formatListing(f.price_iqd, "IQD")}
              onPress={() => router.push("/food/flowers")}
            />
          ))}
          {FLORISTS.map((s) => (
            <Card
              key={s.id}
              uri={s.uri}
              title={t(s.nameKey)}
              price={`★ ${s.rating.toFixed(1)} · ${s.eta_min} ${t("food.min")}`}
              onPress={() => router.push("/food/flowers")}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.hotels")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/hotels")}
      >
        <HScroll>
          {hotels.map((h) => (
            <HotelCard
              key={h.id}
              hotel={h}
              variant="rail"
              price={formatListing(h.price_amount, h.price_currency)}
              cityLabel={t(HOTEL_CITY_LABEL_KEY[h.city])}
              nightLabel={t("hotels.perNight")}
              reviewsLabel={t("hotels.reviews")}
              badgeLabel={t("hotels.featured")}
              onPress={() => router.push(`/hotels/${h.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.health")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/health")}
      >
        <HScroll>
          {doctors.map((p) => (
            <DoctorCard
              key={p.id}
              provider={p}
              variant="rail"
              price={formatListing(p.fee_iqd, p.price_currency)}
              cityLabel={t(HEALTH_CITY_LABEL_KEY[p.city])}
              specialtyLabel={t(`health.specialty.${p.specialty}`)}
              feeLabel={t("health.perVisit")}
              badgeLabel={t("health.featured")}
              onPress={() => router.push(`/health/${p.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.career")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/career")}
      >
        <HScroll>
          {jobs.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                variant="rail"
                title={jobTitle(j, lang)}
                cityLabel={t(CAREER_CITY_LABEL_KEY[j.city])}
                workModelLabel={t(`career.workModel.${j.work_model}`)}
                employmentLabel={t(`career.employment.${j.employment}`)}
                relativeLabel={
                  j.posted_days_ago <= 0
                    ? t("career.postedHours", { hours: j.posted_hours_ago ?? 3 })
                    : j.posted_days_ago === 1
                      ? t("career.postedDay")
                      : t("career.postedDaysShort", { days: j.posted_days_ago })
                }
                onPress={() => router.push(`/career/${j.id}`)}
              />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("hub.buy")}
        seeAll={t("home.seeAll")}
        onSeeAll={() =>
          router.push({
            pathname: "/(tabs)/search",
            params: { intent: "buy", carsPane: "home" },
          })
        }
      >
        <HScroll>
          {cars.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i} variant="featured" />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("hub.rent")}
        seeAll={t("home.seeAll")}
        onSeeAll={() =>
          router.push({
            pathname: "/(tabs)/rentals",
            params: { intent: "rent", rentPane: "home" },
          })
        }
      >
        <HScroll>
          {rentals.map((r) => {
            const daily = formatListing(r.daily_rate_amount, r.daily_rate_currency);
            const deposit =
              r.deposit_amount != null
                ? formatListing(r.deposit_amount, r.daily_rate_currency)
                : null;
            return (
              <Card
                key={r.id}
                uri={r.vehicle.cover_url}
                title={r.vehicle.title_original ?? t("vehicle.fallbackTitle")}
                price={`${daily} ${t("rentals.perDay")}${
                  deposit ? ` · ${t("rentals.depositShort")} ${deposit}` : ""
                }`}
                onPress={() =>
                  router.push({
                    pathname: "/rental/[id]",
                    params: { id: r.id, intent: "rent" },
                  })
                }
              />
            );
          })}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.realty")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/(tabs)/realty")}
      >
        <HScroll>
          {homes.map((r: DemoRealtyListing) => (
            <Card
              key={r.id}
              uri={r.cover_url}
              title={r.title}
              price={formatListing(r.price_amount, r.price_currency)}
              status={r.listing_status}
              onPress={() => router.push(`/realty/${r.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Pressable
        style={styles.midPromo}
        onPress={() => router.push("/(tabs)/shop")}
      >
        <OfflineCover uri={PROMO_MID_URI} style={styles.midPromoImg} />
        <LinearGradient
          colors={["rgba(12,45,41,0.2)", "rgba(12,45,41,0.85)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.midPromoGrad}
        >
          <Text style={styles.midPromoEyebrow}>{t("superHome.deals")}</Text>
          <Text style={styles.midPromoTitle}>{t("superHome.bannerFashion")}</Text>
          <Text style={styles.midPromoSub}>{t("superHome.promoFashionSub")}</Text>
        </LinearGradient>
      </Pressable>

      <Section
        title={t("superHome.flashMart")}
        seeAll={t("home.seeAll")}
        onSeeAll={() =>
          router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } })
        }
      >
        <HScroll>
          {flash.map((p, i) => (
            <ProductCard
              key={`flash-${p.id}-${i}`}
              product={p}
              lang={lang}
              price={formatListing(p.pro ?? p.price, "IQD")}
              onPress={() =>
                router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } })
              }
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.popularFood")}
        seeAll={t("home.seeAll")}
        onSeeAll={() =>
          router.push({ pathname: "/(tabs)/mart", params: { martPane: "home" } })
        }
      >
        <HScroll>
          {food.map((r: DemoRestaurant) => (
            <Card
              key={r.id}
              uri={r.cover_url}
              title={r.name}
              price={`★ ${r.rating_avg.toFixed(1)} · ${r.eta_min} ${t("food.min")}`}
              onPress={() => router.push(`/food/${r.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.shop")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/(tabs)/shop")}
      >
        <HScroll>
          {fashion.map((g: DemoGoodsListing) => (
            <Card
              key={g.id}
              uri={g.cover_url}
              title={g.title}
              price={formatListing(g.price_amount, g.price_currency)}
              status={g.listing_status}
              onPress={() => router.push(`/shop/${g.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.shops")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/(tabs)/stores")}
      >
        <HScroll>
          {storeRail.map((s: DemoShop) => (
            <Card
              key={s.id}
              uri={s.cover_url}
              title={s.name}
              price={
                s.rating_avg
                  ? `★ ${s.rating_avg.toFixed(1)} · ${s.city}`
                  : s.city
              }
              onPress={() => router.push(`/shop-store/${s.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.rentals")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/(tabs)/rentals")}
      >
        <HScroll>
          {rentals.map((r) => (
            <Card
              key={r.id}
              uri={r.vehicle.cover_url}
              title={r.vehicle.title_original}
              price={`${formatListing(r.daily_rate_amount, r.daily_rate_currency)} / ${t("rentals.perDay")}`}
              onPress={() => router.push(`/rental/${r.id}`)}
            />
          ))}
        </HScroll>
      </Section>

      <Section
        title={t("superHome.services")}
        seeAll={t("home.seeAll")}
        onSeeAll={() => router.push("/(tabs)/services")}
      >
        <HScroll>
          {SERVICE_RAIL.map((s) => (
            <Pressable key={s.key} style={styles.serviceCard} onPress={s.go}>
              <OfflineCover uri={s.uri} label={t(s.titleKey)} style={styles.serviceCover} />
              <View style={styles.serviceBody}>
                <View style={styles.serviceIcon}>
                  <s.Icon size={14} color={colors.flame} strokeWidth={2.3} />
                </View>
                <Text style={styles.serviceTitle} numberOfLines={1}>
                  {t(s.titleKey)}
                </Text>
                <Text style={styles.serviceHint} numberOfLines={2}>
                  {t(s.hintKey)}
                </Text>
              </View>
            </Pressable>
          ))}
        </HScroll>
      </Section>
    </View>
  );
}

function Entry({
  Icon,
  label,
  onPress,
}: {
  Icon: typeof Car;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.entry} onPress={onPress}>
      <View style={styles.entryIcon}>
        <Icon size={18} color={colors.flame} strokeWidth={2.3} />
      </View>
      <Text style={styles.entryLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function Section({
  title,
  seeAll,
  onSeeAll,
  children,
}: {
  title: string;
  seeAll: string;
  onSeeAll: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable style={styles.seeAll} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>{seeAll}</Text>
          <ChevronRight size={14} color={colors.flame} strokeWidth={2.3} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function HScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children}
    </ScrollView>
  );
}

function Card({
  uri,
  title,
  price,
  status,
  onPress,
}: {
  uri?: string | null;
  title: string;
  price: string;
  status?: "active" | "sold" | "rented" | "reserved" | "closed" | null;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <OfflineCover uri={uri} label={title} style={styles.cover} />
        <View style={styles.statusOverlay}>
          <ListingStatusBadge status={status} compact />
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.cardPrice} numberOfLines={1}>
        {price}
      </Text>
    </Pressable>
  );
}

function ProductCard({
  product,
  lang,
  price,
  onPress,
}: {
  product: MartProduct;
  lang: "tr" | "en";
  price: string;
  onPress: () => void;
}) {
  const name = product.names[lang] || product.names.en;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={product.image as ImageSourcePropType}
        style={styles.cover}
        resizeMode="contain"
      />
      <Text style={styles.cardTitle} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.cardPrice} numberOfLines={1}>
        {price}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md, marginBottom: space.md, paddingTop: 2 },
  hero: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    paddingHorizontal: space.lg,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    paddingHorizontal: space.lg,
    marginTop: -6,
  },
  entryRow: {
    flexDirection: "row",
    paddingHorizontal: space.lg,
    gap: 8,
  },
  entry: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 10,
    ...shadow.soft,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  entryLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.ink,
  },
  section: { gap: 8 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: "#4A90D9",
  },
  row: { paddingHorizontal: space.lg, gap: 10 },
  card: {
    width: 148,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  cover: { width: 148, height: 96, borderRadius: 0, backgroundColor: colors.white },
  statusOverlay: {
    position: "absolute",
    left: 6,
    bottom: 6,
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
    paddingHorizontal: 8,
    paddingTop: 6,
    minHeight: 28,
  },
  cardPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 13,
    color: colors.flameDeep,
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginTop: 2,
  },
  midPromo: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 100,
    backgroundColor: colors.ink,
    ...shadow.soft,
  },
  midPromoImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  midPromoGrad: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: space.lg,
    paddingVertical: 16,
    justifyContent: "center",
  },
  midPromoEyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.flameMid,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  midPromoTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
  },
  midPromoSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  serviceCard: {
    width: 156,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.soft,
  },
  serviceCover: { width: 156, height: 88, borderRadius: 0 },
  serviceBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  serviceIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
  },
  serviceHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
});
