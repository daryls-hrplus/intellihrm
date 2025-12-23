import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BiasDetectionRequest {
  interactionLogId?: string;
  companyId?: string;
  promptContent: string;
  responseContent: string;
  reportedBy?: string;
  detectionMethod?: 'automated' | 'user_report' | 'audit' | 'review';
}

interface BiasIndicator {
  type: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  affectedCharacteristic?: string;
}

// Protected characteristics under various employment laws
const PROTECTED_CHARACTERISTICS = {
  gender: [
    'he should', 'she should', 'men are', 'women are', 'male candidates', 'female candidates',
    'maternal', 'paternal', 'pregnant', 'maternity'
  ],
  age: [
    'too old', 'too young', 'young enough', 'old enough', 'digital native', 'millennial',
    'boomer', 'gen z', 'retirement age', 'fresh out of college', 'years of experience required'
  ],
  race: [
    'ethnic', 'urban', 'articulate', 'well-spoken', 'foreign', 'exotic accent',
    'diversity hire', 'cultural background'
  ],
  religion: [
    'religious', 'secular', 'observant', 'faith', 'church', 'mosque', 'temple', 'sabbath'
  ],
  disability: [
    'disabled', 'handicapped', 'impaired', 'special needs', 'mental health issues',
    'physically able', 'able-bodied', 'wheelchair'
  ],
  nationality: [
    'foreigner', 'immigrant', 'native', 'citizen', 'accent', 'speaks english',
    'country of origin', 'visa status'
  ],
  socioeconomic: [
    'prestigious school', 'ivy league', 'state school', 'first generation',
    'well-connected', 'networking', 'country club'
  ]
};

// Flagged language patterns that may indicate bias
const BIAS_PATTERNS = {
  stereotyping: [
    'typically', 'usually', 'most people like that', 'those types', 'you know how they are',
    'they tend to', 'people from there'
  ],
  exclusionary: [
    'not a good fit', 'culture fit', 'wouldn\'t fit in', 'not our type', 'doesn\'t belong',
    'wouldn\'t mesh well', 'different background'
  ],
  subjective_negative: [
    'attitude problem', 'difficult personality', 'aggressive', 'emotional', 'unprofessional',
    'abrasive', 'not team player', 'doesn\'t play well', 'high maintenance'
  ],
  assumptions: [
    'probably can\'t', 'likely won\'t', 'wouldn\'t want to', 'might struggle with',
    'not suited for', 'better suited for', 'more appropriate for'
  ]
};

function detectBiasIndicators(prompt: string, response: string): BiasIndicator[] {
  const indicators: BiasIndicator[] = [];
  const lowerPrompt = prompt.toLowerCase();
  const lowerResponse = response.toLowerCase();
  const combinedText = `${lowerPrompt} ${lowerResponse}`;

  // Check for protected characteristic mentions in concerning contexts
  for (const [characteristic, patterns] of Object.entries(PROTECTED_CHARACTERISTICS)) {
    for (const pattern of patterns) {
      if (combinedText.includes(pattern)) {
        // Check if it's in a concerning context
        const contextStart = Math.max(0, combinedText.indexOf(pattern) - 50);
        const contextEnd = Math.min(combinedText.length, combinedText.indexOf(pattern) + pattern.length + 50);
        const context = combinedText.slice(contextStart, contextEnd);
        
        // Look for negative or decision-making context
        const concerningContext = [
          'should', 'must', 'recommend', 'suggest', 'better', 'worse', 'prefer',
          'avoid', 'reject', 'accept', 'hire', 'fire', 'promote', 'demote'
        ].some(word => context.includes(word));

        if (concerningContext) {
          indicators.push({
            type: 'protected_characteristic',
            pattern,
            severity: determineSeverity(characteristic, context),
            context,
            affectedCharacteristic: characteristic
          });
        }
      }
    }
  }

  // Check for bias patterns
  for (const [patternType, patterns] of Object.entries(BIAS_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerResponse.includes(pattern)) {
        const contextStart = Math.max(0, lowerResponse.indexOf(pattern) - 50);
        const contextEnd = Math.min(lowerResponse.length, lowerResponse.indexOf(pattern) + pattern.length + 50);
        const context = lowerResponse.slice(contextStart, contextEnd);

        indicators.push({
          type: patternType,
          pattern,
          severity: patternType === 'exclusionary' ? 'high' : 'medium',
          context
        });
      }
    }
  }

  return indicators;
}

function determineSeverity(characteristic: string, context: string): 'low' | 'medium' | 'high' | 'critical' {
  const highSeverityCharacteristics = ['race', 'gender', 'disability', 'religion'];
  const decisionWords = ['fire', 'terminate', 'reject', 'deny', 'refuse'];
  
  const hasDecisionWord = decisionWords.some(word => context.includes(word));
  const isHighSeverityCharacteristic = highSeverityCharacteristics.includes(characteristic);
  
  if (hasDecisionWord && isHighSeverityCharacteristic) {
    return 'critical';
  }
  if (hasDecisionWord || isHighSeverityCharacteristic) {
    return 'high';
  }
  return 'medium';
}

function determineOverallSeverity(indicators: BiasIndicator[]): 'low' | 'medium' | 'high' | 'critical' {
  if (indicators.length === 0) return 'low';
  
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  const maxSeverity = indicators.reduce((max, indicator) => {
    const currentIndex = severityOrder.indexOf(indicator.severity);
    const maxIndex = severityOrder.indexOf(max);
    return currentIndex > maxIndex ? indicator.severity : max;
  }, 'low' as 'low' | 'medium' | 'high' | 'critical');
  
  return maxSeverity;
}

function determinePrimaryBiasType(indicators: BiasIndicator[]): string {
  if (indicators.length === 0) return 'other';
  
  // Count occurrences of each affected characteristic
  const characteristicCounts: Record<string, number> = {};
  for (const indicator of indicators) {
    if (indicator.affectedCharacteristic) {
      characteristicCounts[indicator.affectedCharacteristic] = 
        (characteristicCounts[indicator.affectedCharacteristic] || 0) + 1;
    }
  }
  
  // Find the most common characteristic
  let maxCount = 0;
  let primaryType = 'other';
  for (const [type, count] of Object.entries(characteristicCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primaryType = type;
    }
  }
  
  return primaryType;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: BiasDetectionRequest = await req.json();
    const { 
      interactionLogId, 
      companyId, 
      promptContent, 
      responseContent,
      reportedBy,
      detectionMethod = 'automated'
    } = request;

    console.log('Running bias detection for interaction:', interactionLogId || 'direct check');

    // Detect bias indicators
    const indicators = detectBiasIndicators(promptContent, responseContent);
    
    const biasDetected = indicators.length > 0;
    const overallSeverity = determineOverallSeverity(indicators);
    const primaryBiasType = determinePrimaryBiasType(indicators);

    console.log('Bias detection result:', {
      detected: biasDetected,
      indicatorCount: indicators.length,
      severity: overallSeverity,
      primaryType: primaryBiasType
    });

    // If bias detected, create an incident record
    let incident = null;
    if (biasDetected) {
      const { data: incidentData, error: insertError } = await supabase
        .from('ai_bias_incidents')
        .insert({
          interaction_log_id: interactionLogId || null,
          company_id: companyId || null,
          detection_method: detectionMethod,
          bias_type: primaryBiasType,
          affected_characteristic: indicators[0]?.affectedCharacteristic || null,
          prompt_content: promptContent.substring(0, 1000), // Limit size
          response_content: responseContent.substring(0, 1000),
          evidence_description: JSON.stringify(indicators),
          severity: overallSeverity,
          remediation_status: 'open',
          reported_by: reportedBy || null
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating bias incident:', insertError);
      } else {
        incident = incidentData;
        console.log('Bias incident created:', incident.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        biasDetected,
        severity: overallSeverity,
        primaryBiasType,
        indicators,
        incident: incident ? {
          id: incident.id,
          status: incident.remediation_status
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Bias detection error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        biasDetected: false,
        severity: 'low',
        indicators: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
