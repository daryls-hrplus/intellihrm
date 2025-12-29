import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface ConcurrentPosition {
  position_id: string;
  position_title: string;
  job_id: string | null;
  job_name: string | null;
  is_primary: boolean;
  fte_percentage: number;
  department_name: string | null;
  start_date: string | null;
}

export interface ConcurrentPositionResult {
  hasMultiplePositions: boolean;
  positions: ConcurrentPosition[];
  totalFTE: number;
}

export function useConcurrentPositionDetection() {
  const [isLoading, setIsLoading] = useState(false);

  // Detect concurrent positions for an employee
  const detectConcurrentPositions = useCallback(async (
    employeeId: string
  ): Promise<ConcurrentPositionResult> => {
    try {
      const { data: positions, error } = await supabase
        .from('employee_positions')
        .select(`
          id,
          position_id,
          is_primary,
          fte_percentage,
          start_date,
          positions (
            id,
            title,
            job_id,
            jobs (id, name),
            departments (id, name)
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching concurrent positions:', error);
        return { hasMultiplePositions: false, positions: [], totalFTE: 0 };
      }

      if (!positions || positions.length === 0) {
        return { hasMultiplePositions: false, positions: [], totalFTE: 0 };
      }

      const formattedPositions: ConcurrentPosition[] = positions.map((ep: any) => ({
        position_id: ep.position_id,
        position_title: ep.positions?.title || 'Unknown Position',
        job_id: ep.positions?.job_id || null,
        job_name: ep.positions?.jobs?.name || null,
        is_primary: ep.is_primary ?? false,
        fte_percentage: ep.fte_percentage || 100,
        department_name: ep.positions?.departments?.name || null,
        start_date: ep.start_date,
      }));

      const totalFTE = formattedPositions.reduce((sum, p) => sum + p.fte_percentage, 0);

      return {
        hasMultiplePositions: positions.length > 1,
        positions: formattedPositions,
        totalFTE,
      };
    } catch (error) {
      console.error('Error detecting concurrent positions:', error);
      return { hasMultiplePositions: false, positions: [], totalFTE: 0 };
    }
  }, []);

  // Create position weights for a participant based on concurrent positions
  const createPositionWeights = useCallback(async (
    participantId: string,
    employeeId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await detectConcurrentPositions(employeeId);

      if (!result.hasMultiplePositions) {
        // Single position - no need for position weights
        return false;
      }

      // Calculate weights based on FTE percentages
      const totalFTE = result.totalFTE;
      const weightsToCreate = result.positions.map(pos => ({
        participant_id: participantId,
        position_id: pos.position_id,
        job_id: pos.job_id,
        weight_percentage: Math.round((pos.fte_percentage / totalFTE) * 100),
        is_primary: pos.is_primary,
      }));

      // Delete existing weights
      await supabase
        .from('appraisal_position_weights')
        .delete()
        .eq('participant_id', participantId);

      // Insert new weights
      const { error } = await supabase
        .from('appraisal_position_weights')
        .insert(weightsToCreate);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error creating position weights:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [detectConcurrentPositions]);

  // Get recommended weight distribution for positions
  const getRecommendedWeights = useCallback((
    positions: ConcurrentPosition[]
  ): Record<string, number> => {
    const totalFTE = positions.reduce((sum, p) => sum + p.fte_percentage, 0);
    const weights: Record<string, number> = {};

    positions.forEach(pos => {
      weights[pos.position_id] = Math.round((pos.fte_percentage / totalFTE) * 100);
    });

    // Ensure weights sum to 100
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (sum !== 100 && positions.length > 0) {
      const firstKey = Object.keys(weights)[0];
      weights[firstKey] += (100 - sum);
    }

    return weights;
  }, []);

  return {
    isLoading,
    detectConcurrentPositions,
    createPositionWeights,
    getRecommendedWeights,
  };
}
