import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DNSRequest {
  subdomain: string;
  registrationId?: string;
  action?: "create" | "delete";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const cloudflareZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");

    if (!cloudflareApiToken || !cloudflareZoneId) {
      throw new Error("Cloudflare credentials not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { subdomain, registrationId, action = "create" } = await req.json() as DNSRequest;

    if (!subdomain) {
      throw new Error("Subdomain is required");
    }

    // Sanitize subdomain (lowercase, alphanumeric and hyphens only)
    const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
    
    console.log(`DNS ${action} request for subdomain: ${sanitizedSubdomain}`);

    // Get the base domain from zone info
    const zoneResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}`,
      {
        headers: {
          "Authorization": `Bearer ${cloudflareApiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const zoneData = await zoneResponse.json();
    if (!zoneData.success) {
      throw new Error(`Failed to get zone info: ${JSON.stringify(zoneData.errors)}`);
    }

    const baseDomain = zoneData.result.name;
    const fullDomain = `${sanitizedSubdomain}.${baseDomain}`;

    console.log(`Full domain: ${fullDomain}`);

    if (action === "delete") {
      // Find and delete existing DNS record
      const listResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records?name=${fullDomain}`,
        {
          headers: {
            "Authorization": `Bearer ${cloudflareApiToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const listData = await listResponse.json();
      
      if (listData.success && listData.result.length > 0) {
        for (const record of listData.result) {
          const deleteResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records/${record.id}`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${cloudflareApiToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const deleteData = await deleteResponse.json();
          console.log(`Deleted DNS record ${record.id}:`, deleteData.success);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: "deleted",
          subdomain: sanitizedSubdomain,
          domain: fullDomain,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create DNS record - CNAME pointing to main app
    // Using the Lovable app domain for demo subdomains
    const dnsRecordPayload = {
      type: "CNAME",
      name: sanitizedSubdomain,
      content: baseDomain, // Point to the main domain
      ttl: 1, // Auto TTL
      proxied: true, // Enable Cloudflare proxy for SSL
    };

    // Check if record already exists
    const existingResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records?name=${fullDomain}`,
      {
        headers: {
          "Authorization": `Bearer ${cloudflareApiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const existingData = await existingResponse.json();

    let dnsResult;
    if (existingData.success && existingData.result.length > 0) {
      // Update existing record
      const recordId = existingData.result[0].id;
      const updateResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records/${recordId}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${cloudflareApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dnsRecordPayload),
        }
      );
      dnsResult = await updateResponse.json();
      console.log("Updated existing DNS record:", dnsResult.success);
    } else {
      // Create new record
      const createResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cloudflareApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dnsRecordPayload),
        }
      );
      dnsResult = await createResponse.json();
      console.log("Created new DNS record:", dnsResult.success);
    }

    if (!dnsResult.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(dnsResult.errors)}`);
    }

    // Update registration with DNS info if registrationId provided
    if (registrationId) {
      await supabase
        .from("demo_registrations")
        .update({
          dns_configured: true,
          full_domain: fullDomain,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId);
      
      console.log(`Updated registration ${registrationId} with DNS info`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        action: "created",
        subdomain: sanitizedSubdomain,
        domain: fullDomain,
        dnsRecordId: dnsResult.result.id,
        proxied: dnsResult.result.proxied,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("DNS automation error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
