import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TimeAttendanceIntegration } from "@/components/payroll/TimeAttendanceIntegration";

export default function TimeAttendanceIntegrationPage() {
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
