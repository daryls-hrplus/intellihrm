import { AppLayout } from "@/components/layout/AppLayout";
import { GovernmentIdTypesManagement } from "@/components/hr-hub/GovernmentIdTypesManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const breadcrumbs = [
  { label: "HR Hub", href: "/hr-hub" },
  { label: "Government ID Types" },
];

export default function GovernmentIdTypesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Government ID Types</h1>
          <p className="text-muted-foreground">
            Manage government employee and employer identification types by country
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Identification Types</CardTitle>
            <CardDescription>
              Configure the types of government IDs required for employees and employers in each country.
              For example, NIS and BIR numbers for Trinidad and Tobago.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GovernmentIdTypesManagement />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
