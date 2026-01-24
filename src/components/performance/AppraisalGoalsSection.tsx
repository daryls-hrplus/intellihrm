import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Target, ChevronDown, ChevronUp, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmployeeGoal {
  id: string;
  title: string;
  description?: string;
  weighting: number;
  progress_percentage: number;
  self_rating: number | null;
  manager_rating: number | null;
  final_score: number | null;
  status: string;
  due_date?: string;
  goal_type?: string;
}

interface GoalRating {
  goal_id: string;
  rating: number | null;
  comments: string;
}

interface AppraisalGoalsSectionProps {
  employeeId: string;
  linkedGoalCycleId: string | null;
  participantId: string;
  isEmployee: boolean;
  minRating: number;
  maxRating: number;
  onGoalScoresChange?: (goals: GoalRating[]) => void;
  readOnly?: boolean;
}

export function AppraisalGoalsSection({
  employeeId,
  linkedGoalCycleId,
  participantId,
  isEmployee,
  minRating,
  maxRating,
  onGoalScoresChange,
  readOnly = false,
}: AppraisalGoalsSectionProps) {
  const [goals, setGoals] = useState<EmployeeGoal[]>([]);
  const [goalRatings, setGoalRatings] = useState<GoalRating[]>([]);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId && linkedGoalCycleId) {
      fetchEmployeeGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [employeeId, linkedGoalCycleId]);

  const fetchEmployeeGoals = async () => {
    setLoading(true);
    try {
      // Fetch employee's actual performance goals from performance_goals table
      const { data: performanceGoals, error } = await supabase
        .from("performance_goals")
        .select(`
          id,
          title,
          description,
          weighting,
          progress_percentage,
          self_rating,
          manager_rating,
          final_score,
          status,
          due_date,
          goal_type
        `)
        .eq("employee_id", employeeId)
        .eq("goal_cycle_id", linkedGoalCycleId)
        .in("status", ["active", "completed", "in_progress", "approved"]);

      if (error) throw error;

      const formattedGoals: EmployeeGoal[] = (performanceGoals || []).map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        weighting: g.weighting || 0,
        progress_percentage: g.progress_percentage || 0,
        self_rating: g.self_rating,
        manager_rating: g.manager_rating,
        final_score: g.final_score,
        status: g.status,
        due_date: g.due_date,
        goal_type: g.goal_type,
      }));

      setGoals(formattedGoals);
      
      // Initialize goal ratings from existing data
      setGoalRatings(
        formattedGoals.map((g) => ({
          goal_id: g.id,
          rating: isEmployee ? g.self_rating : g.manager_rating,
          comments: "",
        }))
      );

      // Expand all goals by default
      setExpandedGoals(new Set(formattedGoals.map((g) => g.id)));
    } catch (error) {
      console.error("Error fetching employee goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (goalId: string, rating: number) => {
    if (readOnly) return;
    
    const newRatings = goalRatings.map((r) =>
      r.goal_id === goalId ? { ...r, rating } : r
    );
    setGoalRatings(newRatings);
    onGoalScoresChange?.(newRatings);
  };

  const handleCommentsChange = (goalId: string, comments: string) => {
    if (readOnly) return;
    
    const newRatings = goalRatings.map((r) =>
      r.goal_id === goalId ? { ...r, comments } : r
    );
    setGoalRatings(newRatings);
    onGoalScoresChange?.(newRatings);
  };

  const toggleGoalExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><TrendingUp className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "at_risk":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><AlertCircle className="h-3 w-3 mr-1" />At Risk</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingForGoal = (goalId: string) => {
    return goalRatings.find((r) => r.goal_id === goalId)?.rating ?? null;
  };

  const getCommentsForGoal = (goalId: string) => {
    return goalRatings.find((r) => r.goal_id === goalId)?.comments ?? "";
  };

  // Calculate weighted average score
  const calculateWeightedScore = () => {
    const totalWeight = goals.reduce((sum, g) => sum + g.weighting, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = goals.reduce((sum, g) => {
      const rating = getRatingForGoal(g.id);
      if (rating === null) return sum;
      return sum + rating * (g.weighting / totalWeight);
    }, 0);

    return Math.round(weightedSum * 100) / 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading goals...
        </CardContent>
      </Card>
    );
  }

  if (!linkedGoalCycleId) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No goal cycle linked to this appraisal.</p>
          <p className="text-xs mt-1">Link a goal cycle in the cycle settings to include goals in the evaluation.</p>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No goals found for this employee in the linked goal cycle.</p>
        </CardContent>
      </Card>
    );
  }

  const weightedScore = calculateWeightedScore();
  const ratedCount = goalRatings.filter((r) => r.rating !== null).length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Goals Summary</p>
                <p className="text-xs text-muted-foreground">
                  {ratedCount} of {goals.length} goals rated
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{weightedScore.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Weighted Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Goals */}
      {goals.map((goal) => {
        const isExpanded = expandedGoals.has(goal.id);
        const currentRating = getRatingForGoal(goal.id);
        const currentComments = getCommentsForGoal(goal.id);

        return (
          <Card key={goal.id} className={cn("transition-all", isExpanded && "ring-1 ring-primary/20")}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleGoalExpanded(goal.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-sm font-medium truncate">{goal.title}</CardTitle>
                        {getStatusBadge(goal.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Weight: {goal.weighting}%</span>
                        <span>Progress: {goal.progress_percentage}%</span>
                        {goal.self_rating !== null && (
                          <span>Self: {goal.self_rating}</span>
                        )}
                        {!isEmployee && goal.manager_rating !== null && (
                          <span>Manager: {goal.manager_rating}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentRating !== null && (
                        <Badge variant="secondary" className="font-mono">
                          {currentRating.toFixed(1)}
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <Progress value={goal.progress_percentage} className="h-1.5 mt-2" />
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}

                  {/* Show self-rating for manager view */}
                  {!isEmployee && goal.self_rating !== null && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Label className="text-xs text-blue-700 dark:text-blue-300">Employee Self-Rating</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono">{goal.self_rating}</Badge>
                      </div>
                    </div>
                  )}

                  {/* Rating Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {isEmployee ? "Your Rating" : "Manager Rating"}
                      </Label>
                      <span className="text-sm font-mono font-medium">
                        {currentRating !== null ? currentRating.toFixed(1) : "Not rated"}
                      </span>
                    </div>
                    <Slider
                      value={currentRating !== null ? [currentRating] : [minRating]}
                      min={minRating}
                      max={maxRating}
                      step={0.5}
                      disabled={readOnly}
                      onValueChange={(value) => handleRatingChange(goal.id, value[0])}
                      className={cn(readOnly && "opacity-50")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{minRating}</span>
                      <span>{maxRating}</span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-2">
                    <Label className="text-sm">
                      {isEmployee ? "Your Comments" : "Manager Comments"}
                    </Label>
                    <Textarea
                      value={currentComments}
                      onChange={(e) => handleCommentsChange(goal.id, e.target.value)}
                      placeholder={`Add ${isEmployee ? "your" : "manager"} comments...`}
                      rows={2}
                      disabled={readOnly}
                      className={cn(readOnly && "opacity-50")}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
