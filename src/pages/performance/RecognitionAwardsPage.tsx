import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { RecognitionAwardsTab } from "@/components/performance/RecognitionAwardsTab";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Award, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function RecognitionAwardsPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <NavLink to="/performance" className="hover:text-foreground transition-colors">
              Performance
            </NavLink>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">Recognition & Awards</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Recognition & Awards
                </h1>
                <p className="text-muted-foreground">
                  Celebrate achievements and recognize team members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
              />
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

        {selectedCompanyId && <RecognitionAwardsTab companyId={selectedCompanyId} />}
      </div>
    </AppLayout>
  );
}
