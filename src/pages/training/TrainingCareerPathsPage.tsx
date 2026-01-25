import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CareerPathsTab } from "@/components/succession/CareerPathsTab";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { useTabState } from "@/hooks/useTabState";
import { useAuth } from "@/contexts/AuthContext";

export default function TrainingCareerPathsPage() {
  const { t } = useTranslation();
  const { company } = useAuth();

  const [tabState, setTabState] = useTabState({
    defaultState: { selectedCompanyId: "" },
    syncToUrl: ["selectedCompanyId"],
  });
  const { selectedCompanyId } = tabState;

  useEffect(() => {
    if (!selectedCompanyId && company?.id) {
      setTabState({ selectedCompanyId: company.id });
    }
  }, [company?.id, selectedCompanyId, setTabState]);

  const breadcrumbItems = [
    { label: t("training.dashboard.title", "Learning & Development"), href: "/training" },
    { label: t("training.modules.careerPaths.title", "Career Paths") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("training.modules.careerPaths.title", "Career Paths")}</h1>
            <p className="text-muted-foreground">{t("training.modules.careerPaths.description", "Define career progression routes")}</p>
          </div>
          <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => setTabState({ selectedCompanyId: id })} />
        </div>
        <CareerPathsTab companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
      </div>
    </AppLayout>
  );
}