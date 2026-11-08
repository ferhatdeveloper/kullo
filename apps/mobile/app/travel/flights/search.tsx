import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";

import {
  TravelSearchForm,
  type TravelSearchDraft,
} from "../../../components/TravelSearchForm";
import { Screen, ScreenHeader } from "../../../components/ui/Screen";
import { space } from "../../../lib/theme";

export default function FlightSearchScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    date?: string;
    adults?: string;
    children?: string;
  }>();

  const onSubmit = (draft: TravelSearchDraft) => {
    router.push({
      pathname: "/travel/flights/results",
      params: {
        from: draft.from,
        to: draft.to,
        date: draft.date,
        adults: String(draft.adults),
        children: String(draft.children),
      },
    });
  };

  return (
    <Screen edges={["top"]} style={styles.root}>
      <ScreenHeader
        title={t("travel.flightSearch")}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <TravelSearchForm
          mode="flight"
          initial={{
            from: params.from,
            to: params.to,
            date: params.date,
            adults: params.adults ? Number(params.adults) : undefined,
            children: params.children ? Number(params.children) : undefined,
          }}
          onSubmit={onSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#EEF3F8" },
  body: {
    paddingHorizontal: space.lg,
    paddingBottom: space.section,
  },
});
