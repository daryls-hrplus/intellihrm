import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OpenShift {
  id: string;
  company_id: string;
  shift_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  positions_available: number;
  positions_filled: number;
  department_id: string | null;
  location_name: string | null;
  required_skills: string[] | null;
  hourly_rate_override: number | null;
  premium_rate: number | null;
  notes: string | null;
  posted_by: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  shift?: { name: string; code: string; color: string } | null;
  department?: { name: string } | null;
  poster?: { full_name: string } | null;
  claims?: OpenShiftClaim[];
}

export interface OpenShiftClaim {
  id: string;
  employee_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  employee?: { full_name: string } | null;
}

export function useOpenShifts(companyId: string | null) {
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOpenShifts = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("open_shifts")
        .select(`
          *,
          shift:shifts(name, code, color),
          department:departments(name),
          poster:profiles!open_shifts_posted_by_fkey(full_name),
          claims:open_shift_claims(
            id,
            employee_id,
            status,
            notes,
            created_at,
            employee:profiles!open_shift_claims_employee_id_fkey(full_name)
          )
        `)
        .eq("company_id", companyId)
        .order("shift_date", { ascending: true });

      if (error) throw error;
      setOpenShifts(data || []);
    } catch (error) {
      console.error("Error fetching open shifts:", error);
      toast.error("Failed to load open shifts");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchOpenShifts();
  }, [fetchOpenShifts]);

  const createOpenShift = async (data: {
    shift_id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    positions_available: number;
    department_id?: string;
    location_name?: string;
    required_skills?: string[];
    hourly_rate_override?: number;
    premium_rate?: number;
    notes?: string;
    expires_at?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newShift, error } = await supabase
        .from("open_shifts")
        .insert({
          company_id: companyId,
          posted_by: user?.user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Open shift posted");
      fetchOpenShifts();
      return newShift;
    } catch (error) {
      console.error("Error creating open shift:", error);
      toast.error("Failed to post open shift");
      return null;
    }
  };

  const claimOpenShift = async (openShiftId: string, notes?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("open_shift_claims")
        .insert({
          open_shift_id: openShiftId,
          employee_id: user.user.id,
          notes,
        });

      if (error) throw error;
      toast.success("Shift claim submitted");
      fetchOpenShifts();
    } catch (error: unknown) {
      console.error("Error claiming shift:", error);
      const errorMessage = error instanceof Error && error.message.includes("duplicate") 
        ? "You have already claimed this shift" 
        : "Failed to claim shift";
      toast.error(errorMessage);
    }
  };

  const reviewClaim = async (
    claimId: string, 
    status: "approved" | "rejected",
    reviewNotes?: string
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("open_shift_claims")
        .update({
          status,
          reviewed_by: user?.user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq("id", claimId);

      if (error) throw error;

      // If approved, increment positions_filled
      if (status === "approved") {
        const claim = openShifts
          .flatMap(s => s.claims || [])
          .find(c => c.id === claimId);
        
        if (claim) {
          const shift = openShifts.find(s => s.id === claim.open_shift_id);
          if (shift) {
            const newFilled = shift.positions_filled + 1;
            await supabase
              .from("open_shifts")
              .update({ 
                positions_filled: newFilled,
                status: newFilled >= shift.positions_available ? "filled" : "open"
              })
              .eq("id", shift.id);
          }
        }
      }

      toast.success(`Claim ${status}`);
      fetchOpenShifts();
    } catch (error) {
      console.error("Error reviewing claim:", error);
      toast.error("Failed to review claim");
    }
  };

  const cancelOpenShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from("open_shifts")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Open shift cancelled");
      fetchOpenShifts();
    } catch (error) {
      console.error("Error cancelling shift:", error);
      toast.error("Failed to cancel shift");
    }
  };

  return {
    openShifts,
    isLoading,
    fetchOpenShifts,
    createOpenShift,
    claimOpenShift,
    reviewClaim,
    cancelOpenShift,
  };
}
