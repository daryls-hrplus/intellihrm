import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Resumption of Duty processing...');

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Find approved leaves ending today that don't have ROD records yet
    console.log(`Looking for leaves ending on ${today}...`);
    
    const { data: endingLeaves, error: leavesError } = await supabase
      .from('leave_requests')
      .select(`
        id,
        employee_id,
        leave_type_id,
        end_date,
        profiles!leave_requests_employee_id_fkey (
          id,
          full_name,
          email,
          company_id
        ),
        leave_types!leave_requests_leave_type_id_fkey (
          id,
          code,
          name
        )
      `)
      .eq('status', 'approved')
      .eq('end_date', today);

    if (leavesError) {
      console.error('Error fetching ending leaves:', leavesError);
      throw leavesError;
    }

    console.log(`Found ${endingLeaves?.length || 0} leaves ending today`);

    // Create ROD records for each ending leave
    let createdCount = 0;
    for (const leave of endingLeaves || []) {
      // Check if ROD already exists for this leave
      const { data: existingRod } = await supabase
        .from('resumption_of_duty')
        .select('id')
        .eq('leave_request_id', leave.id)
        .single();

      if (existingRod) {
        console.log(`ROD already exists for leave ${leave.id}, skipping`);
        continue;
      }

      // Determine if medical clearance is required
      const leaveType = leave.leave_types as unknown as { id: string; code: string; name: string } | null;
      const requiresMedicalClearance = leaveType?.code?.toUpperCase().includes('SICK') || 
                                        leaveType?.code?.toUpperCase().includes('MEDICAL') ||
                                        leaveType?.name?.toUpperCase().includes('SICK') ||
                                        leaveType?.name?.toUpperCase().includes('MEDICAL');

      const profile = leave.profiles as unknown as { id: string; full_name: string; email: string; company_id: string } | null;
      
      if (!profile?.company_id) {
        console.log(`No company_id found for leave ${leave.id}, skipping`);
        continue;
      }

      // Create ROD record
      const { data: newRod, error: createError } = await supabase
        .from('resumption_of_duty')
        .insert({
          leave_request_id: leave.id,
          employee_id: leave.employee_id,
          company_id: profile.company_id,
          leave_end_date: leave.end_date,
          requires_medical_clearance: requiresMedicalClearance,
          status: 'pending_employee'
        })
        .select()
        .single();

      if (createError) {
        console.error(`Error creating ROD for leave ${leave.id}:`, createError);
        continue;
      }

      console.log(`Created ROD ${newRod.id} for employee ${profile.full_name}`);
      createdCount++;

      // Send notification to employee
      await supabase.from('notifications').insert({
        user_id: leave.employee_id,
        title: 'Resumption of Duty Required',
        message: `Your leave has ended. Please complete your Resumption of Duty form${requiresMedicalClearance ? ' and upload your medical clearance' : ''}.`,
        type: 'leave',
        action_url: '/leave/my-leave',
        is_read: false
      });
    }

    // 2. Check for overdue RODs (pending_employee > 24 hours)
    console.log('Checking for overdue RODs...');
    
    const { data: overdueRods, error: overdueError } = await supabase
      .from('resumption_of_duty')
      .select(`
        id,
        employee_id,
        company_id,
        leave_end_date,
        form_created_at,
        profiles!resumption_of_duty_employee_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'pending_employee')
      .lt('leave_end_date', today);

    if (overdueError) {
      console.error('Error fetching overdue RODs:', overdueError);
    }

    let overdueCount = 0;
    for (const rod of overdueRods || []) {
      // Update status to overdue
      await supabase
        .from('resumption_of_duty')
        .update({ status: 'overdue' })
        .eq('id', rod.id);

      const profile = rod.profiles as unknown as { id: string; full_name: string; email: string } | null;

      overdueCount++;
      console.log(`Marked ROD ${rod.id} as overdue for ${profile?.full_name}`);

      // Get manager for this employee
      const { data: supervisor } = await supabase
        .rpc('get_employee_supervisor', { p_employee_id: rod.employee_id });

      if (supervisor && supervisor.length > 0) {
        // Notify manager
        await supabase.from('notifications').insert({
          user_id: supervisor[0].supervisor_id,
          title: 'Overdue Resumption of Duty',
          message: `${profile?.full_name} has not submitted their Resumption of Duty form - possible no-show alert.`,
          type: 'leave',
          action_url: '/mss',
          is_read: false,
          priority: 'high'
        });
      }

      // Notify HR (users with hr_manager role in same company)
      const { data: hrUsers } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!user_roles_user_id_fkey (
            company_id
          )
        `)
        .eq('role', 'hr_manager');

      for (const hr of hrUsers || []) {
        const hrProfile = hr.profiles as unknown as { company_id: string } | null;
        if (hrProfile?.company_id === rod.company_id) {
          await supabase.from('notifications').insert({
            user_id: hr.user_id,
            title: 'ACTION REQUIRED: Overdue Resumption',
            message: `${profile?.full_name} has not returned from leave and may be a no-show.`,
            type: 'leave',
            action_url: '/leave/dashboard',
            is_read: false,
            priority: 'high'
          });
        }
      }
    }

    // 3. Check for no-shows (overdue > 48 hours) and escalate
    const { data: noShowRods } = await supabase
      .from('resumption_of_duty')
      .select('id, employee_id')
      .eq('status', 'overdue')
      .lt('leave_end_date', twoDaysAgo);

    let noShowCount = 0;
    for (const rod of noShowRods || []) {
      await supabase
        .from('resumption_of_duty')
        .update({ status: 'no_show' })
        .eq('id', rod.id);
      noShowCount++;
      console.log(`Marked ROD ${rod.id} as no_show`);
    }

    const summary = {
      success: true,
      date: today,
      created: createdCount,
      overdue: overdueCount,
      noShow: noShowCount,
      totalEndingLeaves: endingLeaves?.length || 0
    };

    console.log('Processing complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: unknown) {
    console.error('Error in process-resumption-of-duty:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
