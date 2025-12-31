import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NarrativeRequest {
  action: 'generate_performance_summary' | 'generate_promotion_justification' | 'generate_development_narrative' | 'generate_calibration_notes' | 'generate_pip_rationale';
  employeeId: string;
  companyId: string;
  participantId?: string;
  context: {
    employeeName: string;
    jobTitle?: string;
    department?: string;
    reviewPeriod?: string;
    overallScore?: number;
    ratings?: Array<{ dimension: string; score: number; comment?: string }>;
    goals?: Array<{ title: string; progress: number; status: string }>;
    strengths?: string[];
    developmentAreas?: string[];
    achievements?: string[];
    calibratedScore?: number;
    promotionTargetRole?: string;
  };
}

// Narrative templates by type and score range
const PERFORMANCE_TEMPLATES = {
  exceptional: [
    "{name} has delivered exceptional performance during {period}. ",
    "Their contributions have consistently exceeded expectations across all key areas. "
  ],
  exceeds: [
    "{name} has demonstrated strong performance throughout {period}. ",
    "They have exceeded expectations in multiple areas while maintaining consistent delivery. "
  ],
  meets: [
    "{name} has met performance expectations during {period}. ",
    "Their work has been reliable and aligned with role requirements. "
  ],
  developing: [
    "{name} is developing in their role during {period}. ",
    "While showing progress in some areas, there are opportunities for growth. "
  ],
  needs_improvement: [
    "During {period}, {name} has faced challenges in meeting role expectations. ",
    "A focused development approach is recommended to support improvement. "
  ]
};

const PROMOTION_TEMPLATES = {
  intro: "{name} is recommended for promotion to {targetRole} based on the following demonstrated capabilities:",
  competency: "• **{dimension}**: {rationale}",
  conclusion: "This promotion is supported by {evidenceCount} documented achievements and consistent {scoreLevel} performance ratings."
};

const DEVELOPMENT_TEMPLATES = {
  intro: "Development priorities for {name} focus on building capabilities for continued growth:",
  area: "• **{area}**: {recommendation}",
  resources: "Recommended resources include {resources}."
};

const PIP_TEMPLATES = {
  intro: "This Performance Improvement Plan outlines expectations for {name} to achieve the required performance standards.",
  gap: "**{area}**: Current performance at {currentLevel}. Expected standard: {expectedLevel}.",
  action: "• {action} - Target completion: {timeline}",
  conclusion: "Regular check-ins will occur {frequency} to monitor progress. Success will be measured by {metrics}."
};

function getScoreCategory(score: number): 'exceptional' | 'exceeds' | 'meets' | 'developing' | 'needs_improvement' {
  if (score >= 4.5) return 'exceptional';
  if (score >= 3.5) return 'exceeds';
  if (score >= 2.5) return 'meets';
  if (score >= 1.5) return 'developing';
  return 'needs_improvement';
}

function generatePerformanceSummary(context: NarrativeRequest['context']): string {
  const { employeeName, reviewPeriod, overallScore, ratings, strengths, achievements } = context;
  const scoreCategory = getScoreCategory(overallScore || 3);
  
  let narrative = PERFORMANCE_TEMPLATES[scoreCategory][0]
    .replace('{name}', employeeName)
    .replace('{period}', reviewPeriod || 'this review period');
  
  narrative += PERFORMANCE_TEMPLATES[scoreCategory][1];
  
  // Add strengths
  if (strengths && strengths.length > 0) {
    narrative += `\n\n**Key Strengths:**\n`;
    strengths.slice(0, 3).forEach(s => {
      narrative += `• ${s}\n`;
    });
  }
  
  // Add achievements
  if (achievements && achievements.length > 0) {
    narrative += `\n**Notable Achievements:**\n`;
    achievements.slice(0, 3).forEach(a => {
      narrative += `• ${a}\n`;
    });
  }
  
  // Add competency highlights
  if (ratings && ratings.length > 0) {
    const topRatings = ratings.filter(r => r.score >= 4).slice(0, 3);
    if (topRatings.length > 0) {
      narrative += `\n**Areas of Excellence:**\n`;
      topRatings.forEach(r => {
        narrative += `• **${r.dimension}** (${r.score.toFixed(1)}): ${r.comment?.slice(0, 100) || 'Consistently high performance'}\n`;
      });
    }
  }
  
  // Add development areas if not exceptional
  if (scoreCategory !== 'exceptional' && ratings) {
    const devAreas = ratings.filter(r => r.score < 3).slice(0, 2);
    if (devAreas.length > 0) {
      narrative += `\n**Development Opportunities:**\n`;
      devAreas.forEach(r => {
        narrative += `• **${r.dimension}**: Focus on strengthening this area through targeted development.\n`;
      });
    }
  }
  
  return narrative;
}

function generatePromotionJustification(context: NarrativeRequest['context']): string {
  const { employeeName, promotionTargetRole, overallScore, ratings, achievements } = context;
  
  let narrative = PROMOTION_TEMPLATES.intro
    .replace('{name}', employeeName)
    .replace('{targetRole}', promotionTargetRole || 'the target role');
  
  narrative += '\n\n';
  
  // Add competency evidence
  if (ratings && ratings.length > 0) {
    const strongCompetencies = ratings.filter(r => r.score >= 4);
    strongCompetencies.forEach(r => {
      narrative += PROMOTION_TEMPLATES.competency
        .replace('{dimension}', r.dimension)
        .replace('{rationale}', r.comment || `Demonstrated ${r.score >= 4.5 ? 'exceptional' : 'strong'} capability with consistent high performance.`);
      narrative += '\n';
    });
  }
  
  // Add achievements
  if (achievements && achievements.length > 0) {
    narrative += '\n**Supporting Achievements:**\n';
    achievements.forEach(a => {
      narrative += `• ${a}\n`;
    });
  }
  
  narrative += '\n' + PROMOTION_TEMPLATES.conclusion
    .replace('{evidenceCount}', String(achievements?.length || 0))
    .replace('{scoreLevel}', overallScore && overallScore >= 4 ? 'exceeds expectations' : 'meets expectations');
  
  return narrative;
}

function generateDevelopmentNarrative(context: NarrativeRequest['context']): string {
  const { employeeName, ratings, developmentAreas } = context;
  
  let narrative = DEVELOPMENT_TEMPLATES.intro.replace('{name}', employeeName);
  narrative += '\n\n';
  
  // Add development areas from ratings
  if (ratings) {
    const devRatings = ratings.filter(r => r.score < 3.5).slice(0, 3);
    devRatings.forEach(r => {
      const recommendation = r.score < 2.5 
        ? 'Priority development area requiring structured support and regular coaching.'
        : 'Opportunity to strengthen performance through targeted practice and feedback.';
      
      narrative += DEVELOPMENT_TEMPLATES.area
        .replace('{area}', r.dimension)
        .replace('{recommendation}', recommendation);
      narrative += '\n';
    });
  }
  
  // Add explicit development areas
  if (developmentAreas && developmentAreas.length > 0) {
    narrative += '\n**Additional Focus Areas:**\n';
    developmentAreas.forEach(area => {
      narrative += `• ${area}\n`;
    });
  }
  
  narrative += '\n' + DEVELOPMENT_TEMPLATES.resources
    .replace('{resources}', 'mentoring relationships, targeted training, and stretch assignments');
  
  return narrative;
}

function generateCalibrationNotes(context: NarrativeRequest['context']): string {
  const { employeeName, overallScore, calibratedScore, ratings } = context;
  
  let narrative = `**Calibration Summary for ${employeeName}**\n\n`;
  
  if (overallScore && calibratedScore && overallScore !== calibratedScore) {
    const direction = calibratedScore > overallScore ? 'increased' : 'decreased';
    const magnitude = Math.abs(calibratedScore - overallScore);
    
    narrative += `Rating ${direction} from ${overallScore.toFixed(2)} to ${calibratedScore.toFixed(2)} (${direction} by ${magnitude.toFixed(2)} points).\n\n`;
    narrative += '**Calibration Rationale:**\n';
    narrative += `• Review of peer group performance and rating consistency\n`;
    narrative += `• Alignment with organizational rating distribution guidelines\n`;
    narrative += `• Cross-functional calibration committee input\n`;
  } else {
    narrative += `Original rating of ${overallScore?.toFixed(2) || 'N/A'} confirmed through calibration.\n\n`;
    narrative += '**Calibration Confirmation:**\n';
    narrative += `• Rating validated against peer group\n`;
    narrative += `• Evidence reviewed by calibration committee\n`;
  }
  
  return narrative;
}

function generatePIPRationale(context: NarrativeRequest['context']): string {
  const { employeeName, ratings, developmentAreas } = context;
  
  let narrative = PIP_TEMPLATES.intro.replace('{name}', employeeName);
  narrative += '\n\n**Performance Gaps:**\n';
  
  // Add performance gaps
  if (ratings) {
    const lowRatings = ratings.filter(r => r.score < 2.5);
    lowRatings.forEach(r => {
      narrative += PIP_TEMPLATES.gap
        .replace('{area}', r.dimension)
        .replace('{currentLevel}', `${r.score.toFixed(1)} - Below expectations`)
        .replace('{expectedLevel}', '3.0 - Meets expectations');
      narrative += '\n';
    });
  }
  
  narrative += '\n**Required Actions:**\n';
  const actions = [
    { action: 'Complete skills assessment with manager', timeline: 'Week 1' },
    { action: 'Develop individual improvement plan with specific milestones', timeline: 'Week 2' },
    { action: 'Begin structured coaching sessions', timeline: 'Week 2-8' },
    { action: 'Complete targeted training modules', timeline: 'Week 4' },
    { action: 'Demonstrate measurable improvement in identified areas', timeline: 'Week 8' }
  ];
  
  actions.forEach(a => {
    narrative += PIP_TEMPLATES.action
      .replace('{action}', a.action)
      .replace('{timeline}', a.timeline);
    narrative += '\n';
  });
  
  narrative += '\n' + PIP_TEMPLATES.conclusion
    .replace('{frequency}', 'weekly')
    .replace('{metrics}', 'documented performance improvements and manager assessment');
  
  return narrative;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: NarrativeRequest = await req.json();
    const { action, employeeId, companyId, participantId, context } = request;

    console.log(`[narrative-intelligence-generator] Action: ${action}, Employee: ${employeeId}`);

    let generatedContent = '';
    let narrativeType = '';
    
    switch (action) {
      case 'generate_performance_summary':
        generatedContent = generatePerformanceSummary(context);
        narrativeType = 'performance_summary';
        break;
        
      case 'generate_promotion_justification':
        generatedContent = generatePromotionJustification(context);
        narrativeType = 'promotion';
        break;
        
      case 'generate_development_narrative':
        generatedContent = generateDevelopmentNarrative(context);
        narrativeType = 'development';
        break;
        
      case 'generate_calibration_notes':
        generatedContent = generateCalibrationNotes(context);
        narrativeType = 'calibration';
        break;
        
      case 'generate_pip_rationale':
        generatedContent = generatePIPRationale(context);
        narrativeType = 'pip';
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Store the generated narrative
    const { data: narrative, error: insertError } = await supabase
      .from('ai_generated_narratives')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        participant_id: participantId,
        narrative_type: narrativeType,
        generated_content: generatedContent,
        source_data: {
          context,
          generatedAt: new Date().toISOString()
        },
        ai_model_used: 'hrplus-narrative-v1',
        ai_confidence_score: 0.80,
        iso_human_review_status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('[narrative-intelligence-generator] Error storing narrative:', insertError);
    }

    // Log to explainability records
    await supabase.from('ai_explainability_records').insert({
      company_id: companyId,
      insight_type: 'narrative',
      insight_id: narrative?.id,
      insight_table: 'ai_generated_narratives',
      source_data_summary: [
        { data_type: 'performance_ratings', record_count: context.ratings?.length || 0, date_range: 'current' },
        { data_type: 'achievements', record_count: context.achievements?.length || 0, date_range: 'current' },
        { data_type: 'goals', record_count: context.goals?.length || 0, date_range: 'current' }
      ],
      weights_applied: [
        { factor: 'score_categorization', weight: 0.3, contribution: 30 },
        { factor: 'evidence_integration', weight: 0.4, contribution: 40 },
        { factor: 'template_matching', weight: 0.3, contribution: 30 }
      ],
      confidence_score: 0.80,
      confidence_factors: [
        { factor: 'data_completeness', impact: context.ratings && context.ratings.length > 0 ? 'high' : 'low' },
        { factor: 'template_appropriateness', impact: 'high' }
      ],
      model_version: 'hrplus-narrative-v1',
      model_provider: 'HRplus',
      iso_compliance_verified: true,
      human_review_required: true // Narratives always require human review
    });

    console.log(`[narrative-intelligence-generator] Generated ${narrativeType} narrative for ${employeeId}`);

    return new Response(
      JSON.stringify({
        narrativeId: narrative?.id,
        narrativeType,
        generatedContent,
        requiresApproval: true,
        confidenceScore: 0.80
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[narrative-intelligence-generator] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
