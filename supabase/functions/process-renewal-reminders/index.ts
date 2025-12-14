import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    
    // Get invoice settings for renewal reminder days
    const { data: settings } = await supabase
      .from('invoice_settings')
      .select('*')
      .is('company_id', null)
      .single();

    const reminderDays = settings?.renewal_reminder_days || 10;
    
    // Calculate target date (10 days from now by default)
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + reminderDays);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Find subscriptions renewing on target date
    const { data: renewingSubscriptions, error: subError } = await supabase
      .from('company_subscriptions')
      .select(`
        *,
        company:companies(id, name, email),
        tier:subscription_tiers(name)
      `)
      .eq('status', 'active')
      .lte('current_period_end', targetDateStr)
      .gt('current_period_end', now.toISOString().split('T')[0]);

    if (subError) {
      throw new Error(`Error fetching subscriptions: ${subError.message}`);
    }

    console.log(`Found ${renewingSubscriptions?.length || 0} subscriptions renewing around ${targetDateStr}`);

    const results = {
      processed: 0,
      invoicesCreated: 0,
      errors: [] as string[]
    };

    for (const subscription of renewingSubscriptions || []) {
      try {
        // Check if renewal invoice already exists for this period
        const periodEnd = subscription.current_period_end;
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('subscription_id', subscription.id)
          .eq('invoice_type', 'renewal')
          .eq('billing_period_end', periodEnd)
          .single();

        if (!existingInvoice) {
          // Generate renewal invoice
          const response = await fetch(`${supabaseUrl}/functions/v1/generate-invoice`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({
              subscriptionId: subscription.id,
              invoiceType: 'renewal',
              sendEmail: true
            })
          });

          if (response.ok) {
            results.invoicesCreated++;
          } else {
            const errorData = await response.json();
            results.errors.push(`Subscription ${subscription.id}: ${errorData.error}`);
          }
        }

        results.processed++;
      } catch (err: any) {
        results.errors.push(`Subscription ${subscription.id}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error processing renewal reminders:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});