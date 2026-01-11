import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Industry {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  parent_industry_id: string | null;
  is_active: boolean;
  display_order: number;
}

export function useIndustries() {
  const { data: industries = [], isLoading, error } = useQuery({
    queryKey: ["master-industries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_industries")
        .select("id, code, name, description, icon_name, parent_industry_id, is_active, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Industry[];
    },
  });

  // Separate parent and child industries
  const parentIndustries = industries.filter((i) => !i.parent_industry_id);
  const childrenByParent: Record<string, Industry[]> = {};
  
  industries.forEach((i) => {
    if (i.parent_industry_id) {
      if (!childrenByParent[i.parent_industry_id]) {
        childrenByParent[i.parent_industry_id] = [];
      }
      childrenByParent[i.parent_industry_id].push(i);
    }
  });

  return {
    industries,
    parentIndustries,
    childrenByParent,
    isLoading,
    error,
  };
}
