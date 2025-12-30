import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompetencyVersion {
  id: string;
  version: number;
  version_notes: string | null;
  versioned_at: string | null;
  name: string;
}

export function useCompetencyVersioning() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompetencyWithVersion = useCallback(async (competencyId: string): Promise<CompetencyVersion | null> => {
    try {
      const { data, error } = await supabase
        .from('competencies')
        .select('id, version, version_notes, versioned_at, name')
        .eq('id', competencyId)
        .single();

      if (error) throw error;
      return data as CompetencyVersion;
    } catch (error) {
      console.error('Error fetching competency version:', error);
      return null;
    }
  }, []);

  const recordVersionInAppraisal = useCallback(async (
    scoreId: string,
    competencyVersion: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appraisal_scores')
        .update({ competency_version: competencyVersion })
        .eq('id', scoreId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording competency version:', error);
      return false;
    }
  }, []);

  const getVersionHistory = useCallback(async (competencyId: string) => {
    // For now, we track current version only
    // Full version history would require a separate versions table
    const current = await fetchCompetencyWithVersion(competencyId);
    return current ? [current] : [];
  }, [fetchCompetencyWithVersion]);

  const incrementVersion = useCallback(async (
    competencyId: string,
    versionNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const current = await fetchCompetencyWithVersion(competencyId);
      if (!current) throw new Error('Competency not found');

      const { error } = await supabase
        .from('competencies')
        .update({
          version: current.version + 1,
          version_notes: versionNotes || null,
          versioned_at: new Date().toISOString()
        })
        .eq('id', competencyId);

      if (error) throw error;

      toast({
        title: 'Version Updated',
        description: `Competency version incremented to ${current.version + 1}`,
      });

      return true;
    } catch (error) {
      console.error('Error incrementing version:', error);
      toast({
        title: 'Error',
        description: 'Failed to update competency version',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCompetencyWithVersion, toast]);

  return {
    loading,
    fetchCompetencyWithVersion,
    recordVersionInAppraisal,
    getVersionHistory,
    incrementVersion,
  };
}
