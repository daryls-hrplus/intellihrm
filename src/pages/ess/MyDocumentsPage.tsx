import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePageAudit } from "@/hooks/usePageAudit";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeDocumentsTab } from "@/components/employee/EmployeeDocumentsTab";
import { Loader2 } from "lucide-react";

export default function MyDocumentsPage() {
  usePageAudit('ess_my_documents', 'ESS');
  const { t } = useTranslation();
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile?.id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">{t("common.unauthorized", "Unauthorized")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title", "Employee Self Service"), href: "/ess" },
            { label: t("ess.modules.documents.title", "My Documents") },
          ]}
        />

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("ess.modules.documents.title", "My Documents")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("ess.modules.documents.description", "Access your employment documents and certificates")}
          </p>
        </div>

        <EmployeeDocumentsTab employeeId={profile.id} />
      </div>
    </AppLayout>
  );
}
