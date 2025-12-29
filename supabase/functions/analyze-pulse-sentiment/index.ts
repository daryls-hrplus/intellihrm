import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SentimentRequest {
  action: "analyze_response" | "analyze_batch" | "generate_metrics" | "generate_nudges" | "detect_alerts" | "calculate_enps";
  surveyId?: string;
  responseId?: string;
  companyId: string;
  departmentId?: string;
  managerId?: string;
  responses?: Array<{
    id: string;
    questionText: string;
    responseText: string;
    responseValue?: number; // For NPS questions (0-10)
    questionType?: string;
    departmentId?: string;
  }>;
}

// eNPS calculation helper
function calculateENPS(scores: number[]): { 
  enpsScore: number; 
  promoters: number; 
  passives: number; 
  detractors: number;
  total: number;
} {
  if (scores.length === 0) return { enpsScore: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
  
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  
  for (const score of scores) {
    if (score >= 9) promoters++;
    else if (score >= 7) passives++;
    else detractors++;
  }
  
  const total = scores.length;
  const enpsScore = Math.round(((promoters - detractors) / total) * 100);
  
  return { enpsScore, promoters, passives, detractors, total };
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

    const request: SentimentRequest = await req.json();
    console.log(`Processing ${request.action} for company ${request.companyId}`);

    let systemPrompt = "";
    let userPrompt = "";
    let tools: any[] = [];

    switch (request.action) {
      case "analyze_response":
      case "analyze_batch":
        systemPrompt = `You are an expert HR sentiment analyst specializing in employee feedback analysis. 
Analyze open-ended survey responses to determine sentiment, emotions, key themes, and urgency.
Be objective and thorough in your analysis. Identify actionable insights.`;

        userPrompt = `Analyze the following employee survey response(s) for sentiment:

${JSON.stringify(request.responses, null, 2)}

For each response, determine:
1. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
2. Sentiment label (very_negative, negative, neutral, positive, very_positive)
3. Confidence level (0 to 1)
4. Detected emotions (joy, sadness, anger, fear, surprise, trust, anticipation, disgust)
5. Key themes mentioned (work-life balance, management, compensation, growth, culture, workload, etc.)
6. Urgency level (low, normal, high, critical)
7. Whether this requires immediate HR attention`;

        tools = [{
          type: "function",
          function: {
            name: "submit_sentiment_analysis",
            description: "Submit sentiment analysis results for survey responses",
            parameters: {
              type: "object",
              properties: {
                analyses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      responseId: { type: "string" },
                      sentimentScore: { type: "number", minimum: -1, maximum: 1 },
                      sentimentLabel: { type: "string", enum: ["very_negative", "negative", "neutral", "positive", "very_positive"] },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                      emotions: {
                        type: "object",
                        properties: {
                          joy: { type: "number" },
                          sadness: { type: "number" },
                          anger: { type: "number" },
                          fear: { type: "number" },
                          surprise: { type: "number" },
                          trust: { type: "number" },
                          anticipation: { type: "number" },
                          disgust: { type: "number" }
                        }
                      },
                      keyThemes: { type: "array", items: { type: "string" } },
                      urgencyLevel: { type: "string", enum: ["low", "normal", "high", "critical"] },
                      requiresAttention: { type: "boolean" }
                    },
                    required: ["responseId", "sentimentScore", "sentimentLabel", "confidence", "keyThemes", "urgencyLevel", "requiresAttention"]
                  }
                }
              },
              required: ["analyses"]
            }
          }
        }];
        break;

      case "generate_metrics":
        // Fetch recent sentiment data
        const { data: sentimentData } = await supabase
          .from("pulse_sentiment_analysis")
          .select("*")
          .eq("company_id", request.companyId)
          .eq("survey_id", request.surveyId)
          .order("created_at", { ascending: false });

        systemPrompt = `You are an HR analytics expert. Analyze aggregated sentiment data to generate meaningful metrics and trends.`;
        userPrompt = `Generate metrics summary for the following sentiment analysis data:

${JSON.stringify(sentimentData, null, 2)}

Calculate:
1. Average sentiment score
2. Positive/neutral/negative distribution
3. Top themes
4. Emotion breakdown
5. Trend direction compared to previous data
6. Overall engagement score`;

        tools = [{
          type: "function",
          function: {
            name: "submit_metrics",
            description: "Submit calculated metrics for the survey",
            parameters: {
              type: "object",
              properties: {
                avgSentimentScore: { type: "number" },
                positiveCount: { type: "integer" },
                neutralCount: { type: "integer" },
                negativeCount: { type: "integer" },
                totalResponses: { type: "integer" },
                topThemes: { type: "array", items: { type: "string" } },
                emotionBreakdown: { type: "object" },
                trendDirection: { type: "string", enum: ["improving", "stable", "declining"] },
                trendChange: { type: "number" },
                engagementScore: { type: "number" }
              },
              required: ["avgSentimentScore", "positiveCount", "neutralCount", "negativeCount", "totalResponses", "topThemes", "engagementScore"]
            }
          }
        }];
        break;

      case "detect_alerts":
        const { data: recentSentiment } = await supabase
          .from("pulse_sentiment_analysis")
          .select("*, pulse_surveys(title)")
          .eq("company_id", request.companyId)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false });

        systemPrompt = `You are an HR risk analyst. Identify concerning patterns in employee sentiment that require immediate attention.
Look for: sudden drops in sentiment, clusters of negative feedback, mentions of harassment/discrimination, burnout indicators, flight risk signals.`;

        userPrompt = `Analyze the following recent sentiment data and identify any urgent issues that require HR attention:

${JSON.stringify(recentSentiment, null, 2)}

Generate alerts for:
1. Critical negative sentiment spikes
2. Repeated concerning themes
3. Department-specific issues
4. Potential compliance concerns
5. High flight risk indicators`;

        tools = [{
          type: "function",
          function: {
            name: "submit_alerts",
            description: "Submit detected sentiment alerts",
            parameters: {
              type: "object",
              properties: {
                alerts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      alertType: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      departmentId: { type: "string" },
                      triggerMetrics: { type: "object" },
                      recommendedActions: { type: "array", items: { type: "string" } }
                    },
                    required: ["alertType", "severity", "title", "description", "recommendedActions"]
                  }
                }
              },
              required: ["alerts"]
            }
          }
        }];
        break;

      case "generate_nudges":
        // Fetch team sentiment for manager
        const { data: teamSentiment } = await supabase
          .from("pulse_sentiment_analysis")
          .select("*")
          .eq("company_id", request.companyId)
          .eq("department_id", request.departmentId)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        systemPrompt = `You are an executive coach specializing in people management. Generate actionable coaching nudges for managers based on their team's sentiment data.
Be specific, empathetic, and focus on practical actions the manager can take.`;

        userPrompt = `Based on the following team sentiment data, generate coaching nudges for the manager:

${JSON.stringify(teamSentiment, null, 2)}

Create nudges that:
1. Address concerning sentiment trends
2. Reinforce positive patterns
3. Suggest specific conversations to have
4. Recommend team activities or interventions
5. Highlight individuals who may need support`;

        tools = [{
          type: "function",
          function: {
            name: "submit_nudges",
            description: "Submit coaching nudges for the manager",
            parameters: {
              type: "object",
              properties: {
                nudges: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nudgeType: { type: "string", enum: ["recognition", "concern", "coaching", "celebration", "intervention"] },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      title: { type: "string" },
                      message: { type: "string" },
                      suggestedActions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, context: { type: "string" } } } },
                      relatedThemes: { type: "array", items: { type: "string" } },
                      sentimentContext: { type: "object" }
                    },
                    required: ["nudgeType", "priority", "title", "message", "suggestedActions"]
                  }
                }
              },
              required: ["nudges"]
            }
          }
        }];
        break;

      case "calculate_enps": {
        // Handle eNPS calculation separately (no AI needed) - return early
        // Fetch NPS responses for the survey
        const { data: npsResponses, error: npsError } = await supabase
          .from("pulse_survey_responses")
          .select("response_data, employee_id, profiles(department_id)")
          .eq("survey_id", request.surveyId)
          .eq("company_id", request.companyId);

        if (npsError) throw npsError;

        // Extract NPS scores from response_data
        const npsScores: number[] = [];
        const deptScores: Record<string, number[]> = {};

        for (const response of npsResponses || []) {
          const responseData = response.response_data as Record<string, any>;
          // Look for NPS-type answers (0-10 scale)
          for (const [key, value] of Object.entries(responseData)) {
            if (typeof value === "number" && value >= 0 && value <= 10) {
              npsScores.push(value);
              const deptId = (response.profiles as any)?.department_id;
              if (deptId) {
                if (!deptScores[deptId]) deptScores[deptId] = [];
                deptScores[deptId].push(value);
              }
            }
          }
        }

        const orgENPS = calculateENPS(npsScores);
        console.log("Calculated org eNPS:", orgENPS);

        // Store org-level eNPS metrics
        await supabase.from("pulse_sentiment_metrics").upsert({
          company_id: request.companyId,
          survey_id: request.surveyId,
          department_id: null,
          metric_date: new Date().toISOString().split("T")[0],
          enps_score: orgENPS.enpsScore,
          promoter_count: orgENPS.promoters,
          passive_count: orgENPS.passives,
          detractor_count: orgENPS.detractors,
          enps_response_count: orgENPS.total,
        }, { onConflict: "company_id,department_id,survey_id,metric_date" });

        // Store department-level eNPS metrics
        for (const [deptId, scores] of Object.entries(deptScores)) {
          const deptENPS = calculateENPS(scores);
          await supabase.from("pulse_sentiment_metrics").upsert({
            company_id: request.companyId,
            survey_id: request.surveyId,
            department_id: deptId,
            metric_date: new Date().toISOString().split("T")[0],
            enps_score: deptENPS.enpsScore,
            promoter_count: deptENPS.promoters,
            passive_count: deptENPS.passives,
            detractor_count: deptENPS.detractors,
            enps_response_count: deptENPS.total,
          }, { onConflict: "company_id,department_id,survey_id,metric_date" });
        }

        // Check for eNPS alerts
        if (orgENPS.enpsScore < 0) {
          await supabase.from("pulse_sentiment_alerts").insert({
            company_id: request.companyId,
            survey_id: request.surveyId,
            alert_type: "enps_critical",
            severity: "high",
            title: "Negative eNPS Score",
            description: `Organization eNPS is ${orgENPS.enpsScore}, indicating more detractors than promoters.`,
            trigger_metrics: { enps_score: orgENPS.enpsScore, ...orgENPS },
            recommended_actions: [
              "Conduct focus groups with detractors to understand concerns",
              "Review exit interview data for common themes",
              "Address top pain points identified in open feedback"
            ],
            is_enps_alert: true,
          });
        }

        return new Response(JSON.stringify({ success: true, result: orgENPS }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    console.log("Calling AI gateway...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: tools[0].function.name } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Parsed result:", JSON.stringify(result).slice(0, 200));

    // Store results in database
    if (request.action === "analyze_response" || request.action === "analyze_batch") {
      for (const analysis of result.analyses) {
        const response = request.responses?.find(r => r.id === analysis.responseId);
        await supabase.from("pulse_sentiment_analysis").insert({
          survey_id: request.surveyId,
          response_id: analysis.responseId,
          company_id: request.companyId,
          department_id: response?.departmentId,
          question_text: response?.questionText,
          response_text: response?.responseText,
          sentiment_score: analysis.sentimentScore,
          sentiment_label: analysis.sentimentLabel,
          confidence: analysis.confidence,
          emotions: analysis.emotions || {},
          key_themes: analysis.keyThemes,
          urgency_level: analysis.urgencyLevel,
          requires_attention: analysis.requiresAttention,
        });
      }
    } else if (request.action === "generate_metrics") {
      await supabase.from("pulse_sentiment_metrics").upsert({
        company_id: request.companyId,
        department_id: request.departmentId,
        survey_id: request.surveyId,
        metric_date: new Date().toISOString().split("T")[0],
        avg_sentiment_score: result.avgSentimentScore,
        positive_count: result.positiveCount,
        neutral_count: result.neutralCount,
        negative_count: result.negativeCount,
        total_responses: result.totalResponses,
        top_themes: result.topThemes,
        emotion_breakdown: result.emotionBreakdown || {},
        trend_direction: result.trendDirection,
        trend_change: result.trendChange,
        engagement_score: result.engagementScore,
      }, { onConflict: "company_id,department_id,survey_id,metric_date" });
    } else if (request.action === "detect_alerts") {
      for (const alert of result.alerts) {
        await supabase.from("pulse_sentiment_alerts").insert({
          company_id: request.companyId,
          survey_id: request.surveyId,
          department_id: alert.departmentId,
          alert_type: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          trigger_metrics: alert.triggerMetrics,
          recommended_actions: alert.recommendedActions,
        });
      }
    } else if (request.action === "generate_nudges") {
      for (const nudge of result.nudges) {
        await supabase.from("pulse_coaching_nudges").insert({
          company_id: request.companyId,
          manager_id: request.managerId,
          department_id: request.departmentId,
          survey_id: request.surveyId,
          nudge_type: nudge.nudgeType,
          priority: nudge.priority,
          title: nudge.title,
          message: nudge.message,
          suggested_actions: nudge.suggestedActions,
          related_themes: nudge.relatedThemes,
          sentiment_context: nudge.sentimentContext,
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-pulse-sentiment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
