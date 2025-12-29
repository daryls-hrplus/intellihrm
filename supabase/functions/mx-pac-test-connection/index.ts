import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestConnectionRequest {
  provider: string;
  username: string;
  password: string;
  sandboxMode?: boolean;
}

// PAC provider endpoints for testing connections
const PAC_ENDPOINTS = {
  finkok: {
    sandbox: 'https://demo-facturacion.finkok.com/servicios/soap/stamp.wsdl',
    production: 'https://facturacion.finkok.com/servicios/soap/stamp.wsdl'
  },
  facturama: {
    sandbox: 'https://apisandbox.facturama.mx/api',
    production: 'https://api.facturama.mx/api'
  },
  sat: {
    sandbox: 'https://pruebas.sat.gob.mx/sicofi_web/moduloECB/ServicioValidacion.asmx',
    production: 'https://www.sat.gob.mx/sicofi_web/moduloECB/ServicioValidacion.asmx'
  }
};

async function testFinkokConnection(username: string, password: string, sandboxMode: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const endpoint = sandboxMode ? PAC_ENDPOINTS.finkok.sandbox : PAC_ENDPOINTS.finkok.production;
    
    // Finkok uses SOAP - we'll make a simple request to check credentials
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                        xmlns:apps="apps.services.soap.core.views">
        <soapenv:Header/>
        <soapenv:Body>
          <apps:get_sat_status>
            <apps:username>${username}</apps:username>
            <apps:password>${password}</apps:password>
            <apps:taxpayer_id>AAA010101AAA</apps:taxpayer_id>
            <apps:rtaxpayer_id>AAA010101AAA</apps:rtaxpayer_id>
            <apps:uuid>00000000-0000-0000-0000-000000000000</apps:uuid>
            <apps:total>0.00</apps:total>
          </apps:get_sat_status>
        </soapenv:Body>
      </soapenv:Envelope>`;

    const response = await fetch(endpoint.replace('stamp.wsdl', 'cancel.wsdl'), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'get_sat_status'
      },
      body: soapEnvelope
    });

    if (response.ok) {
      const text = await response.text();
      // Check if response indicates valid credentials
      if (text.includes('faultcode') && text.includes('Invalid credentials')) {
        return { success: false, error: 'Invalid credentials' };
      }
      return { success: true };
    }
    
    return { success: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

async function testFacturamaConnection(username: string, password: string, sandboxMode: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = sandboxMode ? PAC_ENDPOINTS.facturama.sandbox : PAC_ENDPOINTS.facturama.production;
    
    // Facturama uses basic auth - test with a simple API call
    const credentials = btoa(`${username}:${password}`);
    
    const response = await fetch(`${baseUrl}/account`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { success: true };
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    return { success: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

async function testSatConnection(username: string, password: string, sandboxMode: boolean): Promise<{ success: boolean; error?: string }> {
  // SAT direct connection requires FIEL (electronic signature) - return info message
  return { 
    success: true, 
    error: 'SAT direct connection configured. FIEL certificate validation will occur during stamping.' 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, username, password, sandboxMode = true }: TestConnectionRequest = await req.json();

    if (!provider || !username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: { success: boolean; error?: string };

    switch (provider.toLowerCase()) {
      case 'finkok':
        result = await testFinkokConnection(username, password, sandboxMode);
        break;
      case 'facturama':
        result = await testFacturamaConnection(username, password, sandboxMode);
        break;
      case 'sat':
        result = await testSatConnection(username, password, sandboxMode);
        break;
      default:
        result = { success: false, error: `Unsupported PAC provider: ${provider}` };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
