import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  FileX,
  FileQuestion,
  Rocket,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { GapSummary } from "@/hooks/useContentCreationAgent";
import { cn } from "@/lib/utils";

interface GapSummaryCardProps {
  summary: GapSummary | null;
  onViewDetails: () => void;
}

export function GapSummaryCard({ summary, onViewDetails }: GapSummaryCardProps) {
  if (!summary) {
    return null;
  }

  const totalGaps =
    summary.undocumentedFeatures +
    summary.missingKBArticles +
    summary.missingQuickStarts +
    summary.missingSOPs +
    summary.orphanedDocumentation;

  if (totalGaps === 0) {
    return null;
  }

  const categories = [
    {
      label: "Undocumented",
      count: summary.undocumentedFeatures,
      icon: FileX,
      variant: "destructive" as const,
    },
    {
      label: "Missing KB",
      count: summary.missingKBArticles,
      icon: FileQuestion,
      variant: "secondary" as const,
    },
    {
      label: "No Quick Start",
      count: summary.missingQuickStarts,
      icon: Rocket,
      variant: "secondary" as const,
    },
    {
      label: "Missing SOP",
      count: summary.missingSOPs,
      icon: ClipboardList,
      variant: "secondary" as const,
    },
    {
      label: "Orphaned",
      count: summary.orphanedDocumentation,
      icon: AlertTriangle,
      variant: "outline" as const,
    },
  ].filter((cat) => cat.count > 0);

  return (
    <Card className="border-[hsl(var(--semantic-warning-border))] bg-[hsl(var(--semantic-warning-bg))]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[hsl(var(--semantic-warning-text))]" />
          Documentation Gaps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {categories.slice(0, 4).map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="flex items-center justify-between p-2 rounded-lg bg-background/60"
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{cat.label}</span>
                </div>
                <Badge variant={cat.variant} className="h-5 text-xs px-1.5">
                  {cat.count}
                </Badge>
              </div>
            );
          })}
        </div>

        <Button
          variant="link"
          size="sm"
          onClick={onViewDetails}
          className="p-0 h-auto text-xs w-full justify-start"
        >
          View detailed breakdown
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
