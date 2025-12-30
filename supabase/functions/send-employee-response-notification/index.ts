import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 
  | 'review_submitted'        // Manager submitted review, employee needs to respond
  | 'response_deadline'       // Employee response deadline approaching
  | 'employee_escalated'      // Employee escalated to HR
  | 'hr_responded'            // HR responded to escalation
  | 'manager_rebuttal'        // Manager added rebuttal
  | 'response_submitted';     // Employee submitted response

interface NotificationPayload {
  type: NotificationType;
  employee_id: string;
  manager_id?: string;
  hr_reviewer_id?: string;
  response_id?: string;
  appraisal_participant_id?: string;
  cycle_name?: string;
  deadline_date?: string;
  company_id: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

const getNotificationContent = (
  type: NotificationType,
  data: {
    employeeName?: string;
    managerName?: string;
    hrName?: string;
    cycleName?: string;
    deadlineDate?: string;
  }
): { title: string; message: string; link: string } => {
  switch (type) {
    case 'review_submitted':
      return {
        title: 'Performance Review Ready for Your Response',
        message: `Your manager has submitted your performance review${data.cycleName ? ` for ${data.cycleName}` : ''}. Please review and provide your feedback.`,
        link: '/ess/my-appraisals',
      };

    case 'response_deadline':
      return {
        title: 'Response Deadline Approaching',
        message: `Your deadline to respond to your performance review${data.cycleName ? ` (${data.cycleName})` : ''} is ${data.deadlineDate || 'soon'}. Please submit your response.`,
        link: '/ess/my-appraisals',
      };

    case 'employee_escalated':
      return {
        title: 'Employee Escalation Requires Your Review',
        message: `${data.employeeName || 'An employee'} has escalated their performance review response for HR review.`,
        link: '/hr-hub/employee-voice',
      };

    case 'hr_responded':
      return {
        title: 'HR Has Responded to Your Escalation',
        message: `HR has reviewed and responded to your performance review escalation${data.cycleName ? ` for ${data.cycleName}` : ''}.`,
        link: '/ess/my-appraisals',
      };

    case 'manager_rebuttal':
      return {
        title: 'Manager Response to Your Feedback',
        message: `${data.managerName || 'Your manager'} has responded to your performance review feedback${data.cycleName ? ` for ${data.cycleName}` : ''}.`,
        link: '/ess/my-appraisals',
      };

    case 'response_submitted':
      return {
        title: 'Employee Submitted Review Response',
        message: `${data.employeeName || 'An employee'} has submitted their response to the performance review${data.cycleName ? ` for ${data.cycleName}` : ''}.`,
        link: '/hr-hub/employee-voice',
      };

    default:
      return {
        title: 'Performance Review Update',
        message: 'There is an update regarding your performance review.',
        link: '/ess/my-appraisals',
      };
  }
};

const getEmailContent = (
  type: NotificationType,
  data: {
    recipientName: string;
    employeeName?: string;
    managerName?: string;
    hrName?: string;
    cycleName?: string;
    deadlineDate?: string;
    appUrl: string;
  }
): { subject: string; html: string } => {
  const baseStyles = `
    <style>
      .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { color: #1f2937; margin-bottom: 20px; }
      .content { color: #4b5563; font-size: 16px; line-height: 1.6; }
      .highlight { background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; }
      .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 20px; }
      .footer { color: #9ca3af; font-size: 14px; margin-top: 32px; }
    </style>
  `;

  switch (type) {
    case 'review_submitted':
      return {
        subject: `Action Required: Your Performance Review is Ready for Response`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">Performance Review Ready for Your Response</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content">Your manager has submitted your performance review${data.cycleName ? ` for <strong>${data.cycleName}</strong>` : ''}.</p>
            <div class="highlight">
              <p style="margin: 0;"><strong>What you need to do:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Review your manager's assessment</li>
                <li>Acknowledge or provide your feedback</li>
                <li>Submit your response before the deadline</li>
              </ul>
            </div>
            <a href="${data.appUrl}/ess/my-appraisals" class="button">View & Respond</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };

    case 'response_deadline':
      return {
        subject: `Reminder: Performance Review Response Due ${data.deadlineDate || 'Soon'}`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">Response Deadline Approaching</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content">This is a reminder that your deadline to respond to your performance review is approaching.</p>
            <div class="highlight">
              ${data.cycleName ? `<p style="margin: 0 0 8px 0;"><strong>Cycle:</strong> ${data.cycleName}</p>` : ''}
              ${data.deadlineDate ? `<p style="margin: 0; color: #dc2626;"><strong>⏰ Deadline:</strong> ${data.deadlineDate}</p>` : ''}
            </div>
            <p class="content">Please log in and submit your response to avoid missing the deadline.</p>
            <a href="${data.appUrl}/ess/my-appraisals" class="button">Submit Response</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };

    case 'employee_escalated':
      return {
        subject: `HR Review Required: Employee Escalation`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">Employee Escalation Requires Your Review</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content"><strong>${data.employeeName || 'An employee'}</strong> has escalated their performance review response and is requesting HR intervention.</p>
            <div class="highlight">
              ${data.cycleName ? `<p style="margin: 0 0 8px 0;"><strong>Cycle:</strong> ${data.cycleName}</p>` : ''}
              <p style="margin: 0;"><strong>Status:</strong> Pending HR Review</p>
            </div>
            <p class="content">Please review the escalation and provide your response.</p>
            <a href="${data.appUrl}/hr-hub/employee-voice" class="button">Review Escalation</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };

    case 'hr_responded':
      return {
        subject: `Update: HR Has Responded to Your Escalation`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">HR Response to Your Escalation</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content">HR has reviewed and responded to your performance review escalation${data.cycleName ? ` for <strong>${data.cycleName}</strong>` : ''}.</p>
            <p class="content">Please log in to view the HR response and any actions taken.</p>
            <a href="${data.appUrl}/ess/my-appraisals" class="button">View Response</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };

    case 'manager_rebuttal':
      return {
        subject: `Your Manager Has Responded to Your Feedback`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">Manager Response to Your Feedback</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content"><strong>${data.managerName || 'Your manager'}</strong> has reviewed and responded to your performance review feedback${data.cycleName ? ` for <strong>${data.cycleName}</strong>` : ''}.</p>
            <p class="content">Please log in to view their response.</p>
            <a href="${data.appUrl}/ess/my-appraisals" class="button">View Response</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };

    case 'response_submitted':
      return {
        subject: `Employee Response Submitted: Performance Review`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">Employee Response Submitted</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content"><strong>${data.employeeName || 'An employee'}</strong> has submitted their response to the performance review${data.cycleName ? ` for <strong>${data.cycleName}</strong>` : ''}.</p>
            <p class="content">You can review their response in the Employee Voice dashboard.</p>
            <a href="${data.appUrl}/hr-hub/employee-voice" class="button">View Response</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };

    default:
      return {
        subject: `Performance Review Update`,
        html: `
          ${baseStyles}
          <div class="container">
            <h2 class="header">Performance Review Update</h2>
            <p class="content">Hello ${data.recipientName},</p>
            <p class="content">There is an update regarding your performance review.</p>
            <a href="${data.appUrl}/ess/my-appraisals" class="button">View Details</a>
            <p class="footer">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log("Received employee response notification request:", payload);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine recipients based on notification type
    let recipientIds: string[] = [];
    let recipientProfiles: Profile[] = [];

    switch (payload.type) {
      case 'review_submitted':
      case 'response_deadline':
      case 'hr_responded':
      case 'manager_rebuttal':
        recipientIds = [payload.employee_id];
        break;

      case 'employee_escalated':
        // Get HR users for the company
        const { data: hrUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'hr');
        
        if (hrUsers?.length) {
          const { data: hrProfiles } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', hrUsers.map((u: any) => u.user_id))
            .eq('company_id', payload.company_id);
          
          recipientProfiles = hrProfiles || [];
          recipientIds = recipientProfiles.map((p: Profile) => p.id);
        }
        break;

      case 'response_submitted':
        // Notify HR and optionally manager
        const recipients: string[] = [];
        if (payload.manager_id) recipients.push(payload.manager_id);
        
        const { data: hrUsersForResponse } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'hr');
        
        if (hrUsersForResponse?.length) {
          const { data: hrProfilesForResponse } = await supabase
            .from('profiles')
            .select('id')
            .in('id', hrUsersForResponse.map((u: any) => u.user_id))
            .eq('company_id', payload.company_id);
          
          hrProfilesForResponse?.forEach((p: any) => recipients.push(p.id));
        }
        recipientIds = [...new Set(recipients)];
        break;
    }

    // Get recipient profiles if not already fetched
    if (recipientIds.length > 0 && recipientProfiles.length === 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', recipientIds);
      
      recipientProfiles = profiles || [];
    }

    // Get employee, manager, HR names for message content
    let employeeName = '';
    let managerName = '';
    let hrName = '';

    if (payload.employee_id) {
      const { data: emp } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', payload.employee_id)
        .single();
      employeeName = emp?.full_name || '';
    }

    if (payload.manager_id) {
      const { data: mgr } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', payload.manager_id)
        .single();
      managerName = mgr?.full_name || '';
    }

    if (payload.hr_reviewer_id) {
      const { data: hr } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', payload.hr_reviewer_id)
        .single();
      hrName = hr?.full_name || '';
    }

    const notificationData = {
      employeeName,
      managerName,
      hrName,
      cycleName: payload.cycle_name,
      deadlineDate: payload.deadline_date,
    };

    const { title, message, link } = getNotificationContent(payload.type, notificationData);

    // Create in-app notifications
    let notificationsCreated = 0;
    let emailsSent = 0;

    for (const profile of recipientProfiles) {
      // Create in-app notification
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: profile.id,
        title,
        message,
        type: 'system',
        link,
      });

      if (!notifError) {
        notificationsCreated++;
        console.log(`Created notification for ${profile.email}`);
      } else {
        console.error(`Failed to create notification for ${profile.email}:`, notifError);
      }

      // Check email preferences and send email
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('email_notifications, performance_review_updates')
        .eq('user_id', profile.id)
        .single();

      const emailEnabled = prefs?.email_notifications !== false && 
                          prefs?.performance_review_updates !== false;

      if (emailEnabled && resendApiKey && profile.email) {
        const appUrl = supabaseUrl.replace('.supabase.co', '');
        const { subject, html } = getEmailContent(payload.type, {
          recipientName: profile.full_name || 'there',
          employeeName,
          managerName,
          hrName,
          cycleName: payload.cycle_name,
          deadlineDate: payload.deadline_date,
          appUrl,
        });

        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "HRIS System <noreply@resend.dev>",
              to: [profile.email],
              subject,
              html,
            }),
          });

          if (emailResponse.ok) {
            emailsSent++;
            console.log(`Email sent to ${profile.email}`);
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email to ${profile.email}:`, errorText);
          }
        } catch (emailError) {
          console.error(`Email error for ${profile.email}:`, emailError);
        }
      }
    }

    console.log(`Notifications complete: ${notificationsCreated} in-app, ${emailsSent} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        notificationsCreated,
        emailsSent,
        recipients: recipientProfiles.map((p: Profile) => p.email),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-employee-response-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
