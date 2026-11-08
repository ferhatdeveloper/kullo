import { Redirect } from "expo-router";

import { CARS_RENT_HREF } from "../../lib/cars-routes";

/** Deep link: /cars/rent → Kirala dikeyi */
export default function CarsRentEntry() {
  return <Redirect href={CARS_RENT_HREF} />;
}
