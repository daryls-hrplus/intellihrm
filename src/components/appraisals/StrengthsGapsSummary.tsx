import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, TrendingUp, AlertTriangle, AlertCircle, Sparkles, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { StrengthGap, getCategoryColor, getPriorityColor } from "@/hooks/useAppraisalStrengthsGaps";

interface StrengthsGapsSummaryProps {
  strengths: StrengthGap[];
  gaps: StrengthGap[];
  riskIndicators: StrengthGap[];
  isLoading?: boolean;
  onCreateIdpGoal?: (gap: StrengthGap) => void;
}

export function StrengthsGapsSummary({ 
  strengths, 
  gaps, 
  riskIndicators, 
  isLoading,
  onCreateIdpGoal 
}: StrengthsGapsSummaryProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    strengths: true,
    gaps: true,
    risks: riskIndicators.length > 0,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContent = strengths.length > 0 || gaps.length > 0 || riskIndicators.length > 0;

  if (!hasContent) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No strengths, gaps, or risks identified yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strengths Section */}
        {strengths.length > 0 && (
          <Collapsible open={openSections.strengths} onOpenChange={() => toggleSection("strengths")}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-300">Strengths</span>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-800">{strengths.length}</Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${openSections.strengths ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {strengths.map((item) => (
                  <InsightCard key={item.id} item={item} variant="strength" />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Gaps Section */}
        {gaps.length > 0 && (
          <Collapsible open={openSections.gaps} onOpenChange={() => toggleSection("gaps")}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800 dark:text-amber-300">Development Areas</span>
                  <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800">{gaps.length}</Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-amber-600 transition-transform ${openSections.gaps ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {gaps.map((item) => (
                  <InsightCard key={item.id} item={item} variant="gap" onCreateIdp={onCreateIdpGoal} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Risk Indicators Section */}
        {riskIndicators.length > 0 && (
          <Collapsible open={openSections.risks} onOpenChange={() => toggleSection("risks")}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-300">Risk Indicators</span>
                  <Badge variant="destructive">{riskIndicators.length}</Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-red-600 transition-transform ${openSections.risks ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {riskIndicators.map((item) => (
                  <InsightCard key={item.id} item={item} variant="risk" />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  item: StrengthGap;
  variant: "strength" | "gap" | "risk";
  onCreateIdp?: (gap: StrengthGap) => void;
}

function InsightCard({ item, variant, onCreateIdp }: InsightCardProps) {
  const bgClass = {
    strength: "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
    gap: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
    risk: "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
  };

  return (
    <div className={`p-3 rounded-lg border ${bgClass[variant]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{item.title}</span>
            <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
              {item.category.replace("_", " ")}
            </Badge>
            {item.priority !== "medium" && (
              <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          {item.suggested_action && (
            <p className="text-sm text-primary mt-1">
              <span className="font-medium">Suggested: </span>{item.suggested_action}
            </p>
          )}
          {item.ai_identified && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              AI Identified {item.ai_confidence && `(${(item.ai_confidence * 100).toFixed(0)}% confidence)`}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {item.evidence_ids && item.evidence_ids.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {item.evidence_ids.length}
            </Badge>
          )}
          {variant === "gap" && !item.linked_idp_goal_id && onCreateIdp && (
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onCreateIdp(item)}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Create IDP
            </Button>
          )}
          {item.linked_idp_goal_id && (
            <Badge variant="outline" className="text-xs bg-primary/10">
              Linked to IDP
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
