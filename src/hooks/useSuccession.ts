import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NineBoxAssessment {
  id: string;
  company_id: string;
  employee_id: string;
  assessed_by: string | null;
  assessment_date: string;
  performance_rating: number;
  potential_rating: number;
  performance_notes: string | null;
  potential_notes: string | null;
  overall_notes: string | null;
  assessment_period: string | null;
  is_current: boolean;
  created_at: string;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  assessor?: {
    id: string;
    full_name: string;
  };
}

export interface TalentPool {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  pool_type: string;
  criteria: Record<string, unknown>;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  member_count?: number;
}

export interface TalentPoolMember {
  id: string;
  pool_id: string;
  employee_id: string;
  added_by: string | null;
  reason: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface SuccessionPlan {
  id: string;
  company_id: string;
  position_id: string;
  plan_name: string;
  description: string | null;
  risk_level: string;
  priority: string;
  status: string;
  target_date: string | null;
  notes: string | null;
  created_by: string | null;
  is_active: boolean;
  position?: {
    id: string;
    title: string;
    code: string;
  };
  candidate_count?: number;
}

export interface SuccessionCandidate {
  id: string;
  plan_id: string;
  employee_id: string;
  readiness_level: string;
  readiness_timeline: string | null;
  strengths: string | null;
  development_areas: string | null;
  ranking: number;
  status: string;
  notes: string | null;
  nominated_by: string | null;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  development_plans?: SuccessionDevelopmentPlan[];
}

export interface SuccessionDevelopmentPlan {
  id: string;
  candidate_id: string;
  title: string;
  description: string | null;
  development_type: string;
  target_date: string | null;
  completion_date: string | null;
  status: string;
  progress: number;
  notes: string | null;
}

export interface KeyPositionRisk {
  id: string;
  company_id: string;
  position_id: string;
  is_key_position: boolean;
  criticality_level: string;
  vacancy_risk: string;
  impact_if_vacant: string | null;
  current_incumbent_id: string | null;
  retirement_risk: boolean;
  flight_risk: boolean;
  risk_notes: string | null;
  position?: {
    id: string;
    title: string;
    code: string;
  };
  incumbent?: {
    id: string;
    full_name: string;
  };
}

export function useSuccession(companyId?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Nine Box Assessments
  const fetchNineBoxAssessments = async (onlyCurrent = true) => {
    if (!companyId) return [];
    setLoading(true);
    try {
      let query = supabase
        .from('nine_box_assessments')
        .select(`
          *,
          employee:profiles!nine_box_assessments_employee_id_fkey(id, full_name, email, avatar_url),
          assessor:profiles!nine_box_assessments_assessed_by_fkey(id, full_name)
        `)
        .eq('company_id', companyId)
        .order('assessment_date', { ascending: false });

      if (onlyCurrent) {
        query = query.eq('is_current', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NineBoxAssessment[];
    } catch (error: any) {
      toast.error('Failed to fetch assessments: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNineBoxAssessment = async (assessment: Partial<NineBoxAssessment>) => {
    try {
      // Mark previous assessments as not current
      if (assessment.employee_id && companyId) {
        await supabase
          .from('nine_box_assessments')
          .update({ is_current: false })
          .eq('company_id', companyId)
          .eq('employee_id', assessment.employee_id)
          .eq('is_current', true);
      }

      const { data, error } = await supabase
        .from('nine_box_assessments')
        .insert([{
          ...assessment,
          company_id: companyId,
          assessed_by: user?.id,
          is_current: true,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Assessment created successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to create assessment: ' + error.message);
      return null;
    }
  };

  const updateNineBoxAssessment = async (id: string, updates: Partial<NineBoxAssessment>) => {
    try {
      const { data, error } = await supabase
        .from('nine_box_assessments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Assessment updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update assessment: ' + error.message);
      return null;
    }
  };

  // Talent Pools
  const fetchTalentPools = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('talent_pools')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;

      // Get member counts
      const poolIds = data.map(p => p.id);
      const { data: memberCounts } = await supabase
        .from('talent_pool_members')
        .select('pool_id')
        .in('pool_id', poolIds)
        .eq('status', 'active');

      const countMap = memberCounts?.reduce((acc, m) => {
        acc[m.pool_id] = (acc[m.pool_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return data.map(pool => ({
        ...pool,
        member_count: countMap[pool.id] || 0,
      })) as TalentPool[];
    } catch (error: any) {
      toast.error('Failed to fetch talent pools: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTalentPool = async (pool: Partial<TalentPool>) => {
    try {
      const { data, error } = await supabase
        .from('talent_pools')
        .insert([{
          name: pool.name!,
          code: pool.code!,
          description: pool.description,
          pool_type: pool.pool_type,
          company_id: companyId!,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Talent pool created successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to create talent pool: ' + error.message);
      return null;
    }
  };

  const updateTalentPool = async (id: string, updates: Partial<TalentPool>) => {
    try {
      const { data, error } = await supabase
        .from('talent_pools')
        .update({ 
          name: updates.name,
          code: updates.code,
          description: updates.description,
          pool_type: updates.pool_type,
          is_active: updates.is_active,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Talent pool updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update talent pool: ' + error.message);
      return null;
    }
  };

  const deleteTalentPool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('talent_pools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Talent pool deleted successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete talent pool: ' + error.message);
      return false;
    }
  };

  // Talent Pool Members
  const fetchTalentPoolMembers = async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .from('talent_pool_members')
        .select(`
          *,
          employee:profiles!talent_pool_members_employee_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('pool_id', poolId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as TalentPoolMember[];
    } catch (error: any) {
      toast.error('Failed to fetch pool members: ' + error.message);
      return [];
    }
  };

  const addTalentPoolMember = async (poolId: string, employeeId: string, reason?: string) => {
    try {
      const { data, error } = await supabase
        .from('talent_pool_members')
        .insert({
          pool_id: poolId,
          employee_id: employeeId,
          added_by: user?.id,
          reason,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Member added to talent pool');
      return data;
    } catch (error: any) {
      toast.error('Failed to add member: ' + error.message);
      return null;
    }
  };

  const removeTalentPoolMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('talent_pool_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Member removed from talent pool');
      return true;
    } catch (error: any) {
      toast.error('Failed to remove member: ' + error.message);
      return false;
    }
  };

  // Succession Plans
  const fetchSuccessionPlans = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('succession_plans')
        .select(`
          *,
          position:positions!succession_plans_position_id_fkey(id, title, code)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('priority');

      if (error) throw error;

      // Get candidate counts
      const planIds = data.map(p => p.id);
      const { data: candidateCounts } = await supabase
        .from('succession_candidates')
        .select('plan_id')
        .in('plan_id', planIds)
        .eq('status', 'active');

      const countMap = candidateCounts?.reduce((acc, c) => {
        acc[c.plan_id] = (acc[c.plan_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return data.map(plan => ({
        ...plan,
        candidate_count: countMap[plan.id] || 0,
      })) as SuccessionPlan[];
    } catch (error: any) {
      toast.error('Failed to fetch succession plans: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createSuccessionPlan = async (plan: Partial<SuccessionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('succession_plans')
        .insert([{
          position_id: plan.position_id!,
          plan_name: plan.plan_name!,
          description: plan.description,
          risk_level: plan.risk_level,
          priority: plan.priority,
          target_date: plan.target_date,
          notes: plan.notes,
          company_id: companyId!,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Succession plan created successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to create succession plan: ' + error.message);
      return null;
    }
  };

  const updateSuccessionPlan = async (id: string, updates: Partial<SuccessionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('succession_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Succession plan updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update succession plan: ' + error.message);
      return null;
    }
  };

  const deleteSuccessionPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('succession_plans')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Succession plan deleted successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete succession plan: ' + error.message);
      return false;
    }
  };

  // Succession Candidates
  const fetchSuccessionCandidates = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('succession_candidates')
        .select(`
          *,
          employee:profiles!succession_candidates_employee_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('plan_id', planId)
        .eq('status', 'active')
        .order('ranking');

      if (error) throw error;

      // Get development plans for each candidate
      const candidateIds = data.map(c => c.id);
      const { data: devPlans } = await supabase
        .from('succession_development_plans')
        .select('*')
        .in('candidate_id', candidateIds);

      return data.map(candidate => ({
        ...candidate,
        development_plans: devPlans?.filter(dp => dp.candidate_id === candidate.id) || [],
      })) as SuccessionCandidate[];
    } catch (error: any) {
      toast.error('Failed to fetch candidates: ' + error.message);
      return [];
    }
  };

  const addSuccessionCandidate = async (candidate: Partial<SuccessionCandidate>) => {
    try {
      const { data, error } = await supabase
        .from('succession_candidates')
        .insert([{
          plan_id: candidate.plan_id!,
          employee_id: candidate.employee_id!,
          readiness_level: candidate.readiness_level,
          readiness_timeline: candidate.readiness_timeline,
          strengths: candidate.strengths,
          development_areas: candidate.development_areas,
          ranking: candidate.ranking,
          notes: candidate.notes,
          nominated_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Candidate added successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to add candidate: ' + error.message);
      return null;
    }
  };

  const updateSuccessionCandidate = async (id: string, updates: Partial<SuccessionCandidate>) => {
    try {
      const { data, error } = await supabase
        .from('succession_candidates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Candidate updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update candidate: ' + error.message);
      return null;
    }
  };

  const removeSuccessionCandidate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('succession_candidates')
        .update({ status: 'removed' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Candidate removed successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to remove candidate: ' + error.message);
      return false;
    }
  };

  // Development Plans
  const createDevelopmentPlan = async (plan: Partial<SuccessionDevelopmentPlan>) => {
    try {
      const { data, error } = await supabase
        .from('succession_development_plans')
        .insert([{
          candidate_id: plan.candidate_id!,
          title: plan.title!,
          description: plan.description,
          development_type: plan.development_type,
          target_date: plan.target_date,
          status: plan.status,
          progress: plan.progress,
          notes: plan.notes,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Development plan created successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to create development plan: ' + error.message);
      return null;
    }
  };

  const updateDevelopmentPlan = async (id: string, updates: Partial<SuccessionDevelopmentPlan>) => {
    try {
      const { data, error } = await supabase
        .from('succession_development_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Development plan updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update development plan: ' + error.message);
      return null;
    }
  };

  const deleteDevelopmentPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('succession_development_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Development plan deleted successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete development plan: ' + error.message);
      return false;
    }
  };

  // Key Position Risks
  const fetchKeyPositionRisks = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('key_position_risks')
        .select(`
          *,
          position:positions!key_position_risks_position_id_fkey(id, title, code),
          incumbent:profiles!key_position_risks_current_incumbent_id_fkey(id, full_name)
        `)
        .eq('company_id', companyId)
        .order('criticality_level');

      if (error) throw error;
      return data as KeyPositionRisk[];
    } catch (error: any) {
      toast.error('Failed to fetch key positions: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createKeyPositionRisk = async (risk: Partial<KeyPositionRisk>) => {
    try {
      const { data, error } = await supabase
        .from('key_position_risks')
        .insert([{
          position_id: risk.position_id!,
          criticality_level: risk.criticality_level,
          vacancy_risk: risk.vacancy_risk,
          impact_if_vacant: risk.impact_if_vacant,
          current_incumbent_id: risk.current_incumbent_id,
          retirement_risk: risk.retirement_risk,
          flight_risk: risk.flight_risk,
          risk_notes: risk.risk_notes,
          company_id: companyId!,
          assessed_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Key position risk created successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to create key position risk: ' + error.message);
      return null;
    }
  };

  const updateKeyPositionRisk = async (id: string, updates: Partial<KeyPositionRisk>) => {
    try {
      const { data, error } = await supabase
        .from('key_position_risks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Key position risk updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update key position risk: ' + error.message);
      return null;
    }
  };

  return {
    loading,
    // Nine Box
    fetchNineBoxAssessments,
    createNineBoxAssessment,
    updateNineBoxAssessment,
    // Talent Pools
    fetchTalentPools,
    createTalentPool,
    updateTalentPool,
    deleteTalentPool,
    fetchTalentPoolMembers,
    addTalentPoolMember,
    removeTalentPoolMember,
    // Succession Plans
    fetchSuccessionPlans,
    createSuccessionPlan,
    updateSuccessionPlan,
    deleteSuccessionPlan,
    fetchSuccessionCandidates,
    addSuccessionCandidate,
    updateSuccessionCandidate,
    removeSuccessionCandidate,
    // Development Plans
    createDevelopmentPlan,
    updateDevelopmentPlan,
    deleteDevelopmentPlan,
    // Key Position Risks
    fetchKeyPositionRisks,
    createKeyPositionRisk,
    updateKeyPositionRisk,
  };
}
