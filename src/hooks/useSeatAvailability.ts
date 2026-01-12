import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SeatAvailabilityStatus {
  isLoading: boolean;
  hasAvailableSeat: boolean;
  availableSeats: number;
  totalSeats: number;
  occupiedSeats: number;
  errorMessage: string | null;
  lastCheckedAt: Date | null;
}

interface UseSeatAvailabilityOptions {
  positionId: string | null | undefined;
  transactionType?: string;
  enabled?: boolean;
}

const initialStatus: SeatAvailabilityStatus = {
  isLoading: false,
  hasAvailableSeat: true,
  availableSeats: 0,
  totalSeats: 0,
  occupiedSeats: 0,
  errorMessage: null,
  lastCheckedAt: null,
};

/**
 * Reusable hook to check seat availability for a given position.
 * Used across TRANSFER, PROMOTION, SECONDMENT, and other transaction types.
 */
export function useSeatAvailability({
  positionId,
  transactionType = "transaction",
  enabled = true,
}: UseSeatAvailabilityOptions) {
  const [status, setStatus] = useState<SeatAvailabilityStatus>(initialStatus);

  const checkAvailability = useCallback(async () => {
    // Reset if no position or disabled
    if (!positionId || !enabled) {
      setStatus({
        ...initialStatus,
        lastCheckedAt: new Date(),
      });
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, errorMessage: null }));

    try {
      // Query seat_occupancy_summary for available seats in the position
      const { data, error } = await supabase
        .from("seat_occupancy_summary")
        .select("seat_id, allocation_status, is_shared_seat, current_occupant_count, max_occupants")
        .eq("position_id", positionId);

      if (error) {
        console.error("Error checking seat availability:", error);
        setStatus({
          isLoading: false,
          hasAvailableSeat: false,
          availableSeats: 0,
          totalSeats: 0,
          occupiedSeats: 0,
          errorMessage: "Failed to check seat availability",
          lastCheckedAt: new Date(),
        });
        return;
      }

      // Calculate seat metrics
      const seats = data || [];
      const totalSeats = seats.length;
      
      // Find vacant or under-allocated seats
      const availableSeats = seats.filter(seat => 
        seat.allocation_status === "VACANT" || 
        (seat.is_shared_seat && (seat.current_occupant_count || 0) < (seat.max_occupants || 1))
      );

      const occupiedSeats = totalSeats - availableSeats.length;
      const transactionLabel = transactionType?.toLowerCase() || "transaction";

      setStatus({
        isLoading: false,
        hasAvailableSeat: availableSeats.length > 0,
        availableSeats: availableSeats.length,
        totalSeats,
        occupiedSeats,
        errorMessage: availableSeats.length === 0 
          ? `No available seats in the selected position. The ${transactionLabel} cannot proceed.`
          : null,
        lastCheckedAt: new Date(),
      });
    } catch (err) {
      console.error("Error checking seat availability:", err);
      setStatus({
        isLoading: false,
        hasAvailableSeat: false,
        availableSeats: 0,
        totalSeats: 0,
        occupiedSeats: 0,
        errorMessage: "Failed to check seat availability",
        lastCheckedAt: new Date(),
      });
    }
  }, [positionId, transactionType, enabled]);

  // Auto-check when position changes
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // Function to manually refresh availability
  const refresh = useCallback(() => {
    checkAvailability();
  }, [checkAvailability]);

  // Function to reset status
  const reset = useCallback(() => {
    setStatus(initialStatus);
  }, []);

  return {
    ...status,
    refresh,
    reset,
    // Convenience getter for form validation
    canProceed: !status.isLoading && status.hasAvailableSeat,
    // Convenience getter for blocking submission
    isBlocked: !status.isLoading && !status.hasAvailableSeat && !!positionId,
  };
}

/**
 * Utility function to validate seat availability before transaction submission.
 * Returns true if the transaction can proceed, false otherwise.
 */
export async function validateSeatAvailability(
  positionId: string,
  transactionType: string
): Promise<{ valid: boolean; error: string | null; availableSeats: number }> {
  try {
    const { data, error } = await supabase
      .from("seat_occupancy_summary")
      .select("seat_id, allocation_status, is_shared_seat, current_occupant_count, max_occupants")
      .eq("position_id", positionId);

    if (error) {
      return { valid: false, error: "Failed to check seat availability", availableSeats: 0 };
    }

    const seats = data || [];
    const availableSeats = seats.filter(seat => 
      seat.allocation_status === "VACANT" || 
      (seat.is_shared_seat && (seat.current_occupant_count || 0) < (seat.max_occupants || 1))
    );

    if (availableSeats.length === 0) {
      const transactionLabel = transactionType?.toLowerCase() || "transaction";
      return { 
        valid: false, 
        error: `No available seats in the destination position. The ${transactionLabel} cannot proceed.`,
        availableSeats: 0,
      };
    }

    return { valid: true, error: null, availableSeats: availableSeats.length };
  } catch (err) {
    return { valid: false, error: "Failed to check seat availability", availableSeats: 0 };
  }
}
