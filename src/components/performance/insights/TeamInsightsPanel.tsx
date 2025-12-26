import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  TrendingUp,
  Network,
  Gauge,
  ArrowRight
} from "lucide-react";
import { useEmployeeWorkload } from "@/hooks/performance/useEmployeeWorkload";
import { useGoalQualityMetrics } from "@/hooks/performance/useGoalQualityMetrics";
import { useAlignmentAnalytics } from "@/hooks/performance/useAlignmentAnalytics";
import { useLanguage } from "@/hooks/useLanguage";

interface TeamInsightsPanelProps {
  companyId: string | undefined;
  directReportIds?: string[];
  onViewOverloaded?: () => void;
  onViewQualityIssues?: () => void;
}

export function TeamInsightsPanel({ 
  companyId, 
  directReportIds,
  onViewOverloaded,
  onViewQualityIssues 
}: TeamInsightsPanelProps) {
  const { t } = useLanguage();
  
  const { data: workloadData, isLoading: workloadLoading } = useEmployeeWorkload(companyId);
  const { data: qualityData, isLoading: qualityLoading } = useGoalQualityMetrics(companyId);
  const { data: alignmentData, isLoading: alignmentLoading } = useAlignmentAnalytics(companyId);

  const isLoading = workloadLoading || qualityLoading || alignmentLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter to only direct reports if provided
  let filteredWorkload = workloadData;
  if (directReportIds && directReportIds.length > 0 && workloadData) {
    const filteredEmployees = workloadData.employees.filter(e => 
      directReportIds.includes(e.employeeId)
    );
    const overloaded = filteredEmployees.filter(e => e.status === 'critical').length;
    const warning = filteredEmployees.filter(e => e.status === 'warning').length;
    const healthy = filteredEmployees.filter(e => e.status === 'healthy').length;

    filteredWorkload = {
      ...workloadData,
      employees: filteredEmployees,
      totalEmployees: filteredEmployees.length,
      overloadedCount: overloaded,
      warningCount: warning,
      healthyCount: healthy,
      avgWorkloadScore: filteredEmployees.length > 0 
        ? Math.round(filteredEmployees.reduce((sum, e) => sum + e.workloadScore, 0) / filteredEmployees.length)
        : 0,
    };
  }

  const hasWorkloadIssues = (filteredWorkload?.overloadedCount || 0) > 0 || (filteredWorkload?.warningCount || 0) > 0;
  const hasQualityIssues = (qualityData?.lowQualityGoals?.length || 0) > 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Team Performance Insights
            </CardTitle>
            <CardDescription>
              Overview of your team's goal health and workload
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Workload Status */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Gauge className="h-4 w-4" />
              Workload
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{filteredWorkload?.healthyCount || 0}</span>
              <span className="text-sm text-muted-foreground">
                / {filteredWorkload?.totalEmployees || 0} healthy
              </span>
            </div>
            {(filteredWorkload?.overloadedCount || 0) > 0 && (
              <Badge variant="destructive" className="mt-2">
                {filteredWorkload?.overloadedCount} overloaded
              </Badge>
            )}
            {(filteredWorkload?.warningCount || 0) > 0 && (filteredWorkload?.overloadedCount || 0) === 0 && (
              <Badge className="mt-2 bg-warning/10 text-warning border-warning/20">
                {filteredWorkload?.warningCount} at capacity
              </Badge>
            )}
          </div>

          {/* Quality Score */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckCircle className="h-4 w-4" />
              Goal Quality
            </div>
            <div className="text-2xl font-bold">
              {qualityData?.avgQualityScore?.toFixed(0) || 0}%
            </div>
            <Progress value={qualityData?.avgQualityScore || 0} className="h-1.5 mt-2" />
            {(qualityData?.lowQualityGoals?.length || 0) > 0 && (
              <p className="text-xs text-warning mt-2">
                {qualityData?.lowQualityGoals?.length} goals need attention
              </p>
            )}
          </div>

          {/* Alignment */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Network className="h-4 w-4" />
              Alignment
            </div>
            <div className="text-2xl font-bold">
              {alignmentData?.companyAlignmentPercentage || 0}%
            </div>
            <Progress value={alignmentData?.companyAlignmentPercentage || 0} className="h-1.5 mt-2" />
            {(alignmentData?.orphanGoals || 0) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {alignmentData?.orphanGoals} orphan goals
              </p>
            )}
          </div>

          {/* Active Goals */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              Active Goals
            </div>
            <div className="text-2xl font-bold">
              {alignmentData?.totalGoals || qualityData?.totalGoals || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {filteredWorkload?.totalEmployees || 0} team members
            </p>
          </div>
        </div>

        {/* Alerts & Actions */}
        {(hasWorkloadIssues || hasQualityIssues) && (
          <div className="space-y-3">
            {hasWorkloadIssues && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-warning">Workload Imbalance Detected</p>
                    <p className="text-sm text-muted-foreground">
                      {filteredWorkload?.overloadedCount || 0} employee(s) are overloaded, 
                      {filteredWorkload?.warningCount || 0} at capacity
                    </p>
                  </div>
                </div>
                {onViewOverloaded && (
                  <Button variant="outline" size="sm" onClick={onViewOverloaded}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {hasQualityIssues && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Goals Need Improvement</p>
                    <p className="text-sm text-muted-foreground">
                      {qualityData?.lowQualityGoals?.length || 0} goals have quality issues (missing metrics, poor alignment)
                    </p>
                  </div>
                </div>
                {onViewQualityIssues && (
                  <Button variant="outline" size="sm" onClick={onViewQualityIssues}>
                    Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Team Members at Risk */}
        {filteredWorkload?.employees && filteredWorkload.employees.filter(e => e.status !== 'healthy').length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members Needing Attention
            </h4>
            <div className="grid gap-2">
              {filteredWorkload.employees
                .filter(e => e.status !== 'healthy')
                .slice(0, 5)
                .map(employee => (
                  <div 
                    key={employee.employeeId}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        employee.status === 'critical' ? 'bg-destructive' : 'bg-warning'
                      }`} />
                      <span className="font-medium">{employee.employeeName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{employee.activeGoalCount} goals</span>
                      <span>•</span>
                      <span>{employee.totalWeighting}% weight</span>
                      <Badge 
                        variant={employee.status === 'critical' ? 'destructive' : 'outline'}
                        className={employee.status === 'warning' ? 'bg-warning/10 text-warning border-warning/20' : ''}
                      >
                        {employee.status === 'critical' ? 'Overloaded' : 'High'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
