import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PayrollTemplates } from "@/components/payroll/PayrollTemplates";

export default function PayrollTemplatesPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Payroll Templates" },
          ]}
        />
        <PayrollTemplates />
      </div>
    </AppLayout>
  );
}
