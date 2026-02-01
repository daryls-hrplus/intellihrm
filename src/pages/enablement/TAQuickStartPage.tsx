import { QuickStartTemplate } from "@/components/enablement/quickstarts/QuickStartTemplate";
import { TA_QUICKSTART_DATA } from "@/components/enablement/quickstarts/data/time-attendance";

export default function TAQuickStartPage() {
  return <QuickStartTemplate data={TA_QUICKSTART_DATA} />;
}
