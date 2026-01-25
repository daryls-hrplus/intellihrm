import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { ContinuousFeedbackTab } from "@/components/performance/ContinuousFeedbackTab";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter } from "@/components/filters/DepartmentFilter";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTabState } from "@/hooks/useTabState";

export default function ContinuousFeedbackPage() {
  const { t } = useLanguage();
  
  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedCompanyId: "all",
      selectedDepartmentId: "all",
    },
    syncToUrl: ["selectedCompanyId"],
  });

  const { selectedCompanyId, selectedDepartmentId } = tabState;
  
  const setSelectedCompanyId = (v: string) => setTabState({ 
    selectedCompanyId: v, 
    selectedDepartmentId: "all" 
  });
  const setSelectedDepartmentId = (v: string) => setTabState({ selectedDepartmentId: v });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <Breadcrumbs 
            items={[
              { label: t('performance.title'), href: "/performance" },
              { label: t('performance.modules.continuousFeedback') },
            ]}
          />
          
          <div className="flex items-center justify-between mb-2 mt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <MessageCircle className="h-5 w-5 text-info" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t('performance.feedback.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('performance.feedback.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
              />
              <DepartmentFilter
                companyId={selectedCompanyId}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

        {selectedCompanyId && <ContinuousFeedbackTab companyId={selectedCompanyId} />}
      </div>
    </AppLayout>
  );
}