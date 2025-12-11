import { AppLayout } from "@/components/layout/AppLayout";
import { OrgChangesReporting } from "@/components/admin/OrgChangesReporting";

export default function OrgChangesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organizational Changes Report</h1>
          <p className="text-muted-foreground">
            Track and analyze organizational structure changes over time
          </p>
        </div>
        <OrgChangesReporting />
      </div>
    </AppLayout>
  );
}
