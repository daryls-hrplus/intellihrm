import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppraisalReadiness } from '@/hooks/useAppraisalReadiness';
import { ReadinessCheckItem } from './ReadinessCheckItem';
import { ReportingRelationshipsDetail } from './ReportingRelationshipsDetail';

interface AppraisalReadinessPanelProps {
  companyId: string;
}

export function AppraisalReadinessPanel({ companyId }: AppraisalReadinessPanelProps) {
  const { result, isLoading, error, refetch } = useAppraisalReadiness(companyId);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showReportingDetails, setShowReportingDetails] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load readiness checks: {error}</span>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const failedChecks = result.checks.filter(c => !c.passed);
  const passedChecks = result.checks.filter(c => c.passed);
  const criticalFailed = failedChecks.filter(c => c.severity === 'critical');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core-framework': return Layers;
      case 'appraisals-setup': return Calendar;
      case 'workforce-data': return Users;
      default: return Layers;
    }
  };

  const getCategoryColor = (percent: number) => {
    if (percent === 100) return 'text-green-600 bg-green-500/10';
    if (percent >= 50) return 'text-amber-600 bg-amber-500/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Overall Score */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                result.isReady ? "bg-green-500/10" : "bg-amber-500/10"
              )}>
                {result.isReady ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Appraisal Readiness</CardTitle>
                <CardDescription>
                  Validate prerequisites before launching appraisal cycles
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className={cn(
                "text-2xl font-bold px-3 py-1 rounded-lg",
                result.overallScore === 100 ? "bg-green-500/10 text-green-600" :
                result.overallScore >= 70 ? "bg-amber-500/10 text-amber-600" :
                "bg-destructive/10 text-destructive"
              )}>
                {result.overallScore}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={result.overallScore} 
            className={cn(
              "h-2",
              result.overallScore === 100 ? "[&>div]:bg-green-500" :
              result.overallScore >= 70 ? "[&>div]:bg-amber-500" :
              "[&>div]:bg-destructive"
            )}
          />
          {!result.isReady && criticalFailed.length > 0 && (
            <p className="text-sm text-destructive mt-2">
              {criticalFailed.length} critical {criticalFailed.length === 1 ? 'issue' : 'issues'} must be resolved before activating appraisal cycles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.categorySummary.map((cat) => {
          const Icon = getCategoryIcon(cat.category);
          const colorClass = getCategoryColor(cat.percent);
          
          return (
            <Card key={cat.category} className="relative overflow-hidden">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{cat.label}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    cat.percent === 100 ? "bg-green-500/10 text-green-600 border-green-200" :
                    cat.percent >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                    "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {cat.passed}/{cat.total}
                  </Badge>
                </div>
                <Progress 
                  value={cat.percent} 
                  className={cn(
                    "h-1.5",
                    cat.percent === 100 ? "[&>div]:bg-green-500" :
                    cat.percent >= 50 ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-destructive"
                  )}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Needs Attention Section */}
      {failedChecks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Needs Attention
            </CardTitle>
            <CardDescription>
              {failedChecks.length} {failedChecks.length === 1 ? 'item requires' : 'items require'} configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {failedChecks.map((check) => (
              <div key={check.id}>
                <ReadinessCheckItem
                  name={check.name}
                  description={check.description}
                  severity={check.severity}
                  passed={check.passed}
                  actualValue={check.actualValue}
                  threshold={check.threshold}
                  remediation={check.remediation}
                  remediationLabel={check.remediationLabel}
                  showDetails
                />
                {check.id === 'reporting-relationships' && (
                  <Collapsible open={showReportingDetails} onOpenChange={setShowReportingDetails}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-1 text-muted-foreground">
                        {showReportingDetails ? 'Hide Details' : 'Show Details'}
                        {showReportingDetails ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <ReportingRelationshipsDetail 
                        data={result.reportingRelationships} 
                        companyId={companyId}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Ready Message */}
      {result.isReady && failedChecks.length === 0 && (
        <Card className="border-green-200 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-700">All Prerequisites Complete</h3>
                <p className="text-sm text-green-600">
                  Your organization is ready to launch appraisal cycles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Section (Collapsible) */}
      {passedChecks.length > 0 && (
        <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {passedChecks.length} Completed {passedChecks.length === 1 ? 'Check' : 'Checks'}
              </span>
              {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {passedChecks.map((check) => (
              <ReadinessCheckItem
                key={check.id}
                name={check.name}
                description={check.description}
                severity={check.severity}
                passed={check.passed}
                actualValue={check.actualValue}
                threshold={check.threshold}
                remediation={check.remediation}
                remediationLabel={check.remediationLabel}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
