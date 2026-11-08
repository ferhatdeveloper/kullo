import { Pressable, Text, View } from "react-native";
import { Bell, MapPin, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCityStore } from "../../lib/city-store";
import { useDeliveryAddressStore } from "../../lib/delivery-address-store";
import { colors } from "./mart-theme";
/** Market TopBar — ink-ağır. MARKER: market-ink-heavy-2026-11-05 */
const INK = colors.ink;
export default function TopBar({ title, showLocation, onLocation, onBell, onProfile, trailing }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const insets = useSafeAreaInsets();
  const city = useCityStore((s) => s.city);
  const addresses = useDeliveryAddressStore((s) => s.addresses);
  const selectedId = useDeliveryAddressStore((s) => s.selectedId);
  const selected = addresses.find((a) => a.id === selectedId) ?? addresses[0];
  const addrLine =
    selected?.city || (city === "all" ? "Erbil" : String(city));
  return (
    <View style={{ backgroundColor: INK, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 12, paddingVertical: 7, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8, minHeight: 44 }}>
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 10, fontWeight: "900", color: INK }}>K</Text>
        </View>
        <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
          {showLocation ? (
            <Pressable onPress={onLocation} style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4, maxWidth: "100%" }}>
              <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.85)", textAlign: isRTL ? "right" : "left", lineHeight: 12 }} numberOfLines={1}>{t("mart.deliverTo")} · Kullo Mart</Text>
                <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "800", color: "#fff", textAlign: isRTL ? "right" : "left", lineHeight: 16, marginTop: 1 }}>{addrLine}</Text>
              </View>
              <MapPin size={14} color="#fff" />
            </Pressable>
          ) : (
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff", textAlign: isRTL ? "right" : "left" }} numberOfLines={1}>{title || t("mart.title")}</Text>
          )}
        </View>
        {trailing}
        {onBell ? (<Pressable onPress={onBell} hitSlop={6} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}><Bell size={16} color="#fff" /></Pressable>) : null}
        {onProfile ? (<Pressable onPress={onProfile} hitSlop={6} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}><User size={16} color="#fff" /></Pressable>) : null}
      </View>
    </View>
  );
}
