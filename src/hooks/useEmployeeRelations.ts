import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ERCase {
  id: string;
  company_id: string;
  case_number: string;
  employee_id: string;
  case_type: string;
  category: string | null;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  reported_by: string | null;
  reported_date: string;
  assigned_to: string | null;
  target_resolution_date: string | null;
  actual_resolution_date: string | null;
  resolution_summary: string | null;
  is_confidential: boolean;
  witnesses: unknown[];
  attachments: unknown[];
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; email: string };
  reporter?: { id: string; full_name: string };
  assignee?: { id: string; full_name: string };
}

export interface ERCaseNote {
  id: string;
  case_id: string;
  note_type: string;
  content: string;
  is_internal: boolean;
  created_by: string | null;
  created_at: string;
  author?: { id: string; full_name: string };
}

export interface ERDisciplinaryAction {
  id: string;
  company_id: string;
  employee_id: string;
  case_id: string | null;
  action_type: string;
  severity: string;
  reason: string;
  description: string | null;
  issued_by: string | null;
  issued_date: string;
  effective_date: string;
  expiry_date: string | null;
  acknowledged_by_employee: boolean;
  acknowledged_at: string | null;
  employee_response: string | null;
  appeal_status: string;
  appeal_notes: string | null;
  status: string;
  attachments: unknown[];
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; email: string };
  issuer?: { id: string; full_name: string };
}

export interface ERRecognition {
  id: string;
  company_id: string;
  employee_id: string;
  recognition_type: string;
  category: string | null;
  title: string;
  description: string | null;
  awarded_by: string | null;
  award_date: string;
  monetary_value: number | null;
  currency: string;
  is_public: boolean;
  attachments: unknown[];
  created_at: string;
  employee?: { id: string; full_name: string; email: string };
  awarder?: { id: string; full_name: string };
}

export interface ERExitInterview {
  id: string;
  company_id: string;
  employee_id: string;
  interviewer_id: string | null;
  interview_date: string;
  departure_reason: string | null;
  last_working_date: string | null;
  would_rejoin: boolean | null;
  overall_satisfaction: number | null;
  management_satisfaction: number | null;
  culture_satisfaction: number | null;
  compensation_satisfaction: number | null;
  growth_satisfaction: number | null;
  worklife_balance_satisfaction: number | null;
  feedback_summary: string | null;
  improvement_suggestions: string | null;
  positive_aspects: string | null;
  negative_aspects: string | null;
  status: string;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; email: string };
  interviewer?: { id: string; full_name: string };
}

export interface ERSurvey {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  survey_type: string;
  status: string;
  start_date: string;
  end_date: string;
  is_anonymous: boolean;
  target_departments: unknown[];
  questions: unknown[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  response_count?: number;
}

export interface ERWellnessProgram {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  program_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  budget: number | null;
  currency: string;
  coordinator_id: string | null;
  created_at: string;
  updated_at: string;
  coordinator?: { id: string; full_name: string };
  enrollment_count?: number;
}

export const useEmployeeRelations = (companyId?: string) => {
  const queryClient = useQueryClient();

  // Cases
  const { data: cases = [], isLoading: loadingCases } = useQuery({
    queryKey: ["er-cases", companyId],
    queryFn: async () => {
      let query = supabase
        .from("er_cases")
        .select(`
          *,
          employee:profiles!er_cases_employee_id_fkey(id, full_name, email),
          reporter:profiles!er_cases_reported_by_fkey(id, full_name),
          assignee:profiles!er_cases_assigned_to_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ERCase[];
    },
  });

  // Disciplinary Actions
  const { data: disciplinaryActions = [], isLoading: loadingDisciplinary } = useQuery({
    queryKey: ["er-disciplinary", companyId],
    queryFn: async () => {
      let query = supabase
        .from("er_disciplinary_actions")
        .select(`
          *,
          employee:profiles!er_disciplinary_actions_employee_id_fkey(id, full_name, email),
          issuer:profiles!er_disciplinary_actions_issued_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ERDisciplinaryAction[];
    },
  });

  // Recognition
  const { data: recognitions = [], isLoading: loadingRecognition } = useQuery({
    queryKey: ["er-recognition", companyId],
    queryFn: async () => {
      let query = supabase
        .from("er_recognition")
        .select(`
          *,
          employee:profiles!er_recognition_employee_id_fkey(id, full_name, email),
          awarder:profiles!er_recognition_awarded_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ERRecognition[];
    },
  });

  // Exit Interviews
  const { data: exitInterviews = [], isLoading: loadingExitInterviews } = useQuery({
    queryKey: ["er-exit-interviews", companyId],
    queryFn: async () => {
      let query = supabase
        .from("er_exit_interviews")
        .select(`
          *,
          employee:profiles!er_exit_interviews_employee_id_fkey(id, full_name, email),
          interviewer:profiles!er_exit_interviews_interviewer_id_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ERExitInterview[];
    },
  });

  // Surveys
  const { data: surveys = [], isLoading: loadingSurveys } = useQuery({
    queryKey: ["er-surveys", companyId],
    queryFn: async () => {
      let query = supabase
        .from("er_surveys")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ERSurvey[];
    },
  });

  // Wellness Programs
  const { data: wellnessPrograms = [], isLoading: loadingWellness } = useQuery({
    queryKey: ["er-wellness", companyId],
    queryFn: async () => {
      let query = supabase
        .from("er_wellness_programs")
        .select(`
          *,
          coordinator:profiles!er_wellness_programs_coordinator_id_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ERWellnessProgram[];
    },
  });

  // Create Case
  const createCase = useMutation({
    mutationFn: async (caseData: { company_id: string; employee_id?: string; case_type?: string; category?: string; severity?: string; title: string; description?: string; reported_by?: string; target_resolution_date?: string }) => {
      const caseNumber = `ER-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from("er_cases")
        .insert([{ ...caseData, case_number: caseNumber, employee_id: caseData.employee_id || caseData.reported_by }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-cases"] });
      toast.success("Case created successfully");
    },
    onError: () => toast.error("Failed to create case"),
  });

  // Update Case
  const updateCase = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; actual_resolution_date?: string; resolution_summary?: string; assigned_to?: string }) => {
      const { data, error } = await supabase
        .from("er_cases")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-cases"] });
      toast.success("Case updated successfully");
    },
    onError: () => toast.error("Failed to update case"),
  });

  // Create Disciplinary Action
  const createDisciplinaryAction = useMutation({
    mutationFn: async (action: { company_id: string; employee_id: string; action_type: string; severity: string; reason: string; description?: string; issued_by?: string; effective_date: string; expiry_date?: string | null }) => {
      const { data, error } = await supabase
        .from("er_disciplinary_actions")
        .insert([action])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: () => toast.error("Failed to create disciplinary action"),
  });

  // Update Disciplinary Action
  const updateDisciplinaryAction = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ERDisciplinaryAction>) => {
      const { data, error } = await supabase
        .from("er_disciplinary_actions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-disciplinary"] });
      toast.success("Disciplinary action updated");
    },
    onError: () => toast.error("Failed to update disciplinary action"),
  });

  // Create Recognition
  const createRecognition = useMutation({
    mutationFn: async (recognition: Partial<ERRecognition>) => {
      const { data, error } = await supabase
        .from("er_recognition")
        .insert([recognition])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-recognition"] });
      toast.success("Recognition created");
    },
    onError: () => toast.error("Failed to create recognition"),
  });

  // Create Exit Interview
  const createExitInterview = useMutation({
    mutationFn: async (interview: { company_id: string; employee_id: string; interviewer_id?: string; interview_date: string; departure_reason?: string | null; last_working_date?: string | null }) => {
      const { data, error } = await supabase
        .from("er_exit_interviews")
        .insert([interview])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-exit-interviews"] });
      toast.success("Exit interview scheduled");
    },
    onError: () => toast.error("Failed to create exit interview"),
  });

  // Update Exit Interview
  const updateExitInterview = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ERExitInterview>) => {
      const { data, error } = await supabase
        .from("er_exit_interviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-exit-interviews"] });
      toast.success("Exit interview updated");
    },
    onError: () => toast.error("Failed to update exit interview"),
  });

  // Create Survey
  const createSurvey = useMutation({
    mutationFn: async (survey: { company_id: string; title: string; description?: string; survey_type: string; start_date: string; end_date: string; is_anonymous: boolean; questions: unknown[]; created_by?: string }) => {
      const { data, error } = await supabase
        .from("er_surveys")
        .insert([survey])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-surveys"] });
      toast.success("Survey created");
    },
    onError: () => toast.error("Failed to create survey"),
  });

  // Update Survey
  const updateSurvey = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ERSurvey>) => {
      const { data, error } = await supabase
        .from("er_surveys")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-surveys"] });
      toast.success("Survey updated");
    },
    onError: () => toast.error("Failed to update survey"),
  });

  // Create Wellness Program
  const createWellnessProgram = useMutation({
    mutationFn: async (program: { company_id: string; name: string; description?: string; program_type: string; start_date: string; end_date?: string | null; max_participants?: number | null; budget?: number | null; coordinator_id?: string }) => {
      const { data, error } = await supabase
        .from("er_wellness_programs")
        .insert([program])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-wellness"] });
      toast.success("Wellness program created");
    },
    onError: () => toast.error("Failed to create wellness program"),
  });

  // Update Wellness Program
  const updateWellnessProgram = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ERWellnessProgram>) => {
      const { data, error } = await supabase
        .from("er_wellness_programs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["er-wellness"] });
      toast.success("Wellness program updated");
    },
    onError: () => toast.error("Failed to update wellness program"),
  });

  return {
    cases,
    disciplinaryActions,
    recognitions,
    exitInterviews,
    surveys,
    wellnessPrograms,
    loadingCases,
    loadingDisciplinary,
    loadingRecognition,
    loadingExitInterviews,
    loadingSurveys,
    loadingWellness,
    createCase,
    updateCase,
    createDisciplinaryAction,
    updateDisciplinaryAction,
    createRecognition,
    createExitInterview,
    updateExitInterview,
    createSurvey,
    updateSurvey,
    createWellnessProgram,
    updateWellnessProgram,
  };
};
