import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShiftSwapRequest {
  id: string;
  company_id: string;
  requester_id: string;
  requester_shift_assignment_id: string;
  target_employee_id: string | null;
  target_shift_assignment_id: string | null;
  swap_date: string;
  reason: string | null;
  status: string;
  target_response: string | null;
  target_responded_at: string | null;
  manager_id: string | null;
  manager_notes: string | null;
  manager_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  requester?: { full_name: string } | null;
  target_employee?: { full_name: string } | null;
  manager?: { full_name: string } | null;
  requester_assignment?: { shift: { name: string; code: string } | null } | null;
  target_assignment?: { shift: { name: string; code: string } | null } | null;
}

export function useShiftSwapRequests(companyId: string | null) {
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSwapRequests = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shift_swap_requests")
        .select(`
          *,
          requester:profiles!shift_swap_requests_requester_id_fkey(full_name),
          target_employee:profiles!shift_swap_requests_target_employee_id_fkey(full_name),
          manager:profiles!shift_swap_requests_manager_id_fkey(full_name),
          requester_assignment:employee_shift_assignments!shift_swap_requests_requester_shift_assignment_id_fkey(
            shift:shifts(name, code)
          ),
          target_assignment:employee_shift_assignments!shift_swap_requests_target_shift_assignment_id_fkey(
            shift:shifts(name, code)
          )
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSwapRequests(data || []);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      toast.error("Failed to load swap requests");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSwapRequests();
  }, [fetchSwapRequests]);

  const createSwapRequest = async (data: {
    requester_id: string;
    requester_shift_assignment_id: string;
    target_employee_id?: string;
    target_shift_assignment_id?: string;
    swap_date: string;
    reason?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: newRequest, error } = await supabase
        .from("shift_swap_requests")
        .insert({
          company_id: companyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Swap request created");
      fetchSwapRequests();
      return newRequest;
    } catch (error) {
      console.error("Error creating swap request:", error);
      toast.error("Failed to create swap request");
      return null;
    }
  };

  const updateSwapRequestStatus = async (
    id: string, 
    status: string, 
    notes?: string,
    isManager = false
  ) => {
    try {
      const updateData: Record<string, unknown> = { status };
      
      if (isManager) {
        updateData.manager_notes = notes;
        updateData.manager_reviewed_at = new Date().toISOString();
      } else {
        updateData.target_response = notes;
        updateData.target_responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("shift_swap_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      toast.success(`Request ${status}`);
      fetchSwapRequests();
    } catch (error) {
      console.error("Error updating swap request:", error);
      toast.error("Failed to update request");
    }
  };

  return {
    swapRequests,
    isLoading,
    fetchSwapRequests,
    createSwapRequest,
    updateSwapRequestStatus,
  };
}
