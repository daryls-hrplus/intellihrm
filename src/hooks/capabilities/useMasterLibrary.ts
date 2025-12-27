import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MasterSkill {
  id: string;
  esco_uri: string | null;
  skill_name: string;
  skill_name_en: string | null;
  skill_type: 'skill' | 'knowledge' | 'transversal' | 'language';
  description: string | null;
  category: string | null;
  subcategory: string | null;
  industry_tags: string[];
  alternative_labels: string[];
  is_digital_skill: boolean;
  is_green_skill: boolean;
  source: string;
}

export interface MasterCompetency {
  id: string;
  competency_name: string;
  competency_name_en: string | null;
  competency_type: 'behavioral' | 'leadership' | 'core' | 'functional' | 'technical';
  description: string | null;
  category: string | null;
  subcategory: string | null;
  industry_tags: string[];
  alternative_labels: string[];
  proficiency_levels: any[];
  source: string;
}

export interface MasterOccupation {
  id: string;
  esco_uri: string | null;
  occupation_name: string;
  occupation_name_en: string | null;
  description: string | null;
  isco_code: string | null;
  industry_id: string | null;
  job_family: string | null;
  job_level: string | null;
  alternative_labels: string[];
  source: string;
  industry?: MasterIndustry;
}

export interface MasterIndustry {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

interface SearchFilters {
  query?: string;
  skillType?: string;
  competencyType?: string;
  industryId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export function useMasterLibrary() {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<MasterSkill[]>([]);
  const [competencies, setCompetencies] = useState<MasterCompetency[]>([]);
  const [occupations, setOccupations] = useState<MasterOccupation[]>([]);
  const [industries, setIndustries] = useState<MasterIndustry[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchIndustries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('master_industries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setIndustries(data || []);
      return data || [];
    } catch (error: any) {
      console.error('Error fetching industries:', error);
      toast.error('Failed to load industries');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSkills = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('master_skills_library')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (filters.query) {
        // Use text search with websearch_to_tsquery for better search
        query = query.textSearch('search_vector', filters.query, {
          type: 'websearch',
          config: 'english'
        });
      }

      if (filters.skillType) {
        query = query.eq('skill_type', filters.skillType);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.industryId) {
        query = query.contains('industry_tags', [filters.industryId]);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const { data, error, count } = await query
        .order('skill_name')
        .range(offset, offset + limit - 1);

      if (error) throw error;
      setSkills((data as MasterSkill[]) || []);
      setTotalCount(count || 0);
      return { skills: (data as MasterSkill[]) || [], total: count || 0 };
    } catch (error: any) {
      console.error('Error searching skills:', error);
      toast.error('Failed to search skills');
      return { skills: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCompetencies = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('master_competencies_library')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (filters.query) {
        query = query.textSearch('search_vector', filters.query, {
          type: 'websearch',
          config: 'english'
        });
      }

      if (filters.competencyType) {
        query = query.eq('competency_type', filters.competencyType);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const { data, error, count } = await query
        .order('competency_name')
        .range(offset, offset + limit - 1);

      if (error) throw error;
      setCompetencies((data as MasterCompetency[]) || []);
      setTotalCount(count || 0);
      return { competencies: (data as MasterCompetency[]) || [], total: count || 0 };
    } catch (error: any) {
      console.error('Error searching competencies:', error);
      toast.error('Failed to search competencies');
      return { competencies: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchOccupations = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('master_occupations_library')
        .select('*, industry:master_industries(*)', { count: 'exact' })
        .eq('is_active', true);

      if (filters.query) {
        query = query.textSearch('search_vector', filters.query, {
          type: 'websearch',
          config: 'english'
        });
      }

      if (filters.industryId) {
        query = query.eq('industry_id', filters.industryId);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const { data, error, count } = await query
        .order('occupation_name')
        .range(offset, offset + limit - 1);

      if (error) throw error;
      setOccupations(data || []);
      setTotalCount(count || 0);
      return { occupations: data || [], total: count || 0 };
    } catch (error: any) {
      console.error('Error searching occupations:', error);
      toast.error('Failed to search occupations');
      return { occupations: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOccupationSkills = useCallback(async (occupationId: string) => {
    try {
      const { data, error } = await supabase
        .from('master_occupation_skills')
        .select('*, skill:master_skills_library(*)')
        .eq('occupation_id', occupationId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching occupation skills:', error);
      return [];
    }
  }, []);

  const getOccupationCompetencies = useCallback(async (occupationId: string) => {
    try {
      const { data, error } = await supabase
        .from('master_occupation_competencies')
        .select('*, competency:master_competencies_library(*)')
        .eq('occupation_id', occupationId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching occupation competencies:', error);
      return [];
    }
  }, []);

  const importSkillToCompany = useCallback(async (
    skill: MasterSkill,
    companyId: string,
    userId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('skills_competencies')
        .insert({
          company_id: companyId,
          type: 'SKILL',
          name: skill.skill_name,
          code: skill.esco_uri || `SKL-${Date.now()}`,
          description: skill.description,
          category: skill.category as any || 'technical',
          status: 'active',
          version: 1,
          effective_from: new Date().toISOString().split('T')[0],
          external_id: skill.esco_uri,
          metadata: {
            source: 'master_library',
            master_skill_id: skill.id,
            skill_type: skill.skill_type,
            is_digital_skill: skill.is_digital_skill,
            is_green_skill: skill.is_green_skill,
            alternative_labels: skill.alternative_labels
          },
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error importing skill:', error);
      throw error;
    }
  }, []);

  const importCompetencyToCompany = useCallback(async (
    competency: MasterCompetency,
    companyId: string,
    userId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('skills_competencies')
        .insert({
          company_id: companyId,
          type: 'COMPETENCY',
          name: competency.competency_name,
          code: `CMP-${Date.now()}`,
          description: competency.description,
          category: competency.category as any || competency.competency_type as any || 'behavioral',
          status: 'active',
          version: 1,
          effective_from: new Date().toISOString().split('T')[0],
          metadata: {
            source: 'master_library',
            master_competency_id: competency.id,
            competency_type: competency.competency_type,
            proficiency_levels: competency.proficiency_levels,
            alternative_labels: competency.alternative_labels
          },
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error importing competency:', error);
      throw error;
    }
  }, []);

  const bulkImportSkills = useCallback(async (
    skillIds: string[],
    companyId: string,
    userId: string
  ) => {
    setLoading(true);
    try {
      // Fetch the skills first
      const { data: skillsToImport, error: fetchError } = await supabase
        .from('master_skills_library')
        .select('*')
        .in('id', skillIds);

      if (fetchError) throw fetchError;
      if (!skillsToImport || skillsToImport.length === 0) {
        throw new Error('No skills found to import');
      }

      const insertData = skillsToImport.map(skill => ({
        company_id: companyId,
        type: 'SKILL' as const,
        name: skill.skill_name,
        code: skill.esco_uri || `SKL-${skill.id.slice(0, 8)}`,
        description: skill.description,
        category: (skill.category as any) || 'technical',
        status: 'active' as const,
        version: 1,
        effective_from: new Date().toISOString().split('T')[0],
        external_id: skill.esco_uri,
        metadata: {
          source: 'master_library',
          master_skill_id: skill.id,
          skill_type: skill.skill_type,
          is_digital_skill: skill.is_digital_skill,
          is_green_skill: skill.is_green_skill
        },
        created_by: userId
      }));

      const { data, error } = await supabase
        .from('skills_competencies')
        .insert(insertData)
        .select();

      if (error) throw error;
      toast.success(`Imported ${data?.length || 0} skills successfully`);
      return data;
    } catch (error: any) {
      console.error('Error bulk importing skills:', error);
      toast.error('Failed to import skills');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkImportCompetencies = useCallback(async (
    competencyIds: string[],
    companyId: string,
    userId: string
  ) => {
    setLoading(true);
    try {
      // Fetch the competencies first
      const { data: competenciesToImport, error: fetchError } = await supabase
        .from('master_competencies_library')
        .select('*')
        .in('id', competencyIds);

      if (fetchError) throw fetchError;
      if (!competenciesToImport || competenciesToImport.length === 0) {
        throw new Error('No competencies found to import');
      }

      const insertData = competenciesToImport.map(comp => ({
        company_id: companyId,
        type: 'COMPETENCY' as const,
        name: comp.competency_name,
        code: `CMP-${comp.id.slice(0, 8)}`,
        description: comp.description,
        category: (comp.category as any) || (comp.competency_type as any) || 'behavioral',
        status: 'active' as const,
        version: 1,
        effective_from: new Date().toISOString().split('T')[0],
        metadata: {
          source: 'master_library',
          master_competency_id: comp.id,
          competency_type: comp.competency_type,
          proficiency_levels: comp.proficiency_levels
        },
        created_by: userId
      }));

      const { data, error } = await supabase
        .from('skills_competencies')
        .insert(insertData)
        .select();

      if (error) throw error;
      toast.success(`Imported ${data?.length || 0} competencies successfully`);
      return data;
    } catch (error: any) {
      console.error('Error bulk importing competencies:', error);
      toast.error('Failed to import competencies');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    skills,
    competencies,
    occupations,
    industries,
    totalCount,
    fetchIndustries,
    searchSkills,
    searchCompetencies,
    searchOccupations,
    getOccupationSkills,
    getOccupationCompetencies,
    importSkillToCompany,
    importCompetencyToCompany,
    bulkImportSkills,
    bulkImportCompetencies
  };
}
