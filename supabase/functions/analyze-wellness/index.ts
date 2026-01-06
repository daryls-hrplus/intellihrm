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
    const { employeeId, companyId } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch employee time data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: timeEntries, error: timeError } = await supabase
      .from("time_clock_entries")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("clock_in", thirtyDaysAgo.toISOString())
      .order("clock_in", { ascending: false });

    if (timeError) throw timeError;

    // Fetch employee profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, department_id")
      .eq("id", employeeId)
      .single();

    // Calculate metrics
    const entries = timeEntries || [];
    const last7DaysEntries = entries.filter(e => {
      const entryDate = new Date(e.clock_in);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    });

    // Calculate hours worked
    const calculateHours = (entries: any[]) => {
      return entries.reduce((sum, e) => {
        if (e.clock_out) {
          const clockIn = new Date(e.clock_in);
          const clockOut = new Date(e.clock_out);
          return sum + (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);
    };

    const totalHoursLast7Days = calculateHours(last7DaysEntries);
    const totalHoursLast30Days = calculateHours(entries);
    const avgDailyHoursLast7Days = last7DaysEntries.length > 0 ? totalHoursLast7Days / 7 : 0;
    const avgDailyHoursLast30Days = entries.length > 0 ? totalHoursLast30Days / 30 : 0;

    // Calculate consecutive work days
    const workDays = new Set(entries.map(e => new Date(e.clock_in).toDateString()));
    let consecutiveDays = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (workDays.has(checkDate.toDateString())) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    // Calculate overtime (assuming 8 hours is standard)
    const overtimeHoursLast7Days = Math.max(0, totalHoursLast7Days - 40);
    const overtimeHoursLast30Days = Math.max(0, totalHoursLast30Days - 160);

    // Calculate risk scores
    let fatigueRisk = 0;
    let burnoutRisk = 0;

    // Fatigue based on consecutive days
    if (consecutiveDays > 10) fatigueRisk += 40;
    else if (consecutiveDays > 7) fatigueRisk += 25;
    else if (consecutiveDays > 5) fatigueRisk += 10;

    // Fatigue based on daily hours
    if (avgDailyHoursLast7Days > 12) fatigueRisk += 40;
    else if (avgDailyHoursLast7Days > 10) fatigueRisk += 25;
    else if (avgDailyHoursLast7Days > 9) fatigueRisk += 10;

    // Burnout based on overtime
    if (overtimeHoursLast30Days > 40) burnoutRisk += 50;
    else if (overtimeHoursLast30Days > 20) burnoutRisk += 30;
    else if (overtimeHoursLast30Days > 10) burnoutRisk += 15;

    // Burnout based on average hours
    if (avgDailyHoursLast30Days > 10) burnoutRisk += 30;
    else if (avgDailyHoursLast30Days > 9) burnoutRisk += 15;

    fatigueRisk = Math.min(100, fatigueRisk);
    burnoutRisk = Math.min(100, burnoutRisk);
    const overallWellness = Math.max(0, 100 - Math.max(fatigueRisk, burnoutRisk));

    let riskLevel = "low";
    if (fatigueRisk > 70 || burnoutRisk > 70) riskLevel = "critical";
    else if (fatigueRisk > 50 || burnoutRisk > 50) riskLevel = "high";
    else if (fatigueRisk > 30 || burnoutRisk > 30) riskLevel = "medium";

    // Get AI analysis if API key is available
    let aiAnalysis = null;
    let aiRecommendations = null;
    let aiConfidence = null;

    if (lovableApiKey && (fatigueRisk > 30 || burnoutRisk > 30)) {
      try {
        const prompt = `Analyze this employee's work pattern and provide wellness recommendations:
- Employee: ${profile?.full_name || 'Unknown'}
- Consecutive work days: ${consecutiveDays}
- Average daily hours (last 7 days): ${avgDailyHoursLast7Days.toFixed(1)}
- Average daily hours (last 30 days): ${avgDailyHoursLast30Days.toFixed(1)}
- Overtime last 7 days: ${overtimeHoursLast7Days.toFixed(1)} hours
- Overtime last 30 days: ${overtimeHoursLast30Days.toFixed(1)} hours
- Fatigue risk score: ${fatigueRisk}%
- Burnout risk score: ${burnoutRisk}%

Provide a brief analysis and 3-4 actionable recommendations for the employee and their manager.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are an HR wellness expert. Analyze employee work patterns and provide actionable recommendations to prevent burnout and improve work-life balance. Be concise and practical." },
              { role: "user", content: prompt }
            ],
            tools: [{
              type: "function",
              function: {
                name: "provide_wellness_analysis",
                description: "Provide wellness analysis and recommendations",
                parameters: {
                  type: "object",
                  properties: {
                    analysis: { type: "string", description: "Brief analysis of the employee's work pattern" },
                    recommendations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          for_employee: { type: "string" },
                          for_manager: { type: "string" },
                          priority: { type: "string", enum: ["high", "medium", "low"] }
                        },
                        required: ["for_employee", "priority"]
                      }
                    },
                    confidence: { type: "number", description: "Confidence score 0-1" }
                  },
                  required: ["analysis", "recommendations", "confidence"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "provide_wellness_analysis" } }
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            const parsed = JSON.parse(toolCall.function.arguments);
            aiAnalysis = parsed.analysis;
            aiRecommendations = parsed.recommendations;
            aiConfidence = parsed.confidence;
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // Upsert wellness indicator
    const { data: indicator, error: upsertError } = await supabase
      .from("employee_wellness_indicators")
      .upsert({
        company_id: companyId,
        employee_id: employeeId,
        assessment_date: new Date().toISOString().split('T')[0],
        consecutive_work_days: consecutiveDays,
        avg_daily_hours_last_7_days: avgDailyHoursLast7Days,
        avg_daily_hours_last_30_days: avgDailyHoursLast30Days,
        total_overtime_hours_last_7_days: overtimeHoursLast7Days,
        total_overtime_hours_last_30_days: overtimeHoursLast30Days,
        fatigue_risk_score: fatigueRisk,
        burnout_risk_score: burnoutRisk,
        overall_wellness_score: overallWellness,
        risk_level: riskLevel,
        ai_analysis: aiAnalysis,
        ai_recommendations: aiRecommendations,
        ai_confidence_score: aiConfidence,
        calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "company_id,employee_id,assessment_date"
      })
      .select()
      .single();

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ success: true, indicator }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Wellness analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});