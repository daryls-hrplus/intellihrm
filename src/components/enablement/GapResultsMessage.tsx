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
  Database,
} from "lucide-react";
import { GapAnalysis, GapSummary } from "@/hooks/useContentCreationAgent";
import { useRegistryFeatureCodes } from "@/hooks/useRegistryFeatureCodes";
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
  // Get registry feature count to show source of truth
  const { totalCount: registryFeatureCount } = useRegistryFeatureCodes();

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
      bgColor: "bg-[hsl(var(--semantic-error-bg))]",
      textColor: "text-[hsl(var(--semantic-error-text))]",
    },
    {
      label: "Missing KB",
      count: summary.missingKBArticles,
      icon: FileQuestion,
      bgColor: "bg-[hsl(var(--semantic-warning-bg))]",
      textColor: "text-[hsl(var(--semantic-warning-text))]",
    },
    {
      label: "No Quick Start",
      count: summary.missingQuickStarts,
      icon: Rocket,
      bgColor: "bg-[hsl(var(--semantic-info-bg))]",
      textColor: "text-[hsl(var(--semantic-info-text))]",
    },
    {
      label: "Missing SOP",
      count: summary.missingSOPs,
      icon: ClipboardList,
      bgColor: "bg-[hsl(var(--semantic-neutral-bg))]",
      textColor: "text-[hsl(var(--semantic-neutral-text))]",
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
          {totalGaps} gaps
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1.5 gap-1">
          <Database className="h-2.5 w-2.5" />
          {registryFeatureCount}
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
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--semantic-warning-bg))] border border-[hsl(var(--semantic-warning-border))]">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--semantic-warning-text))] flex-shrink-0" />
          <span className="text-xs text-[hsl(var(--semantic-warning-text))]">
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
