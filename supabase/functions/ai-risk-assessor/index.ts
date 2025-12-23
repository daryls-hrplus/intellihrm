import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskAssessmentRequest {
  interactionLogId?: string;
  userId: string;
  companyId?: string;
  userMessage: string;
  aiResponse: string;
  context?: string;
}

interface RiskFactor {
  factor: string;
  weight: number;
  detected: boolean;
  details?: string;
}

// High-risk contexts that require additional scrutiny
const HIGH_RISK_CONTEXTS = [
  'compensation_decisions',
  'termination_recommendations',
  'hiring_decisions',
  'performance_ratings',
  'disciplinary_actions',
  'promotion_decisions',
  'salary_information',
  'personal_grievances'
];

// Keywords that indicate high-risk queries
const HIGH_RISK_KEYWORDS = [
  'fire', 'terminate', 'dismiss', 'salary', 'compensation', 'pay', 'bonus',
  'promote', 'demote', 'discipline', 'warning', 'performance issue',
  'personal information', 'ssn', 'social security', 'bank account',
  'medical', 'disability', 'pregnancy', 'age', 'religion', 'race'
];

// Bias indicator patterns
const BIAS_PATTERNS = [
  'too old', 'too young', 'culture fit', 'not a good fit', 'attitude problem',
  'overqualified', 'underqualified', 'aggressive', 'emotional', 'unprofessional'
];

function detectRiskFactors(userMessage: string, aiResponse: string, context?: string): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();
  const lowerContext = (context || '').toLowerCase();

  // Check for high-risk keywords in user message
  const foundKeywords = HIGH_RISK_KEYWORDS.filter(kw => lowerMessage.includes(kw));
  if (foundKeywords.length > 0) {
    factors.push({
      factor: 'high_risk_keywords',
      weight: 0.3,
      detected: true,
      details: `Keywords found: ${foundKeywords.join(', ')}`
    });
  }

  // Check for high-risk contexts
  const foundContexts = HIGH_RISK_CONTEXTS.filter(ctx => 
    lowerMessage.includes(ctx.replace('_', ' ')) || 
    lowerContext.includes(ctx.replace('_', ' '))
  );
  if (foundContexts.length > 0) {
    factors.push({
      factor: 'high_risk_context',
      weight: 0.4,
      detected: true,
      details: `Contexts: ${foundContexts.join(', ')}`
    });
  }

  // Check for bias patterns in AI response
  const foundBiasPatterns = BIAS_PATTERNS.filter(pattern => 
    lowerResponse.includes(pattern)
  );
  if (foundBiasPatterns.length > 0) {
    factors.push({
      factor: 'potential_bias',
      weight: 0.5,
      detected: true,
      details: `Patterns: ${foundBiasPatterns.join(', ')}`
    });
  }

  // Check for PII in response
  const piiPatterns = [
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN
    /\b\d{10,16}\b/, // Bank account/credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  ];
  const piiFound = piiPatterns.some(pattern => pattern.test(aiResponse));
  if (piiFound) {
    factors.push({
      factor: 'pii_exposure',
      weight: 0.6,
      detected: true,
      details: 'Response may contain personally identifiable information'
    });
  }

  // Check for recommendation language (AI making decisions)
  const decisionPatterns = [
    'you should fire', 'recommend terminating', 'should be dismissed',
    'deserves a raise', 'should be promoted', 'not suitable for',
    'i recommend', 'my recommendation is', 'you must'
  ];
  const decisionsFound = decisionPatterns.filter(p => lowerResponse.includes(p));
  if (decisionsFound.length > 0) {
    factors.push({
      factor: 'autonomous_decision',
      weight: 0.45,
      detected: true,
      details: 'AI appears to be making autonomous HR decisions'
    });
  }

  // Check for uncertainty indicators
  const uncertaintyPatterns = [
    'i\'m not sure', 'i don\'t know', 'uncertain', 'might be', 'possibly',
    'it depends', 'consult with', 'verify with', 'check with hr'
  ];
  const uncertaintyFound = uncertaintyPatterns.some(p => lowerResponse.includes(p));
  if (uncertaintyFound) {
    factors.push({
      factor: 'uncertainty_disclosed',
      weight: -0.1, // Negative weight reduces risk (good behavior)
      detected: true,
      details: 'AI appropriately disclosed uncertainty'
    });
  }

  return factors;
}

function calculateRiskScore(factors: RiskFactor[]): number {
  if (factors.length === 0) return 0.1; // Base low risk

  const totalWeight = factors.reduce((sum, f) => {
    if (f.detected) {
      return sum + f.weight;
    }
    return sum;
  }, 0);

  // Normalize to 0-1 range
  return Math.min(Math.max(totalWeight, 0), 1);
}

function determineRiskCategory(factors: RiskFactor[]): string {
  const detectedFactors = factors.filter(f => f.detected);
  
  if (detectedFactors.some(f => f.factor === 'pii_exposure')) {
    return 'data_privacy';
  }
  if (detectedFactors.some(f => f.factor === 'potential_bias')) {
    return 'bias';
  }
  if (detectedFactors.some(f => f.factor === 'autonomous_decision')) {
    return 'ethical';
  }
  if (detectedFactors.some(f => f.factor === 'high_risk_context')) {
    return 'compliance';
  }
  if (detectedFactors.some(f => f.factor === 'high_risk_keywords')) {
    return 'security';
  }
  
  return 'accuracy';
}

function determineMitigations(riskScore: number, factors: RiskFactor[]): string[] {
  const mitigations: string[] = [];
  
  if (riskScore >= 0.8) {
    mitigations.push('response_blocked');
    mitigations.push('admin_notification_sent');
  } else if (riskScore >= 0.6) {
    mitigations.push('human_review_required');
    mitigations.push('disclaimer_added');
  } else if (riskScore >= 0.4) {
    mitigations.push('disclaimer_added');
    mitigations.push('logged_for_review');
  }
  
  if (factors.some(f => f.factor === 'potential_bias' && f.detected)) {
    mitigations.push('bias_warning_added');
  }
  
  if (factors.some(f => f.factor === 'pii_exposure' && f.detected)) {
    mitigations.push('pii_masked');
  }
  
  return mitigations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: RiskAssessmentRequest = await req.json();
    const { interactionLogId, userId, companyId, userMessage, aiResponse, context } = request;

    console.log('Assessing risk for interaction:', interactionLogId || 'new');

    // Detect risk factors
    const riskFactors = detectRiskFactors(userMessage, aiResponse, context);
    
    // Calculate overall risk score
    const riskScore = calculateRiskScore(riskFactors);
    
    // Determine risk category
    const riskCategory = determineRiskCategory(riskFactors);
    
    // Determine mitigations
    const mitigations = determineMitigations(riskScore, riskFactors);
    
    // Determine if human review is required
    const humanReviewRequired = riskScore >= 0.6;

    // Store risk assessment
    const { data: assessment, error: insertError } = await supabase
      .from('ai_risk_assessments')
      .insert({
        interaction_log_id: interactionLogId || null,
        user_id: userId,
        company_id: companyId || null,
        risk_category: riskCategory,
        risk_score: riskScore,
        risk_factors: riskFactors.filter(f => f.detected),
        mitigation_applied: mitigations,
        human_review_required: humanReviewRequired,
        human_review_completed: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing risk assessment:', insertError);
      throw insertError;
    }

    console.log('Risk assessment completed:', {
      score: riskScore,
      category: riskCategory,
      humanReviewRequired,
      factorsDetected: riskFactors.filter(f => f.detected).length
    });

    return new Response(
      JSON.stringify({
        success: true,
        assessment: {
          id: assessment.id,
          riskScore,
          riskCategory,
          riskFactors: riskFactors.filter(f => f.detected),
          mitigations,
          humanReviewRequired,
          shouldBlock: riskScore >= 0.8
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Risk assessment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        // Return safe defaults on error
        assessment: {
          riskScore: 0.5,
          riskCategory: 'accuracy',
          riskFactors: [],
          mitigations: ['error_fallback'],
          humanReviewRequired: true,
          shouldBlock: false
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
