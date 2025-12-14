import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { PerformanceImprovementPlansTab } from "@/components/performance/PerformanceImprovementPlansTab";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function PerformanceImprovementPlansPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <NavLink to="/performance" className="hover:text-foreground transition-colors">
              Performance
            </NavLink>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">Improvement Plans</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Performance Improvement Plans
                </h1>
                <p className="text-muted-foreground">
                  Track and manage employee performance improvement plans
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }}
              />
              <DepartmentFilter
                companyId={selectedCompanyId}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

        {selectedCompanyId && <PerformanceImprovementPlansTab companyId={selectedCompanyId} />}
      </div>
    </AppLayout>
  );
}
