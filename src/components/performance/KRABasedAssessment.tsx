import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Target, ChevronDown, ChevronUp, Star, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { AppraisalKRASnapshot } from '@/types/appraisalKRASnapshot';
import { cn } from '@/lib/utils';

interface KRABasedAssessmentProps {
  responsibilityId: string;
  responsibilityName: string;
  kras: AppraisalKRASnapshot[];
  isManager: boolean;
  onKRARating: (kraId: string, rating: number, comments: string) => void;
  rollupScore?: number | null;
  showJobSpecificTargets?: boolean;
  ratingScale?: { min: number; max: number };
  disabled?: boolean;
}

const RATING_LEVELS = [
  { value: 1, label: 'Unsatisfactory', color: 'bg-red-500', description: 'Performance significantly below expectations' },
  { value: 2, label: 'Needs Improvement', color: 'bg-orange-500', description: 'Performance below expectations in key areas' },
  { value: 3, label: 'Meets Expectations', color: 'bg-yellow-500', description: 'Performance meets job requirements' },
  { value: 4, label: 'Exceeds Expectations', color: 'bg-lime-500', description: 'Performance consistently above expectations' },
  { value: 5, label: 'Outstanding', color: 'bg-green-500', description: 'Exceptional performance, role model' },
];

export function KRABasedAssessment({
  responsibilityId,
  responsibilityName,
  kras,
  isManager,
  onKRARating,
  rollupScore,
  showJobSpecificTargets = true,
  ratingScale = { min: 1, max: 5 },
  disabled = false,
}: KRABasedAssessmentProps) {
  const [expandedKRAs, setExpandedKRAs] = useState<Set<string>>(new Set());
  const [localRatings, setLocalRatings] = useState<Record<string, { rating: number | null; comments: string }>>({});

  // Initialize local ratings from KRAs
  useEffect(() => {
    const initial: Record<string, { rating: number | null; comments: string }> = {};
    for (const kra of kras) {
      const rating = isManager ? kra.manager_rating : kra.self_rating;
      const comments = isManager ? kra.manager_comments : kra.self_comments;
      initial[kra.id] = { rating: rating ?? null, comments: comments || '' };
    }
    setLocalRatings(initial);
  }, [kras, isManager]);

  // Calculate weight totals and progress
  const { totalWeight, weightedProgress, allRated } = useMemo(() => {
    let total = 0;
    let ratedWeight = 0;
    let allHaveRating = true;

    for (const kra of kras) {
      total += kra.weight;
      const rating = isManager ? kra.manager_rating : kra.self_rating;
      const localRating = localRatings[kra.id]?.rating;
      
      if (rating !== null || localRating !== null) {
        ratedWeight += kra.weight;
      } else {
        allHaveRating = false;
      }
    }

    return {
      totalWeight: total,
      weightedProgress: total > 0 ? (ratedWeight / total) * 100 : 0,
      allRated: allHaveRating,
    };
  }, [kras, isManager, localRatings]);

  const toggleKRA = (kraId: string) => {
    setExpandedKRAs(prev => {
      const next = new Set(prev);
      if (next.has(kraId)) {
        next.delete(kraId);
      } else {
        next.add(kraId);
      }
      return next;
    });
  };

  const handleRatingChange = (kraId: string, rating: number) => {
    setLocalRatings(prev => ({
      ...prev,
      [kraId]: { ...prev[kraId], rating },
    }));
    onKRARating(kraId, rating, localRatings[kraId]?.comments || '');
  };

  const handleCommentsChange = (kraId: string, comments: string) => {
    setLocalRatings(prev => ({
      ...prev,
      [kraId]: { ...prev[kraId], comments },
    }));
    const rating = localRatings[kraId]?.rating;
    if (rating !== null) {
      onKRARating(kraId, rating, comments);
    }
  };

  const getRatingLevel = (rating: number | null) => {
    if (rating === null) return null;
    return RATING_LEVELS.find(l => l.value === Math.round(rating));
  };

  return (
    <div className="space-y-4">
      {/* Weight Progress Bar */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <Target className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">KRA Weights</span>
            <span className={cn(
              "font-medium",
              totalWeight === 100 ? "text-green-600" : "text-amber-600"
            )}>
              {totalWeight}%
            </span>
          </div>
          <Progress value={totalWeight} max={100} className="h-2" />
        </div>
        {totalWeight !== 100 && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>

      {/* Rating Progress */}
      <div className="flex items-center justify-between text-sm px-1">
        <span className="text-muted-foreground">
          Rating Progress: {Math.round(weightedProgress)}%
        </span>
        {allRated && (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            All KRAs Rated
          </Badge>
        )}
      </div>

      {/* KRA Cards */}
      <div className="space-y-3">
        {kras.map((kra, index) => {
          const isExpanded = expandedKRAs.has(kra.id);
          const currentRating = localRatings[kra.id]?.rating ?? null;
          const currentComments = localRatings[kra.id]?.comments || '';
          const ratingLevel = getRatingLevel(currentRating);
          const existingRating = isManager ? kra.self_rating : null;

          return (
            <Card key={kra.id} className={cn(
              "transition-all",
              currentRating !== null && "border-primary/30"
            )}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleKRA(kra.id)}>
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-primary">{index + 1}.</span>
                          <span className="font-medium">{kra.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {kra.weight}%
                          </Badge>
                          {kra.measurement_method && (
                            <Badge variant="secondary" className="text-xs">
                              {kra.measurement_method}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Target Display */}
                        {(showJobSpecificTargets && kra.job_specific_target) || kra.target_metric ? (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Target:</span>{' '}
                            {kra.job_specific_target || kra.target_metric}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Rating Display */}
                        {currentRating !== null && ratingLevel && (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                              ratingLevel.color
                            )}>
                              {currentRating}
                            </div>
                          </div>
                        )}
                        
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 space-y-4">
                    {/* Description */}
                    {kra.description && (
                      <p className="text-sm text-muted-foreground">{kra.description}</p>
                    )}

                    {/* Self Rating Display for Manager View */}
                    {isManager && existingRating !== null && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Self-Rating:</span>
                          <Badge variant="outline">
                            {existingRating} - {getRatingLevel(existingRating)?.label}
                          </Badge>
                        </div>
                        {kra.self_comments && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{kra.self_comments}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Rating Buttons */}
                    <div className="space-y-2">
                      <Label className="text-sm">
                        {isManager ? 'Manager Rating' : 'Self-Rating'} *
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {RATING_LEVELS.map((level) => (
                          <Button
                            key={level.value}
                            type="button"
                            variant={currentRating === level.value ? 'default' : 'outline'}
                            size="sm"
                            disabled={disabled}
                            onClick={() => handleRatingChange(kra.id, level.value)}
                            className={cn(
                              "flex-1 min-w-[100px]",
                              currentRating === level.value && level.color.replace('bg-', 'bg-')
                            )}
                          >
                            <Star className={cn(
                              "h-3 w-3 mr-1",
                              currentRating === level.value && "fill-current"
                            )} />
                            {level.value} - {level.label}
                          </Button>
                        ))}
                      </div>
                      {currentRating !== null && ratingLevel && (
                        <p className="text-xs text-muted-foreground">
                          {ratingLevel.description}
                        </p>
                      )}
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        Comments {currentRating && currentRating <= 2 && <span className="text-destructive">*</span>}
                      </Label>
                      <Textarea
                        value={currentComments}
                        onChange={(e) => handleCommentsChange(kra.id, e.target.value)}
                        placeholder="Provide specific examples and observations..."
                        rows={3}
                        disabled={disabled}
                        className="resize-none"
                      />
                      {currentRating && currentRating <= 2 && !currentComments && (
                        <p className="text-xs text-destructive">
                          Comments required for ratings below "Meets Expectations"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Rollup Score Display */}
      {rollupScore !== null && rollupScore !== undefined && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">Calculated Responsibility Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {rollupScore.toFixed(2)}
                </span>
                <span className="text-muted-foreground">/ 5.00</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Weighted average of all KRA ratings based on their configured weights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
