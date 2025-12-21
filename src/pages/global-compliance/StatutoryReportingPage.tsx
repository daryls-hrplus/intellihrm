import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function StatutoryReportingPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Global/Regional Compliance", href: "/global-compliance" }, { label: "Statutory Reporting" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileCheck className="h-8 w-8 text-primary" />
              Statutory Reporting
            </h1>
            <p className="text-muted-foreground">Government report templates, filing schedules, and submission tracking</p>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Filing Calendar</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Track statutory filing deadlines</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
