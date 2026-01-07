import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SeveranceCalculator } from "@/components/payroll/SeveranceCalculator";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function SeveranceCalculatorPage() {
  usePageAudit('severance_calculator', 'Payroll');
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Severance Calculator" },
          ]}
        />
        <SeveranceCalculator />
      </div>
    </AppLayout>
  );
}
