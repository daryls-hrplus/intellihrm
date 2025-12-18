import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PayElement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  element_type_id: string | null;
  proration_method_id: string | null;
  is_taxable: boolean;
  is_pensionable: boolean;
  is_active: boolean;
  show_on_payslip: boolean;
  company_id: string | null;
  display_order: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  element_type?: { code: string; name: string } | null;
  proration_method?: { code: string; name: string } | null;
}

export interface SalaryGrade {
  id: string;
  code: string;
  name: string;
  description: string | null;
  company_id: string | null;
  min_salary: number | null;
  mid_salary: number | null;
  max_salary: number | null;
  currency: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PositionCompensation {
  id: string;
  position_id: string;
  pay_element_id: string;
  amount: number;
  currency: string;
  frequency_id: string | null;
  effective_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  pay_element?: PayElement;
  frequency?: { code: string; name: string } | null;
  position?: { title: string; code: string };
}

export interface LookupValue {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export function useCompensation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayElements = async (companyId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("pay_elements")
        .select(`
          *,
          element_type:lookup_values!pay_elements_element_type_id_fkey(code, name),
          proration_method:lookup_values!pay_elements_proration_method_id_fkey(code, name)
        `)
        .order("display_order");

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      return data as PayElement[];
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch pay elements");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createPayElement = async (data: Partial<PayElement>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("pay_elements").insert([data as any]);
      if (error) throw error;
      toast.success("Pay element created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create pay element");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayElement = async (id: string, data: Partial<PayElement>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("pay_elements").update(data).eq("id", id);
      if (error) throw error;
      toast.success("Pay element updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update pay element");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayElement = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("pay_elements").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pay element deleted");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete pay element");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalaryGrades = async (companyId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from("salary_grades").select("*").order("code");

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      return data as SalaryGrade[];
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch salary grades");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createSalaryGrade = async (data: Partial<SalaryGrade>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("salary_grades").insert([data as any]);
      if (error) throw error;
      toast.success("Salary grade created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create salary grade");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSalaryGrade = async (id: string, data: Partial<SalaryGrade>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("salary_grades").update(data).eq("id", id);
      if (error) throw error;
      toast.success("Salary grade updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update salary grade");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSalaryGrade = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("salary_grades").delete().eq("id", id);
      if (error) throw error;
      toast.success("Salary grade deleted");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete salary grade");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositionCompensation = async (positionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("position_compensation")
        .select(`
          *,
          pay_element:pay_elements(
            *,
            element_type:lookup_values!pay_elements_element_type_id_fkey(code, name)
          ),
          frequency:lookup_values!position_compensation_frequency_id_fkey(code, name)
        `)
        .eq("position_id", positionId)
        .order("effective_date", { ascending: false });

      if (error) throw error;
      return data as PositionCompensation[];
    } catch (err: any) {
      toast.error("Failed to fetch position compensation");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createPositionCompensation = async (data: Partial<PositionCompensation>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("position_compensation").insert([data as any]);
      if (error) throw error;
      toast.success("Compensation added");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to add compensation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePositionCompensation = async (id: string, data: Partial<PositionCompensation>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("position_compensation").update(data).eq("id", id);
      if (error) throw error;
      toast.success("Compensation updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update compensation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePositionCompensation = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("position_compensation").delete().eq("id", id);
      if (error) throw error;
      toast.success("Compensation removed");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to remove compensation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLookupValues = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("lookup_values")
        .select("id, code, name, description")
        .eq("category", category as any)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as LookupValue[];
    } catch (err: any) {
      console.error(`Failed to fetch ${category} lookup values:`, err);
      return [];
    }
  };

  return {
    isLoading,
    error,
    fetchPayElements,
    createPayElement,
    updatePayElement,
    deletePayElement,
    fetchSalaryGrades,
    createSalaryGrade,
    updateSalaryGrade,
    deleteSalaryGrade,
    fetchPositionCompensation,
    createPositionCompensation,
    updatePositionCompensation,
    deletePositionCompensation,
    fetchLookupValues,
  };
}
