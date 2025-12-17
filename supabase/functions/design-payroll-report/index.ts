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
    const { action, reportId, layoutContent, reportName, reportType, userFeedback, filters, companyId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'analyze_layout') {
      // Analyze the uploaded layout document
      const systemPrompt = `You are a payroll report designer AI. Analyze the provided layout document and extract:
1. Report structure (columns, rows, groupings, bands)
2. Required filters (date ranges, departments, pay groups, etc.)
3. Data fields needed (employee info, pay elements, deductions, etc.)
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
            { role: "user", content: `Report Name: ${reportName}\nReport Type: ${reportType}\n\nLayout Document Content:\n${layoutContent}` }
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
      // Iterate on the report design based on user feedback
      const { data: report } = await supabase
        .from('ai_payroll_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        throw new Error("Report not found");
      }

      const systemPrompt = `You are a payroll report designer AI. The user wants to modify the report design.
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

      // Update iteration history
      const iterationHistory = report.iteration_history || [];
      iterationHistory.push({
        timestamp: new Date().toISOString(),
        feedback: userFeedback,
        changes: updatedStructure
      });

      await supabase
        .from('ai_payroll_reports')
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
      // Generate simulated report with sample data
      const { data: report } = await supabase
        .from('ai_payroll_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        throw new Error("Report not found");
      }

      const systemPrompt = `You are a payroll report generator. Generate realistic sample data for a payroll report preview.
Based on the report structure, create sample data that demonstrates how the report will look.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}
Filters: ${JSON.stringify(filters || report.filter_configuration, null, 2)}

Generate:
1. Sample data rows with realistic payroll values
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
            { role: "user", content: "Generate a realistic simulation preview with sample payroll data." }
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
        .from('ai_payroll_reports')
        .update({
          status: 'simulated'
        })
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
      // Connect to real payroll data and generate report
      const { data: report } = await supabase
        .from('ai_payroll_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        throw new Error("Report not found");
      }

      // Fetch real payroll data based on filters
      const appliedFilters = filters || report.filter_configuration;
      
      let query = supabase
        .from('payroll_records')
        .select(`
          *,
          employee:profiles(first_name, last_name, employee_id),
          payroll_run:payroll_runs(period_start, period_end, status)
        `)
        .eq('company_id', companyId);

      if (appliedFilters.payGroupId) {
        query = query.eq('pay_group_id', appliedFilters.payGroupId);
      }
      if (appliedFilters.startDate) {
        query = query.gte('created_at', appliedFilters.startDate);
      }
      if (appliedFilters.endDate) {
        query = query.lte('created_at', appliedFilters.endDate);
      }

      const { data: payrollData, error } = await query.limit(1000);

      if (error) {
        console.error("Error fetching payroll data:", error);
        throw new Error("Failed to fetch payroll data");
      }

      // Process data according to report structure
      const systemPrompt = `You are a payroll report generator. Transform real payroll data into the defined report structure.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}

Process the provided payroll data and generate:
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
            { role: "user", content: `Real payroll data (${payrollData?.length || 0} records):\n${JSON.stringify(payrollData?.slice(0, 50), null, 2)}` }
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
        .from('ai_payroll_reports')
        .update({
          status: 'connected',
          last_generated_at: new Date().toISOString(),
          data_sources: [{
            table: 'payroll_records',
            filters: appliedFilters,
            recordCount: payrollData?.length || 0
          }]
        })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        reportData: processedReport,
        recordCount: payrollData?.length || 0,
        message: "Report generated with real payroll data."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'run_saved_report') {
      // Run a previously saved report with current filters
      const { data: report } = await supabase
        .from('ai_payroll_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report || report.status !== 'saved') {
        throw new Error("Report not found or not saved");
      }

      // Fetch fresh data with provided filters
      const appliedFilters = filters || report.filter_configuration;
      
      let query = supabase
        .from('payroll_records')
        .select(`
          *,
          employee:profiles(first_name, last_name, employee_id),
          payroll_run:payroll_runs(period_start, period_end, status)
        `)
        .eq('company_id', companyId);

      if (appliedFilters.payGroupId) {
        query = query.eq('pay_group_id', appliedFilters.payGroupId);
      }
      if (appliedFilters.startDate) {
        query = query.gte('created_at', appliedFilters.startDate);
      }
      if (appliedFilters.endDate) {
        query = query.lte('created_at', appliedFilters.endDate);
      }

      const { data: payrollData, error } = await query.limit(1000);

      if (error) {
        throw new Error("Failed to fetch payroll data");
      }

      // Process using saved structure
      const systemPrompt = `Transform payroll data into the saved report structure.

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
            { role: "user", content: `Payroll data:\n${JSON.stringify(payrollData?.slice(0, 50), null, 2)}` }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.status}`);
      }

      const aiResult = await response.json();
      const reportOutput = JSON.parse(aiResult.choices[0].message.content);

      // Update last generated timestamp
      await supabase
        .from('ai_payroll_reports')
        .update({ last_generated_at: new Date().toISOString() })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        reportData: reportOutput,
        recordCount: payrollData?.length || 0,
        message: "Report generated successfully."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error("Error in design-payroll-report:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
