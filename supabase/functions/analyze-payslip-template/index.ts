import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { layoutContent, layoutFileName, userFeedback, currentSettings } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a payslip template design AI. Analyze the uploaded payslip layout document and extract design settings to recreate a similar template.

From the layout, determine:

1. **Branding Settings:**
   - template_name: A descriptive name based on the layout style
   - template_style: "classic", "modern", or "minimal"
   - primary_color: Main brand color (hex format, e.g., "#1e40af")
   - secondary_color: Secondary color (hex format)
   - accent_color: Accent/highlight color (hex format)
   - company_name_override: If a company name is visible
   - company_address: If address is visible
   - header_text: Any header text or title

2. **Content Display Options:**
   - show_company_logo: true/false
   - show_company_address: true/false
   - show_employee_address: true/false
   - show_employee_id: true/false
   - show_department: true/false
   - show_position: true/false
   - show_bank_details: true/false
   - show_ytd_totals: true/false
   - show_tax_breakdown: true/false
   - show_statutory_breakdown: true/false

3. **Footer & Notices:**
   - footer_text: Any footer text
   - confidentiality_notice: Any confidentiality notices

If user feedback is provided, adjust the settings accordingly.

Return a JSON object with all these settings. Make educated guesses based on common payslip layouts if certain elements aren't clear.`;

    let userMessage = "";
    
    if (layoutContent) {
      userMessage = `Analyze this payslip layout and generate template settings:\n\nFile: ${layoutFileName}\n\nContent:\n${layoutContent}`;
    }
    
    if (userFeedback) {
      userMessage += `\n\nUser feedback to apply:\n${userFeedback}`;
    }
    
    if (currentSettings) {
      userMessage += `\n\nCurrent settings to modify:\n${JSON.stringify(currentSettings, null, 2)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResult = await response.json();
    let settings;
    
    try {
      settings = JSON.parse(aiResult.choices[0].message.content);
    } catch {
      // If JSON parsing fails, return default settings
      settings = {
        template_name: "AI Generated Template",
        template_style: "modern",
        primary_color: "#1e40af",
        secondary_color: "#64748b",
        accent_color: "#059669",
        show_company_logo: true,
        show_company_address: true,
        show_employee_address: true,
        show_employee_id: true,
        show_department: true,
        show_position: true,
        show_bank_details: false,
        show_ytd_totals: true,
        show_tax_breakdown: true,
        show_statutory_breakdown: true,
        footer_text: "This is a computer-generated document.",
        confidentiality_notice: "CONFIDENTIAL",
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      settings,
      message: "Template settings generated from layout analysis."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in analyze-payslip-template:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
