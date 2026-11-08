import { router } from "expo-router";
import { ChevronRight, Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { type VehicleListItem } from "../VehicleCard";
import { storage } from "../../lib/clients";
import { useCurrencyStore } from "../../lib/currency-store";
import { CARS, carsHomeStyles as s } from "./cars-home.styles";

/**
 * Lifestyle hero — car + city atmosphere (Unsplash).
 * Structure matches Dubicars first-page photo card.
 */
/** Lifestyle car + city — closer to Dubicars hero atmosphere */
const HERO_URI =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85";
const SELL_URI =
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=80";
const RENT_URI =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80";
const PROMO_HAVAL = require("../../assets/cars/promo-haval-v7.png");

export type CarsHomeDealer = {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  city?: string | null;
  verified?: boolean;
};

function dealerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  count: number;
  loading?: boolean;
  topPicks: VehicleListItem[];
  dealers?: CarsHomeDealer[];
  catalog?: VehicleListItem[];
  onSearch: () => void;
  onSeeAllPicks: () => void;
};

function coverUri(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${storage.url}/${url}`;
}

function CarsTopPickCard({ vehicle }: { vehicle: VehicleListItem }) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const price = formatListing(vehicle.price_amount, vehicle.price_currency);
  const makeModel = ((vehicle.make_name ?? "") + " " + (vehicle.model ?? "")).trim();
  const title = vehicle.title ?? (makeModel || t("vehicle.fallbackTitle"));
  const imageUri = coverUri(vehicle.cover_url);
  const metaBits = [
    vehicle.city,
    vehicle.body_name ?? vehicle.transmission_name,
    vehicle.year != null ? String(vehicle.year) : null,
    vehicle.mileage_km != null
      ? t("vehicle.mileageShort", { count: Math.round(vehicle.mileage_km / 1000) })
      : null,
  ].filter(Boolean) as string[];

  return (
    <TouchableOpacity
      style={s.pickCard}
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      activeOpacity={0.92}
    >
      <View style={s.pickImageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.pickImage} resizeMode="cover" />
        ) : (
          <View style={[s.pickImage, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ color: CARS.inkFaint, fontSize: 12 }}>{t("vehicle.noPhoto")}</Text>
          </View>
        )}
        <View style={s.pickBadge}>
          <Text style={s.pickBadgeText}>
            {t("cars.topPickBadge", { defaultValue: t("vehicle.featuredBadge") })}
          </Text>
        </View>
      </View>
      <View style={s.pickBody}>
        <Text style={s.pickTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={s.pickPrice}>{price}</Text>
        <Text style={s.pickMeta} numberOfLines={1}>
          {[t("cars.salePrice"), ...metaBits].join(" · ")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Dubicars "Featured dealers" landscape card — 1:1 anatomy:
 * left image (~43%) + optional logo overlay → title → price → Spec | Year | km
 * No chips, icons, Call/WA.
 */
function CarsDealerRow({
  vehicle,
  logoUri,
  dealerName,
}: {
  vehicle: VehicleListItem;
  logoUri?: string | null;
  dealerName?: string;
}) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((st) => st.formatListing);
  const price = formatListing(vehicle.price_amount, vehicle.price_currency);
  const makeModel = ((vehicle.make_name ?? "") + " " + (vehicle.model ?? "")).trim();
  const title = vehicle.title ?? (makeModel || t("vehicle.fallbackTitle"));
  const imageUri = coverUri(vehicle.cover_url);
  const logo = coverUri(logoUri);
  const pipeBits = [
    vehicle.body_name ?? vehicle.transmission_name ?? vehicle.fuel_name,
    vehicle.year != null ? String(vehicle.year) : null,
    vehicle.mileage_km != null
      ? `${Math.round(vehicle.mileage_km).toLocaleString("en-US")} km`
      : null,
  ].filter(Boolean) as string[];

  return (
    <TouchableOpacity
      style={s.dealerRow}
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      activeOpacity={0.92}
    >
      <View style={s.dealerImgWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.dealerThumb} resizeMode="cover" />
        ) : (
          <View style={[s.dealerThumb, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ color: CARS.dealerMeta, fontSize: 11 }}>{t("vehicle.noPhoto")}</Text>
          </View>
        )}
        <View style={s.dealerLogoWrap} pointerEvents="none">
          {logo ? (
            <Image source={{ uri: logo }} style={s.dealerLogo} resizeMode="cover" />
          ) : (
            <View style={s.dealerLogo}>
              <Text style={s.dealerLogoText}>{dealerInitials(dealerName ?? "G")}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={s.dealerRowBody}>
        <Text style={s.dealerRowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={s.dealerRowPrice} numberOfLines={1}>
          {price}
        </Text>
        {pipeBits.length > 0 ? (
          <Text style={s.dealerRowMeta} numberOfLines={1}>
            {pipeBits.join(" | ")}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Dedicated Kullo cars **first screen** (Ana) — visual clone of Dubicars home.
 * Tokens live only in `cars-home.styles.ts`.
 */
export function DubicarsHome({
  count,
  loading,
  topPicks,
  dealers = [],
  catalog = [],
  onSearch,
  onSeeAllPicks,
}: Props) {
  const { t } = useTranslation();
  const brandLine = t("cars.heroBrand");
  const brandParts = brandLine.includes("Kullo") ? brandLine.split(/Kullo/) : null;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.pad}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground source={{ uri: HERO_URI }} style={s.hero} imageStyle={s.heroImage}>
        <View style={s.heroScrimTop} />
        <View style={s.heroScrimBottom} />
        <View style={s.heroCopy}>
          <Text style={s.heroLead}>{t("cars.heroLead").trim()}</Text>
          <Text style={s.heroFind}>
            {brandParts ? (
              <>
                {brandParts[0]}
                <Text style={s.heroAccent}>Kullo</Text>
                {brandParts.slice(1).join("Kullo")}
              </>
            ) : (
              <Text style={s.heroAccent}>{brandLine}</Text>
            )}
          </Text>
        </View>

        <TouchableOpacity
          style={s.heroSearch}
          activeOpacity={0.92}
          onPress={onSearch}
          accessibilityRole="button"
        >
          <Search size={18} color={CARS.inkMuted} strokeWidth={2.2} />
          <Text style={s.heroSearchText} numberOfLines={1}>
            {t("home.searchPlaceholder")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.heroCta} activeOpacity={0.9} onPress={onSearch}>
          {loading ? (
            <ActivityIndicator color={CARS.white} />
          ) : (
            <Text style={s.heroCtaText}>
              {t("home.searchCars", { count: Math.max(count, 0) })}
            </Text>
          )}
        </TouchableOpacity>
      </ImageBackground>

      <Text style={s.sectionTitle}>{t("search.smartServices")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.servicesRail}
      >
        <TouchableOpacity
          style={s.serviceCard}
          activeOpacity={0.92}
          onPress={() => router.push("/vehicle-sell")}
        >
          <Image source={{ uri: SELL_URI }} style={s.serviceImage} resizeMode="cover" />
          <View style={s.serviceBody}>
            <Text style={s.serviceTitle}>{t("search.serviceSell")}</Text>
            <Text style={s.serviceHint} numberOfLines={2}>
              {t("cars.serviceSellHint")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.serviceCard}
          activeOpacity={0.92}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/search",
              params: { intent: "buy", carsPane: "search" },
            })
          }
        >
          <Image source={{ uri: RENT_URI }} style={s.serviceImage} resizeMode="cover" />
          <View style={s.serviceBody}>
            <Text style={s.serviceTitle}>{t("cars.serviceBrowse")}</Text>
            <Text style={s.serviceHint} numberOfLines={2}>
              {t("cars.serviceBrowseHint")}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={s.promoWrap}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel="HAVAL V7 PHEV"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/search",
            params: { intent: "buy", q: "Haval", openResults: "1" },
          })
        }
      >
        <Image source={PROMO_HAVAL} style={s.promoImage} resizeMode="cover" />
      </TouchableOpacity>

      {topPicks.length > 0 ? (
        <View style={s.block}>
          <View style={s.blockHead}>
            <Text style={s.sectionTitleFlush}>{t("cars.topPicks")}</Text>
            <TouchableOpacity
              style={s.seeAllHit}
              onPress={onSeeAllPicks}
              hitSlop={8}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t("cars.seeAll")}
            >
              <Text style={s.seeAll}>{t("cars.seeAll")}</Text>
              <ChevronRight size={15} color={CARS.purple} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.picksRail}
          >
            {topPicks.map((v) => (
              <CarsTopPickCard key={`pick-${v.id}`} vehicle={{ ...v, featured: true }} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {dealers.length > 0 ? (
        <View style={s.block}>
          <Text style={s.dealersHeading}>{t("cars.featuredDealers")}</Text>
          {dealers.map((store, di) => {
            const inventory = catalog
              .filter((v) => v.seller_id === store.user_id)
              .slice(0, 6);
            const rail =
              inventory.length > 0
                ? inventory
                : catalog.slice(di * 2, di * 2 + 4).length
                  ? catalog.slice(di * 2, di * 2 + 4)
                  : catalog.slice(0, 4);
            if (rail.length === 0) return null;
            const logoUri = store.avatar_url ?? null;
            return (
              <View key={store.user_id} style={s.dealerBlock}>
                <TouchableOpacity
                  onPress={() => router.push(`/seller/${store.user_id}`)}
                  activeOpacity={0.88}
                >
                  <Text style={s.dealerNameOnly} numberOfLines={1}>
                    {store.display_name}
                  </Text>
                </TouchableOpacity>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  contentContainerStyle={s.dealerRail}
                >
                  {rail.map((v) => (
                    <CarsDealerRow
                      key={`dl-${store.user_id}-${v.id}`}
                      vehicle={v}
                      logoUri={logoUri}
                      dealerName={store.display_name}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={s.bottomPad} />
    </ScrollView>
  );
}

/** @deprecated Use DubicarsHome — kept as alias for older imports */
export { DubicarsHome as CarsHomeScreen };
