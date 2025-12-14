import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface PaymentNotification {
  invoice_reference?: string;
  invoice_number?: string;
  amount?: number;
  payment_date?: string;
  payer_name?: string;
  payer_email?: string;
  payment_method?: string;
  transaction_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error("Invalid webhook secret provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PaymentNotification = await req.json();
    console.log("Received payment notification:", JSON.stringify(payload));

    // Find the invoice by reference or number
    const searchTerm = payload.invoice_reference || payload.invoice_number;
    
    if (!searchTerm) {
      console.error("No invoice reference or number provided");
      return new Response(
        JSON.stringify({ error: "Missing invoice_reference or invoice_number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Search for matching invoice
    const { data: invoice, error: searchError } = await supabase
      .from("invoices")
      .select("id, invoice_number, status, total_amount")
      .or(`invoice_number.eq.${searchTerm},payment_reference.eq.${searchTerm}`)
      .maybeSingle();

    if (searchError) {
      console.error("Error searching for invoice:", searchError);
      return new Response(
        JSON.stringify({ error: "Database error", details: searchError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!invoice) {
      console.log("No invoice found for reference:", searchTerm);
      return new Response(
        JSON.stringify({ error: "Invoice not found", reference: searchTerm }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (invoice.status === "paid") {
      console.log("Invoice already marked as paid:", invoice.invoice_number);
      return new Response(
        JSON.stringify({ message: "Invoice already paid", invoice_number: invoice.invoice_number }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark invoice as paid
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: payload.payment_date || new Date().toISOString(),
        payment_method: payload.payment_method || "bank_transfer",
        payment_transaction_id: payload.transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    if (updateError) {
      console.error("Error updating invoice:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update invoice", details: updateError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Invoice marked as paid:", invoice.invoice_number);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invoice marked as paid",
        invoice_number: invoice.invoice_number,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
