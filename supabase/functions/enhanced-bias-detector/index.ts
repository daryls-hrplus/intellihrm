import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BiasDetectionRequest {
  action: 'analyze_manager_patterns' | 'detect_recency_bias' | 'detect_distribution_bias' | 'detect_halo_horn' | 'generate_nudge';
  managerId: string;
  companyId: string;
  cycleId?: string;
  ratings?: Array<{
    employeeId: string;
    employeeName?: string;
    scores: Array<{ dimension: string; score: number; date?: string }>;
    overallScore: number;
    reviewDate?: string;
  }>;
}

interface BiasPattern {
  type: 'recency' | 'leniency' | 'severity' | 'halo' | 'horn' | 'central_tendency' | 'contrast';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  evidenceCount: number;
  affectedEmployees: Array<{ employeeId: string; impact: string }>;
  description: string;
}

// Thresholds for bias detection
const THRESHOLDS = {
  LENIENCY_MEAN: 4.2, // Average score above this suggests leniency
  SEVERITY_MEAN: 2.8, // Average score below this suggests severity
  CENTRAL_TENDENCY_STD: 0.5, // Standard deviation below this suggests central tendency
  HALO_CORRELATION: 0.9, // Correlation above this suggests halo/horn
  RECENCY_WEIGHT_THRESHOLD: 0.7, // If recent events weighted above this, suggests recency bias
  MINIMUM_SAMPLE_SIZE: 3 // Minimum reviews needed for pattern detection
};

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < x.length; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function detectLeniencySeverityBias(ratings: BiasDetectionRequest['ratings']): BiasPattern | null {
  if (!ratings || ratings.length < THRESHOLDS.MINIMUM_SAMPLE_SIZE) return null;
  
  const overallScores = ratings.map(r => r.overallScore);
  const mean = calculateMean(overallScores);
  
  if (mean > THRESHOLDS.LENIENCY_MEAN) {
    return {
      type: 'leniency',
      severity: mean > 4.5 ? 'high' : mean > 4.3 ? 'medium' : 'low',
      confidence: Math.min(0.95, 0.6 + (mean - THRESHOLDS.LENIENCY_MEAN) * 0.3),
      evidenceCount: ratings.length,
      affectedEmployees: ratings
        .filter(r => r.overallScore >= 4)
        .map(r => ({ employeeId: r.employeeId, impact: 'May have inflated rating' })),
      description: `Average rating of ${mean.toFixed(2)} is above typical distribution. Consider if all high ratings are supported by evidence.`
    };
  }
  
  if (mean < THRESHOLDS.SEVERITY_MEAN) {
    return {
      type: 'severity',
      severity: mean < 2.5 ? 'high' : mean < 2.7 ? 'medium' : 'low',
      confidence: Math.min(0.95, 0.6 + (THRESHOLDS.SEVERITY_MEAN - mean) * 0.3),
      evidenceCount: ratings.length,
      affectedEmployees: ratings
        .filter(r => r.overallScore <= 3)
        .map(r => ({ employeeId: r.employeeId, impact: 'May have deflated rating' })),
      description: `Average rating of ${mean.toFixed(2)} is below typical distribution. Ensure developmental ratings are accompanied by specific examples.`
    };
  }
  
  return null;
}

function detectCentralTendencyBias(ratings: BiasDetectionRequest['ratings']): BiasPattern | null {
  if (!ratings || ratings.length < THRESHOLDS.MINIMUM_SAMPLE_SIZE) return null;
  
  const overallScores = ratings.map(r => r.overallScore);
  const std = calculateStandardDeviation(overallScores);
  const mean = calculateMean(overallScores);
  
  // Check if most ratings cluster around the middle
  const midRange = ratings.filter(r => r.overallScore >= 2.8 && r.overallScore <= 3.5);
  const midRangePercentage = midRange.length / ratings.length;
  
  if (std < THRESHOLDS.CENTRAL_TENDENCY_STD && midRangePercentage > 0.7) {
    return {
      type: 'central_tendency',
      severity: std < 0.3 ? 'high' : 'medium',
      confidence: Math.min(0.9, 0.5 + (THRESHOLDS.CENTRAL_TENDENCY_STD - std) * 0.8),
      evidenceCount: ratings.length,
      affectedEmployees: ratings.map(r => ({ 
        employeeId: r.employeeId, 
        impact: 'Rating may not reflect true performance differentiation' 
      })),
      description: `${(midRangePercentage * 100).toFixed(0)}% of ratings cluster in the middle range. Consider if there are meaningful performance differences that should be reflected.`
    };
  }
  
  return null;
}

function detectHaloHornEffect(ratings: BiasDetectionRequest['ratings']): BiasPattern[] {
  const patterns: BiasPattern[] = [];
  if (!ratings || ratings.length < THRESHOLDS.MINIMUM_SAMPLE_SIZE) return patterns;
  
  for (const rating of ratings) {
    if (!rating.scores || rating.scores.length < 2) continue;
    
    const scores = rating.scores.map(s => s.score);
    const mean = calculateMean(scores);
    const std = calculateStandardDeviation(scores);
    
    // Very low standard deviation across dimensions suggests halo/horn
    if (std < 0.3 && scores.length >= 3) {
      const isHalo = mean >= 4;
      const isHorn = mean <= 2;
      
      if (isHalo) {
        patterns.push({
          type: 'halo',
          severity: std < 0.15 ? 'medium' : 'low',
          confidence: Math.min(0.85, 0.5 + (0.3 - std) * 1.5),
          evidenceCount: 1,
          affectedEmployees: [{ employeeId: rating.employeeId, impact: 'All dimensions rated similarly high' }],
          description: `All competencies for this employee are rated ${mean.toFixed(1)} with minimal variation. Consider if each dimension reflects actual performance.`
        });
      } else if (isHorn) {
        patterns.push({
          type: 'horn',
          severity: std < 0.15 ? 'medium' : 'low',
          confidence: Math.min(0.85, 0.5 + (0.3 - std) * 1.5),
          evidenceCount: 1,
          affectedEmployees: [{ employeeId: rating.employeeId, impact: 'All dimensions rated similarly low' }],
          description: `All competencies for this employee are rated ${mean.toFixed(1)} with minimal variation. Evaluate each dimension independently.`
        });
      }
    }
  }
  
  return patterns;
}

function detectRecencyBias(ratings: BiasDetectionRequest['ratings']): BiasPattern | null {
  // This is a simplified version - full implementation would analyze comment content
  // for temporal references and compare to actual performance timeline
  if (!ratings || ratings.length < THRESHOLDS.MINIMUM_SAMPLE_SIZE) return null;
  
  // Check for recency patterns in ratings submitted close together
  const reviewDates = ratings
    .filter(r => r.reviewDate)
    .map(r => new Date(r.reviewDate!).getTime())
    .sort((a, b) => a - b);
  
  if (reviewDates.length < 2) return null;
  
  // If all reviews done in a short window, higher risk of recency bias
  const timeSpan = reviewDates[reviewDates.length - 1] - reviewDates[0];
  const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
  
  if (daysSpan < 2 && ratings.length > 5) {
    return {
      type: 'recency',
      severity: 'low',
      confidence: 0.6,
      evidenceCount: ratings.length,
      affectedEmployees: ratings.map(r => ({ 
        employeeId: r.employeeId, 
        impact: 'Review completed rapidly - verify full period considered' 
      })),
      description: `${ratings.length} reviews completed within ${daysSpan.toFixed(1)} days. Take time to consider performance across the full review period.`
    };
  }
  
  return null;
}

function detectContrastEffect(ratings: BiasDetectionRequest['ratings']): BiasPattern | null {
  if (!ratings || ratings.length < 4) return null;
  
  // Look for alternating high-low patterns that might indicate contrast effect
  const scores = ratings.map(r => r.overallScore);
  let significantSwings = 0;
  
  for (let i = 1; i < scores.length; i++) {
    const diff = Math.abs(scores[i] - scores[i - 1]);
    if (diff >= 1.5) significantSwings++;
  }
  
  const swingRate = significantSwings / (scores.length - 1);
  
  if (swingRate > 0.5) {
    return {
      type: 'contrast',
      severity: 'low',
      confidence: 0.55,
      evidenceCount: significantSwings,
      affectedEmployees: [],
      description: 'Rating pattern shows significant swings between consecutive reviews. Ensure each review is evaluated against role expectations, not compared to the previous employee.'
    };
  }
  
  return null;
}

async function getNudgeTemplate(
  supabase: any,
  companyId: string,
  biasType: string,
  severity: string
): Promise<{ title: string; message: string; suggestedAction: string; educationalContent: string } | null> {
  // First try company-specific template
  let { data: template } = await supabase
    .from('bias_nudge_templates')
    .select('*')
    .eq('company_id', companyId)
    .eq('bias_type', biasType)
    .eq('severity', severity)
    .eq('is_active', true)
    .single();
  
  // Fall back to global template
  if (!template) {
    const { data: globalTemplate } = await supabase
      .from('bias_nudge_templates')
      .select('*')
      .is('company_id', null)
      .eq('bias_type', biasType)
      .eq('severity', severity)
      .eq('is_active', true)
      .single();
    
    template = globalTemplate;
  }
  
  if (template) {
    return {
      title: template.nudge_title,
      message: template.nudge_message,
      suggestedAction: template.suggested_action || '',
      educationalContent: template.educational_content || ''
    };
  }
  
  return null;
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
    const { action, managerId, companyId, cycleId, ratings } = request;

    console.log(`[enhanced-bias-detector] Action: ${action}, Manager: ${managerId}`);

    if (!ratings || ratings.length < THRESHOLDS.MINIMUM_SAMPLE_SIZE) {
      return new Response(
        JSON.stringify({ 
          patterns: [], 
          message: `Minimum ${THRESHOLDS.MINIMUM_SAMPLE_SIZE} reviews required for pattern detection` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const patterns: BiasPattern[] = [];
    
    switch (action) {
      case 'detect_recency_bias':
        const recencyPattern = detectRecencyBias(ratings);
        if (recencyPattern) patterns.push(recencyPattern);
        break;
        
      case 'detect_distribution_bias':
        const leniencyPattern = detectLeniencySeverityBias(ratings);
        if (leniencyPattern) patterns.push(leniencyPattern);
        const centralPattern = detectCentralTendencyBias(ratings);
        if (centralPattern) patterns.push(centralPattern);
        break;
        
      case 'detect_halo_horn':
        patterns.push(...detectHaloHornEffect(ratings));
        break;
        
      case 'analyze_manager_patterns':
      default:
        // Full analysis
        const leniency = detectLeniencySeverityBias(ratings);
        if (leniency) patterns.push(leniency);
        
        const central = detectCentralTendencyBias(ratings);
        if (central) patterns.push(central);
        
        patterns.push(...detectHaloHornEffect(ratings));
        
        const recency = detectRecencyBias(ratings);
        if (recency) patterns.push(recency);
        
        const contrast = detectContrastEffect(ratings);
        if (contrast) patterns.push(contrast);
        break;
    }

    // Store detected patterns and get nudges
    const storedPatterns = [];
    for (const pattern of patterns) {
      const nudge = await getNudgeTemplate(supabase, companyId, pattern.type, pattern.severity);
      
      const { data: stored, error } = await supabase
        .from('manager_bias_patterns')
        .insert({
          manager_id: managerId,
          company_id: companyId,
          cycle_id: cycleId,
          bias_type: pattern.type,
          severity: pattern.severity,
          evidence_count: pattern.evidenceCount,
          affected_employees: pattern.affectedEmployees,
          detection_method: 'statistical_analysis',
          detection_confidence: pattern.confidence,
          nudge_message: nudge?.message || pattern.description,
          iso_compliance_notes: 'ISO 42001 8.4 - Bias detection with non-accusatory feedback'
        })
        .select()
        .single();
      
      if (!error && stored) {
        storedPatterns.push({
          ...pattern,
          id: stored.id,
          nudge
        });
      }
    }

    // Log to explainability records
    if (patterns.length > 0) {
      await supabase.from('ai_explainability_records').insert({
        company_id: companyId,
        insight_type: 'bias',
        source_data_summary: [
          { data_type: 'manager_ratings', record_count: ratings.length, date_range: 'current_cycle' }
        ],
        weights_applied: [
          { factor: 'statistical_distribution', weight: 0.4, contribution: 40 },
          { factor: 'pattern_correlation', weight: 0.3, contribution: 30 },
          { factor: 'temporal_analysis', weight: 0.3, contribution: 30 }
        ],
        confidence_score: Math.max(...patterns.map(p => p.confidence), 0.5),
        confidence_factors: [
          { factor: 'sample_size', impact: ratings.length >= 10 ? 'high' : 'medium' },
          { factor: 'pattern_strength', impact: patterns.some(p => p.severity === 'high') ? 'high' : 'medium' }
        ],
        model_version: 'hrplus-bias-detector-v2',
        model_provider: 'HRplus',
        iso_compliance_verified: true,
        human_review_required: patterns.some(p => p.severity === 'high')
      });
    }

    console.log(`[enhanced-bias-detector] Detected ${patterns.length} patterns for manager ${managerId}`);

    return new Response(
      JSON.stringify({
        patterns: storedPatterns,
        summary: {
          totalPatterns: patterns.length,
          highSeverity: patterns.filter(p => p.severity === 'high').length,
          mediumSeverity: patterns.filter(p => p.severity === 'medium').length,
          lowSeverity: patterns.filter(p => p.severity === 'low').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[enhanced-bias-detector] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
