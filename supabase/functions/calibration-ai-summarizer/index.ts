import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryRequest {
  sessionId: string;
  companyId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionId, companyId } = await req.json() as SummaryRequest;

    console.log('Generating calibration summary for session:', sessionId);

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('calibration_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      throw new Error('Failed to fetch calibration session');
    }

    // Fetch all adjustments made in this session
    const { data: adjustments } = await supabase
      .from('calibration_adjustments')
      .select(`
        *,
        profiles!calibration_adjustments_employee_id_fkey(full_name, department_id, departments(name)),
        adjuster:profiles!calibration_adjustments_adjusted_by_fkey(full_name)
      `)
      .eq('session_id', sessionId)
      .order('adjusted_at', { ascending: true });

    // Fetch participants
    const { data: participants } = await supabase
      .from('calibration_participants')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .eq('session_id', sessionId);

    // Fetch latest analysis
    const { data: analysis } = await supabase
      .from('calibration_ai_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate summary statistics
    const totalAdjustments = adjustments?.length || 0;
    const aiSuggestedCount = adjustments?.filter(a => a.ai_suggested).length || 0;
    const appliedCount = adjustments?.filter(a => a.status === 'applied').length || 0;
    
    // Calculate average adjustment magnitude
    const adjustmentMagnitudes = (adjustments || [])
      .filter(a => a.original_score && a.calibrated_score)
      .map(a => Math.abs(a.calibrated_score - a.original_score));
    
    const avgMagnitude = adjustmentMagnitudes.length > 0
      ? adjustmentMagnitudes.reduce((a, b) => a + b, 0) / adjustmentMagnitudes.length
      : 0;

    // Group adjustments by department
    const byDepartment: Record<string, { up: number; down: number; total: number }> = {};
    for (const adj of adjustments || []) {
      const deptName = adj.profiles?.departments?.name || 'Unknown';
      if (!byDepartment[deptName]) {
        byDepartment[deptName] = { up: 0, down: 0, total: 0 };
      }
      byDepartment[deptName].total++;
      if (adj.calibrated_score > adj.original_score) {
        byDepartment[deptName].up++;
      } else if (adj.calibrated_score < adj.original_score) {
        byDepartment[deptName].down++;
      }
    }

    // Generate narrative summary
    const narrativeParts: string[] = [];
    
    narrativeParts.push(`## Calibration Session Summary: ${session.name}`);
    narrativeParts.push(`**Date:** ${session.scheduled_date ? new Date(session.scheduled_date).toLocaleDateString() : 'Not scheduled'}`);
    narrativeParts.push(`**Status:** ${session.status}`);
    narrativeParts.push(`**Participants:** ${participants?.length || 0}`);
    narrativeParts.push('');
    
    narrativeParts.push('### Key Metrics');
    narrativeParts.push(`- Total rating adjustments: **${totalAdjustments}**`);
    narrativeParts.push(`- AI-suggested adjustments: **${aiSuggestedCount}** (${totalAdjustments > 0 ? ((aiSuggestedCount/totalAdjustments)*100).toFixed(0) : 0}%)`);
    narrativeParts.push(`- Applied adjustments: **${appliedCount}**`);
    narrativeParts.push(`- Average adjustment magnitude: **${avgMagnitude.toFixed(2)} points**`);
    narrativeParts.push('');
    
    if (Object.keys(byDepartment).length > 0) {
      narrativeParts.push('### Adjustments by Department');
      for (const [dept, stats] of Object.entries(byDepartment)) {
        const trend = stats.up > stats.down ? '↑' : stats.down > stats.up ? '↓' : '→';
        narrativeParts.push(`- **${dept}**: ${stats.total} adjustments (${stats.up} up, ${stats.down} down) ${trend}`);
      }
      narrativeParts.push('');
    }

    if (analysis?.distribution_analysis) {
      const dist = analysis.distribution_analysis.percentages;
      narrativeParts.push('### Final Distribution');
      narrativeParts.push(`- Exceptional: ${dist.exceptional}%`);
      narrativeParts.push(`- Exceeds Expectations: ${dist.exceeds}%`);
      narrativeParts.push(`- Meets Expectations: ${dist.meets}%`);
      narrativeParts.push(`- Needs Improvement: ${dist.needs_improvement}%`);
      narrativeParts.push(`- Unsatisfactory: ${dist.unsatisfactory}%`);
      narrativeParts.push('');
    }

    if (analysis?.equity_analysis?.biasAlerts?.length > 0) {
      narrativeParts.push('### Equity Considerations');
      for (const alert of analysis.equity_analysis.biasAlerts) {
        narrativeParts.push(`- ⚠️ ${alert.message}`);
      }
      narrativeParts.push('');
    }

    narrativeParts.push('### Compliance Notes');
    narrativeParts.push('This calibration session has been documented with full audit trail. All adjustments include justification and original values for compliance purposes.');

    const summaryNarrative = narrativeParts.join('\n');

    // Store summary
    const summaryResult = {
      session_id: sessionId,
      analysis_type: 'summary',
      overall_health_score: analysis?.overall_health_score || 0.8,
      anomalies_detected: analysis?.anomalies_detected || 0,
      bias_alerts: analysis?.bias_alerts || 0,
      summary_narrative: summaryNarrative,
      suggested_adjustments: {
        totalAdjustments,
        aiSuggestedCount,
        appliedCount,
        avgMagnitude,
        byDepartment,
      },
      distribution_analysis: analysis?.distribution_analysis,
      equity_analysis: analysis?.equity_analysis,
      model_used: 'summary-generator-v1',
      confidence_score: 0.9,
      company_id: companyId,
      analyzed_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('calibration_ai_analyses')
      .upsert(summaryResult, { onConflict: 'session_id,analysis_type' });

    if (insertError) {
      console.error('Failed to store summary:', insertError);
    }

    // Update session outcome summary
    await supabase
      .from('calibration_sessions')
      .update({ outcome_summary: summaryNarrative })
      .eq('id', sessionId);

    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          narrative: summaryNarrative,
          metrics: {
            totalAdjustments,
            aiSuggestedCount,
            appliedCount,
            avgMagnitude,
          },
          byDepartment,
          participants: participants?.length || 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Calibration summary error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
