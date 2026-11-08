import { ArrowRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { OfflineCover } from "../../OfflineCover";
import { FO, foStyles as styles } from "./mart-food-ordering.styles";

type Props = {
  title: string;
  coverUrl?: string | null;
  color: string;
  reverse?: boolean;
  onPress: () => void;
};

/** food_ordering home offer-card — alternating image/text */
export function OrderingOfferCard({
  title,
  coverUrl,
  color,
  reverse,
  onPress,
}: Props) {
  return (
    <Pressable
      style={[
        styles.offerCard,
        reverse && styles.offerCardReverse,
        { backgroundColor: color },
      ]}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
    >
      <View style={styles.offerImgWrap}>
        <OfflineCover uri={coverUrl} label={title} style={styles.offerCover} contentFit="cover" />
      </View>
      <View
        style={[
          styles.offerInfo,
          reverse ? styles.offerInfoPadL : styles.offerInfoPadR,
        ]}
      >
        <Text style={styles.offerTitle} numberOfLines={3}>
          {title}
        </Text>
        <View style={styles.offerArrow}>
          <ArrowRight size={18} color={FO.white} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}
