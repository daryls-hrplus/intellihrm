import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "./useCurrencies";

export interface CompanyCurrency {
  id: string;
  company_id: string;
  currency_id: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  currency: Currency;
}

/**
 * Fetches currencies linked to a specific company.
 * Falls back to all active currencies if no company currencies are configured.
 */
export function useCompanyCurrencies(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-currencies", companyId],
    queryFn: async () => {
      if (!companyId) return { currencies: [], defaultCurrency: null, hasCompanyCurrencies: false };

      // First try to get company-specific currencies
      const { data: companyCurrencies, error } = await supabase
        .from("company_currencies")
        .select(`
          id,
          company_id,
          currency_id,
          is_default,
          is_active,
          sort_order,
          currency:currencies(*)
        `)
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // If company has linked currencies, use those
      if (companyCurrencies && companyCurrencies.length > 0) {
        const currencies = companyCurrencies.map(cc => cc.currency as Currency);
        const defaultEntry = companyCurrencies.find(cc => cc.is_default);
        const defaultCurrency = defaultEntry ? defaultEntry.currency as Currency : currencies[0];

        return {
          currencies,
          defaultCurrency,
          hasCompanyCurrencies: true,
          companyCurrencyRecords: companyCurrencies
        };
      }

      // Fallback: get all active currencies
      const { data: allCurrencies, error: fallbackError } = await supabase
        .from("currencies")
        .select("*")
        .eq("is_active", true)
        .order("code");

      if (fallbackError) throw fallbackError;

      // Try to find company's local currency as default
      const { data: companyData } = await supabase
        .from("companies")
        .select("local_currency_id")
        .eq("id", companyId)
        .single();

      const localCurrencyId = companyData?.local_currency_id;
      const defaultCurrency = localCurrencyId 
        ? (allCurrencies as Currency[]).find(c => c.id === localCurrencyId) || null
        : null;

      return {
        currencies: (allCurrencies || []) as Currency[],
        defaultCurrency,
        hasCompanyCurrencies: false,
        companyCurrencyRecords: []
      };
    },
    enabled: !!companyId
  });
}

/**
 * Simple hook that returns just the currency list for a company
 * Use this in dropdown components
 */
export function useCompanyCurrencyList(companyId: string | undefined) {
  const { data, isLoading, error } = useCompanyCurrencies(companyId);
  
  return {
    currencies: data?.currencies || [],
    defaultCurrency: data?.defaultCurrency || null,
    hasCompanyCurrencies: data?.hasCompanyCurrencies || false,
    isLoading,
    error
  };
}
