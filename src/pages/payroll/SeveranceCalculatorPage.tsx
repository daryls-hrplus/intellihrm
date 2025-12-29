import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SeveranceCalculator } from "@/components/payroll/SeveranceCalculator";

export default function SeveranceCalculatorPage() {
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
