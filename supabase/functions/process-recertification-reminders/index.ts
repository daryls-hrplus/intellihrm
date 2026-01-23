import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecertificationRecord {
  id: string;
  employee_id: string;
  requirement_id: string;
  expiry_date: string;
  status: string;
  reminder_sent_at: string | null;
  auto_request_created: boolean;
  requirement: {
    id: string;
    name: string;
    reminder_days_before: number;
    renewal_course_id: string | null;
    company_id: string;
  };
  employee: {
    id: string;
    full_name: string;
    email: string;
    company_id: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing recertification reminders...");

    const today = new Date();
    const results = {
      processed: 0,
      reminders_sent: 0,
      requests_created: 0,
      expired_updated: 0,
      errors: [] as string[]
    };

    // 1. Find certifications expiring soon that need reminders
    const { data: expiringCerts, error: fetchError } = await supabase
      .from('employee_recertifications')
      .select(`
        id,
        employee_id,
        requirement_id,
        expiry_date,
        status,
        reminder_sent_at,
        auto_request_created,
        requirement:recertification_requirements!inner(
          id,
          name,
          reminder_days_before,
          renewal_course_id,
          company_id
        ),
        employee:profiles!inner(
          id,
          full_name,
          email,
          company_id
        )
      `)
      .eq('status', 'active')
      .is('reminder_sent_at', null)
      .gte('expiry_date', today.toISOString().split('T')[0]);

    if (fetchError) {
      console.error("Error fetching certifications:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringCerts?.length || 0} certifications to check`);

    // Process each expiring certification
    for (const cert of (expiringCerts || []) as unknown as RecertificationRecord[]) {
      try {
        results.processed++;
        
        const expiryDate = new Date(cert.expiry_date);
        const reminderDays = cert.requirement?.reminder_days_before || 30;
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - reminderDays);

        // Check if we're within the reminder window
        if (today >= reminderDate) {
          console.log(`Processing reminder for cert ${cert.id}, expires ${cert.expiry_date}`);

          // Create notification for employee
          await supabase.from('notifications').insert({
            user_id: cert.employee_id,
            title: 'Certification Expiring Soon',
            message: `Your ${cert.requirement?.name} certification expires on ${cert.expiry_date}. Please complete the renewal training.`,
            type: 'recertification',
            metadata: {
              recertification_id: cert.id,
              requirement_id: cert.requirement_id,
              expiry_date: cert.expiry_date
            }
          });

          results.reminders_sent++;

          // If renewal course is configured and no request created yet, create training request
          if (cert.requirement?.renewal_course_id && !cert.auto_request_created) {
            // Get course details
            const { data: course } = await supabase
              .from('lms_courses')
              .select('title')
              .eq('id', cert.requirement.renewal_course_id)
              .single();

            // Create training request
            const { data: request, error: requestError } = await supabase
              .from('training_requests')
              .insert({
                company_id: cert.requirement.company_id,
                employee_id: cert.employee_id,
                training_name: course?.title || `${cert.requirement.name} Renewal`,
                request_type: 'certification',
                source_type: 'recertification',
                source_reference_id: cert.id,
                source_module: 'Recertification',
                status: 'approved', // Auto-approve recertification renewals
                business_justification: `Auto-generated for ${cert.requirement.name} certification renewal expiring ${cert.expiry_date}`
              })
              .select('id')
              .single();

            if (requestError) {
              console.error(`Error creating training request for cert ${cert.id}:`, requestError);
              results.errors.push(`Failed to create request for cert ${cert.id}`);
            } else {
              // Create LMS enrollment (ignore if exists)
              await supabase.from('lms_enrollments').upsert({
                course_id: cert.requirement.renewal_course_id,
                user_id: cert.employee_id,
                status: 'enrolled'
              }, { onConflict: 'course_id,user_id', ignoreDuplicates: true });

              // Update recertification record
              await supabase
                .from('employee_recertifications')
                .update({
                  reminder_sent_at: new Date().toISOString(),
                  auto_request_created: true,
                  auto_request_id: request?.id
                })
                .eq('id', cert.id);

              results.requests_created++;
            }
          } else {
            // Just mark reminder as sent
            await supabase
              .from('employee_recertifications')
              .update({ reminder_sent_at: new Date().toISOString() })
              .eq('id', cert.id);
          }
        }
      } catch (certError) {
        console.error(`Error processing cert ${cert.id}:`, certError);
        results.errors.push(`Error processing cert ${cert.id}: ${certError instanceof Error ? certError.message : 'Unknown'}`);
      }
    }

    // 2. Find and update expired certifications
    const { data: expiredCerts, error: expiredError } = await supabase
      .from('employee_recertifications')
      .select('id')
      .eq('status', 'active')
      .lt('expiry_date', today.toISOString().split('T')[0]);

    if (!expiredError && expiredCerts) {
      for (const expired of expiredCerts) {
        await supabase
          .from('employee_recertifications')
          .update({ status: 'expired' })
          .eq('id', expired.id);
        results.expired_updated++;
      }
    }

    console.log("Recertification processing complete:", results);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recertification Reminders Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
