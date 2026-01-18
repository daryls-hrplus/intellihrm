import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AccessibleCompany {
  id: string;
  name: string;
  code: string;
  isCurrentCompany: boolean;
}

export function useUserAccessibleCompanies() {
  const { user, profile } = useAuth();
  const currentCompanyId = profile?.company_id;

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ["user-accessible-companies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get the list of accessible company IDs
      const { data: accessibleIds, error: rpcError } = await supabase.rpc("get_user_accessible_companies");
      
      if (rpcError) {
        console.error("Error fetching accessible companies:", rpcError);
        throw rpcError;
      }

      if (!accessibleIds || accessibleIds.length === 0) {
        return [];
      }

      // Then fetch the full company details including code
      const companyIds = accessibleIds.map((c: { id: string; name: string }) => c.id);
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, name, code")
        .in("id", companyIds)
        .order("code", { ascending: true });

      if (companiesError) {
        console.error("Error fetching company details:", companiesError);
        throw companiesError;
      }

      return (companiesData || []).map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code || "",
        isCurrentCompany: c.id === currentCompanyId,
      })) as AccessibleCompany[];
    },
    enabled: !!user?.id,
  });

  return {
    companies,
    companyIds: companies.map(c => c.id),
    isLoading,
    error,
  };
}
