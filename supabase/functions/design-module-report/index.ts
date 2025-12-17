import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Module-specific data source configurations
const moduleDataSources: Record<string, { table: string; fields: string; description: string }> = {
  workforce: {
    table: 'profiles',
    fields: '*, departments(*), positions(*)',
    description: 'Employee workforce data including departments, positions, and employee information'
  },
  leave: {
    table: 'leave_requests',
    fields: '*, leave_types(*), profiles!leave_requests_employee_id_fkey(first_name, last_name, employee_id)',
    description: 'Leave request data including types, durations, and approval status'
  },
  compensation: {
    table: 'employee_compensation',
    fields: '*, pay_elements(*), profiles(*)',
    description: 'Compensation data including salaries, allowances, and pay elements'
  },
  benefits: {
    table: 'benefit_enrollments',
    fields: '*, benefit_plans(*), profiles(*)',
    description: 'Benefit enrollment data including plans and employee participation'
  },
  training: {
    table: 'training_enrollments',
    fields: '*, training_courses(*), profiles(*)',
    description: 'Training enrollment and completion data'
  },
  succession: {
    table: 'succession_plans',
    fields: '*, positions(*), profiles(*)',
    description: 'Succession planning data including key positions and successors'
  },
  recruitment: {
    table: 'applications',
    fields: '*, candidates(*), job_requisitions(*)',
    description: 'Recruitment data including applications, candidates, and job requisitions'
  },
  hse: {
    table: 'hse_incidents',
    fields: '*',
    description: 'Health and safety incident reports and risk assessments'
  },
  'employee-relations': {
    table: 'er_cases',
    fields: '*',
    description: 'Employee relations cases, disciplinary actions, and recognition'
  },
  property: {
    table: 'asset_assignments',
    fields: '*, company_assets(*), profiles(*)',
    description: 'Company property and asset assignment data'
  },
  attendance: {
    table: 'time_clock_entries',
    fields: '*, profiles(*)',
    description: 'Time and attendance records including clock-in/out data'
  },
  performance: {
    table: 'appraisal_participants',
    fields: '*, appraisal_cycles(*), profiles(*)',
    description: 'Performance appraisal and evaluation data'
  },
  payroll: {
    table: 'payroll_records',
    fields: '*, profiles(first_name, last_name, employee_id), payroll_runs(period_start, period_end, status)',
    description: 'Payroll records including earnings, deductions, and pay period data'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, reportId, layoutContent, reportName, reportType, userFeedback, filters, companyId, moduleName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const moduleConfig = moduleDataSources[moduleName] || moduleDataSources.workforce;
    const moduleDisplayName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, ' ');

    if (action === 'analyze_layout') {
      const systemPrompt = `You are a ${moduleDisplayName} report designer AI. Analyze the provided layout document and extract:
1. Report structure (columns, rows, groupings, bands)
2. Required filters (date ranges, departments, status, etc.)
3. Data fields needed from ${moduleConfig.description}
4. Formatting requirements (currency formats, totals, subtotals)
5. Report type characteristics (banded report with groupings OR BI report with charts/KPIs)

For banded reports, identify:
- Group headers and footers
- Detail bands
- Summary bands
- Column layouts

For BI reports, identify:
- KPI metrics
- Chart types recommended
- Dimension fields for slicing data

Return a structured JSON with the analysis.`;

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
            { role: "user", content: `Report Name: ${reportName}\nReport Type: ${reportType}\nModule: ${moduleDisplayName}\n\nLayout Document Content:\n${layoutContent}` }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const aiResult = await response.json();
      const analysis = JSON.parse(aiResult.choices[0].message.content);

      return new Response(JSON.stringify({ 
        success: true, 
        analysis,
        message: "Layout analyzed successfully. Review the structure and iterate if needed."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'iterate_design') {
      const { data: report } = await supabase
        .from('ai_module_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        throw new Error("Report not found");
      }

      const systemPrompt = `You are a ${moduleDisplayName} report designer AI. The user wants to modify the report design.
Current report structure:
${JSON.stringify(report.report_structure, null, 2)}

Current AI analysis:
${JSON.stringify(report.ai_analysis, null, 2)}

Apply the user's requested changes and return an updated report structure.
Maintain the overall format but incorporate the modifications.
Return a JSON object with the updated structure.`;

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
            { role: "user", content: userFeedback }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`AI iteration failed: ${response.status}`);
      }

      const aiResult = await response.json();
      const updatedStructure = JSON.parse(aiResult.choices[0].message.content);

      const iterationHistory = report.iteration_history || [];
      iterationHistory.push({
        timestamp: new Date().toISOString(),
        feedback: userFeedback,
        changes: updatedStructure
      });

      await supabase
        .from('ai_module_reports')
        .update({
          report_structure: updatedStructure,
          iteration_history: iterationHistory,
          status: 'designing'
        })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        updatedStructure,
        message: "Design updated based on your feedback."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'simulate_report') {
      const { data: report } = await supabase
        .from('ai_module_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        throw new Error("Report not found");
      }

      const systemPrompt = `You are a ${moduleDisplayName} report generator. Generate realistic sample data for a report preview.
Based on the report structure, create sample data that demonstrates how the report will look.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}
Module: ${moduleDisplayName}
Data Source: ${moduleConfig.description}
Filters: ${JSON.stringify(filters || report.filter_configuration, null, 2)}

Generate:
1. Sample data rows with realistic values for ${moduleDisplayName}
2. Calculated totals and subtotals
3. For banded reports: proper grouping and band structure
4. For BI reports: sample KPI values and chart data

Return a JSON with:
- sampleData: array of data rows
- totals: calculated summary values
- chartData: (for BI) chart-ready data
- previewHtml: simple HTML representation of the report`;

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
            { role: "user", content: `Generate a realistic simulation preview with sample ${moduleDisplayName} data.` }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`AI simulation failed: ${response.status}`);
      }

      const aiResult = await response.json();
      const simulationData = JSON.parse(aiResult.choices[0].message.content);

      await supabase
        .from('ai_module_reports')
        .update({ status: 'simulated' })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        simulationData,
        message: "Simulated report generated with sample data."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'connect_real_data') {
      const { data: report } = await supabase
        .from('ai_module_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        throw new Error("Report not found");
      }

      const appliedFilters = filters || report.filter_configuration;
      
      // Dynamic query based on module
      let query = supabase.from(moduleConfig.table).select(moduleConfig.fields);
      
      // Apply company filter if the table has company_id
      if (['leave', 'compensation', 'benefits', 'training', 'succession', 'hse', 'employee-relations', 'property', 'attendance', 'performance', 'payroll'].includes(moduleName)) {
        query = query.eq('company_id', companyId);
      }

      if (appliedFilters.startDate) {
        query = query.gte('created_at', appliedFilters.startDate);
      }
      if (appliedFilters.endDate) {
        query = query.lte('created_at', appliedFilters.endDate);
      }

      const { data: moduleData, error } = await query.limit(1000);

      if (error) {
        console.error(`Error fetching ${moduleName} data:`, error);
        throw new Error(`Failed to fetch ${moduleName} data`);
      }

      const systemPrompt = `You are a ${moduleDisplayName} report generator. Transform real data into the defined report structure.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}
Module: ${moduleDisplayName}

Process the provided data and generate:
1. Properly formatted data rows following the structure
2. Accurate totals and subtotals
3. For banded reports: properly grouped data
4. For BI reports: aggregated KPI values and chart data

Return a JSON with:
- reportData: formatted data matching report structure
- totals: calculated summary values
- chartData: (for BI) chart-ready aggregated data
- metadata: row counts, date ranges, etc.`;

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
            { role: "user", content: `Real ${moduleDisplayName} data (${moduleData?.length || 0} records):\n${JSON.stringify(moduleData?.slice(0, 50), null, 2)}` }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`AI data processing failed: ${response.status}`);
      }

      const aiResult = await response.json();
      const processedReport = JSON.parse(aiResult.choices[0].message.content);

      await supabase
        .from('ai_module_reports')
        .update({
          status: 'connected',
          last_generated_at: new Date().toISOString(),
          data_sources: [{
            table: moduleConfig.table,
            filters: appliedFilters,
            recordCount: moduleData?.length || 0
          }]
        })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        reportData: processedReport,
        recordCount: moduleData?.length || 0,
        message: `Report generated with real ${moduleDisplayName} data.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'run_saved_report') {
      const { data: report } = await supabase
        .from('ai_module_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report || report.status !== 'saved') {
        throw new Error("Report not found or not saved");
      }

      const appliedFilters = filters || report.filter_configuration;
      
      let query = supabase.from(moduleConfig.table).select(moduleConfig.fields);
      
      if (['leave', 'compensation', 'benefits', 'training', 'succession', 'hse', 'employee-relations', 'property', 'attendance', 'performance', 'payroll'].includes(moduleName)) {
        query = query.eq('company_id', companyId);
      }

      if (appliedFilters.startDate) {
        query = query.gte('created_at', appliedFilters.startDate);
      }
      if (appliedFilters.endDate) {
        query = query.lte('created_at', appliedFilters.endDate);
      }

      const { data: moduleData, error } = await query.limit(1000);

      if (error) {
        throw new Error(`Failed to fetch ${moduleName} data`);
      }

      const systemPrompt = `Transform ${moduleDisplayName} data into the saved report structure.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}

Return formatted report data with totals and chart data if applicable.`;

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
            { role: "user", content: `${moduleDisplayName} data:\n${JSON.stringify(moduleData?.slice(0, 50), null, 2)}` }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.status}`);
      }

      const aiResult = await response.json();
      const reportOutput = JSON.parse(aiResult.choices[0].message.content);

      await supabase
        .from('ai_module_reports')
        .update({ last_generated_at: new Date().toISOString() })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        reportData: reportOutput,
        recordCount: moduleData?.length || 0,
        message: "Report generated successfully."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error("Error in design-module-report:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});