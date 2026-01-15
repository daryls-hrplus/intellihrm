import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StepMapping {
  order: number;
  area: string;
  adminRoute?: string;
  importType?: string;
  isRequired?: boolean;
  estimatedMinutes?: number;
  subSection?: string;
  sourceManual?: string;
  sourceSection?: string;
  isGlobal?: boolean;
}

interface MigrationRequest {
  mappings: Record<string, StepMapping[]>;
  options?: {
    dryRun?: boolean;
    overwriteExisting?: boolean;
    matchFeatureCodes?: boolean;
  };
}

interface MigrationResult {
  success: boolean;
  dryRun: boolean;
  summary: {
    totalTasks: number;
    inserted: number;
    skipped: number;
    matched: number;
    errors: number;
  };
  details: Array<{
    phaseId: string;
    stepOrder: number;
    area: string;
    action: 'inserted' | 'skipped' | 'matched' | 'error';
    featureCode?: string;
    message?: string;
  }>;
  errors: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { mappings, options = {} }: MigrationRequest = await req.json();
    
    const dryRun = options.dryRun ?? false;
    const overwriteExisting = options.overwriteExisting ?? false;
    const matchFeatureCodes = options.matchFeatureCodes ?? true;

    const result: MigrationResult = {
      success: true,
      dryRun,
      summary: {
        totalTasks: 0,
        inserted: 0,
        skipped: 0,
        matched: 0,
        errors: 0
      },
      details: [],
      errors: []
    };

    // Get existing feature codes from database for matching
    let featureCodeMap = new Map<string, string>();
    if (matchFeatureCodes) {
      const { data: features, error: featuresError } = await supabase
        .from('application_features')
        .select('feature_code, route_path');
      
      if (!featuresError && features) {
        // Create a map of route_path -> feature_code for matching
        features.forEach(f => {
          if (f.route_path) {
            featureCodeMap.set(f.route_path, f.feature_code);
          }
        });
      }
    }

    // Get existing tasks to check for duplicates
    const { data: existingTasks, error: existingError } = await supabase
      .from('implementation_tasks')
      .select('phase_id, step_order');
    
    const existingTaskKeys = new Set(
      (existingTasks || []).map(t => `${t.phase_id}-${t.step_order}`)
    );

    // Process each phase
    const tasksToInsert: any[] = [];

    for (const [phaseId, steps] of Object.entries(mappings)) {
      for (const step of steps) {
        result.summary.totalTasks++;
        
        const taskKey = `${phaseId}-${step.order}`;
        
        // Check if task already exists
        if (existingTaskKeys.has(taskKey) && !overwriteExisting) {
          result.summary.skipped++;
          result.details.push({
            phaseId,
            stepOrder: step.order,
            area: step.area,
            action: 'skipped',
            message: 'Task already exists'
          });
          continue;
        }

        // Try to match feature code by route
        let featureCode: string | null = null;
        if (matchFeatureCodes && step.adminRoute) {
          featureCode = featureCodeMap.get(step.adminRoute) || null;
          if (featureCode) {
            result.summary.matched++;
          }
        }

        const taskData = {
          phase_id: phaseId,
          step_order: step.order,
          area: step.area,
          description: null,
          feature_code: featureCode,
          admin_route: step.adminRoute || null,
          import_type: step.importType || null,
          is_required: step.isRequired || false,
          estimated_minutes: step.estimatedMinutes || 15,
          sub_section: step.subSection || null,
          source_manual: step.sourceManual || null,
          source_section: step.sourceSection || null,
          is_global: step.isGlobal || false,
          display_order: step.order,
          is_active: true
        };

        tasksToInsert.push(taskData);

        result.details.push({
          phaseId,
          stepOrder: step.order,
          area: step.area,
          action: featureCode ? 'matched' : 'inserted',
          featureCode: featureCode || undefined,
          message: featureCode 
            ? `Matched to feature code: ${featureCode}`
            : 'Using legacy admin_route'
        });
      }
    }

    // Insert tasks if not dry run
    if (!dryRun && tasksToInsert.length > 0) {
      // If overwriting, delete existing first
      if (overwriteExisting) {
        const phaseIds = [...new Set(tasksToInsert.map(t => t.phase_id))];
        await supabase
          .from('implementation_tasks')
          .delete()
          .in('phase_id', phaseIds);
      }

      const { error: insertError } = await supabase
        .from('implementation_tasks')
        .insert(tasksToInsert);

      if (insertError) {
        result.success = false;
        result.errors.push(`Insert error: ${insertError.message}`);
        result.summary.errors = tasksToInsert.length;
      } else {
        result.summary.inserted = tasksToInsert.length - result.summary.matched;
      }
    } else if (dryRun) {
      result.summary.inserted = tasksToInsert.length - result.summary.matched;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
