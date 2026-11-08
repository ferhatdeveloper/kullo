import { Redirect } from "expo-router";

/** Eski hizmetler sekmesi → tabsız gate */
export default function ServicesRedirect() {
  return <Redirect href="/mode-select" />;
}
