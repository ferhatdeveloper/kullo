import { Redirect } from "expo-router";

import { CARS_BUY_HREF } from "../../lib/cars-routes";

/** Deep link: /cars/buy → Araç al (satın alma) dikeyi */
export default function CarsBuyEntry() {
  return <Redirect href={CARS_BUY_HREF} />;
}
