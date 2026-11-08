import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

import { foStyles as styles } from "./mart-food-ordering.styles";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
};

/** food_ordering SearchBar — rounded pill + trailing search icon */
export function OrderingSearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.searchbar}>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        returnKeyType="search"
      />
      <Search size={22} color="#5D5F6D" strokeWidth={2.2} />
    </View>
  );
}
