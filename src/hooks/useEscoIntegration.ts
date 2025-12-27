import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EscoSkill {
  uri: string;
  title: string;
  description?: string;
  skillType?: string;
  conceptType?: string;
  altLabels?: string[];
}

export interface EscoOccupation {
  uri: string;
  title: string;
  description?: string;
  altLabels?: string[];
}

export interface DuplicateCheckResult {
  skill: EscoSkill;
  duplicateId?: string;
  duplicateName?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function useEscoIntegration() {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<EscoSkill[]>([]);
  const [occupationResults, setOccupationResults] = useState<EscoOccupation[]>([]);
  const [occupationSkills, setOccupationSkills] = useState<EscoSkill[]>([]);
  const [duplicateResults, setDuplicateResults] = useState<DuplicateCheckResult[]>([]);

  const searchSkills = useCallback(async (
    query: string,
    language: string = "en",
    limit: number = 20,
    offset: number = 0
  ): Promise<{ total: number; skills: EscoSkill[] }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "search_skills",
          query,
          language,
          limit,
          offset,
        },
      });

      if (error) throw error;
      
      setSearchResults(data.skills || []);
      return { total: data.total || 0, skills: data.skills || [] };
    } catch (err: any) {
      console.error("Error searching ESCO skills:", err);
      toast.error("Failed to search ESCO skills", { description: err.message });
      return { total: 0, skills: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchOccupations = useCallback(async (
    query: string,
    language: string = "en",
    limit: number = 20,
    offset: number = 0
  ): Promise<{ total: number; occupations: EscoOccupation[] }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "search_occupations",
          query,
          language,
          limit,
          offset,
        },
      });

      if (error) throw error;
      
      setOccupationResults(data.occupations || []);
      return { total: data.total || 0, occupations: data.occupations || [] };
    } catch (err: any) {
      console.error("Error searching ESCO occupations:", err);
      toast.error("Failed to search occupations", { description: err.message });
      return { total: 0, occupations: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOccupationSkills = useCallback(async (
    occupationUri: string,
    language: string = "en"
  ): Promise<EscoSkill[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "get_occupation_skills",
          occupationUri,
          language,
        },
      });

      if (error) throw error;
      
      setOccupationSkills(data.skills || []);
      return data.skills || [];
    } catch (err: any) {
      console.error("Error getting occupation skills:", err);
      toast.error("Failed to get occupation skills", { description: err.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDuplicates = useCallback(async (
    skills: EscoSkill[],
    companyId?: string
  ): Promise<DuplicateCheckResult[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "check_duplicates",
          skills,
          companyId,
        },
      });

      if (error) throw error;
      
      setDuplicateResults(data.results || []);
      return data.results || [];
    } catch (err: any) {
      console.error("Error checking duplicates:", err);
      toast.error("Failed to check for duplicates", { description: err.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const importSkills = useCallback(async (
    skills: EscoSkill[],
    companyId: string,
    userId: string,
    language: string = "en",
    sourceOccupation?: { uri: string; label: string }
  ): Promise<ImportResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "import_skills",
          skills,
          companyId,
          userId,
          language,
          sourceOccupation,
        },
      });

      if (error) throw error;
      
      if (data.guardrailViolation) {
        toast.error("Import blocked by guardrails", { description: data.error });
        return { imported: 0, skipped: 0, errors: [data.error] };
      }
      
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} skill(s)`, {
          description: data.skipped > 0 ? `${data.skipped} duplicates skipped` : undefined,
        });
      } else if (data.skipped > 0) {
        toast.info(`All ${data.skipped} skills already exist`);
      }
      
      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} import error(s)`, {
          description: data.errors[0],
        });
      }
      
      return data;
    } catch (err: any) {
      console.error("Error importing skills:", err);
      toast.error("Failed to import skills", { description: err.message });
      return { imported: 0, skipped: 0, errors: [err.message] };
    } finally {
      setLoading(false);
    }
  }, []);

  const getImportHistory = useCallback(async (
    companyId: string,
    limit: number = 50
  ): Promise<any[]> => {
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "get_import_history",
          companyId,
          limit,
        },
      });

      if (error) throw error;
      return data.history || [];
    } catch (err: any) {
      console.error("Error getting import history:", err);
      return [];
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setOccupationResults([]);
    setOccupationSkills([]);
    setDuplicateResults([]);
  }, []);

  return {
    loading,
    searchResults,
    occupationResults,
    occupationSkills,
    duplicateResults,
    searchSkills,
    searchOccupations,
    getOccupationSkills,
    checkDuplicates,
    importSkills,
    getImportHistory,
    clearResults,
  };
}
