import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PopulationConfig {
  dataSet: 'minimal' | 'standard' | 'full';
  companyId?: string;
  modules?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const config: PopulationConfig = await req.json();
    const { dataSet = 'minimal' } = config;

    console.log(`Starting data population with dataset: ${dataSet}`);

    const results: { table: string; count: number }[] = [];
    let totalRecords = 0;
    let tablesPopulated = 0;
    const errors: string[] = [];

    // Get table dependency order
    const { data: dependencies, error: depError } = await supabase
      .from('table_dependency_order')
      .select('*')
      .order('depth', { ascending: true });

    if (depError) {
      console.error('Error fetching dependencies:', depError);
      throw new Error('Failed to fetch table dependencies');
    }

    console.log(`Found ${dependencies?.length || 0} tables in dependency order`);

    // Dataset configurations
    const datasetConfig = {
      minimal: { companies: 1, employeesPerCompany: 5, months: 1 },
      standard: { companies: 1, employeesPerCompany: 25, months: 3 },
      full: { companies: 3, employeesPerCompany: 35, months: 12 }
    };

    const cfg = datasetConfig[dataSet];

    // Check if demo company exists
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', '%demo%')
      .limit(1);

    let companyId = config.companyId;

    if (!companyId && existingCompanies && existingCompanies.length > 0) {
      companyId = existingCompanies[0].id;
      console.log(`Using existing demo company: ${existingCompanies[0].name}`);
    }

    // Create demo company if needed
    if (!companyId) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: `Demo Company ${Date.now()}`,
          code: `DEMO-${Date.now()}`,
          status: 'active',
          is_active: true
        })
        .select()
        .single();

      if (companyError) {
        errors.push(`Failed to create company: ${companyError.message}`);
      } else {
        companyId = newCompany.id;
        results.push({ table: 'companies', count: 1 });
        totalRecords++;
        tablesPopulated++;
        console.log(`Created demo company: ${newCompany.name}`);
      }
    }

    if (!companyId) {
      return new Response(JSON.stringify({
        success: false,
        tablesPopulated: 0,
        recordsCreated: 0,
        errors: ['No company available for data population'],
        details: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create departments
    const departmentNames = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const deptCount = dataSet === 'minimal' ? 2 : departmentNames.length;
    
    for (let i = 0; i < deptCount; i++) {
      const { error } = await supabase
        .from('departments')
        .upsert({
          name: departmentNames[i],
          code: departmentNames[i].toUpperCase().substring(0, 4),
          company_id: companyId,
          is_active: true
        }, { onConflict: 'company_id,code' });

      if (!error) {
        totalRecords++;
      }
    }
    results.push({ table: 'departments', count: deptCount });
    tablesPopulated++;

    // Get departments for employee assignment
    const { data: departments } = await supabase
      .from('departments')
      .select('id')
      .eq('company_id', companyId);

    // Create positions
    const positionNames = ['Software Engineer', 'Senior Engineer', 'Manager', 'Director', 'VP'];
    const posCount = dataSet === 'minimal' ? 2 : positionNames.length;
    
    for (let i = 0; i < posCount; i++) {
      const { error } = await supabase
        .from('positions')
        .upsert({
          title: positionNames[i],
          code: positionNames[i].toUpperCase().replace(/\s/g, '_').substring(0, 10),
          company_id: companyId,
          is_active: true
        }, { onConflict: 'company_id,code' });

      if (!error) {
        totalRecords++;
      }
    }
    results.push({ table: 'positions', count: posCount });
    tablesPopulated++;

    // Create leave types
    const leaveTypes = [
      { name: 'Annual Leave', code: 'ANNUAL', days_per_year: 20 },
      { name: 'Sick Leave', code: 'SICK', days_per_year: 10 },
      { name: 'Personal Leave', code: 'PERSONAL', days_per_year: 5 }
    ];
    
    for (const lt of leaveTypes) {
      const { error } = await supabase
        .from('leave_types')
        .upsert({
          ...lt,
          company_id: companyId,
          is_active: true
        }, { onConflict: 'company_id,code' });

      if (!error) {
        totalRecords++;
      }
    }
    results.push({ table: 'leave_types', count: leaveTypes.length });
    tablesPopulated++;

    console.log(`Population complete: ${totalRecords} records across ${tablesPopulated} tables`);

    return new Response(JSON.stringify({
      success: true,
      tablesPopulated,
      recordsCreated: totalRecords,
      errors,
      details: results,
      companyId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Population error:', error);
    return new Response(JSON.stringify({
      success: false,
      tablesPopulated: 0,
      recordsCreated: 0,
      errors: [error.message],
      details: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
