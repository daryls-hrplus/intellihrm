import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SDICalculationRequest {
  employeeId: string;
  dailySalary: number;
  aguinaldoDays?: number;
  vacationDays?: number;
  vacationPremiumRate?: number;
  otherIntegrableBenefits?: number;
}

interface SDICalculationResult {
  dailySalary: number;
  integrationFactor: number;
  sdi: number;
  sbc: number;
  breakdown: {
    aguinaldoDaily: number;
    vacationPremiumDaily: number;
    otherBenefitsDaily: number;
  };
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

    const {
      employeeId,
      dailySalary,
      aguinaldoDays = 15,
      vacationDays = 12,
      vacationPremiumRate = 0.25,
      otherIntegrableBenefits = 0
    }: SDICalculationRequest = await req.json();

    console.log(`Calculating SDI for employee ${employeeId}`);
    console.log(`Daily salary: ${dailySalary}, Aguinaldo days: ${aguinaldoDays}, Vacation days: ${vacationDays}`);

    // Validate inputs
    if (!dailySalary || dailySalary <= 0) {
      throw new Error('Daily salary must be a positive number');
    }

    // Calculate integration factor per Mexican labor law
    // Formula: 1 + (Aguinaldo days / 365) + (Vacation days * Vacation premium rate / 365)
    const aguinaldoFactor = aguinaldoDays / 365;
    const vacationPremiumFactor = (vacationDays * vacationPremiumRate) / 365;
    const integrationFactor = 1 + aguinaldoFactor + vacationPremiumFactor;

    // Calculate daily amounts
    const aguinaldoDaily = (dailySalary * aguinaldoDays) / 365;
    const vacationPremiumDaily = (dailySalary * vacationDays * vacationPremiumRate) / 365;
    const otherBenefitsDaily = otherIntegrableBenefits / 30; // Assuming monthly benefits

    // Calculate SDI (Salario Diario Integrado)
    const sdi = dailySalary * integrationFactor + (otherBenefitsDaily);

    // SBC (Salario Base de Cotización) is capped at 25 UMA
    // Get current UMA value
    const { data: umaData } = await supabaseClient
      .from('mx_uma_values')
      .select('daily_value')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    const umaDaily = umaData?.daily_value || 113.14; // Default to 2025 value
    const maxSBC = umaDaily * 25;
    const sbc = Math.min(sdi, maxSBC);

    const result: SDICalculationResult = {
      dailySalary,
      integrationFactor: Math.round(integrationFactor * 10000) / 10000,
      sdi: Math.round(sdi * 100) / 100,
      sbc: Math.round(sbc * 100) / 100,
      breakdown: {
        aguinaldoDaily: Math.round(aguinaldoDaily * 100) / 100,
        vacationPremiumDaily: Math.round(vacationPremiumDaily * 100) / 100,
        otherBenefitsDaily: Math.round(otherBenefitsDaily * 100) / 100
      }
    };

    console.log(`SDI calculation complete: SDI=${result.sdi}, SBC=${result.sbc}, Factor=${result.integrationFactor}`);

    // Update employee's SDI if employeeId provided
    if (employeeId) {
      const { error: updateError } = await supabaseClient
        .from('mx_employee_data')
        .upsert({
          employee_id: employeeId,
          sdi: result.sdi,
          sbc: result.sbc,
          sdi_calculation_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'employee_id'
        });

      if (updateError) {
        console.warn('Failed to update employee SDI:', updateError.message);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SDI calculation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
