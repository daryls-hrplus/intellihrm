import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function LaborLawPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Global/Regional Compliance", href: "/global-compliance" }, { label: "Labor Law Compliance" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              Labor Law Compliance
            </h1>
            <p className="text-muted-foreground">Leave policies, working hours, overtime rules, and holidays by region</p>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Labor Regulations</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure labor law requirements by country</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
