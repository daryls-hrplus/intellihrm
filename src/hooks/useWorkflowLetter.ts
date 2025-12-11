import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WorkflowLetter {
  id: string;
  workflow_instance_id: string;
  template_id: string;
  employee_id: string;
  generated_content: string;
  variable_values: Record<string, string>;
  status: "draft" | "pending_signatures" | "signed" | "cancelled";
  verification_code: string;
  final_pdf_url: string | null;
  created_at: string;
  signed_at: string | null;
}

export function useWorkflowLetter() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createLetter = useCallback(async (
    workflowInstanceId: string,
    templateId: string,
    employeeId: string,
    generatedContent: string,
    variableValues: Record<string, string>
  ): Promise<WorkflowLetter | null> => {
    if (!user) {
      toast.error("You must be logged in");
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("workflow_letters")
        .insert({
          workflow_instance_id: workflowInstanceId,
          template_id: templateId,
          employee_id: employeeId,
          generated_content: generatedContent,
          variable_values: variableValues,
          status: "draft",
          created_by: user.id,
          verification_code: `VER-${Date.now().toString(36).toUpperCase()}`,
        } as any)
        .select()
        .single();

      if (error) throw error;

      return data as unknown as WorkflowLetter;
    } catch (error) {
      console.error("Error creating workflow letter:", error);
      toast.error("Failed to create letter");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateLetterStatus = useCallback(async (
    letterId: string,
    status: WorkflowLetter["status"]
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updateData: any = { status };
      
      if (status === "signed") {
        updateData.signed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("workflow_letters")
        .update(updateData)
        .eq("id", letterId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating letter status:", error);
      toast.error("Failed to update letter status");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLetter = useCallback(async (
    workflowInstanceId: string
  ): Promise<WorkflowLetter | null> => {
    try {
      const { data, error } = await supabase
        .from("workflow_letters")
        .select("*")
        .eq("workflow_instance_id", workflowInstanceId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as unknown as WorkflowLetter | null;
    } catch (error) {
      console.error("Error fetching workflow letter:", error);
      return null;
    }
  }, []);

  const getLetterWithSignatures = useCallback(async (
    workflowInstanceId: string
  ) => {
    try {
      const [letterRes, signaturesRes] = await Promise.all([
        supabase
          .from("workflow_letters")
          .select(`
            *,
            template:letter_templates(name, subject),
            employee:profiles!workflow_letters_employee_id_fkey(full_name, email)
          `)
          .eq("workflow_instance_id", workflowInstanceId)
          .single(),
        supabase
          .from("workflow_signatures")
          .select("*")
          .eq("instance_id", workflowInstanceId)
          .order("signed_at", { ascending: true }),
      ]);

      return {
        letter: letterRes.data,
        signatures: signaturesRes.data || [],
      };
    } catch (error) {
      console.error("Error fetching letter with signatures:", error);
      return { letter: null, signatures: [] };
    }
  }, []);

  const verifyLetter = useCallback(async (
    verificationCode: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("workflow_letters")
        .select(`
          *,
          template:letter_templates(name, subject),
          employee:profiles!workflow_letters_employee_id_fkey(full_name, email)
        `)
        .eq("verification_code", verificationCode)
        .single();

      if (error) throw error;

      // Get signatures
      const { data: signatures } = await supabase
        .from("workflow_signatures")
        .select("*")
        .eq("instance_id", data.workflow_instance_id)
        .order("signed_at", { ascending: true });

      return {
        valid: true,
        letter: data,
        signatures: signatures || [],
      };
    } catch (error) {
      return {
        valid: false,
        letter: null,
        signatures: [],
      };
    }
  }, []);

  return {
    isLoading,
    createLetter,
    updateLetterStatus,
    getLetter,
    getLetterWithSignatures,
    verifyLetter,
  };
}