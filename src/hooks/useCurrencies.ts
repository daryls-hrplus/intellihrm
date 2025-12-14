import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
  is_group_base: boolean;
}

export interface ExchangeRate {
  id: string;
  from_currency_id: string;
  to_currency_id: string;
  rate: number;
  rate_date: string;
  source: string | null;
  notes: string | null;
}

export function useCurrencies() {
  const { data: currencies = [], isLoading, error } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return data as Currency[];
    }
  });

  const baseCurrency = currencies.find(c => c.is_group_base);

  return {
    currencies,
    baseCurrency,
    isLoading,
    error
  };
}

export function useExchangeRate(
  fromCurrencyId: string | undefined,
  toCurrencyId: string | undefined,
  rateDate?: string
) {
  return useQuery({
    queryKey: ["exchange-rate", fromCurrencyId, toCurrencyId, rateDate],
    queryFn: async () => {
      if (!fromCurrencyId || !toCurrencyId) return null;
      if (fromCurrencyId === toCurrencyId) return 1;

      const targetDate = rateDate || new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("from_currency_id", fromCurrencyId)
        .eq("to_currency_id", toCurrencyId)
        .lte("rate_date", targetDate)
        .order("rate_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.rate || null;
    },
    enabled: !!fromCurrencyId && !!toCurrencyId
  });
}

export function useCompanyLocalCurrency(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-local-currency", companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from("companies")
        .select(`
          local_currency_id,
          local_currency:currencies!companies_local_currency_id_fkey(*)
        `)
        .eq("id", companyId)
        .single();

      if (error) throw error;
      return data?.local_currency as Currency | null;
    },
    enabled: !!companyId
  });
}

export function useGroupBaseCurrency(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group-base-currency", groupId],
    queryFn: async () => {
      if (!groupId) return null;

      const { data, error } = await supabase
        .from("company_groups")
        .select(`
          base_currency_id,
          base_currency:currencies!company_groups_base_currency_id_fkey(*)
        `)
        .eq("id", groupId)
        .single();

      if (error) throw error;
      return data?.base_currency as Currency | null;
    },
    enabled: !!groupId
  });
}

export function convertCurrency(
  amount: number,
  exchangeRate: number | null | undefined
): number | null {
  if (exchangeRate == null) return null;
  return amount * exchangeRate;
}

export function formatCurrency(
  amount: number,
  currency: Currency | null | undefined
): string {
  if (!currency) return amount.toFixed(2);
  
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.decimal_places || 2,
    maximumFractionDigits: currency.decimal_places || 2
  }).format(amount);
}
