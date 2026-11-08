import { Store } from "lucide-react-native";
import { Pressable, ScrollView, Text } from "react-native";

import { FO, foStyles as styles } from "./mart-food-ordering.styles";

export type OrderingCategory = {
  key: string;
  label: string;
  goMarket?: boolean;
};

type Props = {
  categories: OrderingCategory[];
  active: string;
  onSelect: (key: string, goMarket?: boolean) => void;
};

/** food_ordering Filter — horizontal pill chips */
export function OrderingCategoryFilter({ categories, active, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {categories.map((c) => {
        const on = !c.goMarket && active === c.key;
        return (
          <Pressable
            key={c.key}
            style={[
              styles.filter,
              on && styles.filterOn,
              c.goMarket && styles.filterMarket,
            ]}
            onPress={() => onSelect(c.key, c.goMarket)}
          >
            {c.goMarket ? (
              <Store size={14} color={FO.flameDeep} strokeWidth={2.2} />
            ) : null}
            <Text
              style={[
                styles.filterText,
                on && styles.filterTextOn,
                c.goMarket && styles.filterTextMarket,
                c.goMarket ? { marginLeft: 6 } : null,
              ]}
            >
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
