import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  Target,
  BookOpen,
  Award,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  useContinuousPerformance,
  TrajectoryScore,
  ContributingFactor,
  SignalType,
  MomentumType,
  TrendDirection,
  RiskLevel
} from '@/hooks/performance/useContinuousPerformance';

interface PerformanceTrajectoryCardProps {
  employeeId: string;
  companyId: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const signalTypeConfig: Record<SignalType, { label: string; icon: React.ReactNode; color: string }> = {
  goal_progress: { label: 'Goals', icon: <Target className="h-3 w-3" />, color: 'bg-blue-500' },
  feedback: { label: 'Feedback', icon: <MessageSquare className="h-3 w-3" />, color: 'bg-purple-500' },
  training: { label: 'Training', icon: <BookOpen className="h-3 w-3" />, color: 'bg-green-500' },
  recognition: { label: 'Recognition', icon: <Award className="h-3 w-3" />, color: 'bg-yellow-500' },
  check_in: { label: 'Check-ins', icon: <MessageSquare className="h-3 w-3" />, color: 'bg-indigo-500' },
};

const momentumConfig: Record<MomentumType, { label: string; icon: React.ReactNode; color: string }> = {
  accelerating: { label: 'Accelerating', icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-600' },
  stable: { label: 'Stable', icon: <Minus className="h-4 w-4" />, color: 'text-blue-600' },
  decelerating: { label: 'Decelerating', icon: <TrendingDown className="h-4 w-4" />, color: 'text-orange-600' },
};

const trendConfig: Record<TrendDirection, { label: string; color: string }> = {
  improving: { label: 'Improving', color: 'text-green-600 bg-green-50' },
  stable: { label: 'Stable', color: 'text-blue-600 bg-blue-50' },
  declining: { label: 'Declining', color: 'text-orange-600 bg-orange-50' },
};

const riskConfig: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-50' },
  medium: { label: 'Medium Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  high: { label: 'High Risk', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export function PerformanceTrajectoryCard({
  employeeId,
  companyId,
  showDetails = true,
  compact = false,
  className,
}: PerformanceTrajectoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    loading,
    trajectoryScore,
    calculateTrajectory,
    fetchTrajectoryScore,
  } = useContinuousPerformance();

  useEffect(() => {
    if (employeeId) {
      fetchTrajectoryScore(employeeId);
    }
  }, [employeeId, fetchTrajectoryScore]);

  const handleRefresh = async () => {
    await calculateTrajectory(employeeId, companyId);
  };

  if (loading && !trajectoryScore) {
    return (
      <Card className={className}>
        <CardHeader className={compact ? 'pb-2' : ''}>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trajectoryScore) {
    return (
      <Card className={className}>
        <CardContent className={cn("text-center", compact ? "py-4" : "py-8")}>
          <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No trajectory data available
          </p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Calculate Trajectory
          </Button>
        </CardContent>
      </Card>
    );
  }

  const momentum = momentumConfig[trajectoryScore.momentum];
  const trend = trendConfig[trajectoryScore.trendDirection];
  const risk = riskConfig[trajectoryScore.riskLevel];

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", risk.bgColor)}>
                {momentum.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(trajectoryScore.trajectoryScore)}</div>
                <div className="text-xs text-muted-foreground">Trajectory Score</div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={trend.color}>{trend.label}</Badge>
              <div className="text-xs text-muted-foreground mt-1">{momentum.label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Performance Trajectory</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Advisory Only
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    This score is for guidance only and does not replace human judgment in HR decisions.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time performance trajectory based on continuous signals
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className={cn("rounded-lg p-4", risk.bgColor)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn("", momentum.color)}>{momentum.icon}</span>
              <span className="text-sm font-medium">{momentum.label}</span>
            </div>
            <Badge className={trend.color}>{trend.label}</Badge>
          </div>
          
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold">{Math.round(trajectoryScore.trajectoryScore)}</div>
            <div className="text-sm text-muted-foreground pb-1">/ 100</div>
          </div>
          
          <Progress 
            value={trajectoryScore.trajectoryScore} 
            className="mt-3 h-2"
          />
        </div>

        {/* Risk Level */}
        {trajectoryScore.riskLevel !== 'low' && (
          <div className={cn("flex items-center gap-2 p-3 rounded-lg", risk.bgColor)}>
            <AlertTriangle className={cn("h-4 w-4", risk.color)} />
            <span className={cn("text-sm font-medium", risk.color)}>{risk.label}</span>
            {trajectoryScore.interventionRecommended && (
              <Badge variant="outline" className="ml-auto text-xs">
                Intervention Recommended
              </Badge>
            )}
          </div>
        )}

        {/* Contributing Factors */}
        {showDetails && trajectoryScore.contributingFactors && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  What's influencing this score?
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              {trajectoryScore.contributingFactors.map((factor, idx) => {
                const config = signalTypeConfig[factor.signalType];
                return (
                  <div key={idx} className="p-3 rounded-lg border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded", config.color, "text-white")}>
                          {config.icon}
                        </div>
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <Badge variant="outline">
                        {factor.contribution > 0 ? '+' : ''}{factor.contribution}%
                      </Badge>
                    </div>
                    {factor.recentEvents && factor.recentEvents.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {factor.recentEvents.slice(0, 2).map((event, eventIdx) => (
                          <div key={eventIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className={event.impact > 0 ? 'text-green-600' : 'text-orange-600'}>
                              {event.impact > 0 ? '↑' : '↓'}
                            </span>
                            <span>{event.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last calculated: {new Date(trajectoryScore.calculatedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
