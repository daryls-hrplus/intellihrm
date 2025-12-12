import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Target,
  TrendingUp,
  Calendar,
  Search,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { GoalProgressDialog } from "@/components/performance/GoalProgressDialog";
import { GoalCommentsDialog } from "@/components/performance/GoalCommentsDialog";
import { ContactManagerDialog } from "@/components/performance/ContactManagerDialog";

type GoalStatus = "draft" | "active" | "in_progress" | "completed" | "cancelled";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  progress_percentage: number;
  due_date: string | null;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
  weighting: number | null;
  goal_type: string;
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-blue-500/10 text-blue-600" },
  in_progress: { label: "In Progress", className: "bg-amber-500/10 text-amber-600" },
  completed: { label: "Completed", className: "bg-green-500/10 text-green-600" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

export default function MyGoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [contactManagerOpen, setContactManagerOpen] = useState(false);

  const fetchGoals = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("performance_goals")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals((data as Goal[]) || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  const filteredGoals = goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGoals = filteredGoals.filter(
    (g) => g.status === "active" || g.status === "in_progress"
  );
  const completedGoals = filteredGoals.filter((g) => g.status === "completed");
  const averageProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, g) => sum + g.progress_percentage, 0) /
            activeGoals.length
        )
      : 0;

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressDialogOpen(true);
  };

  const handleViewComments = (goal: Goal) => {
    setSelectedGoal(goal);
    setCommentsDialogOpen(true);
  };

  const handleContactManager = (goal: Goal) => {
    setSelectedGoal(goal);
    setContactManagerOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Employee Self Service", href: "/ess" },
            { label: "My Goals" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
          <p className="text-muted-foreground">
            Track and update your performance goals
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading goals...
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No goals found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "You don't have any goals assigned yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal) => {
              const status = statusConfig[goal.status] || statusConfig.active;
              const isEditable =
                goal.status === "active" || goal.status === "in_progress";

              return (
                <Card key={goal.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <Badge className={status.className}>{status.label}</Badge>
                          {goal.weighting && (
                            <Badge variant="outline">Weight: {goal.weighting}%</Badge>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {goal.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Due: {format(new Date(goal.due_date), "MMM d, yyyy")}
                            </span>
                          )}
                          {goal.target_value && (
                            <span>
                              {goal.current_value || 0} / {goal.target_value}{" "}
                              {goal.unit_of_measure}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewComments(goal)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comments
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContactManager(goal)}
                        >
                          <UserCircle className="h-4 w-4 mr-1" />
                          Contact Manager
                        </Button>
                        {isEditable && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateProgress(goal)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Update Progress
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{goal.progress_percentage}%</span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
        {selectedGoal && (
          <>
            <GoalProgressDialog
              open={progressDialogOpen}
              onOpenChange={setProgressDialogOpen}
              goal={selectedGoal}
              onSuccess={fetchGoals}
            />
            <GoalCommentsDialog
              open={commentsDialogOpen}
              onOpenChange={setCommentsDialogOpen}
              goalId={selectedGoal.id}
              goalTitle={selectedGoal.title}
            />
            <ContactManagerDialog
              open={contactManagerOpen}
              onOpenChange={setContactManagerOpen}
              goal={selectedGoal}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
