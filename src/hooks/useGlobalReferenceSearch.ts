import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/lib/countries";
import { ISO_LANGUAGES } from "@/constants/languageConstants";
import { useDebouncedCallback } from "./use-debounced-callback";
import { useAuth } from "@/contexts/AuthContext";

export interface SearchResult {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryLabel: string;
  categoryGroup: string;
  isEditable: boolean;
  description?: string;
  extra?: string;
  companyId?: string;
  companyCode?: string;
}

export interface CompanyOption {
  id: string;
  code: string;
  name: string;
  isCurrentCompany: boolean;
}

interface UseGlobalReferenceSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  results: SearchResult[];
  isSearching: boolean;
  totalResults: number;
  groupedResults: Record<string, SearchResult[]>;
  clearSearch: () => void;
  hasSearched: boolean;
  // Company filtering
  companies: CompanyOption[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
}

const MAX_RESULTS_PER_CATEGORY = 8;
const MIN_SEARCH_LENGTH = 2;

export function useGlobalReferenceSearch(): UseGlobalReferenceSearchReturn {
  const { user, profile } = useAuth();
  
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");

  // Fetch companies the user has access to via permissions
  const { data: accessibleCompanies = [] } = useQuery({
    queryKey: ["user-accessible-companies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Use the RPC function that returns companies based on user permissions
      const { data, error } = await supabase.rpc('get_user_accessible_companies');
      
      if (error) {
        console.error("Error fetching accessible companies:", error);
        return [];
      }
      
      return (data || []).map((c: any) => ({
        id: c.id,
        code: c.code || "",
        name: c.name || "",
        isCurrentCompany: c.id === profile?.company_id,
      })) as CompanyOption[];
    },
    enabled: !!user?.id,
    staleTime: 60000, // Cache for 1 minute
  });

  const companyIds = useMemo(() => accessibleCompanies.map(c => c.id), [accessibleCompanies]);

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value);
    if (value.length >= MIN_SEARCH_LENGTH) {
      setHasSearched(true);
    }
  }, 300);

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Search static data (global, not company-specific)
  const staticResults = useMemo(() => {
    if (debouncedQuery.length < MIN_SEARCH_LENGTH) return [];

    const lowerQuery = debouncedQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Countries
    countries
      .filter(c => c.name.toLowerCase().includes(lowerQuery) || c.code.toLowerCase().includes(lowerQuery))
      .slice(0, MAX_RESULTS_PER_CATEGORY)
      .forEach(c => results.push({
        id: c.code, code: c.code, name: c.name, category: "countries",
        categoryLabel: "Countries", categoryGroup: "global-standards", isEditable: false, extra: c.region,
      }));

    // Languages
    ISO_LANGUAGES
      .filter(l => l.name.toLowerCase().includes(lowerQuery) || l.code.toLowerCase().includes(lowerQuery))
      .slice(0, MAX_RESULTS_PER_CATEGORY)
      .forEach(l => results.push({
        id: l.code, code: l.code, name: l.name, category: "languages",
        categoryLabel: "Languages", categoryGroup: "global-standards", isEditable: false,
      }));

    return results;
  }, [debouncedQuery]);

  // Search database
  const { data: dbResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["global-reference-search", debouncedQuery, companyIds, selectedCompanyId],
    queryFn: async () => {
      if (debouncedQuery.length < MIN_SEARCH_LENGTH) return [];
      const searchPattern = `%${debouncedQuery}%`;
      const results: SearchResult[] = [];

      // Determine which companies to search
      const searchCompanyIds = selectedCompanyId === "all" ? companyIds : [selectedCompanyId];

      // Currencies (global)
      const { data: currencies } = await supabase.from("currencies").select("id, code, name, symbol")
        .eq("is_active", true).or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(MAX_RESULTS_PER_CATEGORY);
      currencies?.forEach((c: any) => results.push({ 
        id: c.id, code: c.code, name: c.name, category: "currencies",
        categoryLabel: "Currencies", categoryGroup: "global-standards", isEditable: false, extra: c.symbol 
      }));

      // Lookup values (global)
      const { data: lookups } = await supabase.from("lookup_values").select("id, code, name, category")
        .eq("is_active", true).or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(MAX_RESULTS_PER_CATEGORY);
      lookups?.forEach((l: any) => results.push({ 
        id: l.id, code: l.code, name: l.name, category: "lookup_values",
        categoryLabel: "Lookup Values", categoryGroup: "configurable-lookups", isEditable: true, extra: l.category 
      }));

      // Positions (company-scoped)
      if (searchCompanyIds.length > 0) {
        const { data: positions } = await supabase
          .from("positions")
          .select("id, code, title, company_id, companies!positions_company_id_fkey(code, name)")
          .in("company_id", searchCompanyIds)
          .or(`code.ilike.${searchPattern},title.ilike.${searchPattern}`)
          .limit(MAX_RESULTS_PER_CATEGORY);
        positions?.forEach((p: any) => results.push({ 
          id: p.id, code: p.code || "", name: p.title, category: "positions",
          categoryLabel: "Positions", categoryGroup: "org-structure", isEditable: true,
          companyId: p.company_id, companyCode: p.companies?.code,
          extra: p.companies?.code
        }));
      }

      // Companies (user's accessible companies)
      if (searchCompanyIds.length > 0) {
        const { data: companies } = await supabase.from("companies").select("id, code, name")
          .in("id", searchCompanyIds)
          .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`)
          .limit(MAX_RESULTS_PER_CATEGORY);
        companies?.forEach((c: any) => results.push({ 
          id: c.id, code: c.code || "", name: c.name, category: "companies",
          categoryLabel: "Companies", categoryGroup: "org-structure", isEditable: true 
        }));
      }

      // Departments (company-scoped)
      if (searchCompanyIds.length > 0) {
        const { data: departments } = await supabase.from("departments").select("id, code, name, company_id, companies(code)")
          .in("company_id", searchCompanyIds)
          .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`)
          .limit(MAX_RESULTS_PER_CATEGORY);
        departments?.forEach((d: any) => results.push({ 
          id: d.id, code: d.code || "", name: d.name, category: "departments",
          categoryLabel: "Departments", categoryGroup: "org-structure", isEditable: true,
          companyId: d.company_id, companyCode: d.companies?.code,
          extra: d.companies?.code
        }));
      }

      // Skills (global)
      const { data: skills } = await supabase.from("master_skills_library").select("id, skill_name, category")
        .eq("is_active", true).ilike("skill_name", searchPattern).limit(MAX_RESULTS_PER_CATEGORY);
      skills?.forEach((s: any) => results.push({ 
        id: s.id, code: "", name: s.skill_name, category: "master_skills_library",
        categoryLabel: "Skills Library", categoryGroup: "talent-skills", isEditable: false, extra: s.category 
      }));

      // Leave types (global)
      const { data: leaveTypes } = await supabase.from("leave_types").select("id, code, name")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(MAX_RESULTS_PER_CATEGORY);
      leaveTypes?.forEach((l: any) => results.push({ 
        id: l.id, code: l.code || "", name: l.name, category: "leave_types",
        categoryLabel: "Leave Types", categoryGroup: "payroll-benefits", isEditable: false 
      }));

      // Government ID types (global)
      const { data: govIds } = await supabase.from("government_id_types").select("id, code, name, country_code")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(MAX_RESULTS_PER_CATEGORY);
      govIds?.forEach((g: any) => results.push({ 
        id: g.id, code: g.code || "", name: g.name, category: "government_id_types",
        categoryLabel: "Government IDs", categoryGroup: "documents-compliance", isEditable: false, extra: g.country_code
      }));

      // Document types (global)
      const { data: docTypes } = await supabase.from("document_types").select("id, code, name")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(MAX_RESULTS_PER_CATEGORY);
      docTypes?.forEach((d: any) => results.push({ 
        id: d.id, code: d.code || "", name: d.name, category: "document_types",
        categoryLabel: "Document Types", categoryGroup: "documents-compliance", isEditable: false 
      }));

      return results;
    },
    enabled: debouncedQuery.length >= MIN_SEARCH_LENGTH,
    staleTime: 30000,
  });

  const allResults = useMemo(() => [...staticResults, ...dbResults], [staticResults, dbResults]);

  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {};
    allResults.forEach(result => {
      if (!grouped[result.category]) grouped[result.category] = [];
      grouped[result.category].push(result);
    });
    return grouped;
  }, [allResults]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setHasSearched(false);
  }, []);

  return {
    query, 
    setQuery, 
    debouncedQuery, 
    results: allResults, 
    isSearching: isSearching && debouncedQuery.length >= MIN_SEARCH_LENGTH,
    totalResults: allResults.length, 
    groupedResults, 
    clearSearch, 
    hasSearched,
    companies: accessibleCompanies,
    selectedCompanyId,
    setSelectedCompanyId,
  };
}
