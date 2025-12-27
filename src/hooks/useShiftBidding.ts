import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShiftBiddingPeriod {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  schedule_start_date: string;
  schedule_end_date: string;
  bidding_opens_at: string;
  bidding_closes_at: string;
  allocation_method: string;
  department_id: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  department?: { name: string } | null;
  bids?: ShiftBid[];
}

export interface ShiftBid {
  id: string;
  bidding_period_id: string;
  employee_id: string;
  shift_id: string;
  preference_rank: number;
  notes: string | null;
  status: string;
  allocated_at: string | null;
  created_at: string;
  employee?: { full_name: string } | null;
  shift?: { name: string; code: string; start_time: string; end_time: string } | null;
}

export function useShiftBidding(companyId: string | null) {
  const [biddingPeriods, setBiddingPeriods] = useState<ShiftBiddingPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBiddingPeriods = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shift_bidding_periods")
        .select(`
          *,
          department:departments(name),
          bids:shift_bids(
            id,
            employee_id,
            shift_id,
            preference_rank,
            notes,
            status,
            allocated_at,
            created_at,
            employee:profiles(full_name),
            shift:shifts(name, code, start_time, end_time)
          )
        `)
        .eq("company_id", companyId)
        .order("bidding_opens_at", { ascending: false });

      if (error) throw error;
      setBiddingPeriods(data || []);
    } catch (error) {
      console.error("Error fetching bidding periods:", error);
      toast.error("Failed to load bidding periods");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchBiddingPeriods();
  }, [fetchBiddingPeriods]);

  const createBiddingPeriod = async (data: {
    name: string;
    description?: string;
    schedule_start_date: string;
    schedule_end_date: string;
    bidding_opens_at: string;
    bidding_closes_at: string;
    allocation_method?: string;
    department_id?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newPeriod, error } = await supabase
        .from("shift_bidding_periods")
        .insert({
          company_id: companyId,
          created_by: user?.user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Bidding period created");
      fetchBiddingPeriods();
      return newPeriod;
    } catch (error) {
      console.error("Error creating bidding period:", error);
      toast.error("Failed to create bidding period");
      return null;
    }
  };

  const updateBiddingPeriodStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("shift_bidding_periods")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Bidding period ${status}`);
      fetchBiddingPeriods();
    } catch (error) {
      console.error("Error updating bidding period:", error);
      toast.error("Failed to update bidding period");
    }
  };

  const submitBid = async (data: {
    bidding_period_id: string;
    shift_id: string;
    preference_rank: number;
    notes?: string;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("shift_bids")
        .insert({
          employee_id: user.user.id,
          ...data,
        });

      if (error) throw error;
      toast.success("Bid submitted");
      fetchBiddingPeriods();
    } catch (error: unknown) {
      console.error("Error submitting bid:", error);
      const errorMessage = error instanceof Error && error.message.includes("duplicate")
        ? "You have already bid on this shift"
        : "Failed to submit bid";
      toast.error(errorMessage);
    }
  };

  const withdrawBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from("shift_bids")
        .update({ status: "withdrawn" })
        .eq("id", bidId);

      if (error) throw error;
      toast.success("Bid withdrawn");
      fetchBiddingPeriods();
    } catch (error) {
      console.error("Error withdrawing bid:", error);
      toast.error("Failed to withdraw bid");
    }
  };

  const allocateBids = async (periodId: string) => {
    try {
      // Get period and bids
      const period = biddingPeriods.find(p => p.id === periodId);
      if (!period) throw new Error("Period not found");

      const bids = period.bids || [];
      const submittedBids = bids.filter(b => b.status === "submitted");

      // Simple allocation by preference rank
      // In production, this would consider seniority, hours balance, etc.
      const allocatedEmployees = new Set<string>();
      const allocatedShifts = new Set<string>();

      // Sort by preference rank
      const sortedBids = [...submittedBids].sort((a, b) => a.preference_rank - b.preference_rank);

      for (const bid of sortedBids) {
        if (!allocatedEmployees.has(bid.employee_id) && !allocatedShifts.has(bid.shift_id)) {
          await supabase
            .from("shift_bids")
            .update({ 
              status: "allocated",
              allocated_at: new Date().toISOString()
            })
            .eq("id", bid.id);
          
          allocatedEmployees.add(bid.employee_id);
          allocatedShifts.add(bid.shift_id);
        }
      }

      // Mark remaining bids as not allocated
      const notAllocated = sortedBids.filter(
        b => !allocatedEmployees.has(b.employee_id) || allocatedShifts.has(b.shift_id)
      );

      for (const bid of notAllocated) {
        if (bid.status === "submitted") {
          await supabase
            .from("shift_bids")
            .update({ status: "not_allocated" })
            .eq("id", bid.id);
        }
      }

      // Update period status
      await supabase
        .from("shift_bidding_periods")
        .update({ status: "finalized" })
        .eq("id", periodId);

      toast.success("Bids allocated successfully");
      fetchBiddingPeriods();
    } catch (error) {
      console.error("Error allocating bids:", error);
      toast.error("Failed to allocate bids");
    }
  };

  return {
    biddingPeriods,
    isLoading,
    fetchBiddingPeriods,
    createBiddingPeriod,
    updateBiddingPeriodStatus,
    submitBid,
    withdrawBid,
    allocateBids,
  };
}
