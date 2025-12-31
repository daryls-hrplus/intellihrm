import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DriftType = 'declining_relevance' | 'emerging_importance' | 'rating_pattern';
export type RecommendationType = 'update_profile' | 'add_skill' | 'retire_competency';
export type DriftStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export interface CompetencyDriftAnalysis {
  id: string;
  companyId: string;
  competencyId?: string;
  competencyName?: string;
  skillId?: string;
  skillName?: string;
  driftType: DriftType;
  avgRatingTrend: number;
  affectedJobProfilesCount: number;
  affectedEmployeesCount: number;
  recommendation: RecommendationType;
  recommendationDetails: {
    reason: string;
    suggestedAction: string;
    impactAssessment: string;
    urgency: 'low' | 'medium' | 'high';
  };
  status: DriftStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  analyzedAt: string;
}

export interface EmergingSkillSignal {
  id: string;
  companyId: string;
  skillName: string;
  detectionSource: 'goal_keywords' | 'training_completions' | 'feedback_mentions';
  mentionCount: number;
  growthRate: number;
  suggestedCompetencyMapping?: string;
  isValidated: boolean;
  createdAt: string;
}

export interface DriftAnalysisResult {
  driftAnalyses: CompetencyDriftAnalysis[];
  emergingSkills: EmergingSkillSignal[];
  summary: {
    totalDrifts: number;
    decliningCompetencies: number;
    emergingSkills: number;
    recommendedActions: number;
  };
}

export function useCompetencyDriftAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [driftAnalyses, setDriftAnalyses] = useState<CompetencyDriftAnalysis[]>([]);
  const [emergingSkills, setEmergingSkills] = useState<EmergingSkillSignal[]>([]);

  const analyzeCompetencyDrift = useCallback(async (
    companyId: string
  ): Promise<DriftAnalysisResult | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('competency-drift-analyzer', {
        body: {
          action: 'analyze_drift',
          companyId,
        },
      });

      if (error) {
        console.error('Error analyzing competency drift:', error);
        return null;
      }

      const result = data as DriftAnalysisResult;
      setDriftAnalyses(result.driftAnalyses);
      setEmergingSkills(result.emergingSkills);
      return result;
    } catch (err) {
      console.error('Failed to analyze competency drift:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectEmergingSkills = useCallback(async (
    companyId: string
  ): Promise<EmergingSkillSignal[] | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('competency-drift-analyzer', {
        body: {
          action: 'detect_emerging_skills',
          companyId,
        },
      });

      if (error) {
        console.error('Error detecting emerging skills:', error);
        return null;
      }

      const result = data.emergingSkills as EmergingSkillSignal[];
      setEmergingSkills(result);
      return result;
    } catch (err) {
      console.error('Failed to detect emerging skills:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const generateProfileRecommendations = useCallback(async (
    companyId: string,
    jobProfileId?: string
  ): Promise<CompetencyDriftAnalysis[] | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('competency-drift-analyzer', {
        body: {
          action: 'generate_profile_recommendations',
          companyId,
          jobProfileId,
        },
      });

      if (error) {
        console.error('Error generating profile recommendations:', error);
        return null;
      }

      return data.recommendations as CompetencyDriftAnalysis[];
    } catch (err) {
      console.error('Failed to generate profile recommendations:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const fetchDriftAnalyses = useCallback(async (
    companyId: string,
    status?: DriftStatus
  ): Promise<CompetencyDriftAnalysis[]> => {
    try {
      let query = supabase
        .from('competency_drift_analysis')
        .select('*')
        .eq('company_id', companyId)
        .order('analyzed_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching drift analyses:', error);
        return [];
      }

      const result: CompetencyDriftAnalysis[] = (data || []).map(item => ({
        id: item.id,
        companyId: item.company_id,
        competencyId: item.competency_id || undefined,
        competencyName: undefined,
        skillId: item.skill_id || undefined,
        skillName: undefined,
        driftType: item.drift_type as DriftType,
        avgRatingTrend: item.avg_rating_trend,
        affectedJobProfilesCount: item.affected_job_profiles_count,
        affectedEmployeesCount: item.affected_employees_count,
        recommendation: item.recommendation as RecommendationType,
        recommendationDetails: item.recommendation_details as CompetencyDriftAnalysis['recommendationDetails'],
        status: item.status as DriftStatus,
        reviewedBy: item.reviewed_by || undefined,
        reviewedAt: item.reviewed_at || undefined,
        analyzedAt: item.analyzed_at,
      }));

      setDriftAnalyses(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch drift analyses:', err);
      return [];
    }
  }, []);

  const fetchEmergingSkills = useCallback(async (
    companyId: string,
    validated?: boolean
  ): Promise<EmergingSkillSignal[]> => {
    try {
      let query = supabase
        .from('emerging_skills_signals')
        .select('*')
        .eq('company_id', companyId)
        .order('growth_rate', { ascending: false });

      if (validated !== undefined) {
        query = query.eq('is_validated', validated);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching emerging skills:', error);
        return [];
      }

      const result: EmergingSkillSignal[] = (data || []).map(item => ({
        id: item.id,
        companyId: item.company_id,
        skillName: item.skill_name,
        detectionSource: item.detection_source as EmergingSkillSignal['detectionSource'],
        mentionCount: item.mention_count,
        growthRate: item.growth_rate,
        suggestedCompetencyMapping: item.suggested_competency_mapping || undefined,
        isValidated: item.is_validated || false,
        createdAt: item.created_at,
      }));

      setEmergingSkills(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch emerging skills:', err);
      return [];
    }
  }, []);

  const updateDriftStatus = useCallback(async (
    driftId: string,
    status: DriftStatus,
    reviewedBy: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('competency_drift_analysis')
        .update({ 
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', driftId);

      if (error) {
        console.error('Error updating drift status:', error);
        return false;
      }

      setDriftAnalyses(prev => 
        prev.map(d => d.id === driftId ? { ...d, status, reviewedBy, reviewedAt: new Date().toISOString() } : d)
      );
      return true;
    } catch (err) {
      console.error('Failed to update drift status:', err);
      return false;
    }
  }, []);

  const validateEmergingSkill = useCallback(async (
    skillId: string,
    validated: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('emerging_skills_signals')
        .update({ is_validated: validated })
        .eq('id', skillId);

      if (error) {
        console.error('Error validating emerging skill:', error);
        return false;
      }

      setEmergingSkills(prev => 
        prev.map(s => s.id === skillId ? { ...s, isValidated: validated } : s)
      );
      return true;
    } catch (err) {
      console.error('Failed to validate emerging skill:', err);
      return false;
    }
  }, []);

  return {
    analyzing,
    driftAnalyses,
    emergingSkills,
    analyzeCompetencyDrift,
    detectEmergingSkills,
    generateProfileRecommendations,
    fetchDriftAnalyses,
    fetchEmergingSkills,
    updateDriftStatus,
    validateEmergingSkill,
  };
}
