import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, Target, Building2, Users, User, Link2, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type GoalType = 'okr_objective' | 'okr_key_result' | 'smart_goal';
type GoalLevel = 'company' | 'department' | 'team' | 'individual';

interface Alignment {
  id: string;
  child_goal_id: string;
  parent_goal_id: string;
  contribution_weight: number | null;
  alignment_type: string | null;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  goal_level: GoalLevel;
  status: GoalStatus;
  progress_percentage: number;
  parent_goal_id: string | null;
  children?: Goal[];
  alignedTo?: { goalId: string; goalTitle: string; weight: number }[];
  alignedFrom?: { goalId: string; goalTitle: string; weight: number }[];
}

interface GoalHierarchyViewProps {
  companyId: string | undefined;
  showAlignments?: boolean;
}

const levelIcons: Record<GoalLevel, typeof Building2> = {
  company: Building2,
  department: Building2,
  team: Users,
  individual: User,
};

const levelColors: Record<GoalLevel, string> = {
  company: "bg-primary/10 text-primary border-primary/20",
  department: "bg-info/10 text-info border-info/20",
  team: "bg-warning/10 text-warning border-warning/20",
  individual: "bg-success/10 text-success border-success/20",
};

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", className: "bg-info/10 text-info" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  overdue: { label: "Overdue", className: "bg-warning/10 text-warning" },
};

function GoalNode({ goal, level = 0, showAlignments = true }: { goal: Goal; level?: number; showAlignments?: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = goal.children && goal.children.length > 0;
  const hasAlignments = (goal.alignedTo && goal.alignedTo.length > 0) || (goal.alignedFrom && goal.alignedFrom.length > 0);
  const Icon = levelIcons[goal.goal_level];
  const colorClass = levelColors[goal.goal_level];
  const statusStyle = statusConfig[goal.status];

  return (
    <div className="space-y-2">
      <div
        className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass} transition-colors`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-current opacity-50" />
          </div>
        )}

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background shrink-0">
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-foreground truncate">{goal.title}</h4>
            <Badge variant="outline" className="text-xs capitalize">
              {goal.goal_level}
            </Badge>
            <Badge className={`text-xs ${statusStyle.className}`}>
              {statusStyle.label}
            </Badge>
            {/* Alignment indicators */}
            {showAlignments && hasAlignments && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Link2 className="h-3 w-3" />
                      {(goal.alignedTo?.length || 0) + (goal.alignedFrom?.length || 0)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2 text-xs">
                      {goal.alignedTo && goal.alignedTo.length > 0 && (
                        <div>
                          <p className="font-medium">Contributes to:</p>
                          <ul className="list-disc list-inside">
                            {goal.alignedTo.map(a => (
                              <li key={a.goalId} className="truncate">
                                {a.goalTitle} ({a.weight}%)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {goal.alignedFrom && goal.alignedFrom.length > 0 && (
                        <div>
                          <p className="font-medium">Receives from:</p>
                          <ul className="list-disc list-inside">
                            {goal.alignedFrom.map(a => (
                              <li key={a.goalId} className="truncate">
                                {a.goalTitle} ({a.weight}%)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {goal.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Progress value={goal.progress_percentage} className="h-1.5 flex-1 max-w-[200px]" />
            <span className="text-xs text-muted-foreground">{goal.progress_percentage}%</span>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-2">
          {goal.children!.map((child) => (
            <GoalNode key={child.id} goal={child} level={level + 1} showAlignments={showAlignments} />
          ))}
        </div>
      )}
    </div>
  );
}

export function GoalHierarchyView({ companyId, showAlignments = true }: GoalHierarchyViewProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchGoals();
    }
  }, [companyId]);

  const fetchGoals = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("performance_goals")
        .select("id, title, description, goal_type, goal_level, status, progress_percentage, parent_goal_id")
        .eq("company_id", companyId)
        .order("goal_level");

      if (goalsError) throw goalsError;

      // Fetch alignments
      const { data: alignmentsData, error: alignmentsError } = await supabase
        .from("goal_alignments")
        .select("id, child_goal_id, parent_goal_id, contribution_weight, alignment_type")
        .eq("is_active", true);

      if (alignmentsError) throw alignmentsError;

      // Build goals map with alignment info
      const goalsMap = new Map<string, Goal>();
      const rootGoals: Goal[] = [];

      // First pass: create all goal objects
      (goalsData as Goal[]).forEach((goal) => {
        goalsMap.set(goal.id, { ...goal, children: [], alignedTo: [], alignedFrom: [] });
      });

      // Add alignment information
      (alignmentsData || []).forEach((alignment: Alignment) => {
        const childGoal = goalsMap.get(alignment.child_goal_id);
        const parentGoal = goalsMap.get(alignment.parent_goal_id);

        if (childGoal && parentGoal) {
          childGoal.alignedTo = childGoal.alignedTo || [];
          childGoal.alignedTo.push({
            goalId: parentGoal.id,
            goalTitle: parentGoal.title,
            weight: alignment.contribution_weight || 10,
          });

          parentGoal.alignedFrom = parentGoal.alignedFrom || [];
          parentGoal.alignedFrom.push({
            goalId: childGoal.id,
            goalTitle: childGoal.title,
            weight: alignment.contribution_weight || 10,
          });
        }
      });

      // Second pass: build parent-child relationships (hierarchy)
      goalsMap.forEach((goal) => {
        if (goal.parent_goal_id && goalsMap.has(goal.parent_goal_id)) {
          const parent = goalsMap.get(goal.parent_goal_id)!;
          parent.children = parent.children || [];
          parent.children.push(goal);
        } else {
          rootGoals.push(goal);
        }
      });

      // Sort by level priority
      const levelOrder: Record<GoalLevel, number> = {
        company: 0,
        department: 1,
        team: 2,
        individual: 3,
      };

      rootGoals.sort((a, b) => levelOrder[a.goal_level] - levelOrder[b.goal_level]);

      setGoals(rootGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load goal hierarchy");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading goal hierarchy...
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No goals found. Create goals at different levels to see the hierarchy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Hierarchy
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View how goals align from company level down to individual objectives
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalNode key={goal.id} goal={goal} showAlignments={showAlignments} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Legend</p>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Goal Levels</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(levelColors) as GoalLevel[]).map((level) => {
                  const LevelIcon = levelIcons[level];
                  return (
                    <div
                      key={level}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${levelColors[level]}`}
                    >
                      <LevelIcon className="h-3 w-3" />
                      <span className="capitalize">{level}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Relationships</p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-muted">
                  <GitBranch className="h-3 w-3" />
                  <span>Hierarchy (Parent-Child)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-muted">
                  <Link2 className="h-3 w-3" />
                  <span>Alignment (Contributes To)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
