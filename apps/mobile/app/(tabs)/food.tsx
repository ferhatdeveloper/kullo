import { Redirect } from "expo-router";

/** Food dikeyi Mart kabuğu içinde — deep link uyumluluğu */
export default function FoodHomeScreen() {
  return <Redirect href={{ pathname: "/(tabs)/mart", params: { martPane: "home" } }} />;
}
