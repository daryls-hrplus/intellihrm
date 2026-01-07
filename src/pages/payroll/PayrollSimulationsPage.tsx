import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PayrollSimulations } from "@/components/payroll/PayrollSimulations";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function PayrollSimulationsPage() {
  usePageAudit('payroll_simulations', 'Payroll');
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Payroll Simulations" },
          ]}
        />
        <PayrollSimulations />
      </div>
    </AppLayout>
  );
}
