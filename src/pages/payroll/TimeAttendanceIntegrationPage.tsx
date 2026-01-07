import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TimeAttendanceIntegration } from "@/components/payroll/TimeAttendanceIntegration";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function TimeAttendanceIntegrationPage() {
  usePageAudit('time_attendance_integration', 'Payroll');
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Time & Attendance Integration" }
        ]} />
        
        <TimeAttendanceIntegration />
      </div>
    </AppLayout>
  );
}
