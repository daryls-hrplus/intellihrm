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
    const { 
      payrollRunId, 
      bankConfigId, 
      companyId, 
      payGroupId,
      userId,
      permissionContext,
      previewOnly = false
    } = await req.json();

    if (!payrollRunId || !bankConfigId || !companyId) {
      throw new Error('Missing required parameters');
    }

    // Verify user has access to the company
    if (!permissionContext.isAdmin && !permissionContext.accessibleCompanyIds?.includes(companyId)) {
      throw new Error('You do not have permission to access this company');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating bank file for payroll run ${payrollRunId}, config ${bankConfigId}`);

    // Fetch bank configuration
    const { data: bankConfig, error: configError } = await supabase
      .from('bank_file_config')
      .select('*')
      .eq('id', bankConfigId)
      .single();

    if (configError || !bankConfig) {
      throw new Error('Bank configuration not found');
    }

    // Verify config belongs to the company
    if (bankConfig.company_id !== companyId) {
      throw new Error('Bank configuration does not belong to this company');
    }

    // Fetch payroll run with payments
    const { data: payrollRun, error: runError } = await supabase
      .from('payroll_runs')
      .select(`
        id,
        pay_period_id,
        pay_group_id,
        status,
        total_net_pay,
        employee_count,
        created_at,
        pay_periods(start_date, end_date),
        pay_groups(name)
      `)
      .eq('id', payrollRunId)
      .single();

    if (runError || !payrollRun) {
      throw new Error('Payroll run not found');
    }

    if (payrollRun.status !== 'paid') {
      throw new Error('Can only generate bank files for paid payroll runs');
    }

    // Fetch payroll records with employee banking info
    const { data: payrollRecords, error: recordsError } = await supabase
      .from('payroll_records')
      .select(`
        id,
        employee_id,
        net_pay,
        gross_pay
      `)
      .eq('payroll_run_id', payrollRunId)
      .gt('net_pay', 0);

    // Fetch employee profiles separately
    const employeeIds = payrollRecords?.map(r => r.employee_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, employee_code, bank_account_number, bank_routing_number, bank_name')
      .in('id', employeeIds);

    if (recordsError) {
      throw new Error('Failed to fetch payroll records');
    }

    // Fetch company info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found');
    }

    // Generate the bank file
    const fileLines: string[] = [];
    const now = new Date();
    const fileDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const fileTime = now.toISOString().slice(11, 19).replace(/:/g, '');

    let totalAmount = 0;
    let recordCount = 0;

    // Helper to mask PII if user doesn't have permission
    const maskPii = (value: string, type: 'account' | 'routing' | 'name') => {
      if (permissionContext.canViewPii) return value;
      
      if (type === 'account') {
        return value ? '****' + value.slice(-4) : '';
      } else if (type === 'routing') {
        return value ? '***' + value.slice(-3) : '';
      } else {
        return value ? value.charAt(0) + '***' : '';
      }
    };

    // Helper to format field based on template
    const formatField = (template: any, value: any): string => {
      let result = String(value || '');
      
      if (template.format === 'cents' && typeof value === 'number') {
        result = Math.round(value * 100).toString();
      }
      
      if (template.length) {
        if (template.padding === 'left') {
          result = result.padStart(template.length, template.padChar || ' ');
        } else {
          result = result.padEnd(template.length, template.padChar || ' ');
        }
        result = result.slice(0, template.length);
      }
      
      return result;
    };

    // Helper to build a line from template
    const buildLine = (template: any, data: any): string => {
      if (!template?.fields) return '';
      
      const separator = template.separator || '';
      const parts = template.fields.map((field: any) => {
        let value = field.value;
        
        if (field.source) {
          const [obj, prop] = field.source.split('.');
          if (data[obj]) {
            value = data[obj][prop];
          }
        }
        
        return formatField(field, value);
      });
      
      return parts.join(separator);
    };

    // Data context for templates
    const summaryData = {
      record_count: 0,
      total_amount: 0,
      batch_number: 1,
    };

    const companyData = {
      name: company.name,
      bank_account: bankConfig.company_bank_account || '',
      bank_routing: bankConfig.company_bank_routing || '',
      id_number: bankConfig.company_id_number || '',
    };

    const dateData = {
      file_creation: fileDate,
      effective: fileDate,
    };

    // Generate header if template exists
    if (bankConfig.file_header_template) {
      const headerData = {
        company: companyData,
        date: dateData,
        summary: summaryData,
      };
      const headerLine = buildLine(bankConfig.file_header_template, headerData);
      if (headerLine) fileLines.push(headerLine);
    }

    // Create profile lookup map
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    // Generate detail records
    for (const record of payrollRecords || []) {
      const profile = profileMap.get(record.employee_id);
      if (!profile) continue;

      const employeeData = {
        bank_account: maskPii(profile.bank_account_number || '', 'account'),
        bank_routing: maskPii(profile.bank_routing_number || '', 'routing'),
        full_name: maskPii(profile.full_name || '', 'name'),
        employee_code: profile.employee_code || '',
      };

      const payrollData = {
        net_pay: record.net_pay,
        gross_pay: record.gross_pay,
      };

      const recordData = {
        employee: employeeData,
        payroll: payrollData,
        company: companyData,
        date: dateData,
      };

      if (bankConfig.record_template) {
        const recordLine = buildLine(bankConfig.record_template, recordData);
        if (recordLine) {
          fileLines.push(recordLine);
          totalAmount += record.net_pay || 0;
          recordCount++;
        }
      } else {
        // Default CSV format if no template
        const line = [
          employeeData.bank_routing,
          employeeData.bank_account,
          (record.net_pay || 0).toFixed(2),
          employeeData.full_name,
          employeeData.employee_code,
        ].join(',');
        fileLines.push(line);
        totalAmount += record.net_pay || 0;
        recordCount++;
      }
    }

    // Update summary data with actual values
    summaryData.record_count = recordCount;
    summaryData.total_amount = totalAmount;

    // Generate footer if template exists
    if (bankConfig.file_footer_template) {
      const footerData = {
        company: companyData,
        date: dateData,
        summary: summaryData,
      };
      const footerLine = buildLine(bankConfig.file_footer_template, footerData);
      if (footerLine) fileLines.push(footerLine);
    }

    const lineEnding = bankConfig.record_template?.lineEnding || '\n';
    const fileContent = fileLines.join(lineEnding) + lineEnding;
    
    const fileName = `${bankConfig.bank_name.replace(/\s+/g, '_')}_${payGroupId ? 'PG' : 'ALL'}_${fileDate}_${fileTime}.${bankConfig.file_format.toLowerCase() === 'csv' ? 'csv' : 'txt'}`;

    // Log the generation
    console.log(`Generated bank file: ${fileName}, ${recordCount} records, total $${totalAmount.toFixed(2)}`);

    // If not preview, save generation record
    if (!previewOnly) {
      const { error: genError } = await supabase
        .from('bank_file_generations')
        .insert({
          bank_config_id: bankConfigId,
          company_id: companyId,
          payroll_run_id: payrollRunId,
          file_name: fileName,
          file_format: bankConfig.file_format,
          file_content: fileContent,
          record_count: recordCount,
          total_amount: totalAmount,
          generated_by: userId,
          status: 'generated',
        });

      if (genError) {
        console.error('Failed to save generation record:', genError);
      }
    }

    return new Response(
      JSON.stringify({
        fileContent,
        fileName,
        recordCount,
        totalAmount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-bank-file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate bank file';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
