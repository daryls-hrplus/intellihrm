import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExplainabilityRequest {
  interactionLogId: string;
  companyId?: string;
  userMessage: string;
  aiResponse: string;
  contextSources?: Array<{
    type: string;
    id: string;
    title: string;
    relevanceScore?: number;
  }>;
  modelUsed?: string;
  promptTokens?: number;
  completionTokens?: number;
}

interface DecisionFactor {
  factor: string;
  weight: number;
  description: string;
  source?: string;
}

// Confidence indicators in AI responses
const HIGH_CONFIDENCE_PATTERNS = [
  'according to policy', 'as stated in', 'the policy clearly states',
  'per the documentation', 'based on the guidelines', 'as per company policy'
];

const LOW_CONFIDENCE_PATTERNS = [
  'i\'m not sure', 'i don\'t have information', 'you should check with',
  'it might be', 'possibly', 'i think', 'it appears', 'it seems',
  'consult with hr', 'verify with', 'double check'
];

const UNCERTAINTY_INDICATORS = [
  'however', 'but', 'although', 'on the other hand', 'alternatively',
  'it depends', 'case by case', 'situation specific', 'varies'
];

function analyzeConfidence(response: string): number {
  const lowerResponse = response.toLowerCase();
  
  let confidenceScore = 0.5; // Base confidence
  
  // Increase for high confidence patterns
  const highConfidenceMatches = HIGH_CONFIDENCE_PATTERNS.filter(p => 
    lowerResponse.includes(p)
  ).length;
  confidenceScore += highConfidenceMatches * 0.1;
  
  // Decrease for low confidence patterns
  const lowConfidenceMatches = LOW_CONFIDENCE_PATTERNS.filter(p => 
    lowerResponse.includes(p)
  ).length;
  confidenceScore -= lowConfidenceMatches * 0.15;
  
  // Decrease slightly for uncertainty indicators
  const uncertaintyMatches = UNCERTAINTY_INDICATORS.filter(p => 
    lowerResponse.includes(p)
  ).length;
  confidenceScore -= uncertaintyMatches * 0.05;
  
  // Normalize to 0-1 range
  return Math.min(Math.max(confidenceScore, 0.1), 0.95);
}

function extractUncertaintyAreas(response: string): string[] {
  const uncertaintyAreas: string[] = [];
  const lowerResponse = response.toLowerCase();
  
  // Check for explicit uncertainty statements
  const uncertaintyPatterns = [
    { pattern: 'check with hr', area: 'HR policy interpretation' },
    { pattern: 'consult with', area: 'Expert consultation needed' },
    { pattern: 'verify with', area: 'Verification required' },
    { pattern: 'it depends', area: 'Situation-specific determination' },
    { pattern: 'case by case', area: 'Individual case assessment' },
    { pattern: 'i don\'t have', area: 'Information not available' },
    { pattern: 'not sure', area: 'Confidence limitation' },
    { pattern: 'might vary', area: 'Variable factors' },
    { pattern: 'subject to change', area: 'Policy currency' }
  ];
  
  for (const { pattern, area } of uncertaintyPatterns) {
    if (lowerResponse.includes(pattern) && !uncertaintyAreas.includes(area)) {
      uncertaintyAreas.push(area);
    }
  }
  
  return uncertaintyAreas;
}

function extractDecisionFactors(
  userMessage: string, 
  aiResponse: string,
  contextSources?: Array<{ type: string; id: string; title: string; relevanceScore?: number }>
): DecisionFactor[] {
  const factors: DecisionFactor[] = [];
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();
  
  // Factor: User query type
  if (lowerMessage.includes('how') || lowerMessage.includes('what')) {
    factors.push({
      factor: 'query_type',
      weight: 0.2,
      description: 'Informational query detected'
    });
  } else if (lowerMessage.includes('should') || lowerMessage.includes('recommend')) {
    factors.push({
      factor: 'query_type',
      weight: 0.3,
      description: 'Advisory/recommendation query detected'
    });
  }
  
  // Factor: Policy references
  if (lowerResponse.includes('policy') || lowerResponse.includes('guideline')) {
    factors.push({
      factor: 'policy_reference',
      weight: 0.4,
      description: 'Response references company policies or guidelines'
    });
  }
  
  // Factor: Context sources used
  if (contextSources && contextSources.length > 0) {
    const avgRelevance = contextSources.reduce(
      (sum, s) => sum + (s.relevanceScore || 0.5), 0
    ) / contextSources.length;
    
    factors.push({
      factor: 'context_sources',
      weight: avgRelevance,
      description: `${contextSources.length} context source(s) used`,
      source: contextSources.map(s => s.title).join(', ')
    });
  }
  
  // Factor: Disclaimer present
  if (lowerResponse.includes('disclaimer') || 
      lowerResponse.includes('note:') || 
      lowerResponse.includes('important:')) {
    factors.push({
      factor: 'disclaimer_included',
      weight: 0.15,
      description: 'Response includes appropriate disclaimers'
    });
  }
  
  // Factor: Action recommendation
  if (lowerResponse.includes('recommend') || 
      lowerResponse.includes('suggest') || 
      lowerResponse.includes('advise')) {
    factors.push({
      factor: 'action_recommendation',
      weight: 0.35,
      description: 'Response includes actionable recommendations'
    });
  }
  
  return factors;
}

function extractCitations(
  response: string,
  contextSources?: Array<{ type: string; id: string; title: string; relevanceScore?: number }>
): Array<{ source: string; excerpt?: string; relevance: number }> {
  const citations: Array<{ source: string; excerpt?: string; relevance: number }> = [];
  
  // Add context sources as citations
  if (contextSources) {
    for (const source of contextSources) {
      citations.push({
        source: source.title,
        relevance: source.relevanceScore || 0.5
      });
    }
  }
  
  // Try to extract inline citations
  const citationPatterns = [
    /according to (?:the )?(.+?)(?:,|\.)/gi,
    /as stated in (?:the )?(.+?)(?:,|\.)/gi,
    /per (?:the )?(.+?)(?:,|\.)/gi,
    /based on (?:the )?(.+?)(?:,|\.)/gi
  ];
  
  for (const pattern of citationPatterns) {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      const source = match[1].trim();
      if (source.length > 3 && source.length < 100) {
        // Check if this source is already in citations
        if (!citations.some(c => c.source.toLowerCase() === source.toLowerCase())) {
          citations.push({
            source,
            relevance: 0.6
          });
        }
      }
    }
  }
  
  return citations;
}

function generateExplanation(
  decisionFactors: DecisionFactor[],
  confidenceScore: number,
  uncertaintyAreas: string[],
  citations: Array<{ source: string; excerpt?: string; relevance: number }>
): string {
  let explanation = 'This response was generated based on:\n\n';
  
  // Add decision factors
  if (decisionFactors.length > 0) {
    explanation += '**Key Factors:**\n';
    for (const factor of decisionFactors) {
      explanation += `- ${factor.description}${factor.source ? ` (Source: ${factor.source})` : ''}\n`;
    }
    explanation += '\n';
  }
  
  // Add confidence info
  explanation += `**Confidence Level:** ${Math.round(confidenceScore * 100)}%\n\n`;
  
  // Add citations
  if (citations.length > 0) {
    explanation += '**Sources Referenced:**\n';
    for (const citation of citations) {
      explanation += `- ${citation.source}\n`;
    }
    explanation += '\n';
  }
  
  // Add uncertainty areas
  if (uncertaintyAreas.length > 0) {
    explanation += '**Areas of Uncertainty:**\n';
    for (const area of uncertaintyAreas) {
      explanation += `- ${area}\n`;
    }
    explanation += '\n';
  }
  
  // Add disclaimer
  explanation += '_This explanation is auto-generated for transparency and audit purposes._';
  
  return explanation;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: ExplainabilityRequest = await req.json();
    const { 
      interactionLogId, 
      companyId,
      userMessage, 
      aiResponse,
      contextSources,
      modelUsed,
      promptTokens,
      completionTokens
    } = request;

    console.log('Generating explainability log for interaction:', interactionLogId);

    // Analyze the response
    const confidenceScore = analyzeConfidence(aiResponse);
    const uncertaintyAreas = extractUncertaintyAreas(aiResponse);
    const decisionFactors = extractDecisionFactors(userMessage, aiResponse, contextSources);
    const citations = extractCitations(aiResponse, contextSources);
    const explanation = generateExplanation(decisionFactors, confidenceScore, uncertaintyAreas, citations);

    // Store explainability log
    const { data: explainLog, error: insertError } = await supabase
      .from('ai_explainability_logs')
      .insert({
        interaction_log_id: interactionLogId,
        company_id: companyId || null,
        context_sources_used: contextSources || [],
        decision_factors: decisionFactors,
        confidence_score: confidenceScore,
        uncertainty_areas: uncertaintyAreas,
        citations: citations,
        explanation_generated: explanation,
        model_used: modelUsed || 'unknown',
        prompt_tokens: promptTokens || null,
        completion_tokens: completionTokens || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing explainability log:', insertError);
      throw insertError;
    }

    console.log('Explainability log created:', explainLog.id);

    return new Response(
      JSON.stringify({
        success: true,
        explainability: {
          id: explainLog.id,
          confidenceScore,
          uncertaintyAreas,
          decisionFactors,
          citations,
          explanation
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Explainability generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
