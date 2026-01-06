import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExternalInviteRequest {
  action: 'send_invite' | 'validate_token' | 'resend_invite';
  cycle_id?: string;
  subject_employee_id?: string;
  external_email?: string;
  external_name?: string;
  external_organization?: string;
  external_relationship?: string;
  rater_category_id?: string;
  access_token?: string;
  company_id: string;
}

function generateAccessToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: ExternalInviteRequest = await req.json();
    const { action, company_id } = request;

    console.log(`[feedback-external-invite] Action: ${action}`);

    if (action === 'send_invite') {
      const { 
        cycle_id, 
        subject_employee_id, 
        external_email, 
        external_name,
        external_organization,
        external_relationship,
        rater_category_id 
      } = request;

      if (!cycle_id || !subject_employee_id || !external_email || !external_name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: cycle_id, subject_employee_id, external_email, external_name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate unique access token
      const access_token = generateAccessToken();
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Get cycle details
      const { data: cycle } = await supabase
        .from('feedback_360_cycles')
        .select('name, end_date')
        .eq('id', cycle_id)
        .single();

      // Get subject employee name
      const { data: subject } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', subject_employee_id)
        .single();

      // Create feedback request for external rater
      const { data: feedbackRequest, error: insertError } = await supabase
        .from('feedback_360_requests')
        .insert({
          cycle_id,
          subject_employee_id,
          rater_id: null, // No internal rater
          rater_category_id,
          status: 'pending',
          is_mandatory: false,
          external_email,
          external_name,
          external_organization,
          external_relationship,
          consent_given: false,
          access_token,
          access_token_expires_at: expires_at.toISOString(),
          due_date: cycle?.end_date
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create feedback request: ${insertError.message}`);
      }

      // Get company settings for email template
      const { data: raterCategory } = await supabase
        .from('feedback_360_rater_categories')
        .select('external_invitation_template')
        .eq('id', rater_category_id)
        .single();

      // TODO: Send email invitation using your email service
      // For now, just log the invitation details
      console.log(`[feedback-external-invite] Invitation created:`, {
        request_id: feedbackRequest.id,
        external_email,
        external_name,
        subject_name: subject?.full_name,
        cycle_name: cycle?.name,
        access_token_preview: access_token.substring(0, 8) + '...',
        expires_at
      });

      return new Response(
        JSON.stringify({
          success: true,
          request_id: feedbackRequest.id,
          message: `Invitation sent to ${external_email}`,
          feedback_url: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/feedback/external/${access_token}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate_token') {
      const { access_token } = request;

      if (!access_token) {
        return new Response(
          JSON.stringify({ error: 'Access token required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find request by token
      const { data: feedbackRequest, error } = await supabase
        .from('feedback_360_requests')
        .select(`
          *,
          cycle:feedback_360_cycles(id, name, end_date, status),
          subject:profiles!feedback_360_requests_subject_employee_id_fkey(full_name, job_title),
          rater_category:feedback_360_rater_categories(name, external_consent_required)
        `)
        .eq('access_token', access_token)
        .single();

      if (error || !feedbackRequest) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid or expired access token' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if token expired
      if (new Date(feedbackRequest.access_token_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Access token has expired' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if already submitted
      if (feedbackRequest.status === 'completed') {
        return new Response(
          JSON.stringify({ valid: false, error: 'Feedback already submitted' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if cycle is still active
      if (feedbackRequest.cycle?.status !== 'active') {
        return new Response(
          JSON.stringify({ valid: false, error: 'Feedback cycle is no longer active' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          request: {
            id: feedbackRequest.id,
            cycle_id: feedbackRequest.cycle_id,
            cycle_name: feedbackRequest.cycle?.name,
            subject_name: feedbackRequest.subject?.full_name,
            subject_title: feedbackRequest.subject?.job_title,
            external_name: feedbackRequest.external_name,
            external_relationship: feedbackRequest.external_relationship,
            rater_category: feedbackRequest.rater_category?.name,
            consent_required: feedbackRequest.rater_category?.external_consent_required,
            consent_given: feedbackRequest.consent_given,
            due_date: feedbackRequest.due_date
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'resend_invite') {
      const { access_token } = request;

      if (!access_token) {
        return new Response(
          JSON.stringify({ error: 'Access token required for resend' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find and update the request with new expiry
      const new_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { data: feedbackRequest, error } = await supabase
        .from('feedback_360_requests')
        .update({ access_token_expires_at: new_expires_at.toISOString() })
        .eq('access_token', access_token)
        .select('id, external_email, external_name')
        .single();

      if (error || !feedbackRequest) {
        return new Response(
          JSON.stringify({ error: 'Request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // TODO: Resend email

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation resent to ${feedbackRequest.external_email}`,
          new_expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[feedback-external-invite] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
