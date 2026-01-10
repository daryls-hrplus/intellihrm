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

    console.log(`Starting data population with dataset: ${dataSet}`);

    const results: { table: string; count: number }[] = [];
    let totalRecords = 0;
    const errors: string[] = [];

    const datasetConfig = {
      minimal: { companies: 1, employeesPerCompany: 5, months: 1 },
      standard: { companies: 1, employeesPerCompany: 25, months: 3 },
      full: { companies: 3, employeesPerCompany: 35, months: 12 }
    };

    const cfg = datasetConfig[dataSet];
    const today = new Date();
    
    // Storage for created IDs
    const createdCompanyIds: string[] = [];
    const companyDepartments: Map<string, string[]> = new Map();
    const companyJobFamilies: Map<string, string[]> = new Map();
    const companyJobs: Map<string, string[]> = new Map();
    const companyPositions: Map<string, string[]> = new Map();
    const companyLeaveTypes: Map<string, string[]> = new Map();
    const createdEmployeeIds: string[] = [];
    const employeeCompanyMap: Map<string, string> = new Map();

    // ========== STEP 1: COMPANIES (No dependencies) ==========
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
    let deptsCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      const deptIds: string[] = [];
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
          deptIds.push(dept.id);
          deptsCreated++;
          totalRecords++;
        }
      }
      companyDepartments.set(companyId, deptIds);
    }
    results.push({ table: 'departments', count: deptsCreated });
    console.log(`Created ${deptsCreated} departments`);

    // ========== STEP 3: JOB FAMILIES (Depends on: companies) ==========
    console.log('Step 3: Creating job families...');
    const jobFamilyData = [
      { name: 'Engineering', code: 'ENG' },
      { name: 'Sales', code: 'SALES' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'Finance', code: 'FIN' },
      { name: 'Operations', code: 'OPS' },
      { name: 'Marketing', code: 'MKT' }
    ];
    let jobFamiliesCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      const familyIds: string[] = [];
      for (const jf of jobFamilyData) {
        // Check if exists first
        const { data: existing } = await supabase
          .from('job_families')
          .select('id')
          .eq('company_id', companyId)
          .eq('code', jf.code)
          .single();
        
        if (existing) {
          familyIds.push(existing.id);
        } else {
          const { data: created, error } = await supabase
            .from('job_families')
            .insert({
              company_id: companyId,
              name: jf.name,
              code: jf.code,
              is_active: true,
              start_date: today.toISOString().split('T')[0]
            })
            .select()
            .single();
          
          if (!error && created) {
            familyIds.push(created.id);
            jobFamiliesCreated++;
            totalRecords++;
          }
        }
      }
      companyJobFamilies.set(companyId, familyIds);
    }
    results.push({ table: 'job_families', count: jobFamiliesCreated });
    console.log(`Created ${jobFamiliesCreated} job families`);

    // ========== STEP 4: JOBS (Depends on: companies, job_families) ==========
    console.log('Step 4: Creating jobs...');
    const jobData = [
      { name: 'Software Developer', code: 'SW-DEV', familyIdx: 0 },
      { name: 'Senior Developer', code: 'SR-DEV', familyIdx: 0 },
      { name: 'Tech Lead', code: 'TECH-LEAD', familyIdx: 0 },
      { name: 'Sales Representative', code: 'SALES-REP', familyIdx: 1 },
      { name: 'Sales Manager', code: 'SALES-MGR', familyIdx: 1 },
      { name: 'HR Specialist', code: 'HR-SPEC', familyIdx: 2 },
      { name: 'HR Manager', code: 'HR-MGR', familyIdx: 2 },
      { name: 'Accountant', code: 'ACCT', familyIdx: 3 },
      { name: 'Finance Manager', code: 'FIN-MGR', familyIdx: 3 },
      { name: 'Operations Analyst', code: 'OPS-ANLST', familyIdx: 4 }
    ];
    let jobsCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      const jobIds: string[] = [];
      const familyIds = companyJobFamilies.get(companyId) || [];
      
      for (const job of jobData) {
        const familyId = familyIds[job.familyIdx % familyIds.length];
        if (!familyId) continue;
        
        // Check if exists
        const { data: existing } = await supabase
          .from('jobs')
          .select('id')
          .eq('company_id', companyId)
          .eq('code', job.code)
          .single();
        
        if (existing) {
          jobIds.push(existing.id);
        } else {
          const { data: created, error } = await supabase
            .from('jobs')
            .insert({
              company_id: companyId,
              job_family_id: familyId,
              name: job.name,
              code: job.code,
              is_active: true,
              is_key_position: job.name.includes('Manager') || job.name.includes('Lead'),
              start_date: today.toISOString().split('T')[0]
            })
            .select()
            .single();
          
          if (!error && created) {
            jobIds.push(created.id);
            jobsCreated++;
            totalRecords++;
          }
        }
      }
      companyJobs.set(companyId, jobIds);
    }
    results.push({ table: 'jobs', count: jobsCreated });
    console.log(`Created ${jobsCreated} jobs`);

    // ========== STEP 5: POSITIONS (Depends on: departments, jobs - optional) ==========
    console.log('Step 5: Creating positions...');
    const positionData = [
      { title: 'Junior Developer', idx: 0 },
      { title: 'Software Engineer', idx: 0 },
      { title: 'Senior Engineer', idx: 1 },
      { title: 'Tech Lead', idx: 2 },
      { title: 'Engineering Manager', idx: 2 },
      { title: 'Sales Associate', idx: 3 },
      { title: 'Account Executive', idx: 3 },
      { title: 'Sales Director', idx: 4 },
      { title: 'HR Coordinator', idx: 5 },
      { title: 'HR Business Partner', idx: 6 }
    ];
    let positionsCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      const positionIds: string[] = [];
      const deptIds = companyDepartments.get(companyId) || [];
      const jobIds = companyJobs.get(companyId) || [];
      
      for (let i = 0; i < positionData.length; i++) {
        const pos = positionData[i];
        const deptId = deptIds[i % deptIds.length];
        const jobId = jobIds.length > 0 ? jobIds[pos.idx % jobIds.length] : null;
        
        if (!deptId) continue;
        
        const posCode = pos.title.toUpperCase().replace(/\s/g, '-').substring(0, 15);
        
        // Check if exists
        const { data: existing } = await supabase
          .from('positions')
          .select('id')
          .eq('department_id', deptId)
          .eq('code', posCode)
          .single();
        
        if (existing) {
          positionIds.push(existing.id);
        } else {
          const { data: created, error } = await supabase
            .from('positions')
            .insert({
              department_id: deptId,
              company_id: companyId,
              job_id: jobId,
              title: pos.title,
              code: posCode,
              is_active: true,
              authorized_headcount: 5,
              start_date: today.toISOString().split('T')[0],
              compensation_model: 'salary_grade',
              pay_type: 'SALARIED',
              employment_status: 'ACTIVE',
              employment_type: 'FULL_TIME',
              flsa_status: 'EXEMPT',
              employment_relation: 'EMPLOYEE'
            })
            .select()
            .single();
          
          if (!error && created) {
            positionIds.push(created.id);
            positionsCreated++;
            totalRecords++;
          } else if (error) {
            console.error(`Position ${pos.title} error:`, error.message);
          }
        }
      }
      companyPositions.set(companyId, positionIds);
    }
    results.push({ table: 'positions', count: positionsCreated });
    console.log(`Created ${positionsCreated} positions`);

    // ========== STEP 6: LEAVE TYPES (Depends on: companies) ==========
    console.log('Step 6: Creating leave types...');
    const leaveTypesData = [
      { name: 'Annual Leave', code: 'ANNUAL' },
      { name: 'Sick Leave', code: 'SICK' },
      { name: 'Personal Leave', code: 'PERSONAL' }
    ];
    let leaveTypesCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      const ltIds: string[] = [];
      for (const lt of leaveTypesData) {
        const { data: existing } = await supabase
          .from('leave_types')
          .select('id')
          .eq('company_id', companyId)
          .eq('code', lt.code)
          .single();
        
        if (existing) {
          ltIds.push(existing.id);
        } else {
          const { data: created, error } = await supabase
            .from('leave_types')
            .insert({
              company_id: companyId,
              name: lt.name,
              code: lt.code,
              is_active: true
            })
            .select()
            .single();
          
          if (!error && created) {
            ltIds.push(created.id);
            leaveTypesCreated++;
            totalRecords++;
          }
        }
      }
      companyLeaveTypes.set(companyId, ltIds);
    }
    results.push({ table: 'leave_types', count: leaveTypesCreated });
    console.log(`Created ${leaveTypesCreated} leave types`);

    // ========== STEP 7: EMPLOYEES/PROFILES (Depends on: companies, departments) ==========
    // Must create auth.users first since profiles.id references auth.users(id)
    console.log('Step 7: Creating employees...');
    let employeesCreated = 0;
    
    for (let companyIdx = 0; companyIdx < createdCompanyIds.length; companyIdx++) {
      const companyId = createdCompanyIds[companyIdx];
      const deptIds = companyDepartments.get(companyId) || [];
      
      for (let e = 0; e < cfg.employeesPerCompany; e++) {
        const firstName = FIRST_NAMES[e % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(e + companyIdx * 10) % LAST_NAMES.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${e}@demo${companyIdx + 1}.com`;
        const employeeIdCode = `EMP${String(companyIdx * 1000 + e + 1).padStart(5, '0')}`;
        
        const hireDate = new Date();
        hireDate.setMonth(hireDate.getMonth() - Math.floor(Math.random() * 36));
        
        const birthYear = 1970 + Math.floor(Math.random() * 30);
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        
        // Check if user already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        
        if (existingProfile) {
          createdEmployeeIds.push(existingProfile.id);
          employeeCompanyMap.set(existingProfile.id, companyId);
          continue;
        }
        
        // Create auth user first (this will trigger profile creation)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: 'DemoPassword123!',
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        });
        
        if (authError) {
          console.error(`Auth user ${email} error:`, authError.message);
          continue;
        }
        
        if (authUser?.user) {
          // Update the profile with additional employee data
          const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .update({
              full_name: `${firstName} ${lastName}`,
              first_name: firstName,
              first_last_name: lastName,
              employee_id: employeeIdCode,
              company_id: companyId,
              department_id: deptIds.length > 0 ? deptIds[e % deptIds.length] : null,
              first_hire_date: hireDate.toISOString().split('T')[0],
              start_date: hireDate.toISOString().split('T')[0],
              employment_status: 'active',
              gender: e % 2 === 0 ? 'male' : 'female',
              date_of_birth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
              is_active: true
            })
            .eq('id', authUser.user.id)
            .select()
            .single();
          
          if (!profileError && updatedProfile) {
            createdEmployeeIds.push(updatedProfile.id);
            employeeCompanyMap.set(updatedProfile.id, companyId);
            employeesCreated++;
            totalRecords++;
          } else if (profileError) {
            console.error(`Profile update ${email} error:`, profileError.message);
          }
        }
      }
    }
    results.push({ table: 'profiles', count: employeesCreated });
    console.log(`Created ${employeesCreated} employees`);

    // ========== STEP 8: EMPLOYEE_POSITIONS (Depends on: employees, positions) ==========
    console.log('Step 8: Assigning employees to positions...');
    let assignmentsCreated = 0;
    
    for (const employeeId of createdEmployeeIds) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      const positionIds = companyPositions.get(companyId) || [];
      if (positionIds.length === 0) continue;
      
      const positionId = positionIds[Math.floor(Math.random() * positionIds.length)];
      
      // Check if assignment exists
      const { data: existing } = await supabase
        .from('employee_positions')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('is_primary', true)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('employee_positions')
          .insert({
            employee_id: employeeId,
            position_id: positionId,
            start_date: today.toISOString().split('T')[0],
            is_primary: true,
            is_active: true,
            assignment_type: 'primary',
            compensation_amount: 50000 + Math.floor(Math.random() * 100000),
            compensation_currency: 'USD',
            compensation_frequency: 'annual'
          });
        
        if (!error) {
          assignmentsCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'employee_positions', count: assignmentsCreated });
    console.log(`Created ${assignmentsCreated} position assignments`);

    // ========== STEP 9: LEAVE BALANCES (Depends on: employees, leave_types) ==========
    console.log('Step 9: Creating leave balances...');
    let leaveBalancesCreated = 0;
    const currentYear = new Date().getFullYear();
    
    for (const employeeId of createdEmployeeIds) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      const ltIds = companyLeaveTypes.get(companyId) || [];
      
      for (const leaveTypeId of ltIds) {
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

    // ========== STEP 10: TIME CLOCK ENTRIES (sample) ==========
    console.log('Step 10: Creating time clock entries...');
    let timeEntriesCreated = 0;
    const sampleEmployees = createdEmployeeIds.slice(0, Math.min(10, createdEmployeeIds.length));
    
    for (const employeeId of sampleEmployees) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      for (let d = 1; d <= Math.min(cfg.months * 5, 10); d++) {
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
    console.log(`Created ${timeEntriesCreated} time entries`);

    // ========== STEP 11: LEAVE REQUESTS ==========
    console.log('Step 11: Creating leave requests...');
    let leaveRequestsCreated = 0;
    
    for (const employeeId of createdEmployeeIds.slice(0, Math.min(10, createdEmployeeIds.length))) {
      const companyId = employeeCompanyMap.get(employeeId);
      if (!companyId) continue;
      
      const ltIds = companyLeaveTypes.get(companyId) || [];
      if (ltIds.length === 0) continue;
      
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
      
      const days = 1 + Math.floor(Math.random() * 3);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days - 1);
      
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: employeeId,
          leave_type_id: ltIds[Math.floor(Math.random() * ltIds.length)],
          request_number: generateRequestNumber(),
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          duration: days,
          status: ['pending', 'approved', 'approved'][Math.floor(Math.random() * 3)],
          reason: 'Demo leave request'
        });
      
      if (!error) {
        leaveRequestsCreated++;
        totalRecords++;
      }
    }
    results.push({ table: 'leave_requests', count: leaveRequestsCreated });
    console.log(`Created ${leaveRequestsCreated} leave requests`);

    // ========== STEP 12: PAYROLL RUNS ==========
    console.log('Step 12: Creating payroll runs...');
    let payrollRunsCreated = 0;
    
    for (const companyId of createdCompanyIds) {
      for (let m = 0; m < Math.min(cfg.months, 3); m++) {
        const runDate = new Date(today);
        runDate.setMonth(runDate.getMonth() - m);
        runDate.setDate(28);
        
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
