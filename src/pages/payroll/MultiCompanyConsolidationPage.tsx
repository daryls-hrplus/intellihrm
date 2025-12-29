import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MultiCompanyConsolidation } from "@/components/payroll/MultiCompanyConsolidation";

export default function MultiCompanyConsolidationPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Multi-Company Consolidation" }
        ]} />
        
        <MultiCompanyConsolidation />
      </div>
    </AppLayout>
  );
}
