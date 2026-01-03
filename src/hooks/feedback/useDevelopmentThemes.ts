import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  DevelopmentTheme, 
  DevelopmentRecommendation, 
  FeedbackRemeasurementPlan,
  IDPFeedbackLink 
} from '@/types/developmentThemes';

// Fetch development themes for an employee
export function useDevelopmentThemes(employeeId?: string, visibleOnly?: boolean) {
  return useQuery({
    queryKey: ['development-themes', employeeId, visibleOnly],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('development_themes')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter for visible only if needed
      const themes = data as DevelopmentTheme[];
      if (visibleOnly) {
        return themes.filter((t: any) => t.is_visible_to_employee === true);
      }
      return themes;
    },
    enabled: !!employeeId,
  });
}

// Release theme to employee
export function useReleaseThemeToEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ themeId, userId }: { themeId: string; userId: string }) => {
      const { error } = await supabase
        .from('development_themes')
        .update({
          is_visible_to_employee: true,
          visibility_changed_at: new Date().toISOString(),
          visibility_changed_by: userId,
        } as any)
        .eq('id', themeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['development-themes'] });
      toast.success('Theme released to employee');
    },
    onError: (error) => {
      toast.error('Failed to release theme', { description: error.message });
    },
  });
}

// Fetch recommendations for a theme
export function useThemeRecommendations(themeId?: string) {
  return useQuery({
    queryKey: ['theme-recommendations', themeId],
    queryFn: async () => {
      if (!themeId) return [];

      const { data, error } = await supabase
        .from('development_recommendations')
        .select('*')
        .eq('theme_id', themeId)
        .order('priority_order', { ascending: true });

      if (error) throw error;
      return data as DevelopmentRecommendation[];
    },
    enabled: !!themeId,
  });
}

// Fetch remeasurement plans
export function useRemeasurementPlans(employeeId?: string) {
  return useQuery({
    queryKey: ['remeasurement-plans', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('feedback_remeasurement_plans')
        .select('*')
        .eq('employee_id', employeeId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as FeedbackRemeasurementPlan[];
    },
    enabled: !!employeeId,
  });
}

// Confirm a development theme
export function useConfirmTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ themeId, userId }: { themeId: string; userId: string }) => {
      const { error } = await supabase
        .from('development_themes')
        .update({
          is_confirmed: true,
          confirmed_by: userId,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', themeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['development-themes'] });
      toast.success('Development theme confirmed');
    },
    onError: (error) => {
      toast.error('Failed to confirm theme', { description: error.message });
    },
  });
}

// Accept a recommendation
export function useAcceptRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('development_recommendations')
        .update({
          is_accepted: true,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-recommendations'] });
      toast.success('Recommendation accepted');
    },
    onError: (error) => {
      toast.error('Failed to accept recommendation', { description: error.message });
    },
  });
}

// Create a new development theme
export function useCreateDevelopmentTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: Partial<DevelopmentTheme>) => {
      const { data, error } = await supabase
        .from('development_themes')
        .insert(theme as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['development-themes'] });
      toast.success('Development theme created');
    },
    onError: (error) => {
      toast.error('Failed to create theme', { description: error.message });
    },
  });
}

// Schedule remeasurement
export function useScheduleRemeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Partial<FeedbackRemeasurementPlan>) => {
      const { data, error } = await supabase
        .from('feedback_remeasurement_plans')
        .insert(plan as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remeasurement-plans'] });
      toast.success('Remeasurement scheduled');
    },
    onError: (error) => {
      toast.error('Failed to schedule remeasurement', { description: error.message });
    },
  });
}

// Link theme to IDP
export function useLinkThemeToIDP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Partial<IDPFeedbackLink>) => {
      const { data, error } = await supabase
        .from('idp_feedback_links')
        .insert(link)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idp-feedback-links'] });
      toast.success('Linked to IDP');
    },
    onError: (error) => {
      toast.error('Failed to link to IDP', { description: error.message });
    },
  });
}
