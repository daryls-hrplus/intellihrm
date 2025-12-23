import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BiasPattern {
  bias_type: string;
  count: number;
  affected_characteristics: string[];
  severity_distribution: Record<string, number>;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface WeeklyAnalysis {
  total_bias_incidents: number;
  resolved_incidents: number;
  patterns: BiasPattern[];
  high_risk_areas: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Log job start
  const { data: jobRun, error: jobRunError } = await supabase
    .from('ai_scheduled_job_runs')
    .insert({
      job_name: 'Weekly Bias Analysis',
      job_type: 'weekly',
      status: 'running',
      triggered_by: req.headers.get('x-triggered-by') || 'scheduled'
    })
    .select()
    .single();

  if (jobRunError) {
    console.error('Error creating job run record:', jobRunError);
  }

  try {
    console.log('Starting weekly AI bias pattern analysis...');
    
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get all companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name');

    if (companyError) {
      console.error('Error fetching companies:', companyError);
      throw companyError;
    }

    const results = [];

    for (const company of companies || []) {
      console.log(`Analyzing bias patterns for: ${company.name}`);

      // Get this week's bias incidents
      const { data: currentWeekBias, error: currentError } = await supabase
        .from('ai_bias_incidents')
        .select('*')
        .eq('company_id', company.id)
        .gte('created_at', weekAgo.toISOString())
        .lt('created_at', today.toISOString());

      if (currentError) {
        console.error(`Error fetching current week bias for ${company.id}:`, currentError);
        continue;
      }

      // Get previous week's bias incidents for trend comparison
      const { data: previousWeekBias, error: previousError } = await supabase
        .from('ai_bias_incidents')
        .select('*')
        .eq('company_id', company.id)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());

      if (previousError) {
        console.error(`Error fetching previous week bias for ${company.id}:`, previousError);
        continue;
      }

      // Analyze patterns by bias type
      const biasTypeMap = new Map<string, {
        count: number;
        characteristics: Set<string>;
        severities: Record<string, number>;
        previousCount: number;
      }>();

      // Process current week
      for (const incident of currentWeekBias || []) {
        const existing = biasTypeMap.get(incident.bias_type) || {
          count: 0,
          characteristics: new Set<string>(),
          severities: {},
          previousCount: 0
        };
        
        existing.count++;
        if (incident.affected_characteristic) {
          existing.characteristics.add(incident.affected_characteristic);
        }
        existing.severities[incident.severity || 'unknown'] = 
          (existing.severities[incident.severity || 'unknown'] || 0) + 1;
        
        biasTypeMap.set(incident.bias_type, existing);
      }

      // Process previous week for trends
      for (const incident of previousWeekBias || []) {
        const existing = biasTypeMap.get(incident.bias_type);
        if (existing) {
          existing.previousCount++;
        }
      }

      // Build patterns array
      const patterns: BiasPattern[] = [];
      for (const [biasType, data] of biasTypeMap) {
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (data.count > data.previousCount * 1.2) {
          trend = 'increasing';
        } else if (data.count < data.previousCount * 0.8) {
          trend = 'decreasing';
        }

        patterns.push({
          bias_type: biasType,
          count: data.count,
          affected_characteristics: Array.from(data.characteristics),
          severity_distribution: data.severities,
          trend
        });
      }

      // Sort by count descending
      patterns.sort((a, b) => b.count - a.count);

      // Identify high risk areas
      const highRiskAreas: string[] = [];
      for (const pattern of patterns) {
        if (pattern.trend === 'increasing' || pattern.severity_distribution['critical'] > 0) {
          highRiskAreas.push(pattern.bias_type);
        }
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (patterns.some(p => p.trend === 'increasing')) {
        recommendations.push('Review AI model prompts for increasing bias patterns');
      }
      if (highRiskAreas.length > 0) {
        recommendations.push(`Focus bias mitigation on: ${highRiskAreas.join(', ')}`);
      }
      if (patterns.some(p => p.affected_characteristics.length > 2)) {
        recommendations.push('Consider additional diversity training data for affected characteristics');
      }
      const unresolvedCount = (currentWeekBias || []).filter(b => 
        b.remediation_status !== 'resolved'
      ).length;
      if (unresolvedCount > 5) {
        recommendations.push(`${unresolvedCount} bias incidents require remediation attention`);
      }

      const analysis: WeeklyAnalysis = {
        total_bias_incidents: currentWeekBias?.length || 0,
        resolved_incidents: (currentWeekBias || []).filter(b => 
          b.remediation_status === 'resolved'
        ).length,
        patterns,
        high_risk_areas: highRiskAreas,
        recommendations
      };

      // Store weekly analysis as governance metric
      const { error: insertError } = await supabase
        .from('ai_governance_metrics')
        .insert({
          company_id: company.id,
          metric_date: today.toISOString().split('T')[0],
          metric_type: 'weekly_bias_analysis',
          bias_incidents_detected: analysis.total_bias_incidents,
          compliance_rate: analysis.total_bias_incidents > 0 
            ? (analysis.resolved_incidents / analysis.total_bias_incidents) * 100 
            : 100
        });

      if (insertError) {
        console.error(`Error inserting weekly analysis for ${company.id}:`, insertError);
      }

      console.log(`Weekly analysis for ${company.name}:`, analysis);
      results.push({ company_id: company.id, company_name: company.name, analysis });

      // Create reminders for high risk patterns
      if (highRiskAreas.length > 0) {
        await supabase.from('employee_reminders').insert({
          company_id: company.id,
          reminder_type: 'ai_bias_pattern',
          title: 'AI Bias Pattern Alert',
          description: `Weekly analysis detected concerning bias patterns in: ${highRiskAreas.join(', ')}. ${recommendations[0] || ''}`,
          priority: 'high',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
          status: 'pending'
        });
      }
    }

    console.log('Weekly AI bias pattern analysis completed');

    // Update job run record
    if (jobRun?.id) {
      await supabase
        .from('ai_scheduled_job_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          companies_processed: results.length,
          metrics_generated: { week_ending: today.toISOString().split('T')[0], results_count: results.length }
        })
        .eq('id', jobRun.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        week_ending: today.toISOString().split('T')[0],
        companies_analyzed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in weekly bias analysis:', error);

    // Update job run record with failure
    if (jobRun?.id) {
      await supabase
        .from('ai_scheduled_job_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq('id', jobRun.id);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
