import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftRight, Bus, Car, Hotel, Plane } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CarRentalSearchForm,
  type CarRentalDraft,
} from "../../components/CarRentalSearchForm";
import {
  HotelSearchForm,
  type HotelSearchDraft,
} from "../../components/HotelSearchForm";
import {
  TravelBottomNav,
  type TravelNavKey,
} from "../../components/TravelBottomNav";
import { TravelHubBelow } from "../../components/TravelHubBelow";
import {
  TravelSearchForm,
  type TravelSearchDraft,
} from "../../components/TravelSearchForm";
import {
  TransferSearchForm,
  type TransferSearchDraft,
} from "../../components/TransferSearchForm";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { CARS_RENT_HREF } from "../../lib/cars-routes";
import type { TravelMode } from "../../lib/travel";
import { colors, fonts, space } from "../../lib/theme";

type TabKey = TravelMode | "hotel" | "car";

const TABS: {
  key: TabKey;
  Icon: typeof Plane;
  titleKey: string;
}[] = [
  { key: "flight", Icon: Plane, titleKey: "travel.modeFlight" },
  { key: "hotel", Icon: Hotel, titleKey: "travel.modeHotel" },
  { key: "bus", Icon: Bus, titleKey: "travel.modeBus" },
  { key: "car", Icon: Car, titleKey: "travel.modeCar" },
  { key: "private", Icon: ArrowLeftRight, titleKey: "travel.modeTransfer" },
];

export default function TravelHubScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ mode?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const campaignsY = useRef(0);
  const initialTab = useMemo<TabKey>(() => {
    const m = String(params.mode ?? "");
    if (
      m === "bus" ||
      m === "private" ||
      m === "flight" ||
      m === "hotel" ||
      m === "car"
    ) {
      return m;
    }
    return "flight";
  }, [params.mode]);
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [nav, setNav] = useState<TravelNavKey>("home");

  const onTravelSubmit = (draft: TravelSearchDraft) => {
    const mode = tab as TravelMode;
    const q = {
      from: draft.from,
      to: draft.to,
      date: draft.date,
      adults: String(draft.adults),
      children: String(draft.children),
    };
    if (mode === "flight") {
      router.push({ pathname: "/travel/flights/results", params: q });
      return;
    }
    if (mode === "bus") {
      router.push({ pathname: "/travel/bus/results", params: q });
      return;
    }
  };

  const onHotelSubmit = (draft: HotelSearchDraft) => {
    router.push({
      pathname: "/hotels",
      params: {
        q: draft.q,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        adults: String(draft.adults),
        children: String(draft.children),
      },
    });
  };

  const onCarSubmit = (_draft: CarRentalDraft) => {
    router.push(CARS_RENT_HREF);
  };

  const onTransferSubmit = (draft: TransferSearchDraft) => {
    router.push({
      pathname: "/travel/private/book",
      params: {
        from: draft.from || "EBL",
        to: draft.to || "ISU",
        vehicle: "sedan",
      },
    });
  };

  const onBottomNav = (key: TravelNavKey) => {
    setNav(key);
    if (key === "home") {
      router.replace("/(tabs)");
      return;
    }
    if (key === "campaigns") {
      scrollRef.current?.scrollTo({
        y: Math.max(0, campaignsY.current - 12),
        animated: true,
      });
      return;
    }
    if (key === "trips") {
      Alert.alert(t("travel.navTrips"), t("travel.tripsSoon"));
      return;
    }
    router.push("/(tabs)/profile");
  };

  const travelMode: TravelMode | null =
    tab === "flight" || tab === "bus" ? tab : null;

  return (
    <Screen edges={["top"]} style={styles.root} brand>
      <ScreenHeader title={t("travel.title")} onBack={() => router.back()} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modes}>
          {TABS.map(({ key, Icon, titleKey }) => {
            const on = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={styles.modeItem}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
              >
                <View style={[styles.modeSquare, on && styles.modeSquareOn]}>
                  <Icon
                    size={20}
                    color={on ? colors.white : colors.inkMuted}
                    strokeWidth={2.1}
                  />
                </View>
                <Text style={[styles.modeLabel, on && styles.modeLabelOn]}>
                  {t(titleKey)}
                </Text>
                {on ? (
                  <View style={styles.modeDot} />
                ) : (
                  <View style={styles.modeDotSpacer} />
                )}
              </Pressable>
            );
          })}
        </View>

        {tab === "hotel" ? (
          <HotelSearchForm onSubmit={onHotelSubmit} />
        ) : tab === "car" ? (
          <CarRentalSearchForm onSubmit={onCarSubmit} />
        ) : tab === "private" ? (
          <TransferSearchForm onSubmit={onTransferSubmit} />
        ) : travelMode ? (
          <TravelSearchForm mode={travelMode} onSubmit={onTravelSubmit} />
        ) : null}

        <View
          onLayout={(e) => {
            campaignsY.current = e.nativeEvent.layout.y;
          }}
        >
          <TravelHubBelow
            onSeeAllCampaigns={() =>
              scrollRef.current?.scrollTo({
                y: Math.max(0, campaignsY.current - 12),
                animated: true,
              })
            }
          />
        </View>
      </ScrollView>

      <TravelBottomNav active={nav} onPress={onBottomNav} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#EEF3F8",
  },
  body: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  modes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.md,
    paddingTop: 2,
    paddingHorizontal: 2,
  },
  modeItem: {
    alignItems: "center",
    width: 62,
  },
  modeSquare: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9DDE3",
  },
  modeSquareOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  modeLabel: {
    marginTop: 6,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "center",
  },
  modeLabelOn: {
    color: colors.ink,
    fontFamily: fonts.bodySemi,
  },
  modeDot: {
    marginTop: 5,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.flame,
  },
  modeDotSpacer: {
    marginTop: 5,
    height: 3,
  },
});
