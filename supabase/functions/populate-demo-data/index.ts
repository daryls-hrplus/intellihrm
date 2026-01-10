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

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 
  'William', 'Sophia', 'Richard', 'Ava', 'Joseph', 'Isabella', 'Thomas', 'Mia', 'Charles', 'Charlotte',
  'Daniel', 'Amelia', 'Matthew', 'Harper', 'Anthony', 'Evelyn', 'Mark', 'Abigail', 'Donald', 'Elizabeth',
  'Steven', 'Sofia', 'Paul', 'Avery', 'Andrew', 'Ella', 'Joshua', 'Madison', 'Kenneth', 'Scarlett'];

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

// Generate a unique request number
function generateRequestNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `LR-${timestamp}-${random}`.toUpperCase();
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

    console.log(`Starting FULL data population with dataset: ${dataSet}`);

    const results: { table: string; count: number }[] = [];
    let totalRecords = 0;
    const errors: string[] = [];

    // Dataset configurations
    const datasetConfig = {
      minimal: { companies: 1, employeesPerCompany: 5, months: 1 },
      standard: { companies: 1, employeesPerCompany: 25, months: 3 },
      full: { companies: 3, employeesPerCompany: 35, months: 12 }
    };

    const cfg = datasetConfig[dataSet];
    const createdCompanyIds: string[] = [];
    const createdEmployeeIds: string[] = [];
    const createdDepartmentIds: string[] = [];
    const employeeCompanyMap: Map<string, string> = new Map();

    // ========== STEP 1: COMPANIES (No FK dependencies) ==========
    console.log('Step 1: Creating companies...');
    for (let c = 0; c < cfg.companies; c++) {
      const companyName = c === 0 ? 'Demo Company' : `Demo Company ${c + 1}`;
      const { data: company, error } = await supabase
        .from('companies')
        .upsert({
          name: companyName,
          code: `DEMO${c + 1}`,
          is_active: true,
          industry: 'Technology',
          country: 'United States'
        }, { onConflict: 'code' })
        .select()
        .single();
      
      if (error) {
        console.error(`Company ${c} error:`, error);
        errors.push(`Company: ${error.message}`);
      } else if (company) {
        createdCompanyIds.push(company.id);
        totalRecords++;
      }
    }
    results.push({ table: 'companies', count: createdCompanyIds.length });
    console.log(`Created ${createdCompanyIds.length} companies`);

    if (createdCompanyIds.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        tablesPopulated: 1,
        recordsCreated: 0,
        errors: ['Failed to create any companies'],
        details: results
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ========== STEP 2: DEPARTMENTS (Depends on: companies) ==========
    console.log('Step 2: Creating departments...');
    const departmentNames = ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Customer Support', 'Product'];
    for (const companyId of createdCompanyIds) {
      for (const deptName of departmentNames) {
        const { data: dept, error } = await supabase
          .from('departments')
          .upsert({
            name: deptName,
            code: deptName.toUpperCase().replace(/\s/g, '_').substring(0, 10),
            company_id: companyId,
            is_active: true
          }, { onConflict: 'company_id,code' })
          .select()
          .single();
        
        if (!error && dept) {
          createdDepartmentIds.push(dept.id);
          totalRecords++;
        } else if (error) {
          console.error(`Department ${deptName} error:`, error.message);
        }
      }
    }
    results.push({ table: 'departments', count: createdDepartmentIds.length });
    console.log(`Created ${createdDepartmentIds.length} departments`);

    // ========== STEP 3: POSITIONS (Depends on: companies) ==========
    console.log('Step 3: Creating positions...');
    const positionData = [
      { title: 'Junior Developer', level: 1 },
      { title: 'Software Engineer', level: 2 },
      { title: 'Senior Engineer', level: 3 },
      { title: 'Tech Lead', level: 4 },
      { title: 'Manager', level: 4 },
      { title: 'Senior Manager', level: 5 },
      { title: 'Director', level: 6 },
      { title: 'VP', level: 7 },
      { title: 'Analyst', level: 2 },
      { title: 'Senior Analyst', level: 3 }
    ];
    
    let positionsCreated = 0;
    for (const companyId of createdCompanyIds) {
      for (const pos of positionData) {
        const { error } = await supabase
          .from('positions')
          .upsert({
            title: pos.title,
            code: pos.title.toUpperCase().replace(/\s/g, '_').substring(0, 15),
            company_id: companyId,
            is_active: true
          }, { onConflict: 'company_id,code' });
        
        if (!error) {
          positionsCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'positions', count: positionsCreated });
    console.log(`Created ${positionsCreated} positions`);

    // ========== STEP 4: LEAVE TYPES (Depends on: companies) ==========
    console.log('Step 4: Checking/creating leave types...');
    const leaveTypesData = [
      { name: 'Annual Leave', code: 'ANNUAL', days_per_year: 20 },
      { name: 'Sick Leave', code: 'SICK', days_per_year: 10 },
      { name: 'Personal Leave', code: 'PERSONAL', days_per_year: 5 },
      { name: 'Maternity Leave', code: 'MATERNITY', days_per_year: 90 },
      { name: 'Paternity Leave', code: 'PATERNITY', days_per_year: 10 },
      { name: 'Bereavement', code: 'BEREAVEMENT', days_per_year: 5 }
    ];
    
    // Store leave type IDs per company
    const companyLeaveTypes: Map<string, string[]> = new Map();
    let leaveTypesCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      const leaveTypeIds: string[] = [];
      
      for (const lt of leaveTypesData) {
        // First check if it exists
        const { data: existing } = await supabase
          .from('leave_types')
          .select('id')
          .eq('company_id', companyId)
          .eq('code', lt.code)
          .single();
        
        if (existing) {
          leaveTypeIds.push(existing.id);
        } else {
          const { data: created, error } = await supabase
            .from('leave_types')
            .insert({
              ...lt,
              company_id: companyId,
              is_active: true
            })
            .select('id')
            .single();
          
          if (!error && created) {
            leaveTypeIds.push(created.id);
            leaveTypesCreated++;
            totalRecords++;
          }
        }
      }
      
      companyLeaveTypes.set(companyId, leaveTypeIds);
    }
    results.push({ table: 'leave_types', count: leaveTypesCreated });
    console.log(`Created ${leaveTypesCreated} leave types`);

    // ========== STEP 5: EMPLOYEES/PROFILES (Depends on: companies, departments) ==========
    console.log('Step 5: Creating employees...');
    let employeesCreated = 0;
    
    for (let companyIdx = 0; companyIdx < createdCompanyIds.length; companyIdx++) {
      const companyId = createdCompanyIds[companyIdx];
      const companyDepts = createdDepartmentIds.filter((_, i) => Math.floor(i / departmentNames.length) === companyIdx);
      
      for (let e = 0; e < cfg.employeesPerCompany; e++) {
        const firstName = FIRST_NAMES[e % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(e + companyIdx * 10) % LAST_NAMES.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${e}@demo${companyIdx + 1}.com`;
        const employeeId = `EMP${String(companyIdx * 1000 + e + 1).padStart(5, '0')}`;
        
        const hireDate = new Date();
        hireDate.setMonth(hireDate.getMonth() - Math.floor(Math.random() * 36));
        
        const birthYear = 1970 + Math.floor(Math.random() * 30);
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        
        const { data: employee, error } = await supabase
          .from('profiles')
          .upsert({
            email,
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            first_last_name: lastName,
            employee_id: employeeId,
            company_id: companyId,
            department_id: companyDepts.length > 0 ? companyDepts[e % companyDepts.length] : null,
            first_hire_date: hireDate.toISOString().split('T')[0],
            start_date: hireDate.toISOString().split('T')[0],
            employment_status: 'active',
            gender: e % 2 === 0 ? 'male' : 'female',
            date_of_birth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
            is_active: true
          }, { onConflict: 'email' })
          .select()
          .single();
        
        if (!error && employee) {
          createdEmployeeIds.push(employee.id);
          employeeCompanyMap.set(employee.id, companyId);
          employeesCreated++;
          totalRecords++;
        } else if (error) {
          console.error(`Employee ${e} error:`, error.message);
        }
      }
    }
    results.push({ table: 'profiles', count: employeesCreated });
    console.log(`Created ${employeesCreated} employees`);

    // ========== STEP 6: LEAVE BALANCES (Depends on: employees, leave_types) ==========
    console.log('Step 6: Creating leave balances...');
    let leaveBalancesCreated = 0;
    const currentYear = new Date().getFullYear();
    
    for (const employeeId of createdEmployeeIds) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      const leaveTypeIds = companyLeaveTypes.get(companyId) || [];
      
      for (const leaveTypeId of leaveTypeIds) {
        const { error } = await supabase
          .from('leave_balances')
          .upsert({
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
            year: currentYear,
            opening_balance: 20,
            accrued_amount: Math.floor(Math.random() * 15),
            used_amount: Math.floor(Math.random() * 10),
            adjustment_amount: 0,
            carried_forward: Math.floor(Math.random() * 5)
          }, { onConflict: 'employee_id,leave_type_id,year' });
        
        if (!error) {
          leaveBalancesCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'leave_balances', count: leaveBalancesCreated });
    console.log(`Created ${leaveBalancesCreated} leave balances`);

    // ========== STEP 7: TIME CLOCK ENTRIES (Depends on: employees, companies) ==========
    console.log('Step 7: Creating time clock entries...');
    let timeEntriesCreated = 0;
    const today = new Date();
    
    // Limit time entries to avoid timeout - sample of employees
    const sampleEmployees = createdEmployeeIds.slice(0, Math.min(10, createdEmployeeIds.length));
    
    for (const employeeId of sampleEmployees) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      // Create time entries for the last month only (to avoid timeout)
      for (let d = 1; d <= Math.min(cfg.months * 5, 15); d++) {
        const entryDate = new Date(today);
        entryDate.setDate(entryDate.getDate() - d);
        if (entryDate.getDay() === 0 || entryDate.getDay() === 6) continue;
        
        const clockIn = new Date(entryDate);
        clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
        
        const clockOut = new Date(entryDate);
        clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
        
        const { error } = await supabase
          .from('time_clock_entries')
          .insert({
            company_id: companyId,
            employee_id: employeeId,
            clock_in: clockIn.toISOString(),
            clock_out: clockOut.toISOString(),
            total_hours: 8 + Math.random() * 2,
            regular_hours: 8,
            overtime_hours: Math.random() * 2,
            status: 'approved'
          });
        
        if (!error) {
          timeEntriesCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'time_clock_entries', count: timeEntriesCreated });
    console.log(`Created ${timeEntriesCreated} time clock entries`);

    // ========== STEP 8: LEAVE REQUESTS (Depends on: employees, leave_types) ==========
    console.log('Step 8: Creating leave requests...');
    let leaveRequestsCreated = 0;
    
    for (const employeeId of createdEmployeeIds.slice(0, Math.min(15, createdEmployeeIds.length))) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      const leaveTypeIds = companyLeaveTypes.get(companyId) || [];
      if (leaveTypeIds.length === 0) continue;
      
      // Create 1-2 leave requests per employee
      const numRequests = 1 + Math.floor(Math.random() * 2);
      for (let r = 0; r < numRequests; r++) {
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * cfg.months));
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 20));
        
        const days = 1 + Math.floor(Math.random() * 5);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days - 1);
        
        const statuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
        
        const { error } = await supabase
          .from('leave_requests')
          .insert({
            employee_id: employeeId,
            leave_type_id: leaveTypeIds[Math.floor(Math.random() * leaveTypeIds.length)],
            request_number: generateRequestNumber(),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            duration: days,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            reason: 'Demo leave request'
          });
        
        if (!error) {
          leaveRequestsCreated++;
          totalRecords++;
        } else {
          console.error('Leave request error:', error.message);
        }
      }
    }
    results.push({ table: 'leave_requests', count: leaveRequestsCreated });
    console.log(`Created ${leaveRequestsCreated} leave requests`);

    // ========== STEP 9: PERFORMANCE GOALS (Depends on: employees, companies) ==========
    console.log('Step 9: Creating performance goals...');
    let goalsCreated = 0;
    const goalTitles = [
      'Improve code quality metrics',
      'Complete certification training',
      'Reduce customer response time',
      'Increase sales by 10%',
      'Implement new feature',
      'Mentor junior team members',
      'Reduce operational costs',
      'Improve team collaboration'
    ];
    
    for (const employeeId of createdEmployeeIds.slice(0, Math.min(15, createdEmployeeIds.length))) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      const numGoals = 1 + Math.floor(Math.random() * 2);
      for (let g = 0; g < numGoals; g++) {
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 3));
        
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + 3 + Math.floor(Math.random() * 3));
        
        const statuses = ['draft', 'active', 'active', 'active', 'completed'];
        const goalTypes = ['individual', 'team', 'department'];
        const goalLevels = ['individual', 'team', 'department', 'organization'];
        const goalSources = ['self', 'manager', 'cascade'];
        
        const { error } = await supabase
          .from('performance_goals')
          .insert({
            company_id: companyId,
            employee_id: employeeId,
            title: goalTitles[Math.floor(Math.random() * goalTitles.length)],
            description: 'Demo goal for testing purposes',
            goal_type: goalTypes[Math.floor(Math.random() * goalTypes.length)],
            goal_level: goalLevels[Math.floor(Math.random() * goalLevels.length)],
            goal_source: goalSources[Math.floor(Math.random() * goalSources.length)],
            progress_percentage: Math.floor(Math.random() * 100),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            start_date: startDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0]
          });
        
        if (!error) {
          goalsCreated++;
          totalRecords++;
        } else {
          console.error('Goal error:', error.message);
        }
      }
    }
    results.push({ table: 'performance_goals', count: goalsCreated });
    console.log(`Created ${goalsCreated} goals`);

    // ========== STEP 10: PAYROLL RUNS (Depends on: companies) ==========
    console.log('Step 10: Creating payroll runs...');
    let payrollRunsCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      // Create payroll runs for past months
      for (let m = 0; m < Math.min(cfg.months, 3); m++) {
        const runDate = new Date(today);
        runDate.setMonth(runDate.getMonth() - m);
        runDate.setDate(28); // End of month payroll
        
        const periodStart = new Date(runDate.getFullYear(), runDate.getMonth(), 1);
        const periodEnd = new Date(runDate.getFullYear(), runDate.getMonth() + 1, 0);
        
        const { error } = await supabase
          .from('payroll_runs')
          .insert({
            company_id: companyId,
            run_date: runDate.toISOString().split('T')[0],
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            status: 'completed',
            total_gross: Math.floor(Math.random() * 500000) + 100000,
            total_net: Math.floor(Math.random() * 400000) + 80000,
            total_deductions: Math.floor(Math.random() * 100000) + 20000,
            employee_count: cfg.employeesPerCompany
          });
        
        if (!error) {
          payrollRunsCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'payroll_runs', count: payrollRunsCreated });
    console.log(`Created ${payrollRunsCreated} payroll runs`);

    console.log(`Population complete: ${totalRecords} total records`);

    return new Response(JSON.stringify({
      success: true,
      tablesPopulated: results.length,
      recordsCreated: totalRecords,
      errors,
      details: results,
      summary: {
        companies: createdCompanyIds.length,
        employees: employeesCreated,
        monthsOfData: cfg.months
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Population error:', error);
    return new Response(JSON.stringify({
      success: false,
      tablesPopulated: 0,
      recordsCreated: 0,
      errors: [errorMessage],
      details: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
