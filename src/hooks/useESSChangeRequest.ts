import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChangeRequestData {
  request_type: 'personal_contact' | 'emergency_contact' | 'address' | 'qualification';
  entity_id?: string | null;
  entity_table: string;
  change_action: 'create' | 'update' | 'delete';
  current_values?: Record<string, any> | null;
  new_values: Record<string, any>;
}

export function useESSChangeRequest(employeeId: string) {
  const { user, company, isAdmin, isHRManager } = useAuth();
  const queryClient = useQueryClient();
  
  // Check if user is HR or Admin - they can make direct changes
  const canDirectEdit = isAdmin || isHRManager;

  // Fetch pending change requests for this employee
  const { data: pendingRequests } = useQuery({
    queryKey: ["pending-change-requests", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_data_change_requests")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("status", "pending");
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const submitChangeRequest = useMutation({
    mutationFn: async (data: ChangeRequestData) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const payload = {
        employee_id: employeeId,
        company_id: company?.id || null,
        request_type: data.request_type,
        entity_id: data.entity_id || null,
        entity_table: data.entity_table,
        change_action: data.change_action,
        current_values: data.current_values || null,
        new_values: data.new_values,
        status: 'pending',
        requested_by: user.id,
      };

      const { data: result, error } = await supabase
        .from("employee_data_change_requests")
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-change-requests", employeeId] });
      toast.success("Change request submitted for approval", {
        description: "HR will review your request shortly."
      });
    },
    onError: (error) => {
      console.error("Change request error:", error);
      toast.error("Failed to submit change request");
    },
  });

  // Check if there's a pending request for a specific entity
  const hasPendingRequest = (entityId: string | null, entityTable: string) => {
    if (!pendingRequests) return false;
    return pendingRequests.some(
      (req) => req.entity_id === entityId && req.entity_table === entityTable
    );
  };

  // Get pending request for a specific entity
  const getPendingRequest = (entityId: string | null, entityTable: string) => {
    if (!pendingRequests) return null;
    return pendingRequests.find(
      (req) => req.entity_id === entityId && req.entity_table === entityTable
    );
  };

  return {
    canDirectEdit,
    submitChangeRequest,
    pendingRequests,
    hasPendingRequest,
    getPendingRequest,
    isSubmitting: submitChangeRequest.isPending,
  };
}
