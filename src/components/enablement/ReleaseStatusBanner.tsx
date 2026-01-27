import { useReleaseLifecycle } from "@/hooks/useReleaseLifecycle";
import { ReleaseStatusBadge } from "./ReleaseStatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Rocket, Calendar, Target, ArrowRight, Loader2 } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

interface ReleaseStatusBannerProps {
  showProgress?: boolean;
  compact?: boolean;
}

export function ReleaseStatusBanner({ 
  showProgress = true, 
  compact = false 
}: ReleaseStatusBannerProps) {
  const { 
    lifecycle, 
    isLoading, 
    getDaysToGA, 
    getMilestoneProgress 
  } = useReleaseLifecycle();
  const { navigateToList } = useWorkspaceNavigation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/30">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Loading release status...</span>
      </div>
    );
  }

  if (!lifecycle) return null;

  const daysToGA = getDaysToGA();
  const milestoneProgress = getMilestoneProgress();

  const handleOpenCommandCenter = () => {
    navigateToList({
      route: '/enablement/release-center',
      title: 'Release Command Center',
      moduleCode: 'enablement',
      icon: Rocket,
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 border rounded-lg bg-muted/30">
        <Rocket className="h-4 w-4 text-muted-foreground" />
        <ReleaseStatusBadge showVersion size="sm" />
        {daysToGA !== null && daysToGA > 0 && (
          <span className="text-xs text-muted-foreground">
            {daysToGA} days to GA
          </span>
        )}
        {lifecycle.last_readiness_score !== null && (
          <span className="text-xs text-muted-foreground">
            Readiness: {lifecycle.last_readiness_score}%
          </span>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto h-6 text-xs"
          onClick={handleOpenCommandCenter}
        >
          Details
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Release v{lifecycle.base_version}</span>
              <ReleaseStatusBadge size="sm" />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              {lifecycle.target_ga_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  GA: {formatDateForDisplay(lifecycle.target_ga_date, 'MMM d, yyyy')}
                  {daysToGA !== null && daysToGA > 0 && ` (${daysToGA} days)`}
                </span>
              )}
              {milestoneProgress.total > 0 && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {milestoneProgress.completed}/{milestoneProgress.total} milestones
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Middle section - Progress */}
        {showProgress && milestoneProgress.total > 0 && (
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Milestone Progress</span>
              <span>{milestoneProgress.percentage}%</span>
            </div>
            <Progress value={milestoneProgress.percentage} className="h-2" />
          </div>
        )}

        {/* Right section - Readiness & CTA */}
        <div className="flex items-center gap-3">
          {lifecycle.last_readiness_score !== null && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Readiness</div>
              <div className={`text-lg font-bold ${
                lifecycle.last_readiness_score >= 80 ? 'text-[hsl(var(--semantic-success-text))]' :
                lifecycle.last_readiness_score >= 60 ? 'text-[hsl(var(--semantic-warning-text))]' : 'text-[hsl(var(--semantic-error-text))]'
              }`}>
                {lifecycle.last_readiness_score}%
              </div>
            </div>
          )}
          <Button onClick={handleOpenCommandCenter}>
            Command Center
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
