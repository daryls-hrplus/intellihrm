import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SuccessionCandidate {
  id: string;
  employee_id: string;
  plan_id: string;
  readiness_level: string;
  ranking: number | null;
  status: string;
  strengths: string | null;
  development_areas: string | null;
  notes: string | null;
  latest_readiness_score: number | null;
  latest_readiness_band: string | null;
  readiness_assessed_at: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  succession_plan?: {
    id: string;
    plan_name: string;
    position: {
      id: string;
      title: string;
    } | null;
  };
}

export function useSuccessionCandidates(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["succession-candidates", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await (supabase as any)
        .from("succession_candidates")
        .select(`
          *,
          employee:profiles!succession_candidates_employee_id_fkey(id, full_name, avatar_url),
          succession_plan:succession_plans!succession_candidates_plan_id_fkey(
            id, 
            plan_name,
            position:positions(id, title)
          )
        `)
        .eq("succession_plan.company_id", companyId);

      if (error) {
        console.error("Error fetching succession candidates:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!companyId,
  });

  return {
    candidates,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["succession-candidates", companyId] }),
  };
}

// Hook to get succession visibility for an employee (ESS view)
export function useMySuccessionStatus(employeeId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["my-succession-status", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      // Get all succession plans where this employee is a candidate
      const { data: candidateData, error } = await (supabase as any)
        .from("succession_candidates")
        .select(`
          id,
          readiness_level,
          ranking,
          status,
          latest_readiness_score,
          latest_readiness_band,
          succession_plan:succession_plans!succession_candidates_plan_id_fkey(
            id, 
            plan_name,
            status,
            position:positions(id, title)
          )
        `)
        .eq("employee_id", employeeId)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching my succession status:", error);
        return null;
      }

      return {
        isSuccessor: (candidateData?.length || 0) > 0,
        candidacies: candidateData || [],
        totalCandidacies: candidateData?.length || 0,
      };
    },
    enabled: !!employeeId,
  });

  return { data, isLoading };
}

// Hook for team succession view (MSS)
export function useTeamSuccessionStatus(managerId?: string) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["team-succession-status", managerId],
    queryFn: async () => {
      if (!managerId) return { teamMembers: [], successionPlans: [] };

      // Get direct reports
      const { data: teamData, error: teamError } = await (supabase as any)
        .from("profiles")
        .select(`
          id, 
          full_name, 
          avatar_url,
          hire_date,
          employee_positions!employee_positions_employee_id_fkey (
            position:positions (
              id,
              title,
              job:jobs (title)
            )
          )
        `)
        .eq("manager_id", managerId);

      if (teamError) {
        console.error("Error fetching team:", teamError);
        return { teamMembers: [], successionPlans: [] };
      }

      const teamMemberIds = (teamData || []).map((m: any) => m.id);
      
      if (teamMemberIds.length === 0) {
        return { teamMembers: teamData || [], successionPlans: [] };
      }

      // Get succession candidacies for team members
      const { data: candidacyData, error: candidacyError } = await (supabase as any)
        .from("succession_candidates")
        .select(`
          id,
          employee_id,
          readiness_level,
          ranking,
          status,
          latest_readiness_score,
          latest_readiness_band,
          succession_plan:succession_plans!succession_candidates_plan_id_fkey(
            id, 
            plan_name,
            status,
            position:positions(id, title)
          )
        `)
        .in("employee_id", teamMemberIds)
        .eq("status", "active");

      if (candidacyError) {
        console.error("Error fetching team candidacies:", candidacyError);
      }

      return {
        teamMembers: teamData || [],
        successionPlans: candidacyData || [],
      };
    },
    enabled: !!managerId,
  });

  return { 
    teamMembers: data?.teamMembers || [],
    successionPlans: data?.successionPlans || [],
    isLoading,
    refetch,
  };
}
