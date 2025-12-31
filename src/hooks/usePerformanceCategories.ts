import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PerformanceCategory {
  id: string;
  company_id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  min_score: number;
  max_score: number;
  color: string;
  icon: string | null;
  promotion_eligible: boolean;
  succession_eligible: boolean;
  bonus_eligible: boolean;
  requires_pip: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePerformanceCategories(companyId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["performance-categories", companyId],
    queryFn: async () => {
      const targetCompanyId = companyId;
      if (!targetCompanyId) {
        // Get user's company
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user?.id)
          .single();
        
        if (!profile?.company_id) return [];
        
        const { data, error } = await supabase
          .from("performance_categories")
          .select("*")
          .eq("company_id", profile.company_id)
          .eq("is_active", true)
          .order("display_order");

        if (error) throw error;
        return (data || []) as PerformanceCategory[];
      }

      const { data, error } = await supabase
        .from("performance_categories")
        .select("*")
        .eq("company_id", targetCompanyId)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return (data || []) as PerformanceCategory[];
    },
    enabled: !!user,
  });
}

export function usePerformanceCategoryByScore(score: number | null | undefined, companyId?: string) {
  const { data: categories } = usePerformanceCategories(companyId);

  if (score === null || score === undefined || !categories?.length) {
    return null;
  }

  // Find the category that contains this score
  const category = categories.find(
    (cat) => score >= cat.min_score && score <= cat.max_score
  );

  return category || null;
}

export function useSeedPerformanceCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase.rpc("seed_default_performance_categories", {
        p_company_id: companyId,
      });

      if (error) throw error;
    },
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["performance-categories", companyId] });
      toast.success("Default performance categories created");
    },
    onError: (error) => {
      console.error("Error seeding categories:", error);
      toast.error("Failed to create default categories");
    },
  });
}

export function useManagePerformanceCategories() {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (category: Omit<PerformanceCategory, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("performance_categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data as PerformanceCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["performance-categories", data.company_id] });
      toast.success("Performance category created");
    },
    onError: (error) => {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PerformanceCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from("performance_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PerformanceCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["performance-categories", data.company_id] });
      toast.success("Performance category updated");
    },
    onError: (error) => {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      const { error } = await supabase
        .from("performance_categories")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      return companyId;
    },
    onSuccess: (companyId) => {
      queryClient.invalidateQueries({ queryKey: ["performance-categories", companyId] });
      toast.success("Performance category deactivated");
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    },
  });

  return { createCategory, updateCategory, deleteCategory };
}
