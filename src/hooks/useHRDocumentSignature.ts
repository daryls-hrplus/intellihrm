import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowLetter } from "@/hooks/useWorkflowLetter";
import { toast } from "sonner";

export type HRDocumentType = 
  | "pip" 
  | "disciplinary" 
  | "promotion" 
  | "compensation" 
  | "termination";

export interface HRDocumentSignatureRequest {
  documentType: HRDocumentType;
  employeeId: string;
  employeeName: string;
  variables: Record<string, string>;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface PendingSignature {
  id: string;
  instanceId: string;
  documentType: string;
  documentName: string;
  employeeId: string;
  employeeName: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  letterContent?: string;
  verificationCode?: string;
}

const WORKFLOW_CODE_MAP: Record<HRDocumentType, string> = {
  pip: "PIP_ACKNOWLEDGMENT",
  disciplinary: "DISCIPLINARY_ACKNOWLEDGMENT",
  promotion: "PROMOTION_ACKNOWLEDGMENT",
  compensation: "COMPENSATION_ACKNOWLEDGMENT",
  termination: "DISCIPLINARY_ACKNOWLEDGMENT", // Reuse disciplinary workflow
};

const DOCUMENT_NAME_MAP: Record<HRDocumentType, string> = {
  pip: "Performance Improvement Plan",
  disciplinary: "Disciplinary Warning",
  promotion: "Promotion Letter",
  compensation: "Compensation Change",
  termination: "Termination Notice",
};

export function useHRDocumentSignature() {
  const { user, profile } = useAuth();
  const { startWorkflow, takeAction, getInstanceById } = useWorkflow();
  const { createLetter, getLetter, getLetterWithSignatures, verifyLetter } = useWorkflowLetter();
  const [isLoading, setIsLoading] = useState(false);

  // Initiate a new HR document signature workflow
  const initiateSignature = useCallback(async (
    request: HRDocumentSignatureRequest
  ): Promise<string | null> => {
    if (!user || !profile) {
      toast.error("You must be logged in");
      return null;
    }

    setIsLoading(true);
    try {
      const workflowCode = WORKFLOW_CODE_MAP[request.documentType];
      
      // Get workflow template to check if letter is required
      const { data: template } = await supabase
        .from("workflow_templates")
        .select("*, letter_template:letter_templates(*)")
        .eq("code", workflowCode)
        .eq("is_active", true)
        .single();

      if (!template) {
        throw new Error(`Workflow template not found: ${workflowCode}`);
      }

      // Start the workflow
      const instance = await startWorkflow(
        workflowCode,
        request.referenceType || "hr_document",
        request.referenceId || crypto.randomUUID(),
        {
          documentType: request.documentType,
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          ...request.metadata,
        }
      );

      if (!instance) {
        throw new Error("Failed to create workflow instance");
      }

      // If letter template exists, generate the letter
      if (template.requires_letter && template.letter_template) {
        let letterContent = template.letter_template.body_template;
        
        // Replace variables
        Object.entries(request.variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, "g");
          letterContent = letterContent.replace(regex, value || `[${key}]`);
        });

        await createLetter(
          instance.id,
          template.letter_template.id,
          request.employeeId,
          letterContent,
          request.variables
        );
      }

      toast.success("Document sent for signature");
      return instance.id;
    } catch (error) {
      console.error("Error initiating signature:", error);
      toast.error("Failed to initiate signature request");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, startWorkflow, createLetter]);

  // Sign a document (employee acknowledgment)
  const signDocument = useCallback(async (
    instanceId: string,
    signatureText: string,
    comment?: string
  ): Promise<boolean> => {
    if (!user || !profile) {
      toast.error("You must be logged in");
      return false;
    }

    setIsLoading(true);
    try {
      // Get instance details
      const instance = await getInstanceById(instanceId);
      if (!instance) {
        throw new Error("Workflow instance not found");
      }

      // Create signature hash
      const signatureData = `${user.id}:${signatureText}:${new Date().toISOString()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureData);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signatureHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      // Get IP address (simplified - in production use edge function)
      let ipAddress = "unknown";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        // Ignore IP fetch errors
      }

      // Record the signature
      const { error: signatureError } = await supabase
        .from("workflow_signatures")
        .insert({
          instance_id: instanceId,
          step_action_id: instance.current_step_id,
          signer_id: user.id,
          signer_name: profile.full_name || profile.email,
          signer_email: profile.email,
          signer_position: profile.position_title,
          signature_text: signatureText,
          signature_hash: signatureHash,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
        });

      if (signatureError) {
        console.error("Signature insert error:", signatureError);
        // Continue anyway - the approval is more important
      }

      // Approve the workflow step
      const result = await takeAction(instanceId, "approve", { comment });

      if (result) {
        // Update letter status if exists
        const letter = await getLetter(instanceId);
        if (letter) {
          await supabase
            .from("workflow_letters")
            .update({ status: "signed", signed_at: new Date().toISOString() })
            .eq("id", letter.id);
        }

        toast.success("Document signed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error signing document:", error);
      toast.error("Failed to sign document");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, getInstanceById, takeAction, getLetter]);

  // Get pending signatures for current user
  const getPendingSignatures = useCallback(async (): Promise<PendingSignature[]> => {
    if (!user) return [];

    try {
      // Get workflow instances where current user is the subject
      const { data: instances, error } = await supabase
        .from("workflow_instances")
        .select(`
          id,
          category,
          status,
          initiated_at,
          deadline_at,
          metadata,
          template:workflow_templates(name, code, category)
        `)
        .in("status", ["pending", "in_progress"])
        .eq("metadata->>employeeId", user.id)
        .order("initiated_at", { ascending: false });

      if (error) throw error;

      const pendingSignatures: PendingSignature[] = [];

      for (const instance of instances || []) {
        const metadata = instance.metadata as Record<string, unknown>;
        const letter = await getLetter(instance.id);

        pendingSignatures.push({
          id: instance.id,
          instanceId: instance.id,
          documentType: (metadata?.documentType as string) || instance.category,
          documentName: instance.template?.name || "HR Document",
          employeeId: (metadata?.employeeId as string) || user.id,
          employeeName: (metadata?.employeeName as string) || "",
          status: instance.status,
          createdAt: instance.initiated_at,
          dueDate: instance.deadline_at || undefined,
          letterContent: letter?.generated_content,
          verificationCode: letter?.verification_code,
        });
      }

      return pendingSignatures;
    } catch (error) {
      console.error("Error fetching pending signatures:", error);
      return [];
    }
  }, [user, getLetter]);

  // Get all pending signatures for HR view
  const getAllPendingSignatures = useCallback(async (): Promise<PendingSignature[]> => {
    if (!user) return [];

    try {
      const { data: instances, error } = await supabase
        .from("workflow_instances")
        .select(`
          id,
          category,
          status,
          initiated_at,
          deadline_at,
          metadata,
          template:workflow_templates(name, code, category, requires_signature)
        `)
        .in("status", ["pending", "in_progress"])
        .eq("template.requires_signature", true)
        .order("initiated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const pendingSignatures: PendingSignature[] = [];

      for (const instance of instances || []) {
        if (!instance.template?.requires_signature) continue;
        
        const metadata = instance.metadata as Record<string, unknown>;

        pendingSignatures.push({
          id: instance.id,
          instanceId: instance.id,
          documentType: (metadata?.documentType as string) || instance.category,
          documentName: instance.template?.name || "HR Document",
          employeeId: (metadata?.employeeId as string) || "",
          employeeName: (metadata?.employeeName as string) || "",
          status: instance.status,
          createdAt: instance.initiated_at,
          dueDate: instance.deadline_at || undefined,
        });
      }

      return pendingSignatures;
    } catch (error) {
      console.error("Error fetching all pending signatures:", error);
      return [];
    }
  }, [user]);

  // Get signature audit trail
  const getSignatureAuditTrail = useCallback(async (instanceId: string) => {
    return getLetterWithSignatures(instanceId);
  }, [getLetterWithSignatures]);

  // Verify a document by code
  const verifyDocument = useCallback(async (verificationCode: string) => {
    return verifyLetter(verificationCode);
  }, [verifyLetter]);

  return {
    isLoading,
    initiateSignature,
    signDocument,
    getPendingSignatures,
    getAllPendingSignatures,
    getSignatureAuditTrail,
    verifyDocument,
  };
}
