import { AppLayout } from "@/components/layout/AppLayout";
import { ScheduledOrgReports } from "@/components/admin/ScheduledOrgReports";
import { useLocation } from "react-router-dom";

export default function AdminScheduledReportsPage() {
  const location = useLocation();
  const state = location.state as { 
    prefill?: boolean; 
    companyId?: string; 
    departmentId?: string; 
  } | null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Reports</h1>
          <p className="text-muted-foreground">
            Configure automated organizational change reports to be sent via email
          </p>
        </div>
        <ScheduledOrgReports 
          initialCompanyId={state?.companyId}
          initialDepartmentId={state?.departmentId}
          autoOpenDialog={state?.prefill}
        />
      </div>
    </AppLayout>
  );
}