import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAIGovernance } from "@/hooks/useAIGovernance";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Bot,
  ExternalLink,
} from "lucide-react";

export function ISO42001ComplianceCard() {
  const navigate = useNavigate();
  const { summary, isLoading } = useAIGovernance();

  const getComplianceStatus = () => {
    if (isLoading) return { status: "...", color: "secondary" };
    
    const hasOpenBias = summary.openBiasIncidents > 0;
    const hasPendingReviews = summary.pendingReviewsCount > 3;
    const modelCompliance = summary.totalModels > 0 
      ? (summary.compliantModels / summary.totalModels) * 100 
      : 100;
    
    if (hasOpenBias || modelCompliance < 80) {
      return { status: "Action Required", color: "destructive" };
    }
    if (hasPendingReviews || modelCompliance < 100) {
      return { status: "Attention", color: "warning" };
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

  if (isLoading) {
    return <Skeleton className="h-8 w-48" />;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-muted/30">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">AI Governance</span>
              <Badge variant={getBadgeVariant(compliance.color)} className="text-[10px] px-1.5 py-0">
                {compliance.status}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2 p-1">
              <p className="font-medium text-xs">AI Governance Status</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <Clock className="h-3 w-3 text-muted-foreground mb-0.5" />
                  <span className={`font-semibold ${summary.pendingReviewsCount > 0 ? 'text-amber-600' : ''}`}>
                    {summary.pendingReviewsCount}
                  </span>
                  <span className="text-muted-foreground text-[10px]">reviews</span>
                </div>
                <div className="flex flex-col items-center">
                  <AlertTriangle className="h-3 w-3 text-muted-foreground mb-0.5" />
                  <span className={`font-semibold ${summary.openBiasIncidents > 0 ? 'text-red-600' : ''}`}>
                    {summary.openBiasIncidents}
                  </span>
                  <span className="text-muted-foreground text-[10px]">bias</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bot className="h-3 w-3 text-muted-foreground mb-0.5" />
                  <span className="font-semibold">{summary.compliantModels}/{summary.totalModels}</span>
                  <span className="text-muted-foreground text-[10px]">models</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/admin/ai-governance")}
        >
          <ExternalLink className="h-2.5 w-2.5" />
        </Button>
      </div>
    </TooltipProvider>
  );
}
