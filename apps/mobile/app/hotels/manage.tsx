import { router } from "expo-router";
import { Pencil, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineCover } from "../../components/OfflineCover";
import { Button } from "../../components/ui/Button";
import { Screen, ScreenHeader } from "../../components/ui/Screen";
import { useCurrencyStore } from "../../lib/currency-store";
import {
  DEMO_HOTELS,
  HOTEL_CITY_LABEL_KEY,
  type HotelRoomType,
} from "../../lib/hotels-catalog";
import {
  newRoomId,
  photosForRoomType,
  useHotelsInventory,
  type HotelRoom,
} from "../../lib/hotels-inventory-store";
import { colors, fonts, radius, shadow, space } from "../../lib/theme";

const ROOM_TYPES: HotelRoomType[] = ["standard", "deluxe", "suite", "residence"];

type Draft = {
  id?: string;
  name: string;
  capacity: string;
  price_amount: string;
  stock: string;
  room_type: HotelRoomType;
};

const emptyDraft = (): Draft => ({
  name: "",
  capacity: "2",
  price_amount: "",
  stock: "5",
  room_type: "standard",
});

export default function HotelsManageScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const formatListing = useCurrencyStore((s) => s.formatListing);
  const hydrate = useHotelsInventory((s) => s.hydrate);
  const byHotel = useHotelsInventory((s) => s.byHotel);
  const upsertRoom = useHotelsInventory((s) => s.upsertRoom);
  const removeRoom = useHotelsInventory((s) => s.removeRoom);

  const [hotelId, setHotelId] = useState(DEMO_HOTELS[0]?.id ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const hotel = useMemo(
    () => DEMO_HOTELS.find((h) => h.id === hotelId),
    [hotelId],
  );
  const rooms = byHotel[hotelId] ?? [];

  const openCreate = () => {
    setDraft(emptyDraft());
    setFormOpen(true);
  };

  const openEdit = (room: HotelRoom) => {
    setDraft({
      id: room.id,
      name: room.name,
      capacity: String(room.capacity),
      price_amount: String(room.price_amount),
      stock: String(room.stock),
      room_type: room.room_type,
    });
    setFormOpen(true);
  };

  const confirmDelete = (room: HotelRoom) => {
    Alert.alert(t("hotels.manageDeleteTitle"), room.name, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("hotels.manageDelete"),
        style: "destructive",
        onPress: () => void removeRoom(hotelId, room.id),
      },
    ]);
  };

  const saveRoom = async () => {
    const name = draft.name.trim();
    const capacity = Math.max(1, parseInt(draft.capacity, 10) || 1);
    const price = Math.max(0, parseInt(draft.price_amount.replace(/\D/g, ""), 10) || 0);
    const stock = Math.max(0, parseInt(draft.stock, 10) || 0);
    if (!name || price <= 0) {
      Alert.alert(t("hotels.manageInvalidTitle"), t("hotels.manageInvalidBody"));
      return;
    }
    setSaving(true);
    const photos = photosForRoomType(draft.room_type);
    const room: HotelRoom = {
      id: draft.id ?? newRoomId(hotelId),
      name,
      capacity,
      price_amount: price,
      stock,
      room_type: draft.room_type,
      cover_url: photos.cover_url,
      gallery: photos.gallery,
    };
    await upsertRoom(hotelId, room);
    setSaving(false);
    setFormOpen(false);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title={t("hotels.manageTitle")}
        subtitle={t("hotels.manageSubtitle")}
        onBack={() => router.back()}
      />

      <Text style={styles.sectionLabel}>{t("hotels.managePickHotel")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hotelChips}
      >
        {DEMO_HOTELS.map((h) => {
          const on = h.id === hotelId;
          return (
            <Pressable
              key={h.id}
              onPress={() => setHotelId(h.id)}
              style={[styles.hotelChip, on && styles.hotelChipOn]}
            >
              <Text style={[styles.hotelChipText, on && styles.hotelChipTextOn]} numberOfLines={1}>
                {h.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {hotel ? (
        <View style={styles.hotelMeta}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.hotelLoc}>
            {t(HOTEL_CITY_LABEL_KEY[hotel.city])} · {hotel.district}
          </Text>
        </View>
      ) : null}

      <View style={styles.listHead}>
        <Text style={styles.sectionLabel}>
          {t("hotels.manageRooms", { count: rooms.length })}
        </Text>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Plus size={16} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.addBtnText}>{t("hotels.manageAdd")}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {rooms.length === 0 ? (
          <Text style={styles.empty}>{t("hotels.manageEmpty")}</Text>
        ) : (
          rooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <OfflineCover
                uri={room.cover_url}
                label={room.name}
                style={styles.roomThumb}
              />
              <View style={styles.roomBody}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomMeta}>
                  {t("hotels.manageCapacity", { n: room.capacity })} ·{" "}
                  {t("hotels.manageStock", { n: room.stock })} ·{" "}
                  {t(`hotels.room.${room.room_type}`)} ·{" "}
                  {room.gallery.length} {t("hotels.photos")}
                </Text>
                <Text style={styles.roomPrice}>
                  {formatListing(room.price_amount, "IQD")} / {t("hotels.perNight")}
                </Text>
              </View>
              <View style={styles.roomActions}>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => openEdit(room)}
                  accessibilityLabel={t("hotels.manageEdit")}
                >
                  <Pencil size={15} color={colors.ink} strokeWidth={2} />
                </Pressable>
                <Pressable
                  style={[styles.iconBtn, styles.iconBtnDanger]}
                  onPress={() => confirmDelete(room)}
                  accessibilityLabel={t("hotels.manageDelete")}
                >
                  <Trash2 size={15} color={colors.danger} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={formOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFormOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setFormOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {draft.id ? t("hotels.manageEdit") : t("hotels.manageAdd")}
            </Text>

            <Text style={styles.fieldLabel}>{t("hotels.manageName")}</Text>
            <TextInput
              value={draft.name}
              onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
              placeholder={t("hotels.manageNamePh")}
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>{t("hotels.manageType")}</Text>
            <View style={styles.typeRow}>
              {ROOM_TYPES.map((rt) => {
                const on = draft.room_type === rt;
                return (
                  <Pressable
                    key={rt}
                    onPress={() => setDraft((d) => ({ ...d, room_type: rt }))}
                    style={[styles.typeChip, on && styles.typeChipOn]}
                  >
                    <Text style={[styles.typeChipText, on && styles.typeChipTextOn]}>
                      {t(`hotels.room.${rt}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.numRow}>
              <View style={styles.numCell}>
                <Text style={styles.fieldLabel}>{t("hotels.manageCapacityLabel")}</Text>
                <TextInput
                  value={draft.capacity}
                  onChangeText={(capacity) => setDraft((d) => ({ ...d, capacity }))}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.numCell}>
                <Text style={styles.fieldLabel}>{t("hotels.manageStockLabel")}</Text>
                <TextInput
                  value={draft.stock}
                  onChangeText={(stock) => setDraft((d) => ({ ...d, stock }))}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>{t("hotels.managePrice")}</Text>
            <TextInput
              value={draft.price_amount}
              onChangeText={(price_amount) =>
                setDraft((d) => ({ ...d, price_amount }))
              }
              placeholder="95000"
              placeholderTextColor={colors.inkFaint}
              keyboardType="number-pad"
              style={styles.input}
            />

            <Button
              label={t("hotels.manageSave")}
              variant="ink"
              onPress={() => void saveRoom()}
              loading={saving}
              style={{ marginTop: 8 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginHorizontal: space.lg,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  hotelChips: {
    paddingHorizontal: space.lg,
    gap: 8,
    paddingBottom: 8,
  },
  hotelChip: {
    maxWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  hotelChipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  hotelChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  hotelChipTextOn: { color: colors.white },
  hotelMeta: {
    marginHorizontal: space.lg,
    marginBottom: 8,
    gap: 2,
  },
  hotelName: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
  },
  hotelLoc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  listHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: space.lg,
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.flame,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  addBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.white,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: 40,
    gap: 10,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 32,
  },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  roomThumb: {
    width: 72,
    height: 64,
    borderRadius: radius.sm,
  },
  roomBody: { flex: 1, gap: 2 },
  roomName: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  roomMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  roomPrice: {
    fontFamily: fonts.displayMed,
    fontSize: 13,
    color: colors.flameDeep,
    marginTop: 2,
  },
  roomActions: { gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDanger: {
    backgroundColor: "#FBECEC",
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: 10,
    gap: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: fonts.displayMed,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  typeChipOn: {
    backgroundColor: colors.flameSoft,
    borderColor: colors.flame,
  },
  typeChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  typeChipTextOn: { color: colors.flameDeep },
  numRow: { flexDirection: "row", gap: 10 },
  numCell: { flex: 1 },
});
