import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/lib/countries";
import { ISO_LANGUAGES } from "@/constants/languageConstants";
import { useDebouncedCallback } from "./use-debounced-callback";

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
}

const CATEGORY_META: Record<string, { label: string; group: string; isEditable: boolean }> = {
  countries: { label: "Countries", group: "global-standards", isEditable: false },
  currencies: { label: "Currencies", group: "global-standards", isEditable: false },
  languages: { label: "Languages", group: "global-standards", isEditable: false },
  lookup_values: { label: "Lookup Values", group: "configurable-lookups", isEditable: true },
  positions: { label: "Positions", group: "org-structure", isEditable: true },
  companies: { label: "Companies", group: "org-structure", isEditable: true },
  departments: { label: "Departments", group: "org-structure", isEditable: true },
  master_skills_library: { label: "Skills Library", group: "talent-skills", isEditable: false },
  master_competencies_library: { label: "Competencies", group: "talent-skills", isEditable: false },
  occupations: { label: "Occupations", group: "talent-skills", isEditable: false },
  document_types: { label: "Document Types", group: "documents-compliance", isEditable: false },
  government_id_types: { label: "Government IDs", group: "documents-compliance", isEditable: false },
  qualification_types: { label: "Qualifications", group: "documents-compliance", isEditable: false },
  leave_types: { label: "Leave Types", group: "payroll-benefits", isEditable: false },
  master_job_families: { label: "Job Families", group: "organization", isEditable: false },
};

const MAX_RESULTS_PER_CATEGORY = 5;
const MIN_SEARCH_LENGTH = 2;

async function searchTable(
  tableName: string, 
  searchPattern: string,
  codeField: string,
  nameField: string,
  selectFields: string,
  categoryMeta: { label: string; group: string; isEditable: boolean },
  extraField?: string,
  isActiveFilter = false
): Promise<SearchResult[]> {
  let query = supabase.from(tableName as any).select(selectFields);
  
  if (isActiveFilter) {
    query = query.eq("is_active", true);
  }
  
  if (codeField && nameField) {
    query = query.or(`${codeField}.ilike.${searchPattern},${nameField}.ilike.${searchPattern}`);
  } else if (nameField) {
    query = query.ilike(nameField, searchPattern);
  }
  
  const { data } = await query.limit(MAX_RESULTS_PER_CATEGORY);
  
  if (!data) return [];
  
  return data.map((item: any) => ({
    id: item.id,
    code: item[codeField] || "",
    name: item[nameField] || item.title || "",
    category: tableName,
    categoryLabel: categoryMeta.label,
    categoryGroup: categoryMeta.group,
    isEditable: categoryMeta.isEditable,
    extra: extraField ? item[extraField] : undefined,
  }));
}

export function useGlobalReferenceSearch(): UseGlobalReferenceSearchReturn {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value);
    if (value.length >= MIN_SEARCH_LENGTH) {
      setHasSearched(true);
    }
  }, 300);

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Search static data
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
    queryKey: ["global-reference-search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < MIN_SEARCH_LENGTH) return [];
      const searchPattern = `%${debouncedQuery}%`;
      const results: SearchResult[] = [];

      // Currencies
      const { data: currencies } = await supabase.from("currencies").select("id, code, name, symbol")
        .eq("is_active", true).or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(5);
      currencies?.forEach((c: any) => results.push({ id: c.id, code: c.code, name: c.name, category: "currencies",
        categoryLabel: "Currencies", categoryGroup: "global-standards", isEditable: false, extra: c.symbol }));

      // Lookup values
      const { data: lookups } = await supabase.from("lookup_values").select("id, code, name, category")
        .eq("is_active", true).or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(5);
      lookups?.forEach((l: any) => results.push({ id: l.id, code: l.code, name: l.name, category: "lookup_values",
        categoryLabel: "Lookup Values", categoryGroup: "configurable-lookups", isEditable: true, extra: l.category }));

      // Positions
      const { data: positions } = await supabase.from("positions").select("id, code, title")
        .or(`code.ilike.${searchPattern},title.ilike.${searchPattern}`).limit(5);
      positions?.forEach((p: any) => results.push({ id: p.id, code: p.code || "", name: p.title, category: "positions",
        categoryLabel: "Positions", categoryGroup: "org-structure", isEditable: true }));

      // Companies
      const { data: companies } = await supabase.from("companies").select("id, code, name")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(5);
      companies?.forEach((c: any) => results.push({ id: c.id, code: c.code || "", name: c.name, category: "companies",
        categoryLabel: "Companies", categoryGroup: "org-structure", isEditable: true }));

      // Departments
      const { data: departments } = await supabase.from("departments").select("id, code, name")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(5);
      departments?.forEach((d: any) => results.push({ id: d.id, code: d.code || "", name: d.name, category: "departments",
        categoryLabel: "Departments", categoryGroup: "org-structure", isEditable: true }));

      // Skills
      const { data: skills } = await supabase.from("master_skills_library").select("id, skill_name, category")
        .eq("is_active", true).ilike("skill_name", searchPattern).limit(5);
      skills?.forEach((s: any) => results.push({ id: s.id, code: "", name: s.skill_name, category: "master_skills_library",
        categoryLabel: "Skills Library", categoryGroup: "talent-skills", isEditable: false, extra: s.category }));

      // Leave types
      const { data: leaveTypes } = await supabase.from("leave_types").select("id, code, name")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`).limit(5);
      leaveTypes?.forEach((l: any) => results.push({ id: l.id, code: l.code || "", name: l.name, category: "leave_types",
        categoryLabel: "Leave Types", categoryGroup: "payroll-benefits", isEditable: false }));

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
    query, setQuery, debouncedQuery, results: allResults, isSearching: isSearching && debouncedQuery.length >= MIN_SEARCH_LENGTH,
    totalResults: allResults.length, groupedResults, clearSearch, hasSearched,
  };
}
