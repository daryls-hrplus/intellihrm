import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFGenerateRequest {
  cfdiRecordId: string;
  companyId: string;
}

// Simple PDF generation - in production, use a proper PDF library or service
function generateSimplePDF(cfdiData: Record<string, unknown>, companyName: string, uuid: string): string {
  // This is a placeholder - in production you'd use a library like pdf-lib or jsPDF
  // or call an external PDF generation service
  
  const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 300 >>
stream
BT
/F1 16 Tf
50 750 Td
(CFDI - Comprobante Fiscal Digital) Tj
/F1 12 Tf
0 -30 Td
(Empresa: ${companyName}) Tj
0 -20 Td
(UUID: ${uuid}) Tj
0 -20 Td
(Tipo: Nomina) Tj
0 -40 Td
(Este documento es una representacion impresa de un CFDI) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000618 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
697
%%EOF
`;

  // Convert to base64
  const encoder = new TextEncoder();
  const data = encoder.encode(pdfContent);
  const binary = String.fromCharCode(...data);
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cfdiRecordId, companyId }: PDFGenerateRequest = await req.json();

    if (!cfdiRecordId || !companyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get company info
    const { data: companyConfig } = await supabase
      .from('mx_company_registrations')
      .select('razon_social, rfc')
      .eq('company_id', companyId)
      .single();

    // Get CFDI record
    const { data: cfdiRecord, error: cfdiError } = await supabase
      .from('mx_payroll_cfdi')
      .select('*')
      .eq('id', cfdiRecordId)
      .single();

    if (cfdiError || !cfdiRecord) {
      return new Response(
        JSON.stringify({ success: false, error: 'CFDI record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!cfdiRecord.uuid) {
      return new Response(
        JSON.stringify({ success: false, error: 'CFDI has not been stamped' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pdfBase64 = generateSimplePDF(
      cfdiRecord.cfdi_data as Record<string, unknown> || {},
      companyConfig?.razon_social || 'Unknown Company',
      cfdiRecord.uuid
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfBase64,
        filename: `CFDI_${cfdiRecord.uuid}.pdf`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF generation error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
