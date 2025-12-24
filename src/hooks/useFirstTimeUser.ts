import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserFeatureVisit } from '@/types/tours';

interface UseFirstTimeUserOptions {
  moduleCode: string;
  featureCode?: string;
  autoMarkVisited?: boolean;
}

export function useFirstTimeUser(options: UseFirstTimeUserOptions) {
  const { moduleCode, featureCode = '', autoMarkVisited = true } = options;
  const { user, profile } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [visitData, setVisitData] = useState<UserFeatureVisit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAndRecordVisit = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Check for existing visit
      const { data: existingVisit, error: fetchError } = await supabase
        .from('enablement_user_feature_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_code', moduleCode)
        .eq('feature_code', featureCode)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingVisit) {
        // Not first time - update visit count
        setIsFirstTime(false);
        setVisitData(existingVisit as UserFeatureVisit);
        
        // Update visit count
        await supabase
          .from('enablement_user_feature_visits')
          .update({
            visit_count: (existingVisit.visit_count || 1) + 1,
            last_visit_at: new Date().toISOString(),
          })
          .eq('id', existingVisit.id);
      } else {
        // First time
        setIsFirstTime(true);
        
        if (autoMarkVisited) {
          const { data: newVisit, error: insertError } = await supabase
            .from('enablement_user_feature_visits')
            .insert({
              user_id: user.id,
              company_id: profile?.company_id || null,
              module_code: moduleCode,
              feature_code: featureCode,
              tour_triggered: false,
              tour_completed: false,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setVisitData(newVisit as UserFeatureVisit);
        }
      }
    } catch (error) {
      console.error('Error checking first-time visit:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, moduleCode, featureCode, autoMarkVisited]);

  const markTourTriggered = useCallback(async () => {
    if (!visitData) return;
    
    try {
      await supabase
        .from('enablement_user_feature_visits')
        .update({ tour_triggered: true })
        .eq('id', visitData.id);
      
      setVisitData(prev => prev ? { ...prev, tour_triggered: true } : null);
    } catch (error) {
      console.error('Error marking tour triggered:', error);
    }
  }, [visitData]);

  const markTourCompleted = useCallback(async () => {
    if (!visitData) return;
    
    try {
      await supabase
        .from('enablement_user_feature_visits')
        .update({ tour_completed: true })
        .eq('id', visitData.id);
      
      setVisitData(prev => prev ? { ...prev, tour_completed: true } : null);
    } catch (error) {
      console.error('Error marking tour completed:', error);
    }
  }, [visitData]);

  useEffect(() => {
    checkAndRecordVisit();
  }, [checkAndRecordVisit]);

  return {
    isFirstTime,
    visitData,
    isLoading,
    markTourTriggered,
    markTourCompleted,
  };
}
