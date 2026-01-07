import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VariableCompensation } from "@/components/payroll/VariableCompensation";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function VariableCompensationPage() {
  usePageAudit('variable_compensation', 'Payroll');
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Variable Compensation" }
        ]} />
        
        <VariableCompensation />
      </div>
    </AppLayout>
  );
}
