import { supabase } from "@/integrations/supabase/client";

interface FiscalPeriod {
  fiscal_year: number;
  fiscal_month: number;
}

interface CountryFiscalConfig {
  fiscal_year_start_month: number;
  fiscal_year_start_day: number;
}

/**
 * Calculate fiscal year and month based on country's fiscal year settings
 */
export function calculateFiscalPeriod(
  periodEnd: Date,
  fiscalStartMonth: number = 1,
  fiscalStartDay: number = 1
): FiscalPeriod {
  const year = periodEnd.getFullYear();
  const month = periodEnd.getMonth() + 1; // 1-based
  const day = periodEnd.getDate();
  
  // Create fiscal year start date for current calendar year
  const fiscalStartDate = new Date(year, fiscalStartMonth - 1, fiscalStartDay);
  
  let fiscalYear: number;
  let fiscalMonth: number;
  
  // Calendar year (January 1)
  if (fiscalStartMonth === 1 && fiscalStartDay === 1) {
    fiscalYear = year;
    fiscalMonth = month;
  } else {
    // Non-calendar fiscal year
    if (periodEnd >= fiscalStartDate) {
      // We're in the current calendar year's fiscal year
      fiscalYear = year + 1; // Fiscal years are named by their end year
    } else {
      // We're in the previous calendar year's fiscal year
      fiscalYear = year;
    }
    
    // Calculate fiscal month (1-12)
    let monthDiff = month - fiscalStartMonth;
    if (monthDiff < 0) monthDiff += 12;
    
    // Adjust for day offset
    if (day < fiscalStartDay && monthDiff === 0) {
      fiscalMonth = 12;
    } else if (day < fiscalStartDay) {
      fiscalMonth = monthDiff;
    } else {
      fiscalMonth = monthDiff + 1;
    }
    
    // Ensure fiscal month is 1-12
    if (fiscalMonth < 1) fiscalMonth = 12;
    if (fiscalMonth > 12) fiscalMonth = 1;
  }
  
  return { fiscal_year: fiscalYear, fiscal_month: fiscalMonth };
}

/**
 * Fetch company fiscal config and calculate fiscal period
 * Uses company-specific settings first, falls back to country settings
 */
export async function getFiscalPeriodForCompany(
  companyId: string,
  periodEnd: Date | string
): Promise<FiscalPeriod | null> {
  try {
    // Use the database function to get effective fiscal config
    const { data: fiscalConfig, error: fiscalError } = await supabase
      .rpc("get_company_fiscal_config", { p_company_id: companyId });
    
    if (fiscalError) {
      console.warn("Could not fetch company fiscal config, using calendar year", fiscalError);
      return calculateFiscalPeriod(new Date(periodEnd));
    }
    
    if (fiscalConfig && fiscalConfig.length > 0) {
      return calculateFiscalPeriod(
        new Date(periodEnd),
        fiscalConfig[0].fiscal_year_start_month,
        fiscalConfig[0].fiscal_year_start_day
      );
    }
    
    // Fallback to calendar year
    return calculateFiscalPeriod(new Date(periodEnd));
  } catch (error) {
    console.error("Error calculating fiscal period:", error);
    return null;
  }
}

/**
 * Bulk calculate fiscal periods for multiple pay periods
 */
export async function calculateFiscalPeriodsForPayPeriods(
  payPeriods: Array<{ id: string; period_end: string; company_id: string }>
): Promise<Map<string, FiscalPeriod>> {
  const results = new Map<string, FiscalPeriod>();
  
  // Group by company to minimize queries
  const byCompany = new Map<string, typeof payPeriods>();
  for (const pp of payPeriods) {
    if (!byCompany.has(pp.company_id)) {
      byCompany.set(pp.company_id, []);
    }
    byCompany.get(pp.company_id)!.push(pp);
  }
  
  // Process each company's periods
  for (const [companyId, periods] of byCompany) {
    // Get company's fiscal config using the database function
    const { data: fiscalConfig } = await supabase
      .rpc("get_company_fiscal_config", { p_company_id: companyId });
    
    let fiscalStartMonth = 1;
    let fiscalStartDay = 1;
    
    if (fiscalConfig && fiscalConfig.length > 0) {
      fiscalStartMonth = fiscalConfig[0].fiscal_year_start_month;
      fiscalStartDay = fiscalConfig[0].fiscal_year_start_day;
    }
    
    // Calculate for each period
    for (const period of periods) {
      const fiscalPeriod = calculateFiscalPeriod(
        new Date(period.period_end),
        fiscalStartMonth,
        fiscalStartDay
      );
      results.set(period.id, fiscalPeriod);
    }
  }
  
  return results;
}
