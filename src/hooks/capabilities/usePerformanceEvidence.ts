import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export type EvidenceType = 
  | 'project' 
  | 'ticket' 
  | 'deliverable' 
  | 'customer_feedback'
  | 'kpi_extract' 
  | 'document' 
  | 'presentation' 
  | 'code_contribution'
  | 'award' 
  | 'recognition' 
  | 'metric_achievement';

export type EvidenceValidationStatus = 'pending' | 'validated' | 'rejected' | 'disputed';

// Multi-file attachment structure
export interface EvidenceAttachment {
  path: string;
  type: string;
  size: number;
  uploaded_at: string;
  filename: string;
}

export interface PerformanceEvidence {
  id: string;
  company_id: string | null;
  employee_id: string;
  evidence_type: EvidenceType;
  title: string;
  description: string | null;
  goal_id: string | null;
  capability_id: string | null;
  responsibility_id: string | null;
  appraisal_cycle_id: string | null;
  participant_id: string | null;
  score_item_id: string | null;
  source_system: string | null;
  external_reference_id: string | null;
  external_url: string | null;
  // Legacy single attachment fields (kept for backward compatibility)
  attachment_path: string | null;
  attachment_type: string | null;
  attachment_size_bytes: number | null;
  // New multi-file attachments array
  attachments: EvidenceAttachment[];
  submitted_by: string | null;
  submitted_at: string;
  validation_status: EvidenceValidationStatus;
  validated_by: string | null;
  validated_at: string | null;
  validation_notes: string | null;
  is_immutable: boolean;
  immutable_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  goal?: { title: string } | null;
  capability?: { name: string; code: string } | null;
  responsibility?: { name: string } | null;
  submitter?: { full_name: string } | null;
  validator?: { full_name: string } | null;
  appraisal_cycle?: { name: string } | null;
  appraisal_participant?: { id: string } | null;
}

export interface CreateEvidenceData {
  evidence_type: EvidenceType;
  title: string;
  description?: string;
  goal_id?: string;
  capability_id?: string;
  responsibility_id?: string;
  appraisal_cycle_id?: string;
  participant_id?: string;
  score_item_id?: string;
  source_system?: string;
  external_reference_id?: string;
  external_url?: string;
  // Legacy single file
  attachment_path?: string;
  attachment_type?: string;
  attachment_size_bytes?: number;
  // Multi-file attachments
  attachments?: EvidenceAttachment[];
}

export interface UpdateEvidenceData {
  title?: string;
  description?: string;
  external_url?: string;
  validation_status?: EvidenceValidationStatus;
  validation_notes?: string;
}

export interface EvidenceFilters {
  employee_id?: string;
  goal_id?: string;
  capability_id?: string;
  responsibility_id?: string;
  appraisal_cycle_id?: string;
  participant_id?: string;
  score_item_id?: string;
  validation_status?: EvidenceValidationStatus;
  evidence_type?: EvidenceType;
}

export function usePerformanceEvidence() {
  const { user, profile } = useAuth();
  const [evidence, setEvidence] = useState<PerformanceEvidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchEvidence = useCallback(async (filters: EvidenceFilters = {}) => {
    if (!user) return [];
    
    setLoading(true);
    try {
      let query = supabase
        .from("performance_evidence")
        .select(`
          *,
          goal:performance_goals(title),
          capability:skills_competencies(name, code),
          submitter:profiles!performance_evidence_submitted_by_fkey(full_name),
          validator:profiles!performance_evidence_validated_by_fkey(full_name),
          appraisal_cycle:appraisal_cycles(name),
          appraisal_participant:appraisal_participants(id)
        `)
        .order("submitted_at", { ascending: false });

      if (filters.employee_id) {
        query = query.eq("employee_id", filters.employee_id);
      }
      if (filters.goal_id) {
        query = query.eq("goal_id", filters.goal_id);
      }
      if (filters.capability_id) {
        query = query.eq("capability_id", filters.capability_id);
      }
      if (filters.responsibility_id) {
        query = query.eq("responsibility_id", filters.responsibility_id);
      }
      if (filters.appraisal_cycle_id) {
        query = query.eq("appraisal_cycle_id", filters.appraisal_cycle_id);
      }
      if (filters.participant_id) {
        query = query.eq("participant_id", filters.participant_id);
      }
      if (filters.score_item_id) {
        query = query.eq("score_item_id", filters.score_item_id);
      }
      if (filters.validation_status) {
        query = query.eq("validation_status", filters.validation_status);
      }
      if (filters.evidence_type) {
        query = query.eq("evidence_type", filters.evidence_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Parse JSONB attachments field from database
      const parsed = (data || []).map(item => ({
        ...item,
        attachments: (item.attachments || []) as unknown as EvidenceAttachment[],
      })) as PerformanceEvidence[];
      setEvidence(parsed);
      return parsed;
    } catch (error: any) {
      console.error("Error fetching evidence:", error);
      toast.error("Failed to load evidence");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createEvidence = useCallback(async (
    employeeId: string,
    data: CreateEvidenceData
  ): Promise<PerformanceEvidence | null> => {
    if (!user || !profile) return null;

    try {
      const { data: newEvidence, error } = await supabase
        .from("performance_evidence")
        .insert({
          company_id: profile.company_id,
          employee_id: employeeId,
          submitted_by: user.id,
          evidence_type: data.evidence_type,
          title: data.title,
          description: data.description,
          goal_id: data.goal_id,
          capability_id: data.capability_id,
          responsibility_id: data.responsibility_id,
          appraisal_cycle_id: data.appraisal_cycle_id,
          participant_id: data.participant_id,
          score_item_id: data.score_item_id,
          source_system: data.source_system,
          external_reference_id: data.external_reference_id,
          external_url: data.external_url,
          attachment_path: data.attachment_path,
          attachment_type: data.attachment_type,
          attachment_size_bytes: data.attachment_size_bytes,
          attachments: (data.attachments || []) as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Evidence submitted successfully");
      return {
        ...newEvidence,
        attachments: (newEvidence.attachments || []) as unknown as EvidenceAttachment[],
      } as PerformanceEvidence;
    } catch (error: any) {
      console.error("Error creating evidence:", error);
      toast.error("Failed to submit evidence");
      return null;
    }
  }, [user, profile]);

  const updateEvidence = useCallback(async (
    evidenceId: string,
    data: UpdateEvidenceData
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("performance_evidence")
        .update(data)
        .eq("id", evidenceId);

      if (error) throw error;
      
      toast.success("Evidence updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating evidence:", error);
      toast.error(error.message || "Failed to update evidence");
      return false;
    }
  }, []);

  const validateEvidence = useCallback(async (
    evidenceId: string,
    status: "validated" | "rejected",
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("performance_evidence")
        .update({
          validation_status: status,
          validated_by: user.id,
          validated_at: new Date().toISOString(),
          validation_notes: notes,
        })
        .eq("id", evidenceId);

      if (error) throw error;
      
      toast.success(`Evidence ${status === "validated" ? "validated" : "rejected"}`);
      return true;
    } catch (error: any) {
      console.error("Error validating evidence:", error);
      toast.error("Failed to validate evidence");
      return false;
    }
  }, [user]);

  const markImmutable = useCallback(async (evidenceId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("performance_evidence")
        .update({ is_immutable: true })
        .eq("id", evidenceId);

      if (error) throw error;
      
      toast.success("Evidence locked");
      return true;
    } catch (error: any) {
      console.error("Error marking evidence immutable:", error);
      toast.error("Failed to lock evidence");
      return false;
    }
  }, []);

  const uploadAttachment = useCallback(async (
    file: File,
    employeeId: string
  ): Promise<EvidenceAttachment | null> => {
    if (!user) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      // Path must be user.id/filename for RLS policy to work (foldername[1] = auth.uid())
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("performance-evidence")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return {
        path: filePath,
        type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString(),
        filename: file.name,
      };
    } catch (error: any) {
      console.error("Error uploading attachment:", error);
      toast.error("Failed to upload attachment");
      return null;
    } finally {
      setUploading(false);
    }
  }, [user]);

  // Upload multiple files and return array of attachments
  const uploadMultipleAttachments = useCallback(async (
    files: File[],
    employeeId: string,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<EvidenceAttachment[]> => {
    if (!user || files.length === 0) return [];

    const attachments: EvidenceAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadAttachment(file, employeeId);
      if (result) {
        attachments.push(result);
      }
      onProgress?.(i + 1, files.length);
    }

    return attachments;
  }, [user, uploadAttachment]);

  // Add attachment to existing evidence record
  const addAttachmentToEvidence = useCallback(async (
    evidenceId: string,
    file: File,
    employeeId: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // First get current attachments
      const { data: currentEvidence, error: fetchError } = await supabase
        .from("performance_evidence")
        .select("attachments")
        .eq("id", evidenceId)
        .single();

      if (fetchError) throw fetchError;

      // Upload new file
      const newAttachment = await uploadAttachment(file, employeeId);
      if (!newAttachment) return false;

      // Merge attachments
      const existingAttachments = (currentEvidence?.attachments || []) as unknown as EvidenceAttachment[];
      const updatedAttachments = [...existingAttachments, newAttachment];

      // Update record
      const { error: updateError } = await supabase
        .from("performance_evidence")
        .update({ attachments: updatedAttachments as unknown as Json[] })
        .eq("id", evidenceId);

      if (updateError) throw updateError;

      toast.success("Attachment added");
      return true;
    } catch (error: any) {
      console.error("Error adding attachment:", error);
      toast.error("Failed to add attachment");
      return false;
    }
  }, [user, uploadAttachment]);

  // Remove attachment from evidence record
  const removeAttachmentFromEvidence = useCallback(async (
    evidenceId: string,
    attachmentPath: string
  ): Promise<boolean> => {
    try {
      // Get current attachments
      const { data: currentEvidence, error: fetchError } = await supabase
        .from("performance_evidence")
        .select("attachments, is_immutable")
        .eq("id", evidenceId)
        .single();

      if (fetchError) throw fetchError;
      if (currentEvidence?.is_immutable) {
        toast.error("Cannot modify locked evidence");
        return false;
      }

      // Filter out the attachment
      const existingAttachments = (currentEvidence?.attachments || []) as unknown as EvidenceAttachment[];
      const updatedAttachments = existingAttachments.filter(a => a.path !== attachmentPath);

      // Update record
      const { error: updateError } = await supabase
        .from("performance_evidence")
        .update({ attachments: updatedAttachments as unknown as Json[] })
        .eq("id", evidenceId);

      if (updateError) throw updateError;

      // Delete from storage
      await supabase.storage.from("performance-evidence").remove([attachmentPath]);

      toast.success("Attachment removed");
      return true;
    } catch (error: any) {
      console.error("Error removing attachment:", error);
      toast.error("Failed to remove attachment");
      return false;
    }
  }, []);

  const getAttachmentUrl = useCallback(async (path: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from("performance-evidence")
        .getPublicUrl(path);
      
      return data?.publicUrl || null;
    } catch (error) {
      console.error("Error getting attachment URL:", error);
      return null;
    }
  }, []);

  // Get all attachment URLs for an evidence record
  const getAllAttachmentUrls = useCallback(async (
    attachments: EvidenceAttachment[]
  ): Promise<{ attachment: EvidenceAttachment; url: string }[]> => {
    const results: { attachment: EvidenceAttachment; url: string }[] = [];
    
    for (const attachment of attachments) {
      const url = await getAttachmentUrl(attachment.path);
      if (url) {
        results.push({ attachment, url });
      }
    }
    
    return results;
  }, [getAttachmentUrl]);

  const fetchEvidenceForGoal = useCallback(async (goalId: string) => {
    return fetchEvidence({ goal_id: goalId });
  }, [fetchEvidence]);

  const fetchEvidenceForCapability = useCallback(async (capabilityId: string) => {
    return fetchEvidence({ capability_id: capabilityId });
  }, [fetchEvidence]);

  const fetchEvidenceForEmployee = useCallback(async (employeeId: string, filters?: Omit<EvidenceFilters, 'employee_id'>) => {
    return fetchEvidence({ employee_id: employeeId, ...filters });
  }, [fetchEvidence]);

  const getEvidenceStats = useCallback((evidenceList: PerformanceEvidence[]) => {
    const total = evidenceList.length;
    const validated = evidenceList.filter(e => e.validation_status === "validated").length;
    const pending = evidenceList.filter(e => e.validation_status === "pending").length;
    const rejected = evidenceList.filter(e => e.validation_status === "rejected").length;
    const immutable = evidenceList.filter(e => e.is_immutable).length;

    const typeBreakdown = evidenceList.reduce((acc, e) => {
      acc[e.evidence_type] = (acc[e.evidence_type] || 0) + 1;
      return acc;
    }, {} as Record<EvidenceType, number>);

    return {
      total,
      validated,
      pending,
      rejected,
      immutable,
      validationRate: total > 0 ? (validated / total) * 100 : 0,
      typeBreakdown,
    };
  }, []);

  return {
    evidence,
    loading,
    uploading,
    fetchEvidence,
    fetchEvidenceForGoal,
    fetchEvidenceForCapability,
    fetchEvidenceForEmployee,
    createEvidence,
    updateEvidence,
    validateEvidence,
    markImmutable,
    uploadAttachment,
    uploadMultipleAttachments,
    addAttachmentToEvidence,
    removeAttachmentFromEvidence,
    getAttachmentUrl,
    getAllAttachmentUrls,
    getEvidenceStats,
  };
}
