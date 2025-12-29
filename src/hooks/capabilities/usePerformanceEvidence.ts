import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  source_system: string | null;
  external_reference_id: string | null;
  external_url: string | null;
  attachment_path: string | null;
  attachment_type: string | null;
  attachment_size_bytes: number | null;
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
}

export interface CreateEvidenceData {
  evidence_type: EvidenceType;
  title: string;
  description?: string;
  goal_id?: string;
  capability_id?: string;
  responsibility_id?: string;
  appraisal_cycle_id?: string;
  source_system?: string;
  external_reference_id?: string;
  external_url?: string;
  attachment_path?: string;
  attachment_type?: string;
  attachment_size_bytes?: number;
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
          validator:profiles!performance_evidence_validated_by_fkey(full_name)
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
      if (filters.validation_status) {
        query = query.eq("validation_status", filters.validation_status);
      }
      if (filters.evidence_type) {
        query = query.eq("evidence_type", filters.evidence_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvidence((data || []) as PerformanceEvidence[]);
      return data as PerformanceEvidence[];
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
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Evidence submitted successfully");
      return newEvidence as PerformanceEvidence;
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
  ): Promise<{ path: string; type: string; size: number } | null> => {
    if (!user) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${employeeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("performance-evidence")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return {
        path: filePath,
        type: file.type,
        size: file.size,
      };
    } catch (error: any) {
      console.error("Error uploading attachment:", error);
      toast.error("Failed to upload attachment");
      return null;
    } finally {
      setUploading(false);
    }
  }, [user]);

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
    getAttachmentUrl,
    getEvidenceStats,
  };
}
