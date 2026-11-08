import { Home, Tag, Ticket, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "../lib/theme";

export type TravelNavKey = "home" | "campaigns" | "trips" | "profile";

type Props = {
  active?: TravelNavKey;
  onPress: (key: TravelNavKey) => void;
};

const ITEMS: {
  key: TravelNavKey;
  Icon: typeof Home;
  labelKey: string;
}[] = [
  { key: "home", Icon: Home, labelKey: "travel.navHome" },
  { key: "campaigns", Icon: Tag, labelKey: "travel.navCampaigns" },
  { key: "trips", Icon: Ticket, labelKey: "travel.navTrips" },
  { key: "profile", Icon: User, labelKey: "travel.navProfile" },
];

export function TravelBottomNav({ active = "home", onPress }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(
            insets.bottom,
            Platform.OS === "ios" ? 10 : 8,
          ),
        },
      ]}
    >
      {ITEMS.map(({ key, Icon, labelKey }) => {
        const on = active === key;
        const color = on ? colors.flame : colors.inkFaint;
        return (
          <Pressable
            key={key}
            onPress={() => onPress(key)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
          >
            <Icon size={20} color={color} strokeWidth={on ? 2.4 : 2} />
            <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
              {t(labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    minHeight: 44,
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.inkFaint,
  },
  labelOn: {
    color: colors.flame,
    fontFamily: fonts.bodySemi,
  },
});
