import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tour, TourStep, TourWithSteps, TourCompletion, TourAnalyticsEvent } from '@/types/tours';
import { useToast } from '@/hooks/use-toast';

export function useTour() {
  const { user, profile, roles } = useAuth();
  const { toast } = useToast();
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [completions, setCompletions] = useState<TourCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter tours by user's roles - tours with empty target_roles are available to all
  const tours = useMemo(() => {
    return allTours.filter(tour => {
      // If no target roles specified, show to everyone
      if (!tour.target_roles || tour.target_roles.length === 0) {
        return true;
      }
      // Check if user has any of the target roles
      return roles.some(userRole => tour.target_roles.includes(userRole));
    });
  }, [allTours, roles]);

  // Fetch all available tours
  const fetchTours = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('enablement_tours')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      setAllTours((data as Tour[]) || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch user's tour completions
  const fetchCompletions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('enablement_tour_completions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setCompletions((data as TourCompletion[]) || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  }, [user]);

  // Fetch a specific tour with its steps (with role-based access check)
  const fetchTourWithSteps = useCallback(async (tourCode: string): Promise<TourWithSteps | null> => {
    try {
      // Fetch tour
      const { data: tourData, error: tourError } = await supabase
        .from('enablement_tours')
        .select('*')
        .eq('tour_code', tourCode)
        .eq('is_active', true)
        .maybeSingle();
      
      if (tourError) throw tourError;
      if (!tourData) return null;

      const tour = tourData as Tour;
      
      // Check if user has access based on target_roles
      const hasAccess = !tour.target_roles || tour.target_roles.length === 0 ||
        roles.some(userRole => tour.target_roles.includes(userRole));
      
      if (!hasAccess) {
        console.warn(`User does not have role access to tour "${tourCode}"`);
        return null;
      }

      // Fetch steps with videos - explicitly specify foreign key to avoid ambiguous relationship error
      const { data: stepsData, error: stepsError } = await supabase
        .from('enablement_tour_steps')
        .select(`
          *,
          video:enablement_video_library!enablement_tour_steps_video_id_fkey(id, title, video_url, video_provider, duration_seconds, thumbnail_url)
        `)
        .eq('tour_id', tourData.id)
        .order('step_order', { ascending: true });
      
      if (stepsError) throw stepsError;

      return {
        ...tour,
        steps: (stepsData as TourStep[]) || [],
      };
    } catch (error) {
      console.error('Error fetching tour with steps:', error);
      return null;
    }
  }, [roles]);

  // Check if a tour has been completed
  const hasCompletedTour = useCallback((tourCode: string): boolean => {
    const tour = tours.find(t => t.tour_code === tourCode);
    if (!tour) return false;
    
    const completion = completions.find(c => 
      c.tour_id === tour.id && 
      (c.completed_at !== null || c.was_skipped)
    );
    return !!completion;
  }, [tours, completions]);

  // Start or update a tour completion record
  const startTourCompletion = useCallback(async (tourId: string, totalSteps: number): Promise<TourCompletion | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('enablement_tour_completions')
        .upsert({
          user_id: user.id,
          tour_id: tourId,
          company_id: profile?.company_id || null,
          started_at: new Date().toISOString(),
          last_step_completed: 0,
          total_steps: totalSteps,
          was_skipped: false,
        }, {
          onConflict: 'user_id,tour_id,company_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as TourCompletion;
    } catch (error) {
      console.error('Error starting tour completion:', error);
      return null;
    }
  }, [user, profile]);

  // Update tour progress
  const updateTourProgress = useCallback(async (
    tourId: string,
    stepCompleted: number,
    isComplete: boolean = false
  ) => {
    if (!user) return;
    
    try {
      const updates: Partial<TourCompletion> = {
        last_step_completed: stepCompleted,
      };
      
      if (isComplete) {
        updates.completed_at = new Date().toISOString();
      }
      
      await supabase
        .from('enablement_tour_completions')
        .update(updates)
        .eq('user_id', user.id)
        .eq('tour_id', tourId);
    } catch (error) {
      console.error('Error updating tour progress:', error);
    }
  }, [user]);

  // Skip a tour
  const skipTour = useCallback(async (tourId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('enablement_tour_completions')
        .update({
          was_skipped: true,
        })
        .eq('user_id', user.id)
        .eq('tour_id', tourId);
      
      await fetchCompletions();
    } catch (error) {
      console.error('Error skipping tour:', error);
    }
  }, [user, fetchCompletions]);

  // Submit feedback for a tour
  const submitFeedback = useCallback(async (tourId: string, rating: number, comment?: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('enablement_tour_completions')
        .update({
          feedback_rating: rating,
          feedback_comment: comment || null,
        })
        .eq('user_id', user.id)
        .eq('tour_id', tourId);
      
      toast({
        title: "Thanks for your feedback!",
        description: "Your feedback helps us improve the onboarding experience.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, [user, toast]);

  // Track analytics event
  const trackEvent = useCallback(async (event: Omit<TourAnalyticsEvent, 'user_id' | 'company_id'>) => {
    if (!user) return;
    
    try {
      // Ensure session ID exists
      let sessionId = sessionStorage.getItem('tour_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('tour_session_id', sessionId);
      }

      await supabase
        .from('enablement_tour_analytics')
        .insert([{
          tour_id: event.tour_id || null,
          event_type: event.event_type,
          step_id: event.step_id || null,
          video_id: event.video_id || null,
          event_data: (event.event_data || {}) as Record<string, never>,
          user_id: user.id,
          company_id: profile?.company_id || null,
          session_id: sessionId,
          user_agent: navigator.userAgent,
        }]);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user, profile]);

  // Reset tour completion (for replaying)
  const resetTourCompletion = useCallback(async (tourCode: string) => {
    if (!user) return;
    
    const tour = tours.find(t => t.tour_code === tourCode);
    if (!tour) return;
    
    try {
      await supabase
        .from('enablement_tour_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('tour_id', tour.id);
      
      await fetchCompletions();
    } catch (error) {
      console.error('Error resetting tour completion:', error);
    }
  }, [user, tours, fetchCompletions]);

  // Get tours for a specific module/route
  const getToursForModule = useCallback((moduleCode: string): Tour[] => {
    return tours.filter(t => t.module_code === moduleCode);
  }, [tours]);

  // Get tours that should auto-trigger
  const getAutoTriggerTours = useCallback((route: string, moduleCode: string): Tour[] => {
    return tours.filter(t => 
      t.auto_trigger_on === 'first_visit' &&
      (t.trigger_route === route || t.module_code === moduleCode) &&
      !hasCompletedTour(t.tour_code)
    );
  }, [tours, hasCompletedTour]);

  useEffect(() => {
    fetchTours();
    fetchCompletions();
  }, [fetchTours, fetchCompletions]);

  return {
    tours,
    completions,
    isLoading,
    fetchTours,
    fetchCompletions,
    fetchTourWithSteps,
    hasCompletedTour,
    startTourCompletion,
    updateTourProgress,
    skipTour,
    submitFeedback,
    trackEvent,
    resetTourCompletion,
    getToursForModule,
    getAutoTriggerTours,
  };
}
