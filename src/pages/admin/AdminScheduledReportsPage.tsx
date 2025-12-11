import { AppLayout } from "@/components/layout/AppLayout";
import { ScheduledOrgReports } from "@/components/admin/ScheduledOrgReports";

export default function AdminScheduledReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Reports</h1>
          <p className="text-muted-foreground">
            Configure automated organizational change reports to be sent via email
          </p>
        </div>
        <ScheduledOrgReports />
      </div>
    </AppLayout>
  );
}