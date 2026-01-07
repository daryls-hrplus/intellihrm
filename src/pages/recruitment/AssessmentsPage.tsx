import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { FlaskConical } from "lucide-react";
import { AssessmentsTab } from "@/components/recruitment/AssessmentsTab";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function AssessmentsPage() {
  usePageAudit('assessments', 'Recruitment');
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.tabs.assessments") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <FlaskConical className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("recruitment.tabs.assessments")}</h1>
              <p className="text-muted-foreground">Manage candidate assessments and tests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
          </div>
        </div>

        <AssessmentsTab companyId={selectedCompanyId} />
      </div>
    </AppLayout>
  );
}
