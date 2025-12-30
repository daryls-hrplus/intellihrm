import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeImmigrationTab } from "@/components/employee/immigration/EmployeeImmigrationTab";

export default function MyImmigrationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please log in to view your immigration documents.
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
            { label: t("ess.modules.immigration.title", "Immigration & Permits") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.immigration.title", "Immigration & Permits")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.immigration.description", "View work permits, travel documents, and immigration status")}
          </p>
        </div>

        <EmployeeImmigrationTab employeeId={user.id} viewType="ess" />
      </div>
    </AppLayout>
  );
}
