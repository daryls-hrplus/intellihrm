import { AppLayout } from "@/components/layout/AppLayout";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { PropertyAnalytics } from "@/components/property/PropertyAnalytics";
import { useLanguage } from "@/hooks/useLanguage";
import { BarChart3, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function PropertyAnalyticsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const {
    items,
    assignments,
    requests,
    maintenance,
    categories,
  } = usePropertyManagement(selectedCompanyId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/property" className="hover:text-foreground">
            {t("companyProperty.title")}
          </NavLink>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{t("companyProperty.tabs.analytics")}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("companyProperty.tabs.analytics")}
              </h1>
              <p className="text-muted-foreground">
                {t("companyProperty.modules.analyticsDesc", "View property analytics and insights")}
              </p>
            </div>
          </div>
          <LeaveCompanyFilter 
            selectedCompanyId={selectedCompanyId} 
            onCompanyChange={setSelectedCompanyId} 
          />
        </div>

        <PropertyAnalytics 
          items={items}
          assignments={assignments}
          requests={requests}
          maintenance={maintenance}
          categories={categories}
        />
      </div>
    </AppLayout>
  );
}
