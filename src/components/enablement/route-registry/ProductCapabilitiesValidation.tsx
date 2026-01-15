import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Loader2, 
  Play, 
  Wrench, 
  XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useProductCapabilitiesValidation, 
  ProductCapabilitiesIssue 
} from "@/hooks/useProductCapabilitiesValidation";
import { 
  useProductCapabilitiesValidationFixer 
} from "@/hooks/useProductCapabilitiesValidationFixer";
import { FixPreviewDialog } from "./FixPreviewDialog";
import { useState } from "react";
import { toast } from "sonner";

export function ProductCapabilitiesValidation() {
  const [showFixPreview, setShowFixPreview] = useState(false);

  const { 
    runValidation, 
    isValidating, 
    lastReport 
  } = useProductCapabilitiesValidation();

  const {
    previewFix,
    fixAllIssues,
    isFixing,
    isPreviewing,
    lastPreview
  } = useProductCapabilitiesValidationFixer();

  const handleRunValidation = async () => {
    try {
      await runValidation();
      toast.success("Validation complete");
    } catch (error) {
      toast.error("Validation failed");
    }
  };

  const handlePreviewFix = async () => {
    try {
      await previewFix();
      setShowFixPreview(true);
    } catch (error) {
      toast.error("Failed to generate fix preview");
    }
  };

  const handleFixAll = async () => {
    const result = await fixAllIssues();
    if (result.success) {
      setShowFixPreview(false);
      await runValidation();
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Transform lastPreview to match FixPreviewDialog expected format
  const fixPreviewData = lastPreview ? {
    legacyTasks: lastPreview.modulesToCreate.map(m => ({
      id: m.moduleId,
      area: m.moduleTitle,
      adminRoute: m.routePath,
      matchingFeatureCode: null
    })),
    featuresToCreate: lastPreview.modulesToCreate.map(m => ({
      adminRoute: m.routePath,
      generatedFeatureCode: m.featureCode,
      area: m.moduleTitle
    })),
    tasksToUpdate: lastPreview.modulesToCreate.length,
    canAutoFix: lastPreview.totalFixable > 0
  } : null;

  if (!lastReport) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="font-medium">No validation report yet</p>
        <p className="text-sm text-muted-foreground mb-4">
          Click "Run Validation" to check Product Capabilities document health
        </p>
        <Button onClick={handleRunValidation} disabled={isValidating}>
          {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Play className="h-4 w-4 mr-2" />
          Run Validation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with health score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Last run: {lastReport.timestamp.toLocaleString()}
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-lg px-3 py-1",
            lastReport.healthScore >= 80 && "bg-green-50 text-green-700 border-green-200",
            lastReport.healthScore >= 60 && lastReport.healthScore < 80 && "bg-yellow-50 text-yellow-700 border-yellow-200",
            lastReport.healthScore < 60 && "bg-red-50 text-red-700 border-red-200"
          )}
        >
          Health Score: {lastReport.healthScore}%
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{lastReport.summary.totalModules}</p>
          <p className="text-xs text-muted-foreground">Total Modules</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{lastReport.summary.totalCapabilities}</p>
          <p className="text-xs text-muted-foreground">Total Capabilities</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            {lastReport.summary.modulesWithRoutes}
          </p>
          <p className="text-xs text-muted-foreground">With Routes</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {lastReport.summary.modulesWithoutRoutes}
          </p>
          <p className="text-xs text-muted-foreground">Missing Routes</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-3 text-center">
          <p className={cn(
            "text-2xl font-bold",
            lastReport.summary.incompleteModules > 0 ? "text-destructive" : "text-green-600"
          )}>
            {lastReport.summary.incompleteModules}
          </p>
          <p className="text-xs text-muted-foreground">Incomplete Modules</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className={cn(
            "text-2xl font-bold",
            lastReport.summary.modulesWithoutAI > 0 ? "text-yellow-600" : "text-green-600"
          )}>
            {lastReport.summary.modulesWithoutAI}
          </p>
          <p className="text-xs text-muted-foreground">Without AI</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">
            {lastReport.summary.modulesWithoutIntegrations}
          </p>
          <p className="text-xs text-muted-foreground">No Integrations</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">
            {lastReport.summary.badgeMismatches}
          </p>
          <p className="text-xs text-muted-foreground">Badge Mismatches</p>
        </div>
      </div>

      {/* Fix Actions */}
      {lastReport.fixableCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
          <div>
            <p className="font-medium">Missing Routes Detected</p>
            <p className="text-sm text-muted-foreground">
              {lastReport.fixableCount} modules can be auto-registered in application_features
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreviewFix}
              disabled={isPreviewing || isFixing}
            >
              {isPreviewing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Info className="h-4 w-4 mr-2" />
              )}
              Preview Fix
            </Button>
            <Button
              onClick={handlePreviewFix}
              disabled={isPreviewing || isFixing}
            >
              {isFixing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4 mr-2" />
              )}
              Fix All
            </Button>
          </div>
        </div>
      )}

      {/* Issues List */}
      {lastReport.issues.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">
            Issues ({lastReport.issues.length})
          </h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {lastReport.issues.map((issue) => (
                <div 
                  key={issue.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    issue.severity === 'error' && "border-destructive/50 bg-destructive/5",
                    issue.severity === 'warning' && "border-yellow-500/50 bg-yellow-50/50"
                  )}
                >
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{issue.message}</p>
                    {issue.details.moduleTitle && (
                      <p className="text-xs text-muted-foreground">
                        Module: {issue.details.moduleTitle} ({issue.details.moduleId})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.fixable && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Fixable
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {issue.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {lastReport.issues.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <p className="font-medium">All checks passed!</p>
          <p className="text-sm text-muted-foreground">
            Product Capabilities document is fully validated
          </p>
        </div>
      )}

      {/* Fix Preview Dialog */}
      <FixPreviewDialog
        open={showFixPreview}
        onOpenChange={setShowFixPreview}
        preview={fixPreviewData}
        isFixing={isFixing}
        onConfirm={handleFixAll}
      />
    </div>
  );
}
