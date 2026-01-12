import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WorkflowInstanceData {
  id: string;
  template_id: string;
  status: string;
  current_step_order: number;
  reference_type: string;
  reference_id: string;
}

interface WorkflowStepData {
  id: string;
  template_id: string;
  step_order: number;
  name: string;
  requires_signature: boolean;
  requires_comment: boolean;
}

interface WorkflowSignature {
  id: string;
  signer_id: string;
  signature_text: string | null;
  signature_hash: string | null;
  ip_address: string | null;
  signed_at: string | null;
  signer_name?: string;
}

interface AcknowledgmentWorkflow {
  workflowInstance: WorkflowInstanceData | null;
  currentStep: WorkflowStepData | null;
  signature: WorkflowSignature | null;
  isLoading: boolean;
  isSubmitting: boolean;
  hasWorkflow: boolean;
  submitAcknowledgment: (options: {
    signatureText: string;
    comments?: string;
  }) => Promise<boolean>;
}

const APPRAISAL_ACKNOWLEDGMENT_TEMPLATE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useAppraisalAcknowledgmentWorkflow(participantId: string): AcknowledgmentWorkflow {
  const { user } = useAuth();
  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstanceData | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStepData | null>(null);
  const [signature, setSignature] = useState<WorkflowSignature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch workflow instance linked to this appraisal participant
  const fetchWorkflow = useCallback(async () => {
    if (!participantId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check for workflow by reference
      const { data: instances } = await supabase
        .from("workflow_instances")
        .select("id, template_id, status, current_step_order, reference_type, reference_id")
        .eq("reference_type", "appraisal_participant")
        .eq("reference_id", participantId)
        .eq("template_id", APPRAISAL_ACKNOWLEDGMENT_TEMPLATE_ID)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!instances || instances.length === 0) {
        setWorkflowInstance(null);
        setCurrentStep(null);
        setIsLoading(false);
        return;
      }

      const instance = instances[0];
      setWorkflowInstance({
        id: instance.id,
        template_id: instance.template_id,
        status: instance.status,
        current_step_order: instance.current_step_order ?? 1,
        reference_type: instance.reference_type ?? '',
        reference_id: instance.reference_id ?? '',
      });

      // Fetch the current step
      const { data: step } = await supabase
        .from("workflow_steps")
        .select("id, template_id, step_order, name, requires_signature, requires_comment")
        .eq("template_id", instance.template_id)
        .eq("step_order", instance.current_step_order ?? 1)
        .single();

      if (step) {
        setCurrentStep({
          id: step.id,
          template_id: step.template_id,
          step_order: step.step_order,
          name: step.name,
          requires_signature: step.requires_signature ?? false,
          requires_comment: step.requires_comment ?? false,
        });
      }

      // Check if already signed
      const { data: signatures } = await supabase
        .from("workflow_signatures")
        .select("id, signer_id, signature_text, signature_hash, ip_address, signed_at, signer_name")
        .eq("instance_id", instance.id)
        .order("signed_at", { ascending: false })
        .limit(1);

      if (signatures && signatures.length > 0) {
        const sig = signatures[0];
        setSignature({
          id: sig.id,
          signer_id: sig.signer_id,
          signature_text: sig.signature_text,
          signature_hash: sig.signature_hash,
          ip_address: sig.ip_address,
          signed_at: sig.signed_at,
          signer_name: sig.signer_name ?? undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching acknowledgment workflow:", error);
    } finally {
      setIsLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  // Submit acknowledgment with digital signature
  const submitAcknowledgment = useCallback(async (options: {
    signatureText: string;
    comments?: string;
  }): Promise<boolean> => {
    if (!user || !workflowInstance || !currentStep) {
      toast.error("Unable to submit acknowledgment");
      return false;
    }

    setIsSubmitting(true);
    try {
      // Get user profile for signature name/email
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, first_last_name, email")
        .eq("id", user.id)
        .single();

      const signerName = profile 
        ? `${profile.first_name || ''} ${profile.first_last_name || ''}`.trim() 
        : options.signatureText;
      const signerEmail = profile?.email || user.email || '';

      // Create step action
      const { data: stepAction, error: actionError } = await supabase
        .from("workflow_step_actions")
        .insert({
          instance_id: workflowInstance.id,
          step_id: currentStep.id,
          step_order: currentStep.step_order,
          actor_id: user.id,
          action: "approve" as const,
          comment: options.comments || "Appraisal acknowledged",
          acted_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (actionError) throw actionError;

      // Generate signature hash
      const signatureData = `${options.signatureText}|${user.id}|${new Date().toISOString()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signatureHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Get IP address (client-side approximation)
      let ipAddress = 'unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const ipData = await response.json();
        ipAddress = ipData.ip;
      } catch {
        ipAddress = 'client-unavailable';
      }

      // Create workflow signature
      const { error: sigError } = await supabase
        .from("workflow_signatures")
        .insert({
          instance_id: workflowInstance.id,
          step_action_id: stepAction.id,
          signer_id: user.id,
          signer_name: signerName,
          signer_email: signerEmail,
          signature_text: options.signatureText,
          signature_hash: signatureHash,
          ip_address: ipAddress,
          signed_at: new Date().toISOString(),
        });

      if (sigError) throw sigError;

      // Check if this was the last required step
      const { data: steps } = await supabase
        .from("workflow_steps")
        .select("step_order")
        .eq("template_id", workflowInstance.template_id)
        .eq("is_active", true)
        .order("step_order", { ascending: false })
        .limit(1);

      const lastStepOrder = steps?.[0]?.step_order || 1;
      const isLastStep = workflowInstance.current_step_order >= lastStepOrder;

      // Update workflow instance
      const { error: instanceError } = await supabase
        .from("workflow_instances")
        .update({
          status: isLastStep ? "approved" : "in_progress",
          current_step_order: isLastStep ? workflowInstance.current_step_order : workflowInstance.current_step_order + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workflowInstance.id);

      if (instanceError) throw instanceError;

      // The trigger will update the appraisal participant status
      toast.success("Appraisal acknowledged successfully with digital signature");
      await fetchWorkflow();
      return true;
    } catch (error: any) {
      console.error("Error submitting acknowledgment:", error);
      toast.error(error.message || "Failed to submit acknowledgment");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, workflowInstance, currentStep, fetchWorkflow]);

  return {
    workflowInstance,
    currentStep,
    signature,
    isLoading,
    isSubmitting,
    hasWorkflow: !!workflowInstance,
    submitAcknowledgment,
  };
}
