import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Save,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "completed";
  dueDate: string;
  weight: number;
  lastUpdate?: string;
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
  }[];
}

interface MobileGoalTrackerProps {
  goals?: Goal[];
  onUpdateProgress?: (goalId: string, progress: number, note?: string) => void;
}

// Mock data
const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Complete Q4 Sales Targets",
    description: "Achieve $500K in new revenue from enterprise clients",
    progress: 78,
    status: "on_track",
    dueDate: "2024-12-31",
    weight: 30,
    lastUpdate: "2024-12-08",
    milestones: [
      { id: "m1", title: "Q4 Pipeline Built", completed: true, dueDate: "2024-10-15" },
      { id: "m2", title: "50% Target Achieved", completed: true, dueDate: "2024-11-15" },
      { id: "m3", title: "100% Target Achieved", completed: false, dueDate: "2024-12-31" },
    ],
  },
  {
    id: "2",
    title: "Launch Mobile App v2.0",
    description: "Ship the redesigned mobile application with new features",
    progress: 45,
    status: "at_risk",
    dueDate: "2024-12-20",
    weight: 25,
    lastUpdate: "2024-12-01",
    milestones: [
      { id: "m4", title: "Design Complete", completed: true, dueDate: "2024-10-30" },
      { id: "m5", title: "Development Complete", completed: false, dueDate: "2024-12-10" },
      { id: "m6", title: "QA & Launch", completed: false, dueDate: "2024-12-20" },
    ],
  },
  {
    id: "3",
    title: "Improve Team Engagement Score",
    description: "Increase engagement survey score by 15%",
    progress: 90,
    status: "on_track",
    dueDate: "2024-12-31",
    weight: 20,
    lastUpdate: "2024-12-10",
  },
  {
    id: "4",
    title: "Reduce Customer Churn",
    description: "Decrease monthly churn rate from 3% to 2%",
    progress: 30,
    status: "behind",
    dueDate: "2024-12-31",
    weight: 25,
    lastUpdate: "2024-11-20",
  },
];

export function MobileGoalTracker({ 
  goals = mockGoals, 
  onUpdateProgress 
}: MobileGoalTrackerProps) {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const [progressNote, setProgressNote] = useState("");

  const getStatusConfig = (status: Goal["status"]) => {
    switch (status) {
      case "on_track":
        return { 
          label: "On Track", 
          color: "bg-green-500/10 text-green-600 border-green-200",
          icon: TrendingUp 
        };
      case "at_risk":
        return { 
          label: "At Risk", 
          color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
          icon: AlertTriangle 
        };
      case "behind":
        return { 
          label: "Behind", 
          color: "bg-red-500/10 text-red-600 border-red-200",
          icon: ArrowDown 
        };
      case "completed":
        return { 
          label: "Completed", 
          color: "bg-primary/10 text-primary border-primary/20",
          icon: CheckCircle2 
        };
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, urgent: true };
    if (days === 0) return { text: "Due today", urgent: true };
    if (days === 1) return { text: "Due tomorrow", urgent: true };
    if (days <= 7) return { text: `${days} days left`, urgent: true };
    return { text: `${days} days left`, urgent: false };
  };

  const handleStartEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setTempProgress(goal.progress);
    setProgressNote("");
  };

  const handleSaveProgress = (goalId: string) => {
    onUpdateProgress?.(goalId, tempProgress, progressNote);
    toast.success("Progress updated!", {
      description: `Goal progress updated to ${tempProgress}%`,
    });
    setEditingGoal(null);
    setProgressNote("");
  };

  const handleQuickUpdate = (goalId: string, increment: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newProgress = Math.max(0, Math.min(100, goal.progress + increment));
    onUpdateProgress?.(goalId, newProgress);
    toast.success(`Progress ${increment > 0 ? 'increased' : 'decreased'} to ${newProgress}%`);
  };

  const overallProgress = goals.reduce((sum, g) => sum + (g.progress * g.weight / 100), 0);

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold">Overall Goal Progress</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {overallProgress.toFixed(0)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{goals.length} goals</span>
            <span>{goals.filter(g => g.status === "completed").length} completed</span>
          </div>
        </CardContent>
      </Card>

      {/* Goal List */}
      {goals.map((goal) => {
        const statusConfig = getStatusConfig(goal.status);
        const daysInfo = getDaysRemaining(goal.dueDate);
        const isExpanded = expandedGoal === goal.id;
        const isEditing = editingGoal === goal.id;
        const StatusIcon = statusConfig.icon;

        return (
          <Card key={goal.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Goal Header - Always visible */}
              <div
                className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{goal.title}</h4>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <span className={cn(
                        "text-xs",
                        daysInfo.urgent ? "text-destructive font-medium" : "text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {daysInfo.text}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold">{goal.progress}%</div>
                    <div className="text-xs text-muted-foreground">{goal.weight}% weight</div>
                  </div>
                </div>
                <Progress value={goal.progress} className="h-2 mt-3" />
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-4 border-t">
                  {/* Description */}
                  {goal.description && (
                    <p className="text-sm text-muted-foreground pt-4">{goal.description}</p>
                  )}

                  {/* Quick Update Buttons */}
                  {!isEditing && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickUpdate(goal.id, -5);
                        }}
                        className="flex-1"
                      >
                        <ArrowDown className="h-4 w-4 mr-1" />
                        -5%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(goal);
                        }}
                        className="flex-1"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickUpdate(goal.id, 5);
                        }}
                        className="flex-1"
                      >
                        <ArrowUp className="h-4 w-4 mr-1" />
                        +5%
                      </Button>
                    </div>
                  )}

                  {/* Edit Mode */}
                  {isEditing && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-lg font-bold">{tempProgress}%</span>
                        </div>
                        <Slider
                          value={[tempProgress]}
                          onValueChange={(v) => setTempProgress(v[0])}
                          max={100}
                          step={5}
                          className="touch-manipulation"
                        />
                      </div>
                      <Textarea
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        placeholder="Add a note about this update..."
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGoal(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveProgress(goal.id);
                          }}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && !isEditing && (
                    <div className="space-y-2 pt-2">
                      <h5 className="text-sm font-medium">Milestones</h5>
                      {goal.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-sm",
                            milestone.completed ? "bg-green-500/10" : "bg-muted/50"
                          )}
                        >
                          {milestone.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={cn(
                            "flex-1",
                            milestone.completed && "line-through text-muted-foreground"
                          )}>
                            {milestone.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(milestone.dueDate), "MMM d")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Last Update */}
                  {goal.lastUpdate && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Last updated: {format(new Date(goal.lastUpdate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
