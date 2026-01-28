import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileX,
  FileQuestion,
  Rocket,
  ClipboardList,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { GapAnalysis, GapSummary } from "@/hooks/useContentCreationAgent";
import { cn } from "@/lib/utils";

interface GapResultsMessageProps {
  gaps: GapAnalysis;
  summary: GapSummary;
  onGenerateForFeature: (featureCode: string, type: 'kb' | 'manual' | 'sop') => void;
  onViewFullAnalysis: () => void;
}

export function GapResultsMessage({
  gaps,
  summary,
  onGenerateForFeature,
  onViewFullAnalysis,
}: GapResultsMessageProps) {
  const totalGaps =
    summary.undocumentedFeatures +
    summary.missingKBArticles +
    summary.missingQuickStarts +
    summary.missingSOPs +
    summary.orphanedDocumentation;

  const categories = [
    {
      label: "Undocumented",
      count: summary.undocumentedFeatures,
      icon: FileX,
      bgColor: "bg-red-50 dark:bg-red-950/30",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Missing KB",
      count: summary.missingKBArticles,
      icon: FileQuestion,
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "No Quick Start",
      count: summary.missingQuickStarts,
      icon: Rocket,
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Missing SOP",
      count: summary.missingSOPs,
      icon: ClipboardList,
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  // Get top priority gaps to show
  const topGaps = gaps.noDocumentation?.slice(0, 3) || [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Gap Analysis Complete</span>
        <Badge variant="secondary" className="ml-auto">
          {totalGaps} total gaps
        </Badge>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className={cn("p-2 rounded-lg", cat.bgColor)}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={cn("h-3.5 w-3.5", cat.textColor)} />
                <span className={cn("text-lg font-bold", cat.textColor)}>
                  {cat.count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Orphaned warning */}
      {summary.orphanedDocumentation > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <span className="text-xs text-yellow-700 dark:text-yellow-300">
            {summary.orphanedDocumentation} orphaned documentation section(s) referencing invalid features
          </span>
        </div>
      )}

      {/* Top Priority Actions */}
      {topGaps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">
            Priority: Address these first
          </p>
          {topGaps.map((gap) => (
            <div
              key={gap.feature_code}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{gap.feature_name}</p>
                <p className="text-xs text-muted-foreground truncate">{gap.module_name}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => onGenerateForFeature(gap.feature_code, 'kb')}
              >
                Generate
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onViewFullAnalysis}
      >
        View Full Analysis
        <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
}
