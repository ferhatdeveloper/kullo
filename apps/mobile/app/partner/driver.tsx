import { useEffect } from "react";

import { DriverWorkspace } from "../../components/partner/driver/DriverWorkspace";
import { usePartnerStore } from "../../lib/partner-store";

export default function PartnerDriverScreen() {
  const setRole = usePartnerStore((s) => s.setRole);

  useEffect(() => {
    void setRole("driver");
  }, [setRole]);

  return <DriverWorkspace />;
}
