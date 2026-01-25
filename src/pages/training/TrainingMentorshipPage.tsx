import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MentorshipTab } from "@/components/succession/MentorshipTab";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { useTabState } from "@/hooks/useTabState";
import { useAuth } from "@/contexts/AuthContext";

export default function TrainingMentorshipPage() {
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
    { label: t("training.modules.mentorship.title", "Mentorship") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("training.modules.mentorship.title", "Mentorship")}</h1>
            <p className="text-muted-foreground">{t("training.modules.mentorship.description", "Mentoring relationships and programs")}</p>
          </div>
          <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => setTabState({ selectedCompanyId: id })} />
        </div>
        <MentorshipTab companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
      </div>
    </AppLayout>
  );
}