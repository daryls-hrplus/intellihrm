import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log(`Processing goal check-ins for ${today}`);

    // Get all active check-in schedules that are due or overdue
    const { data: dueSchedules, error: schedulesError } = await supabase
      .from("goal_check_in_schedules")
      .select(`
        *,
        goal:goals(id, title, employee_id, status)
      `)
      .eq("is_active", true)
      .lte("next_check_in_date", today);

    if (schedulesError) {
      console.error("Error fetching schedules:", schedulesError);
      throw schedulesError;
    }

    console.log(`Found ${dueSchedules?.length || 0} due check-in schedules`);

    const results = {
      processed: 0,
      remindersCreated: 0,
      overdueMarked: 0,
      errors: [] as string[],
    };

    for (const schedule of dueSchedules || []) {
      try {
        if (!schedule.goal || schedule.goal.status === "completed" || schedule.goal.status === "cancelled") {
          continue;
        }

        const scheduleDate = new Date(schedule.next_check_in_date);
        const isOverdue = scheduleDate < now;
        const daysDifference = Math.floor((now.getTime() - scheduleDate.getTime()) / (1000 * 60 * 60 * 24));

        // Check if a check-in already exists for this period
        const { data: existingCheckIn } = await supabase
          .from("goal_check_ins")
          .select("id")
          .eq("goal_id", schedule.goal_id)
          .gte("check_in_date", schedule.next_check_in_date)
          .maybeSingle();

        if (!existingCheckIn) {
          // Create a pending check-in record
          const { error: insertError } = await supabase.from("goal_check_ins").insert({
            goal_id: schedule.goal_id,
            employee_id: schedule.goal.employee_id,
            check_in_date: schedule.next_check_in_date,
            status: isOverdue ? "overdue" : "pending",
            notes: isOverdue
              ? `Auto-generated overdue check-in (${daysDifference} days overdue)`
              : "Auto-generated check-in reminder",
          });

          if (insertError) {
            console.error(`Error creating check-in for goal ${schedule.goal_id}:`, insertError);
            results.errors.push(`Failed to create check-in for goal ${schedule.goal_id}`);
          } else {
            results.remindersCreated++;
            if (isOverdue) results.overdueMarked++;
          }
        }

        // Calculate next check-in date based on frequency
        let nextDate = new Date(schedule.next_check_in_date);
        switch (schedule.frequency) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "biweekly":
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "quarterly":
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          default:
            nextDate.setDate(nextDate.getDate() + 7);
        }

        // Update the schedule with next check-in date
        const { error: updateError } = await supabase
          .from("goal_check_in_schedules")
          .update({
            next_check_in_date: nextDate.toISOString().split("T")[0],
            last_check_in_date: today,
            updated_at: now.toISOString(),
          })
          .eq("id", schedule.id);

        if (updateError) {
          console.error(`Error updating schedule ${schedule.id}:`, updateError);
          results.errors.push(`Failed to update schedule ${schedule.id}`);
        } else {
          results.processed++;
        }

        // Create coaching nudge for managers if check-in is overdue
        if (isOverdue && daysDifference >= 3) {
          // Get the manager for this employee
          const { data: employee } = await supabase
            .from("profiles")
            .select("manager_id")
            .eq("id", schedule.goal.employee_id)
            .single();

          if (employee?.manager_id) {
            await supabase.from("goal_coaching_nudges").insert({
              company_id: schedule.company_id,
              manager_id: employee.manager_id,
              employee_id: schedule.goal.employee_id,
              goal_id: schedule.goal_id,
              nudge_type: "stale_goal",
              nudge_title: "Check-in Overdue",
              nudge_message: `Goal "${schedule.goal.title}" hasn't been updated in ${daysDifference} days.`,
              priority: daysDifference >= 7 ? "high" : "medium",
              suggested_action: "Schedule a 1:1 to discuss progress and remove blockers",
            });
          }
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        results.errors.push(`Exception processing schedule ${schedule.id}`);
      }
    }

    // Calculate check-in health scores for goals
    const { data: goalsWithCheckIns } = await supabase
      .from("goals")
      .select(`
        id,
        goal_check_ins(status, check_in_date)
      `)
      .eq("status", "active");

    for (const goal of goalsWithCheckIns || []) {
      const checkIns = goal.goal_check_ins || [];
      const totalCheckIns = checkIns.length;
      const completedCheckIns = checkIns.filter((c: any) => c.status === "completed").length;
      const overdueCheckIns = checkIns.filter((c: any) => c.status === "overdue").length;

      let healthScore = 100;
      if (totalCheckIns > 0) {
        healthScore = Math.round((completedCheckIns / totalCheckIns) * 100);
        healthScore -= overdueCheckIns * 10;
        healthScore = Math.max(0, Math.min(100, healthScore));
      }

      // Store health score in goal_ai_analyses
      await supabase.from("goal_ai_analyses").upsert(
        {
          goal_id: goal.id,
          analysis_type: "check_in_health",
          risk_level: healthScore < 50 ? "high" : healthScore < 75 ? "medium" : "low",
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "goal_id,analysis_type" }
      );
    }

    console.log("Processing complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} schedules`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in process-goal-checkins:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
