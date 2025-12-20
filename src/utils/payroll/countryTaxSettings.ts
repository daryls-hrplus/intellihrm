import { supabase } from "@/integrations/supabase/client";

export interface CountryTaxSettings {
  id: string;
  country: string;
  taxCalculationMethod: 'cumulative' | 'non_cumulative';
  allowMidYearRefunds: boolean;
  refundMethod: 'automatic' | 'end_of_year' | 'manual_claim';
  refundDisplayType: 'separate_line_item' | 'reduced_tax';
  refundCalculationFrequency: 'monthly' | 'quarterly' | 'annually';
  refundLineItemLabel: string | null;
  description: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
}

/**
 * Fetch tax calculation settings for a specific country
 * Returns null if no settings found (defaults to cumulative)
 */
export async function fetchCountryTaxSettings(
  countryCode: string,
  effectiveDate?: string
): Promise<CountryTaxSettings | null> {
  const today = effectiveDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('country_tax_settings')
    .select('*')
    .eq('country', countryCode)
    .eq('is_active', true)
    .lte('effective_from', today)
    .or(`effective_to.is.null,effective_to.gte.${today}`)
    .maybeSingle();

  if (error) {
    console.error('Error fetching country tax settings:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    country: data.country,
    taxCalculationMethod: data.tax_calculation_method as 'cumulative' | 'non_cumulative',
    allowMidYearRefunds: data.allow_mid_year_refunds,
    refundMethod: data.refund_method as 'automatic' | 'end_of_year' | 'manual_claim',
    refundDisplayType: (data.refund_display_type || 'reduced_tax') as 'separate_line_item' | 'reduced_tax',
    refundCalculationFrequency: (data.refund_calculation_frequency || 'monthly') as 'monthly' | 'quarterly' | 'annually',
    refundLineItemLabel: data.refund_line_item_label || 'PAYE Refund',
    description: data.description,
    effectiveFrom: data.effective_from,
    effectiveTo: data.effective_to,
    isActive: data.is_active,
  };
}

/**
 * Get default tax settings for countries without specific configuration
 * Defaults to cumulative with automatic refunds (most common method)
 */
export function getDefaultTaxSettings(countryCode: string): CountryTaxSettings {
  return {
    id: '',
    country: countryCode,
    taxCalculationMethod: 'cumulative',
    allowMidYearRefunds: true,
    refundMethod: 'automatic',
    refundDisplayType: 'reduced_tax',
    refundCalculationFrequency: 'monthly',
    refundLineItemLabel: 'PAYE Refund',
    description: 'Default settings - cumulative tax calculation',
    effectiveFrom: '1900-01-01',
    effectiveTo: null,
    isActive: true,
  };
}

/**
 * Fetch all country tax settings for configuration UI
 */
export async function fetchAllCountryTaxSettings(): Promise<CountryTaxSettings[]> {
  const { data, error } = await supabase
    .from('country_tax_settings')
    .select('*')
    .order('country');

  if (error) {
    console.error('Error fetching all country tax settings:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    country: row.country,
    taxCalculationMethod: row.tax_calculation_method as 'cumulative' | 'non_cumulative',
    allowMidYearRefunds: row.allow_mid_year_refunds,
    refundMethod: row.refund_method as 'automatic' | 'end_of_year' | 'manual_claim',
    refundDisplayType: (row.refund_display_type || 'reduced_tax') as 'separate_line_item' | 'reduced_tax',
    refundCalculationFrequency: (row.refund_calculation_frequency || 'monthly') as 'monthly' | 'quarterly' | 'annually',
    refundLineItemLabel: row.refund_line_item_label || 'PAYE Refund',
    description: row.description,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    isActive: row.is_active,
  }));
}

/**
 * Create or update country tax settings
 */
export async function upsertCountryTaxSettings(
  settings: Omit<CountryTaxSettings, 'id'> & { id?: string }
): Promise<{ success: boolean; error?: string }> {
  const payload = {
    id: settings.id || undefined,
    country: settings.country,
    tax_calculation_method: settings.taxCalculationMethod,
    allow_mid_year_refunds: settings.allowMidYearRefunds,
    refund_method: settings.refundMethod,
    refund_display_type: settings.refundDisplayType,
    refund_calculation_frequency: settings.refundCalculationFrequency,
    refund_line_item_label: settings.refundLineItemLabel,
    description: settings.description,
    effective_from: settings.effectiveFrom,
    effective_to: settings.effectiveTo,
    is_active: settings.isActive,
  };

  const { error } = await supabase
    .from('country_tax_settings')
    .upsert(payload, { onConflict: 'country' });

  if (error) {
    console.error('Error upserting country tax settings:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
