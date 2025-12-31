import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAIGovernance } from "@/hooks/useAIGovernance";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Bot,
} from "lucide-react";

export function ISO42001ComplianceCard() {
  const navigate = useNavigate();
  const { summary, isLoading, modelRegistry } = useAIGovernance();

  // Calculate compliance status
  const getComplianceStatus = () => {
    if (isLoading) return { status: "loading", color: "secondary" };
    
    const hasOpenBias = summary.openBiasIncidents > 0;
    const hasPendingReviews = summary.pendingReviewsCount > 3;
    const modelCompliance = summary.totalModels > 0 
      ? (summary.compliantModels / summary.totalModels) * 100 
      : 100;
    
    if (hasOpenBias || modelCompliance < 80) {
      return { status: "Action Required", color: "destructive" };
    }
    if (hasPendingReviews || modelCompliance < 100) {
      return { status: "Needs Attention", color: "warning" };
    }
    return { status: "Compliant", color: "success" };
  };

  const compliance = getComplianceStatus();

  const getBadgeVariant = (color: string) => {
    switch (color) {
      case "destructive": return "destructive";
      case "warning": return "secondary";
      case "success": return "default";
      default: return "secondary";
    }
  };

  return (
    <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-base">ISO 42001 AI Governance</CardTitle>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <Badge variant={getBadgeVariant(compliance.color)}>
              {compliance.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Reviews</span>
                </div>
                <span className={`font-semibold ${summary.pendingReviewsCount > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                  {summary.pendingReviewsCount}
                </span>
                <span className="text-xs text-muted-foreground">pending</span>
              </div>
              
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">Bias</span>
                </div>
                <span className={`font-semibold ${summary.openBiasIncidents > 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {summary.openBiasIncidents}
                </span>
                <span className="text-xs text-muted-foreground">incidents</span>
              </div>
              
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Bot className="h-3 w-3" />
                  <span className="text-xs">Models</span>
                </div>
                <span className={`font-semibold ${summary.compliantModels < summary.totalModels ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {summary.compliantModels}/{summary.totalModels}
                </span>
                <span className="text-xs text-muted-foreground">compliant</span>
              </div>
            </div>

            {/* Quick Status Indicators */}
            <div className="flex flex-wrap gap-1">
              {summary.highRiskCount > 0 && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  {summary.highRiskCount} high-risk
                </Badge>
              )}
              {summary.overridesCount > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {summary.overridesCount} overrides
                </Badge>
              )}
              {summary.avgRiskScore < 0.3 && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Low risk avg
                </Badge>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/admin/ai-governance")}
            >
              <span className="text-xs">View Full AI Governance</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
