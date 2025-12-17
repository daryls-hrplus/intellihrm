import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PII fields that should be masked if user doesn't have PII access
const PII_FIELDS = [
  'email', 'phone', 'mobile', 'address', 'ssn', 'national_id', 'passport_number',
  'bank_account', 'bank_routing', 'personal_email', 'emergency_contact_phone',
  'date_of_birth', 'dob', 'home_address', 'mailing_address', 'personal_phone'
];

// Function to mask PII in data
function maskPiiInData(data: any[], canViewPii: boolean): any[] {
  if (canViewPii || !data) return data;
  
  return data.map(row => {
    const maskedRow = { ...row };
    for (const key of Object.keys(maskedRow)) {
      const lowerKey = key.toLowerCase();
      if (PII_FIELDS.some(piiField => lowerKey.includes(piiField))) {
        maskedRow[key] = '***REDACTED***';
      }
      // Handle nested objects (e.g., profiles relation)
      if (typeof maskedRow[key] === 'object' && maskedRow[key] !== null) {
        if (Array.isArray(maskedRow[key])) {
          maskedRow[key] = maskPiiInData(maskedRow[key], false);
        } else {
          maskedRow[key] = maskPiiInObject(maskedRow[key]);
        }
      }
    }
    return maskedRow;
  });
}

function maskPiiInObject(obj: Record<string, any>): Record<string, any> {
  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (PII_FIELDS.some(piiField => lowerKey.includes(piiField))) {
      masked[key] = '***REDACTED***';
    }
    if (typeof masked[key] === 'object' && masked[key] !== null && !Array.isArray(masked[key])) {
      masked[key] = maskPiiInObject(masked[key]);
    }
  }
  return masked;
}

// Module-specific data source configurations
const moduleDataSources: Record<string, { table: string; fields: string; description: string; companyField?: string; departmentField?: string }> = {
  workforce: {
    table: 'profiles',
    fields: '*, departments(*), positions(*)',
    description: 'Employee workforce data including departments, positions, and employee information',
    companyField: 'company_id',
    departmentField: 'department_id'
  },
  leave: {
    table: 'leave_requests',
    fields: '*, leave_types(*), profiles!leave_requests_employee_id_fkey(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Leave request data including types, durations, and approval status',
    companyField: 'company_id'
  },
  compensation: {
    table: 'employee_compensation',
    fields: '*, pay_elements(*), profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Compensation data including salaries, allowances, and pay elements',
    companyField: 'company_id'
  },
  benefits: {
    table: 'benefit_enrollments',
    fields: '*, benefit_plans(*), profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Benefit enrollment data including plans and employee participation',
    companyField: 'company_id'
  },
  training: {
    table: 'training_enrollments',
    fields: '*, training_courses(*), profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Training enrollment and completion data',
    companyField: 'company_id'
  },
  succession: {
    table: 'succession_plans',
    fields: '*, positions(*), profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Succession planning data including key positions and successors',
    companyField: 'company_id'
  },
  recruitment: {
    table: 'applications',
    fields: '*, candidates(*), job_requisitions(*, companies(id, name))',
    description: 'Recruitment data including applications, candidates, and job requisitions'
  },
  hse: {
    table: 'hse_incidents',
    fields: '*',
    description: 'Health and safety incident reports and risk assessments',
    companyField: 'company_id',
    departmentField: 'department_id'
  },
  'employee-relations': {
    table: 'er_cases',
    fields: '*',
    description: 'Employee relations cases, disciplinary actions, and recognition',
    companyField: 'company_id'
  },
  property: {
    table: 'asset_assignments',
    fields: '*, company_assets(*), profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Company property and asset assignment data',
    companyField: 'company_id'
  },
  attendance: {
    table: 'time_clock_entries',
    fields: '*, profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Time and attendance records including clock-in/out data',
    companyField: 'company_id'
  },
  performance: {
    table: 'appraisal_participants',
    fields: '*, appraisal_cycles(*), profiles(first_name, last_name, employee_id, company_id, department_id)',
    description: 'Performance appraisal and evaluation data',
    companyField: 'company_id'
  },
  payroll: {
    table: 'payroll_records',
    fields: '*, profiles(first_name, last_name, employee_id, company_id, department_id), payroll_runs(period_start, period_end, status, company_id)',
    description: 'Payroll records including earnings, deductions, and pay period data',
    companyField: 'company_id'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, reportId, layoutContent, reportName, reportType, userFeedback, 
      filters, companyId, moduleName,
      // Permission context from frontend
      userId,
      accessibleCompanyIds,
      accessibleDepartmentIds,
      canViewPii,
      isAdmin
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const moduleConfig = moduleDataSources[moduleName] || moduleDataSources.workforce;
    const moduleDisplayName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, ' ');

    // Helper function to apply permission filters to queries
    const applyPermissionFilters = (query: any) => {
      // Admins with no specific restrictions get full access
      if (isAdmin && (!accessibleCompanyIds || accessibleCompanyIds.length === 0)) {
        // Apply single company filter if provided
        if (companyId && moduleConfig.companyField) {
          query = query.eq(moduleConfig.companyField, companyId);
        }
        return query;
      }

      // Apply company filter based on user's accessible companies
      if (moduleConfig.companyField) {
        if (accessibleCompanyIds && accessibleCompanyIds.length > 0) {
          // Filter to accessible companies, and optionally the selected company
          const companyFilter = companyId 
            ? accessibleCompanyIds.filter((id: string) => id === companyId)
            : accessibleCompanyIds;
          
          if (companyFilter.length === 0) {
            // User doesn't have access to selected company
            throw new Error("Access denied: You don't have permission to access this company's data");
          }
          query = query.in(moduleConfig.companyField, companyFilter);
        } else if (companyId) {
          query = query.eq(moduleConfig.companyField, companyId);
        }
      }

      // Apply department filter if module supports it and user has department restrictions
      if (moduleConfig.departmentField && accessibleDepartmentIds && accessibleDepartmentIds.length > 0) {
        query = query.in(moduleConfig.departmentField, accessibleDepartmentIds);
      }

      return query;
    };

    // Log data access for audit
    const logDataAccess = async (recordCount: number) => {
      if (userId) {
        try {
          await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'VIEW',
            entity_type: `ai_report_${moduleName}`,
            entity_id: reportId,
            metadata: {
              action: action,
              record_count: recordCount,
              pii_accessed: canViewPii,
              company_id: companyId,
              filters: filters
            }
          });
        } catch (e) {
          console.error("Failed to log audit:", e);
        }
      }
    };

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

      // Note: Simulation uses fake data, but we still respect PII masking preference
      const systemPrompt = `You are a ${moduleDisplayName} report generator. Generate realistic sample data for a report preview.
Based on the report structure, create sample data that demonstrates how the report will look.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}
Module: ${moduleDisplayName}
Data Source: ${moduleConfig.description}
Filters: ${JSON.stringify(filters || report.filter_configuration, null, 2)}

${!canViewPii ? 'IMPORTANT: The user does not have PII access. Replace all personal identifiable information (email, phone, address, SSN, bank details, date of birth) with "***REDACTED***" in the sample data.' : ''}

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
      
      // Dynamic query based on module with permission filtering
      let query = supabase.from(moduleConfig.table).select(moduleConfig.fields);
      
      // Apply permission-based filters
      query = applyPermissionFilters(query);

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

      // Apply PII masking if user doesn't have PII access
      const processedData = maskPiiInData(moduleData || [], canViewPii === true);

      // Log data access for audit
      await logDataAccess(processedData.length);

      const systemPrompt = `You are a ${moduleDisplayName} report generator. Transform real data into the defined report structure.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}
Module: ${moduleDisplayName}

${!canViewPii ? 'Note: PII fields have been redacted for this user. Display them as "***REDACTED***" in the report.' : ''}

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
            { role: "user", content: `Real ${moduleDisplayName} data (${processedData?.length || 0} records):\n${JSON.stringify(processedData?.slice(0, 50), null, 2)}` }
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
            recordCount: processedData?.length || 0,
            piiMasked: !canViewPii
          }]
        })
        .eq('id', reportId);

      return new Response(JSON.stringify({ 
        success: true, 
        reportData: processedReport,
        recordCount: processedData?.length || 0,
        piiMasked: !canViewPii,
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
      
      // Apply permission-based filters
      query = applyPermissionFilters(query);

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

      // Apply PII masking if user doesn't have PII access
      const processedData = maskPiiInData(moduleData || [], canViewPii === true);

      // Log data access for audit
      await logDataAccess(processedData.length);

      const systemPrompt = `Transform ${moduleDisplayName} data into the saved report structure.

Report Structure:
${JSON.stringify(report.report_structure, null, 2)}

Report Type: ${report.report_type}

${!canViewPii ? 'Note: PII fields have been redacted. Display as "***REDACTED***".' : ''}

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
            { role: "user", content: `${moduleDisplayName} data:\n${JSON.stringify(processedData?.slice(0, 50), null, 2)}` }
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
        recordCount: processedData?.length || 0,
        piiMasked: !canViewPii,
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
