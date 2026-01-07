import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PayrollLoansManagement } from "@/components/payroll/PayrollLoansManagement";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function PayrollLoansPage() {
  usePageAudit('payroll_loans', 'Payroll');
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Employee Loans" }
        ]} />
        
        <PayrollLoansManagement />
      </div>
    </AppLayout>
  );
}
