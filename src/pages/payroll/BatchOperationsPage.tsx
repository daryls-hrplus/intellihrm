import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BatchOperations } from "@/components/payroll/BatchOperations";

export default function BatchOperationsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Batch Operations" },
          ]}
        />
        <BatchOperations />
      </div>
    </AppLayout>
  );
}
