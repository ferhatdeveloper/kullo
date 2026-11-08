import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Clock3, MapPin } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import { commissionBreakdown } from "../../lib/kullo-commission";
import {
  TRADE_CITY_LABEL_KEY,
  useTradesStore,
  type TradeOffer,
} from "../../lib/trades-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

export default function TradeJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Array.isArray(id) ? id[0] : id;
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);

  const hydrate = useTradesStore((s) => s.hydrate);
  const hydrated = useTradesStore((s) => s.hydrated);
  const role = useTradesStore((s) => s.role);
  const jobs = useTradesStore((s) => s.jobs);
  const submitOffer = useTradesStore((s) => s.submitOffer);
  const acceptOffer = useTradesStore((s) => s.acceptOffer);
  const allOffers = useTradesStore((s) => s.offers);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState("1");
  const [workerName, setWorkerName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const job = jobId ? jobs.find((j) => j.id === jobId) : undefined;
  const liveOffers = useMemo(
    () =>
      allOffers
        .filter((o) => o.jobId === jobId)
        .sort(
          (a, b) =>
            Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
            a.amount_iqd - b.amount_iqd,
        ),
    [allOffers, jobId],
  );

  if (!job) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title={t("trades.title")} onBack={() => router.back()} />
        <Text style={styles.notFound}>{t("trades.notFound")}</Text>
      </Screen>
    );
  }

  const onOffer = async () => {
    const amountNum = Number(String(amount).replace(/[^\d]/g, ""));
    const daysNum = Number(String(days).replace(/[^\d]/g, "")) || 1;
    const name = workerName.trim() || t("trades.defaultWorker");
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      Alert.alert(t("trades.offerRequiredTitle"), t("trades.offerRequiredBody"));
      return;
    }
    setSaving(true);
    try {
      await submitOffer({
        jobId: job.id,
        workerName: name,
        workerTitle: t(`trades.category.${job.category}`),
        amount_iqd: amountNum,
        note: note.trim() || t("trades.defaultOfferNote"),
        days: Math.max(1, daysNum),
      });
      setAmount("");
      setNote("");
      setDays("1");
      Alert.alert(t("trades.offerSentTitle"), t("trades.offerSentBody"));
    } finally {
      setSaving(false);
    }
  };

  const onAccept = (offer: TradeOffer) => {
    const br = commissionBreakdown(offer.amount_iqd);
    Alert.alert(
      t("trades.acceptTitle"),
      t("trades.acceptBody", {
        worker: offer.workerName,
        gross: formatListing(br.gross, "IQD"),
        commission: formatListing(br.commission, "IQD"),
        net: formatListing(br.net, "IQD"),
        rate: br.ratePercent,
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("trades.acceptConfirm"),
          onPress: () => void acceptOffer(job.id, offer.id),
        },
      ],
    );
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={job.title}
        subtitle={t(`trades.category.${job.category}`)}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.statusPill,
                job.status === "open" && styles.statusOpen,
                job.status === "awarded" && styles.statusAwarded,
                job.status === "closed" && styles.statusClosed,
              ]}
            >
              <Text style={styles.statusText}>
                {t(`trades.status.${job.status}`)}
              </Text>
            </View>
            <Text style={styles.budget}>
              {formatListing(job.budget_iqd, "IQD")}
            </Text>
          </View>
          <Text style={styles.desc}>{job.description}</Text>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.inkFaint} strokeWidth={2.2} />
            <Text style={styles.meta}>
              {t(TRADE_CITY_LABEL_KEY[job.city])} · {job.customerName}
            </Text>
          </View>
        </View>

        {role === "worker" && job.status === "open" ? (
          <View style={styles.offerBox}>
            <Text style={styles.sectionTitle}>{t("trades.makeOffer")}</Text>
            <Text style={styles.commissionHint}>
              {t("trades.commissionHint", {
                rate: commissionBreakdown(0).ratePercent,
              })}
            </Text>
            <TextInput
              style={styles.input}
              value={workerName}
              onChangeText={setWorkerName}
              placeholder={t("trades.fields.workerNamePh")}
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder={t("trades.fields.offerAmountPh")}
              placeholderTextColor={colors.inkFaint}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              value={days}
              onChangeText={setDays}
              placeholder={t("trades.fields.daysPh")}
              placeholderTextColor={colors.inkFaint}
              keyboardType="number-pad"
            />
            <TextInput
              style={[styles.input, styles.area]}
              value={note}
              onChangeText={setNote}
              placeholder={t("trades.fields.offerNotePh")}
              placeholderTextColor={colors.inkFaint}
              multiline
              textAlignVertical="top"
            />
            {amount ? (
              <CommissionStrip
                amount={Number(String(amount).replace(/[^\d]/g, "")) || 0}
              />
            ) : null}
            <Button
              label={t("trades.submitOffer")}
              onPress={() => void onOffer()}
              loading={saving}
              variant="primary"
            />
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          {t("trades.offersTitle", { count: liveOffers.length })}
        </Text>

        {liveOffers.length === 0 ? (
          <Text style={styles.empty}>{t("trades.offersEmpty")}</Text>
        ) : (
          liveOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              canAccept={role === "customer" && job.status === "open"}
              onAccept={() => onAccept(offer)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function CommissionStrip({ amount }: { amount: number }) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const br = commissionBreakdown(amount);
  return (
    <View style={styles.commStrip}>
      <Text style={styles.commLine}>
        {t("trades.breakdown.gross", {
          amount: formatListing(br.gross, "IQD"),
        })}
      </Text>
      <Text style={styles.commLine}>
        {t("trades.breakdown.commission", {
          rate: br.ratePercent,
          amount: formatListing(br.commission, "IQD"),
        })}
      </Text>
      <Text style={styles.commNet}>
        {t("trades.breakdown.net", {
          amount: formatListing(br.net, "IQD"),
        })}
      </Text>
    </View>
  );
}

function OfferCard({
  offer,
  canAccept,
  onAccept,
}: {
  offer: TradeOffer;
  canAccept: boolean;
  onAccept: () => void;
}) {
  const { t } = useTranslation();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const br = commissionBreakdown(offer.amount_iqd);

  return (
    <View style={styles.offerCard}>
      <View style={styles.offerTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.offerName}>{offer.workerName}</Text>
          <Text style={styles.offerTitle}>{offer.workerTitle}</Text>
        </View>
        <View
          style={[
            styles.offerStatus,
            offer.status === "accepted" && styles.offerAccepted,
            offer.status === "rejected" && styles.offerRejected,
          ]}
        >
          <Text style={styles.offerStatusText}>
            {t(`trades.offerStatus.${offer.status}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.offerAmount}>
        {formatListing(offer.amount_iqd, "IQD")}
      </Text>
      <Text style={styles.offerNote}>{offer.note}</Text>
      <View style={styles.offerMeta}>
        <Clock3 size={13} color={colors.inkFaint} strokeWidth={2.2} />
        <Text style={styles.offerMetaText}>
          {t("trades.daysLabel", { count: offer.days })}
        </Text>
      </View>
      <View style={styles.commMini}>
        <Text style={styles.commMiniText}>
          {t("trades.breakdown.commission", {
            rate: br.ratePercent,
            amount: formatListing(br.commission, "IQD"),
          })}
        </Text>
        <Text style={styles.commMiniNet}>
          {t("trades.breakdown.net", {
            amount: formatListing(br.net, "IQD"),
          })}
        </Text>
      </View>
      {canAccept && offer.status === "pending" ? (
        <Pressable
          style={({ pressed }) => [
            styles.acceptBtn,
            pressed && { opacity: 0.9 },
          ]}
          onPress={onAccept}
        >
          <CheckCircle2 size={16} color={colors.white} strokeWidth={2.3} />
          <Text style={styles.acceptBtnText}>{t("trades.acceptOffer")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl * 2,
    gap: space.md,
  },
  notFound: {
    textAlign: "center",
    marginTop: space.xl,
    fontFamily: fonts.body,
    color: colors.inkFaint,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow.card,
    gap: 8,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusOpen: { backgroundColor: colors.flameSoft },
  statusAwarded: { backgroundColor: colors.brandSoft },
  statusClosed: { backgroundColor: colors.mist },
  statusText: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.inkMuted,
  },
  budget: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.flameDeep,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  sectionTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 16,
    color: colors.ink,
  },
  offerBox: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 10,
    ...shadow.soft,
  },
  commissionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: -4,
  },
  input: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: 11,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  area: { minHeight: 72 },
  commStrip: {
    backgroundColor: colors.flameSoft,
    borderRadius: radius.md,
    padding: space.md,
    gap: 4,
  },
  commLine: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  commNet: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginTop: 2,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkFaint,
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 6,
    ...shadow.soft,
  },
  offerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  offerName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
  },
  offerTitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  offerStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  offerAccepted: { backgroundColor: colors.brandSoft },
  offerRejected: { backgroundColor: "#FCECEC" },
  offerStatusText: {
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    color: colors.inkMuted,
  },
  offerAmount: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.flameDeep,
  },
  offerNote: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  offerMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  offerMetaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkFaint,
  },
  commMini: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 2,
  },
  commMiniText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkFaint,
  },
  commMiniNet: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  acceptBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  acceptBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
});
