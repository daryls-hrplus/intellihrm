import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoalCheckInResult {
  milestoneReminders: number;
  overdueGoals: number;
  stalledGoals: number;
  managerNotifications: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const result: GoalCheckInResult = {
      milestoneReminders: 0,
      overdueGoals: 0,
      stalledGoals: 0,
      managerNotifications: 0,
      errors: [],
    };

    // 1. Send reminders for goals with milestones due in next 7 days
    const { data: upcomingMilestones, error: milestonesError } = await supabase
      .from("goal_milestones")
      .select(`
        id,
        title,
        target_date,
        status,
        goals!inner(
          id,
          title,
          employee_id,
          status,
          company_id
        )
      `)
      .in("status", ["pending", "in_progress"])
      .gte("target_date", today)
      .lte("target_date", in7Days);

    if (milestonesError) {
      result.errors.push(`Failed to query upcoming milestones: ${milestonesError.message}`);
    } else if (upcomingMilestones && upcomingMilestones.length > 0) {
      for (const milestone of upcomingMilestones) {
        const goal = milestone.goals as any;
        
        // Skip if goal is not active
        if (goal.status !== "in_progress" && goal.status !== "active") {
          continue;
        }

        const daysUntilDue = Math.ceil(
          (new Date(milestone.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase.from("notifications").insert({
          user_id: goal.employee_id,
          title: "Goal Milestone Due Soon",
          message: `Your milestone "${milestone.title}" for goal "${goal.title}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}.`,
          type: "reminder",
          category: "performance",
          company_id: goal.company_id,
          action_url: `/performance/goals`,
        });

        result.milestoneReminders++;
      }
    }

    // 2. Flag goals with overdue target dates
    const { data: overdueGoals, error: overdueError } = await supabase
      .from("goals")
      .select("id, title, employee_id, target_date, company_id, manager_id")
      .in("status", ["in_progress", "active", "pending"])
      .lt("target_date", today);

    if (overdueError) {
      result.errors.push(`Failed to query overdue goals: ${overdueError.message}`);
    } else if (overdueGoals && overdueGoals.length > 0) {
      for (const goal of overdueGoals) {
        // Update goal status to overdue (if such status exists) or add flag
        const { error: updateError } = await supabase
          .from("goals")
          .update({ 
            status: "overdue",
            updated_at: now.toISOString() 
          })
          .eq("id", goal.id);

        if (updateError) {
          result.errors.push(`Failed to update overdue goal ${goal.id}: ${updateError.message}`);
        } else {
          result.overdueGoals++;

          // Notify employee
          await supabase.from("notifications").insert({
            user_id: goal.employee_id,
            title: "Goal Overdue",
            message: `Your goal "${goal.title}" is past its target date (${goal.target_date}). Please update the status or extend the deadline.`,
            type: "warning",
            category: "performance",
            company_id: goal.company_id,
            action_url: `/performance/goals`,
          });

          // Notify manager if exists
          if (goal.manager_id) {
            await supabase.from("notifications").insert({
              user_id: goal.manager_id,
              title: "Team Member Goal Overdue",
              message: `A team member's goal "${goal.title}" is past its target date. Please review and take action.`,
              type: "warning",
              category: "performance",
              company_id: goal.company_id,
              action_url: `/performance/goals`,
            });
            result.managerNotifications++;
          }
        }
      }
    }

    // 3. Identify stalled goals (no check-ins/updates in 30 days)
    const { data: activeGoals, error: activeGoalsError } = await supabase
      .from("goals")
      .select(`
        id, 
        title, 
        employee_id, 
        company_id,
        manager_id,
        updated_at,
        goal_check_ins(
          id,
          check_in_date
        )
      `)
      .in("status", ["in_progress", "active"]);

    if (activeGoalsError) {
      result.errors.push(`Failed to query active goals: ${activeGoalsError.message}`);
    } else if (activeGoals && activeGoals.length > 0) {
      for (const goal of activeGoals) {
        const checkIns = goal.goal_check_ins as any[] || [];
        const latestCheckIn = checkIns.length > 0 
          ? new Date(Math.max(...checkIns.map(c => new Date(c.check_in_date).getTime())))
          : null;
        
        const lastActivity = latestCheckIn || new Date(goal.updated_at);
        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity >= 30) {
          result.stalledGoals++;

          // Notify employee about stalled goal
          await supabase.from("notifications").insert({
            user_id: goal.employee_id,
            title: "Goal Needs Attention",
            message: `Your goal "${goal.title}" hasn't been updated in ${daysSinceActivity} days. Please add a check-in or update the progress.`,
            type: "info",
            category: "performance",
            company_id: goal.company_id,
            action_url: `/performance/goals`,
          });

          // Notify manager about stalled goal
          if (goal.manager_id) {
            await supabase.from("notifications").insert({
              user_id: goal.manager_id,
              title: "Team Goal Stalled",
              message: `A team member's goal "${goal.title}" has had no activity for ${daysSinceActivity} days. Consider scheduling a check-in.`,
              type: "info",
              category: "performance",
              company_id: goal.company_id,
              action_url: `/performance/goals`,
            });
            result.managerNotifications++;
          }
        }
      }
    }

    // 4. Send weekly goal progress summary to managers
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 1) { // Monday
      const { data: managers, error: managersError } = await supabase
        .from("profiles")
        .select("id, full_name, company_id")
        .eq("role", "manager");

      if (!managersError && managers && managers.length > 0) {
        for (const manager of managers) {
          // Get team goals summary
          const { data: teamGoals, error: teamGoalsError } = await supabase
            .from("goals")
            .select("id, status")
            .eq("manager_id", manager.id)
            .in("status", ["in_progress", "active", "completed", "overdue"]);

          if (!teamGoalsError && teamGoals && teamGoals.length > 0) {
            const completed = teamGoals.filter(g => g.status === "completed").length;
            const inProgress = teamGoals.filter(g => g.status === "in_progress" || g.status === "active").length;
            const overdue = teamGoals.filter(g => g.status === "overdue").length;

            await supabase.from("notifications").insert({
              user_id: manager.id,
              title: "Weekly Team Goals Summary",
              message: `Your team's goal status: ${completed} completed, ${inProgress} in progress, ${overdue} overdue.`,
              type: "info",
              category: "performance",
              company_id: manager.company_id,
              action_url: `/performance/goals`,
            });
          }
        }
      }
    }

    // Log the job run
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "goal-check-in-reminders",
      job_type: "goal_automation",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: now.toISOString(),
      completed_at: new Date().toISOString(),
      metrics_generated: result,
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        results: result,
        message: `Processed: ${result.milestoneReminders} milestone reminders, ${result.overdueGoals} overdue goals, ${result.stalledGoals} stalled goals, ${result.managerNotifications} manager notifications`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-goal-check-ins:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
