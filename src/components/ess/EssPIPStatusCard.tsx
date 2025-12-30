import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Calendar, User, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PIPData {
  id: string;
  employee_id: string;
  reason: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  manager_name: string | null;
  milestones_count: number;
  completed_milestones: number;
}

export function EssPIPStatusCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: pipData, isLoading } = useQuery({
    queryKey: ["my-pip-status", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get active PIPs for the current user
      const { data: pips, error } = await supabase
        .from("performance_improvement_plans")
        .select(`
          id,
          employee_id,
          reason,
          start_date,
          end_date,
          status,
          created_at,
          manager_id
        `)
        .eq("employee_id", user.id)
        .in("status", ["active", "in_progress", "pending"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!pips) return null;

      // Get manager name
      let managerName: string | null = null;
      if (pips.manager_id) {
        const { data: manager } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", pips.manager_id)
          .single();
        managerName = manager?.full_name || null;
      }

      // Get milestones count
      const { data: milestones } = await supabase
        .from("pip_milestones")
        .select("id, status")
        .eq("pip_id", pips.id);

      const milestonesCount = milestones?.length || 0;
      const completedMilestones = milestones?.filter(m => m.status === "completed").length || 0;

      return {
        id: pips.id,
        employee_id: pips.employee_id,
        reason: pips.reason,
        start_date: pips.start_date,
        end_date: pips.end_date,
        status: pips.status,
        created_at: pips.created_at,
        manager_name: managerName,
        milestones_count: milestonesCount,
        completed_milestones: completedMilestones,
      } as PIPData;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!pipData) {
    return null; // No active PIP
  }

  const progress = pipData.milestones_count > 0 
    ? (pipData.completed_milestones / pipData.milestones_count) * 100 
    : 0;

  const daysRemaining = Math.ceil(
    (new Date(pipData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          Active Performance Improvement Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            {pipData.reason && (
              <p className="text-sm font-medium">{pipData.reason}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(pipData.start_date), "MMM d")} - {format(new Date(pipData.end_date), "MMM d, yyyy")}
              </span>
              {pipData.manager_name && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Manager: {pipData.manager_name}
                </span>
              )}
              <Badge variant={daysRemaining <= 7 ? "destructive" : "secondary"}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Overdue"}
              </Badge>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/ess/development")}
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Milestones Progress */}
        {pipData.milestones_count > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Milestones Progress
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {pipData.completed_milestones} / {pipData.milestones_count}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
