import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { OrgChangesReporting } from "@/components/admin/OrgChangesReporting";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrgChangesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleScheduleClick = (filters: { companyId: string; departmentId: string }) => {
    navigate("/admin/scheduled-reports", { 
      state: { 
        prefill: true,
        companyId: filters.companyId,
        departmentId: filters.departmentId
      } 
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
          <Button asChild variant="outline">
            <Link to="/admin/scheduled-reports">
              <Calendar className="mr-2 h-4 w-4" />
              {t("workforce.scheduleReport")}
            </Link>
          </Button>
        </div>
        <OrgChangesReporting onScheduleClick={handleScheduleClick} />
      </div>
    </AppLayout>
  );
}
