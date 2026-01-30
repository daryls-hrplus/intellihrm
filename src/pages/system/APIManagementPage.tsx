import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Webhook, Key, Book, BarChart3 } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";
import { APIKeyList } from "@/components/system/api-management/APIKeyList";
import { APIUsageChart } from "@/components/system/api-management/APIUsageChart";
import { APIDocumentation } from "@/components/system/api-management/APIDocumentation";
import { useCompanySelector } from "@/hooks/useCompanySelector";

export default function APIManagementPage() {
  usePageAudit('api', 'System');
  const { selectedCompanyId } = useCompanySelector();
  const [activeTab, setActiveTab] = useState("keys");

  // Default company ID for demo purposes
  const companyId = selectedCompanyId || "00000000-0000-0000-0000-000000000000";

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
            <p className="text-muted-foreground">
              Manage API keys, view usage analytics, and access documentation
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Analytics
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <APIKeyList companyId={companyId} />
          </TabsContent>

          <TabsContent value="usage">
            <APIUsageChart />
          </TabsContent>

          <TabsContent value="docs">
            <APIDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
