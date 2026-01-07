import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  RefreshCw,
  Rocket,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useImplementationReadiness, type ReadinessCheck } from "@/hooks/useImplementationReadiness";

export function ReadinessTab() {
  const { result, isLoading, refetch } = useImplementationReadiness();

  const getSeverityIcon = (severity: ReadinessCheck['severity'], passed: boolean) => {
    if (passed) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: ReadinessCheck['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Unable to run readiness checks. Please try again.
      </div>
    );
  }

  const failedCritical = result.checks.filter(c => c.severity === 'critical' && !c.passed);
  const failedWarning = result.checks.filter(c => c.severity === 'warning' && !c.passed);
  const passedChecks = result.checks.filter(c => c.passed);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Readiness Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Readiness Score</p>
              <Progress value={result.score} className="mt-4 h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Critical Checks */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                {result.criticalPassed === result.criticalTotal ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                <span className="text-3xl font-bold">
                  {result.criticalPassed}/{result.criticalTotal}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Critical Checks Passed</p>
            </div>
          </CardContent>
        </Card>

        {/* Go-Live Status */}
        <Card className={result.isReady ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Rocket className={`h-8 w-8 ${result.isReady ? "text-green-500" : "text-muted-foreground"}`} />
              </div>
              <p className={`text-lg font-semibold mt-2 ${result.isReady ? "text-green-600" : "text-destructive"}`}>
                {result.isReady ? "Ready for Go-Live" : "Not Ready"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.isReady 
                  ? "All critical requirements are met" 
                  : `${failedCritical.length} critical issue${failedCritical.length === 1 ? '' : 's'} remaining`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Re-run Checks
        </Button>
      </div>

      {/* Failed Checks - Critical */}
      {failedCritical.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Critical Issues ({failedCritical.length})
            </CardTitle>
            <CardDescription>
              These must be resolved before going live
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedCritical.map(check => (
                <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(check.severity, check.passed)}
                    <div>
                      <p className="font-medium">{check.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {check.actualValue} / Required: {check.threshold}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={check.remediation}>
                      Fix Now
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Checks - Warnings */}
      {failedWarning.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Warnings ({failedWarning.length})
            </CardTitle>
            <CardDescription>
              Recommended to resolve for optimal experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedWarning.map(check => (
                <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(check.severity, check.passed)}
                    <div>
                      <p className="font-medium">{check.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {check.actualValue} / Recommended: {check.threshold}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={check.remediation}>
                      Configure
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passed Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Passed Checks ({passedChecks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {passedChecks.map(check => (
                <div key={check.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{check.message}</span>
                  </div>
                  {getSeverityBadge(check.severity)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
