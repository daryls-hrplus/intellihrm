import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { IntegrationWebhooks } from "@/components/payroll/IntegrationWebhooks";

export default function IntegrationWebhooksPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Integration Webhooks" },
          ]}
        />
        <IntegrationWebhooks />
      </div>
    </AppLayout>
  );
}
