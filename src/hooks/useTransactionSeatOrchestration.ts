import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AssignmentType } from '@/components/workforce/position-seats/types';

interface SeatAssignmentParams {
  seatId: string;
  employeeId: string;
  employeePositionId?: string | null;
  ftePercentage?: number;
  assignmentType?: AssignmentType;
  transactionId?: string | null;
  budgetPercentage?: number;
  startDate?: string;
  endDate?: string | null;
  notes?: string;
}

interface SecondmentParams {
  employeeId: string;
  originSeatId: string;
  destinationSeatId: string;
  destinationPositionId: string;
  transactionId: string;
  startDate: string;
  returnDate: string;
  ftePercentage?: number;
  holdOriginSeat?: boolean;
}

interface TransferParams {
  fromSeatId: string;
  toSeatId: string;
  employeeId: string;
  employeePositionId: string;
  transactionId?: string;
  transferDate?: string;
  ftePercentage?: number;
}

interface OrchestrationResult {
  success: boolean;
  occupantId?: string;
  error?: string;
}

export function useTransactionSeatOrchestration() {
  const [isProcessing, setIsProcessing] = useState(false);

  const findSeatForPosition = useCallback(async (positionId: string): Promise<string | null> => {
    try {
      // Use the summary view to find seats
      const { data } = await supabase
        .from('seat_occupancy_summary')
        .select('seat_id, allocation_status, is_shared_seat, current_occupant_count, max_occupants')
        .eq('position_id', positionId);
      
      if (!data || data.length === 0) return null;

      // Find vacant seat first
      const vacant = data.find(s => s.allocation_status === 'VACANT');
      if (vacant) return vacant.seat_id;

      // Find shared seat with capacity
      const shared = data.find(s => 
        s.is_shared_seat && 
        (s.current_occupant_count || 0) < (s.max_occupants || 1)
      );
      return shared?.seat_id || null;
    } catch (err) {
      console.error('Error finding seat:', err);
      return null;
    }
  }, []);

  const assignEmployeeToSeat = useCallback(async (params: SeatAssignmentParams): Promise<OrchestrationResult> => {
    setIsProcessing(true);
    try {
      const { count: primaryCount } = await supabase
        .from('seat_occupants')
        .select('id', { count: 'exact', head: true })
        .eq('seat_id', params.seatId)
        .eq('is_primary_occupant', true)
        .is('end_date', null);

      const isPrimary = (primaryCount === 0) && (params.assignmentType === 'primary');

      const { data: occupant, error } = await supabase
        .from('seat_occupants')
        .insert({
          seat_id: params.seatId,
          employee_id: params.employeeId,
          employee_position_id: params.employeePositionId || null,
          fte_percentage: params.ftePercentage ?? 100,
          assignment_type: params.assignmentType ?? 'primary',
          is_primary_occupant: isPrimary,
          budget_percentage: params.budgetPercentage ?? params.ftePercentage ?? 100,
          start_date: params.startDate || new Date().toISOString().split('T')[0],
          end_date: params.endDate || null,
          notes: params.notes || null,
          source_transaction_id: params.transactionId || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (isPrimary) {
        await supabase
          .from('position_seats')
          .update({ status: 'FILLED', current_employee_id: params.employeeId })
          .eq('id', params.seatId);
      }

      return { success: true, occupantId: occupant.id };
    } catch (err: unknown) {
      console.error('Error assigning seat:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const removeEmployeeFromSeat = useCallback(async (
    seatId: string, employeeId: string, endDate?: string, reason?: string
  ): Promise<OrchestrationResult> => {
    setIsProcessing(true);
    try {
      await supabase
        .from('seat_occupants')
        .update({ end_date: endDate || new Date().toISOString().split('T')[0], notes: reason })
        .eq('seat_id', seatId)
        .eq('employee_id', employeeId)
        .is('end_date', null);

      const { count } = await supabase
        .from('seat_occupants')
        .select('id', { count: 'exact', head: true })
        .eq('seat_id', seatId)
        .is('end_date', null);

      if (count === 0) {
        await supabase
          .from('position_seats')
          .update({ status: 'VACANT', current_employee_id: null })
          .eq('id', seatId);
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const transferEmployeeSeat = useCallback(async (params: TransferParams): Promise<OrchestrationResult> => {
    await removeEmployeeFromSeat(params.fromSeatId, params.employeeId, params.transferDate, 'Transferred');
    return assignEmployeeToSeat({
      seatId: params.toSeatId,
      employeeId: params.employeeId,
      employeePositionId: params.employeePositionId,
      ftePercentage: params.ftePercentage ?? 100,
      assignmentType: 'primary',
      transactionId: params.transactionId,
      startDate: params.transferDate,
    });
  }, [assignEmployeeToSeat, removeEmployeeFromSeat]);

  const processSecondmentSeat = useCallback(async (params: SecondmentParams): Promise<OrchestrationResult> => {
    if (params.holdOriginSeat !== false) {
      await supabase
        .from('seat_occupants')
        .update({ fte_percentage: 0, notes: `On secondment until ${params.returnDate}` })
        .eq('seat_id', params.originSeatId)
        .eq('employee_id', params.employeeId)
        .is('end_date', null);
    }

    await supabase
      .from('position_seats')
      .update({ secondment_origin_seat_id: params.originSeatId, secondment_return_date: params.returnDate })
      .eq('id', params.destinationSeatId);

    return assignEmployeeToSeat({
      seatId: params.destinationSeatId,
      employeeId: params.employeeId,
      ftePercentage: params.ftePercentage ?? 100,
      assignmentType: 'secondment',
      transactionId: params.transactionId,
      startDate: params.startDate,
      endDate: params.returnDate,
    });
  }, [assignEmployeeToSeat]);

  const orchestrateTransactionSeat = useCallback(async (
    transactionType: string,
    transactionId: string,
    employeeId: string,
    positionId: string,
    effectiveDate: string,
    options?: { fromPositionId?: string; ftePercentage?: number; secondmentReturnDate?: string; holdOriginSeat?: boolean; }
  ): Promise<OrchestrationResult> => {
    const targetSeatId = await findSeatForPosition(positionId);
    
    if (!targetSeatId && transactionType !== 'TERMINATION') {
      toast.warning('No available seat found');
      return { success: false, error: 'No seat' };
    }

    switch (transactionType) {
      case 'HIRE':
      case 'ACTING':
        return assignEmployeeToSeat({
          seatId: targetSeatId!,
          employeeId,
          transactionId,
          ftePercentage: options?.ftePercentage ?? 100,
          assignmentType: transactionType === 'ACTING' ? 'acting' : 'primary',
          startDate: effectiveDate,
        });

      case 'SECONDMENT': {
        const originSeatId = options?.fromPositionId ? await findSeatForPosition(options.fromPositionId) : null;
        if (originSeatId) {
          return processSecondmentSeat({
            employeeId, originSeatId, destinationSeatId: targetSeatId!,
            destinationPositionId: positionId, transactionId,
            startDate: effectiveDate, returnDate: options?.secondmentReturnDate || '',
            ftePercentage: options?.ftePercentage, holdOriginSeat: options?.holdOriginSeat,
          });
        }
        return assignEmployeeToSeat({
          seatId: targetSeatId!, employeeId, transactionId,
          assignmentType: 'secondment', startDate: effectiveDate, endDate: options?.secondmentReturnDate,
        });
      }

      case 'PROMOTION':
      case 'TRANSFER': {
        const fromSeatId = options?.fromPositionId ? await findSeatForPosition(options.fromPositionId) : null;
        if (fromSeatId) {
          return transferEmployeeSeat({
            fromSeatId, toSeatId: targetSeatId!, employeeId,
            employeePositionId: positionId, transactionId, transferDate: effectiveDate,
          });
        }
        return assignEmployeeToSeat({
          seatId: targetSeatId!, employeeId, transactionId, assignmentType: 'primary', startDate: effectiveDate,
        });
      }

      case 'TERMINATION': {
        const { data: occupancies } = await supabase
          .from('seat_occupants')
          .select('seat_id')
          .eq('employee_id', employeeId)
          .is('end_date', null);
        
        for (const occ of occupancies || []) {
          await removeEmployeeFromSeat(occ.seat_id, employeeId, effectiveDate, 'Terminated');
        }
        return { success: true };
      }

      default:
        return { success: false, error: 'Unsupported type' };
    }
  }, [findSeatForPosition, assignEmployeeToSeat, removeEmployeeFromSeat, transferEmployeeSeat, processSecondmentSeat]);

  return {
    isProcessing,
    findSeatForPosition,
    assignEmployeeToSeat,
    removeEmployeeFromSeat,
    transferEmployeeSeat,
    processSecondmentSeat,
    orchestrateTransactionSeat,
  };
}
