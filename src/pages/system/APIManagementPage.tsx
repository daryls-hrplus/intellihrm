import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook } from "lucide-react";

export default function APIManagementPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Integration & Administration", href: "/system" }, { label: "API Management" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Webhook className="h-8 w-8 text-primary" />
              API Management
            </h1>
            <p className="text-muted-foreground">API keys, webhooks, rate limits, and documentation</p>
          </div>
        </div>
        <Card><CardHeader><CardTitle>API Keys</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage API keys and access tokens</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
