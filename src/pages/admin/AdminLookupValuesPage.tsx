import { AppLayout } from "@/components/layout/AppLayout";
import { LookupValuesManagement } from "@/components/admin/LookupValuesManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePageAudit } from "@/hooks/usePageAudit";

const breadcrumbs = [
  { label: "Admin", href: "/admin" },
  { label: "Lookup Values" },
];

export default function AdminLookupValuesPage() {
  usePageAudit('lookup_values', 'Admin');
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
      </div>
    </AppLayout>
  );
}
