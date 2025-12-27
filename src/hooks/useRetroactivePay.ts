import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RetroactivePayConfig {
  id: string;
  company_id: string;
  pay_group_id: string;
  config_name: string;
  description: string | null;
  effective_start_date: string;
  effective_end_date: string;
  status: string;
  target_run_types: string[] | null;
  target_pay_period_id: string | null;
  auto_include: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  pay_group?: {
    id: string;
    name: string;
    code: string;
  };
  target_pay_period?: {
    id: string;
    period_number: string;
    period_start: string;
    period_end: string;
  };
}

export interface RetroactivePayConfigItem {
  id: string;
  config_id: string;
  pay_element_id: string;
  increase_type: string;
  increase_value: number;
  min_amount: number | null;
  max_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  pay_element?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface RetroactivePayCalculation {
  id: string;
  config_id: string;
  employee_id: string;
  pay_period_id: string | null;
  pay_year: number;
  pay_cycle_number: number;
  pay_element_id: string;
  original_amount: number;
  increase_type: string;
  increase_value: number;
  adjustment_amount: number;
  employee_status: string;
  calculation_date: string;
  processed_in_run_id: string | null;
  processed_at: string | null;
  created_at: string;
  employee?: any;
  pay_element?: {
    id: string;
    name: string;
    code: string;
  };
  pay_period?: {
    id: string;
    period_number: number;
    start_date: string;
    end_date: string;
  };
}

export interface RetroactivePayConfigInput {
  company_id: string;
  pay_group_id: string;
  config_name: string;
  description?: string;
  effective_start_date: string;
  effective_end_date: string;
  status?: string;
  target_run_types?: string[];
  target_pay_period_id?: string;
  auto_include?: boolean;
}

export interface RetroactivePayConfigItemInput {
  config_id: string;
  pay_element_id: string;
  increase_type: string;
  increase_value: number;
  min_amount?: number;
  max_amount?: number;
  notes?: string;
}

export function useRetroactivePay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async (companyId: string): Promise<RetroactivePayConfig[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("retroactive_pay_configs")
        .select(`*, pay_group:pay_groups(id, name, code)`)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      return (data || []) as RetroactivePayConfig[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigWithItems = async (configId: string): Promise<{
    config: RetroactivePayConfig | null;
    items: RetroactivePayConfigItem[];
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const [configResult, itemsResult] = await Promise.all([
        supabase.from("retroactive_pay_configs").select(`*, pay_group:pay_groups(id, name, code)`).eq("id", configId).single(),
        supabase.from("retroactive_pay_config_items").select(`*, pay_element:pay_elements(id, name, code)`).eq("config_id", configId).order("created_at"),
      ]);

      if (configResult.error) throw configResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return {
        config: configResult.data as RetroactivePayConfig,
        items: (itemsResult.data || []) as RetroactivePayConfigItem[],
      };
    } catch (err: any) {
      setError(err.message);
      return { config: null, items: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const createConfig = async (data: RetroactivePayConfigInput): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: result, error: insertError } = await supabase
        .from("retroactive_pay_configs")
        .insert(data as any)
        .select("id")
        .single();

      if (insertError) throw insertError;
      return result?.id || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (id: string, data: Partial<RetroactivePayConfigInput>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.from("retroactive_pay_configs").update(data as any).eq("id", id);
      if (updateError) throw updateError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfig = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from("retroactive_pay_configs").delete().eq("id", id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addConfigItem = async (data: RetroactivePayConfigItemInput): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: result, error: insertError } = await supabase
        .from("retroactive_pay_config_items")
        .insert(data as any)
        .select("id")
        .single();
      if (insertError) throw insertError;
      return result?.id || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfigItem = async (id: string, data: Partial<RetroactivePayConfigItemInput>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.from("retroactive_pay_config_items").update(data as any).eq("id", id);
      if (updateError) throw updateError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfigItem = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from("retroactive_pay_config_items").delete().eq("id", id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveConfig = async (id: string, userId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("retroactive_pay_configs")
        .update({ status: 'approved', approved_by: userId, approved_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (updateError) throw updateError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalculations = async (configId: string): Promise<{ success: boolean; count: number; totalAdjustment: number }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { generateRetroactiveCalculations } = await import("@/utils/payroll/retroactivePayService");
      const result = await generateRetroactiveCalculations(configId);
      
      if (!result.success) {
        setError(result.error || "Failed to generate calculations");
      }
      
      return { 
        success: result.success, 
        count: result.count, 
        totalAdjustment: result.totalAdjustment 
      };
    } catch (err: any) {
      setError(err.message);
      return { success: false, count: 0, totalAdjustment: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalculations = async (configId: string): Promise<RetroactivePayCalculation[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("retroactive_pay_calculations")
        .select(`*, pay_element:pay_elements(id, name, code)`)
        .eq("config_id", configId)
        .order("pay_year")
        .order("pay_cycle_number");

      if (fetchError) throw fetchError;
      return (data || []) as RetroactivePayCalculation[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchConfigs,
    fetchConfigWithItems,
    createConfig,
    updateConfig,
    deleteConfig,
    addConfigItem,
    updateConfigItem,
    deleteConfigItem,
    approveConfig,
    generateCalculations,
    fetchCalculations,
  };
}
