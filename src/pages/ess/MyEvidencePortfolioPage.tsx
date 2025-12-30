import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { EvidencePortfolioSection } from "@/components/capabilities/EvidencePortfolioSection";
import { EvidenceType } from "@/hooks/capabilities/usePerformanceEvidence";

export default function MyEvidencePortfolioPage() {
  const { t } = useTranslation();
  const { user, company } = useAuth();
  const [searchParams] = useSearchParams();

  // Check for pre-population parameters (from goal check-in quick link)
  const prePopulateGoalId = searchParams.get("goalId") || undefined;
  const prePopulateType = searchParams.get("type") as EvidenceType | undefined;
  const prePopulateTitle = searchParams.get("title") || undefined;

  if (!user?.id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please log in to view your evidence portfolio.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("ess.modules.evidencePortfolio.title", "Evidence Portfolio") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.evidencePortfolio.title", "Evidence Portfolio")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.evidencePortfolio.description", "Attach and manage evidence for your goals and appraisals")}
          </p>
        </div>

        <EvidencePortfolioSection 
          employeeId={user.id} 
          companyId={company?.id || ""} 
          canEdit={true}
          canValidate={false}
          prePopulate={prePopulateGoalId ? {
            goalId: prePopulateGoalId,
            evidenceType: prePopulateType,
            title: prePopulateTitle,
          } : undefined}
        />
      </div>
    </AppLayout>
  );
}
