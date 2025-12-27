// Capability Platform Types
// Re-export from database types for consistency

import { Json } from "@/integrations/supabase/types";

// Use database enum values directly
export type CapabilityType = 'SKILL' | 'COMPETENCY';
export type CapabilityCategory = 'technical' | 'leadership' | 'functional' | 'behavioral' | 'core';
export type CapabilityStatus = 'draft' | 'active' | 'deprecated' | 'pending_approval';
export type EvidenceSource = 'self_assessment' | 'manager_assessment' | 'peer_review' | 'certification' | 'lms_completion' | 'project_outcome' | 'external_validation' | '360_feedback' | 'ai_inference' | 'training_completion';
export type ValidationStatus = 'pending' | 'validated' | 'rejected' | 'expired';

export interface Capability {
  id: string;
  company_id?: string | null;
  type: CapabilityType;
  name: string;
  code: string;
  description?: string | null;
  category: CapabilityCategory;
  proficiency_scale_id?: string | null;
  status: CapabilityStatus;
  version: number;
  effective_from: string;
  effective_to?: string | null;
  owner_role?: string | null;
  parent_capability_id?: string | null;
  external_id?: string | null;
  metadata?: Json;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CapabilityEvidence {
  id: string;
  employee_id: string;
  capability_id: string;
  evidence_source: EvidenceSource;
  proficiency_level: number;
  confidence_score?: number | null;
  validation_status: ValidationStatus;
  validated_by?: string | null;
  validated_at?: string | null;
  evidence_reference?: Json;
  notes?: string | null;
  effective_from?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CapabilityGap {
  capability: Capability;
  required_level: number;
  current_level: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_actions?: string[];
}

export interface CapabilityRequirement {
  capability_id: string;
  capability?: Capability;
  required_level: number;
  is_mandatory: boolean;
  weight?: number;
}

export interface EmployeeCapabilityProfile {
  employee_id: string;
  capabilities: {
    capability: Capability;
    current_level: number;
    latest_evidence?: CapabilityEvidence;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  }[];
  gaps?: CapabilityGap[];
  overall_score?: number;
}
