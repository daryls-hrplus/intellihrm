import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, data, companyId } = await req.json();
    
    // context: 'hiring', 'leave', 'benefits', etc.
    // data: relevant data to check against rules (e.g., { age: 17, role: 'engineer' })
    
    if (!context) {
      return new Response(JSON.stringify({ error: 'Context is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get applicable rules for this context
    const { data: rules, error } = await supabase
      .from('policy_rules')
      .select(`
        *,
        policy_documents!inner (
          title,
          is_global,
          company_id,
          is_active
        )
      `)
      .eq('rule_context', context)
      .eq('is_active', true)
      .eq('policy_documents.is_active', true);

    if (error) {
      throw new Error(`Failed to fetch rules: ${error.message}`);
    }

    // Filter rules by company (global rules + company-specific rules)
    const applicableRules = rules?.filter(rule => 
      rule.policy_documents.is_global || 
      rule.policy_documents.company_id === companyId
    ) || [];

    const violations: any[] = [];
    const warnings: any[] = [];

    // Check each rule against the provided data
    for (const rule of applicableRules) {
      const condition = rule.rule_condition;
      let violated = false;
      let message = rule.rule_description;

      // Age restriction check
      if (rule.rule_type === 'age_restriction' && data.age !== undefined) {
        if (condition.min_age && data.age < condition.min_age) {
          violated = true;
          message = `Minimum age requirement of ${condition.min_age} not met (provided: ${data.age})`;
        }
        if (condition.max_age && data.age > condition.max_age) {
          violated = true;
          message = `Maximum age limit of ${condition.max_age} exceeded (provided: ${data.age})`;
        }
      }

      // Document required check
      if (rule.rule_type === 'document_required' && data.documents !== undefined) {
        const requiredDocs = condition.required_documents || [];
        const missingDocs = requiredDocs.filter((doc: string) => !data.documents.includes(doc));
        if (missingDocs.length > 0) {
          violated = true;
          message = `Required documents missing: ${missingDocs.join(', ')}`;
        }
      }

      // Time limit check
      if (rule.rule_type === 'time_limit' && data.days !== undefined) {
        if (condition.min_days && data.days < condition.min_days) {
          violated = true;
          message = `Minimum notice period of ${condition.min_days} days required (provided: ${data.days})`;
        }
        if (condition.max_days && data.days > condition.max_days) {
          violated = true;
          message = `Maximum duration of ${condition.max_days} days exceeded (provided: ${data.days})`;
        }
      }

      // Qualification required check
      if (rule.rule_type === 'qualification_required' && data.qualifications !== undefined) {
        const requiredQuals = condition.required_qualifications || [];
        const missingQuals = requiredQuals.filter((qual: string) => 
          !data.qualifications.some((q: string) => q.toLowerCase().includes(qual.toLowerCase()))
        );
        if (missingQuals.length > 0) {
          violated = true;
          message = `Required qualifications missing: ${missingQuals.join(', ')}`;
        }
      }

      // Approval required check
      if (rule.rule_type === 'approval_required') {
        const threshold = condition.threshold;
        if (threshold && data.amount !== undefined && data.amount > threshold) {
          violated = true;
          message = `Amounts over ${threshold} require additional approval (requested: ${data.amount})`;
        }
      }

      if (violated) {
        const violation = {
          rule_id: rule.id,
          rule_type: rule.rule_type,
          severity: rule.severity,
          message,
          document_title: rule.policy_documents.title,
          can_override: rule.severity !== 'error'
        };

        if (rule.severity === 'error') {
          violations.push(violation);
        } else {
          warnings.push(violation);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      context,
      violations,
      warnings,
      total_rules_checked: applicableRules.length,
      has_blocking_violations: violations.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking policy rules:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
