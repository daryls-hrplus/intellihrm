import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Currency } from "./useCurrencies";

export interface EmployeeCurrencyPreference {
  id: string;
  employee_id: string;
  company_id: string;
  primary_currency_id: string;
  secondary_currency_id: string | null;
  secondary_currency_percentage: number | null;
  secondary_currency_fixed_amount: number | null;
  split_method: 'percentage' | 'fixed_amount' | 'all_primary';
  effective_date: string;
  end_date: string | null;
  primary_currency?: Currency;
  secondary_currency?: Currency;
}

export interface PayrollRunExchangeRate {
  id: string;
  payroll_run_id: string;
  from_currency_id: string;
  to_currency_id: string;
  exchange_rate: number;
  rate_date: string;
  source: string | null;
  locked_at: string | null;
  locked_by: string | null;
  notes: string | null;
  from_currency?: Currency;
  to_currency?: Currency;
}

export interface NetPaySplit {
  currency_id: string;
  currency?: Currency;
  amount: number;
  exchange_rate_used: number | null;
  local_currency_equivalent: number | null;
  is_primary: boolean;
}

// Check if pay group has multi-currency enabled
export function usePayGroupMultiCurrency(payGroupId: string | undefined) {
  return useQuery({
    queryKey: ["pay-group-multi-currency", payGroupId],
    queryFn: async () => {
      if (!payGroupId) return null;
      
      const { data, error } = await supabase
        .from("pay_groups")
        .select("enable_multi_currency, default_exchange_rate_source")
        .eq("id", payGroupId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!payGroupId
  });
}

// Get employee's currency preferences
export function useEmployeeCurrencyPreference(
  employeeId: string | undefined,
  companyId: string | undefined,
  effectiveDate?: string
) {
  return useQuery({
    queryKey: ["employee-currency-preference", employeeId, companyId, effectiveDate],
    queryFn: async () => {
      if (!employeeId || !companyId) return null;
      
      const targetDate = effectiveDate || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("employee_currency_preferences")
        .select(`
          *,
          primary_currency:currencies!employee_currency_preferences_primary_currency_id_fkey(*),
          secondary_currency:currencies!employee_currency_preferences_secondary_currency_id_fkey(*)
        `)
        .eq("employee_id", employeeId)
        .eq("company_id", companyId)
        .lte("effective_date", targetDate)
        .or(`end_date.is.null,end_date.gte.${targetDate}`)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as EmployeeCurrencyPreference | null;
    },
    enabled: !!employeeId && !!companyId
  });
}

// Save employee currency preference
export function useSaveEmployeeCurrencyPreference() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preference: Omit<EmployeeCurrencyPreference, 'id' | 'primary_currency' | 'secondary_currency'> & { id?: string }) => {
      const { id, ...data } = preference;
      
      if (id) {
        const { error } = await supabase
          .from("employee_currency_preferences")
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("employee_currency_preferences")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-currency-preference"] });
      toast.success("Currency preferences saved");
    },
    onError: (error) => {
      toast.error("Failed to save currency preferences");
      console.error(error);
    }
  });
}

// Get exchange rates for a payroll run
export function usePayrollRunExchangeRates(payrollRunId: string | undefined) {
  return useQuery({
    queryKey: ["payroll-run-exchange-rates", payrollRunId],
    queryFn: async () => {
      if (!payrollRunId) return [];
      
      const { data, error } = await supabase
        .from("payroll_run_exchange_rates")
        .select(`
          *,
          from_currency:currencies!payroll_run_exchange_rates_from_currency_id_fkey(*),
          to_currency:currencies!payroll_run_exchange_rates_to_currency_id_fkey(*)
        `)
        .eq("payroll_run_id", payrollRunId);
      
      if (error) throw error;
      return data as PayrollRunExchangeRate[];
    },
    enabled: !!payrollRunId
  });
}

// Set exchange rates for a payroll run
export function useSetPayrollRunExchangeRates() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      payrollRunId,
      rates,
      rateDate
    }: {
      payrollRunId: string;
      rates: Array<{
        from_currency_id: string;
        to_currency_id: string;
        exchange_rate: number;
        source?: string;
      }>;
      rateDate: string;
    }) => {
      // Delete existing rates for this run
      await supabase
        .from("payroll_run_exchange_rates")
        .delete()
        .eq("payroll_run_id", payrollRunId);
      
      // Insert new rates
      const ratesToInsert = rates.map(r => ({
        payroll_run_id: payrollRunId,
        from_currency_id: r.from_currency_id,
        to_currency_id: r.to_currency_id,
        exchange_rate: r.exchange_rate,
        rate_date: rateDate,
        source: r.source || 'manual'
      }));
      
      const { error } = await supabase
        .from("payroll_run_exchange_rates")
        .insert(ratesToInsert);
      
      if (error) throw error;
      
      // Update the payroll run with the rate selection date
      await supabase
        .from("payroll_runs")
        .update({ exchange_rate_selection_date: rateDate })
        .eq("id", payrollRunId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-run-exchange-rates"] });
      toast.success("Exchange rates saved for payroll run");
    },
    onError: (error) => {
      toast.error("Failed to save exchange rates");
      console.error(error);
    }
  });
}

// Get currencies used in employee compensations for a pay group
export function usePayGroupCurrencies(payGroupId: string | undefined) {
  return useQuery({
    queryKey: ["pay-group-currencies", payGroupId],
    queryFn: async () => {
      if (!payGroupId) return [];
      
      // Get all employees in this pay group and their compensation currencies
      const { data: compensations, error } = await supabase
        .from("employee_compensation")
        .select(`
          currency_id,
          currency,
          pay_element:pay_elements!inner(
            company_id
          ),
          position:employee_positions!inner(
            pay_group_id
          )
        `)
        .eq("is_active", true);
      
      if (error) throw error;
      
      // Get unique currency IDs
      const currencyIds = new Set<string>();
      compensations?.forEach(c => {
        if (c.currency_id) currencyIds.add(c.currency_id);
      });
      
      if (currencyIds.size === 0) return [];
      
      // Fetch the currency details
      const { data: currencies, error: currError } = await supabase
        .from("currencies")
        .select("*")
        .in("id", Array.from(currencyIds));
      
      if (currError) throw currError;
      return currencies as Currency[];
    },
    enabled: !!payGroupId
  });
}

// Calculate net pay split based on employee preferences
export function calculateNetPaySplit(
  netPayLocalCurrency: number,
  localCurrencyId: string,
  preference: EmployeeCurrencyPreference | null,
  exchangeRates: Map<string, number> // key: "from_to", value: rate
): NetPaySplit[] {
  // If no preference or all primary, return everything in local currency
  if (!preference || preference.split_method === 'all_primary') {
    return [{
      currency_id: localCurrencyId,
      amount: netPayLocalCurrency,
      exchange_rate_used: 1,
      local_currency_equivalent: netPayLocalCurrency,
      is_primary: true
    }];
  }
  
  const splits: NetPaySplit[] = [];
  let secondaryAmount = 0;
  let secondaryRate = 1;
  
  if (preference.secondary_currency_id) {
    // Get exchange rate from local to secondary
    const rateKey = `${localCurrencyId}_${preference.secondary_currency_id}`;
    secondaryRate = exchangeRates.get(rateKey) || 1;
    
    if (preference.split_method === 'percentage' && preference.secondary_currency_percentage) {
      // Calculate percentage of net pay to go to secondary currency
      const localAmountForSecondary = netPayLocalCurrency * (preference.secondary_currency_percentage / 100);
      secondaryAmount = localAmountForSecondary * secondaryRate;
      
      splits.push({
        currency_id: preference.secondary_currency_id,
        amount: secondaryAmount,
        exchange_rate_used: secondaryRate,
        local_currency_equivalent: localAmountForSecondary,
        is_primary: false
      });
      
      splits.push({
        currency_id: preference.primary_currency_id,
        amount: netPayLocalCurrency - localAmountForSecondary,
        exchange_rate_used: 1,
        local_currency_equivalent: netPayLocalCurrency - localAmountForSecondary,
        is_primary: true
      });
    } else if (preference.split_method === 'fixed_amount' && preference.secondary_currency_fixed_amount) {
      // Fixed amount in secondary currency
      secondaryAmount = preference.secondary_currency_fixed_amount;
      const localEquivalent = secondaryAmount / secondaryRate;
      
      // Ensure we don't exceed net pay
      const actualLocalEquivalent = Math.min(localEquivalent, netPayLocalCurrency);
      const actualSecondaryAmount = actualLocalEquivalent * secondaryRate;
      
      splits.push({
        currency_id: preference.secondary_currency_id,
        amount: actualSecondaryAmount,
        exchange_rate_used: secondaryRate,
        local_currency_equivalent: actualLocalEquivalent,
        is_primary: false
      });
      
      splits.push({
        currency_id: preference.primary_currency_id,
        amount: netPayLocalCurrency - actualLocalEquivalent,
        exchange_rate_used: 1,
        local_currency_equivalent: netPayLocalCurrency - actualLocalEquivalent,
        is_primary: true
      });
    }
  } else {
    // Only primary currency
    splits.push({
      currency_id: preference.primary_currency_id,
      amount: netPayLocalCurrency,
      exchange_rate_used: 1,
      local_currency_equivalent: netPayLocalCurrency,
      is_primary: true
    });
  }
  
  return splits;
}

// Convert amount from one currency to another using stored rates
export function convertWithStoredRate(
  amount: number,
  fromCurrencyId: string,
  toCurrencyId: string,
  exchangeRates: PayrollRunExchangeRate[]
): { convertedAmount: number; rateUsed: number } | null {
  if (fromCurrencyId === toCurrencyId) {
    return { convertedAmount: amount, rateUsed: 1 };
  }
  
  const rate = exchangeRates.find(
    r => r.from_currency_id === fromCurrencyId && r.to_currency_id === toCurrencyId
  );
  
  if (rate) {
    return {
      convertedAmount: amount * rate.exchange_rate,
      rateUsed: rate.exchange_rate
    };
  }
  
  // Try inverse rate
  const inverseRate = exchangeRates.find(
    r => r.from_currency_id === toCurrencyId && r.to_currency_id === fromCurrencyId
  );
  
  if (inverseRate) {
    const calculatedRate = 1 / inverseRate.exchange_rate;
    return {
      convertedAmount: amount * calculatedRate,
      rateUsed: calculatedRate
    };
  }
  
  return null;
}

// Enable/disable multi-currency for a pay group
export function useTogglePayGroupMultiCurrency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      payGroupId,
      enabled
    }: {
      payGroupId: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("pay_groups")
        .update({ enable_multi_currency: enabled })
        .eq("id", payGroupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-group-multi-currency"] });
      queryClient.invalidateQueries({ queryKey: ["pay-groups"] });
      toast.success("Multi-currency setting updated");
    },
    onError: (error) => {
      toast.error("Failed to update multi-currency setting");
      console.error(error);
    }
  });
}
