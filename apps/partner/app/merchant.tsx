import { useEffect } from "react";

import { MerchantWorkspace } from "../components/partner/merchant/MerchantWorkspace";
import { usePartnerStore } from "../lib/partner-store";

export default function MerchantScreen() {
  const setRole = usePartnerStore((s) => s.setRole);
  useEffect(() => {
    void setRole("merchant");
  }, [setRole]);
  return <MerchantWorkspace />;
}
