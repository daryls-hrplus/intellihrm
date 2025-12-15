import { AppLayout } from "@/components/layout/AppLayout";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import PropertyCategoriesTab from "@/components/property/PropertyCategoriesTab";
import { useLanguage } from "@/hooks/useLanguage";
import { FolderOpen, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function PropertyCategoriesPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/property" className="hover:text-foreground">
            {t("companyProperty.title")}
          </NavLink>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{t("companyProperty.tabs.categories")}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("companyProperty.tabs.categories")}
              </h1>
              <p className="text-muted-foreground">
                {t("companyProperty.modules.categoriesDesc", "Organize assets by category")}
              </p>
            </div>
          </div>
          <LeaveCompanyFilter 
            selectedCompanyId={selectedCompanyId} 
            onCompanyChange={setSelectedCompanyId} 
          />
        </div>

        <PropertyCategoriesTab companyId={selectedCompanyId} />
      </div>
    </AppLayout>
  );
}
