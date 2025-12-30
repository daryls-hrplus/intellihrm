import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Target,
  CheckCircle2,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmployeeSkillGap } from '@/types/valuesAssessment';

interface SkillGapActionCardProps {
  gap: EmployeeSkillGap;
  onCreateIDP?: (gap: EmployeeSkillGap) => void;
  onUpdateStatus?: (gapId: string, status: EmployeeSkillGap['status']) => void;
  showActions?: boolean;
}

const priorityConfig = {
  critical: { color: 'bg-destructive', textColor: 'text-destructive', icon: AlertTriangle },
  high: { color: 'bg-orange-500', textColor: 'text-orange-500', icon: AlertTriangle },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-500', icon: TrendingUp },
  low: { color: 'bg-blue-500', textColor: 'text-blue-500', icon: BookOpen },
};

const statusConfig = {
  open: { label: 'Open', variant: 'destructive' as const },
  in_progress: { label: 'In Progress', variant: 'secondary' as const },
  addressed: { label: 'Addressed', variant: 'outline' as const },
  closed: { label: 'Closed', variant: 'default' as const },
};

export function SkillGapActionCard({
  gap,
  onCreateIDP,
  onUpdateStatus,
  showActions = true
}: SkillGapActionCardProps) {
  const priority = priorityConfig[gap.priority];
  const status = statusConfig[gap.status];
  const progressPercent = gap.required_level > 0 
    ? (gap.current_level / gap.required_level) * 100 
    : 0;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      gap.status === 'closed' && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              priority.color,
              "bg-opacity-10"
            )}>
              <priority.icon className={cn("h-4 w-4", priority.textColor)} />
            </div>
            <div>
              <CardTitle className="text-base">{gap.capability_name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {gap.source.replace('_', ' ')} • Detected {new Date(gap.detected_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant="outline" className={cn("capitalize", priority.textColor)}>
              {gap.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Level</span>
            <span className="font-medium">
              {gap.current_level} / {gap.required_level}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gap Score: {gap.gap_score}</span>
            <span>{Math.round(progressPercent)}% of required</span>
          </div>
        </div>

        {/* Recommended Actions */}
        {gap.recommended_actions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommended Actions</p>
            <div className="space-y-1">
              {gap.recommended_actions.slice(0, 3).map((action, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Target className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{action.title}</span>
                  {action.completed && (
                    <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IDP Link */}
        {gap.idp_item_id && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Link2 className="h-4 w-4" />
            <span>Linked to Development Plan</span>
          </div>
        )}

        {/* Actions */}
        {showActions && gap.status !== 'closed' && (
          <div className="flex gap-2 pt-2">
            {!gap.idp_item_id && onCreateIDP && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateIDP(gap)}
              >
                <Target className="h-4 w-4 mr-1" />
                Create IDP Item
              </Button>
            )}
            
            {gap.status === 'open' && onUpdateStatus && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onUpdateStatus(gap.id, 'in_progress')}
              >
                Mark In Progress
              </Button>
            )}
            
            {gap.status === 'in_progress' && onUpdateStatus && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onUpdateStatus(gap.id, 'addressed')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Addressed
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
