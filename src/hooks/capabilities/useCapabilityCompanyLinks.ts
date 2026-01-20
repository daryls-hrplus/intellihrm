import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompanyCapabilityLink {
  id: string;
  company_id: string;
  capability_id: string;
  company_name?: string;
  created_at: string;
}

export function useCapabilityCompanyLinks() {
  const [linkedCompanies, setLinkedCompanies] = useState<CompanyCapabilityLink[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch all company links for a specific capability
   */
  const fetchLinkedCompanies = useCallback(async (capabilityId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_capabilities")
        .select(`
          id,
          company_id,
          capability_id,
          created_at,
          companies!inner(name)
        `)
        .eq("capability_id", capabilityId);

      if (error) {
        console.error("Error fetching linked companies:", error);
        return [];
      }

      const transformed = (data || []).map((item: any) => ({
        id: item.id,
        company_id: item.company_id,
        capability_id: item.capability_id,
        company_name: item.companies?.name,
        created_at: item.created_at,
      }));

      setLinkedCompanies(transformed);
      return transformed;
    } catch (err) {
      console.error("Error in fetchLinkedCompanies:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sync company links - add new ones, remove unlinked ones
   */
  const syncCompanyLinks = useCallback(async (
    capabilityId: string,
    companyIds: string[]
  ): Promise<boolean> => {
    try {
      // Get current links
      const { data: currentLinks, error: fetchError } = await supabase
        .from("company_capabilities")
        .select("id, company_id")
        .eq("capability_id", capabilityId);

      if (fetchError) {
        console.error("Error fetching current links:", fetchError);
        return false;
      }

      const currentCompanyIds = new Set((currentLinks || []).map(l => l.company_id));
      const targetCompanyIds = new Set(companyIds);

      // Find links to add
      const toAdd = companyIds.filter(id => !currentCompanyIds.has(id));

      // Find links to remove
      const toRemove = (currentLinks || [])
        .filter(l => !targetCompanyIds.has(l.company_id))
        .map(l => l.id);

      // Add new links
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("company_capabilities")
          .insert(toAdd.map(companyId => ({
            capability_id: capabilityId,
            company_id: companyId,
          })));

        if (insertError) {
          console.error("Error adding company links:", insertError);
          return false;
        }
      }

      // Remove old links
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("company_capabilities")
          .delete()
          .in("id", toRemove);

        if (deleteError) {
          console.error("Error removing company links:", deleteError);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error("Error syncing company links:", err);
      return false;
    }
  }, []);

  /**
   * Get all capabilities linked to a specific company (via junction table or global)
   */
  const fetchCapabilitiesForCompany = useCallback(async (
    companyId: string,
    type?: "SKILL" | "COMPETENCY" | "VALUE"
  ) => {
    try {
      // Get capability IDs linked to this company
      const { data: linkedIds, error: linkError } = await supabase
        .from("company_capabilities")
        .select("capability_id")
        .eq("company_id", companyId);

      if (linkError) {
        console.error("Error fetching linked capability IDs:", linkError);
        return [];
      }

      const linkedCapabilityIds = (linkedIds || []).map(l => l.capability_id);

      // Fetch capabilities that are either global OR linked to this company
      let query = supabase
        .from("skills_competencies")
        .select("*")
        .or(
          linkedCapabilityIds.length > 0
            ? `is_global.eq.true,id.in.(${linkedCapabilityIds.join(",")})`
            : `is_global.eq.true`
        );

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query.order("name");

      if (error) {
        console.error("Error fetching capabilities for company:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error in fetchCapabilitiesForCompany:", err);
      return [];
    }
  }, []);

  /**
   * Get company link counts for multiple capabilities
   */
  const fetchLinkCounts = useCallback(async (capabilityIds: string[]) => {
    if (capabilityIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from("company_capabilities")
        .select("capability_id")
        .in("capability_id", capabilityIds);

      if (error) {
        console.error("Error fetching link counts:", error);
        return {};
      }

      // Count links per capability
      const counts: Record<string, number> = {};
      capabilityIds.forEach(id => { counts[id] = 0; });
      
      (data || []).forEach((row: any) => {
        if (counts[row.capability_id] !== undefined) {
          counts[row.capability_id]++;
        }
      });

      return counts;
    } catch (err) {
      console.error("Error in fetchLinkCounts:", err);
      return {};
    }
  }, []);

  return {
    linkedCompanies,
    loading,
    fetchLinkedCompanies,
    syncCompanyLinks,
    fetchCapabilitiesForCompany,
    fetchLinkCounts,
  };
}
