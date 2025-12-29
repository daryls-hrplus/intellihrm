import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ISNCalculationRequest {
  stateCode: string;
  totalPayroll: number;
}

interface ISNCalculationResult {
  stateCode: string;
  stateName: string;
  rate: number;
  totalPayroll: number;
  isnAmount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { stateCode, totalPayroll }: ISNCalculationRequest = await req.json();

    console.log(`Calculating ISN for state: ${stateCode}, payroll: ${totalPayroll}`);

    // Validate inputs
    if (!stateCode) {
      throw new Error('State code is required');
    }
    if (totalPayroll < 0) {
      throw new Error('Total payroll cannot be negative');
    }

    // Fetch state rate
    const { data: stateData, error: stateError } = await supabaseClient
      .from('mx_isn_rates')
      .select('state_code, state_name, rate')
      .eq('state_code', stateCode.toUpperCase())
      .eq('is_active', true)
      .limit(1)
      .single();

    if (stateError || !stateData) {
      throw new Error(`ISN rate not found for state: ${stateCode}`);
    }

    const isnAmount = totalPayroll * stateData.rate;

    const result: ISNCalculationResult = {
      stateCode: stateData.state_code,
      stateName: stateData.state_name,
      rate: stateData.rate,
      totalPayroll,
      isnAmount: Math.round(isnAmount * 100) / 100
    };

    console.log(`ISN calculation complete: ${result.stateName} @ ${result.rate * 100}% = ${result.isnAmount}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ISN calculation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
