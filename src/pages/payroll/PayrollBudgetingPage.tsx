import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PayrollBudgeting } from "@/components/payroll/PayrollBudgeting";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function PayrollBudgetingPage() {
  usePageAudit('payroll_budgeting', 'Payroll');
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Payroll Budgeting" }
        ]} />
        
        <PayrollBudgeting />
      </div>
    </AppLayout>
  );
}
