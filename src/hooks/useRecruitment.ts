import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface JobRequisition {
  id: string;
  company_id: string;
  position_id: string | null;
  requisition_number: string | null;
  title: string;
  department_id: string | null;
  location: string | null;
  employment_type: string;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  description: string | null;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  status: string;
  priority: string | null;
  openings: number | null;
  filled_count: number | null;
  hiring_manager_id: string | null;
  recruiter_id: string | null;
  target_hire_date: string | null;
  posted_date: string | null;
  closed_date: string | null;
  is_remote: boolean | null;
  is_internal_only: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  department?: { name: string } | null;
  hiring_manager?: { full_name: string } | null;
  recruiter?: { full_name: string } | null;
  company?: { name: string } | null;
}

export interface JobBoardConfig {
  id: string;
  company_id: string;
  name: string;
  code: string;
  api_endpoint: string;
  webhook_secret: string | null;
  is_active: boolean | null;
  auto_post: boolean | null;
  config: Json;
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: string;
  requisition_id: string;
  job_board_config_id: string;
  external_job_id: string | null;
  posting_url: string | null;
  status: string;
  posted_at: string | null;
  expires_at: string | null;
  last_synced_at: string | null;
  response_data: Json | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  job_board?: JobBoardConfig | null;
}

export interface Candidate {
  id: string;
  company_id: string;
  external_candidate_id: string | null;
  source: string | null;
  source_job_board: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  resume_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  current_company: string | null;
  current_title: string | null;
  years_experience: number | null;
  skills: Json | null;
  education: Json | null;
  notes: string | null;
  tags: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  requisition_id: string;
  candidate_id: string;
  application_number: string | null;
  external_application_id: string | null;
  source: string | null;
  source_job_board: string | null;
  status: string;
  stage: string;
  rating: number | null;
  cover_letter: string | null;
  expected_salary: number | null;
  notice_period_days: number | null;
  available_start_date: string | null;
  screening_answers: Json | null;
  interview_scores: Json | null;
  notes: string | null;
  rejection_reason: string | null;
  offer_details: Json | null;
  hired_at: string | null;
  hired_employee_id: string | null;
  applied_at: string;
  created_at: string;
  updated_at: string;
  candidate?: Candidate | null;
  requisition?: JobRequisition | null;
}

export interface InterviewSchedule {
  id: string;
  application_id: string;
  interview_type: string;
  interview_round: number | null;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  meeting_link: string | null;
  interviewer_ids: string[] | null;
  status: string;
  feedback: Json | null;
  overall_rating: number | null;
  recommendation: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferLetter {
  id: string;
  application_id: string;
  offer_number: string | null;
  position_title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  salary_amount: number;
  salary_currency: string | null;
  salary_period: string | null;
  bonus_details: Json | null;
  benefits_summary: string | null;
  start_date: string | null;
  expiry_date: string | null;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  signed_document_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useRecruitment(companyId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch job requisitions
  const { data: requisitions, isLoading: requisitionsLoading } = useQuery({
    queryKey: ["job-requisitions", companyId],
    queryFn: async () => {
      const query = supabase.from("job_requisitions").select(`
        *,
        department:departments(name),
        hiring_manager:profiles!job_requisitions_hiring_manager_id_fkey(full_name),
        recruiter:profiles!job_requisitions_recruiter_id_fkey(full_name),
        company:companies(name)
      `) as any;
      
      if (companyId) {
        query.eq("company_id", companyId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobRequisition[];
    },
  });

  // Fetch job board configurations
  const { data: jobBoardConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ["job-board-configs", companyId],
    queryFn: async () => {
      const query = supabase.from("job_board_configs").select("*") as any;
      
      if (companyId) {
        query.eq("company_id", companyId);
      }
      
      const { data, error } = await query.order("name");
      if (error) throw error;
      return data as JobBoardConfig[];
    },
  });

  // Fetch candidates
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ["candidates", companyId],
    queryFn: async () => {
      const query = supabase.from("candidates").select("*") as any;
      
      if (companyId) {
        query.eq("company_id", companyId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as Candidate[];
    },
  });

  // Fetch applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["applications", companyId],
    queryFn: async () => {
      const query = supabase.from("applications").select(`
        *,
        candidate:candidates(*),
        requisition:job_requisitions(*)
      `) as any;
      
      const { data, error } = await query.order("applied_at", { ascending: false });
      if (error) throw error;
      return data as Application[];
    },
  });

  // Fetch job postings for a requisition
  const useJobPostings = (requisitionId?: string) => {
    return useQuery({
      queryKey: ["job-postings", requisitionId],
      queryFn: async () => {
        if (!requisitionId) return [];
        const query = supabase.from("job_postings").select(`
          *,
          job_board:job_board_configs(*)
        `) as any;
        
        const { data, error } = await query.eq("requisition_id", requisitionId);
        if (error) throw error;
        return data as JobPosting[];
      },
      enabled: !!requisitionId,
    });
  };

  // Create requisition
  const createRequisition = useMutation({
    mutationFn: async (requisition: Partial<JobRequisition>) => {
      const { data, error } = await supabase
        .from("job_requisitions")
        .insert(requisition as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      toast.success("Job requisition created");
    },
    onError: (error) => {
      toast.error(`Failed to create requisition: ${error.message}`);
    },
  });

  // Update requisition
  const updateRequisition = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobRequisition> & { id: string }) => {
      const { data, error } = await supabase
        .from("job_requisitions")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      toast.success("Job requisition updated");
    },
    onError: (error) => {
      toast.error(`Failed to update requisition: ${error.message}`);
    },
  });

  // Create job board config
  const createJobBoardConfig = useMutation({
    mutationFn: async (config: Partial<JobBoardConfig>) => {
      const { data, error } = await supabase
        .from("job_board_configs")
        .insert(config as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-board-configs"] });
      toast.success("Job board configuration created");
    },
    onError: (error) => {
      toast.error(`Failed to create config: ${error.message}`);
    },
  });

  // Post job to board
  const postJobToBoard = useMutation({
    mutationFn: async ({ requisitionId, jobBoardConfigId }: { requisitionId: string; jobBoardConfigId: string }) => {
      const { data, error } = await supabase.functions.invoke("post-job-to-board", {
        body: { requisitionId, jobBoardConfigId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["job-requisitions"] });
      if (data.success) {
        toast.success("Job posted successfully");
      } else {
        toast.error(`Failed to post job: ${data.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to post job: ${error.message}`);
    },
  });

  // Create candidate
  const createCandidate = useMutation({
    mutationFn: async (candidate: Partial<Candidate>) => {
      const { data, error } = await supabase
        .from("candidates")
        .insert(candidate as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate created");
    },
    onError: (error) => {
      toast.error(`Failed to create candidate: ${error.message}`);
    },
  });

  // Create application
  const createApplication = useMutation({
    mutationFn: async (application: Partial<Application>) => {
      const { data, error } = await supabase
        .from("applications")
        .insert(application as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application created");
    },
    onError: (error) => {
      toast.error(`Failed to create application: ${error.message}`);
    },
  });

  // Update application
  const updateApplication = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Application> & { id: string }) => {
      const { data, error } = await supabase
        .from("applications")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated");
    },
    onError: (error) => {
      toast.error(`Failed to update application: ${error.message}`);
    },
  });

  return {
    requisitions,
    requisitionsLoading,
    jobBoardConfigs,
    configsLoading,
    candidates,
    candidatesLoading,
    applications,
    applicationsLoading,
    useJobPostings,
    createRequisition,
    updateRequisition,
    createJobBoardConfig,
    postJobToBoard,
    createCandidate,
    createApplication,
    updateApplication,
  };
}
