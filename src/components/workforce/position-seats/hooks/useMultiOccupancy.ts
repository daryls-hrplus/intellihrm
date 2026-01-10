import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SeatOccupant, SeatOccupancySummary, EmployeeFTESummary, SecondmentTracking, AssignmentType } from '../types';

export function useSeatOccupants(seatId: string | null) {
  const [occupants, setOccupants] = useState<SeatOccupant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOccupants = useCallback(async () => {
    if (!seatId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seat_occupants')
        .select(`
          *,
          employee:profiles!seat_occupants_employee_id_fkey(
            full_name,
            email,
            employee_id
          )
        `)
        .eq('seat_id', seatId)
        .order('is_primary_occupant', { ascending: false });

      if (error) throw error;
      setOccupants((data || []) as unknown as SeatOccupant[]);
    } catch (err) {
      console.error('Error fetching seat occupants:', err);
      toast.error('Failed to load seat occupants');
    } finally {
      setIsLoading(false);
    }
  }, [seatId]);

  useEffect(() => {
    fetchOccupants();
  }, [fetchOccupants]);

  const addOccupant = async (data: {
    employee_id: string;
    fte_percentage: number;
    assignment_type: AssignmentType;
    is_primary_occupant?: boolean;
    budget_percentage?: number;
    start_date?: string;
    end_date?: string | null;
    notes?: string;
  }) => {
    if (!seatId) return false;
    try {
      const { error } = await supabase
        .from('seat_occupants')
        .insert({
          seat_id: seatId,
          ...data,
          start_date: data.start_date || new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
      toast.success('Occupant added successfully');
      await fetchOccupants();
      return true;
    } catch (err: any) {
      console.error('Error adding occupant:', err);
      toast.error(err.message || 'Failed to add occupant');
      return false;
    }
  };

  const updateOccupant = async (occupantId: string, data: Partial<SeatOccupant>) => {
    try {
      const { error } = await supabase
        .from('seat_occupants')
        .update(data)
        .eq('id', occupantId);

      if (error) throw error;
      toast.success('Occupant updated');
      await fetchOccupants();
      return true;
    } catch (err) {
      console.error('Error updating occupant:', err);
      toast.error('Failed to update occupant');
      return false;
    }
  };

  const removeOccupant = async (occupantId: string) => {
    try {
      const { error } = await supabase
        .from('seat_occupants')
        .delete()
        .eq('id', occupantId);

      if (error) throw error;
      toast.success('Occupant removed');
      await fetchOccupants();
      return true;
    } catch (err) {
      console.error('Error removing occupant:', err);
      toast.error('Failed to remove occupant');
      return false;
    }
  };

  return { occupants, isLoading, refetch: fetchOccupants, addOccupant, updateOccupant, removeOccupant };
}

export function useEmployeeFTESummary(employeeId?: string) {
  const [summary, setSummary] = useState<EmployeeFTESummary | null>(null);
  const [allSummaries, setAllSummaries] = useState<EmployeeFTESummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      if (employeeId) {
        const { data, error } = await supabase
          .from('employee_fte_summary')
          .select('*')
          .eq('employee_id', employeeId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setSummary(data as unknown as EmployeeFTESummary);
      } else {
        const { data, error } = await supabase
          .from('employee_fte_summary')
          .select('*')
          .neq('fte_status', 'UNALLOCATED')
          .order('total_fte_percentage', { ascending: false });

        if (error) throw error;
        setAllSummaries((data || []) as unknown as EmployeeFTESummary[]);
      }
    } catch (err) {
      console.error('Error fetching FTE summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const overAllocatedEmployees = allSummaries.filter(s => s.fte_status === 'OVER_ALLOCATED');

  return { summary, allSummaries, overAllocatedEmployees, isLoading, refetch: fetchSummary };
}

export function useSeatOccupancySummaries(positionId?: string) {
  const [summaries, setSummaries] = useState<SeatOccupancySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummaries = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('seat_occupancy_summary').select('*');
      if (positionId) {
        query = query.eq('position_id', positionId);
      }
      const { data, error } = await query.order('seat_code');

      if (error) throw error;
      setSummaries((data || []) as unknown as SeatOccupancySummary[]);
    } catch (err) {
      console.error('Error fetching occupancy summaries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const sharedSeats = summaries.filter(s => s.is_shared_seat || s.current_occupant_count > 1);
  const overAllocatedSeats = summaries.filter(s => s.allocation_status === 'OVER_ALLOCATED');

  return { summaries, sharedSeats, overAllocatedSeats, isLoading, refetch: fetchSummaries };
}

export function useSecondmentTracking() {
  const [secondments, setSecondments] = useState<SecondmentTracking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSecondments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('secondment_tracking')
        .select('*')
        .order('secondment_return_date');

      if (error) throw error;
      setSecondments((data || []) as unknown as SecondmentTracking[]);
    } catch (err) {
      console.error('Error fetching secondments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecondments();
  }, [fetchSecondments]);

  const overdueSecondments = secondments.filter(s => s.secondment_status === 'OVERDUE');
  const endingSoonSecondments = secondments.filter(s => s.secondment_status === 'ENDING_SOON');

  return { secondments, overdueSecondments, endingSoonSecondments, isLoading, refetch: fetchSecondments };
}