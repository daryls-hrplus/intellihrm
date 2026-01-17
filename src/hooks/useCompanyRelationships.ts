import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompanyRelationship {
  id: string;
  source_company_id: string;
  target_company_id: string;
  relationship_type: "primary" | "matrix" | "both";
  relationship_reason: string;
  description: string | null;
  is_bidirectional: boolean;
  effective_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  source_company?: { id: string; code: string; name: string; group_id: string | null };
  target_company?: { id: string; code: string; name: string; group_id: string | null };
}

export interface GroupCompany {
  id: string;
  code: string;
  name: string;
  group_id: string | null;
  isCurrentCompany: boolean;
}

export function useCompanyRelationships(companyId?: string | null) {
  const { profile } = useAuth();
  const [relationships, setRelationships] = useState<CompanyRelationship[]>([]);
  const [groupCompanies, setGroupCompanies] = useState<GroupCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentCompanyId = companyId || profile?.company_id;

  const fetchRelationships = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("company_reporting_relationships")
        .select(`
          *,
          source_company:companies!company_reporting_relationships_source_company_id_fkey(id, code, name, group_id),
          target_company:companies!company_reporting_relationships_target_company_id_fkey(id, code, name, group_id)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRelationships((data || []) as unknown as CompanyRelationship[]);
    } catch (error) {
      console.error("Error fetching relationships:", error);
      setRelationships([]);
    }
  }, []);

  const fetchGroupCompanies = useCallback(async () => {
    if (!currentCompanyId) {
      setGroupCompanies([]);
      return;
    }

    try {
      // First get the current company's group_id
      const { data: currentCompany } = await supabase
        .from("companies")
        .select("id, code, name, group_id")
        .eq("id", currentCompanyId)
        .single();

      if (!currentCompany) {
        setGroupCompanies([]);
        return;
      }

      let companies: GroupCompany[] = [];

      if (currentCompany.group_id) {
        // Fetch all companies in the same group
        const { data: groupData } = await supabase
          .from("companies")
          .select("id, code, name, group_id")
          .eq("group_id", currentCompany.group_id)
          .eq("is_active", true);

        companies = (groupData || []).map(c => ({
          ...c,
          isCurrentCompany: c.id === currentCompanyId,
        }));
      } else {
        // No group, just include current company
        companies = [{
          ...currentCompany,
          isCurrentCompany: true,
        }];
      }

      setGroupCompanies(companies);
    } catch (error) {
      console.error("Error fetching group companies:", error);
      setGroupCompanies([]);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchRelationships(), fetchGroupCompanies()]);
      setIsLoading(false);
    };
    load();
  }, [fetchRelationships, fetchGroupCompanies]);

  const refetch = useCallback(() => {
    fetchRelationships();
    fetchGroupCompanies();
  }, [fetchRelationships, fetchGroupCompanies]);

  /**
   * Get all companies that can participate in reporting relationships with a given company.
   * This includes:
   * 1. Companies in the same corporate group (automatic)
   * 2. Companies with explicit relationship configurations
   */
  const getValidReportingCompanies = useCallback((
    sourceCompanyId: string,
    reportingType: "primary" | "matrix" | "both" = "both"
  ): string[] => {
    const validCompanyIds = new Set<string>();

    // Add all companies from the same group
    groupCompanies.forEach(c => validCompanyIds.add(c.id));

    // Add companies from configured relationships
    relationships.forEach(rel => {
      if (!rel.is_active) return;

      const now = new Date();
      if (rel.effective_date && new Date(rel.effective_date) > now) return;
      if (rel.end_date && new Date(rel.end_date) < now) return;

      const typeMatches = 
        rel.relationship_type === "both" || 
        rel.relationship_type === reportingType ||
        reportingType === "both";

      if (!typeMatches) return;

      // Check if this relationship involves the source company
      if (rel.source_company_id === sourceCompanyId) {
        validCompanyIds.add(rel.target_company_id);
      }

      if (rel.is_bidirectional && rel.target_company_id === sourceCompanyId) {
        validCompanyIds.add(rel.source_company_id);
      }
    });

    return Array.from(validCompanyIds);
  }, [groupCompanies, relationships]);

  /**
   * Check if a specific reporting relationship is valid
   */
  const isValidReportingRelationship = useCallback((
    sourceCompanyId: string,
    targetCompanyId: string,
    reportingType: "primary" | "matrix" = "primary"
  ): { isValid: boolean; reason: string; isCrossCompany: boolean } => {
    // Same company is always valid
    if (sourceCompanyId === targetCompanyId) {
      return { isValid: true, reason: "Same company", isCrossCompany: false };
    }

    // Check if both companies are in the same group
    const sourceCompany = groupCompanies.find(c => c.id === sourceCompanyId);
    const targetInGroup = groupCompanies.find(c => c.id === targetCompanyId);

    if (sourceCompany && targetInGroup) {
      return { 
        isValid: true, 
        reason: "Same corporate group", 
        isCrossCompany: true 
      };
    }

    // Check configured relationships
    for (const rel of relationships) {
      if (!rel.is_active) continue;

      const now = new Date();
      if (rel.effective_date && new Date(rel.effective_date) > now) continue;
      if (rel.end_date && new Date(rel.end_date) < now) continue;

      const typeMatches = 
        rel.relationship_type === "both" || 
        rel.relationship_type === reportingType;

      if (!typeMatches) continue;

      // Check source -> target
      if (rel.source_company_id === sourceCompanyId && rel.target_company_id === targetCompanyId) {
        return { 
          isValid: true, 
          reason: `Configured relationship: ${rel.relationship_reason}`, 
          isCrossCompany: true 
        };
      }

      // Check bidirectional target -> source
      if (rel.is_bidirectional && 
          rel.target_company_id === sourceCompanyId && 
          rel.source_company_id === targetCompanyId) {
        return { 
          isValid: true, 
          reason: `Configured relationship (bidirectional): ${rel.relationship_reason}`, 
          isCrossCompany: true 
        };
      }
    }

    return { 
      isValid: false, 
      reason: "No valid relationship exists between these companies", 
      isCrossCompany: true 
    };
  }, [groupCompanies, relationships]);

  return {
    relationships,
    groupCompanies,
    isLoading,
    refetch,
    getValidReportingCompanies,
    isValidReportingRelationship,
  };
}
