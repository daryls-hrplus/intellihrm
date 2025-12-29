import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IMSSCalculationRequest {
  sbc: number; // Salario Base de Cotización
  riskClass?: 1 | 2 | 3 | 4 | 5;
  daysWorked?: number;
}

interface IMSSContribution {
  concept: string;
  conceptCode: string;
  employerAmount: number;
  employeeAmount: number;
  totalAmount: number;
}

interface IMSSCalculationResult {
  sbc: number;
  sbcCapped: number;
  daysWorked: number;
  riskClass: number;
  contributions: IMSSContribution[];
  totals: {
    employerTotal: number;
    employeeTotal: number;
    grandTotal: number;
  };
  infonavit: {
    employerAmount: number;
  };
  retiro: {
    employerAmount: number;
    employeeAmount: number;
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
      sbc,
      riskClass = 2,
      daysWorked = 30
    }: IMSSCalculationRequest = await req.json();

    console.log(`Calculating IMSS for SBC: ${sbc}, Risk Class: ${riskClass}, Days: ${daysWorked}`);

    // Validate inputs
    if (sbc <= 0) {
      throw new Error('SBC must be a positive number');
    }
    if (riskClass < 1 || riskClass > 5) {
      throw new Error('Risk class must be between 1 and 5');
    }

    // Get UMA value for caps and fixed contributions
    const { data: umaData } = await supabaseClient
      .from('mx_uma_values')
      .select('daily_value, monthly_value')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    const umaDaily = umaData?.daily_value || 113.14;
    const umaMonthly = umaData?.monthly_value || 3439.46;
    
    // Cap SBC at 25 UMA
    const maxSBC = umaDaily * 25;
    const sbcCapped = Math.min(sbc, maxSBC);
    const monthlySBC = sbcCapped * daysWorked;
    
    // Get IMSS rates
    const { data: rates, error: ratesError } = await supabaseClient
      .from('mx_imss_rates')
      .select('*')
      .eq('is_active', true);

    if (ratesError || !rates) {
      throw new Error('Failed to fetch IMSS rates');
    }

    const contributions: IMSSContribution[] = [];
    let employerTotal = 0;
    let employeeTotal = 0;

    // Calculate each IMSS component
    for (const rate of rates) {
      let employerAmount = 0;
      let employeeAmount = 0;
      let base = monthlySBC;

      // Handle special cases
      if (rate.concept_code === 'ENF_MAT_ESP') {
        // Fixed quota based on UMA, not SBC
        base = umaMonthly;
        employerAmount = base * rate.employer_rate;
      } else if (rate.concept_code === 'ENF_MAT_EXC') {
        // Only applies to excess over 3 SMDF (using 3 UMA as reference)
        const threeUMA = umaDaily * 3 * daysWorked;
        const excess = Math.max(0, monthlySBC - threeUMA);
        if (excess > 0) {
          employerAmount = excess * rate.employer_rate;
          employeeAmount = excess * rate.employee_rate;
        }
      } else if (rate.concept_code.startsWith('RIESGO_')) {
        // Only calculate risk rate for the company's risk class
        const rateClass = parseInt(rate.concept_code.split('_')[1]);
        if (rateClass === riskClass) {
          employerAmount = monthlySBC * rate.employer_rate;
        } else {
          continue; // Skip other risk classes
        }
      } else {
        // Standard calculation
        employerAmount = monthlySBC * rate.employer_rate;
        employeeAmount = monthlySBC * rate.employee_rate;
      }

      if (employerAmount > 0 || employeeAmount > 0) {
        contributions.push({
          concept: rate.concept_name,
          conceptCode: rate.concept_code,
          employerAmount: Math.round(employerAmount * 100) / 100,
          employeeAmount: Math.round(employeeAmount * 100) / 100,
          totalAmount: Math.round((employerAmount + employeeAmount) * 100) / 100
        });

        employerTotal += employerAmount;
        employeeTotal += employeeAmount;
      }
    }

    // INFONAVIT (5% employer only)
    const infonavitAmount = monthlySBC * 0.05;

    // Retiro (SAR) is included in rates, but let's extract it separately
    const retiroRate = rates.find(r => r.concept_code === 'RETIRO');
    const retiroEmployer = retiroRate ? monthlySBC * retiroRate.employer_rate : monthlySBC * 0.02;

    const result: IMSSCalculationResult = {
      sbc,
      sbcCapped,
      daysWorked,
      riskClass,
      contributions,
      totals: {
        employerTotal: Math.round(employerTotal * 100) / 100,
        employeeTotal: Math.round(employeeTotal * 100) / 100,
        grandTotal: Math.round((employerTotal + employeeTotal) * 100) / 100
      },
      infonavit: {
        employerAmount: Math.round(infonavitAmount * 100) / 100
      },
      retiro: {
        employerAmount: Math.round(retiroEmployer * 100) / 100,
        employeeAmount: 0
      }
    };

    console.log(`IMSS calculation complete: Employer=${result.totals.employerTotal}, Employee=${result.totals.employeeTotal}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('IMSS calculation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
