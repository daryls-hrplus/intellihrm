import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { OrgChangesReporting } from "@/components/admin/OrgChangesReporting";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

export default function OrgChangesPage() {
  const { t } = useTranslation();
  const { navigateToList } = useWorkspaceNavigation();

  const handleScheduleClick = (filters: { companyId: string; departmentId: string }) => {
    // Note: State passing is not supported in workspace tabs - filter prefill handled differently
    navigateToList({
      route: "/admin/scheduled-reports",
      title: t("admin.scheduledReports"),
      moduleCode: "admin",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.workforce"), href: "/workforce" },
          { label: t("workforce.orgChangesReport") }
        ]} />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("workforce.orgChangesReport")}</h1>
            <p className="text-muted-foreground">
              {t("workforce.trackOrgChanges")}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigateToList({
              route: "/admin/scheduled-reports",
              title: t("admin.scheduledReports"),
              moduleCode: "admin",
            })}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t("workforce.scheduleReport")}
          </Button>
        </div>
        <OrgChangesReporting onScheduleClick={handleScheduleClick} />
      </div>
    </AppLayout>
  );
}
