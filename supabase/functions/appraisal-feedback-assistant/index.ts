import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ActionType = 
  | 'generate_strength_statements'
  | 'generate_development_suggestions'
  | 'improve_comment'
  | 'detect_bias'
  | 'suggest_evidence'
  | 'generate_summary';

interface FeedbackAssistantRequest {
  action: ActionType;
  employeeId: string;
  cycleId: string;
  participantId?: string;
  context?: {
    scores?: {
      goals?: number;
      competencies?: number;
      responsibilities?: number;
      values?: number;
      overall?: number;
    };
    existingComments?: string;
    evidenceSummary?: {
      totalEvidence: number;
      validatedEvidence: number;
      evidenceTypes: string[];
    };
    componentType?: string;
    componentName?: string;
  };
}

interface Suggestion {
  type: 'strength' | 'development' | 'improvement' | 'summary';
  original?: string;
  suggested: string;
  reasoning: string;
  confidence: number;
}

interface FeedbackAssistantResponse {
  suggestions: Suggestion[];
  biasFlags?: string[];
  evidenceRecommendations?: string[];
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

    const request: FeedbackAssistantRequest = await req.json();
    console.log(`Appraisal Feedback Assistant - Action: ${request.action}`);

    let response: FeedbackAssistantResponse;

    switch (request.action) {
      case 'generate_strength_statements':
        response = await generateStrengthStatements(request, LOVABLE_API_KEY, supabase);
        break;
      case 'generate_development_suggestions':
        response = await generateDevelopmentSuggestions(request, LOVABLE_API_KEY, supabase);
        break;
      case 'improve_comment':
        response = await improveComment(request, LOVABLE_API_KEY);
        break;
      case 'detect_bias':
        response = await detectBias(request, LOVABLE_API_KEY);
        break;
      case 'suggest_evidence':
        response = await suggestEvidence(request, LOVABLE_API_KEY, supabase);
        break;
      case 'generate_summary':
        response = await generateSummary(request, LOVABLE_API_KEY, supabase);
        break;
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    console.log("Appraisal Feedback Assistant - Success");

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Appraisal Feedback Assistant Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getEmployeeContext(employeeId: string, cycleId: string, supabase: any) {
  // Get employee profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, job_title')
    .eq('id', employeeId)
    .single();

  // Get appraisal participant data
  const { data: participant } = await supabase
    .from('appraisal_participants')
    .select(`
      id,
      overall_score,
      goal_score,
      competency_score,
      responsibility_score,
      employee_comments,
      final_comments
    `)
    .eq('employee_id', employeeId)
    .eq('cycle_id', cycleId)
    .single();

  // Get scores breakdown
  const { data: scores } = await supabase
    .from('appraisal_scores')
    .select(`
      score,
      comments,
      score_type,
      goal_id,
      competency_id,
      responsibility_id,
      performance_goals(title),
      competencies(name),
      job_responsibilities(title)
    `)
    .eq('participant_id', participant?.id);

  // Get strengths and gaps
  const { data: insights } = await supabase
    .from('appraisal_strengths_gaps')
    .select('*')
    .eq('participant_id', participant?.id);

  return { profile, participant, scores, insights };
}

async function generateStrengthStatements(
  request: FeedbackAssistantRequest,
  apiKey: string,
  supabase: any
): Promise<FeedbackAssistantResponse> {
  const context = await getEmployeeContext(request.employeeId, request.cycleId, supabase);
  
  const highScores = (context.scores || [])
    .filter((s: any) => s.score >= 4)
    .map((s: any) => ({
      type: s.score_type,
      name: s.performance_goals?.title || s.competencies?.name || s.job_responsibilities?.title,
      score: s.score,
      comments: s.comments
    }));

  const systemPrompt = `You are an expert HR writer helping managers craft professional, specific, and impactful strength statements for employee performance appraisals.

Guidelines:
- Use active voice and specific examples
- Quantify impact where possible
- Reference behaviors, not personality traits
- Be concise but meaningful
- Avoid generic praise like "good job" or "team player"

Return 3-5 strength statements based on the high-scoring areas provided.`;

  const userPrompt = `Employee: ${context.profile?.full_name || 'Employee'}
Job Title: ${context.profile?.job_title || 'Not specified'}
High-Scoring Areas (4+ out of 5):
${JSON.stringify(highScores, null, 2)}

Generate professional strength statements for this employee's appraisal.`;

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
      tools: [{
        type: "function",
        function: {
          name: "return_strength_statements",
          description: "Returns strength statements for the appraisal",
          parameters: {
            type: "object",
            properties: {
              statements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    statement: { type: "string" },
                    reasoning: { type: "string" },
                    confidence: { type: "number", minimum: 0, maximum: 1 }
                  },
                  required: ["statement", "reasoning", "confidence"]
                }
              }
            },
            required: ["statements"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_strength_statements" } }
    }),
  });

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      suggestions: parsed.statements.map((s: any) => ({
        type: 'strength' as const,
        suggested: s.statement,
        reasoning: s.reasoning,
        confidence: s.confidence
      }))
    };
  }

  return { suggestions: [] };
}

async function generateDevelopmentSuggestions(
  request: FeedbackAssistantRequest,
  apiKey: string,
  supabase: any
): Promise<FeedbackAssistantResponse> {
  const context = await getEmployeeContext(request.employeeId, request.cycleId, supabase);
  
  const lowScores = (context.scores || [])
    .filter((s: any) => s.score <= 3)
    .map((s: any) => ({
      type: s.score_type,
      name: s.performance_goals?.title || s.competencies?.name || s.job_responsibilities?.title,
      score: s.score,
      comments: s.comments
    }));

  const gaps = (context.insights || [])
    .filter((i: any) => i.insight_type === 'gap')
    .map((i: any) => ({ title: i.title, description: i.description }));

  const systemPrompt = `You are an expert HR development specialist helping managers craft constructive, actionable development suggestions for employee performance appraisals.

Guidelines:
- Frame feedback constructively, not critically
- Provide specific, actionable development recommendations
- Suggest resources or training where appropriate
- Focus on behaviors that can be developed
- Balance honesty with encouragement
- Avoid vague terms like "needs to improve"

Return 3-5 development suggestions based on the lower-scoring areas and identified gaps.`;

  const userPrompt = `Employee: ${context.profile?.full_name || 'Employee'}
Job Title: ${context.profile?.job_title || 'Not specified'}

Areas for Development (score 3 or below):
${JSON.stringify(lowScores, null, 2)}

Identified Gaps:
${JSON.stringify(gaps, null, 2)}

Generate professional development suggestions for this employee's appraisal.`;

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
      tools: [{
        type: "function",
        function: {
          name: "return_development_suggestions",
          description: "Returns development suggestions for the appraisal",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    suggestion: { type: "string" },
                    reasoning: { type: "string" },
                    actionableSteps: { type: "array", items: { type: "string" } },
                    confidence: { type: "number", minimum: 0, maximum: 1 }
                  },
                  required: ["suggestion", "reasoning", "confidence"]
                }
              }
            },
            required: ["suggestions"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_development_suggestions" } }
    }),
  });

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      suggestions: parsed.suggestions.map((s: any) => ({
        type: 'development' as const,
        suggested: s.suggestion,
        reasoning: s.reasoning + (s.actionableSteps ? `\n\nAction steps: ${s.actionableSteps.join(', ')}` : ''),
        confidence: s.confidence
      }))
    };
  }

  return { suggestions: [] };
}

async function improveComment(
  request: FeedbackAssistantRequest,
  apiKey: string
): Promise<FeedbackAssistantResponse> {
  const existingComment = request.context?.existingComments;
  
  if (!existingComment) {
    return { suggestions: [] };
  }

  const systemPrompt = `You are an expert HR writer helping managers improve their performance appraisal comments.

Transform vague, generic, or potentially problematic feedback into specific, actionable, and professional statements.

Guidelines:
- Replace vague terms with specific behaviors and outcomes
- Add quantifiable results where possible
- Use active voice
- Remove subjective personality judgments
- Ensure feedback is constructive and professional
- Maintain the original intent while improving clarity`;

  const userPrompt = `Original comment: "${existingComment}"
Component type: ${request.context?.componentType || 'general'}
Component name: ${request.context?.componentName || 'Not specified'}

Please provide an improved version of this comment.`;

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
      tools: [{
        type: "function",
        function: {
          name: "return_improved_comment",
          description: "Returns an improved version of the comment",
          parameters: {
            type: "object",
            properties: {
              improved: { type: "string" },
              reasoning: { type: "string" },
              improvements: { type: "array", items: { type: "string" } },
              confidence: { type: "number", minimum: 0, maximum: 1 }
            },
            required: ["improved", "reasoning", "confidence"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_improved_comment" } }
    }),
  });

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      suggestions: [{
        type: 'improvement' as const,
        original: existingComment,
        suggested: parsed.improved,
        reasoning: parsed.reasoning + (parsed.improvements ? `\n\nImprovements made: ${parsed.improvements.join('; ')}` : ''),
        confidence: parsed.confidence
      }]
    };
  }

  return { suggestions: [] };
}

async function detectBias(
  request: FeedbackAssistantRequest,
  apiKey: string
): Promise<FeedbackAssistantResponse> {
  const comment = request.context?.existingComments;
  
  if (!comment) {
    return { suggestions: [], biasFlags: [] };
  }

  const systemPrompt = `You are an expert in DEI and workplace bias detection. Analyze the provided performance appraisal comment for potential bias.

Check for:
1. Gender-coded language (e.g., "aggressive" vs "assertive", "emotional", "bossy")
2. Age-related bias (e.g., "energetic young professional", "old-school")
3. Racial or cultural bias (e.g., "articulate", "exotic")
4. Vague subjective judgments (e.g., "cultural fit", "attitude problem")
5. Conditional praise (e.g., "good for a...", "surprisingly good")
6. Personality vs behavior focus

Be thorough but avoid false positives. Only flag genuine bias concerns.`;

  const userPrompt = `Analyze this performance comment for potential bias:
"${comment}"`;

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
      tools: [{
        type: "function",
        function: {
          name: "return_bias_analysis",
          description: "Returns bias analysis of the comment",
          parameters: {
            type: "object",
            properties: {
              biasFlags: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    term: { type: "string" },
                    biasType: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                    suggestion: { type: "string" }
                  },
                  required: ["term", "biasType", "severity", "suggestion"]
                }
              },
              overallRisk: { type: "string", enum: ["none", "low", "medium", "high"] },
              confidence: { type: "number", minimum: 0, maximum: 1 }
            },
            required: ["biasFlags", "overallRisk", "confidence"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_bias_analysis" } }
    }),
  });

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    const biasFlags = parsed.biasFlags.map((b: any) => 
      `${b.severity.toUpperCase()}: "${b.term}" - ${b.biasType}. Consider: ${b.suggestion}`
    );
    
    return {
      suggestions: parsed.biasFlags.map((b: any) => ({
        type: 'improvement' as const,
        original: b.term,
        suggested: b.suggestion,
        reasoning: `${b.biasType} bias detected (${b.severity} severity)`,
        confidence: parsed.confidence
      })),
      biasFlags
    };
  }

  return { suggestions: [], biasFlags: [] };
}

async function suggestEvidence(
  request: FeedbackAssistantRequest,
  apiKey: string,
  supabase: any
): Promise<FeedbackAssistantResponse> {
  const context = await getEmployeeContext(request.employeeId, request.cycleId, supabase);
  
  // Get available evidence
  const { data: evidence } = await supabase
    .from('performance_evidence')
    .select('*')
    .eq('employee_id', request.employeeId);

  const systemPrompt = `You are an expert in performance management helping managers identify relevant evidence to support their appraisal feedback.

Based on the scores and available evidence, recommend which evidence should be cited for each rating to strengthen the appraisal.

Consider:
- Evidence that directly supports the rating given
- Quantifiable outcomes and metrics
- Specific examples of behaviors
- Third-party feedback or recognition`;

  const userPrompt = `Employee: ${context.profile?.full_name || 'Employee'}
Scores: ${JSON.stringify(request.context?.scores || {})}

Available Evidence:
${JSON.stringify(evidence?.map((e: any) => ({
  type: e.evidence_type,
  title: e.title,
  description: e.description,
  date: e.evidence_date,
  validated: e.validation_status === 'validated'
})) || [], null, 2)}

Recommend which evidence to cite for this appraisal.`;

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
      tools: [{
        type: "function",
        function: {
          name: "return_evidence_recommendations",
          description: "Returns evidence recommendations",
          parameters: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    evidenceTitle: { type: "string" },
                    relevantFor: { type: "string" },
                    howToCite: { type: "string" },
                    confidence: { type: "number", minimum: 0, maximum: 1 }
                  },
                  required: ["evidenceTitle", "relevantFor", "howToCite", "confidence"]
                }
              },
              missingEvidence: { type: "array", items: { type: "string" } }
            },
            required: ["recommendations"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_evidence_recommendations" } }
    }),
  });

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      suggestions: parsed.recommendations.map((r: any) => ({
        type: 'strength' as const,
        suggested: `For ${r.relevantFor}: ${r.howToCite}`,
        reasoning: `Evidence: ${r.evidenceTitle}`,
        confidence: r.confidence
      })),
      evidenceRecommendations: parsed.missingEvidence || []
    };
  }

  return { suggestions: [], evidenceRecommendations: [] };
}

async function generateSummary(
  request: FeedbackAssistantRequest,
  apiKey: string,
  supabase: any
): Promise<FeedbackAssistantResponse> {
  const context = await getEmployeeContext(request.employeeId, request.cycleId, supabase);

  const systemPrompt = `You are an expert HR writer helping managers create comprehensive final summary comments for performance appraisals.

Guidelines:
- Synthesize component feedback into a cohesive narrative
- Start with overall performance level
- Highlight 2-3 key strengths
- Note 1-2 development areas constructively
- End with forward-looking statement
- Keep to 150-250 words
- Be specific, not generic`;

  const userPrompt = `Employee: ${context.profile?.full_name || 'Employee'}
Job Title: ${context.profile?.job_title || 'Not specified'}
Overall Score: ${context.participant?.overall_score || 'Not set'}
Goals Score: ${context.participant?.goal_score || 'Not set'}
Competencies Score: ${context.participant?.competency_score || 'Not set'}
Responsibilities Score: ${context.participant?.responsibility_score || 'Not set'}

Strengths identified:
${(context.insights || []).filter((i: any) => i.insight_type === 'strength').map((i: any) => `- ${i.title}: ${i.description}`).join('\n') || 'None documented'}

Gaps identified:
${(context.insights || []).filter((i: any) => i.insight_type === 'gap').map((i: any) => `- ${i.title}: ${i.description}`).join('\n') || 'None documented'}

Generate a professional final summary for this employee's appraisal.`;

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
      tools: [{
        type: "function",
        function: {
          name: "return_summary",
          description: "Returns a final summary for the appraisal",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string" },
              keyHighlights: { type: "array", items: { type: "string" } },
              confidence: { type: "number", minimum: 0, maximum: 1 }
            },
            required: ["summary", "confidence"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_summary" } }
    }),
  });

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      suggestions: [{
        type: 'summary' as const,
        suggested: parsed.summary,
        reasoning: parsed.keyHighlights ? `Key highlights: ${parsed.keyHighlights.join('; ')}` : 'AI-generated summary based on component scores and insights',
        confidence: parsed.confidence
      }]
    };
  }

  return { suggestions: [] };
}
