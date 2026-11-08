import { Text, Pressable, View } from "react-native";

import { OfflineCover } from "../../OfflineCover";
import { foStyles as styles } from "./mart-food-ordering.styles";

type Props = {
  name: string;
  meta: string;
  coverUrl?: string | null;
  cta: string;
  offset?: boolean;
  onPress: () => void;
};

/** food_ordering MenuCard shape — restaurant entry (tap → menu) */
export function OrderingRestaurantCard({
  name,
  meta,
  coverUrl,
  cta,
  offset,
  onPress,
}: Props) {
  return (
    <Pressable
      style={[styles.menuCard, offset && styles.menuCardOffset]}
      onPress={onPress}
    >
      <View style={styles.menuImgWrap}>
        <OfflineCover uri={coverUrl} label={name} style={styles.menuCover} />
      </View>
      <Text style={styles.menuName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.menuMeta} numberOfLines={1}>
        {meta}
      </Text>
      <Text style={styles.menuCta}>{cta}</Text>
    </Pressable>
  );
}
