import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PendingTask {
  type: string;
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  dueDate?: string;
  daysOverdue?: number;
  href: string;
  actionLabel: string;
  count?: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  priority: number;
  category: string;
  reasoning?: string;
}

interface DashboardData {
  pendingTasks: PendingTask[];
  quickActions: QuickAction[];
  aiInsight: string;
  greeting: string;
  focusArea: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, companyId } = await req.json();
    console.log(`Generating ESS dashboard for user: ${userId}`);

    if (!userId || !companyId) {
      throw new Error("userId and companyId are required");
    }

    // Fetch employee profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, first_name, email, job_title")
      .eq("id", userId)
      .single();

    console.log(`Profile fetch result:`, { profile, profileError });
    
    // Use first_name if available, otherwise extract from full_name
    const firstName = profile?.first_name || profile?.full_name?.split(" ")[0] || "there";
    const today = new Date();
    const hour = today.getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    // Collect pending tasks in parallel
    const [
      pendingCheckIns,
      pendingAcknowledgments,
      overdueGoals,
      pendingApprovals,
      pendingLeaveRequests,
      upcomingTraining,
      pendingExpenses,
      pendingAdjustments,
    ] = await Promise.all([
      // Pending goal check-ins
      supabase
        .from("goal_check_ins")
        .select("id, goal_id, check_in_date, status, goal:performance_goals!goal_id(title)")
        .eq("employee_id", userId)
        .eq("status", "pending")
        .order("check_in_date", { ascending: true })
        .limit(5),
      
      // Pending rating acknowledgments
      supabase
        .from("goal_rating_submissions")
        .select("id, goal_id, final_score, released_at")
        .eq("employee_id", userId)
        .eq("company_id", companyId)
        .eq("status", "released")
        .limit(5),
      
      // Overdue goals
      supabase
        .from("performance_goals")
        .select("id, title, due_date, progress_percentage")
        .eq("employee_id", userId)
        .in("status", ["active", "in_progress"])
        .lt("due_date", today.toISOString().split("T")[0])
        .limit(5),
      
      // Pending approvals (if user is also a manager)
      supabase
        .from("workflow_approvals")
        .select("id, request_type, created_at")
        .eq("approver_id", userId)
        .eq("status", "pending")
        .limit(5),
      
      // Pending leave requests to approve
      supabase
        .from("leave_requests")
        .select("id, start_date, end_date")
        .eq("employee_id", userId)
        .eq("status", "pending")
        .limit(3),
      
      // Upcoming training
      supabase
        .from("training_enrollments")
        .select("id, training:trainings!training_id(title, start_date)")
        .eq("employee_id", userId)
        .eq("status", "enrolled")
        .limit(3),
      
      // Pending expense claims
      supabase
        .from("expense_claims")
        .select("id, title, status, submitted_at")
        .eq("employee_id", userId)
        .eq("status", "draft")
        .limit(3),
      
      // Pending goal adjustments
      supabase
        .from("goal_adjustments")
        .select("id, goal_id, approval_status")
        .eq("requested_by", userId)
        .eq("approval_status", "pending")
        .limit(3),
    ]);

    // Build pending tasks list
    const pendingTasks: PendingTask[] = [];

    // Add pending check-ins
    if (pendingCheckIns.data && pendingCheckIns.data.length > 0) {
      const urgentCheckIns = pendingCheckIns.data.filter((c: any) => {
        if (!c.check_in_date) return false;
        const dueDate = new Date(c.check_in_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3;
      });

      if (urgentCheckIns.length > 0) {
        pendingTasks.push({
          type: "check_in",
          title: "Goal Check-ins Due",
          description: `${urgentCheckIns.length} check-in${urgentCheckIns.length > 1 ? "s" : ""} due soon`,
          urgency: urgentCheckIns.some((c: any) => new Date(c.check_in_date) <= today) ? "high" : "medium",
          href: "/ess/goals?tab=check-ins",
          actionLabel: "Submit Check-ins",
          count: urgentCheckIns.length,
        });
      }
    }

    // Add pending acknowledgments
    if (pendingAcknowledgments.data && pendingAcknowledgments.data.length > 0) {
      pendingTasks.push({
        type: "acknowledgment",
        title: "Ratings to Acknowledge",
        description: `${pendingAcknowledgments.data.length} rating${pendingAcknowledgments.data.length > 1 ? "s" : ""} awaiting acknowledgment`,
        urgency: "high",
        href: "/ess/goals",
        actionLabel: "Acknowledge Ratings",
        count: pendingAcknowledgments.data.length,
      });
    }

    // Add overdue goals
    if (overdueGoals.data && overdueGoals.data.length > 0) {
      pendingTasks.push({
        type: "overdue_goal",
        title: "Overdue Goals",
        description: `${overdueGoals.data.length} goal${overdueGoals.data.length > 1 ? "s" : ""} past due date`,
        urgency: "high",
        href: "/ess/goals?status=overdue",
        actionLabel: "Review Goals",
        count: overdueGoals.data.length,
      });
    }

    // Add pending approvals
    if (pendingApprovals.data && pendingApprovals.data.length > 0) {
      pendingTasks.push({
        type: "approval",
        title: "Pending Approvals",
        description: `${pendingApprovals.data.length} item${pendingApprovals.data.length > 1 ? "s" : ""} awaiting your approval`,
        urgency: "medium",
        href: "/workflow/approvals",
        actionLabel: "Review Approvals",
        count: pendingApprovals.data.length,
      });
    }

    // Add draft expenses
    if (pendingExpenses.data && pendingExpenses.data.length > 0) {
      pendingTasks.push({
        type: "expense",
        title: "Draft Expenses",
        description: `${pendingExpenses.data.length} expense claim${pendingExpenses.data.length > 1 ? "s" : ""} not yet submitted`,
        urgency: "low",
        href: "/ess/expenses",
        actionLabel: "Submit Expenses",
        count: pendingExpenses.data.length,
      });
    }

    // Add pending adjustments
    if (pendingAdjustments.data && pendingAdjustments.data.length > 0) {
      pendingTasks.push({
        type: "adjustment",
        title: "Pending Adjustments",
        description: `${pendingAdjustments.data.length} goal adjustment${pendingAdjustments.data.length > 1 ? "s" : ""} awaiting approval`,
        urgency: "low",
        href: "/ess/goals?tab=adjustments",
        actionLabel: "Track Adjustments",
        count: pendingAdjustments.data.length,
      });
    }

    // Sort tasks by urgency
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    pendingTasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // Generate AI-powered quick actions and insights
    const aiResponse = await generateAIInsights(
      pendingTasks,
      profile,
      today,
      LOVABLE_API_KEY
    );

    const dashboardData: DashboardData = {
      pendingTasks: pendingTasks.slice(0, 5),
      quickActions: aiResponse.quickActions,
      aiInsight: aiResponse.insight,
      greeting: `${timeGreeting}, ${firstName}!`,
      focusArea: aiResponse.focusArea,
    };

    console.log(`Generated ${pendingTasks.length} pending tasks and ${aiResponse.quickActions.length} quick actions`);

    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ESS AI Dashboard error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateAIInsights(
  pendingTasks: PendingTask[],
  profile: any,
  today: Date,
  apiKey: string
): Promise<{ quickActions: QuickAction[]; insight: string; focusArea: string }> {
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const isMonday = today.getDay() === 1;
  const isFriday = today.getDay() === 5;
  const isEndOfMonth = today.getDate() >= 25;

  const tasksSummary = pendingTasks.length > 0
    ? pendingTasks.map(t => `- ${t.title}: ${t.description} (${t.urgency} urgency)`).join("\n")
    : "No urgent pending tasks";

  const systemPrompt = `You are an AI assistant for an employee self-service HR portal. Generate personalized quick actions and a brief insight based on the employee's context.

Rules:
1. Be concise and actionable
2. Prioritize based on urgency and business impact
3. Consider the day of week and time of month
4. Max 4 quick actions
5. Insight should be 1-2 sentences max
6. Focus area should be 2-3 words`;

  const userPrompt = `Employee: ${profile?.full_name || "Employee"}
Job Title: ${profile?.job_title || "Not specified"}
Day: ${dayOfWeek}
Date: ${today.toISOString().split("T")[0]}
Is Monday: ${isMonday}
Is Friday: ${isFriday}
Is End of Month: ${isEndOfMonth}

Current Pending Tasks:
${tasksSummary}

Generate personalized quick actions and insights.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_dashboard_content",
              description: "Generates personalized ESS dashboard content",
              parameters: {
                type: "object",
                properties: {
                  insight: {
                    type: "string",
                    description: "A brief 1-2 sentence insight or tip for the employee",
                  },
                  focusArea: {
                    type: "string",
                    description: "2-3 word focus area for today (e.g., 'Performance Reviews', 'Week Planning')",
                  },
                  quickActions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string", description: "Short action title" },
                        description: { type: "string", description: "Brief description" },
                        href: { type: "string", description: "Link path (e.g., /ess/goals)" },
                        icon: { type: "string", description: "Icon name: Target, Calendar, FileText, Clock, Award, TrendingUp, MessageCircle, CheckSquare" },
                        priority: { type: "integer", minimum: 1, maximum: 4 },
                        category: { type: "string", description: "Category: performance, time, learning, profile, approvals" },
                        reasoning: { type: "string", description: "Why this action is suggested" },
                      },
                      required: ["id", "title", "description", "href", "icon", "priority", "category"],
                    },
                    maxItems: 4,
                  },
                },
                required: ["insight", "focusArea", "quickActions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_dashboard_content" } },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return {
        insight: parsed.insight || getDefaultInsight(pendingTasks, isMonday, isFriday),
        focusArea: parsed.focusArea || "Today's Focus",
        quickActions: parsed.quickActions || getDefaultQuickActions(pendingTasks),
      };
    }

    throw new Error("No valid AI response");
  } catch (error) {
    console.error("AI generation error, using defaults:", error);
    return {
      insight: getDefaultInsight(pendingTasks, isMonday, isFriday),
      focusArea: "Today's Focus",
      quickActions: getDefaultQuickActions(pendingTasks),
    };
  }
}

function getDefaultInsight(tasks: PendingTask[], isMonday: boolean, isFriday: boolean): string {
  if (tasks.length === 0) {
    return isMonday
      ? "Great start to the week! No urgent tasks pending."
      : isFriday
        ? "Wrap up the week strong. All caught up on tasks!"
        : "You're all caught up! Consider reviewing your goals.";
  }

  const highUrgency = tasks.filter(t => t.urgency === "high").length;
  if (highUrgency > 0) {
    return `You have ${highUrgency} high-priority item${highUrgency > 1 ? "s" : ""} that need${highUrgency === 1 ? "s" : ""} attention today.`;
  }

  return `You have ${tasks.length} pending task${tasks.length > 1 ? "s" : ""}. Start with the most urgent ones.`;
}

function getDefaultQuickActions(tasks: PendingTask[]): QuickAction[] {
  const actions: QuickAction[] = [];

  // Add actions based on pending tasks
  if (tasks.some(t => t.type === "check_in")) {
    actions.push({
      id: "submit-checkins",
      title: "Submit Check-ins",
      description: "Complete pending goal check-ins",
      href: "/ess/goals?tab=check-ins",
      icon: "ClipboardCheck",
      priority: 1,
      category: "performance",
    });
  }

  if (tasks.some(t => t.type === "acknowledgment")) {
    actions.push({
      id: "acknowledge-ratings",
      title: "Acknowledge Ratings",
      description: "Review and acknowledge manager ratings",
      href: "/ess/goals",
      icon: "Star",
      priority: 1,
      category: "performance",
    });
  }

  if (tasks.some(t => t.type === "approval")) {
    actions.push({
      id: "review-approvals",
      title: "Review Approvals",
      description: "Pending items need your approval",
      href: "/workflow/approvals",
      icon: "CheckSquare",
      priority: 2,
      category: "approvals",
    });
  }

  // Add default actions if we have room
  if (actions.length < 4) {
    actions.push({
      id: "update-goals",
      title: "Update Goal Progress",
      description: "Keep your goals up to date",
      href: "/ess/goals",
      icon: "Target",
      priority: 3,
      category: "performance",
    });
  }

  if (actions.length < 4) {
    actions.push({
      id: "view-payslips",
      title: "View Payslips",
      description: "Check your latest pay information",
      href: "/ess/payslips",
      icon: "CreditCard",
      priority: 4,
      category: "pay",
    });
  }

  return actions.slice(0, 4);
}
