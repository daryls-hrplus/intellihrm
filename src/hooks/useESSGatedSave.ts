import { useState, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useApprovalPolicyLookup, ApprovalMode } from "@/hooks/useESSApprovalPolicy";

export type ESSRequestType = 
  | 'personal_contact' 
  | 'emergency_contact' 
  | 'address' 
  | 'qualification'
  | 'banking'
  | 'name_change'
  | 'dependent'
  | 'government_id'
  | 'medical_info'
  | 'marital_status';

export interface GatedSaveOptions {
  currentValues: Record<string, any> | null;
  newValues: Record<string, any>;
  notes?: string;
  documentUrls?: string[];
}

export interface GatedSaveResult {
  saved: boolean;           // Was data saved directly?
  requestCreated: boolean;  // Was a change request created?
  requestId?: string;       // ID of created request
}

export interface UseESSGatedSaveProps {
  requestType: ESSRequestType;
  entityId: string | null;
  entityTable: string;
  changeAction: 'create' | 'update' | 'delete';
  onDirectSave: (newValues: Record<string, any>) => Promise<void>;
  employeeId?: string;
}

export function useESSGatedSave({
  requestType,
  entityId,
  entityTable,
  changeAction,
  onDirectSave,
  employeeId: propEmployeeId,
}: UseESSGatedSaveProps) {
  const { user, profile, isAdmin, isHRManager, company } = useAuth();
  const queryClient = useQueryClient();
  const employeeId = propEmployeeId || profile?.id || "";
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get approval policy for this request type
  const { 
    approvalMode, 
    requiresDocumentation, 
    notificationOnly,
    policy
  } = useApprovalPolicyLookup(requestType);

  // Check if user can directly edit (HR/Admin)
  const canDirectEdit = isAdmin || isHRManager;

  // Fetch pending change requests for this employee
  const { data: pendingRequests, refetch: refetchPending } = useQuery({
    queryKey: ["pending-change-requests", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from("employee_data_change_requests")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("status", "pending");
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Check if there's a pending request for the specific entity
  const hasPendingRequest = useCallback((checkEntityId: string | null, checkEntityTable: string) => {
    if (!pendingRequests) return false;
    return pendingRequests.some(
      (req) => req.entity_id === checkEntityId && req.entity_table === checkEntityTable
    );
  }, [pendingRequests]);

  // Get pending request for a specific entity
  const getPendingRequest = useCallback((checkEntityId: string | null, checkEntityTable: string) => {
    if (!pendingRequests) return null;
    return pendingRequests.find(
      (req) => req.entity_id === checkEntityId && req.entity_table === checkEntityTable
    );
  }, [pendingRequests]);

  // Check if THIS entity has a pending request
  const isPending = hasPendingRequest(entityId, entityTable);

  // Determine if approval is required based on policy
  const requiresApproval = !canDirectEdit && 
    (approvalMode === 'hr_review' || approvalMode === 'workflow');

  // Should show document upload (for HR Review or Workflow modes, docs required or optional)
  const showDocumentUpload = !canDirectEdit && 
    (approvalMode === 'hr_review' || approvalMode === 'workflow');

  // Is documentation optional (vs required)?
  const isDocumentationOptional = !requiresDocumentation;

  // Submit change request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (data: {
      currentValues: Record<string, any> | null;
      newValues: Record<string, any>;
      notes?: string;
      documentUrls?: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const payload = {
        employee_id: employeeId,
        company_id: company?.id || null,
        request_type: requestType,
        entity_id: entityId || null,
        entity_table: entityTable,
        change_action: changeAction,
        current_values: data.currentValues || null,
        new_values: {
          ...data.newValues,
          ...(data.notes ? { _notes: data.notes } : {}),
          ...(data.documentUrls?.length ? { _document_urls: data.documentUrls } : {}),
        },
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
    },
  });

  // Log for HR notification (auto-approve + notify)
  const logForNotification = useMutation({
    mutationFn: async (data: {
      currentValues: Record<string, any> | null;
      newValues: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const payload = {
        employee_id: employeeId,
        company_id: company?.id || null,
        request_type: requestType,
        entity_id: entityId || null,
        entity_table: entityTable,
        change_action: changeAction,
        current_values: data.currentValues || null,
        new_values: data.newValues,
        status: 'applied', // Already applied since auto-approve
        requested_by: user.id,
        reviewed_at: new Date().toISOString(),
        applied_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("employee_data_change_requests")
        .insert(payload);
      
      if (error) throw error;
    },
  });

  /**
   * Main gated save function
   * Routes to either direct save or change request based on policy
   */
  const gatedSave = async (options: GatedSaveOptions): Promise<GatedSaveResult> => {
    const { currentValues, newValues, notes, documentUrls } = options;
    
    setIsSubmitting(true);
    
    try {
      // Case 1: User can directly edit (HR/Admin) - always save directly
      if (canDirectEdit) {
        await onDirectSave(newValues);
        toast.success("Changes saved successfully");
        return { saved: true, requestCreated: false };
      }

      // Case 2: Auto-approve policy
      if (approvalMode === 'auto_approve') {
        await onDirectSave(newValues);
        
        // If notification is enabled, log for HR visibility
        if (notificationOnly) {
          await logForNotification.mutateAsync({ currentValues, newValues });
          toast.success("Changes saved - HR has been notified");
        } else {
          toast.success("Changes saved successfully");
        }
        
        return { saved: true, requestCreated: notificationOnly };
      }

      // Case 3: HR Review or Workflow - submit change request
      // Check if documentation is required but not provided
      if (requiresDocumentation && (!documentUrls || documentUrls.length === 0)) {
        toast.error("Supporting documentation is required for this change");
        return { saved: false, requestCreated: false };
      }

      const result = await submitRequestMutation.mutateAsync({
        currentValues,
        newValues,
        notes,
        documentUrls,
      });

      toast.success("Change request submitted for approval", {
        description: approvalMode === 'workflow' 
          ? "Your request will go through the approval workflow."
          : "HR will review your request shortly."
      });

      return { saved: false, requestCreated: true, requestId: result.id };
    } catch (error) {
      console.error("Gated save error:", error);
      toast.error("Failed to save changes");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Core state
    isPending,
    requiresApproval,
    requiresDocumentation,
    isDocumentationOptional,
    approvalMode,
    notifyHR: notificationOnly,
    canDirectEdit,
    policy,
    
    // Actions
    gatedSave,
    refetchPending,
    
    // UI helpers
    showDocumentUpload,
    isSubmitting,
    
    // Utility functions
    hasPendingRequest,
    getPendingRequest,
    pendingRequests,
  };
}
