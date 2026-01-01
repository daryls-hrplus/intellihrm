import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertCircle, 
  TrendingDown,
  TrendingUp,
  Minus,
  ClipboardList,
  Shield
} from "lucide-react";

interface ContributingFactor {
  factor: string;
  weight?: number;
}

interface RecommendedIntervention {
  intervention: string;
  priority?: "low" | "medium" | "high";
}

interface AIExplainabilityPanelProps {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskCategory: string;
  contributingFactors: string[] | ContributingFactor[];
  recommendedInterventions: string[] | RecommendedIntervention[];
  trendDirection?: "improving" | "stable" | "declining";
  confidenceScore?: number;
  dataFreshnessDays?: number;
  onRequestHumanReview?: () => void;
}

export function AIExplainabilityPanel({
  riskScore,
  riskLevel,
  riskCategory,
  contributingFactors,
  recommendedInterventions,
  trendDirection = "stable",
  confidenceScore = 75,
  dataFreshnessDays = 7,
  onRequestHumanReview,
}: AIExplainabilityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getRiskColor = () => {
    switch (riskLevel) {
      case "critical": return "text-destructive bg-destructive/10";
      case "high": return "text-warning bg-warning/10";
      case "medium": return "text-info bg-info/10";
      case "low": return "text-success bg-success/10";
    }
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case "improving": return <TrendingUp className="h-4 w-4 text-success" />;
      case "declining": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const normalizedFactors = contributingFactors.map(f => 
    typeof f === 'string' ? { factor: f } : f
  );

  const normalizedInterventions = recommendedInterventions.map(i => 
    typeof i === 'string' ? { intervention: i } : i
  );

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Why This Risk Was Flagged</CardTitle>
              <CardDescription>AI Explainability Report</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Risk Overview */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
              <p className="text-2xl font-bold">{riskScore}</p>
              <Progress value={riskScore} className="h-1.5 mt-2" />
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
              <Badge className={getRiskColor()}>
                {riskLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Trend</p>
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon()}
                <span className="text-sm font-medium capitalize">{trendDirection}</span>
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
              <p className="text-lg font-semibold">{confidenceScore}%</p>
            </div>
          </div>

          <Separator />

          {/* Contributing Factors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-warning" />
              <h4 className="font-medium text-sm">Contributing Factors</h4>
            </div>
            <ul className="space-y-2">
              {normalizedFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{factor.factor}</span>
                </li>
              ))}
              {normalizedFactors.length === 0 && (
                <li className="text-sm text-muted-foreground">No specific factors identified</li>
              )}
            </ul>
          </div>

          <Separator />

          {/* Recommended Interventions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">AI Recommended Interventions</h4>
            </div>
            <ul className="space-y-2">
              {normalizedInterventions.map((intervention, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-success mt-1">→</span>
                  <span>{intervention.intervention}</span>
                </li>
              ))}
              {normalizedInterventions.length === 0 && (
                <li className="text-sm text-muted-foreground">No interventions recommended</li>
              )}
            </ul>
          </div>

          <Separator />

          {/* Data Provenance */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Category: {formatCategory(riskCategory)}</span>
              <span>•</span>
              <span>Data freshness: {dataFreshnessDays} days</span>
            </div>
            {onRequestHumanReview && (
              <Button variant="outline" size="sm" onClick={onRequestHumanReview}>
                <Shield className="mr-2 h-3.5 w-3.5" />
                Request Human Review
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
