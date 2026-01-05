import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WritingAnalysisRequest {
  text: string;
  questionContext?: string;
  raterCategory?: string;
  companyId?: string;
}

interface Suggestion {
  type: 'bias' | 'clarity' | 'specificity' | 'tone' | 'length' | 'behavioral';
  suggestion: string;
  explanation: string;
  severity: 'info' | 'warning' | 'error';
  originalPhrase?: string;
}

interface QualityScores {
  clarity: number;
  specificity: number;
  biasRisk: number;
  behavioralFocus: number;
  overall: number;
}

interface AnalysisResponse {
  suggestions: Suggestion[];
  qualityScores: QualityScores;
  biasIndicators: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, questionContext, raterCategory }: WritingAnalysisRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [], 
          qualityScores: { clarity: 0, specificity: 0, biasRisk: 0, behavioralFocus: 0, overall: 0 },
          biasIndicators: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert HR writing coach helping improve 360 feedback comments. Analyze the feedback text and provide:

1. SUGGESTIONS for improvement covering:
   - bias: Gender, age, cultural, or other biased language
   - clarity: Vague or confusing statements
   - specificity: Generic statements lacking examples
   - tone: Overly harsh or inappropriately casual language
   - length: Too short or too long for meaningful feedback
   - behavioral: Focusing on personality rather than observable behaviors

2. QUALITY SCORES (0-100) for:
   - clarity: How clear and understandable is the feedback
   - specificity: How specific with examples and details
   - biasRisk: How likely the text contains bias (100 = high risk, 0 = no risk)
   - behavioralFocus: How well it focuses on observable behaviors vs personality
   - overall: Overall quality score

3. BIAS INDICATORS: List any specific biased phrases or patterns detected

Respond in JSON format:
{
  "suggestions": [
    {
      "type": "bias|clarity|specificity|tone|length|behavioral",
      "suggestion": "Improved text or recommendation",
      "explanation": "Why this change is recommended",
      "severity": "info|warning|error",
      "originalPhrase": "The problematic phrase if applicable"
    }
  ],
  "qualityScores": {
    "clarity": 0-100,
    "specificity": 0-100,
    "biasRisk": 0-100,
    "behavioralFocus": 0-100,
    "overall": 0-100
  },
  "biasIndicators": ["List of detected bias phrases"]
}`;

    const userPrompt = `Analyze this 360 feedback comment:

"${text}"

${questionContext ? `Question context: ${questionContext}` : ''}
${raterCategory ? `Rater category: ${raterCategory}` : ''}

Provide improvement suggestions and quality scores. Be constructive and helpful.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsed: AnalysisResponse;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1] || content);
    } catch {
      // Return default scores if parsing fails
      parsed = {
        suggestions: [],
        qualityScores: { clarity: 70, specificity: 60, biasRisk: 20, behavioralFocus: 65, overall: 65 },
        biasIndicators: []
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Writing assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
