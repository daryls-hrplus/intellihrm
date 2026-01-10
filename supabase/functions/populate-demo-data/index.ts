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
    const createdPositionIds: string[] = [];
    const createdLeaveTypeIds: string[] = [];

    // ========== COMPANIES ==========
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

    // ========== DEPARTMENTS ==========
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
        }
      }
    }
    results.push({ table: 'departments', count: createdDepartmentIds.length });
    console.log(`Created ${createdDepartmentIds.length} departments`);

    // ========== POSITIONS ==========
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
    
    for (const companyId of createdCompanyIds) {
      for (const pos of positionData) {
        const { data: position, error } = await supabase
          .from('positions')
          .upsert({
            title: pos.title,
            code: pos.title.toUpperCase().replace(/\s/g, '_').substring(0, 15),
            company_id: companyId,
            is_active: true
          }, { onConflict: 'company_id,code' })
          .select()
          .single();
        
        if (!error && position) {
          createdPositionIds.push(position.id);
          totalRecords++;
        }
      }
    }
    results.push({ table: 'positions', count: createdPositionIds.length });
    console.log(`Created ${createdPositionIds.length} positions`);

    // ========== LEAVE TYPES ==========
    const leaveTypes = [
      { name: 'Annual Leave', code: 'ANNUAL', days_per_year: 20 },
      { name: 'Sick Leave', code: 'SICK', days_per_year: 10 },
      { name: 'Personal Leave', code: 'PERSONAL', days_per_year: 5 },
      { name: 'Maternity Leave', code: 'MATERNITY', days_per_year: 90 },
      { name: 'Paternity Leave', code: 'PATERNITY', days_per_year: 10 },
      { name: 'Bereavement', code: 'BEREAVEMENT', days_per_year: 5 }
    ];
    
    for (const companyId of createdCompanyIds) {
      for (const lt of leaveTypes) {
        const { data: leaveType, error } = await supabase
          .from('leave_types')
          .upsert({
            ...lt,
            company_id: companyId,
            is_active: true
          }, { onConflict: 'company_id,code' })
          .select()
          .single();
        
        if (!error && leaveType) {
          createdLeaveTypeIds.push(leaveType.id);
          totalRecords++;
        }
      }
    }
    results.push({ table: 'leave_types', count: createdLeaveTypeIds.length });
    console.log(`Created ${createdLeaveTypeIds.length} leave types`);

    // ========== EMPLOYEES (Profiles) ==========
    let employeesCreated = 0;
    const employeeCompanyMap: Map<string, string> = new Map();
    
    for (let companyIdx = 0; companyIdx < createdCompanyIds.length; companyIdx++) {
      const companyId = createdCompanyIds[companyIdx];
      const companyDepts = createdDepartmentIds.filter((_, i) => Math.floor(i / departmentNames.length) === companyIdx);
      const companyPositions = createdPositionIds.filter((_, i) => Math.floor(i / positionData.length) === companyIdx);
      
      for (let e = 0; e < cfg.employeesPerCompany; e++) {
        const firstName = FIRST_NAMES[e % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(e + companyIdx * 10) % LAST_NAMES.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${e}@demo${companyIdx + 1}.com`;
        const employeeNumber = `EMP${String(companyIdx * 1000 + e + 1).padStart(5, '0')}`;
        
        const hireDate = new Date();
        hireDate.setMonth(hireDate.getMonth() - Math.floor(Math.random() * 36)); // Hired within last 3 years
        
        const { data: employee, error } = await supabase
          .from('profiles')
          .upsert({
            email,
            first_name: firstName,
            last_name: lastName,
            employee_number: employeeNumber,
            company_id: companyId,
            department_id: companyDepts[e % companyDepts.length],
            position_id: companyPositions[e % companyPositions.length],
            hire_date: hireDate.toISOString().split('T')[0],
            status: 'active',
            employment_type: e % 10 === 0 ? 'contractor' : 'full_time',
            work_location: e % 5 === 0 ? 'remote' : 'office',
            phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
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

    // ========== LEAVE BALANCES ==========
    let leaveBalancesCreated = 0;
    const currentYear = new Date().getFullYear();
    
    for (const employeeId of createdEmployeeIds) {
      const companyId = employeeCompanyMap.get(employeeId);
      const companyLeaveTypes = createdLeaveTypeIds.filter((_, i) => 
        createdCompanyIds.indexOf(companyId!) === Math.floor(i / leaveTypes.length)
      );
      
      for (const leaveTypeId of companyLeaveTypes) {
        const { error } = await supabase
          .from('leave_balances')
          .upsert({
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
            year: currentYear,
            entitled_days: 20,
            used_days: Math.floor(Math.random() * 10),
            pending_days: Math.floor(Math.random() * 3),
            carried_over_days: Math.floor(Math.random() * 5)
          }, { onConflict: 'employee_id,leave_type_id,year' });
        
        if (!error) {
          leaveBalancesCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'leave_balances', count: leaveBalancesCreated });
    console.log(`Created ${leaveBalancesCreated} leave balances`);

    // ========== TIME ENTRIES ==========
    let timeEntriesCreated = 0;
    const today = new Date();
    
    for (const employeeId of createdEmployeeIds) {
      // Create time entries for the configured number of months
      for (let m = 0; m < cfg.months; m++) {
        const monthDate = new Date(today);
        monthDate.setMonth(monthDate.getMonth() - m);
        
        // Create ~20 working days per month
        for (let d = 1; d <= 20; d++) {
          const entryDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
          if (entryDate.getDay() === 0 || entryDate.getDay() === 6) continue; // Skip weekends
          
          const clockIn = new Date(entryDate);
          clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30));
          
          const clockOut = new Date(entryDate);
          clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30));
          
          const { error } = await supabase
            .from('time_entries')
            .insert({
              employee_id: employeeId,
              date: entryDate.toISOString().split('T')[0],
              clock_in: clockIn.toISOString(),
              clock_out: clockOut.toISOString(),
              total_hours: 8 + Math.random() * 2,
              status: 'approved',
              entry_type: 'regular'
            });
          
          if (!error) {
            timeEntriesCreated++;
            totalRecords++;
          }
        }
      }
    }
    results.push({ table: 'time_entries', count: timeEntriesCreated });
    console.log(`Created ${timeEntriesCreated} time entries`);

    // ========== LEAVE REQUESTS ==========
    let leaveRequestsCreated = 0;
    
    for (const employeeId of createdEmployeeIds) {
      const companyId = employeeCompanyMap.get(employeeId);
      const companyLeaveTypes = createdLeaveTypeIds.filter((_, i) => 
        createdCompanyIds.indexOf(companyId!) === Math.floor(i / leaveTypes.length)
      );
      
      // Create 2-4 leave requests per employee
      const numRequests = 2 + Math.floor(Math.random() * 3);
      for (let r = 0; r < numRequests; r++) {
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * cfg.months));
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 20));
        
        const days = 1 + Math.floor(Math.random() * 5);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
        
        const statuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
        
        const { error } = await supabase
          .from('leave_requests')
          .insert({
            employee_id: employeeId,
            leave_type_id: companyLeaveTypes[Math.floor(Math.random() * companyLeaveTypes.length)],
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            days_requested: days,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            reason: 'Demo leave request'
          });
        
        if (!error) {
          leaveRequestsCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'leave_requests', count: leaveRequestsCreated });
    console.log(`Created ${leaveRequestsCreated} leave requests`);

    // ========== GOALS ==========
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
    
    for (const employeeId of createdEmployeeIds) {
      const numGoals = 2 + Math.floor(Math.random() * 3);
      for (let g = 0; g < numGoals; g++) {
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 6));
        
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + 3 + Math.floor(Math.random() * 6));
        
        const { error } = await supabase
          .from('goals')
          .insert({
            employee_id: employeeId,
            title: goalTitles[Math.floor(Math.random() * goalTitles.length)],
            description: 'Demo goal for testing',
            start_date: startDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            progress: Math.floor(Math.random() * 100),
            status: ['not_started', 'in_progress', 'in_progress', 'completed'][Math.floor(Math.random() * 4)],
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
          });
        
        if (!error) {
          goalsCreated++;
          totalRecords++;
        }
      }
    }
    results.push({ table: 'goals', count: goalsCreated });
    console.log(`Created ${goalsCreated} goals`);

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