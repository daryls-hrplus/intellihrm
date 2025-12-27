import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, RefreshCw, CalendarIcon, AlertCircle, Globe } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  calculateProrationFactor, 
  applyProration, 
  getProrationMethodCode,
  type ProrationResult 
} from "@/utils/payroll/prorationCalculator";
import { usePayGroupMultiCurrency, useEmployeeCurrencyPreference, calculateNetPaySplit, NetPaySplit } from "@/hooks/useMultiCurrencyPayroll";
import { useCurrencies, Currency } from "@/hooks/useCurrencies";
import { useCompanyLocalCurrency } from "@/hooks/useCurrencies";

interface PayrollSimulatorProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
  payGroupId?: string;
}

interface ExchangeRateEntry {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  fromCurrency?: Currency;
  toCurrency?: Currency;
}

interface StatutoryDeduction {
  name: string;
  code: string;
  employee_amount: number;
  employer_amount: number;
  calculation_method: string;
  ytd_info?: {
    ytd_taxable_before: number;
    ytd_taxable_after: number;
    ytd_tax_before: number;
    ytd_tax_after: number;
  };
}

interface OpeningBalances {
  ytd_taxable_income: number;
  ytd_income_tax: number;
  ytd_gross_earnings: number;
}

interface PositionProration {
  title: string;
  fullAmount: number;
  proratedAmount: number;
  isProrated: boolean;
  factor: number;
  daysWorked: number;
  totalDays: number;
}

interface SimulationResult {
  employee: {
    name: string;
    employee_id: string;
    position: string;
  };
  salary: {
    base_salary: number;
    hourly_rate: number;
    currency: string;
    frequency: string;
  };
  proration?: {
    isProrated: boolean;
    factor: number;
    daysWorked: number;
    totalDays: number;
    method: string;
    fullPeriodSalary: number;
  };
  positionProrations?: PositionProration[];
  earnings: {
    regular_hours: number;
    overtime_hours: number;
    regular_pay: number;
    overtime_pay: number;
    additional_comp: Array<{
      name: string;
      base_amount: number;
      amount: number; // included in gross pay (in local currency)
      is_prorated: boolean;
      proration_factor?: number;
      position_title?: string;
      effective_start?: string | null;
      effective_end?: string | null;
      original_amount?: number;
      original_currency?: string;
      exchange_rate_used?: number;
    }>;
    allowances: Array<{
      name: string;
      base_amount: number;
      amount: number; // included in gross pay (in local currency)
      is_taxable: boolean;
      is_bik: boolean;
      original_amount?: number;
      original_currency?: string;
      exchange_rate_used?: number;
    }>;
    total_gross: number;
  };
  deductions: {
    pretax: Array<{ 
      name: string; 
      amount: number; 
      type: string;
      original_amount?: number;
      original_currency?: string;
      exchange_rate_used?: number;
    }>;
    statutory: StatutoryDeduction[];
    posttax: Array<{ 
      name: string; 
      amount: number; 
      type: string;
      original_amount?: number;
      original_currency?: string;
      exchange_rate_used?: number;
    }>;
    total_deductions: number;
  };
  net_pay: number;
  rules_applied: Array<{ name: string; type: string; multiplier: number }>;
  localCurrencyCode: string;
  hasMultiCurrency: boolean;
}

interface StatutoryRateBand {
  id: string;
  statutory_type_id: string;
  band_name: string;
  min_amount: number;
  max_amount: number | null;
  employee_rate: number | null;
  employer_rate: number | null;
  calculation_method: string;
  per_monday_amount: number;
  employer_per_monday_amount: number | null;
  fixed_amount: number | null;
  employer_fixed_amount: number | null;
  min_age: number | null;
  max_age: number | null;
  pay_frequency: string;
}

interface StatutoryType {
  id: string;
  country: string;
  statutory_type: string;
  statutory_code: string;
  statutory_name: string;
}

export function PayrollSimulator({ companyId, employeeId, payPeriodId, payGroupId }: PayrollSimulatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  
  // Multi-currency state
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateEntry[]>([]);
  const [selectedRateDate, setSelectedRateDate] = useState<Date>(new Date());
  const [missingRates, setMissingRates] = useState<string[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [foreignCurrencyIds, setForeignCurrencyIds] = useState<string[]>([]);
  const [localCurrencyId, setLocalCurrencyId] = useState<string | null>(null);
  const [confirmedRatesMap, setConfirmedRatesMap] = useState<Map<string, number>>(new Map());
  const [hasCheckedCurrencies, setHasCheckedCurrencies] = useState(false);
  
  // Check if pay group has multi-currency enabled
  const { data: payGroupSettings } = usePayGroupMultiCurrency(payGroupId);
  const isMultiCurrencyEnabled = payGroupSettings?.enable_multi_currency || false;
  
  // Fetch currencies
  const { currencies, isLoading: currenciesLoading } = useCurrencies();
  
  // Fetch company local currency
  const { data: companyLocalCurrency, isLoading: localCurrencyLoading } = useCompanyLocalCurrency(companyId);
  
  // Fetch employee currency preferences
  const { data: employeeCurrencyPreference } = useEmployeeCurrencyPreference(employeeId, companyId);

  const calculateStatutoryDeductions = (
    taxableIncome: number,
    statutoryTypes: StatutoryType[],
    rateBands: StatutoryRateBand[],
    mondayCount: number,
    employeeAge: number | null,
    payFrequency: string,
    openingBalances: OpeningBalances | null
  ): StatutoryDeduction[] => {
    const deductions: StatutoryDeduction[] = [];

    for (const statType of statutoryTypes) {
      // Get rate bands for this statutory type, filtered by pay frequency
      const bands = rateBands
        .filter(b => b.statutory_type_id === statType.id && b.pay_frequency === payFrequency)
        .sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0));

      if (bands.length === 0) continue;

      let employeeAmount = 0;
      let employerAmount = 0;
      let method = 'percentage';
      let ytdInfo: StatutoryDeduction['ytd_info'] = undefined;

      // For income_tax (PAYE), use cumulative calculation if opening balances exist
      if (statType.statutory_type === 'income_tax' && openingBalances) {
        const ytdTaxableBefore = openingBalances.ytd_taxable_income || 0;
        const ytdTaxPaid = openingBalances.ytd_income_tax || 0;
        const ytdTaxableAfter = ytdTaxableBefore + taxableIncome;

        // Calculate total tax due on cumulative earnings
        const totalTaxDue = calculateCumulativeTax(ytdTaxableAfter, bands, payFrequency);
        
        // Current period tax = Total tax due - Tax already paid
        employeeAmount = Math.max(0, totalTaxDue - ytdTaxPaid);
        method = 'cumulative';

        ytdInfo = {
          ytd_taxable_before: ytdTaxableBefore,
          ytd_taxable_after: ytdTaxableAfter,
          ytd_tax_before: ytdTaxPaid,
          ytd_tax_after: ytdTaxPaid + employeeAmount
        };
      } else {
        // Non-cumulative calculation for other statutory types
        for (const band of bands) {
          // Check age restrictions
          if (employeeAge !== null) {
            if (band.min_age !== null && employeeAge < band.min_age) continue;
            if (band.max_age !== null && employeeAge > band.max_age) continue;
          }

          // Check if income falls within this band
          const minAmount = band.min_amount || 0;
          const maxAmount = band.max_amount;
          
          if (taxableIncome < minAmount) continue;
          if (maxAmount !== null && taxableIncome > maxAmount) continue;

          method = band.calculation_method || 'percentage';

          if (method === 'per_monday') {
            // Per-monday calculation (e.g., NIS, Health Surcharge)
            employeeAmount = (band.per_monday_amount || 0) * mondayCount;
            employerAmount = (band.employer_per_monday_amount || 0) * mondayCount;
          } else if (method === 'fixed') {
            // Fixed amount (use fixed_amount fields, fallback to per_monday for backwards compatibility)
            employeeAmount = band.fixed_amount || band.per_monday_amount || 0;
            employerAmount = band.employer_fixed_amount || band.employer_per_monday_amount || 0;
          } else {
            // Percentage-based calculation
            const rate = band.employee_rate || 0;
            const employerRate = band.employer_rate || 0;
            
            employeeAmount = taxableIncome * rate;
            employerAmount = taxableIncome * employerRate;
          }

          // Found matching band, break
          break;
        }
      }

      if (employeeAmount > 0 || employerAmount > 0) {
        deductions.push({
          name: statType.statutory_name,
          code: statType.statutory_code,
          employee_amount: employeeAmount,
          employer_amount: employerAmount,
          calculation_method: method,
          ytd_info: ytdInfo
        });
      }
    }

    return deductions;
  };

  // Calculate cumulative tax using progressive tax bands
  const calculateCumulativeTax = (
    cumulativeTaxableIncome: number,
    bands: StatutoryRateBand[],
    payFrequency: string
  ): number => {
    let totalTax = 0;
    let remainingIncome = cumulativeTaxableIncome;

    // Sort bands by min_amount to ensure proper progressive calculation
    const sortedBands = [...bands].sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0));

    for (let i = 0; i < sortedBands.length; i++) {
      const band = sortedBands[i];
      const minAmount = band.min_amount || 0;
      const maxAmount = band.max_amount;
      const rate = band.employee_rate || 0;

      if (remainingIncome <= 0) break;
      if (cumulativeTaxableIncome < minAmount) continue;

      // Calculate the taxable amount in this band
      let bandTaxable: number;
      if (maxAmount !== null) {
        // Amount in this band is from minAmount to min(income, maxAmount)
        const bandTop = Math.min(cumulativeTaxableIncome, maxAmount);
        bandTaxable = Math.max(0, bandTop - minAmount);
      } else {
        // Top band - everything above minAmount
        bandTaxable = Math.max(0, cumulativeTaxableIncome - minAmount);
      }

      totalTax += bandTaxable * rate;
    }

    return totalTax;
  };

  // Check for foreign currencies and prompt for exchange rates if needed
  const checkAndPromptForExchangeRates = async () => {
    if (!isMultiCurrencyEnabled || !payGroupId) {
      setHasCheckedCurrencies(true);
      return false; // No need for exchange rates
    }

    // Wait for currencies to be loaded
    if (currencies.length === 0) {
      // Not ready yet, don't block but don't proceed either
      return false;
    }

    // Use pre-fetched company local currency
    const localCurrId = companyLocalCurrency?.id;

    if (!localCurrId) {
      toast.error("Company local currency is not configured. Please set it on the Company record.");
      setHasCheckedCurrencies(true);
      return true; // Block simulation
    }

    setLocalCurrencyId(localCurrId);

    // Build currency code -> id map
    const { data: currencyRows } = await supabase
      .from('currencies')
      .select('id, code')
      .eq('is_active', true);

    const codeToId = new Map<string, string>();
    (currencyRows || []).forEach((c) => {
      if (c?.code && c?.id) codeToId.set(String(c.code).toUpperCase(), c.id);
    });

    // Fetch employee compensation to find foreign currencies
    const { data: compensations } = await supabase
      .from('employee_compensation')
      .select('currency_id, currency')
      .eq('employee_id', employeeId)
      .eq('is_active', true);

    // Also check period allowances and deductions
    const [{ data: allowances }, { data: deductions }] = await Promise.all([
      supabase
        .from('employee_period_allowances')
        .select('payout_currency_id, currency')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId),
      supabase
        .from('employee_period_deductions')
        .select('payout_currency_id, currency')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId),
    ]);

    // Find unique foreign currencies
    const foreignIds = new Set<string>();

    (compensations || []).forEach((c: any) => {
      const idFromCode = c.currency ? codeToId.get(String(c.currency).toUpperCase()) : undefined;
      const effectiveCurrencyId: string | undefined = c.currency_id || idFromCode;

      if (effectiveCurrencyId && effectiveCurrencyId !== localCurrId) {
        foreignIds.add(effectiveCurrencyId);
      }
    });

    (allowances || []).forEach((a: any) => {
      const idFromCode = a.currency ? codeToId.get(String(a.currency).toUpperCase()) : undefined;
      const effectiveCurrencyId: string | undefined = a.payout_currency_id || idFromCode;

      if (effectiveCurrencyId && effectiveCurrencyId !== localCurrId) {
        foreignIds.add(effectiveCurrencyId);
      }
    });

    (deductions || []).forEach((d: any) => {
      const idFromCode = d.currency ? codeToId.get(String(d.currency).toUpperCase()) : undefined;
      const effectiveCurrencyId: string | undefined = d.payout_currency_id || idFromCode;

      if (effectiveCurrencyId && effectiveCurrencyId !== localCurrId) {
        foreignIds.add(effectiveCurrencyId);
      }
    });

    if (foreignIds.size === 0) {
      setHasCheckedCurrencies(true);
      return false; // No foreign currencies, proceed
    }

    // Build rate entries for the dialog
    const localCurrency = currencies.find(c => c.id === localCurrId);
    const rateEntries: ExchangeRateEntry[] = [];

    foreignIds.forEach(foreignId => {
      const foreignCurrency = currencies.find(c => c.id === foreignId);
      rateEntries.push({
        fromCurrencyId: foreignId,
        toCurrencyId: localCurrId,
        rate: 0,
        fromCurrency: foreignCurrency,
        toCurrency: localCurrency
      });
    });

    setForeignCurrencyIds(Array.from(foreignIds));
    setExchangeRates(rateEntries);
    setExchangeRateDialogOpen(true);
    
    return true; // Block simulation until rates are confirmed
  };

  // Fetch exchange rates for selected date
  const fetchRatesForDate = async () => {
    setLoadingRates(true);
    const dateStr = format(selectedRateDate, 'yyyy-MM-dd');
    const missing: string[] = [];
    
    const updatedRates = await Promise.all(
      exchangeRates.map(async (entry) => {
        const { data } = await supabase
          .from("exchange_rates")
          .select("rate")
          .eq("from_currency_id", entry.fromCurrencyId)
          .eq("to_currency_id", entry.toCurrencyId)
          .lte("rate_date", dateStr)
          .order("rate_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data?.rate) {
          return { ...entry, rate: data.rate };
        } else {
          missing.push(`${entry.fromCurrency?.code || 'Unknown'} → ${entry.toCurrency?.code || 'Unknown'}`);
          return entry;
        }
      })
    );
    
    setExchangeRates(updatedRates);
    setMissingRates(missing);
    setLoadingRates(false);
  };

  const handleRateChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExchangeRates(prev => prev.map((r, i) => i === index ? { ...r, rate: numValue } : r));
  };

  const handleConfirmRates = () => {
    // Build a map of currency conversions
    const ratesMap = new Map<string, number>();
    exchangeRates.forEach(r => {
      if (r.rate > 0) {
        ratesMap.set(`${r.fromCurrencyId}_${r.toCurrencyId}`, r.rate);
        // Add inverse rate
        ratesMap.set(`${r.toCurrencyId}_${r.fromCurrencyId}`, 1 / r.rate);
      }
    });
    
    setConfirmedRatesMap(ratesMap);
    setHasCheckedCurrencies(true);
    setExchangeRateDialogOpen(false);
    
    // Now run simulation with the confirmed rates
    runSimulationWithRates(ratesMap);
  };

  const allRatesValid = exchangeRates.every(r => r.rate > 0);

  const runSimulationWithRates = async (ratesMap: Map<string, number>) => {
    setIsCalculating(true);
    const exchangeRatesMap = ratesMap;
    
    try {
      // Fetch employee info
      const { data: employee } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', employeeId)
        .single();

      // Note: Age-based statutory exemptions would need date_of_birth from employee_profiles table
      // For now, we skip age checks (employeeAge = null means all ages apply)
      let employeeAge: number | null = null;

      // Fetch company to get territory/country
      const { data: company } = await supabase
        .from('companies')
        .select('territory_id, territories(country_code)')
        .eq('id', companyId)
        .single();

      // Determine country code (default to TT if not set)
      const countryCode = (company?.territories as any)?.country_code || 'TT';

      // Fetch ALL active employee positions with compensation
      const { data: positionsData, error: positionError } = await supabase
        .from('employee_positions')
        .select(`
          compensation_amount,
          compensation_currency,
          compensation_frequency,
          start_date,
          end_date,
          is_primary,
          positions (title)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (positionError) throw positionError;

      // Get positions array (could be multiple)
      const allPositions = positionsData || [];
      
      // Use primary position for proration dates, or first position if no primary
      const primaryPosition = allPositions.find(p => p.is_primary) || allPositions[0];
      
      // Get employee start/end dates for proration from primary position
      const employeeStartDate = primaryPosition?.start_date 
        ? new Date(primaryPosition.start_date) 
        : null;
      const employeeEndDate = primaryPosition?.end_date
        ? new Date(primaryPosition.end_date)
        : null;

      // Fetch employee compensation (can be linked to a specific position)
      const { data: employeeCompRaw, error: employeeCompError } = await supabase
        .from('employee_compensation')
        .select(`
          amount,
          currency,
          frequency,
          position_id,
          start_date,
          end_date,
          positions (title),
          pay_elements (
            name, 
            code,
            proration_method:lookup_values!pay_elements_proration_method_id_fkey(code, name)
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (employeeCompError) throw employeeCompError;

      // Fetch work records with periods
      const { data: workRecords } = await supabase
        .from('employee_work_records')
        .select(`
          *,
          payroll_rules(name, rule_type, overtime_multiplier, weekend_multiplier, holiday_multiplier)
        `)
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch allowances
      const { data: allowances } = await supabase
        .from('employee_period_allowances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch deductions
      const { data: deductions } = await supabase
        .from('employee_period_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch pay period info for period-based calculations
      const { data: payPeriod, error: payPeriodError } = await supabase
        .from('pay_periods')
        .select('period_start, period_end, monday_count, pay_groups(pay_frequency)')
        .eq('id', payPeriodId)
        .maybeSingle();

      if (payPeriodError) {
        console.error('Pay period fetch error:', payPeriodError);
      }
      
      // Filter out compensation items with end_date before the pay period start
      const periodStart = payPeriod?.period_start;
      const employeeComp = (employeeCompRaw || []).filter((comp: any) => {
        // If no end_date, it's ongoing and should be included
        if (!comp.end_date) return true;
        // If no period start available, include all
        if (!periodStart) return true;
        // Include only if end_date >= period_start (still active during this period)
        return comp.end_date >= periodStart;
      });

      // Fetch statutory deduction types for the country
      const { data: statutoryTypes } = await supabase
        .from('statutory_deduction_types')
        .select('*')
        .eq('country', countryCode)
        .eq('is_active', true);

      // Fetch rate bands for the statutory types
      const statutoryTypeIds = (statutoryTypes || []).map(s => s.id);
      const { data: rateBands } = await supabase
        .from('statutory_rate_bands')
        .select('*')
        .in('statutory_type_id', statutoryTypeIds.length > 0 ? statutoryTypeIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('is_active', true);

      // Fetch opening balances for cumulative PAYE calculation
      const currentYear = new Date().getFullYear();
      const { data: openingBalanceData } = await supabase
        .from('employee_opening_balances')
        .select('ytd_taxable_income, ytd_income_tax, ytd_gross_earnings')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId)
        .eq('tax_year', currentYear)
        .maybeSingle();

      const openingBalances: OpeningBalances | null = openingBalanceData ? {
        ytd_taxable_income: openingBalanceData.ytd_taxable_income || 0,
        ytd_income_tax: openingBalanceData.ytd_income_tax || 0,
        ytd_gross_earnings: openingBalanceData.ytd_gross_earnings || 0
      } : null;

      // Determine pay frequency for this simulation
      const payFrequency = (payPeriod?.pay_groups as any)?.pay_frequency || 'monthly';
      const mondayCount = payPeriod?.monday_count || 4; // Default to 4 Mondays if not set

      // Employee compensation (may contain multiple Base Salary lines across positions)
      const employeeCompList = employeeComp || [];
      const baseSalaryItems = employeeCompList.filter(
        (c) => ((c.pay_elements as any)?.code || '').toUpperCase() === 'SAL'
      );

      // Keep a "representative" base salary item for currency display
      const baseSalaryItem = baseSalaryItems.length > 0 ? baseSalaryItems[0] : null;

      // Used to override hourly-rate calculation when multiple salaries exist
      let annualSalaryOverride: number | null = null;

      // Calculate total position compensation from ALL positions with individual proration
      let totalPositionCompensation = 0;
      let totalFullPeriodCompensation = 0;
      const positionProrations: Array<{
        title: string;
        fullAmount: number;
        proratedAmount: number;
        isProrated: boolean;
        factor: number;
        daysWorked: number;
        totalDays: number;
      }> = [];

      for (const pos of allPositions) {
        const amount = pos.compensation_amount || 0;
        const freq = pos.compensation_frequency || 'monthly';
        
        // Convert to period amount based on pay frequency
        let periodAmount = amount;
        let annualAmount = amount;
        switch (freq) {
          case 'annual': annualAmount = amount; break;
          case 'monthly': annualAmount = amount * 12; break;
          case 'weekly': annualAmount = amount * 52; break;
          case 'biweekly': 
          case 'fortnightly': annualAmount = amount * 26; break;
        }
        
        // Convert to pay period amount
        switch (payFrequency) {
          case 'monthly': periodAmount = annualAmount / 12; break;
          case 'biweekly':
          case 'fortnightly': periodAmount = annualAmount / 26; break;
          case 'weekly': periodAmount = annualAmount / 52; break;
          case 'semimonthly': periodAmount = annualAmount / 24; break;
          default: periodAmount = annualAmount / 12; break;
        }
        
        const fullPeriodAmount = periodAmount;
        totalFullPeriodCompensation += fullPeriodAmount;
        
        // Calculate proration for THIS position based on its own start/end dates
        let posProration: ProrationResult | null = null;
        if (payPeriod?.period_start && payPeriod?.period_end) {
          const posStartDate = pos.start_date ? new Date(pos.start_date) : null;
          const posEndDate = pos.end_date ? new Date(pos.end_date) : null;
          
          posProration = calculateProrationFactor({
            periodStart: new Date(payPeriod.period_start),
            periodEnd: new Date(payPeriod.period_end),
            employeeStartDate: posStartDate,
            employeeEndDate: posEndDate,
            prorationMethod: 'CALENDAR_DAYS', // Default proration method for positions
          });
        }
        
        // Apply proration if applicable
        let proratedAmount = periodAmount;
        if (posProration && posProration.isProrated) {
          proratedAmount = applyProration(periodAmount, posProration);
        }
        
        totalPositionCompensation += proratedAmount;
        
        positionProrations.push({
          title: (pos.positions as any)?.title || 'Unknown Position',
          fullAmount: fullPeriodAmount,
          proratedAmount: proratedAmount,
          isProrated: posProration?.isProrated || false,
          factor: posProration?.factor || 1,
          daysWorked: posProration?.daysWorked || 0,
          totalDays: posProration?.totalDays || 0,
        });
      }
      
      // Use employee compensation if available, otherwise use total prorated position compensation
      const baseCompAmount = baseSalaryItem ? (baseSalaryItem.amount || 0) : totalPositionCompensation;
      const baseCompFrequency = baseSalaryItem ? (baseSalaryItem.frequency || 'monthly') : payFrequency;
      const baseCompCurrency = baseSalaryItem
        ? (baseSalaryItem.currency || primaryPosition?.compensation_currency || 'USD')
        : (primaryPosition?.compensation_currency || 'USD');

      // Get proration method from base salary pay element (for employee_compensation items)
      const baseProrationMethodCode = getProrationMethodCode(
        (baseSalaryItem?.pay_elements as any)?.proration_method?.code
      );

      // Calculate proration for employee_compensation items (if used instead of positions)
      let employeeCompProration: ProrationResult | null = null;
      if (baseSalaryItem && payPeriod?.period_start && payPeriod?.period_end) {
        employeeCompProration = calculateProrationFactor({
          periodStart: new Date(payPeriod.period_start),
          periodEnd: new Date(payPeriod.period_end),
          employeeStartDate,
          employeeEndDate,
          prorationMethod: baseProrationMethodCode,
        });
      }

      // Use default standard hours until positions/jobs standard hours are wired here
      const standardHours = 40;

      const hoursPerYear = standardHours * 52;

      // Hourly rate: prefer aggregated annual salary when multiple base salaries exist
      let annualSalary = annualSalaryOverride !== null ? annualSalaryOverride : 0;

      if (annualSalaryOverride === null) {
        let tmpAnnualSalary = baseSalaryItem ? (baseSalaryItem.amount || 0) : 0;
        const tmpFreq = baseSalaryItem ? (baseSalaryItem.frequency || 'monthly') : payFrequency;

        switch (tmpFreq) {
          case 'monthly':
            tmpAnnualSalary = tmpAnnualSalary * 12;
            break;
          case 'biweekly':
          case 'fortnightly':
            tmpAnnualSalary = tmpAnnualSalary * 26;
            break;
          case 'weekly':
            tmpAnnualSalary = tmpAnnualSalary * 52;
            break;
          case 'annual':
            tmpAnnualSalary = tmpAnnualSalary;
            break;
        }

        annualSalary = tmpAnnualSalary;
      }

      const hourlyRate = hoursPerYear > 0 ? annualSalary / hoursPerYear : 0;

      // Base salary included in this pay period
      const fullPeriodBaseSalary = totalFullPeriodCompensation;
      const periodBaseSalary = totalPositionCompensation;
      
      // Overall proration summary (aggregated across Base Salary lines)
      const anyPositionProrated = positionProrations.some((p) => p.isProrated);
      const prorationResult =
        anyPositionProrated && totalFullPeriodCompensation > 0
          ? {
              isProrated: true,
              factor: totalPositionCompensation / totalFullPeriodCompensation,
              daysWorked: positionProrations[0]?.daysWorked || 0,
              totalDays: positionProrations[0]?.totalDays || 0,
            }
          : null;

      // Calculate totals from work records
      const regularHours = (workRecords || []).reduce((sum, r) => sum + (r.regular_hours || 0), 0);
      const overtimeHours = (workRecords || []).reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

      // Use base salary for regular pay, hourly rate for overtime
      const regularPay = periodBaseSalary;
      const overtimePay = overtimeHours * hourlyRate * 1.5;

      // Currency helpers for multi-currency simulation
      const localCurrIdForCalc = localCurrencyId || companyLocalCurrency?.id || null;

      const resolveCurrencyId = (currencyCode?: string | null, currencyId?: string | null) => {
        if (currencyId) return currencyId;
        if (!currencyCode) return undefined;
        return currencies.find(
          (c) => c.code.toUpperCase() === String(currencyCode).toUpperCase(),
        )?.id;
      };

      const resolveCurrencyCode = (currencyId?: string | null, fallbackCode?: string | null) => {
        if (fallbackCode) return String(fallbackCode).toUpperCase();
        if (!currencyId) return undefined;
        return currencies.find((c) => c.id === currencyId)?.code;
      };

      const convertToLocal = (amount: number, fromCurrencyId?: string) => {
        if (!localCurrIdForCalc || !fromCurrencyId) {
          return { localAmount: amount, rateUsed: undefined as number | undefined };
        }
        if (fromCurrencyId === localCurrIdForCalc) {
          return { localAmount: amount, rateUsed: undefined as number | undefined };
        }
        const rate = exchangeRatesMap.get(`${fromCurrencyId}_${localCurrIdForCalc}`);
        if (!rate || rate <= 0) {
          return { localAmount: amount, rateUsed: undefined as number | undefined };
        }
        return { localAmount: amount * rate, rateUsed: rate };
      };

      // All employee compensation items are treated as additional comp
      const remainingEmployeeComp = employeeCompList;

      const additionalCompList = remainingEmployeeComp.map((c) => {
        let basePeriodAmount = c.amount || 0;
        const freq = c.frequency || 'monthly';

        // Convert to pay period frequency (base amount)
        if (freq !== payFrequency) {
          let annualAmount = basePeriodAmount;
          switch (freq) {
            case 'monthly':
              annualAmount = basePeriodAmount * 12;
              break;
            case 'biweekly':
            case 'fortnightly':
              annualAmount = basePeriodAmount * 26;
              break;
            case 'weekly':
              annualAmount = basePeriodAmount * 52;
              break;
            case 'annual':
              annualAmount = basePeriodAmount;
              break;
          }

          switch (payFrequency) {
            case 'monthly':
              basePeriodAmount = annualAmount / 12;
              break;
            case 'biweekly':
            case 'fortnightly':
              basePeriodAmount = annualAmount / 26;
              break;
            case 'weekly':
              basePeriodAmount = annualAmount / 52;
              break;
            case 'semimonthly':
              basePeriodAmount = annualAmount / 24;
              break;
            default:
              basePeriodAmount = annualAmount / 12;
              break;
          }
        }

        const prorationMethodCode = getProrationMethodCode(
          (c.pay_elements as any)?.proration_method?.code,
        );

        let calculatedAmount = basePeriodAmount;
        let isProrated = false;
        let prorationFactor = 1;

        if (payPeriod?.period_start && payPeriod?.period_end && prorationMethodCode !== 'NONE') {
          const compStartDate = c.start_date ? new Date(c.start_date) : null;
          const compEndDate = c.end_date ? new Date(c.end_date) : null;

          const pr = calculateProrationFactor({
            periodStart: new Date(payPeriod.period_start),
            periodEnd: new Date(payPeriod.period_end),
            employeeStartDate: compStartDate,
            employeeEndDate: compEndDate,
            prorationMethod: prorationMethodCode,
          });

          isProrated = pr.isProrated;
          prorationFactor = pr.factor;
          if (pr.isProrated) {
            calculatedAmount = applyProration(basePeriodAmount, pr);
          }
        }

        const fromCurrencyId = resolveCurrencyId(c.currency, undefined);
        const { localAmount, rateUsed } = convertToLocal(calculatedAmount, fromCurrencyId);

        return {
          name: (c.pay_elements as any)?.name || 'Compensation',
          base_amount: basePeriodAmount,
          amount: localAmount,
          is_prorated: isProrated,
          proration_factor: prorationFactor,
          position_title: (c.positions as any)?.title || 'Unassigned Position',
          effective_start: c.start_date,
          effective_end: c.end_date || payPeriod?.period_end,
          original_amount: calculatedAmount,
          original_currency: resolveCurrencyCode(fromCurrencyId, c.currency),
          exchange_rate_used: rateUsed,
        };
      });

      const totalAdditionalComp = additionalCompList.reduce((sum, c) => sum + c.amount, 0);

      const allowanceList = (allowances || []).map((a: any) => {
        const fromCurrencyId = resolveCurrencyId(a.currency, a.payout_currency_id);
        const { localAmount, rateUsed } = convertToLocal(a.amount, fromCurrencyId);

        return {
          name: a.allowance_name,
          base_amount: a.amount,
          amount: localAmount,
          is_taxable: a.is_taxable,
          is_bik: a.is_benefit_in_kind,
          original_amount: a.amount,
          original_currency: resolveCurrencyCode(fromCurrencyId, a.currency),
          exchange_rate_used: rateUsed,
        };
      });

      const totalAllowances = allowanceList.reduce((sum, a) => sum + a.amount, 0);
      const totalGross = overtimePay + totalAdditionalComp + totalAllowances;

      // Calculate deductions (convert to local for totals, preserve original for display)
      const pretaxDeductions = (deductions || [])
        .filter((d: any) => d.is_pretax)
        .map((d: any) => {
          const fromCurrencyId = resolveCurrencyId(d.currency, d.payout_currency_id);
          const { localAmount, rateUsed } = convertToLocal(d.amount, fromCurrencyId);
          return {
            name: d.deduction_name,
            amount: localAmount,
            type: d.deduction_type || 'other',
            original_amount: d.amount,
            original_currency: resolveCurrencyCode(fromCurrencyId, d.currency),
            exchange_rate_used: rateUsed,
          };
        });

      const posttaxDeductions = (deductions || [])
        .filter((d: any) => !d.is_pretax)
        .map((d: any) => {
          const fromCurrencyId = resolveCurrencyId(d.currency, d.payout_currency_id);
          const { localAmount, rateUsed } = convertToLocal(d.amount, fromCurrencyId);
          return {
            name: d.deduction_name,
            amount: localAmount,
            type: d.deduction_type || 'other',
            original_amount: d.amount,
            original_currency: resolveCurrencyCode(fromCurrencyId, d.currency),
            exchange_rate_used: rateUsed,
          };
        });

      const totalPretax = pretaxDeductions.reduce((sum, d) => sum + d.amount, 0);
      const taxableIncome = totalGross - totalPretax;

      // Calculate statutory deductions using configured rates
      const statutoryDeductions = calculateStatutoryDeductions(
        taxableIncome,
        statutoryTypes || [],
        rateBands || [],
        mondayCount,
        employeeAge,
        payFrequency,
        openingBalances
      );

      const totalStatutory = statutoryDeductions.reduce((sum, d) => sum + d.employee_amount, 0);
      const totalPosttax = posttaxDeductions.reduce((sum, d) => sum + d.amount, 0);
      const totalDeductions = totalPretax + totalStatutory + totalPosttax;
      const netPay = totalGross - totalDeductions;

      // Collect unique rules applied
      const rulesApplied = new Map();
      (workRecords || []).forEach(r => {
        if (r.payroll_rules) {
          rulesApplied.set(r.payroll_rules.name, {
            name: r.payroll_rules.name,
            type: r.payroll_rules.rule_type,
            multiplier: r.payroll_rules.overtime_multiplier
          });
        }
      });

      setResult({
        employee: {
          name: employee?.full_name || 'N/A',
          employee_id: employeeId.slice(0, 8).toUpperCase(),
          position: allPositions.length > 1 
            ? `${allPositions.length} positions` 
            : ((primaryPosition?.positions as any)?.title || 'N/A')
        },
        salary: {
          base_salary: periodBaseSalary,
          hourly_rate: hourlyRate,
          currency: baseCompCurrency,
          frequency: payFrequency
        },
        proration: prorationResult ? {
          isProrated: prorationResult.isProrated,
          factor: prorationResult.factor,
          daysWorked: prorationResult.daysWorked,
          totalDays: prorationResult.totalDays,
          method: baseProrationMethodCode,
          fullPeriodSalary: fullPeriodBaseSalary
        } : undefined,
        positionProrations: positionProrations.length > 0 ? positionProrations : undefined,
        earnings: {
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          additional_comp: additionalCompList,
          allowances: allowanceList,
          total_gross: totalGross
        },
        deductions: {
          pretax: pretaxDeductions,
          statutory: statutoryDeductions,
          posttax: posttaxDeductions,
          total_deductions: totalDeductions
        },
        net_pay: netPay,
        rules_applied: Array.from(rulesApplied.values()),
        localCurrencyCode: localCurrencyId ? (currencies.find(c => c.id === localCurrencyId)?.code || baseCompCurrency) : baseCompCurrency,
        hasMultiCurrency: isMultiCurrencyEnabled && exchangeRatesMap.size > 0
      });

      if (periodBaseSalary === 0 && additionalCompList.length === 0) {
        toast.warning(
          "No base salary configured for this employee. Please set up employee compensation or position compensation."
        );
      } else {
        toast.success("Payroll simulation complete");
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error("Failed to run simulation");
    }
    
    setIsCalculating(false);
  };

  // Initial simulation check - prompt for exchange rates if needed
  const runSimulation = async () => {
    if (isMultiCurrencyEnabled && !hasCheckedCurrencies) {
      const blocked = await checkAndPromptForExchangeRates();
      if (blocked) return; // Dialog will handle running simulation after rates confirmed
    }
    
    // Run with empty rates map if no multi-currency or already have rates
    runSimulationWithRates(confirmedRatesMap);
  };

  useEffect(() => {
    // Wait for currencies to load before running simulation
    if (currenciesLoading || localCurrencyLoading) return;
    
    // Reset currency check when employee/period changes
    setHasCheckedCurrencies(false);
    setConfirmedRatesMap(new Map());
    runSimulation();
  }, [employeeId, payPeriodId, currenciesLoading, localCurrencyLoading]);

  // Re-fetch rates when dialog opens
  useEffect(() => {
    if (exchangeRateDialogOpen && exchangeRates.length > 0) {
      fetchRatesForDate();
    }
  }, [selectedRateDate, exchangeRateDialogOpen]);

  const exchangeRateDialog = (
    <Dialog open={exchangeRateDialogOpen} onOpenChange={setExchangeRateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Exchange Rates for Simulation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>Rate Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedRateDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedRateDate ? format(selectedRateDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedRateDate}
                    onSelect={(date) => date && setSelectedRateDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              variant="outline"
              onClick={fetchRatesForDate}
              disabled={loadingRates}
              className="mt-6"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loadingRates && "animate-spin")} />
              Fetch Rates
            </Button>
          </div>

          {missingRates.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No rates found for: {missingRates.join(", ")}. Please enter manually.
              </AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Currency</TableHead>
                <TableHead>To Currency</TableHead>
                <TableHead>Exchange Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map((entry, index) => (
                <TableRow key={`${entry.fromCurrencyId}-${entry.toCurrencyId}`}>
                  <TableCell>
                    <span className="font-medium">{entry.fromCurrency?.code}</span>
                    <span className="text-muted-foreground ml-2">{entry.fromCurrency?.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{entry.toCurrency?.code}</span>
                    <span className="text-muted-foreground ml-2">{entry.toCurrency?.name}</span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.000001"
                      value={entry.rate || ""}
                      onChange={(e) => handleRateChange(index, e.target.value)}
                      className="w-32"
                      placeholder="0.000000"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            These rates will be used for currency conversions in this simulation.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setExchangeRateDialogOpen(false);
              setHasCheckedCurrencies(true);
              // Run with empty rates - amounts won't be converted
              runSimulationWithRates(new Map());
            }}
          >
            Skip (Use Original Amounts)
          </Button>
          <Button onClick={handleConfirmRates} disabled={!allRatesValid}>
            Confirm Rates & Calculate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Show loading while dependencies are loading
  if (currenciesLoading || localCurrencyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If we're waiting for exchange rates, render the dialog even before results exist
  if (!result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        {exchangeRateDialog}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const baseSalaryBaseTotal = result.positionProrations?.length
    ? result.positionProrations.reduce((sum, p) => sum + (p.fullAmount || 0), 0)
    : (result.proration?.fullPeriodSalary ?? result.earnings.regular_pay);

  const baseAdditionalTotal = result.earnings.additional_comp.reduce(
    (sum, c) => sum + (c.base_amount ?? c.amount),
    0,
  );

  const baseAllowancesTotal = result.earnings.allowances.reduce(
    (sum, a) => sum + (a.base_amount ?? a.amount),
    0,
  );

  const baseGrossTotal =
    baseSalaryBaseTotal + result.earnings.overtime_pay + baseAdditionalTotal + baseAllowancesTotal;

  return (
    <div className="space-y-6">
      {/* Employee Info */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Employee</p>
          <p className="font-medium">{result.employee.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Employee ID</p>
          <p className="font-medium">{result.employee.employee_id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Position</p>
          <p className="font-medium">{result.employee.position}</p>
        </div>
      </div>

      {/* Rules Applied */}
      {result.rules_applied.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Rules Applied</h4>
          <div className="flex gap-2 flex-wrap">
            {result.rules_applied.map((rule, idx) => (
              <Badge key={idx} variant="outline">
                {rule.name} ({rule.type}) - {rule.multiplier}x OT
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Salary Info */}
      {result.salary.base_salary === 0 ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            ⚠️ No base salary configured for this employee. Please set up employee compensation or position compensation.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Base Salary</p>
              <p className="font-semibold">{result.salary.currency} {formatCurrency(result.salary.base_salary)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hourly Rate</p>
              <p className="font-semibold">{result.salary.currency} {formatCurrency(result.salary.hourly_rate)}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="font-semibold">{result.salary.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pay Frequency</p>
              <p className="font-semibold capitalize">{result.salary.frequency}</p>
            </div>
          </div>
          
          
          {/* Overall Proration Summary */}
          {result.proration?.isProrated && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                ⚡ Total Proration Summary
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Full Period Total</p>
                  <p className="font-medium">{result.salary.currency} {formatCurrency(result.proration.fullPeriodSalary)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prorated Total</p>
                  <p className="font-medium text-primary">{result.salary.currency} {formatCurrency(result.salary.base_salary)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Overall Factor</p>
                  <p className="font-medium">{(result.proration.factor * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <p className="font-medium capitalize">{result.proration.method.replace('_', ' ').toLowerCase()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Earnings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Element</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Local Amount ({result.localCurrencyCode})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.earnings.overtime_hours > 0 && (
                <TableRow>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>Overtime</span>
                      <span className="text-xs text-muted-foreground">
                        {result.earnings.overtime_hours}h @ {formatCurrency(result.salary.hourly_rate)}/hr × 1.5
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {formatCurrency(result.earnings.overtime_pay)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {result.localCurrencyCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                    {formatCurrency(result.earnings.overtime_pay)}
                  </TableCell>
                </TableRow>
              )}

              {result.earnings.additional_comp.length > 0 && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-medium">
                    Compensation
                  </TableCell>
                </TableRow>
              )}
              {result.earnings.additional_comp.map((comp, idx) => {
                const hasConversion = comp.original_currency && comp.original_amount !== undefined;
                const originalCurrencyCode = hasConversion ? comp.original_currency : result.localCurrencyCode;
                const originalAmount = hasConversion ? comp.original_amount : comp.amount;
                
                return (
                  <TableRow key={`comp-${idx}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{comp.name}</span>
                        {comp.position_title && (
                          <span className="text-xs text-muted-foreground">{comp.position_title}</span>
                        )}
                        {comp.is_prorated && (
                          <Badge variant="outline" className="w-fit mt-0.5 text-xs bg-warning/20 text-warning border-warning/30">
                            Prorated
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(originalAmount || comp.base_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {originalCurrencyCode}
                      </Badge>
                      {hasConversion && comp.exchange_rate_used && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          @ {comp.exchange_rate_used.toFixed(4)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                      {formatCurrency(comp.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {result.earnings.allowances.length > 0 && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-medium">
                    Allowances
                  </TableCell>
                </TableRow>
              )}
              {result.earnings.allowances.map((allowance, idx) => {
                const hasConversion = allowance.original_currency && allowance.original_amount !== undefined;
                const originalCurrencyCode = hasConversion ? allowance.original_currency : result.localCurrencyCode;
                const originalAmount = hasConversion ? allowance.original_amount : allowance.amount;
                
                return (
                  <TableRow key={`allow-${idx}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {allowance.name}
                        {allowance.is_bik && (
                          <Badge variant="secondary" className="text-xs">
                            BIK
                          </Badge>
                        )}
                        {!allowance.is_taxable && (
                          <Badge variant="outline" className="text-xs">
                            Non-taxable
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(originalAmount || allowance.base_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {originalCurrencyCode}
                      </Badge>
                      {hasConversion && allowance.exchange_rate_used && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          @ {allowance.exchange_rate_used.toFixed(4)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                      {formatCurrency(allowance.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}

              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Gross Pay</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(baseGrossTotal)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {result.localCurrencyCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-success tabular-nums">
                  {formatCurrency(result.earnings.total_gross)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Deductions</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deduction</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Local Amount ({result.localCurrencyCode})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.deductions.pretax.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground font-medium bg-muted/30">
                      Pre-tax Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.pretax.map((d, idx) => {
                    const hasConversion = d.original_currency && d.original_amount !== undefined;
                    const originalCurrencyCode = hasConversion ? d.original_currency : result.localCurrencyCode;
                    const originalAmount = hasConversion ? d.original_amount : d.amount;
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell className="pl-6">
                          <span>{d.name}</span>
                          <span className="ml-1 text-xs text-primary">(Pre-tax)</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-destructive tabular-nums">
                          -{formatCurrency(originalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {originalCurrencyCode}
                          </Badge>
                          {hasConversion && d.exchange_rate_used && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              @ {d.exchange_rate_used.toFixed(4)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium text-destructive tabular-nums">
                          -{formatCurrency(d.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              )}
              
              {result.deductions.statutory.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground font-medium bg-muted/30">
                      Statutory Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.statutory.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          {d.name}
                          <Badge variant="outline" className="text-xs">{d.code}</Badge>
                          {d.calculation_method === 'per_monday' && (
                            <Badge variant="secondary" className="text-xs">Per Monday</Badge>
                          )}
                          {d.calculation_method === 'cumulative' && (
                            <Badge variant="secondary" className="text-xs">Cumulative</Badge>
                          )}
                        </div>
                        {d.ytd_info && (
                          <div className="text-xs text-muted-foreground mt-1">
                            YTD Taxable: {formatCurrency(d.ytd_info.ytd_taxable_before)} → {formatCurrency(d.ytd_info.ytd_taxable_after)} | 
                            YTD Tax: {formatCurrency(d.ytd_info.ytd_tax_before)} → {formatCurrency(d.ytd_info.ytd_tax_after)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-destructive tabular-nums">
                        -{formatCurrency(d.employee_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {result.localCurrencyCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium text-destructive align-top tabular-nums">
                        -{formatCurrency(d.employee_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {result.deductions.statutory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground italic">
                    No statutory deductions configured for this territory
                  </TableCell>
                </TableRow>
              )}

              {result.deductions.posttax.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground font-medium bg-muted/30">
                      Post-tax Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.posttax.map((d, idx) => {
                    const hasConversion = d.original_currency && d.original_amount !== undefined;
                    const originalCurrencyCode = hasConversion ? d.original_currency : result.localCurrencyCode;
                    const originalAmount = hasConversion ? d.original_amount : d.amount;
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell className="pl-6">{d.name}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-destructive tabular-nums">
                          -{formatCurrency(originalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {originalCurrencyCode}
                          </Badge>
                          {hasConversion && d.exchange_rate_used && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              @ {d.exchange_rate_used.toFixed(4)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium text-destructive tabular-nums">
                          -{formatCurrency(d.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              )}

              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right font-mono text-destructive tabular-nums">
                  -{formatCurrency(result.deductions.total_deductions)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {result.localCurrencyCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-destructive tabular-nums font-bold">
                  -{formatCurrency(result.deductions.total_deductions)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Net Pay */}
      <div className="bg-success/10 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Net Pay</span>
          <div className="text-right">
            <span className="font-bold text-2xl text-success tabular-nums">{formatCurrency(result.net_pay)}</span>
            <Badge variant="outline" className="ml-2 font-mono text-xs">
              {result.localCurrencyCode}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Amount to be paid in {result.localCurrencyCode}</p>
      </div>

      {/* Employee Requested Net Pay Distribution */}
      {employeeCurrencyPreference && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Requested Net Pay Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const netPaySplit = calculateNetPaySplit(
                result.net_pay,
                localCurrencyId || '',
                employeeCurrencyPreference,
                confirmedRatesMap
              );
              
              return (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    Employee requested: <span className="font-medium capitalize">{employeeCurrencyPreference.split_method.replace('_', ' ')}</span>
                    {employeeCurrencyPreference.split_method === 'percentage' && employeeCurrencyPreference.secondary_currency_percentage && (
                      <span> — {100 - employeeCurrencyPreference.secondary_currency_percentage}% primary, {employeeCurrencyPreference.secondary_currency_percentage}% secondary</span>
                    )}
                    {employeeCurrencyPreference.split_method === 'fixed_amount' && employeeCurrencyPreference.secondary_currency_fixed_amount && (
                      <span> — Fixed {formatCurrency(employeeCurrencyPreference.secondary_currency_fixed_amount)} to secondary</span>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Currency</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Exchange Rate</TableHead>
                        <TableHead className="text-right">Local Equivalent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {netPaySplit.map((split, idx) => {
                        const currency = currencies.find(c => c.id === split.currency_id);
                        return (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={split.is_primary ? "default" : "secondary"} className="font-mono text-xs">
                                {currency?.code || 'Unknown'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {split.is_primary ? '(Primary)' : '(Secondary)'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatCurrency(split.amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground tabular-nums">
                            {split.exchange_rate_used ? split.exchange_rate_used.toFixed(4) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {split.local_currency_equivalent !== null ? formatCurrency(split.local_currency_equivalent) : '—'}
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      <Button onClick={runSimulation} disabled={isCalculating} className="w-full gap-2">
        <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
        Recalculate
      </Button>

      {exchangeRateDialog}
    </div>
  );
}
