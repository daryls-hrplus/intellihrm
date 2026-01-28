import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, Zap } from "lucide-react";
import { useEnablementRecommendations } from "@/hooks/useEnablementRecommendations";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { cn } from "@/lib/utils";

export function RecommendedNextActions() {
  const { recommendation, secondaryActions, isLoading } = useEnablementRecommendations();
  const { navigateToList } = useWorkspaceNavigation();

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const Icon = recommendation.icon;

  return (
    <Card
      className={cn(
        "border-primary/20 transition-all",
        recommendation.priority === "high" && "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10",
        recommendation.priority === "medium" && "bg-gradient-to-br from-primary/5 via-background to-primary/10",
        recommendation.priority === "success" && "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-emerald-500/10",
        recommendation.priority === "low" && "bg-muted/30"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              recommendation.priority === "high" && "bg-amber-500/10",
              recommendation.priority === "medium" && "bg-primary/10",
              recommendation.priority === "success" && "bg-emerald-500/10",
              recommendation.priority === "low" && "bg-muted"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                recommendation.priority === "high" && "text-amber-500",
                recommendation.priority === "medium" && "text-primary",
                recommendation.priority === "success" && "text-emerald-500",
                recommendation.priority === "low" && "text-muted-foreground"
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recommended Action
              </span>
              {recommendation.priority === "high" && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold">{recommendation.action}</h3>
            <p className="text-sm text-muted-foreground">{recommendation.description}</p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                onClick={() => navigateToList({
                  route: recommendation.href,
                  title: recommendation.action,
                  moduleCode: "enablement",
                  icon: recommendation.icon,
                })}
                className={cn(
                  recommendation.priority === "success" && "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {recommendation.priority === "success" ? "Continue Creating" : "Get Started"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {secondaryActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToList({
                    route: action.href,
                    title: action.action,
                    moduleCode: "enablement",
                    icon: action.icon,
                  })}
                >
                  {action.action}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
