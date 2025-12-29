import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VacationManager } from "@/components/payroll/VacationManager";

export default function VacationManagerPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Vacation Manager" },
          ]}
        />
        <VacationManager />
      </div>
    </AppLayout>
  );
}
