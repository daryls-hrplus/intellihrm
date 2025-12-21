import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function TaxConfigurationPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Global/Regional Compliance", href: "/global-compliance" }, { label: "Tax Configuration" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Receipt className="h-8 w-8 text-primary" />
              Tax Configuration
            </h1>
            <p className="text-muted-foreground">Tax tables, deduction rules, thresholds, and reporting</p>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Tax Tables</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure tax brackets and rates by country</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
