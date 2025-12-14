import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { ContinuousFeedbackTab } from "@/components/performance/ContinuousFeedbackTab";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { MessageCircle, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function ContinuousFeedbackPage() {
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
            <span className="text-foreground">Continuous Feedback</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <MessageCircle className="h-5 w-5 text-info" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Continuous Feedback
                </h1>
                <p className="text-muted-foreground">
                  Quick feedback and check-ins between formal reviews
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

        {selectedCompanyId && <ContinuousFeedbackTab companyId={selectedCompanyId} />}
      </div>
    </AppLayout>
  );
}
