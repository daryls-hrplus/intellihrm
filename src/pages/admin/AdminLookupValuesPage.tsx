import { AppLayout } from "@/components/layout/AppLayout";
import { LookupValuesManagement } from "@/components/admin/LookupValuesManagement";
import { ImmigrationCodesManagement } from "@/components/admin/ImmigrationCodesManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const breadcrumbs = [
  { label: "Admin", href: "/admin" },
  { label: "Lookup Values" },
];

export default function AdminLookupValuesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lookup Values</h1>
          <p className="text-muted-foreground">
            Manage configurable lookup values for employee transactions
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General Lookup Values</TabsTrigger>
            <TabsTrigger value="immigration">Immigration Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Value Categories</CardTitle>
                <CardDescription>
                  Configure employee statuses, termination reasons, employee types, and other lookup values.
                  Each value can have a validity period with start and end dates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LookupValuesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="immigration">
            <Card>
              <CardHeader>
                <CardTitle>Immigration Codes</CardTitle>
                <CardDescription>
                  Configure immigration document types, permit categories, statuses, CSME skill categories, 
                  dependent types, and travel document types for workforce immigration management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImmigrationCodesManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
