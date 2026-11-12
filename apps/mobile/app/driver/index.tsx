import { Redirect } from "expo-router";

/** Eski /driver → tek Partner shell (sürücü). */
export default function DriverRedirect() {
  return <Redirect href="/partner/driver" />;
}
