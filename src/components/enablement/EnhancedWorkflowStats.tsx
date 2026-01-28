import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEnablementProgress } from "@/hooks/useEnablementProgress";
import { FileText, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

export function EnhancedWorkflowStats() {
  const progress = useEnablementProgress();
  const { navigateToList } = useWorkspaceNavigation();

  if (progress.isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const totalItems = progress.totalContent + progress.pendingReviewCount + progress.approvedCount;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Workflow Progress
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigateToList({
              route: "/enablement/artifacts",
              title: "Enablement Artifacts",
              moduleCode: "enablement",
              icon: FileText,
            })}
          >
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar Visualization */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground min-w-16">Draft</span>
            <div className="flex-1 relative">
              <Progress value={progress.reviewedPercentage} className="h-2" />
            </div>
            <span className="text-sm font-medium min-w-10 text-right">
              {progress.pendingReviewCount}
            </span>
            <span className="text-xs text-muted-foreground">pending</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground min-w-16">Published</span>
            <div className="flex-1 relative">
              <Progress 
                value={progress.publishedPercentage} 
                className="h-2 [&>div]:bg-emerald-500" 
              />
            </div>
            <span className="text-sm font-medium min-w-10 text-right text-emerald-500">
              {progress.publishedCount}
            </span>
            <span className="text-xs text-muted-foreground">articles</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between pt-2 border-t text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{progress.totalContent} created</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-medium">{progress.pendingReviewCount}</span>
              <span className="text-muted-foreground">pending</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500 font-medium">{progress.publishedCount}</span>
              <span className="text-muted-foreground">published</span>
            </div>
          </div>
          
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{progress.reviewedPercentage}%</span> reviewed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
