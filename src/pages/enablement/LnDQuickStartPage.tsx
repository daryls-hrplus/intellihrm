import { QuickStartTemplate } from "@/components/enablement/quickstarts/QuickStartTemplate";
import { LND_QUICKSTART_DATA } from "@/components/enablement/quickstarts/data/learning-development";

export default function LnDQuickStartPage() {
  return <QuickStartTemplate data={LND_QUICKSTART_DATA} />;
}
