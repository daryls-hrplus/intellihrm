import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SavingsProgramCategory = 
  | 'credit_union' 
  | 'company_sponsored' 
  | 'goal_based' 
  | 'project_tied' 
  | 'christmas_club';

export type CalculationMethod = 'fixed' | 'percentage' | 'formula';

export type ReleaseType = 
  | 'on_demand' 
  | 'scheduled' 
  | 'goal_reached' 
  | 'project_end' 
  | 'termination_only';

export type InterestCalculationMethod = 
  | 'simple' 
  | 'compound_monthly' 
  | 'compound_quarterly' 
  | 'compound_annually';

export interface SavingsProgramType {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  category: SavingsProgramCategory;
  calculation_method: CalculationMethod;
  default_amount: number | null;
  default_percentage: number | null;
  min_contribution: number | null;
  max_contribution: number | null;
  has_employer_match: boolean;
  employer_match_percentage: number | null;
  employer_match_cap: number | null;
  employer_match_vesting_months: number | null;
  release_type: ReleaseType;
  scheduled_release_month: number | null;
  scheduled_release_day: number | null;
  allow_early_withdrawal: boolean;
  early_withdrawal_penalty_percentage: number | null;
  earns_interest: boolean;
  interest_rate_annual: number | null;
  interest_calculation_method: InterestCalculationMethod | null;
  min_tenure_months: number;
  eligible_employment_types: string[] | null;
  eligible_department_ids: string[] | null;
  is_pretax: boolean;
  pay_element_id: string | null;
  deduction_priority: number;
  institution_name: string | null;
  institution_code: string | null;
  institution_account: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateSavingsProgramInput {
  company_id: string;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  category: SavingsProgramCategory;
  calculation_method?: CalculationMethod;
  default_amount?: number;
  default_percentage?: number;
  min_contribution?: number;
  max_contribution?: number;
  has_employer_match?: boolean;
  employer_match_percentage?: number;
  employer_match_cap?: number;
  employer_match_vesting_months?: number;
  release_type?: ReleaseType;
  scheduled_release_month?: number;
  scheduled_release_day?: number;
  allow_early_withdrawal?: boolean;
  early_withdrawal_penalty_percentage?: number;
  earns_interest?: boolean;
  interest_rate_annual?: number;
  interest_calculation_method?: InterestCalculationMethod;
  min_tenure_months?: number;
  eligible_employment_types?: string[];
  eligible_department_ids?: string[];
  is_pretax?: boolean;
  pay_element_id?: string;
  deduction_priority?: number;
  institution_name?: string;
  institution_code?: string;
  institution_account?: string;
  is_active?: boolean;
  start_date: string;
  end_date?: string;
}

export const CATEGORY_LABELS: Record<SavingsProgramCategory, string> = {
  credit_union: 'Credit Union / Cooperative',
  company_sponsored: 'Company-Sponsored',
  goal_based: 'Goal-Based Savings',
  project_tied: 'Project-Tied',
  christmas_club: 'Christmas / Holiday Club',
};

export const CATEGORY_ICONS: Record<SavingsProgramCategory, string> = {
  credit_union: '🏦',
  company_sponsored: '🏢',
  goal_based: '🎯',
  project_tied: '📁',
  christmas_club: '🎄',
};

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  on_demand: 'On Demand',
  scheduled: 'Scheduled Release',
  goal_reached: 'When Goal Reached',
  project_end: 'At Project End',
  termination_only: 'Termination Only',
};

export const CALCULATION_METHOD_LABELS: Record<CalculationMethod, string> = {
  fixed: 'Fixed Amount',
  percentage: 'Percentage of Pay',
  formula: 'Custom Formula',
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function useSavingsPrograms(companyId?: string) {
  return useQuery({
    queryKey: ["savings-program-types", companyId],
    queryFn: async () => {
      let query = supabase
        .from("savings_program_types")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching savings programs:", error);
        throw error;
      }

      return data as SavingsProgramType[];
    },
    enabled: !!companyId,
  });
}

export function useSavingsProgram(programId: string | undefined) {
  return useQuery({
    queryKey: ["savings-program-type", programId],
    queryFn: async () => {
      if (!programId) return null;

      const { data, error } = await supabase
        .from("savings_program_types")
        .select("*")
        .eq("id", programId)
        .single();

      if (error) {
        console.error("Error fetching savings program:", error);
        throw error;
      }

      return data as SavingsProgramType;
    },
    enabled: !!programId,
  });
}

export function useCreateSavingsProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSavingsProgramInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("savings_program_types")
        .insert({
          ...input,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating savings program:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-program-types"] });
      toast.success(`Savings program "${data.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create savings program: ${error.message}`);
    },
  });
}

export function useUpdateSavingsProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<SavingsProgramType> & { id: string }) => {
      const { data, error } = await supabase
        .from("savings_program_types")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating savings program:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-program-types"] });
      queryClient.invalidateQueries({ queryKey: ["savings-program-type", data.id] });
      toast.success(`Savings program "${data.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update savings program: ${error.message}`);
    },
  });
}

export function useDeleteSavingsProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("savings_program_types")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting savings program:", error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-program-types"] });
      toast.success("Savings program deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete savings program: ${error.message}`);
    },
  });
}

export function useToggleSavingsProgramStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("savings_program_types")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling savings program status:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-program-types"] });
      toast.success(`Savings program ${data.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}
