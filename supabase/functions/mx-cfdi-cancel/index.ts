import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CFDICancelRequest {
  cfdiRecordId: string;
  companyId: string;
  reasonCode: string;
  notes?: string;
}

async function cancelWithFinkok(
  uuid: string,
  rfc: string,
  reasonCode: string,
  username: string,
  password: string,
  sandboxMode: boolean
): Promise<{ success: boolean; status?: string; error?: string }> {
  const endpoint = sandboxMode 
    ? 'https://demo-facturacion.finkok.com/servicios/soap/cancel.wsdl'
    : 'https://facturacion.finkok.com/servicios/soap/cancel.wsdl';

  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                      xmlns:apps="apps.services.soap.core.views">
      <soapenv:Header/>
      <soapenv:Body>
        <apps:cancel>
          <apps:UUIDS>
            <apps:uuids>
              <apps:uuid>${uuid}</apps:uuid>
            </apps:uuids>
          </apps:UUIDS>
          <apps:username>${username}</apps:username>
          <apps:password>${password}</apps:password>
          <apps:taxpayer_id>${rfc}</apps:taxpayer_id>
          <apps:motivo>${reasonCode}</apps:motivo>
        </apps:cancel>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await fetch(endpoint.replace('.wsdl', ''), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'cancel'
      },
      body: soapEnvelope
    });

    const responseText = await response.text();
    console.log('Finkok cancel response:', responseText);
    
    // Parse status from response
    const statusMatch = responseText.match(/<EstatusUUID>([^<]+)<\/EstatusUUID>/);
    const status = statusMatch ? statusMatch[1] : null;
    
    // Check for success indicators
    if (status === '201' || status === '202' || responseText.includes('Cancelado') || responseText.includes('Pendiente')) {
      return {
        success: true,
        status: status === '201' ? 'cancelled' : 'pending_acceptance'
      };
    }

    // Check for errors
    const errorMatch = responseText.match(/<faultstring>([^<]+)<\/faultstring>/);
    return {
      success: false,
      error: errorMatch ? errorMatch[1] : 'Cancellation failed'
    };
  } catch (error) {
    console.error('Finkok cancel error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation request failed'
    };
  }
}

async function cancelWithFacturama(
  uuid: string,
  reasonCode: string,
  username: string,
  password: string,
  sandboxMode: boolean
): Promise<{ success: boolean; status?: string; error?: string }> {
  const baseUrl = sandboxMode 
    ? 'https://apisandbox.facturama.mx/api'
    : 'https://api.facturama.mx/api';

  const credentials = btoa(`${username}:${password}`);

  try {
    const response = await fetch(`${baseUrl}/cfdi/${uuid}?motive=${reasonCode}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok || response.status === 204) {
      return {
        success: true,
        status: 'cancelled'
      };
    }

    if (response.status === 202) {
      return {
        success: true,
        status: 'pending_acceptance'
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.Message || `HTTP ${response.status}`
    };
  } catch (error) {
    console.error('Facturama cancel error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation request failed'
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cfdiRecordId, companyId, reasonCode, notes }: CFDICancelRequest = await req.json();

    if (!cfdiRecordId || !companyId || !reasonCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate reason code
    const validReasonCodes = ['01', '02', '03', '04'];
    if (!validReasonCodes.includes(reasonCode)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid cancellation reason code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get company PAC configuration
    const { data: companyConfig, error: configError } = await supabase
      .from('mx_company_registrations')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (configError || !companyConfig) {
      return new Response(
        JSON.stringify({ success: false, error: 'Company configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pacCredentials = companyConfig.pac_credentials as { username?: string; password?: string; sandbox_mode?: boolean } | null;
    
    if (!companyConfig.pac_provider || !pacCredentials?.username || !pacCredentials?.password) {
      return new Response(
        JSON.stringify({ success: false, error: 'PAC credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    if (cfdiRecord.status !== 'stamped' || !cfdiRecord.uuid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Only stamped CFDIs can be cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cfdiRecord.cancellation_status) {
      return new Response(
        JSON.stringify({ success: false, error: 'CFDI already has a cancellation status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let cancelResult: { success: boolean; status?: string; error?: string };

    switch (companyConfig.pac_provider.toLowerCase()) {
      case 'finkok':
        cancelResult = await cancelWithFinkok(
          cfdiRecord.uuid,
          companyConfig.rfc,
          reasonCode,
          pacCredentials.username,
          pacCredentials.password,
          pacCredentials.sandbox_mode ?? true
        );
        break;
      case 'facturama':
        cancelResult = await cancelWithFacturama(
          cfdiRecord.uuid,
          reasonCode,
          pacCredentials.username,
          pacCredentials.password,
          pacCredentials.sandbox_mode ?? true
        );
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Cancellation not supported for PAC: ${companyConfig.pac_provider}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Update CFDI record
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (cancelResult.success) {
      updatePayload.cancellation_status = cancelResult.status === 'cancelled' ? 'cancelled' : 'pending_cancellation';
      updatePayload.cancellation_reason = reasonCode;
      updatePayload.cancellation_notes = notes || null;
      updatePayload.cancelled_at = cancelResult.status === 'cancelled' ? new Date().toISOString() : null;
    } else {
      updatePayload.cancellation_status = 'error';
      updatePayload.cancellation_error = cancelResult.error;
    }

    const { error: updateError } = await supabase
      .from('mx_payroll_cfdi')
      .update(updatePayload)
      .eq('id', cfdiRecordId);

    if (updateError) {
      console.error('Failed to update CFDI record:', updateError);
    }

    if (cancelResult.success) {
      const message = cancelResult.status === 'cancelled' 
        ? 'CFDI cancelled successfully' 
        : 'Cancellation submitted, pending recipient acceptance';
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: cancelResult.status,
          message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: cancelResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('CFDI cancellation error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
