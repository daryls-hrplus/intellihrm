import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapping of import types to their database tables
const IMPORT_TYPE_TABLES: Record<string, string> = {
  companies: "companies",
  divisions: "divisions",
  departments: "departments",
  sections: "sections",
  jobs: "jobs",
  job_families: "job_families",
  positions: "positions",
  employees: "profiles",
  new_hires: "profiles",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchId, reason, userId } = await req.json();

    if (!batchId) {
      return new Response(
        JSON.stringify({ success: false, error: "Batch ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Rollback reason is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting rollback for batch ${batchId}, reason: ${reason}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the batch
    const { data: batch, error: fetchError } = await supabase
      .from("import_batches")
      .select("*")
      .eq("id", batchId)
      .single();

    if (fetchError || !batch) {
      console.error("Batch not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Import batch not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if batch is eligible for rollback
    if (batch.status !== "committed") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Cannot rollback batch with status: ${batch.status}. Only committed batches can be rolled back.` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rollback eligibility period (30 days)
    const committedAt = new Date(batch.committed_at || batch.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (batch.rollback_eligible_until) {
      if (new Date(batch.rollback_eligible_until) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: "Rollback period has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (committedAt < thirtyDaysAgo) {
      return new Response(
        JSON.stringify({ success: false, error: "Rollback period has expired (30 days)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tableName = IMPORT_TYPE_TABLES[batch.import_type];
    if (!tableName) {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown import type: ${batch.import_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get record IDs to delete
    const recordIds = Array.isArray(batch.imported_record_ids) 
      ? batch.imported_record_ids 
      : [];

    console.log(`Found ${recordIds.length} record IDs to delete from ${tableName}`);

    let deletedCount = 0;

    if (recordIds.length > 0) {
      // Delete records in batches of 100 to avoid timeout
      const chunkSize = 100;
      for (let i = 0; i < recordIds.length; i += chunkSize) {
        const chunk = recordIds.slice(i, i + chunkSize);
        
        const { error: deleteError, count } = await supabase
          .from(tableName)
          .delete()
          .in("id", chunk);

        if (deleteError) {
          console.error(`Error deleting chunk ${i / chunkSize + 1}:`, deleteError);
          // Continue with other chunks even if one fails
        } else {
          deletedCount += count || chunk.length;
        }
      }
    } else {
      console.log("No record IDs stored, cannot rollback specific records");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No record IDs stored for this import. Rollback not possible." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update batch status
    const { error: updateError } = await supabase
      .from("import_batches")
      .update({
        status: "rolled_back",
        rolled_back_at: new Date().toISOString(),
        rolled_back_by: userId,
        rollback_reason: reason.trim(),
      })
      .eq("id", batchId);

    if (updateError) {
      console.error("Error updating batch status:", updateError);
    }

    console.log(`Rollback complete. Deleted ${deletedCount} records.`);

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        message: `Successfully rolled back ${deletedCount} records`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Rollback error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
