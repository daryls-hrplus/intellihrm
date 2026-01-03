import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrainingProgram {
  id: string;
  company_id: string | null;
  title: string;
  title_en: string | null;
  description: string | null;
  program_type: string;
  thumbnail_url: string | null;
  estimated_duration_minutes: number | null;
  passing_score: number;
  max_attempts: number;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TrainingModule {
  id: string;
  program_id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  sequence_order: number;
  is_gateway: boolean;
  prerequisite_module_id: string | null;
  estimated_duration_minutes: number | null;
  content?: TrainingContent[];
  is_active: boolean;
}

export interface TrainingContent {
  id: string;
  module_id: string;
  content_type: string;
  title: string;
  title_en: string | null;
  description: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  thumbnail_url: string | null;
  transcript: string | null;
  sequence_order: number;
  min_watch_percentage: number;
  has_quiz: boolean;
  is_active: boolean;
}

export interface QuizQuestion {
  id: string;
  content_id: string;
  topic_id: string | null;
  question_type: "multiple_choice" | "multi_select" | "true_false" | "short_answer";
  question_text: string;
  question_text_en: string | null;
  explanation: string | null;
  points: number;
  sequence_order: number;
  is_required: boolean;
  time_limit_seconds: number | null;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  option_text_en: string | null;
  is_correct: boolean;
  feedback_text: string | null;
  sequence_order: number;
}

export interface TrainingEnrollment {
  id: string;
  employee_id: string;
  program_id: string;
  status: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  final_score: number | null;
  attempts_used: number;
  certificate_url: string | null;
  certificate_verification_code: string | null;
  program?: TrainingProgram;
}

export interface ContentProgress {
  id: string;
  enrollment_id: string;
  content_id: string;
  watch_percentage: number;
  watch_time_seconds: number;
  last_position_seconds: number;
  video_completed: boolean;
  quiz_score: number | null;
  quiz_attempts: number;
  status: string;
}

export interface QuizAttempt {
  id: string;
  enrollment_id: string;
  content_id: string;
  attempt_number: number;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_points: number | null;
  earned_points: number | null;
  time_taken_seconds: number | null;
  passed: boolean | null;
  weak_topics: string[] | null;
}

// Fetch user's enrollments
export function useMyEnrollments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-training-enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("training_enrollments")
        .select(`
          *,
          program:training_programs(*)
        `)
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as (TrainingEnrollment & { program: TrainingProgram })[];
    },
    enabled: !!user,
  });
}

// Fetch a specific program with modules
export function useTrainingProgram(programId: string | undefined) {
  return useQuery({
    queryKey: ["training-program", programId],
    queryFn: async () => {
      if (!programId) return null;
      
      const { data, error } = await supabase
        .from("training_programs")
        .select(`
          *,
          modules:training_modules(
            *,
            content:training_content(*)
          )
        `)
        .eq("id", programId)
        .eq("is_active", true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!programId,
  });
}

// Fetch content with quiz questions
export function useTrainingContent(contentId: string | undefined) {
  return useQuery({
    queryKey: ["training-content", contentId],
    queryFn: async () => {
      if (!contentId) return null;
      
      const { data: content, error: contentError } = await supabase
        .from("training_content")
        .select("*")
        .eq("id", contentId)
        .single();
      
      if (contentError) throw contentError;
      
      // Get questions if content has quiz
      let questions: QuizQuestion[] = [];
      if (content.has_quiz) {
        const { data: questionsData, error: questionsError } = await supabase
          .from("training_quiz_questions")
          .select(`
            *,
            options:training_quiz_options(*)
          `)
          .eq("content_id", contentId)
          .eq("is_active", true)
          .order("sequence_order");
        
        if (questionsError) throw questionsError;
        questions = questionsData as QuizQuestion[];
      }
      
      return { ...content, questions } as TrainingContent & { questions: QuizQuestion[] };
    },
    enabled: !!contentId,
  });
}

// Fetch user's progress for an enrollment
export function useEnrollmentProgress(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ["enrollment-progress", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return { modules: [], content: [] };
      
      const [modulesRes, contentRes] = await Promise.all([
        supabase
          .from("training_module_progress")
          .select("*")
          .eq("enrollment_id", enrollmentId),
        supabase
          .from("training_content_progress")
          .select("*")
          .eq("enrollment_id", enrollmentId),
      ]);
      
      if (modulesRes.error) throw modulesRes.error;
      if (contentRes.error) throw contentRes.error;
      
      return {
        modules: modulesRes.data,
        content: contentRes.data as ContentProgress[],
      };
    },
    enabled: !!enrollmentId,
  });
}

// Update video progress
export function useUpdateVideoProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      contentId,
      watchPercentage,
      watchTimeSeconds,
      lastPositionSeconds,
    }: {
      enrollmentId: string;
      contentId: string;
      watchPercentage: number;
      watchTimeSeconds: number;
      lastPositionSeconds: number;
    }) => {
      const videoCompleted = watchPercentage >= 90;
      const status = videoCompleted ? "quiz_pending" : "watching";
      
      const { data, error } = await supabase
        .from("training_content_progress")
        .upsert({
          enrollment_id: enrollmentId,
          content_id: contentId,
          watch_percentage: watchPercentage,
          watch_time_seconds: watchTimeSeconds,
          last_position_seconds: lastPositionSeconds,
          video_completed: videoCompleted,
          status,
        }, {
          onConflict: "enrollment_id,content_id",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment-progress", variables.enrollmentId],
      });
    },
  });
}

// Start a quiz attempt
export function useStartQuizAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      contentId,
    }: {
      enrollmentId: string;
      contentId: string;
    }) => {
      // Get current attempt count
      const { count } = await supabase
        .from("training_quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("enrollment_id", enrollmentId)
        .eq("content_id", contentId);
      
      const attemptNumber = (count || 0) + 1;
      
      const { data, error } = await supabase
        .from("training_quiz_attempts")
        .insert({
          enrollment_id: enrollmentId,
          content_id: contentId,
          attempt_number: attemptNumber,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as QuizAttempt;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment-progress", variables.enrollmentId],
      });
    },
  });
}

// Submit a quiz answer
export function useSubmitQuizAnswer() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      questionId,
      selectedOptions,
      textAnswer,
      isCorrect,
      pointsEarned,
      timeTakenSeconds,
    }: {
      attemptId: string;
      questionId: string;
      selectedOptions?: string[];
      textAnswer?: string;
      isCorrect: boolean;
      pointsEarned: number;
      timeTakenSeconds?: number;
    }) => {
      const { data, error } = await supabase
        .from("training_quiz_answers")
        .insert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_options: selectedOptions,
          text_answer: textAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_taken_seconds: timeTakenSeconds,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

// Complete a quiz attempt
export function useCompleteQuizAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      attemptId,
      enrollmentId,
      contentId,
      score,
      totalPoints,
      earnedPoints,
      timeTakenSeconds,
      passed,
      weakTopics,
    }: {
      attemptId: string;
      enrollmentId: string;
      contentId: string;
      score: number;
      totalPoints: number;
      earnedPoints: number;
      timeTakenSeconds: number;
      passed: boolean;
      weakTopics: string[];
    }) => {
      // Update attempt
      const { error: attemptError } = await supabase
        .from("training_quiz_attempts")
        .update({
          completed_at: new Date().toISOString(),
          score,
          total_points: totalPoints,
          earned_points: earnedPoints,
          time_taken_seconds: timeTakenSeconds,
          passed,
          weak_topics: weakTopics,
        })
        .eq("id", attemptId);
      
      if (attemptError) throw attemptError;
      
      // Update content progress
      const { error: progressError } = await supabase
        .from("training_content_progress")
        .update({
          quiz_completed_at: new Date().toISOString(),
          quiz_score: score,
          status: passed ? "completed" : (weakTopics.length > 0 ? "remediation" : "failed"),
        })
        .eq("enrollment_id", enrollmentId)
        .eq("content_id", contentId);
      
      if (progressError) throw progressError;
      
      return { passed, weakTopics };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment-progress", variables.enrollmentId],
      });
    },
  });
}

// Track analytics event
export function useTrackTrainingEvent() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      programId,
      contentId,
      eventType,
      eventData,
    }: {
      programId?: string;
      contentId?: string;
      eventType: string;
      eventData?: Record<string, unknown>;
    }) => {
      if (!user) return;
      
      const { error } = await supabase
        .from("training_analytics")
        .insert([{
          employee_id: user.id,
          program_id: programId,
          content_id: contentId,
          event_type: eventType,
          event_data: eventData ? JSON.parse(JSON.stringify(eventData)) : null,
          session_id: crypto.randomUUID(),
        }]);
      
      if (error) throw error;
    },
  });
}

// Enroll in a program
export function useEnrollInProgram() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("training_enrollments")
        .insert({
          employee_id: user.id,
          program_id: programId,
          enrollment_type: "self",
          status: "not_started",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-training-enrollments"] });
    },
  });
}

// Start enrollment
export function useStartEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { data, error } = await supabase
        .from("training_enrollments")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", enrollmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-training-enrollments"] });
    },
  });
}

// Complete enrollment
export function useCompleteEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      finalScore,
    }: {
      enrollmentId: string;
      finalScore: number;
    }) => {
      const { data, error } = await supabase
        .from("training_enrollments")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          final_score: finalScore,
          certificate_issued_at: new Date().toISOString(),
        })
        .eq("id", enrollmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-training-enrollments"] });
    },
  });
}

// Fetch available programs
export function useAvailablePrograms(companyId?: string) {
  return useQuery({
    queryKey: ["available-training-programs", companyId],
    queryFn: async () => {
      let query = supabase
        .from("training_programs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TrainingProgram[];
    },
  });
}
