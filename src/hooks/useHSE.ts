import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface HSEIncident {
  id: string;
  company_id: string;
  incident_number: string | null;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  location: string | null;
  incident_date: string;
  incident_time: string | null;
  reported_by: string | null;
  reported_date: string;
  injured_employee_id: string | null;
  injury_type: string | null;
  body_part_affected: string | null;
  treatment_required: string | null;
  days_lost: number | null;
  witnesses: string[] | null;
  root_cause: string | null;
  corrective_actions: string | null;
  preventive_measures: string | null;
  investigation_lead_id: string | null;
  investigation_date: string | null;
  investigation_findings: string | null;
  workflow_instance_id: string | null;
  attachments: Json[];
  is_recordable: boolean;
  is_osha_reportable: boolean;
  created_at: string;
  updated_at: string;
  reporter?: { full_name: string } | null;
  injured_employee?: { full_name: string } | null;
  investigation_lead?: { full_name: string } | null;
}

export interface HSERiskAssessment {
  id: string;
  company_id: string;
  assessment_number: string | null;
  title: string;
  department_id: string | null;
  location: string | null;
  assessed_by: string | null;
  assessment_date: string;
  review_date: string | null;
  status: string;
  overall_risk_level: string | null;
  description: string | null;
  scope: string | null;
  methodology: string | null;
  recommendations: string | null;
  approved_by: string | null;
  approved_date: string | null;
  workflow_instance_id: string | null;
  attachments: Json[];
  created_at: string;
  updated_at: string;
  assessor?: { full_name: string } | null;
  department?: { name: string };
}

export interface HSEHazard {
  id: string;
  assessment_id: string;
  hazard_type: string;
  description: string;
  affected_persons: string | null;
  likelihood: number;
  severity: number;
  risk_score: number;
  existing_controls: string | null;
  additional_controls: string | null;
  responsible_person_id: string | null;
  target_date: string | null;
  completion_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  responsible_person?: { full_name: string };
}

export interface HSESafetyTraining {
  id: string;
  company_id: string;
  training_type: string;
  title: string;
  code: string;
  description: string | null;
  is_mandatory: boolean;
  frequency_months: number | null;
  duration_hours: number | null;
  lms_course_id: string | null;
  applicable_departments: string[] | null;
  applicable_positions: string[] | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface HSETrainingRecord {
  id: string;
  training_id: string;
  employee_id: string;
  company_id: string;
  training_date: string;
  expiry_date: string | null;
  status: string;
  score: number | null;
  pass_mark: number | null;
  certificate_number: string | null;
  trainer_name: string | null;
  notes: string | null;
  attachments: Json[];
  created_at: string;
  updated_at: string;
  training?: HSESafetyTraining;
  employee?: { full_name: string };
}

export interface HSEComplianceRequirement {
  id: string;
  company_id: string;
  requirement_type: string;
  title: string;
  code: string;
  description: string | null;
  regulatory_body: string | null;
  reference_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  renewal_lead_days: number | null;
  responsible_person_id: string | null;
  status: string;
  compliance_status: string | null;
  last_audit_date: string | null;
  next_audit_date: string | null;
  attachments: Json[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  responsible_person?: { full_name: string };
}

export interface HSESafetyPolicy {
  id: string;
  company_id: string;
  policy_type: string;
  title: string;
  code: string;
  description: string | null;
  content: string | null;
  version: string | null;
  effective_date: string;
  review_date: string | null;
  approved_by: string | null;
  approved_date: string | null;
  owner_id: string | null;
  status: string;
  is_active: boolean;
  attachments: Json[];
  acknowledgment_required: boolean;
  created_at: string;
  updated_at: string;
  owner?: { full_name: string } | null;
  approver?: { full_name: string };
}

export interface HSEInspection {
  id: string;
  company_id: string;
  inspection_type: string;
  title: string;
  location: string | null;
  inspector_id: string | null;
  inspection_date: string;
  status: string;
  overall_rating: string | null;
  findings: string | null;
  corrective_actions: string | null;
  follow_up_date: string | null;
  attachments: Json[];
  created_at: string;
  updated_at: string;
  inspector?: { full_name: string };
}

export function useHSE(companyId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Incidents
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["hse-incidents", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_incidents")
        .select(`*`)
        .order("incident_date", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as HSEIncident[];
    },
    enabled: !!user,
  });

  const createIncident = useMutation({
    mutationFn: async (incidentData: Partial<HSEIncident>) => {
      const { reporter, injured_employee, investigation_lead, attachments, ...rest } = incidentData;
      const { data: result, error } = await supabase
        .from("hse_incidents")
        .insert([{ ...rest, reported_by: user?.id, attachments: (attachments || []) as Json } as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-incidents"] });
      toast.success("Incident reported successfully");
    },
    onError: (error) => toast.error(`Failed to report incident: ${error.message}`),
  });

  const updateIncident = useMutation({
    mutationFn: async ({ id, reporter, injured_employee, investigation_lead, attachments, ...rest }: Partial<HSEIncident> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("hse_incidents")
        .update({ ...rest, attachments: (attachments || []) as Json } as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-incidents"] });
      toast.success("Incident updated successfully");
    },
    onError: (error) => toast.error(`Failed to update incident: ${error.message}`),
  });

  // Risk Assessments
  const { data: riskAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["hse-risk-assessments", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_risk_assessments")
        .select(`*, department:department_id(name)`)
        .order("assessment_date", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as HSERiskAssessment[];
    },
    enabled: !!user,
  });

  const createRiskAssessment = useMutation({
    mutationFn: async (assessmentData: Partial<HSERiskAssessment>) => {
      const { assessor, department, attachments, ...rest } = assessmentData;
      const { data: result, error } = await supabase
        .from("hse_risk_assessments")
        .insert([{ ...rest, assessed_by: user?.id, attachments: (attachments || []) as Json } as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-risk-assessments"] });
      toast.success("Risk assessment created successfully");
    },
    onError: (error) => toast.error(`Failed to create assessment: ${error.message}`),
  });

  const updateRiskAssessment = useMutation({
    mutationFn: async ({ id, assessor, department, attachments, ...rest }: Partial<HSERiskAssessment> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("hse_risk_assessments")
        .update({ ...rest, attachments: (attachments || []) as Json } as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-risk-assessments"] });
      toast.success("Risk assessment updated successfully");
    },
    onError: (error) => toast.error(`Failed to update assessment: ${error.message}`),
  });

  // Hazards
  const useHazards = (assessmentId?: string) => {
    return useQuery({
      queryKey: ["hse-hazards", assessmentId],
      queryFn: async () => {
        if (!assessmentId) return [];
        const { data, error } = await supabase
          .from("hse_hazards")
          .select(`*, responsible_person:responsible_person_id(full_name)`)
          .eq("assessment_id", assessmentId)
          .order("risk_score", { ascending: false });
        if (error) throw error;
        return data as HSEHazard[];
      },
      enabled: !!assessmentId,
    });
  };

  const createHazard = useMutation({
    mutationFn: async (hazardData: Partial<HSEHazard>) => {
      const { responsible_person, risk_score, ...rest } = hazardData;
      const { data: result, error } = await supabase
        .from("hse_hazards")
        .insert([rest as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-hazards"] });
      toast.success("Hazard added successfully");
    },
    onError: (error) => toast.error(`Failed to add hazard: ${error.message}`),
  });

  // Safety Training
  const { data: safetyTrainings = [], isLoading: trainingsLoading } = useQuery({
    queryKey: ["hse-safety-training", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_safety_training")
        .select("*")
        .order("title");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HSESafetyTraining[];
    },
    enabled: !!user,
  });

  const createSafetyTraining = useMutation({
    mutationFn: async (trainingData: Partial<HSESafetyTraining>) => {
      const { data: result, error } = await supabase
        .from("hse_safety_training")
        .insert([trainingData as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-safety-training"] });
      toast.success("Safety training created successfully");
    },
    onError: (error) => toast.error(`Failed to create training: ${error.message}`),
  });

  // Training Records
  const { data: trainingRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["hse-training-records", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_training_records")
        .select(`
          *,
          training:training_id(*),
          employee:employee_id(full_name)
        `)
        .order("training_date", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HSETrainingRecord[];
    },
    enabled: !!user,
  });

  // Compliance Requirements
  const { data: complianceRequirements = [], isLoading: complianceLoading } = useQuery({
    queryKey: ["hse-compliance-requirements", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_compliance_requirements")
        .select(`*, responsible_person:responsible_person_id(full_name)`)
        .order("expiry_date");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HSEComplianceRequirement[];
    },
    enabled: !!user,
  });

  const createComplianceRequirement = useMutation({
    mutationFn: async (reqData: Partial<HSEComplianceRequirement>) => {
      const { responsible_person, attachments, ...rest } = reqData;
      const { data: result, error } = await supabase
        .from("hse_compliance_requirements")
        .insert([{ ...rest, attachments: attachments || [] } as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-compliance-requirements"] });
      toast.success("Compliance requirement created successfully");
    },
    onError: (error) => toast.error(`Failed to create requirement: ${error.message}`),
  });

  // Safety Policies
  const { data: safetyPolicies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ["hse-safety-policies", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_safety_policies")
        .select(`*`)
        .order("title");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as HSESafetyPolicy[];
    },
    enabled: !!user,
  });

  const createSafetyPolicy = useMutation({
    mutationFn: async (policyData: Partial<HSESafetyPolicy>) => {
      const { owner, approver, attachments, ...rest } = policyData;
      const { data: result, error } = await supabase
        .from("hse_safety_policies")
        .insert([{ ...rest, attachments: attachments || [] } as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-safety-policies"] });
      toast.success("Safety policy created successfully");
    },
    onError: (error) => toast.error(`Failed to create policy: ${error.message}`),
  });

  // Inspections
  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery({
    queryKey: ["hse-inspections", companyId],
    queryFn: async () => {
      let query = supabase
        .from("hse_inspections")
        .select(`*, inspector:inspector_id(full_name)`)
        .order("inspection_date", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HSEInspection[];
    },
    enabled: !!user,
  });

  return {
    incidents,
    incidentsLoading,
    createIncident,
    updateIncident,
    riskAssessments,
    assessmentsLoading,
    createRiskAssessment,
    updateRiskAssessment,
    useHazards,
    createHazard,
    safetyTrainings,
    trainingsLoading,
    createSafetyTraining,
    trainingRecords,
    recordsLoading,
    complianceRequirements,
    complianceLoading,
    createComplianceRequirement,
    safetyPolicies,
    policiesLoading,
    createSafetyPolicy,
    inspections,
    inspectionsLoading,
  };
}
