import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, BookOpen, Layers } from "lucide-react";
import { ContextAnalysis } from "@/hooks/useContentCreationAgent";
import { ManualDefinition } from "@/hooks/useManualGeneration";
import { cn } from "@/lib/utils";

interface ContextualCoverageSummaryProps {
  mode: 'module' | 'manual';
  selectedManualId?: string;
  selectedModuleCode?: string;
  analysis: ContextAnalysis | null;
  isLoading: boolean;
  onAnalyze: () => void;
  manuals?: ManualDefinition[];
}

export function ContextualCoverageSummary({
  mode,
  selectedManualId,
  selectedModuleCode,
  analysis,
  isLoading,
  onAnalyze,
  manuals = [],
}: ContextualCoverageSummaryProps) {
  // Determine context label based on mode and selection
  const getContextLabel = () => {
    if (mode === 'manual') {
      const manual = manuals.find(m => m.id === selectedManualId);
      if (manual) {
        return (
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            {manual.manual_name}
          </span>
        );
      }
      return "Select a manual to analyze";
    }
    
    if (selectedModuleCode) {
      return (
        <span className="flex items-center gap-1.5">
          <Layers className="h-3 w-3" />
          {selectedModuleCode} module
        </span>
      );
    }
    
    return "System-wide coverage";
  };

  const canAnalyze = mode === 'module' || (mode === 'manual' && selectedManualId);

  return (
    <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {getContextLabel()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAnalyze}
          disabled={isLoading || !canAnalyze}
          className="h-7 px-2"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-2">
          <Progress 
            value={analysis.coveragePercentage} 
            className={cn(
              "h-2",
              analysis.coveragePercentage >= 80 ? "[&>div]:bg-green-500" :
              analysis.coveragePercentage >= 50 ? "[&>div]:bg-yellow-500" : 
              "[&>div]:bg-red-500"
            )}
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {analysis.documented} of {analysis.totalFeatures} documented
            </span>
            <span className={cn(
              "font-semibold",
              analysis.coveragePercentage >= 80 ? "text-green-600" :
              analysis.coveragePercentage >= 50 ? "text-yellow-600" : 
              "text-red-600"
            )}>
              {analysis.coveragePercentage}%
            </span>
          </div>
          {analysis.undocumented > 0 && (
            <p className="text-xs text-muted-foreground">
              {analysis.undocumented} gaps to address
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          {canAnalyze 
            ? "Click Analyze to see coverage for this scope"
            : "Select a manual to analyze its coverage"
          }
        </p>
      )}
    </div>
  );
}
