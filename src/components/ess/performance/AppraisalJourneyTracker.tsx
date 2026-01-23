import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { 
  useAppraisalJourneyStages, 
  type JourneyStage, 
  type StageStatus,
  type DisputeStage,
  getDefaultJourneyStages 
} from "@/hooks/useAppraisalJourneyStages";
import { 
  User, Users, Briefcase, Shield, 
  AlertTriangle, Clock, CheckCircle2, Circle,
  ChevronRight, GitBranch
} from "lucide-react";

interface AppraisalJourneyTrackerProps {
  // Can pass participant data directly
  participantId?: string;
  cycleId?: string;
  templateId?: string;
  participantStatus?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  cycleStartDate?: string;
  cycleEndDate?: string;
  // Phase-specific deadlines from cycle
  selfAssessmentDeadline?: string | null;
  feedback360Deadline?: string | null;
  managerReviewDeadline?: string | null;
  calibrationDeadline?: string | null;
  finalizationDeadline?: string | null;
  acknowledgmentDeadline?: string | null;
  // Employee response tracking
  employeeResponseStatus?: string | null;
  hasEmployeeResponse?: boolean;
  // Template configuration flags for filtering default stages
  includeGoals?: boolean;
  includeCompetencies?: boolean;
  // Display options
  variant?: 'horizontal' | 'vertical' | 'compact';
  showDates?: boolean;
  showActorLabels?: boolean;
  showDeadlineWarnings?: boolean;
  className?: string;
}

// Status color classes using semantic tokens
const STATUS_COLORS: Record<StageStatus, { bg: string; border: string; text: string; icon: string }> = {
  completed: {
    bg: 'bg-success/10',
    border: 'border-success',
    text: 'text-success',
    icon: 'text-success',
  },
  current: {
    bg: 'bg-primary/10',
    border: 'border-primary',
    text: 'text-primary',
    icon: 'text-primary',
  },
  at_risk: {
    bg: 'bg-warning/10',
    border: 'border-warning',
    text: 'text-warning',
    icon: 'text-warning',
  },
  overdue: {
    bg: 'bg-destructive/10',
    border: 'border-destructive',
    text: 'text-destructive',
    icon: 'text-destructive',
  },
  pending: {
    bg: 'bg-muted',
    border: 'border-muted-foreground/30',
    text: 'text-muted-foreground',
    icon: 'text-muted-foreground',
  },
  skipped: {
    bg: 'bg-muted/50',
    border: 'border-muted-foreground/20',
    text: 'text-muted-foreground/60 line-through',
    icon: 'text-muted-foreground/40',
  },
};

// Actor icon component
function ActorIcon({ actor }: { actor: JourneyStage['actor'] }) {
  switch (actor) {
    case 'employee':
      return <User className="h-3 w-3" />;
    case 'manager':
      return <Briefcase className="h-3 w-3" />;
    case 'hr':
      return <Shield className="h-3 w-3" />;
    case 'peers':
      return <Users className="h-3 w-3" />;
    default:
      return <Circle className="h-3 w-3" />;
  }
}

// Deadline badge component
function DeadlineBadge({ stage }: { stage: JourneyStage }) {
  if (stage.status === 'completed' || stage.status === 'skipped' || stage.status === 'pending') {
    return null;
  }

  if (stage.isOverdue) {
    return (
      <Badge variant="destructive" className="text-xs gap-1">
        <AlertTriangle className="h-3 w-3" />
        Overdue
      </Badge>
    );
  }

  if (stage.daysRemaining !== undefined && stage.daysRemaining <= 3) {
    return (
      <Badge variant="outline" className="text-xs gap-1 border-warning text-warning bg-warning/10">
        <Clock className="h-3 w-3" />
        {stage.daysRemaining === 0 ? 'Due today' : `${stage.daysRemaining}d left`}
      </Badge>
    );
  }

  return null;
}

// Horizontal variant - connected nodes
function HorizontalTracker({ 
  stages, 
  showActorLabels = true,
  showDeadlineWarnings = true,
}: { 
  stages: JourneyStage[];
  showActorLabels?: boolean;
  showDeadlineWarnings?: boolean;
}) {
  return (
    <div 
      className="flex items-start gap-0 overflow-x-auto pb-2"
      role="progressbar"
      aria-valuenow={stages.filter(s => s.status === 'completed').length}
      aria-valuemin={0}
      aria-valuemax={stages.length}
    >
      {stages.map((stage, index) => {
        const StageIcon = stage.icon;
        const colors = STATUS_COLORS[stage.status];
        const isLast = index === stages.length - 1;
        
        return (
          <div key={stage.key} className="flex items-start">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center min-w-[80px]">
                    {/* Node */}
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                        colors.bg,
                        colors.border,
                        stage.status === 'current' && "ring-2 ring-primary/30 animate-pulse"
                      )}
                      aria-label={`${stage.label}: ${stage.status}`}
                    >
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className={cn("h-4 w-4", colors.icon)} />
                      ) : (
                        <StageIcon className={cn("h-4 w-4", colors.icon)} />
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={cn(
                      "text-xs font-medium mt-1 text-center max-w-[70px] truncate",
                      colors.text
                    )}>
                      {stage.label}
                    </span>
                    
                    {/* Actor label */}
                    {showActorLabels && (stage.status === 'current' || stage.status === 'at_risk' || stage.status === 'overdue') && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <ActorIcon actor={stage.actor} />
                        <span className="text-[10px] text-muted-foreground">
                          {stage.actorLabel}
                        </span>
                      </div>
                    )}
                    
                    {/* Deadline warning */}
                    {showDeadlineWarnings && <DeadlineBadge stage={stage} />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium">{stage.label}</p>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                  {stage.deadline && (
                    <p className="text-xs mt-1">
                      Deadline: {format(parseISO(stage.deadline), 'MMM d, yyyy')}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                "w-8 h-0.5 mt-4 transition-colors",
                stage.status === 'completed' ? "bg-success" : "bg-muted-foreground/30"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Vertical variant - timeline style
function VerticalTracker({ 
  stages,
  showDates = true,
  showActorLabels = true,
  showDeadlineWarnings = true,
}: { 
  stages: JourneyStage[];
  showDates?: boolean;
  showActorLabels?: boolean;
  showDeadlineWarnings?: boolean;
}) {
  return (
    <div 
      className="relative pl-6"
      role="progressbar"
      aria-valuenow={stages.filter(s => s.status === 'completed').length}
      aria-valuemin={0}
      aria-valuemax={stages.length}
    >
      {/* Vertical line */}
      <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-muted-foreground/20" />
      
      {stages.map((stage, index) => {
        const StageIcon = stage.icon;
        const colors = STATUS_COLORS[stage.status];
        
        return (
          <div key={stage.key} className="relative flex items-start gap-3 pb-6 last:pb-0">
            {/* Node */}
            <div 
              className={cn(
                "absolute -left-3.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-background z-10",
                colors.border,
                stage.status === 'current' && "ring-2 ring-primary/30"
              )}
            >
              {stage.status === 'completed' ? (
                <CheckCircle2 className={cn("h-3 w-3", colors.icon)} />
              ) : (
                <StageIcon className={cn("h-3 w-3", colors.icon)} />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("font-medium text-sm", colors.text)}>
                  {stage.label}
                </span>
                
                {stage.status === 'current' && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
                
                {showDeadlineWarnings && <DeadlineBadge stage={stage} />}
              </div>
              
              {/* Actor label */}
              {showActorLabels && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <ActorIcon actor={stage.actor} />
                  <span>{stage.actorLabel}</span>
                </div>
              )}
              
              {/* Deadline date */}
              {showDates && stage.deadline && (
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {format(parseISO(stage.deadline), 'MMM d, yyyy')}
                </p>
              )}
              
              {/* Completed date */}
              {showDates && stage.completedAt && (
                <p className="text-xs text-success mt-1">
                  Completed: {format(parseISO(stage.completedAt), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compact variant - pill style
function CompactTracker({ stages }: { stages: JourneyStage[] }) {
  const currentIndex = stages.findIndex(s => 
    s.status === 'current' || s.status === 'at_risk' || s.status === 'overdue'
  );
  const completedCount = stages.filter(s => s.status === 'completed').length;
  
  return (
    <div className="flex items-center gap-1.5">
      {stages.map((stage, index) => {
        const colors = STATUS_COLORS[stage.status];
        const isActive = index === currentIndex;
        
        return (
          <TooltipProvider key={stage.key}>
            <Tooltip>
              <TooltipTrigger>
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    isActive ? "w-6" : "w-2",
                    stage.status === 'completed' && "bg-success",
                    (stage.status === 'current' || stage.status === 'at_risk') && "bg-primary animate-pulse",
                    stage.status === 'overdue' && "bg-destructive",
                    stage.status === 'pending' && "bg-muted-foreground/30",
                    stage.status === 'skipped' && "bg-muted-foreground/20"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium text-xs">{stage.label}</p>
                <p className="text-xs capitalize">{stage.status.replace('_', ' ')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      
      <span className="text-xs text-muted-foreground ml-2">
        {completedCount}/{stages.length}
      </span>
    </div>
  );
}

// Dispute branch visualization
function DisputeBranch({ stages }: { stages: DisputeStage[] }) {
  if (stages.length === 0) return null;
  
  return (
    <div className="mt-4 pt-4 border-t border-dashed">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <GitBranch className="h-3 w-3" />
        <span>Response Path</span>
      </div>
      <div className="flex items-center gap-2 pl-4">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center">
            <Badge 
              variant={stage.status === 'completed' ? 'default' : 'outline'}
              className="text-xs"
            >
              {stage.label}
            </Badge>
            {index < stages.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppraisalJourneyTracker({
  participantId,
  cycleId,
  templateId,
  participantStatus,
  submittedAt,
  reviewedAt,
  cycleStartDate,
  cycleEndDate,
  selfAssessmentDeadline,
  feedback360Deadline,
  managerReviewDeadline,
  calibrationDeadline,
  finalizationDeadline,
  acknowledgmentDeadline,
  employeeResponseStatus,
  hasEmployeeResponse,
  includeGoals,
  includeCompetencies,
  variant = 'horizontal',
  showDates = false,
  showActorLabels = true,
  showDeadlineWarnings = true,
  className,
}: AppraisalJourneyTrackerProps) {
  const {
    stages,
    hasDisputeBranch,
    disputeStages,
    isLoading,
    completionPercentage,
    isComplete,
    nextAction,
  } = useAppraisalJourneyStages({
    participantId,
    cycleId,
    templateId,
    participantStatus,
    submittedAt,
    reviewedAt,
    cycleStartDate,
    cycleEndDate,
    selfAssessmentDeadline,
    feedback360Deadline,
    managerReviewDeadline,
    calibrationDeadline,
    finalizationDeadline,
    acknowledgmentDeadline,
    employeeResponseStatus,
    hasEmployeeResponse,
  });

  // Use default stages if none loaded, filtered by template config
  const displayStages = stages.length > 0 
    ? stages 
    : getDefaultJourneyStages({ includeGoals });

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-8 h-8 rounded-full bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {/* Progress summary for screen readers */}
      <span className="sr-only">
        Appraisal progress: {completionPercentage}% complete. 
        {nextAction && `Next action: ${nextAction.text}`}
      </span>

      {variant === 'horizontal' && (
        <HorizontalTracker 
          stages={displayStages} 
          showActorLabels={showActorLabels}
          showDeadlineWarnings={showDeadlineWarnings}
        />
      )}
      
      {variant === 'vertical' && (
        <VerticalTracker 
          stages={displayStages}
          showDates={showDates}
          showActorLabels={showActorLabels}
          showDeadlineWarnings={showDeadlineWarnings}
        />
      )}
      
      {variant === 'compact' && (
        <CompactTracker stages={displayStages} />
      )}

      {/* Dispute branch if employee filed a response */}
      {hasDisputeBranch && variant !== 'compact' && (
        <DisputeBranch stages={disputeStages} />
      )}
    </div>
  );
}

// Wrapped version for cards
export function AppraisalJourneyCard({
  title = "Appraisal Progress",
  ...props
}: AppraisalJourneyTrackerProps & { title?: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AppraisalJourneyTracker {...props} />
      </CardContent>
    </Card>
  );
}
