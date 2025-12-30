import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Trophy, Star, Calendar, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface CompletedGoal {
  id: string;
  title: string;
  description: string | null;
  progress_percentage: number;
  due_date: string | null;
  completed_date: string | null;
  weighting: number | null;
  goal_type: string;
  rating_submission?: {
    final_score: number | null;
    status: string;
    acknowledged_at: string | null;
  } | null;
}

interface ESSGoalsCompletedTabProps {
  userId: string;
  onViewGoal?: (goalId: string) => void;
}

export function ESSGoalsCompletedTab({ userId, onViewGoal }: ESSGoalsCompletedTabProps) {
  const [goals, setGoals] = useState<CompletedGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedGoals();
  }, [userId]);

  const fetchCompletedGoals = async () => {
    setLoading(true);
    try {
      // Fetch completed goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("performance_goals")
        .select("*")
        .eq("employee_id", userId)
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch rating submissions for these goals
      const goalIds = (goalsData || []).map(g => g.id);
      let ratingsMap: Record<string, any> = {};
      
      if (goalIds.length > 0) {
        const { data: ratingsData } = await supabase
          .from("goal_rating_submissions")
          .select("*")
          .in("goal_id", goalIds);

        ratingsMap = (ratingsData || []).reduce((acc, r) => {
          acc[r.goal_id] = r;
          return acc;
        }, {} as Record<string, any>);
      }

      const goalsWithRatings = (goalsData || []).map(goal => ({
        ...goal,
        rating_submission: ratingsMap[goal.id] || null,
      }));

      setGoals(goalsWithRatings);
    } catch (error) {
      console.error("Error fetching completed goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const goalsWithRatings = goals.filter(g => g.rating_submission?.final_score !== null);
  const averageRating = goalsWithRatings.length > 0
    ? goalsWithRatings.reduce((sum, g) => sum + (g.rating_submission?.final_score || 0), 0) / goalsWithRatings.length
    : 0;
  const totalWeight = goals.reduce((sum, g) => sum + (g.weighting || 0), 0);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading completed goals...</div>;
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No completed goals yet</h3>
          <p className="text-muted-foreground">
            Goals you complete will appear here with their final ratings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-success" />
              Goals Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Weight Achieved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Goals List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Completed Goals
        </h3>
        
        {goals.map(goal => (
          <Card key={goal.id}>
            <CardContent className="py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{goal.title}</h4>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                    {goal.weighting && (
                      <Badge variant="outline">Weight: {goal.weighting}%</Badge>
                    )}
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {goal.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Due: {formatDateForDisplay(goal.due_date, "MMM d, yyyy")}
                      </span>
                    )}
                    {goal.rating_submission?.final_score !== null && (
                      <span className="flex items-center gap-1 text-warning">
                        <Star className="h-3.5 w-3.5" />
                        Final Rating: <strong>{goal.rating_submission.final_score.toFixed(1)}</strong>
                      </span>
                    )}
                    {goal.rating_submission?.acknowledged_at && (
                      <Badge variant="secondary" className="text-xs">
                        Acknowledged
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Final Progress</span>
                      <span className="font-medium text-success">{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2 [&>div]:bg-success" />
                  </div>
                </div>

                {onViewGoal && (
                  <Button variant="outline" size="sm" onClick={() => onViewGoal(goal.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
