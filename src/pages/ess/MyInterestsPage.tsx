import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeInterestsTab } from "@/components/employee/EmployeeInterestsTab";

export default function MyInterestsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please log in to view your interests.
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
            { label: t("ess.modules.interests.title", "My Interests") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.interests.title", "My Interests")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.interests.description", "Manage your interests and hobbies")}
          </p>
        </div>

        <EmployeeInterestsTab employeeId={user.id} />
      </div>
    </AppLayout>
  );
}
