import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { EvidencePortfolioSection } from "@/components/capabilities/EvidencePortfolioSection";

export default function MyEvidencePortfolioPage() {
  const { t } = useTranslation();
  const { user, company } = useAuth();

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
            {t("ess.modules.evidencePortfolio.description", "Manage your achievement evidence and skill documentation")}
          </p>
        </div>

        <EvidencePortfolioSection 
          employeeId={user.id} 
          companyId={company?.id || ""} 
          canEdit={true}
          canValidate={false}
        />
      </div>
    </AppLayout>
  );
}
