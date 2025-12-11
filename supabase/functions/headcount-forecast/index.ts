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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { companyId } = await req.json();

    // Fetch historical headcount data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: headcountRequests, error: reqError } = await supabaseClient
      .from("headcount_requests")
      .select(`
        *,
        position:positions(
          title,
          department:departments(name, company_id, company:companies(name))
        )
      `)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    if (reqError) {
      console.error("Error fetching requests:", reqError);
      throw reqError;
    }

    // Filter by company if provided
    let filteredRequests = headcountRequests || [];
    if (companyId) {
      filteredRequests = filteredRequests.filter(
        (r) => r.position?.department?.company_id === companyId
      );
    }

    // Get current vacancy summary
    let vacancyData: any[] = [];
    if (companyId) {
      const { data } = await supabaseClient.rpc("get_position_vacancy_summary", {
        p_company_id: companyId,
      });
      vacancyData = data || [];
    } else {
      // Get all companies and aggregate
      const { data: companies } = await supabaseClient
        .from("companies")
        .select("id, name")
        .eq("is_active", true);

      if (companies) {
        for (const company of companies) {
          const { data } = await supabaseClient.rpc("get_position_vacancy_summary", {
            p_company_id: company.id,
          });
          if (data) {
            vacancyData.push(...data.map((v: any) => ({ ...v, company_name: company.name })));
          }
        }
      }
    }

    // Calculate statistics for AI context
    const totalRequests = filteredRequests.length;
    const approvedRequests = filteredRequests.filter((r) => r.status === "approved");
    const rejectedRequests = filteredRequests.filter((r) => r.status === "rejected");
    const pendingRequests = filteredRequests.filter((r) => r.status === "pending");

    const approvalRate = totalRequests > 0 
      ? ((approvedRequests.length / totalRequests) * 100).toFixed(1) 
      : 0;

    const netHeadcountChange = approvedRequests.reduce(
      (sum, r) => sum + (r.requested_headcount - r.current_headcount),
      0
    );

    // Monthly breakdown
    const monthlyData: Record<string, { requests: number; approved: number; netChange: number }> = {};
    filteredRequests.forEach((r) => {
      const month = new Date(r.created_at).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthlyData[month]) {
        monthlyData[month] = { requests: 0, approved: 0, netChange: 0 };
      }
      monthlyData[month].requests++;
      if (r.status === "approved") {
        monthlyData[month].approved++;
        monthlyData[month].netChange += r.requested_headcount - r.current_headcount;
      }
    });

    // Department breakdown
    const departmentData: Record<string, { requests: number; approved: number }> = {};
    filteredRequests.forEach((r) => {
      const dept = r.position?.department?.name || "Unknown";
      if (!departmentData[dept]) {
        departmentData[dept] = { requests: 0, approved: 0 };
      }
      departmentData[dept].requests++;
      if (r.status === "approved") {
        departmentData[dept].approved++;
      }
    });

    // Current vacancies summary
    const totalAuthorized = vacancyData.reduce((sum, v) => sum + v.authorized_headcount, 0);
    const totalFilled = vacancyData.reduce((sum, v) => sum + Number(v.filled_count), 0);
    const totalVacancies = vacancyData.reduce((sum, v) => sum + Number(v.vacancy_count), 0);

    // Build context for AI
    const contextPrompt = `
You are an HR analytics expert. Analyze the following headcount data and provide forecasting insights.

## Historical Data (Last 6 Months)
- Total headcount requests: ${totalRequests}
- Approved: ${approvedRequests.length} (${approvalRate}%)
- Rejected: ${rejectedRequests.length}
- Pending: ${pendingRequests.length}
- Net headcount change from approved requests: ${netHeadcountChange >= 0 ? "+" : ""}${netHeadcountChange}

## Monthly Trend
${Object.entries(monthlyData)
  .map(([month, data]) => `- ${month}: ${data.requests} requests, ${data.approved} approved, net change: ${data.netChange >= 0 ? "+" : ""}${data.netChange}`)
  .join("\n")}

## Department Activity
${Object.entries(departmentData)
  .slice(0, 10)
  .map(([dept, data]) => `- ${dept}: ${data.requests} requests, ${data.approved} approved`)
  .join("\n")}

## Current Workforce Status
- Total authorized positions: ${totalAuthorized}
- Filled positions: ${totalFilled}
- Current vacancies: ${totalVacancies}
- Fill rate: ${totalAuthorized > 0 ? ((totalFilled / totalAuthorized) * 100).toFixed(1) : 0}%

Based on this data, provide:
1. A 3-month headcount forecast (predicted new requests and net change)
2. Key trends and patterns observed
3. Departments likely to need additional headcount
4. Risk factors and recommendations
5. Confidence level in predictions (low/medium/high)

Format your response as JSON with this structure:
{
  "forecast": {
    "month1": { "month": "string", "predictedRequests": number, "predictedNetChange": number },
    "month2": { "month": "string", "predictedRequests": number, "predictedNetChange": number },
    "month3": { "month": "string", "predictedRequests": number, "predictedNetChange": number }
  },
  "trends": ["string"],
  "highDemandDepartments": ["string"],
  "risks": ["string"],
  "recommendations": ["string"],
  "confidenceLevel": "low" | "medium" | "high",
  "summary": "string"
}`;

    console.log("Calling AI gateway for forecast...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert HR analytics AI. Always respond with valid JSON only, no markdown formatting.",
          },
          { role: "user", content: contextPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Parse AI response
    let forecast;
    try {
      // Clean up the response if it has markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      forecast = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback response
      forecast = {
        forecast: {
          month1: { month: "Next Month", predictedRequests: Math.round(totalRequests / 6), predictedNetChange: Math.round(netHeadcountChange / 6) },
          month2: { month: "Month 2", predictedRequests: Math.round(totalRequests / 6), predictedNetChange: Math.round(netHeadcountChange / 6) },
          month3: { month: "Month 3", predictedRequests: Math.round(totalRequests / 6), predictedNetChange: Math.round(netHeadcountChange / 6) },
        },
        trends: ["Insufficient data for detailed trend analysis"],
        highDemandDepartments: Object.keys(departmentData).slice(0, 3),
        risks: ["Limited historical data may affect forecast accuracy"],
        recommendations: ["Continue monitoring headcount trends", "Review pending requests promptly"],
        confidenceLevel: "low",
        summary: "Forecast based on limited historical data. Consider collecting more data for improved predictions.",
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        forecast,
        historicalData: {
          totalRequests,
          approvedRequests: approvedRequests.length,
          rejectedRequests: rejectedRequests.length,
          pendingRequests: pendingRequests.length,
          approvalRate,
          netHeadcountChange,
          monthlyTrend: monthlyData,
          currentVacancies: totalVacancies,
          fillRate: totalAuthorized > 0 ? ((totalFilled / totalAuthorized) * 100).toFixed(1) : 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Forecast error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
