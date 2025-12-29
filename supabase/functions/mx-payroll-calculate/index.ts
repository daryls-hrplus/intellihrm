import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MexicanPayrollRequest {
  employeeId: string;
  companyId: string;
  periodStart: string;
  periodEnd: string;
  perceptions: {
    code: string;
    amount: number;
    description?: string;
  }[];
  deductions?: {
    code: string;
    amount: number;
    description?: string;
  }[];
}

interface PayrollCalculationResult {
  employee: {
    id: string;
    curp: string;
    rfc: string;
    nss: string;
  };
  period: {
    start: string;
    end: string;
    daysWorked: number;
  };
  perceptions: {
    code: string;
    description: string;
    taxable: number;
    exempt: number;
    total: number;
  }[];
  deductions: {
    code: string;
    description: string;
    amount: number;
  }[];
  totals: {
    totalPerceptions: number;
    totalTaxablePerceptions: number;
    totalExemptPerceptions: number;
    totalDeductions: number;
    isr: number;
    imssEmployee: number;
    subsidioAlEmpleo: number;
    netPay: number;
  };
  employer: {
    imssEmployer: number;
    infonavit: number;
    retiro: number;
    isn: number;
    totalEmployerCost: number;
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

    const payload: MexicanPayrollRequest = await req.json();
    const { employeeId, companyId, periodStart, periodEnd, perceptions, deductions = [] } = payload;

    console.log(`Processing Mexican payroll for employee ${employeeId}`);

    // Fetch employee Mexican data
    const { data: employeeData, error: empError } = await supabaseClient
      .from('mx_employee_data')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (empError || !employeeData) {
      throw new Error('Mexican employee data not found. Please complete Mexican tax setup first.');
    }

    // Fetch company Mexican registration
    const { data: companyData, error: compError } = await supabaseClient
      .from('mx_company_registrations')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (compError || !companyData) {
      throw new Error('Mexican company registration not found. Please complete company setup first.');
    }

    // Calculate days in period
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    const daysWorked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Fetch SAT catalog for perception/deduction mapping
    const { data: satCatalog } = await supabaseClient
      .from('mx_sat_catalogs')
      .select('*')
      .eq('is_active', true);

    const catalogMap = new Map(satCatalog?.map(c => [c.code, c]) || []);

    // Get UMA for exempt calculations
    const { data: umaData } = await supabaseClient
      .from('mx_uma_values')
      .select('daily_value')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    const umaDaily = umaData?.daily_value || 113.14;

    // Process perceptions with exempt/taxable split
    const processedPerceptions = perceptions.map(p => {
      const catalog = catalogMap.get(p.code);
      let taxable = p.amount;
      let exempt = 0;

      // Apply exemption rules per SAT guidelines
      if (catalog) {
        if (catalog.exempt_days && p.code === '002') {
          // Aguinaldo: exempt up to 30 UMA
          exempt = Math.min(p.amount, umaDaily * 30);
          taxable = Math.max(0, p.amount - exempt);
        } else if (catalog.exempt_days && p.code === '013') {
          // Prima vacacional: exempt up to 15 UMA
          exempt = Math.min(p.amount, umaDaily * 15);
          taxable = Math.max(0, p.amount - exempt);
        } else if (!catalog.is_taxable) {
          exempt = p.amount;
          taxable = 0;
        }
      }

      return {
        code: p.code,
        description: catalog?.description || p.description || 'Otro',
        taxable: Math.round(taxable * 100) / 100,
        exempt: Math.round(exempt * 100) / 100,
        total: Math.round(p.amount * 100) / 100
      };
    });

    const totalPerceptions = processedPerceptions.reduce((sum, p) => sum + p.total, 0);
    const totalTaxable = processedPerceptions.reduce((sum, p) => sum + p.taxable, 0);
    const totalExempt = processedPerceptions.reduce((sum, p) => sum + p.exempt, 0);

    // Calculate ISR
    const isrResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mx-calculate-isr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        grossIncome: totalTaxable,
        periodType: daysWorked <= 7 ? 'weekly' : daysWorked <= 16 ? 'biweekly' : 'monthly',
        includeSubsidy: true
      })
    });
    const isrResult = await isrResponse.json();

    // Calculate IMSS
    const sbc = employeeData.sbc || employeeData.sdi || (totalPerceptions / daysWorked);
    const imssResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mx-calculate-imss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        sbc,
        riskClass: companyData.imss_risk_class || 2,
        daysWorked
      })
    });
    const imssResult = await imssResponse.json();

    // Calculate ISN
    let isnAmount = 0;
    if (companyData.isn_state_code) {
      const isnResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mx-calculate-isn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          stateCode: companyData.isn_state_code,
          totalPayroll: totalPerceptions
        })
      });
      const isnResult = await isnResponse.json();
      isnAmount = isnResult.isnAmount || 0;
    }

    // Process manual deductions
    const processedDeductions = deductions.map(d => {
      const catalog = catalogMap.get(d.code);
      return {
        code: d.code,
        description: catalog?.description || d.description || 'Otra deducción',
        amount: Math.round(d.amount * 100) / 100
      };
    });

    // Add statutory deductions
    processedDeductions.push(
      { code: '002', description: 'ISR', amount: isrResult.netISR || 0 },
      { code: '001', description: 'Seguridad Social (IMSS)', amount: imssResult.totals?.employeeTotal || 0 }
    );

    const totalDeductions = processedDeductions.reduce((sum, d) => sum + d.amount, 0);
    const netPay = totalPerceptions - totalDeductions + (isrResult.subsidioAlEmpleo || 0);

    const result: PayrollCalculationResult = {
      employee: {
        id: employeeId,
        curp: employeeData.curp,
        rfc: employeeData.rfc_personal,
        nss: employeeData.nss
      },
      period: {
        start: periodStart,
        end: periodEnd,
        daysWorked
      },
      perceptions: processedPerceptions,
      deductions: processedDeductions,
      totals: {
        totalPerceptions: Math.round(totalPerceptions * 100) / 100,
        totalTaxablePerceptions: Math.round(totalTaxable * 100) / 100,
        totalExemptPerceptions: Math.round(totalExempt * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        isr: Math.round((isrResult.netISR || 0) * 100) / 100,
        imssEmployee: Math.round((imssResult.totals?.employeeTotal || 0) * 100) / 100,
        subsidioAlEmpleo: Math.round((isrResult.subsidioAlEmpleo || 0) * 100) / 100,
        netPay: Math.round(netPay * 100) / 100
      },
      employer: {
        imssEmployer: Math.round((imssResult.totals?.employerTotal || 0) * 100) / 100,
        infonavit: Math.round((imssResult.infonavit?.employerAmount || 0) * 100) / 100,
        retiro: Math.round((imssResult.retiro?.employerAmount || 0) * 100) / 100,
        isn: Math.round(isnAmount * 100) / 100,
        totalEmployerCost: Math.round(
          (totalPerceptions + 
           (imssResult.totals?.employerTotal || 0) + 
           (imssResult.infonavit?.employerAmount || 0) + 
           isnAmount) * 100
        ) / 100
      }
    };

    console.log(`Mexican payroll calculation complete: Net pay = ${result.totals.netPay}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Mexican payroll calculation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
