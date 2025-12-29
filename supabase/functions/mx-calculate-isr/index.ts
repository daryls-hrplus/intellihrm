import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ISRCalculationRequest {
  grossIncome: number;
  periodType?: 'monthly' | 'biweekly' | 'weekly';
  year?: number;
  includeSubsidy?: boolean;
  exemptIncome?: number;
}

interface ISRBracket {
  lower_limit: number;
  upper_limit: number | null;
  fixed_fee: number;
  rate_over_excess: number;
}

interface ISRCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  isrBeforeSubsidy: number;
  subsidioAlEmpleo: number;
  netISR: number;
  effectiveRate: number;
  bracket: {
    lowerLimit: number;
    upperLimit: number | null;
    fixedFee: number;
    marginalRate: number;
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
      grossIncome,
      periodType = 'monthly',
      year = new Date().getFullYear(),
      includeSubsidy = true,
      exemptIncome = 0
    }: ISRCalculationRequest = await req.json();

    console.log(`Calculating ISR for gross income: ${grossIncome}, period: ${periodType}, year: ${year}`);

    // Validate inputs
    if (grossIncome < 0) {
      throw new Error('Gross income cannot be negative');
    }

    // Convert to monthly if needed for bracket lookup
    let monthlyIncome = grossIncome;
    let periodFactor = 1;
    
    switch (periodType) {
      case 'biweekly':
        periodFactor = 2;
        monthlyIncome = grossIncome * 2;
        break;
      case 'weekly':
        periodFactor = 4.33;
        monthlyIncome = grossIncome * 4.33;
        break;
    }

    const taxableIncome = Math.max(0, monthlyIncome - exemptIncome);

    // Fetch ISR brackets
    const { data: brackets, error: bracketsError } = await supabaseClient
      .from('mx_isr_brackets')
      .select('lower_limit, upper_limit, fixed_fee, rate_over_excess')
      .eq('period_type', 'monthly')
      .eq('effective_year', year)
      .eq('is_active', true)
      .order('lower_limit', { ascending: true });

    if (bracketsError || !brackets || brackets.length === 0) {
      throw new Error('Failed to fetch ISR brackets for the specified year');
    }

    // Find applicable bracket
    let applicableBracket: ISRBracket | null = null;
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.lower_limit && 
          (bracket.upper_limit === null || taxableIncome <= bracket.upper_limit)) {
        applicableBracket = bracket;
        break;
      }
    }

    if (!applicableBracket) {
      // Use highest bracket if income exceeds all brackets
      applicableBracket = brackets[brackets.length - 1];
    }

    // Calculate ISR
    // Formula: Fixed Fee + ((Taxable Income - Lower Limit) * Marginal Rate)
    const excessOverLimit = taxableIncome - applicableBracket.lower_limit;
    const taxOnExcess = excessOverLimit * applicableBracket.rate_over_excess;
    const monthlyISR = applicableBracket.fixed_fee + taxOnExcess;

    // Calculate Subsidio al Empleo if applicable
    let subsidioAlEmpleo = 0;
    if (includeSubsidy && taxableIncome > 0) {
      const { data: subsidyData } = await supabaseClient
        .from('mx_subsidio_empleo')
        .select('monthly_subsidy')
        .eq('effective_year', year)
        .eq('is_active', true)
        .lte('min_income', taxableIncome)
        .gte('max_income', taxableIncome)
        .limit(1)
        .single();

      if (subsidyData) {
        subsidioAlEmpleo = subsidyData.monthly_subsidy;
      }
    }

    // Net ISR (can be negative if subsidy exceeds tax)
    const netMonthlyISR = Math.max(0, monthlyISR - subsidioAlEmpleo);
    
    // Convert back to period
    const periodISR = netMonthlyISR / periodFactor;
    const periodSubsidy = subsidioAlEmpleo / periodFactor;

    const result: ISRCalculationResult = {
      grossIncome,
      taxableIncome: Math.round((taxableIncome / periodFactor) * 100) / 100,
      isrBeforeSubsidy: Math.round((monthlyISR / periodFactor) * 100) / 100,
      subsidioAlEmpleo: Math.round(periodSubsidy * 100) / 100,
      netISR: Math.round(periodISR * 100) / 100,
      effectiveRate: grossIncome > 0 
        ? Math.round((periodISR / grossIncome) * 10000) / 100 
        : 0,
      bracket: {
        lowerLimit: applicableBracket.lower_limit,
        upperLimit: applicableBracket.upper_limit,
        fixedFee: applicableBracket.fixed_fee,
        marginalRate: applicableBracket.rate_over_excess
      }
    };

    console.log(`ISR calculation complete: Net ISR=${result.netISR}, Effective rate=${result.effectiveRate}%`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ISR calculation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
