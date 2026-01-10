import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PositionSeat, PositionSeatSummary, HeadcountChangeRequest } from '../types';

export function usePositionSeats(positionId: string | null) {
  const [seats, setSeats] = useState<PositionSeat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeats = useCallback(async () => {
    if (!positionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('position_seats')
        .select(`
          *,
          current_employee:profiles!position_seats_current_employee_id_fkey(
            full_name,
            email,
            employee_id
          ),
          position:positions(
            title,
            code,
            department:departments(name)
          )
        `)
        .eq('position_id', positionId)
        .order('seat_number');

      if (fetchError) throw fetchError;
      setSeats((data || []) as unknown as PositionSeat[]);
    } catch (err) {
      console.error('Error fetching position seats:', err);
      setError('Failed to load position seats');
      toast.error('Failed to load position seats');
    } finally {
      setIsLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!positionId) return;

    const channel = supabase
      .channel(`position_seats_${positionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'position_seats',
          filter: `position_id=eq.${positionId}`
        },
        () => {
          fetchSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [positionId, fetchSeats]);

  const updateSeatStatus = async (
    seatId: string, 
    newStatus: PositionSeat['status'], 
    reason?: string
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('position_seats')
        .update({ 
          status: newStatus,
          notes: reason || null
        })
        .eq('id', seatId);

      if (updateError) throw updateError;
      
      toast.success(`Seat status updated to ${newStatus}`);
      await fetchSeats();
      return true;
    } catch (err) {
      console.error('Error updating seat status:', err);
      toast.error('Failed to update seat status');
      return false;
    }
  };

  const freezeSeat = async (seatId: string, reason: string, approvedBy: string) => {
    try {
      const { error: updateError } = await supabase
        .from('position_seats')
        .update({ 
          status: 'FROZEN',
          freeze_reason: reason,
          freeze_approved_by: approvedBy,
          frozen_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', seatId);

      if (updateError) throw updateError;
      
      toast.success('Seat frozen successfully');
      await fetchSeats();
      return true;
    } catch (err) {
      console.error('Error freezing seat:', err);
      toast.error('Failed to freeze seat');
      return false;
    }
  };

  const unfreezeSeat = async (seatId: string) => {
    try {
      const seat = seats.find(s => s.id === seatId);
      const newStatus = seat?.current_employee_id ? 'FILLED' : 'VACANT';
      
      const { error: updateError } = await supabase
        .from('position_seats')
        .update({ 
          status: newStatus,
          freeze_reason: null,
          freeze_approved_by: null,
          frozen_date: null
        })
        .eq('id', seatId);

      if (updateError) throw updateError;
      
      toast.success('Seat unfrozen successfully');
      await fetchSeats();
      return true;
    } catch (err) {
      console.error('Error unfreezing seat:', err);
      toast.error('Failed to unfreeze seat');
      return false;
    }
  };

  return {
    seats,
    isLoading,
    error,
    refetch: fetchSeats,
    updateSeatStatus,
    freezeSeat,
    unfreezeSeat
  };
}

export function usePositionSeatSummaries(companyId: string | null) {
  const [summaries, setSummaries] = useState<PositionSeatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummaries = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    
    try {
      // First get department IDs for this company
      const { data: depts } = await supabase
        .from('departments')
        .select('id')
        .eq('company_id', companyId);

      const deptIds = (depts || []).map(d => d.id);
      
      if (deptIds.length === 0) {
        setSummaries([]);
        return;
      }

      // Fetch from the view
      const { data, error } = await supabase
        .from('position_seat_summary')
        .select('*')
        .in('department_id', deptIds);

      if (error) throw error;
      setSummaries((data || []) as PositionSeatSummary[]);
    } catch (err) {
      console.error('Error fetching seat summaries:', err);
      toast.error('Failed to load seat summaries');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return { summaries, isLoading, refetch: fetchSummaries };
}

export function useHeadcountRequests(companyId: string | null) {
  const [requests, setRequests] = useState<HeadcountChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('headcount_change_requests')
        .select(`
          *,
          position:positions(
            title,
            code,
            department:departments(name)
          ),
          requester:profiles!headcount_change_requests_requested_by_fkey(
            full_name,
            email
          ),
          reviewer:profiles!headcount_change_requests_reviewed_by_fkey(
            full_name,
            email
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as unknown as HeadcountChangeRequest[]);
    } catch (err) {
      console.error('Error fetching headcount requests:', err);
      toast.error('Failed to load headcount requests');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`headcount_requests_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'headcount_change_requests',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, fetchRequests]);

  const createRequest = async (data: Partial<HeadcountChangeRequest>) => {
    try {
      const { error } = await supabase
        .from('headcount_change_requests')
        .insert(data as any);

      if (error) throw error;
      
      toast.success('Headcount change request created');
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error creating request:', err);
      toast.error('Failed to create request');
      return false;
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: HeadcountChangeRequest['status'],
    reviewNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = { 
        status,
        review_notes: reviewNotes
      };

      if (status === 'APPROVED' || status === 'REJECTED') {
        updateData.reviewed_by = user?.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      if (status === 'EXECUTED') {
        updateData.executed_by = user?.id;
        updateData.executed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('headcount_change_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Request ${status.toLowerCase()}`);
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error('Failed to update request');
      return false;
    }
  };

  return {
    requests,
    isLoading,
    refetch: fetchRequests,
    createRequest,
    updateRequestStatus
  };
}
