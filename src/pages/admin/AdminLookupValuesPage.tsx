import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LookupValuesManagement } from "@/components/admin/LookupValuesManagement";
import { SystemReferenceDataTabs } from "@/components/admin/SystemReferenceDataTabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageAudit } from "@/hooks/usePageAudit";
import { Settings, Database } from "lucide-react";

const breadcrumbs = [
  { label: "Admin", href: "/admin" },
  { label: "Lookup Values" },
];

export default function AdminLookupValuesPage() {
  const [activeTab, setActiveTab] = useState("configurable");
  usePageAudit('lookup_values', 'Admin');
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lookup Values</h1>
          <p className="text-muted-foreground">
            Manage configurable lookup values and view system reference data
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="configurable" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurable Values
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Database className="h-4 w-4" />
              System Reference Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configurable" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Value Categories</CardTitle>
                <CardDescription>
                  Configure employee statuses, termination reasons, employee types, immigration codes, and other lookup values.
                  Each value can have a validity period with start and end dates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LookupValuesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Reference Data</CardTitle>
                <CardDescription>
                  Read-only system data including ISO country codes, currency codes, and language codes.
                  These values are used throughout the system and cannot be modified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemReferenceDataTabs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
