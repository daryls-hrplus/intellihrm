import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface RoleSegment {
  id: string;
  participant_id: string;
  position_id: string | null;
  job_id: string | null;
  segment_start_date: string;
  segment_end_date: string;
  contribution_percentage: number;
  responsibilities: any[];
  competencies: any[];
  goals: any[];
  position_title?: string;
  job_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PositionHistoryEntry {
  id: string;
  position_id: string;
  action: string;
  old_values: any;
  new_values: any;
  created_at: string;
  position?: {
    id: string;
    title: string;
    job_id: string | null;
    jobs?: { id: string; name: string } | null;
  };
}

export interface DetectedRoleChange {
  position_id: string;
  position_title: string;
  job_id: string | null;
  job_name: string | null;
  start_date: string;
  end_date: string;
  days_in_period: number;
  contribution_percentage: number;
}

export function useAppraisalRoleSegments() {
  const [isLoading, setIsLoading] = useState(false);
  const [segments, setSegments] = useState<RoleSegment[]>([]);

  // Detect role changes during an appraisal cycle period
  const detectRoleChanges = useCallback(async (
    employeeId: string,
    cycleStartDate: string,
    cycleEndDate: string
  ): Promise<DetectedRoleChange[]> => {
    try {
      // Get employee position history
      const { data: history, error } = await supabase
        .from('employee_position_history')
        .select(`
          id,
          position_id,
          action,
          old_values,
          new_values,
          created_at
        `)
        .eq('employee_id', employeeId)
        .gte('created_at', cycleStartDate)
        .lte('created_at', cycleEndDate)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching position history:', error);
        return [];
      }

      // Also get current positions
      const { data: currentPositions } = await supabase
        .from('employee_positions')
        .select(`
          id,
          position_id,
          start_date,
          end_date,
          positions (
            id,
            title,
            job_id,
            jobs (id, name)
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      // Build a timeline of positions held during the cycle
      const cycleStart = new Date(cycleStartDate);
      const cycleEnd = new Date(cycleEndDate);
      const totalDays = Math.ceil((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // If no history, check if there was a single position during entire period
      if (!history || history.length === 0) {
        // Just use current position(s) for entire cycle
        if (currentPositions && currentPositions.length > 0) {
          const position = currentPositions[0] as any;
          return [{
            position_id: position.position_id,
            position_title: position.positions?.title || 'Unknown Position',
            job_id: position.positions?.job_id || null,
            job_name: position.positions?.jobs?.name || null,
            start_date: cycleStartDate,
            end_date: cycleEndDate,
            days_in_period: totalDays,
            contribution_percentage: 100,
          }];
        }
        return [];
      }

      // Build segments from history
      const positionSegments: DetectedRoleChange[] = [];
      const positionIds = [...new Set(history.map(h => h.position_id))];

      // Get position details
      const { data: positions } = await supabase
        .from('positions')
        .select('id, title, job_id, jobs (id, name)')
        .in('id', positionIds);

      const positionMap = new Map(
        (positions || []).map((p: any) => [p.id, p])
      );

      // Track position changes by date
      const changes: { date: Date; position_id: string; action: string }[] = [];
      
      for (const entry of history) {
        changes.push({
          date: new Date(entry.created_at),
          position_id: entry.position_id,
          action: entry.action,
        });
      }

      // Sort by date
      changes.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate segments
      let currentPos = currentPositions?.[0];
      let segmentStart = cycleStart;

      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        const changeDate = change.date;

        if (change.action === 'deactivated' || change.action === 'terminated') {
          // End of a segment
          if (currentPos) {
            const segmentEnd = changeDate;
            const days = Math.ceil((segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24));
            const pos = positionMap.get((currentPos as any).position_id) as any;
            
            positionSegments.push({
              position_id: (currentPos as any).position_id,
              position_title: pos?.title || 'Unknown Position',
              job_id: pos?.job_id || null,
              job_name: pos?.jobs?.name || null,
              start_date: segmentStart.toISOString().split('T')[0],
              end_date: segmentEnd.toISOString().split('T')[0],
              days_in_period: days,
              contribution_percentage: 0, // Calculate after
            });
            segmentStart = segmentEnd;
          }
        } else if (change.action === 'activated' || change.action === 'promoted' || change.action === 'transferred') {
          // New segment starts
          const pos = positionMap.get(change.position_id) as any;
          if (pos) {
            currentPos = { position_id: change.position_id, ...pos } as any;
          }
        }
      }

      // Add final segment to end of cycle
      if (currentPos && currentPositions && currentPositions.length > 0) {
        const pos = (currentPositions[0] as any).positions;
        const days = Math.ceil((cycleEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24));
        
        positionSegments.push({
          position_id: (currentPositions[0] as any).position_id,
          position_title: pos?.title || 'Unknown Position',
          job_id: pos?.job_id || null,
          job_name: pos?.jobs?.name || null,
          start_date: segmentStart.toISOString().split('T')[0],
          end_date: cycleEndDate,
          days_in_period: days,
          contribution_percentage: 0,
        });
      }

      // Calculate contribution percentages
      const totalSegmentDays = positionSegments.reduce((sum, s) => sum + s.days_in_period, 0);
      for (const segment of positionSegments) {
        segment.contribution_percentage = Math.round((segment.days_in_period / totalSegmentDays) * 100);
      }

      return positionSegments;
    } catch (error) {
      console.error('Error detecting role changes:', error);
      return [];
    }
  }, []);

  // Fetch responsibilities, competencies, and goals for a job/position
  const fetchSegmentItems = useCallback(async (jobId: string | null, positionId: string | null) => {
    const items = { responsibilities: [], competencies: [], goals: [] } as {
      responsibilities: any[];
      competencies: any[];
      goals: any[];
    };

    if (!jobId) return items;

    try {
      // Fetch job responsibilities
      const { data: jobResps } = await supabase
        .from('job_responsibilities')
        .select(`
          id,
          weighting,
          responsibility_id,
          responsibilities (id, name, description)
        `)
        .eq('job_id', jobId)
        .is('end_date', null);

      items.responsibilities = (jobResps || []).map((jr: any) => ({
        id: jr.responsibility_id,
        name: jr.responsibilities?.name,
        description: jr.responsibilities?.description,
        weight: jr.weighting,
      }));

      // Fetch job competencies from job_competencies table
      const { data: jobComps } = await supabase
        .from('job_competencies')
        .select(`
          id,
          weighting,
          competency_id,
          competencies (id, name, description)
        `)
        .eq('job_id', jobId);

      items.competencies = (jobComps || []).map((jc: any) => ({
        id: jc.competency_id,
        name: jc.competencies?.name,
        description: jc.competencies?.description,
        weight: jc.weighting,
      }));

      // Fetch job goals
      const { data: jobGoals } = await supabase
        .from('job_goals')
        .select('id, goal_name, description, weighting')
        .eq('job_id', jobId)
        .is('end_date', null);

      items.goals = (jobGoals || []).map((g: any) => ({
        id: g.id,
        name: g.goal_name,
        description: g.description,
        weight: g.weighting,
      }));
    } catch (error) {
      console.error('Error fetching segment items:', error);
    }

    return items;
  }, []);

  // Create role segments for a participant
  const createRoleSegments = useCallback(async (
    participantId: string,
    employeeId: string,
    cycleStartDate: string,
    cycleEndDate: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Detect role changes
      const detectedChanges = await detectRoleChanges(employeeId, cycleStartDate, cycleEndDate);
      
      if (detectedChanges.length === 0) {
        // No role changes - mark participant as having no role change
        await supabase
          .from('appraisal_participants')
          .update({ 
            has_role_change: false,
            role_segments: null,
            primary_position_id: null,
          })
          .eq('id', participantId);
        return false;
      }

      const hasMultipleRoles = detectedChanges.length > 1;

      // Create segments with items for each role
      const segmentsToCreate = [];
      for (const change of detectedChanges) {
        const items = await fetchSegmentItems(change.job_id, change.position_id);
        
        segmentsToCreate.push({
          participant_id: participantId,
          position_id: change.position_id,
          job_id: change.job_id,
          segment_start_date: change.start_date,
          segment_end_date: change.end_date,
          contribution_percentage: change.contribution_percentage,
          responsibilities: items.responsibilities as unknown as Json,
          competencies: items.competencies as unknown as Json,
          goals: items.goals as unknown as Json,
        });
      }

      // Delete existing segments
      await supabase
        .from('appraisal_role_segments')
        .delete()
        .eq('participant_id', participantId);

      // Insert new segments
      if (segmentsToCreate.length > 0) {
        const { error } = await supabase
          .from('appraisal_role_segments')
          .insert(segmentsToCreate);

        if (error) throw error;
      }

      // Update participant with summary - convert to Json-compatible format
      const primaryPosition = detectedChanges[detectedChanges.length - 1]; // Most recent
      const roleSegmentsJson = detectedChanges.map(c => ({
        position_id: c.position_id,
        position_title: c.position_title,
        job_id: c.job_id,
        job_name: c.job_name,
        start_date: c.start_date,
        end_date: c.end_date,
        days_in_period: c.days_in_period,
        contribution_percentage: c.contribution_percentage,
      })) as unknown as Json;

      await supabase
        .from('appraisal_participants')
        .update({
          has_role_change: hasMultipleRoles,
          role_segments: roleSegmentsJson,
          primary_position_id: primaryPosition.position_id,
        })
        .eq('id', participantId);

      return hasMultipleRoles;
    } catch (error) {
      console.error('Error creating role segments:', error);
      toast.error('Failed to create role segments');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [detectRoleChanges, fetchSegmentItems]);

  // Fetch segments for a participant
  const fetchSegments = useCallback(async (participantId: string): Promise<RoleSegment[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appraisal_role_segments')
        .select(`
          *,
          positions (id, title),
          jobs (id, name)
        `)
        .eq('participant_id', participantId)
        .order('segment_start_date', { ascending: true });

      if (error) throw error;

      const formattedSegments = (data || []).map((s: any) => ({
        ...s,
        position_title: s.positions?.title,
        job_name: s.jobs?.name,
      }));

      setSegments(formattedSegments);
      return formattedSegments;
    } catch (error) {
      console.error('Error fetching segments:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate weighted score across segments
  const calculateSegmentWeightedScore = useCallback((
    segments: RoleSegment[],
    segmentScores: Record<string, { competency: number; responsibility: number; goal: number }>
  ): { competency: number; responsibility: number; goal: number } => {
    let totalCompetency = 0;
    let totalResponsibility = 0;
    let totalGoal = 0;

    for (const segment of segments) {
      const scores = segmentScores[segment.id];
      if (scores) {
        const weight = segment.contribution_percentage / 100;
        totalCompetency += scores.competency * weight;
        totalResponsibility += scores.responsibility * weight;
        totalGoal += scores.goal * weight;
      }
    }

    return {
      competency: Math.round(totalCompetency * 100) / 100,
      responsibility: Math.round(totalResponsibility * 100) / 100,
      goal: Math.round(totalGoal * 100) / 100,
    };
  }, []);

  return {
    isLoading,
    segments,
    detectRoleChanges,
    createRoleSegments,
    fetchSegments,
    fetchSegmentItems,
    calculateSegmentWeightedScore,
  };
}
