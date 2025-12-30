import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeMedicalProfileTab } from "@/components/employee/EmployeeMedicalProfileTab";

export default function MyMedicalInfoPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please log in to view your medical information.
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
            { label: t("ess.modules.medicalInfo.title", "Medical Information") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.medicalInfo.title", "Medical Information")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.medicalInfo.description", "Manage your emergency medical details and insurance")}
          </p>
        </div>

        <EmployeeMedicalProfileTab employeeId={user.id} />
      </div>
    </AppLayout>
  );
}
