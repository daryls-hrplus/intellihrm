import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuditCoverage } from "@/hooks/useAuditCoverage";
import { usePageAudit } from "@/hooks/usePageAudit";
import { AuditCoverageOverview } from "@/components/admin/audit/AuditCoverageOverview";
import { ModuleCoverageGrid } from "@/components/admin/audit/ModuleCoverageGrid";
import { CoverageGapsTable } from "@/components/admin/audit/CoverageGapsTable";
import { AuditHealthChart } from "@/components/admin/audit/AuditHealthChart";
import { RefreshCw, Shield, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NavLink } from "react-router-dom";

export default function AuditCoveragePage() {
  usePageAudit('audit_coverage', 'Admin');
  
  const { metrics, volumeData, loading, error, refresh, lastRefresh } = useAuditCoverage();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NavLink to="/admin" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Audit Activity</h1>
              <p className="text-sm text-muted-foreground">
                All modules have audit hooks implemented. Activity shows pages visited.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-muted-foreground">
                Last updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <p className="font-medium">Failed to load coverage data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Overview Cards */}
        {metrics && (
          <AuditCoverageOverview metrics={metrics} isLoading={loading} />
        )}

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AuditHealthChart volumeData={volumeData} isLoading={loading} />
          
          {/* Quick Stats */}
          {metrics && (
            <div className="grid gap-4">
              {/* Most Active Modules */}
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-3">Most Active</h3>
                <div className="space-y-2">
                  {metrics.moduleCoverages
                    .filter(m => m.coverage > 0)
                    .slice(0, 5)
                    .map(module => (
                      <div 
                        key={module.module} 
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{module.module}</span>
                        <span className={`font-medium ${
                          module.coverage >= 90 
                            ? 'text-success' 
                            : module.coverage >= 50 
                              ? 'text-warning' 
                              : 'text-muted-foreground'
                        }`}>
                          {module.coverage}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Pending Activation */}
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-3">Pending Activation</h3>
                <div className="space-y-2">
                  {metrics.moduleCoverages
                    .filter(m => m.coverage === 0)
                    .slice(0, 5)
                    .map(module => (
                      <div 
                        key={module.module} 
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{module.module}</span>
                        <span className="text-info font-medium">
                          Awaiting visits
                        </span>
                      </div>
                    ))}
                  {metrics.moduleCoverages.filter(m => m.coverage === 0).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      All modules have activity
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Module Coverage Grid */}
        {metrics && (
          <ModuleCoverageGrid 
            moduleCoverages={metrics.moduleCoverages} 
            isLoading={loading} 
          />
        )}

        {/* Coverage Gaps */}
        {metrics && (
          <CoverageGapsTable 
            gaps={metrics.coverageGaps} 
            isLoading={loading} 
          />
        )}
      </div>
    </AppLayout>
  );
}
