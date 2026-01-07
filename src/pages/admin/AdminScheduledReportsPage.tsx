import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ScheduledOrgReports } from "@/components/admin/ScheduledOrgReports";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function AdminScheduledReportsPage() {
  usePageAudit('scheduled_reports', 'Admin');
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as { 
    prefill?: boolean; 
    companyId?: string; 
    departmentId?: string; 
  } | null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.hrHub"), href: "/hr-hub" },
          { label: t("hrHub.scheduledReports") }
        ]} />
        <div>
          <h1 className="text-3xl font-bold">{t("hrHub.scheduledReports")}</h1>
          <p className="text-muted-foreground">
            {t("hrHub.scheduledReportsDesc")}
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