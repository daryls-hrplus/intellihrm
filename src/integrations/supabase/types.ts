export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_request_history: {
        Row: {
          access_request_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          access_request_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          access_request_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_request_history_access_request_id_fkey"
            columns: ["access_request_id"]
            isOneToOne: false
            referencedRelation: "access_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      access_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          requested_modules: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_modules?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_modules?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_number: string | null
          applied_at: string
          available_start_date: string | null
          candidate_id: string
          cover_letter: string | null
          created_at: string
          expected_salary: number | null
          external_application_id: string | null
          hired_at: string | null
          hired_employee_id: string | null
          id: string
          interview_scores: Json | null
          notes: string | null
          notice_period_days: number | null
          offer_details: Json | null
          rating: number | null
          rejection_reason: string | null
          requisition_id: string
          screening_answers: Json | null
          source: string | null
          source_job_board: string | null
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          application_number?: string | null
          applied_at?: string
          available_start_date?: string | null
          candidate_id: string
          cover_letter?: string | null
          created_at?: string
          expected_salary?: number | null
          external_application_id?: string | null
          hired_at?: string | null
          hired_employee_id?: string | null
          id?: string
          interview_scores?: Json | null
          notes?: string | null
          notice_period_days?: number | null
          offer_details?: Json | null
          rating?: number | null
          rejection_reason?: string | null
          requisition_id: string
          screening_answers?: Json | null
          source?: string | null
          source_job_board?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_number?: string | null
          applied_at?: string
          available_start_date?: string | null
          candidate_id?: string
          cover_letter?: string | null
          created_at?: string
          expected_salary?: number | null
          external_application_id?: string | null
          hired_at?: string | null
          hired_employee_id?: string | null
          id?: string
          interview_scores?: Json | null
          notes?: string | null
          notice_period_days?: number | null
          offer_details?: Json | null
          rating?: number | null
          rejection_reason?: string | null
          requisition_id?: string
          screening_answers?: Json | null
          source?: string | null
          source_job_board?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_hired_employee_id_fkey"
            columns: ["hired_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "job_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisal_cycles: {
        Row: {
          company_id: string
          competency_weight: number
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          evaluation_deadline: string | null
          goal_weight: number
          id: string
          is_manager_cycle: boolean
          is_probation_review: boolean
          max_rating: number
          min_rating: number
          name: string
          responsibility_weight: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          competency_weight?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          evaluation_deadline?: string | null
          goal_weight?: number
          id?: string
          is_manager_cycle?: boolean
          is_probation_review?: boolean
          max_rating?: number
          min_rating?: number
          name: string
          responsibility_weight?: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          competency_weight?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          evaluation_deadline?: string | null
          goal_weight?: number
          id?: string
          is_manager_cycle?: boolean
          is_probation_review?: boolean
          max_rating?: number
          min_rating?: number
          name?: string
          responsibility_weight?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_cycles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisal_participants: {
        Row: {
          competency_score: number | null
          created_at: string
          cycle_id: string
          employee_comments: string | null
          employee_id: string
          evaluator_id: string | null
          final_comments: string | null
          goal_score: number | null
          id: string
          overall_score: number | null
          responsibility_score: number | null
          reviewed_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          competency_score?: number | null
          created_at?: string
          cycle_id: string
          employee_comments?: string | null
          employee_id: string
          evaluator_id?: string | null
          final_comments?: string | null
          goal_score?: number | null
          id?: string
          overall_score?: number | null
          responsibility_score?: number | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          competency_score?: number | null
          created_at?: string
          cycle_id?: string
          employee_comments?: string | null
          employee_id?: string
          evaluator_id?: string | null
          final_comments?: string | null
          goal_score?: number | null
          id?: string
          overall_score?: number | null
          responsibility_score?: number | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_participants_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "appraisal_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_participants_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisal_scores: {
        Row: {
          comments: string | null
          created_at: string
          evaluation_type: string
          id: string
          item_id: string
          item_name: string
          participant_id: string
          rating: number | null
          updated_at: string
          weight: number
          weighted_score: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          evaluation_type: string
          id?: string
          item_id: string
          item_name: string
          participant_id: string
          rating?: number | null
          updated_at?: string
          weight?: number
          weighted_score?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          evaluation_type?: string
          id?: string
          item_id?: string
          item_name?: string
          participant_id?: string
          rating?: number | null
          updated_at?: string
          weight?: number
          weighted_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "appraisal_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auto_approval_rules: {
        Row: {
          approved_modules: Json
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          role_id: string | null
          updated_at: string
        }
        Insert: {
          approved_modules?: Json
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_modules?: Json
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_approval_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_approval_rules_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_auto_enrollment_rules: {
        Row: {
          company_id: string
          created_at: string
          criteria: Json
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          plan_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          criteria?: Json
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          plan_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          plan_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_auto_enrollment_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_auto_enrollment_rules_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "benefit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_categories: {
        Row: {
          category_type: string
          code: string
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          category_type: string
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          category_type?: string
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_claims: {
        Row: {
          amount_approved: number | null
          amount_claimed: number
          claim_date: string
          claim_number: string | null
          claim_type: string
          created_at: string
          description: string | null
          enrollment_id: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          provider_name: string | null
          service_date: string
          status: string
          supporting_documents: Json | null
          updated_at: string
        }
        Insert: {
          amount_approved?: number | null
          amount_claimed: number
          claim_date?: string
          claim_number?: string | null
          claim_type: string
          created_at?: string
          description?: string | null
          enrollment_id: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          provider_name?: string | null
          service_date: string
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
        }
        Update: {
          amount_approved?: number | null
          amount_claimed?: number
          claim_date?: string
          claim_number?: string | null
          claim_type?: string
          created_at?: string
          description?: string | null
          enrollment_id?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          provider_name?: string | null
          service_date?: string
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_claims_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_claims_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_dependents: {
        Row: {
          created_at: string
          date_of_birth: string | null
          dependent_id: string | null
          end_date: string | null
          enrollment_id: string
          full_name: string
          id: string
          is_active: boolean
          relationship: string
          ssn_last_four: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          dependent_id?: string | null
          end_date?: string | null
          enrollment_id: string
          full_name: string
          id?: string
          is_active?: boolean
          relationship: string
          ssn_last_four?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          dependent_id?: string | null
          end_date?: string | null
          enrollment_id?: string
          full_name?: string
          id?: string
          is_active?: boolean
          relationship?: string
          ssn_last_four?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_dependents_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "employee_dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_dependents_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_eligibility_audits: {
        Row: {
          audit_type: string
          created_at: string
          dependent_id: string | null
          documents: Json | null
          employee_id: string
          enrollment_id: string | null
          id: string
          notes: string | null
          updated_at: string
          verification_date: string | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          audit_type: string
          created_at?: string
          dependent_id?: string | null
          documents?: Json | null
          employee_id: string
          enrollment_id?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          verification_date?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          audit_type?: string
          created_at?: string
          dependent_id?: string | null
          documents?: Json | null
          employee_id?: string
          enrollment_id?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          verification_date?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_eligibility_audits_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "benefit_dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_eligibility_audits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_eligibility_audits_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_eligibility_audits_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_enrollment_periods: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          end_date: string
          enrollment_type: string
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          end_date: string
          enrollment_type?: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          enrollment_type?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_enrollment_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_enrollments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          coverage_level: string | null
          covered_dependents: Json | null
          created_at: string
          created_by: string | null
          effective_date: string
          employee_contribution: number | null
          employee_id: string
          employer_contribution: number | null
          enrollment_date: string
          enrollment_period_id: string | null
          enrollment_source: string
          id: string
          notes: string | null
          plan_id: string
          status: string
          termination_date: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          coverage_level?: string | null
          covered_dependents?: Json | null
          created_at?: string
          created_by?: string | null
          effective_date: string
          employee_contribution?: number | null
          employee_id: string
          employer_contribution?: number | null
          enrollment_date?: string
          enrollment_period_id?: string | null
          enrollment_source?: string
          id?: string
          notes?: string | null
          plan_id: string
          status?: string
          termination_date?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          coverage_level?: string | null
          covered_dependents?: Json | null
          created_at?: string
          created_by?: string | null
          effective_date?: string
          employee_contribution?: number | null
          employee_id?: string
          employer_contribution?: number | null
          enrollment_date?: string
          enrollment_period_id?: string | null
          enrollment_source?: string
          id?: string
          notes?: string | null
          plan_id?: string
          status?: string
          termination_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_enrollments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_enrollment_period_id_fkey"
            columns: ["enrollment_period_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollment_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "benefit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_life_events: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          employee_id: string
          enrollment_window_end: string | null
          enrollment_window_start: string | null
          event_date: string
          event_type: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          supporting_documents: Json | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          employee_id: string
          enrollment_window_end?: string | null
          enrollment_window_start?: string | null
          event_date: string
          event_type: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          employee_id?: string
          enrollment_window_end?: string | null
          enrollment_window_start?: string | null
          event_date?: string
          event_type?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_life_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_life_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_life_events_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_plans: {
        Row: {
          auto_enrollment_criteria: Json | null
          category_id: string
          code: string
          company_id: string
          contribution_frequency: string | null
          coverage_details: Json | null
          created_at: string
          currency: string | null
          description: string | null
          employee_contribution: number | null
          employer_contribution: number | null
          end_date: string | null
          enrollment_type: string
          id: string
          is_active: boolean
          name: string
          plan_type: string
          provider_contact: string | null
          provider_id: string | null
          provider_name: string | null
          start_date: string
          updated_at: string
          waiting_period_days: number | null
        }
        Insert: {
          auto_enrollment_criteria?: Json | null
          category_id: string
          code: string
          company_id: string
          contribution_frequency?: string | null
          coverage_details?: Json | null
          created_at?: string
          currency?: string | null
          description?: string | null
          employee_contribution?: number | null
          employer_contribution?: number | null
          end_date?: string | null
          enrollment_type?: string
          id?: string
          is_active?: boolean
          name: string
          plan_type: string
          provider_contact?: string | null
          provider_id?: string | null
          provider_name?: string | null
          start_date?: string
          updated_at?: string
          waiting_period_days?: number | null
        }
        Update: {
          auto_enrollment_criteria?: Json | null
          category_id?: string
          code?: string
          company_id?: string
          contribution_frequency?: string | null
          coverage_details?: Json | null
          created_at?: string
          currency?: string | null
          description?: string | null
          employee_contribution?: number | null
          employer_contribution?: number | null
          end_date?: string | null
          enrollment_type?: string
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: string
          provider_contact?: string | null
          provider_id?: string | null
          provider_name?: string | null
          start_date?: string
          updated_at?: string
          waiting_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_plans_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "benefit_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_plans_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "benefit_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_providers: {
        Row: {
          address: string | null
          city: string | null
          code: string
          company_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          postal_code: string | null
          provider_type: string
          start_date: string
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          postal_code?: string | null
          provider_type?: string
          start_date?: string
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          postal_code?: string | null
          provider_type?: string
          start_date?: string
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_providers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_waiting_periods: {
        Row: {
          created_at: string
          eligibility_date: string
          employee_id: string
          enrolled_at: string | null
          enrollment_status: string
          hire_date: string
          id: string
          plan_id: string
          updated_at: string
          waiting_period_days: number
        }
        Insert: {
          created_at?: string
          eligibility_date: string
          employee_id: string
          enrolled_at?: string | null
          enrollment_status?: string
          hire_date: string
          id?: string
          plan_id: string
          updated_at?: string
          waiting_period_days?: number
        }
        Update: {
          created_at?: string
          eligibility_date?: string
          employee_id?: string
          enrolled_at?: string | null
          enrollment_status?: string
          hire_date?: string
          id?: string
          plan_id?: string
          updated_at?: string
          waiting_period_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "benefit_waiting_periods_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_waiting_periods_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "benefit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboard_shares: {
        Row: {
          can_edit: boolean
          created_at: string
          created_by: string | null
          dashboard_id: string
          id: string
          shared_with_role: string | null
          shared_with_user_id: string | null
        }
        Insert: {
          can_edit?: boolean
          created_at?: string
          created_by?: string | null
          dashboard_id: string
          id?: string
          shared_with_role?: string | null
          shared_with_user_id?: string | null
        }
        Update: {
          can_edit?: boolean
          created_at?: string
          created_by?: string | null
          dashboard_id?: string
          id?: string
          shared_with_role?: string | null
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_dashboard_shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboard_shares_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bi_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboard_shares_shared_with_user_id_fkey"
            columns: ["shared_with_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboards: {
        Row: {
          code: string
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          filters: Json
          id: string
          is_active: boolean
          is_global: boolean
          layout: Json
          module: string
          name: string
          refresh_interval: number | null
          start_date: string
          theme: Json
          updated_at: string
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          filters?: Json
          id?: string
          is_active?: boolean
          is_global?: boolean
          layout?: Json
          module: string
          name: string
          refresh_interval?: number | null
          start_date?: string
          theme?: Json
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          filters?: Json
          id?: string
          is_active?: boolean
          is_global?: boolean
          layout?: Json
          module?: string
          name?: string
          refresh_interval?: number | null
          start_date?: string
          theme?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_dashboards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_data_sources: {
        Row: {
          available_fields: Json
          base_table: string
          code: string
          created_at: string
          default_filters: Json
          description: string | null
          id: string
          is_active: boolean
          joins: Json
          module: string
          name: string
          supports_drill_down: boolean
          updated_at: string
        }
        Insert: {
          available_fields?: Json
          base_table: string
          code: string
          created_at?: string
          default_filters?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          joins?: Json
          module: string
          name: string
          supports_drill_down?: boolean
          updated_at?: string
        }
        Update: {
          available_fields?: Json
          base_table?: string
          code?: string
          created_at?: string
          default_filters?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          joins?: Json
          module?: string
          name?: string
          supports_drill_down?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      bi_widgets: {
        Row: {
          chart_type: string | null
          config: Json
          created_at: string
          custom_sql: string | null
          dashboard_id: string
          data_source: string
          display_order: number
          drill_down: Json | null
          filters: Json
          id: string
          is_visible: boolean
          name: string
          position: Json
          updated_at: string
          widget_type: string
        }
        Insert: {
          chart_type?: string | null
          config?: Json
          created_at?: string
          custom_sql?: string | null
          dashboard_id: string
          data_source: string
          display_order?: number
          drill_down?: Json | null
          filters?: Json
          id?: string
          is_visible?: boolean
          name: string
          position?: Json
          updated_at?: string
          widget_type: string
        }
        Update: {
          chart_type?: string | null
          config?: Json
          created_at?: string
          custom_sql?: string | null
          dashboard_id?: string
          data_source?: string
          display_order?: number
          drill_down?: Json | null
          filters?: Json
          id?: string
          is_visible?: boolean
          name?: string
          position?: Json
          updated_at?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bi_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          company_id: string
          created_at: string
          current_company: string | null
          current_title: string | null
          education: Json | null
          email: string
          external_candidate_id: string | null
          first_name: string
          id: string
          last_name: string
          linkedin_url: string | null
          location: string | null
          notes: string | null
          phone: string | null
          portfolio_url: string | null
          resume_url: string | null
          skills: Json | null
          source: string | null
          source_job_board: string | null
          status: string
          tags: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          current_company?: string | null
          current_title?: string | null
          education?: Json | null
          email: string
          external_candidate_id?: string | null
          first_name: string
          id?: string
          last_name: string
          linkedin_url?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: Json | null
          source?: string | null
          source_job_board?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          current_company?: string | null
          current_title?: string | null
          education?: Json | null
          email?: string
          external_candidate_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          linkedin_url?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: Json | null
          source?: string | null
          source_job_board?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      career_path_steps: {
        Row: {
          career_path_id: string
          created_at: string
          id: string
          job_id: string
          requirements: string | null
          step_order: number
          typical_duration_months: number | null
          updated_at: string
        }
        Insert: {
          career_path_id: string
          created_at?: string
          id?: string
          job_id: string
          requirements?: string | null
          step_order: number
          typical_duration_months?: number | null
          updated_at?: string
        }
        Update: {
          career_path_id?: string
          created_at?: string
          id?: string
          job_id?: string
          requirements?: string | null
          step_order?: number
          typical_duration_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_path_steps_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_path_steps_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      career_paths: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_paths_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      color_schemes: {
        Row: {
          colors: Json
          company_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          colors?: Json
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Update: {
          colors?: Json
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "color_schemes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_schemes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_time_balances: {
        Row: {
          company_id: string
          created_at: string
          current_balance: number
          employee_id: string
          id: string
          last_calculated_at: string
          total_earned: number
          total_expired: number
          total_used: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_balance?: number
          employee_id: string
          id?: string
          last_calculated_at?: string
          total_earned?: number
          total_expired?: number
          total_used?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_balance?: number
          employee_id?: string
          id?: string
          last_calculated_at?: string
          total_earned?: number
          total_expired?: number
          total_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_time_balances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_time_earned: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          employee_id: string
          expires_at: string | null
          hours_earned: number
          id: string
          notes: string | null
          policy_id: string | null
          reason: string
          rejection_reason: string | null
          status: string
          updated_at: string
          work_date: string
          work_type: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          expires_at?: string | null
          hours_earned: number
          id?: string
          notes?: string | null
          policy_id?: string | null
          reason: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          work_date: string
          work_type?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          expires_at?: string | null
          hours_earned?: number
          id?: string
          notes?: string | null
          policy_id?: string | null
          reason?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          work_date?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_time_earned_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_earned_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_earned_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_earned_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "comp_time_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_time_policies: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          expiry_days: number | null
          expiry_type: string
          id: string
          is_active: boolean
          max_balance_hours: number | null
          name: string
          requires_approval: boolean
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          expiry_days?: number | null
          expiry_type?: string
          id?: string
          is_active?: boolean
          max_balance_hours?: number | null
          name?: string
          requires_approval?: boolean
          start_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          expiry_days?: number | null
          expiry_type?: string
          id?: string
          is_active?: boolean
          max_balance_hours?: number | null
          name?: string
          requires_approval?: boolean
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_time_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_time_used: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          employee_id: string
          hours_used: number
          id: string
          leave_request_id: string | null
          reason: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          use_date: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          hours_used: number
          id?: string
          leave_request_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          use_date: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          hours_used?: number
          id?: string
          leave_request_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          use_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_time_used_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_used_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_used_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_time_used_leave_request_id_fkey"
            columns: ["leave_request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          code: string
          country: string | null
          created_at: string
          division_id: string | null
          email: string | null
          group_id: string | null
          id: string
          industry: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          country?: string | null
          created_at?: string
          division_id?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          country?: string | null
          created_at?: string
          division_id?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "company_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      company_branch_locations: {
        Row: {
          address: string | null
          city: string | null
          code: string
          company_id: string
          country: string | null
          created_at: string
          email: string | null
          end_date: string | null
          id: string
          is_active: boolean
          is_headquarters: boolean
          name: string
          phone: string | null
          postal_code: string | null
          start_date: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          company_id: string
          country?: string | null
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_headquarters?: boolean
          name: string
          phone?: string | null
          postal_code?: string | null
          start_date?: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          company_id?: string
          country?: string | null
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_headquarters?: boolean
          name?: string
          phone?: string | null
          postal_code?: string | null
          start_date?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_branch_locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_divisions: {
        Row: {
          code: string
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_divisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_groups: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      competencies: {
        Row: {
          category: string
          code: string
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          proficiency_levels: Json | null
          start_date: string
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          proficiency_levels?: Json | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          proficiency_levels?: Json | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_gaps: {
        Row: {
          action_plan: string | null
          competency_id: string
          created_at: string
          created_by: string | null
          current_level_id: string | null
          employee_id: string
          gap_score: number | null
          id: string
          job_id: string | null
          notes: string | null
          priority: string | null
          required_level_id: string | null
          required_weighting: number | null
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          action_plan?: string | null
          competency_id: string
          created_at?: string
          created_by?: string | null
          current_level_id?: string | null
          employee_id: string
          gap_score?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          priority?: string | null
          required_level_id?: string | null
          required_weighting?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          action_plan?: string | null
          competency_id?: string
          created_at?: string
          created_by?: string | null
          current_level_id?: string | null
          employee_id?: string
          gap_score?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          priority?: string | null
          required_level_id?: string | null
          required_weighting?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_gaps_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_gaps_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_gaps_current_level_id_fkey"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "competency_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_gaps_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_gaps_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_gaps_required_level_id_fkey"
            columns: ["required_level_id"]
            isOneToOne: false
            referencedRelation: "competency_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_levels: {
        Row: {
          code: string
          competency_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          level_order: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          competency_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level_order?: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          competency_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level_order?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_levels_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      country_holidays: {
        Row: {
          country: string
          created_at: string
          description: string | null
          holiday_date: string
          id: string
          is_active: boolean | null
          is_half_day: boolean | null
          is_recurring: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          holiday_date: string
          id?: string
          is_active?: boolean | null
          is_half_day?: boolean | null
          is_recurring?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          holiday_date?: string
          id?: string
          is_active?: boolean | null
          is_half_day?: boolean | null
          is_recurring?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          company_division_id: string | null
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_division_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_division_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_division_id_fkey"
            columns: ["company_division_id"]
            isOneToOne: false
            referencedRelation: "company_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          group_id: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "company_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "policy_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          address_type: string
          city: string
          country: string
          created_at: string
          effective_date: string
          employee_id: string
          end_date: string | null
          id: string
          is_primary: boolean
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          address_type?: string
          city: string
          country?: string
          created_at?: string
          effective_date?: string
          employee_id: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          address_type?: string
          city?: string
          country?: string
          created_at?: string
          effective_date?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_addresses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_background_checks: {
        Row: {
          check_type: string
          completed_date: string | null
          created_at: string
          employee_id: string
          expiry_date: string | null
          id: string
          notes: string | null
          provider: string | null
          reference_number: string | null
          requested_date: string
          result: string | null
          status: string
          updated_at: string
        }
        Insert: {
          check_type: string
          completed_date?: string | null
          created_at?: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          provider?: string | null
          reference_number?: string | null
          requested_date: string
          result?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          check_type?: string
          completed_date?: string | null
          created_at?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          provider?: string | null
          reference_number?: string | null
          requested_date?: string
          result?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_background_checks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string
          bank_name: string
          created_at: string
          currency: string
          effective_date: string
          employee_id: string
          end_date: string | null
          iban: string | null
          id: string
          is_primary: boolean
          routing_number: string | null
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type?: string
          bank_name: string
          created_at?: string
          currency?: string
          effective_date?: string
          employee_id: string
          end_date?: string | null
          iban?: string | null
          id?: string
          is_primary?: boolean
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string
          bank_name?: string
          created_at?: string
          currency?: string
          effective_date?: string
          employee_id?: string
          end_date?: string | null
          iban?: string | null
          id?: string
          is_primary?: boolean
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_bank_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_beneficiaries: {
        Row: {
          address: string | null
          beneficiary_type: string
          created_at: string
          date_of_birth: string | null
          effective_date: string
          email: string | null
          employee_id: string
          end_date: string | null
          full_name: string
          id: string
          is_primary: boolean
          percentage: number
          phone: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          beneficiary_type?: string
          created_at?: string
          date_of_birth?: string | null
          effective_date?: string
          email?: string | null
          employee_id: string
          end_date?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          percentage?: number
          phone?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          beneficiary_type?: string
          created_at?: string
          date_of_birth?: string | null
          effective_date?: string
          email?: string | null
          employee_id?: string
          end_date?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          percentage?: number
          phone?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_beneficiaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_branch_locations: {
        Row: {
          branch_location_id: string
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          is_primary: boolean
          notes: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          branch_location_id: string
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          branch_location_id?: string
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_branch_locations_branch_location_id_fkey"
            columns: ["branch_location_id"]
            isOneToOne: false
            referencedRelation: "company_branch_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_branch_locations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_certificates: {
        Row: {
          certificate_name: string
          certificate_number: string | null
          created_at: string
          employee_id: string
          end_date: string | null
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          issue_date: string
          issuing_organization: string
          notes: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          certificate_name: string
          certificate_number?: string | null
          created_at?: string
          employee_id: string
          end_date?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          issue_date: string
          issuing_organization: string
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          certificate_name?: string
          certificate_number?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string
          issuing_organization?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_certificates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_competencies: {
        Row: {
          competency_id: string
          competency_level_id: string | null
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          proficiency_date: string | null
          start_date: string
          updated_at: string
          weighting: number
        }
        Insert: {
          competency_id: string
          competency_level_id?: string | null
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          proficiency_date?: string | null
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Update: {
          competency_id?: string
          competency_level_id?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          proficiency_date?: string | null
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_competencies_competency_level_id_fkey"
            columns: ["competency_level_id"]
            isOneToOne: false
            referencedRelation: "competency_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_competencies_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contacts: {
        Row: {
          contact_type: string
          contact_value: string
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          is_primary: boolean
          notes: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          contact_type: string
          contact_value: string
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          contact_type?: string
          contact_value?: string
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_dependents: {
        Row: {
          created_at: string
          date_of_birth: string | null
          employee_id: string
          full_name: string
          gender: string | null
          id: string
          id_number: string | null
          is_disabled: boolean | null
          is_student: boolean | null
          nationality: string | null
          notes: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          employee_id: string
          full_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          is_disabled?: boolean | null
          is_student?: boolean | null
          nationality?: string | null
          notes?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          employee_id?: string
          full_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          is_disabled?: boolean | null
          is_student?: boolean | null
          nationality?: string | null
          notes?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_dependents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          notes: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_emergency_contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          employee_id: string
          end_date: string | null
          full_name: string
          id: string
          is_primary: boolean
          notes: string | null
          phone_primary: string
          phone_secondary: string | null
          relationship: string
          start_date: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          employee_id: string
          end_date?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          phone_primary: string
          phone_secondary?: string | null
          relationship: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string
          end_date?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          phone_primary?: string
          phone_secondary?: string | null
          relationship?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_emergency_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_interests: {
        Row: {
          category: string | null
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          interest_name: string
          notes: string | null
          proficiency_level: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          interest_name: string
          notes?: string | null
          proficiency_level?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          interest_name?: string
          notes?: string | null
          proficiency_level?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_interests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_licenses: {
        Row: {
          created_at: string
          employee_id: string
          expiry_date: string | null
          id: string
          issue_date: string
          issuing_authority: string
          issuing_country: string | null
          license_number: string
          license_type: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuing_authority: string
          issuing_country?: string | null
          license_number: string
          license_type: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuing_authority?: string
          issuing_country?: string | null
          license_number?: string
          license_type?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_licenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_medical_profiles: {
        Row: {
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          disabilities: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_medical_info: string | null
          employee_id: string
          end_date: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          medications: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          disabilities?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_medical_info?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medications?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          disabilities?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_medical_info?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medications?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_medical_profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_memberships: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          membership_number: string | null
          membership_type: string
          notes: string | null
          organization_name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          membership_number?: string | null
          membership_type: string
          notes?: string | null
          organization_name: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          membership_number?: string | null
          membership_type?: string
          notes?: string | null
          organization_name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_memberships_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_pay_groups: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          pay_frequency: string
          pay_group_name: string
          payment_method: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          pay_frequency: string
          pay_group_name: string
          payment_method?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          pay_frequency?: string
          pay_group_name?: string
          payment_method?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_pay_groups_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_position_history: {
        Row: {
          action: string
          change_reason: string | null
          changed_by: string | null
          created_at: string
          employee_id: string
          employee_position_id: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          position_id: string
        }
        Insert: {
          action: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          employee_id: string
          employee_position_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          position_id: string
        }
        Update: {
          action?: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          employee_id?: string
          employee_position_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          position_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_position_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_position_history_employee_position_id_fkey"
            columns: ["employee_position_id"]
            isOneToOne: false
            referencedRelation: "employee_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_position_history_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_positions: {
        Row: {
          benefits_profile: Json | null
          compensation_amount: number | null
          compensation_currency: string | null
          compensation_frequency: string | null
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          position_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          benefits_profile?: Json | null
          compensation_amount?: number | null
          compensation_currency?: string | null
          compensation_frequency?: string | null
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          position_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          benefits_profile?: Json | null
          compensation_amount?: number | null
          compensation_currency?: string | null
          compensation_frequency?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          position_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_positions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_positions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_privacy_settings: {
        Row: {
          created_at: string
          id: string
          share_birthday: boolean
          share_marriage: boolean
          share_new_child: boolean
          share_promotion: boolean
          share_work_anniversary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          share_birthday?: boolean
          share_marriage?: boolean
          share_new_child?: boolean
          share_promotion?: boolean
          share_work_anniversary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          share_birthday?: boolean
          share_marriage?: boolean
          share_new_child?: boolean
          share_promotion?: boolean
          share_work_anniversary?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_references: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          employee_id: string
          feedback: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          position: string | null
          reference_date: string | null
          relationship: string
          status: string
          updated_at: string
          years_known: number | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          employee_id: string
          feedback?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          reference_date?: string | null
          relationship: string
          status?: string
          updated_at?: string
          years_known?: number | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string
          feedback?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          reference_date?: string | null
          relationship?: string
          status?: string
          updated_at?: string
          years_known?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_references_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_transactions: {
        Row: {
          acting_allowance: number | null
          acting_end_date: string | null
          acting_position_id: string | null
          acting_reason_id: string | null
          acting_start_date: string | null
          company_id: string | null
          confirmation_date: string | null
          contract_type_id: string | null
          created_at: string
          created_by: string
          department_id: string | null
          effective_date: string
          employee_id: string | null
          employment_type_id: string | null
          exit_interview_completed: boolean | null
          extension_days: number | null
          extension_reason_id: string | null
          from_company_id: string | null
          from_department_id: string | null
          from_position_id: string | null
          hire_type_id: string | null
          id: string
          last_working_date: string | null
          new_probation_end_date: string | null
          notes: string | null
          original_probation_end_date: string | null
          position_id: string | null
          probation_end_date: string | null
          promotion_reason_id: string | null
          requires_workflow: boolean | null
          salary_adjustment: number | null
          salary_adjustment_type: string | null
          status: string
          termination_reason_id: string | null
          termination_type: string | null
          to_company_id: string | null
          to_department_id: string | null
          to_position_id: string | null
          transaction_number: string
          transaction_type_id: string
          transfer_reason_id: string | null
          updated_at: string
          workflow_instance_id: string | null
        }
        Insert: {
          acting_allowance?: number | null
          acting_end_date?: string | null
          acting_position_id?: string | null
          acting_reason_id?: string | null
          acting_start_date?: string | null
          company_id?: string | null
          confirmation_date?: string | null
          contract_type_id?: string | null
          created_at?: string
          created_by: string
          department_id?: string | null
          effective_date: string
          employee_id?: string | null
          employment_type_id?: string | null
          exit_interview_completed?: boolean | null
          extension_days?: number | null
          extension_reason_id?: string | null
          from_company_id?: string | null
          from_department_id?: string | null
          from_position_id?: string | null
          hire_type_id?: string | null
          id?: string
          last_working_date?: string | null
          new_probation_end_date?: string | null
          notes?: string | null
          original_probation_end_date?: string | null
          position_id?: string | null
          probation_end_date?: string | null
          promotion_reason_id?: string | null
          requires_workflow?: boolean | null
          salary_adjustment?: number | null
          salary_adjustment_type?: string | null
          status?: string
          termination_reason_id?: string | null
          termination_type?: string | null
          to_company_id?: string | null
          to_department_id?: string | null
          to_position_id?: string | null
          transaction_number: string
          transaction_type_id: string
          transfer_reason_id?: string | null
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Update: {
          acting_allowance?: number | null
          acting_end_date?: string | null
          acting_position_id?: string | null
          acting_reason_id?: string | null
          acting_start_date?: string | null
          company_id?: string | null
          confirmation_date?: string | null
          contract_type_id?: string | null
          created_at?: string
          created_by?: string
          department_id?: string | null
          effective_date?: string
          employee_id?: string | null
          employment_type_id?: string | null
          exit_interview_completed?: boolean | null
          extension_days?: number | null
          extension_reason_id?: string | null
          from_company_id?: string | null
          from_department_id?: string | null
          from_position_id?: string | null
          hire_type_id?: string | null
          id?: string
          last_working_date?: string | null
          new_probation_end_date?: string | null
          notes?: string | null
          original_probation_end_date?: string | null
          position_id?: string | null
          probation_end_date?: string | null
          promotion_reason_id?: string | null
          requires_workflow?: boolean | null
          salary_adjustment?: number | null
          salary_adjustment_type?: string | null
          status?: string
          termination_reason_id?: string | null
          termination_type?: string | null
          to_company_id?: string | null
          to_department_id?: string | null
          to_position_id?: string | null
          transaction_number?: string
          transaction_type_id?: string
          transfer_reason_id?: string | null
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_transactions_acting_position_id_fkey"
            columns: ["acting_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_acting_reason_id_fkey"
            columns: ["acting_reason_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_contract_type_id_fkey"
            columns: ["contract_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_employment_type_id_fkey"
            columns: ["employment_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_extension_reason_id_fkey"
            columns: ["extension_reason_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_from_company_id_fkey"
            columns: ["from_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_from_department_id_fkey"
            columns: ["from_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_from_position_id_fkey"
            columns: ["from_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_hire_type_id_fkey"
            columns: ["hire_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_promotion_reason_id_fkey"
            columns: ["promotion_reason_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_termination_reason_id_fkey"
            columns: ["termination_reason_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_to_company_id_fkey"
            columns: ["to_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_to_department_id_fkey"
            columns: ["to_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_to_position_id_fkey"
            columns: ["to_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_transfer_reason_id_fkey"
            columns: ["transfer_reason_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_transactions_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_work_permits: {
        Row: {
          created_at: string
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          issuing_country: string
          notes: string | null
          permit_number: string
          permit_type: string
          sponsoring_company: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          issuing_country: string
          notes?: string | null
          permit_number: string
          permit_type: string
          sponsoring_company?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          issuing_country?: string
          notes?: string | null
          permit_number?: string
          permit_type?: string
          sponsoring_company?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_work_permits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_internal: boolean
          note_type: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_internal?: boolean
          note_type?: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_internal?: boolean
          note_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "er_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_case_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_cases: {
        Row: {
          actual_resolution_date: string | null
          assigned_to: string | null
          attachments: Json | null
          case_number: string
          case_type: string
          category: string | null
          company_id: string
          created_at: string
          description: string | null
          employee_id: string
          id: string
          is_confidential: boolean
          reported_by: string | null
          reported_date: string
          resolution_summary: string | null
          severity: string
          status: string
          target_resolution_date: string | null
          title: string
          updated_at: string
          witnesses: Json | null
        }
        Insert: {
          actual_resolution_date?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          case_number: string
          case_type?: string
          category?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          employee_id: string
          id?: string
          is_confidential?: boolean
          reported_by?: string | null
          reported_date?: string
          resolution_summary?: string | null
          severity?: string
          status?: string
          target_resolution_date?: string | null
          title: string
          updated_at?: string
          witnesses?: Json | null
        }
        Update: {
          actual_resolution_date?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          case_number?: string
          case_type?: string
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          employee_id?: string
          id?: string
          is_confidential?: boolean
          reported_by?: string | null
          reported_date?: string
          resolution_summary?: string | null
          severity?: string
          status?: string
          target_resolution_date?: string | null
          title?: string
          updated_at?: string
          witnesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "er_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_cases_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_cases_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_disciplinary_actions: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_employee: boolean | null
          action_type: string
          appeal_notes: string | null
          appeal_status: string | null
          attachments: Json | null
          case_id: string | null
          company_id: string
          created_at: string
          description: string | null
          effective_date: string
          employee_id: string
          employee_response: string | null
          expiry_date: string | null
          id: string
          issued_by: string | null
          issued_date: string
          reason: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          action_type: string
          appeal_notes?: string | null
          appeal_status?: string | null
          attachments?: Json | null
          case_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          effective_date?: string
          employee_id: string
          employee_response?: string | null
          expiry_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string
          reason: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          action_type?: string
          appeal_notes?: string | null
          appeal_status?: string | null
          attachments?: Json | null
          case_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          effective_date?: string
          employee_id?: string
          employee_response?: string | null
          expiry_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string
          reason?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_disciplinary_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "er_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_disciplinary_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_disciplinary_actions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_disciplinary_actions_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_exit_interviews: {
        Row: {
          company_id: string
          compensation_satisfaction: number | null
          created_at: string
          culture_satisfaction: number | null
          departure_reason: string | null
          employee_id: string
          feedback_summary: string | null
          growth_satisfaction: number | null
          id: string
          improvement_suggestions: string | null
          interview_date: string
          interviewer_id: string | null
          is_confidential: boolean
          last_working_date: string | null
          management_satisfaction: number | null
          negative_aspects: string | null
          overall_satisfaction: number | null
          positive_aspects: string | null
          status: string
          updated_at: string
          worklife_balance_satisfaction: number | null
          would_rejoin: boolean | null
        }
        Insert: {
          company_id: string
          compensation_satisfaction?: number | null
          created_at?: string
          culture_satisfaction?: number | null
          departure_reason?: string | null
          employee_id: string
          feedback_summary?: string | null
          growth_satisfaction?: number | null
          id?: string
          improvement_suggestions?: string | null
          interview_date: string
          interviewer_id?: string | null
          is_confidential?: boolean
          last_working_date?: string | null
          management_satisfaction?: number | null
          negative_aspects?: string | null
          overall_satisfaction?: number | null
          positive_aspects?: string | null
          status?: string
          updated_at?: string
          worklife_balance_satisfaction?: number | null
          would_rejoin?: boolean | null
        }
        Update: {
          company_id?: string
          compensation_satisfaction?: number | null
          created_at?: string
          culture_satisfaction?: number | null
          departure_reason?: string | null
          employee_id?: string
          feedback_summary?: string | null
          growth_satisfaction?: number | null
          id?: string
          improvement_suggestions?: string | null
          interview_date?: string
          interviewer_id?: string | null
          is_confidential?: boolean
          last_working_date?: string | null
          management_satisfaction?: number | null
          negative_aspects?: string | null
          overall_satisfaction?: number | null
          positive_aspects?: string | null
          status?: string
          updated_at?: string
          worklife_balance_satisfaction?: number | null
          would_rejoin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "er_exit_interviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_exit_interviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_exit_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_recognition: {
        Row: {
          attachments: Json | null
          award_date: string
          awarded_by: string | null
          category: string | null
          company_id: string
          created_at: string
          currency: string | null
          description: string | null
          employee_id: string
          id: string
          is_public: boolean
          monetary_value: number | null
          recognition_type: string
          title: string
        }
        Insert: {
          attachments?: Json | null
          award_date?: string
          awarded_by?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          employee_id: string
          id?: string
          is_public?: boolean
          monetary_value?: number | null
          recognition_type: string
          title: string
        }
        Update: {
          attachments?: Json | null
          award_date?: string
          awarded_by?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          is_public?: boolean
          monetary_value?: number | null
          recognition_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_recognition_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_recognition_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_recognition_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_survey_responses: {
        Row: {
          employee_id: string | null
          id: string
          responses: Json
          submitted_at: string
          survey_id: string
        }
        Insert: {
          employee_id?: string | null
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id: string
        }
        Update: {
          employee_id?: string | null
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_survey_responses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "er_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      er_surveys: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_anonymous: boolean
          questions: Json
          start_date: string
          status: string
          survey_type: string
          target_departments: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_anonymous?: boolean
          questions?: Json
          start_date: string
          status?: string
          survey_type?: string
          target_departments?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_anonymous?: boolean
          questions?: Json
          start_date?: string
          status?: string
          survey_type?: string
          target_departments?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      er_wellness_enrollments: {
        Row: {
          completion_date: string | null
          created_at: string
          employee_id: string
          enrolled_date: string
          feedback: string | null
          id: string
          program_id: string
          satisfaction_rating: number | null
          status: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          employee_id: string
          enrolled_date?: string
          feedback?: string | null
          id?: string
          program_id: string
          satisfaction_rating?: number | null
          status?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          employee_id?: string
          enrolled_date?: string
          feedback?: string | null
          id?: string
          program_id?: string
          satisfaction_rating?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_wellness_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_wellness_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "er_wellness_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      er_wellness_programs: {
        Row: {
          budget: number | null
          company_id: string
          coordinator_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          max_participants: number | null
          name: string
          program_type: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          company_id: string
          coordinator_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          name: string
          program_type: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          company_id?: string
          coordinator_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          name?: string
          program_type?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_wellness_programs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_wellness_programs_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          created_at: string
          description: string | null
          escalate_after_hours: number
          escalation_level: number
          id: string
          is_active: boolean
          name: string
          notify_emails: string[]
          notify_governance_body_id: string | null
          priority_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          escalate_after_hours?: number
          escalation_level?: number
          id?: string
          is_active?: boolean
          name: string
          notify_emails?: string[]
          notify_governance_body_id?: string | null
          priority_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          escalate_after_hours?: number
          escalation_level?: number
          id?: string
          is_active?: boolean
          name?: string
          notify_emails?: string[]
          notify_governance_body_id?: string | null
          priority_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_rules_notify_governance_body_id_fkey"
            columns: ["notify_governance_body_id"]
            isOneToOne: false
            referencedRelation: "governance_bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_rules_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "ticket_priorities"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string
          feedback_submission_id: string
          id: string
          question_id: string
          rating_value: number | null
          selected_options: Json | null
          text_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_submission_id: string
          id?: string
          question_id: string
          rating_value?: number | null
          selected_options?: Json | null
          text_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_submission_id?: string
          id?: string
          question_id?: string
          rating_value?: number | null
          selected_options?: Json | null
          text_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_submission_id_fkey"
            columns: ["feedback_submission_id"]
            isOneToOne: false
            referencedRelation: "feedback_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "review_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          created_at: string
          id: string
          review_participant_id: string
          reviewer_id: string
          reviewer_type: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_participant_id: string
          reviewer_id: string
          reviewer_type: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          review_participant_id?: string
          reviewer_id?: string
          reviewer_type?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_review_participant_id_fkey"
            columns: ["review_participant_id"]
            isOneToOne: false
            referencedRelation: "review_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_letters: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          generated_content: string
          id: string
          letter_number: string | null
          rejection_reason: string | null
          requested_by: string
          status: string
          template_id: string
          updated_at: string
          variable_values: Json
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          generated_content: string
          id?: string
          letter_number?: string | null
          rejection_reason?: string | null
          requested_by: string
          status?: string
          template_id: string
          updated_at?: string
          variable_values?: Json
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          generated_content?: string
          id?: string
          letter_number?: string | null
          rejection_reason?: string | null
          requested_by?: string
          status?: string
          template_id?: string
          updated_at?: string
          variable_values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "generated_letters_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_letters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_letters_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "letter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          created_at: string
          error_message: string | null
          file_url: string | null
          generated_by: string | null
          id: string
          output_format: string
          parameters_used: Json
          report_number: string
          row_count: number | null
          status: string
          template_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          output_format: string
          parameters_used?: Json
          report_number: string
          row_count?: number | null
          status?: string
          template_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          output_format?: string
          parameters_used?: Json
          report_number?: string
          row_count?: number | null
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_alignments: {
        Row: {
          alignment_percentage: number | null
          child_goal_id: string
          created_at: string
          id: string
          notes: string | null
          parent_goal_id: string
        }
        Insert: {
          alignment_percentage?: number | null
          child_goal_id: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_goal_id: string
        }
        Update: {
          alignment_percentage?: number | null
          child_goal_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_goal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_alignments_child_goal_id_fkey"
            columns: ["child_goal_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_alignments_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_comments: {
        Row: {
          comment: string
          comment_type: string
          created_at: string
          goal_id: string
          id: string
          is_private: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          comment_type?: string
          created_at?: string
          goal_id: string
          id?: string
          is_private?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          comment_type?: string
          created_at?: string
          goal_id?: string
          id?: string
          is_private?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_comments_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_reviews: {
        Row: {
          created_at: string
          employee_comments: string | null
          goal_id: string
          id: string
          manager_comments: string | null
          progress_at_review: number | null
          rating: number | null
          review_date: string
          review_type: string
          reviewer_id: string
          status_at_review: Database["public"]["Enums"]["goal_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_comments?: string | null
          goal_id: string
          id?: string
          manager_comments?: string | null
          progress_at_review?: number | null
          rating?: number | null
          review_date?: string
          review_type?: string
          reviewer_id: string
          status_at_review?: Database["public"]["Enums"]["goal_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_comments?: string | null
          goal_id?: string
          id?: string
          manager_comments?: string | null
          progress_at_review?: number | null
          rating?: number | null
          review_date?: string
          review_type?: string
          reviewer_id?: string
          status_at_review?: Database["public"]["Enums"]["goal_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_reviews_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_templates: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string
          default_weighting: number | null
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          is_active: boolean
          name: string
          suggested_metrics: Json | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          default_weighting?: number | null
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_active?: boolean
          name: string
          suggested_metrics?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          default_weighting?: number | null
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_active?: boolean
          name?: string
          suggested_metrics?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_bodies: {
        Row: {
          body_type: string
          can_approve_headcount: boolean
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          body_type?: string
          can_approve_headcount?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          body_type?: string
          can_approve_headcount?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_bodies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_members: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string | null
          governance_body_id: string
          id: string
          is_active: boolean
          role_in_body: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date?: string | null
          governance_body_id: string
          id?: string
          is_active?: boolean
          role_in_body?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string | null
          governance_body_id?: string
          id?: string
          is_active?: boolean
          role_in_body?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_members_governance_body_id_fkey"
            columns: ["governance_body_id"]
            isOneToOne: false
            referencedRelation: "governance_bodies"
            referencedColumns: ["id"]
          },
        ]
      }
      headcount_forecasts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          forecast_data: Json
          historical_data: Json
          id: string
          name: string | null
          notes: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          forecast_data: Json
          historical_data: Json
          id?: string
          name?: string | null
          notes?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          forecast_data?: Json
          historical_data?: Json
          id?: string
          name?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "headcount_forecasts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      headcount_request_history: {
        Row: {
          changed_by: string | null
          created_at: string
          headcount_request_id: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          headcount_request_id: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          headcount_request_id?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "headcount_request_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_request_history_headcount_request_id_fkey"
            columns: ["headcount_request_id"]
            isOneToOne: false
            referencedRelation: "headcount_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      headcount_request_signatures: {
        Row: {
          created_at: string
          governance_body_id: string | null
          headcount_request_id: string
          id: string
          ip_address: string | null
          notes: string | null
          signature_hash: string
          signature_type: string
          signed_at: string
          signer_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          governance_body_id?: string | null
          headcount_request_id: string
          id?: string
          ip_address?: string | null
          notes?: string | null
          signature_hash: string
          signature_type?: string
          signed_at?: string
          signer_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          governance_body_id?: string | null
          headcount_request_id?: string
          id?: string
          ip_address?: string | null
          notes?: string | null
          signature_hash?: string
          signature_type?: string
          signed_at?: string
          signer_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "headcount_request_signatures_governance_body_id_fkey"
            columns: ["governance_body_id"]
            isOneToOne: false
            referencedRelation: "governance_bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_request_signatures_headcount_request_id_fkey"
            columns: ["headcount_request_id"]
            isOneToOne: false
            referencedRelation: "headcount_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_request_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      headcount_requests: {
        Row: {
          created_at: string
          current_headcount: number
          governance_body_id: string | null
          id: string
          position_id: string
          reason: string
          requested_by: string
          requested_headcount: number
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          workflow_instance_id: string | null
        }
        Insert: {
          created_at?: string
          current_headcount: number
          governance_body_id?: string | null
          id?: string
          position_id: string
          reason: string
          requested_by: string
          requested_headcount: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Update: {
          created_at?: string
          current_headcount?: number
          governance_body_id?: string | null
          id?: string
          position_id?: string
          reason?: string
          requested_by?: string
          requested_headcount?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "headcount_requests_governance_body_id_fkey"
            columns: ["governance_body_id"]
            isOneToOne: false
            referencedRelation: "governance_bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_requests_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "headcount_requests_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_compliance_audits: {
        Row: {
          attachments: Json | null
          audit_date: string
          audit_type: string
          auditor_name: string | null
          company_id: string
          completion_date: string | null
          compliance_rating: string | null
          corrective_actions: string | null
          created_at: string
          due_date: string | null
          findings: string | null
          id: string
          requirement_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          audit_date: string
          audit_type: string
          auditor_name?: string | null
          company_id: string
          completion_date?: string | null
          compliance_rating?: string | null
          corrective_actions?: string | null
          created_at?: string
          due_date?: string | null
          findings?: string | null
          id?: string
          requirement_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          audit_date?: string
          audit_type?: string
          auditor_name?: string | null
          company_id?: string
          completion_date?: string | null
          compliance_rating?: string | null
          corrective_actions?: string | null
          created_at?: string
          due_date?: string | null
          findings?: string | null
          id?: string
          requirement_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_compliance_audits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_compliance_audits_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "hse_compliance_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_compliance_requirements: {
        Row: {
          attachments: Json | null
          code: string
          company_id: string
          compliance_status: string | null
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          issue_date: string | null
          last_audit_date: string | null
          next_audit_date: string | null
          notes: string | null
          reference_number: string | null
          regulatory_body: string | null
          renewal_lead_days: number | null
          requirement_type: string
          responsible_person_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          code: string
          company_id: string
          compliance_status?: string | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issue_date?: string | null
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          reference_number?: string | null
          regulatory_body?: string | null
          renewal_lead_days?: number | null
          requirement_type: string
          responsible_person_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          code?: string
          company_id?: string
          compliance_status?: string | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issue_date?: string | null
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          reference_number?: string | null
          regulatory_body?: string | null
          renewal_lead_days?: number | null
          requirement_type?: string
          responsible_person_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_compliance_requirements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_compliance_requirements_responsible_person_id_fkey"
            columns: ["responsible_person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_hazards: {
        Row: {
          additional_controls: string | null
          affected_persons: string | null
          assessment_id: string
          completion_date: string | null
          created_at: string
          description: string
          existing_controls: string | null
          hazard_type: string
          id: string
          likelihood: number
          responsible_person_id: string | null
          risk_score: number | null
          severity: number
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          additional_controls?: string | null
          affected_persons?: string | null
          assessment_id: string
          completion_date?: string | null
          created_at?: string
          description: string
          existing_controls?: string | null
          hazard_type: string
          id?: string
          likelihood?: number
          responsible_person_id?: string | null
          risk_score?: number | null
          severity?: number
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          additional_controls?: string | null
          affected_persons?: string | null
          assessment_id?: string
          completion_date?: string | null
          created_at?: string
          description?: string
          existing_controls?: string | null
          hazard_type?: string
          id?: string
          likelihood?: number
          responsible_person_id?: string | null
          risk_score?: number | null
          severity?: number
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_hazards_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "hse_risk_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_hazards_responsible_person_id_fkey"
            columns: ["responsible_person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_incidents: {
        Row: {
          attachments: Json | null
          body_part_affected: string | null
          company_id: string
          corrective_actions: string | null
          created_at: string
          days_lost: number | null
          description: string | null
          id: string
          incident_date: string
          incident_number: string | null
          incident_time: string | null
          incident_type: string
          injured_employee_id: string | null
          injury_type: string | null
          investigation_date: string | null
          investigation_findings: string | null
          investigation_lead_id: string | null
          is_osha_reportable: boolean | null
          is_recordable: boolean | null
          location: string | null
          preventive_measures: string | null
          reported_by: string | null
          reported_date: string
          root_cause: string | null
          severity: string
          status: string
          title: string
          treatment_required: string | null
          updated_at: string
          witnesses: string[] | null
          workflow_instance_id: string | null
        }
        Insert: {
          attachments?: Json | null
          body_part_affected?: string | null
          company_id: string
          corrective_actions?: string | null
          created_at?: string
          days_lost?: number | null
          description?: string | null
          id?: string
          incident_date: string
          incident_number?: string | null
          incident_time?: string | null
          incident_type: string
          injured_employee_id?: string | null
          injury_type?: string | null
          investigation_date?: string | null
          investigation_findings?: string | null
          investigation_lead_id?: string | null
          is_osha_reportable?: boolean | null
          is_recordable?: boolean | null
          location?: string | null
          preventive_measures?: string | null
          reported_by?: string | null
          reported_date?: string
          root_cause?: string | null
          severity?: string
          status?: string
          title: string
          treatment_required?: string | null
          updated_at?: string
          witnesses?: string[] | null
          workflow_instance_id?: string | null
        }
        Update: {
          attachments?: Json | null
          body_part_affected?: string | null
          company_id?: string
          corrective_actions?: string | null
          created_at?: string
          days_lost?: number | null
          description?: string | null
          id?: string
          incident_date?: string
          incident_number?: string | null
          incident_time?: string | null
          incident_type?: string
          injured_employee_id?: string | null
          injury_type?: string | null
          investigation_date?: string | null
          investigation_findings?: string | null
          investigation_lead_id?: string | null
          is_osha_reportable?: boolean | null
          is_recordable?: boolean | null
          location?: string | null
          preventive_measures?: string | null
          reported_by?: string | null
          reported_date?: string
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          treatment_required?: string | null
          updated_at?: string
          witnesses?: string[] | null
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hse_incidents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_incidents_injured_employee_id_fkey"
            columns: ["injured_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_incidents_investigation_lead_id_fkey"
            columns: ["investigation_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_inspections: {
        Row: {
          attachments: Json | null
          company_id: string
          corrective_actions: string | null
          created_at: string
          findings: string | null
          follow_up_date: string | null
          id: string
          inspection_date: string
          inspection_type: string
          inspector_id: string | null
          location: string | null
          overall_rating: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          company_id: string
          corrective_actions?: string | null
          created_at?: string
          findings?: string | null
          follow_up_date?: string | null
          id?: string
          inspection_date: string
          inspection_type: string
          inspector_id?: string | null
          location?: string | null
          overall_rating?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          company_id?: string
          corrective_actions?: string | null
          created_at?: string
          findings?: string | null
          follow_up_date?: string | null
          id?: string
          inspection_date?: string
          inspection_type?: string
          inspector_id?: string | null
          location?: string | null
          overall_rating?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_policy_acknowledgments: {
        Row: {
          acknowledged_at: string
          employee_id: string
          id: string
          ip_address: string | null
          policy_id: string
        }
        Insert: {
          acknowledged_at?: string
          employee_id: string
          id?: string
          ip_address?: string | null
          policy_id: string
        }
        Update: {
          acknowledged_at?: string
          employee_id?: string
          id?: string
          ip_address?: string | null
          policy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_policy_acknowledgments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "hse_safety_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_risk_assessments: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          assessed_by: string | null
          assessment_date: string
          assessment_number: string | null
          attachments: Json | null
          company_id: string
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          location: string | null
          methodology: string | null
          overall_risk_level: string | null
          recommendations: string | null
          review_date: string | null
          scope: string | null
          status: string
          title: string
          updated_at: string
          workflow_instance_id: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          assessed_by?: string | null
          assessment_date?: string
          assessment_number?: string | null
          attachments?: Json | null
          company_id: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          location?: string | null
          methodology?: string | null
          overall_risk_level?: string | null
          recommendations?: string | null
          review_date?: string | null
          scope?: string | null
          status?: string
          title: string
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          assessed_by?: string | null
          assessment_date?: string
          assessment_number?: string | null
          attachments?: Json | null
          company_id?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          location?: string | null
          methodology?: string | null
          overall_risk_level?: string | null
          recommendations?: string | null
          review_date?: string | null
          scope?: string | null
          status?: string
          title?: string
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hse_risk_assessments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_risk_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_risk_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_risk_assessments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_safety_policies: {
        Row: {
          acknowledgment_required: boolean | null
          approved_by: string | null
          approved_date: string | null
          attachments: Json | null
          code: string
          company_id: string
          content: string | null
          created_at: string
          description: string | null
          effective_date: string
          id: string
          is_active: boolean | null
          owner_id: string | null
          policy_type: string
          review_date: string | null
          status: string
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          acknowledgment_required?: boolean | null
          approved_by?: string | null
          approved_date?: string | null
          attachments?: Json | null
          code: string
          company_id: string
          content?: string | null
          created_at?: string
          description?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          owner_id?: string | null
          policy_type: string
          review_date?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          acknowledgment_required?: boolean | null
          approved_by?: string | null
          approved_date?: string | null
          attachments?: Json | null
          code?: string
          company_id?: string
          content?: string | null
          created_at?: string
          description?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          owner_id?: string | null
          policy_type?: string
          review_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hse_safety_policies_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_safety_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_safety_policies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_safety_training: {
        Row: {
          applicable_departments: string[] | null
          applicable_positions: string[] | null
          code: string
          company_id: string
          created_at: string
          description: string | null
          duration_hours: number | null
          end_date: string | null
          frequency_months: number | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          lms_course_id: string | null
          start_date: string
          title: string
          training_type: string
          updated_at: string
        }
        Insert: {
          applicable_departments?: string[] | null
          applicable_positions?: string[] | null
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          frequency_months?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          lms_course_id?: string | null
          start_date?: string
          title: string
          training_type: string
          updated_at?: string
        }
        Update: {
          applicable_departments?: string[] | null
          applicable_positions?: string[] | null
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          frequency_months?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          lms_course_id?: string | null
          start_date?: string
          title?: string
          training_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_safety_training_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_training_records: {
        Row: {
          attachments: Json | null
          certificate_number: string | null
          company_id: string
          created_at: string
          employee_id: string
          expiry_date: string | null
          id: string
          notes: string | null
          pass_mark: number | null
          score: number | null
          status: string
          trainer_name: string | null
          training_date: string
          training_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          certificate_number?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          pass_mark?: number | null
          score?: number | null
          status?: string
          trainer_name?: string | null
          training_date: string
          training_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          certificate_number?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          pass_mark?: number | null
          score?: number | null
          status?: string
          trainer_name?: string | null
          training_date?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hse_training_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_training_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hse_training_records_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "hse_safety_training"
            referencedColumns: ["id"]
          },
        ]
      }
      idp_activities: {
        Row: {
          activity_type: string
          completion_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          goal_id: string
          id: string
          notes: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_type?: string
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          goal_id: string
          id?: string
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          goal_id?: string
          id?: string
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "idp_activities_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "idp_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      idp_goals: {
        Row: {
          category: string
          completion_date: string | null
          created_at: string
          description: string | null
          id: string
          idp_id: string
          notes: string | null
          priority: string
          progress_percentage: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          idp_id: string
          notes?: string | null
          priority?: string
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          idp_id?: string
          notes?: string | null
          priority?: string
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "idp_goals_idp_id_fkey"
            columns: ["idp_id"]
            isOneToOne: false
            referencedRelation: "individual_development_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_development_plans: {
        Row: {
          actual_completion_date: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          employee_id: string
          id: string
          manager_id: string | null
          start_date: string
          status: string
          target_completion_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_id: string
          id?: string
          manager_id?: string | null
          start_date: string
          status?: string
          target_completion_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          manager_id?: string | null
          start_date?: string
          status?: string
          target_completion_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_development_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_development_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_development_plans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_development_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_schedules: {
        Row: {
          application_id: string
          cancelled_at: string | null
          cancelled_reason: string | null
          created_at: string
          duration_minutes: number | null
          feedback: Json | null
          id: string
          interview_round: number | null
          interview_type: string
          interviewer_ids: string[] | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          overall_rating: number | null
          recommendation: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string
          duration_minutes?: number | null
          feedback?: Json | null
          id?: string
          interview_round?: number | null
          interview_type?: string
          interviewer_ids?: string[] | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          overall_rating?: number | null
          recommendation?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string
          duration_minutes?: number | null
          feedback?: Json | null
          id?: string
          interview_round?: number | null
          interview_type?: string
          interviewer_ids?: string[] | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          overall_rating?: number | null
          recommendation?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_announcements: {
        Row: {
          announcement_type: string
          company_id: string | null
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_pinned: boolean
          is_published: boolean
          published_at: string | null
          related_employee_id: string | null
          target_departments: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          announcement_type?: string
          company_id?: string | null
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          published_at?: string | null
          related_employee_id?: string | null
          target_departments?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          announcement_type?: string
          company_id?: string | null
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          published_at?: string | null
          related_employee_id?: string | null
          target_departments?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_announcements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_announcements_related_employee_id_fkey"
            columns: ["related_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_blog_posts: {
        Row: {
          author_id: string
          company_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          company_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          company_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "intranet_blog_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_gallery: {
        Row: {
          album_name: string | null
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_published: boolean
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          album_name?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_published?: boolean
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          album_name?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_published?: boolean
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_gallery_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_board_configs: {
        Row: {
          api_endpoint: string
          auto_post: boolean | null
          code: string
          company_id: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          api_endpoint: string
          auto_post?: boolean | null
          code: string
          company_id: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          api_endpoint?: string
          auto_post?: boolean | null
          code?: string
          company_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_board_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_board_webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          job_board_config_id: string | null
          payload: Json
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          job_board_config_id?: string | null
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          job_board_config_id?: string | null
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_board_webhook_logs_job_board_config_id_fkey"
            columns: ["job_board_config_id"]
            isOneToOne: false
            referencedRelation: "job_board_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_competencies: {
        Row: {
          competency_id: string
          competency_level_id: string | null
          created_at: string
          end_date: string | null
          id: string
          is_required: boolean
          job_id: string
          notes: string | null
          start_date: string
          updated_at: string
          weighting: number
        }
        Insert: {
          competency_id: string
          competency_level_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_required?: boolean
          job_id: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Update: {
          competency_id?: string
          competency_level_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_required?: boolean
          job_id?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_competencies_competency_level_id_fkey"
            columns: ["competency_level_id"]
            isOneToOne: false
            referencedRelation: "competency_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_competencies_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_families: {
        Row: {
          code: string
          company_division_id: string | null
          company_id: string
          created_at: string
          department_id: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_division_id?: string | null
          company_id: string
          created_at?: string
          department_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_division_id?: string | null
          company_id?: string
          created_at?: string
          department_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_families_company_division_id_fkey"
            columns: ["company_division_id"]
            isOneToOne: false
            referencedRelation: "company_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_families_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_families_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      job_goals: {
        Row: {
          created_at: string
          end_date: string | null
          goal_description: string | null
          goal_name: string
          id: string
          job_id: string
          notes: string | null
          start_date: string
          updated_at: string
          weighting: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          goal_description?: string | null
          goal_name: string
          id?: string
          job_id: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          goal_description?: string | null
          goal_name?: string
          id?: string
          job_id?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_goals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string
          error_message: string | null
          expires_at: string | null
          external_job_id: string | null
          id: string
          job_board_config_id: string
          last_synced_at: string | null
          posted_at: string | null
          posting_url: string | null
          requisition_id: string
          response_data: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          external_job_id?: string | null
          id?: string
          job_board_config_id: string
          last_synced_at?: string | null
          posted_at?: string | null
          posting_url?: string | null
          requisition_id: string
          response_data?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          external_job_id?: string | null
          id?: string
          job_board_config_id?: string
          last_synced_at?: string | null
          posted_at?: string | null
          posting_url?: string | null
          requisition_id?: string
          response_data?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_job_board_config_id_fkey"
            columns: ["job_board_config_id"]
            isOneToOne: false
            referencedRelation: "job_board_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "job_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requisitions: {
        Row: {
          benefits: string | null
          closed_date: string | null
          company_id: string
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          employment_type: string
          experience_level: string | null
          filled_count: number | null
          headcount_request_id: string | null
          hiring_manager_id: string | null
          id: string
          is_internal_only: boolean | null
          is_remote: boolean | null
          location: string | null
          openings: number | null
          position_id: string | null
          posted_date: string | null
          priority: string | null
          recruiter_id: string | null
          requirements: string | null
          requisition_number: string | null
          responsibilities: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          target_hire_date: string | null
          title: string
          updated_at: string
          workflow_instance_id: string | null
        }
        Insert: {
          benefits?: string | null
          closed_date?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          employment_type?: string
          experience_level?: string | null
          filled_count?: number | null
          headcount_request_id?: string | null
          hiring_manager_id?: string | null
          id?: string
          is_internal_only?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          openings?: number | null
          position_id?: string | null
          posted_date?: string | null
          priority?: string | null
          recruiter_id?: string | null
          requirements?: string | null
          requisition_number?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          target_hire_date?: string | null
          title: string
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Update: {
          benefits?: string | null
          closed_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          employment_type?: string
          experience_level?: string | null
          filled_count?: number | null
          headcount_request_id?: string | null
          hiring_manager_id?: string | null
          id?: string
          is_internal_only?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          openings?: number | null
          position_id?: string | null
          posted_date?: string | null
          priority?: string | null
          recruiter_id?: string | null
          requirements?: string | null
          requisition_number?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          target_hire_date?: string | null
          title?: string
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_requisitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requisitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requisitions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requisitions_headcount_request_id_fkey"
            columns: ["headcount_request_id"]
            isOneToOne: false
            referencedRelation: "headcount_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requisitions_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requisitions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requisitions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_responsibilities: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          job_id: string
          notes: string | null
          responsibility_id: string
          start_date: string
          updated_at: string
          weighting: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          job_id: string
          notes?: string | null
          responsibility_id: string
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          responsibility_id?: string
          start_date?: string
          updated_at?: string
          weighting?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_responsibilities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_responsibilities_responsibility_id_fkey"
            columns: ["responsibility_id"]
            isOneToOne: false
            referencedRelation: "responsibilities"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          code: string
          company_id: string
          created_at: string
          critical_level: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          job_class: string | null
          job_family_id: string
          job_grade: string | null
          job_level: string | null
          name: string
          standard_hours: number | null
          standard_work_period: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          critical_level?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          job_class?: string | null
          job_family_id: string
          job_grade?: string | null
          job_level?: string | null
          name: string
          standard_hours?: number | null
          standard_work_period?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          critical_level?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          job_class?: string | null
          job_family_id?: string
          job_grade?: string | null
          job_level?: string | null
          name?: string
          standard_hours?: number | null
          standard_work_period?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_job_family_id_fkey"
            columns: ["job_family_id"]
            isOneToOne: false
            referencedRelation: "job_families"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          helpful_count: number
          id: string
          is_featured: boolean
          is_published: boolean
          not_helpful_count: number
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          helpful_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          not_helpful_count?: number
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          helpful_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          not_helpful_count?: number
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      key_position_risks: {
        Row: {
          assessed_at: string | null
          assessed_by: string | null
          company_id: string
          created_at: string
          criticality_level: string
          current_incumbent_id: string | null
          flight_risk: boolean | null
          id: string
          impact_if_vacant: string | null
          is_key_position: boolean
          position_id: string
          retirement_risk: boolean | null
          risk_notes: string | null
          updated_at: string
          vacancy_risk: string
        }
        Insert: {
          assessed_at?: string | null
          assessed_by?: string | null
          company_id: string
          created_at?: string
          criticality_level?: string
          current_incumbent_id?: string | null
          flight_risk?: boolean | null
          id?: string
          impact_if_vacant?: string | null
          is_key_position?: boolean
          position_id: string
          retirement_risk?: boolean | null
          risk_notes?: string | null
          updated_at?: string
          vacancy_risk?: string
        }
        Update: {
          assessed_at?: string | null
          assessed_by?: string | null
          company_id?: string
          created_at?: string
          criticality_level?: string
          current_incumbent_id?: string | null
          flight_risk?: boolean | null
          id?: string
          impact_if_vacant?: string | null
          is_key_position?: boolean
          position_id?: string
          retirement_risk?: boolean | null
          risk_notes?: string | null
          updated_at?: string
          vacancy_risk?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_position_risks_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_position_risks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_position_risks_current_incumbent_id_fkey"
            columns: ["current_incumbent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_position_risks_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_accrual_logs: {
        Row: {
          accrual_amount: number
          accrual_date: string
          accrual_frequency: string
          company_id: string
          created_at: string
          employee_id: string
          id: string
          leave_type_id: string
          rule_id: string | null
        }
        Insert: {
          accrual_amount: number
          accrual_date?: string
          accrual_frequency: string
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          leave_type_id: string
          rule_id?: string | null
        }
        Update: {
          accrual_amount?: number
          accrual_date?: string
          accrual_frequency?: string
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          leave_type_id?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_accrual_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_accrual_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_accrual_logs_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_accrual_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "leave_accrual_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_accrual_rules: {
        Row: {
          accrual_amount: number
          accrual_frequency: string
          company_id: string
          created_at: string
          description: string | null
          employee_status: string | null
          employee_type: string | null
          end_date: string | null
          id: string
          is_active: boolean
          leave_type_id: string
          name: string
          priority: number
          salary_grade_id: string | null
          start_date: string
          updated_at: string
          years_of_service_max: number | null
          years_of_service_min: number | null
        }
        Insert: {
          accrual_amount?: number
          accrual_frequency?: string
          company_id: string
          created_at?: string
          description?: string | null
          employee_status?: string | null
          employee_type?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          leave_type_id: string
          name: string
          priority?: number
          salary_grade_id?: string | null
          start_date?: string
          updated_at?: string
          years_of_service_max?: number | null
          years_of_service_min?: number | null
        }
        Update: {
          accrual_amount?: number
          accrual_frequency?: string
          company_id?: string
          created_at?: string
          description?: string | null
          employee_status?: string | null
          employee_type?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          leave_type_id?: string
          name?: string
          priority?: number
          salary_grade_id?: string | null
          start_date?: string
          updated_at?: string
          years_of_service_max?: number | null
          years_of_service_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_accrual_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_accrual_rules_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_accrual_rules_salary_grade_id_fkey"
            columns: ["salary_grade_id"]
            isOneToOne: false
            referencedRelation: "salary_grades"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balance_adjustments: {
        Row: {
          adjusted_by: string
          adjustment_type: string
          amount: number
          balance_id: string
          created_at: string
          effective_date: string
          id: string
          reason: string
        }
        Insert: {
          adjusted_by: string
          adjustment_type: string
          amount: number
          balance_id: string
          created_at?: string
          effective_date?: string
          id?: string
          reason: string
        }
        Update: {
          adjusted_by?: string
          adjustment_type?: string
          amount?: number
          balance_id?: string
          created_at?: string
          effective_date?: string
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_adjustments_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_balance_id_fkey"
            columns: ["balance_id"]
            isOneToOne: false
            referencedRelation: "leave_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balance_recalculations: {
        Row: {
          calculation_type: string
          company_id: string
          created_at: string
          employee_id: string
          id: string
          initiated_by: string | null
          new_balance: Json | null
          notes: string | null
          old_balance: Json | null
          period_end: string
          period_start: string
          triggered_by: string
        }
        Insert: {
          calculation_type: string
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          initiated_by?: string | null
          new_balance?: Json | null
          notes?: string | null
          old_balance?: Json | null
          period_end: string
          period_start: string
          triggered_by: string
        }
        Update: {
          calculation_type?: string
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          initiated_by?: string | null
          new_balance?: Json | null
          notes?: string | null
          old_balance?: Json | null
          period_end?: string
          period_start?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_recalculations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_recalculations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_recalculations_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          accrued_amount: number
          adjustment_amount: number
          carried_forward: number
          created_at: string
          current_balance: number | null
          employee_id: string
          id: string
          last_accrual_date: string | null
          leave_type_id: string
          opening_balance: number
          updated_at: string
          used_amount: number
          year: number
        }
        Insert: {
          accrued_amount?: number
          adjustment_amount?: number
          carried_forward?: number
          created_at?: string
          current_balance?: number | null
          employee_id: string
          id?: string
          last_accrual_date?: string | null
          leave_type_id: string
          opening_balance?: number
          updated_at?: string
          used_amount?: number
          year: number
        }
        Update: {
          accrued_amount?: number
          adjustment_amount?: number
          carried_forward?: number
          created_at?: string
          current_balance?: number | null
          employee_id?: string
          id?: string
          last_accrual_date?: string | null
          leave_type_id?: string
          opening_balance?: number
          updated_at?: string
          used_amount?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_holidays: {
        Row: {
          applies_to_all: boolean
          company_id: string
          country: string | null
          created_at: string
          department_ids: string[] | null
          holiday_date: string
          holiday_type: string | null
          id: string
          is_active: boolean
          is_half_day: boolean
          is_recurring: boolean
          name: string
          updated_at: string
        }
        Insert: {
          applies_to_all?: boolean
          company_id: string
          country?: string | null
          created_at?: string
          department_ids?: string[] | null
          holiday_date: string
          holiday_type?: string | null
          id?: string
          is_active?: boolean
          is_half_day?: boolean
          is_recurring?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          applies_to_all?: boolean
          company_id?: string
          country?: string | null
          created_at?: string
          department_ids?: string[] | null
          holiday_date?: string
          holiday_type?: string | null
          id?: string
          is_active?: boolean
          is_half_day?: boolean
          is_recurring?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_holidays_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          contact_during_leave: string | null
          created_at: string
          duration: number
          employee_id: string
          end_date: string
          end_half: string | null
          handover_notes: string | null
          id: string
          leave_type_id: string
          reason: string | null
          request_number: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          start_half: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          workflow_instance_id: string | null
        }
        Insert: {
          contact_during_leave?: string | null
          created_at?: string
          duration: number
          employee_id: string
          end_date: string
          end_half?: string | null
          handover_notes?: string | null
          id?: string
          leave_type_id: string
          reason?: string | null
          request_number: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          start_half?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Update: {
          contact_during_leave?: string | null
          created_at?: string
          duration?: number
          employee_id?: string
          end_date?: string
          end_half?: string | null
          handover_notes?: string | null
          id?: string
          leave_type_id?: string
          reason?: string | null
          request_number?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          start_half?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_rollover_rules: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          forfeit_unused: boolean
          id: string
          is_active: boolean
          leave_type_id: string
          max_balance_cap: number | null
          max_rollover_amount: number | null
          rollover_expiry_months: number | null
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          forfeit_unused?: boolean
          id?: string
          is_active?: boolean
          leave_type_id: string
          max_balance_cap?: number | null
          max_rollover_amount?: number | null
          rollover_expiry_months?: number | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          forfeit_unused?: boolean
          id?: string
          is_active?: boolean
          leave_type_id?: string
          max_balance_cap?: number | null
          max_rollover_amount?: number | null
          rollover_expiry_months?: number | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_rollover_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_rollover_rules_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          accrual_unit: string
          advance_notice_days: number | null
          allows_negative_balance: boolean
          can_be_encashed: boolean
          code: string
          color: string | null
          company_id: string
          created_at: string
          default_annual_entitlement: number | null
          description: string | null
          encashment_rate: number | null
          end_date: string | null
          id: string
          is_accrual_based: boolean
          is_active: boolean
          max_consecutive_days: number | null
          max_negative_balance: number | null
          min_request_amount: number | null
          name: string
          requires_approval: boolean
          start_date: string
          updated_at: string
        }
        Insert: {
          accrual_unit?: string
          advance_notice_days?: number | null
          allows_negative_balance?: boolean
          can_be_encashed?: boolean
          code: string
          color?: string | null
          company_id: string
          created_at?: string
          default_annual_entitlement?: number | null
          description?: string | null
          encashment_rate?: number | null
          end_date?: string | null
          id?: string
          is_accrual_based?: boolean
          is_active?: boolean
          max_consecutive_days?: number | null
          max_negative_balance?: number | null
          min_request_amount?: number | null
          name: string
          requires_approval?: boolean
          start_date?: string
          updated_at?: string
        }
        Update: {
          accrual_unit?: string
          advance_notice_days?: number | null
          allows_negative_balance?: boolean
          can_be_encashed?: boolean
          code?: string
          color?: string | null
          company_id?: string
          created_at?: string
          default_annual_entitlement?: number | null
          description?: string | null
          encashment_rate?: number | null
          end_date?: string | null
          id?: string
          is_accrual_based?: boolean
          is_active?: boolean
          max_consecutive_days?: number | null
          max_negative_balance?: number | null
          min_request_amount?: number | null
          name?: string
          requires_approval?: boolean
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_templates: {
        Row: {
          available_variables: Json
          body_template: string
          category: string
          code: string
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          requires_approval: boolean
          subject: string
          transaction_type_id: string | null
          updated_at: string
        }
        Insert: {
          available_variables?: Json
          body_template: string
          category?: string
          code: string
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_approval?: boolean
          subject: string
          transaction_type_id?: string | null
          updated_at?: string
        }
        Update: {
          available_variables?: Json
          body_template?: string
          category?: string
          code?: string
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_approval?: boolean
          subject?: string
          transaction_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "letter_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letter_templates_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lms_certificates: {
        Row: {
          certificate_number: string
          course_id: string
          created_at: string
          enrollment_id: string
          expires_at: string | null
          final_score: number | null
          id: string
          issued_at: string
          user_id: string
          verification_code: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          created_at?: string
          enrollment_id: string
          expires_at?: string | null
          final_score?: number | null
          id?: string
          issued_at?: string
          user_id: string
          verification_code: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          created_at?: string
          enrollment_id?: string
          expires_at?: string | null
          final_score?: number | null
          id?: string
          issued_at?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_courses: {
        Row: {
          category_id: string | null
          certificate_template: string | null
          code: string
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_mandatory: boolean
          is_published: boolean
          passing_score: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          certificate_template?: string | null
          code: string
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean
          is_published?: boolean
          passing_score?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          certificate_template?: string | null
          code?: string
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean
          is_published?: boolean
          passing_score?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lms_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_courses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          due_date: string | null
          enrolled_at: string
          enrolled_by: string | null
          id: string
          progress_percentage: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          due_date?: string | null
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          progress_percentage?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          due_date?: string | null
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          progress_percentage?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          is_completed: boolean
          lesson_id: string
          started_at: string | null
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          is_completed?: boolean
          lesson_id: string
          started_at?: string | null
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          is_completed?: boolean
          lesson_id?: string
          started_at?: string | null
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lms_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_lessons: {
        Row: {
          content: string | null
          content_type: string
          created_at: string
          display_order: number
          document_url: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean
          module_id: string
          quiz_id: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          content_type?: string
          created_at?: string
          display_order?: number
          document_url?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          module_id: string
          quiz_id?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string
          display_order?: number
          document_url?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          module_id?: string
          quiz_id?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lms_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_lessons_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lms_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          created_at: string
          enrollment_id: string
          id: string
          max_score: number | null
          passed: boolean | null
          percentage: number | null
          quiz_id: string
          score: number | null
          started_at: string
          submitted_at: string | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          enrollment_id: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          enrollment_id?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lms_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quiz_questions: {
        Row: {
          correct_answer: Json
          created_at: string
          display_order: number
          explanation: string | null
          id: string
          options: Json
          points: number
          question_text: string
          question_type: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          correct_answer: Json
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          options?: Json
          points?: number
          question_text: string
          question_type?: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          correct_answer?: Json
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          options?: Json
          points?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lms_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quizzes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          max_attempts: number | null
          passing_score: number
          show_correct_answers: boolean
          shuffle_questions: boolean
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          max_attempts?: number | null
          passing_score?: number
          show_correct_answers?: boolean
          shuffle_questions?: boolean
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          max_attempts?: number | null
          passing_score?: number
          show_correct_answers?: boolean
          shuffle_questions?: boolean
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lookup_values: {
        Row: {
          category: Database["public"]["Enums"]["lookup_category"]
          code: string
          created_at: string
          description: string | null
          display_order: number
          end_date: string | null
          id: string
          is_active: boolean
          is_default: boolean
          metadata: Json | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["lookup_category"]
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          metadata?: Json | null
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["lookup_category"]
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          metadata?: Json | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      nine_box_assessments: {
        Row: {
          assessed_by: string | null
          assessment_date: string
          assessment_period: string | null
          company_id: string
          created_at: string
          employee_id: string
          id: string
          is_current: boolean
          overall_notes: string | null
          performance_notes: string | null
          performance_rating: number
          potential_notes: string | null
          potential_rating: number
          updated_at: string
        }
        Insert: {
          assessed_by?: string | null
          assessment_date?: string
          assessment_period?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          is_current?: boolean
          overall_notes?: string | null
          performance_notes?: string | null
          performance_rating: number
          potential_notes?: string | null
          potential_rating: number
          updated_at?: string
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string
          assessment_period?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          is_current?: boolean
          overall_notes?: string | null
          performance_notes?: string | null
          performance_rating?: number
          potential_notes?: string | null
          potential_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nine_box_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nine_box_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nine_box_assessments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          access_request_updates: boolean
          created_at: string
          email_notifications: boolean
          id: string
          system_announcements: boolean
          ticket_assigned: boolean
          ticket_comment_added: boolean
          ticket_status_changed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          access_request_updates?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          system_announcements?: boolean
          ticket_assigned?: boolean
          ticket_comment_added?: boolean
          ticket_status_changed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          access_request_updates?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          system_announcements?: boolean
          ticket_assigned?: boolean
          ticket_comment_added?: boolean
          ticket_status_changed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offboarding_instances: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          last_working_date: string
          manager_id: string | null
          notes: string | null
          status: string
          template_id: string
          termination_reason: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          last_working_date: string
          manager_id?: string | null
          notes?: string | null
          status?: string
          template_id: string
          termination_reason?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          last_working_date?: string
          manager_id?: string | null
          notes?: string | null
          status?: string
          template_id?: string
          termination_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_instances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_instances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_instances_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_tasks: {
        Row: {
          assigned_to_id: string | null
          assigned_to_type: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          display_order: number
          due_date: string | null
          id: string
          instance_id: string
          is_required: boolean
          name: string
          notes: string | null
          status: string
          task_type: string
          template_task_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          assigned_to_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_date?: string | null
          id?: string
          instance_id: string
          is_required?: boolean
          name: string
          notes?: string | null
          status?: string
          task_type?: string
          template_task_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          assigned_to_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_date?: string | null
          id?: string
          instance_id?: string
          is_required?: boolean
          name?: string
          notes?: string | null
          status?: string
          task_type?: string
          template_task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_tasks_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_tasks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "offboarding_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_tasks_template_task_id_fkey"
            columns: ["template_task_id"]
            isOneToOne: false
            referencedRelation: "offboarding_template_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_template_tasks: {
        Row: {
          assigned_to_type: string
          created_at: string
          description: string | null
          display_order: number
          due_days_before: number
          id: string
          is_required: boolean
          name: string
          task_type: string
          template_id: string
          updated_at: string
        }
        Insert: {
          assigned_to_type?: string
          created_at?: string
          description?: string | null
          display_order?: number
          due_days_before?: number
          id?: string
          is_required?: boolean
          name: string
          task_type?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          assigned_to_type?: string
          created_at?: string
          description?: string | null
          display_order?: number
          due_days_before?: number
          id?: string
          is_required?: boolean
          name?: string
          task_type?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_templates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_letters: {
        Row: {
          accepted_at: string | null
          application_id: string
          benefits_summary: string | null
          bonus_details: Json | null
          created_at: string
          created_by: string | null
          decline_reason: string | null
          declined_at: string | null
          department: string | null
          employment_type: string | null
          expiry_date: string | null
          id: string
          location: string | null
          offer_number: string | null
          position_title: string
          responded_at: string | null
          salary_amount: number
          salary_currency: string | null
          salary_period: string | null
          sent_at: string | null
          signed_document_url: string | null
          start_date: string | null
          status: string
          updated_at: string
          viewed_at: string | null
          workflow_instance_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          application_id: string
          benefits_summary?: string | null
          bonus_details?: Json | null
          created_at?: string
          created_by?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          department?: string | null
          employment_type?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          offer_number?: string | null
          position_title: string
          responded_at?: string | null
          salary_amount: number
          salary_currency?: string | null
          salary_period?: string | null
          sent_at?: string | null
          signed_document_url?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
          workflow_instance_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          application_id?: string
          benefits_summary?: string | null
          bonus_details?: Json | null
          created_at?: string
          created_by?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          department?: string | null
          employment_type?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          offer_number?: string | null
          position_title?: string
          responded_at?: string | null
          salary_amount?: number
          salary_currency?: string | null
          salary_period?: string | null
          sent_at?: string | null
          signed_document_url?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_letters_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_instances: {
        Row: {
          actual_completion_date: string | null
          buddy_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          manager_id: string | null
          notes: string | null
          start_date: string
          status: string
          target_completion_date: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          buddy_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          manager_id?: string | null
          notes?: string | null
          start_date?: string
          status?: string
          target_completion_date?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          buddy_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          manager_id?: string | null
          notes?: string | null
          start_date?: string
          status?: string
          target_completion_date?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_instances_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          assigned_to_id: string | null
          assigned_to_type: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          display_order: number
          document_url: string | null
          due_date: string | null
          id: string
          instance_id: string
          is_required: boolean
          name: string
          notes: string | null
          status: string
          task_type: string
          template_task_id: string | null
          training_course_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          assigned_to_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          document_url?: string | null
          due_date?: string | null
          id?: string
          instance_id: string
          is_required?: boolean
          name: string
          notes?: string | null
          status?: string
          task_type?: string
          template_task_id?: string | null
          training_course_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          assigned_to_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          document_url?: string | null
          due_date?: string | null
          id?: string
          instance_id?: string
          is_required?: boolean
          name?: string
          notes?: string | null
          status?: string
          task_type?: string
          template_task_id?: string | null
          training_course_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "onboarding_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_template_task_id_fkey"
            columns: ["template_task_id"]
            isOneToOne: false
            referencedRelation: "onboarding_template_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_training_course_id_fkey"
            columns: ["training_course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_tasks: {
        Row: {
          assigned_to_type: string
          created_at: string
          description: string | null
          display_order: number
          document_template_id: string | null
          due_days: number
          id: string
          is_required: boolean
          name: string
          task_type: string
          template_id: string
          training_course_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to_type?: string
          created_at?: string
          description?: string | null
          display_order?: number
          document_template_id?: string | null
          due_days?: number
          id?: string
          is_required?: boolean
          name: string
          task_type?: string
          template_id: string
          training_course_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to_type?: string
          created_at?: string
          description?: string | null
          display_order?: number
          document_template_id?: string | null
          due_days?: number
          id?: string
          is_required?: boolean
          name?: string
          task_type?: string
          template_id?: string
          training_course_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_template_tasks_training_course_id_fkey"
            columns: ["training_course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          job_id: string | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          job_id?: string | null
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          job_id?: string | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_templates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_elements: {
        Row: {
          code: string
          company_id: string | null
          created_at: string
          description: string | null
          display_order: number
          element_type_id: string | null
          end_date: string | null
          id: string
          is_active: boolean
          is_pensionable: boolean
          is_taxable: boolean
          name: string
          proration_method_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          element_type_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_pensionable?: boolean
          is_taxable?: boolean
          name: string
          proration_method_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          element_type_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_pensionable?: boolean
          is_taxable?: boolean
          name?: string
          proration_method_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pay_elements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_elements_element_type_id_fkey"
            columns: ["element_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_elements_proration_method_id_fkey"
            columns: ["proration_method_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_nominations: {
        Row: {
          created_at: string
          id: string
          nominated_by: string
          nominated_peer_id: string
          review_participant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nominated_by: string
          nominated_peer_id: string
          review_participant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nominated_by?: string
          nominated_peer_id?: string
          review_participant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_nominations_review_participant_id_fkey"
            columns: ["review_participant_id"]
            isOneToOne: false
            referencedRelation: "review_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_goals: {
        Row: {
          achievable: string | null
          assigned_by: string | null
          category: string | null
          company_id: string
          completed_date: string | null
          created_at: string
          current_value: number | null
          department_id: string | null
          description: string | null
          due_date: string | null
          employee_id: string | null
          final_score: number | null
          goal_level: Database["public"]["Enums"]["goal_level"]
          goal_source: Database["public"]["Enums"]["goal_source"]
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          is_objective: boolean | null
          manager_rating: number | null
          measurable: string | null
          objective_id: string | null
          parent_goal_id: string | null
          progress_percentage: number | null
          relevant: string | null
          self_rating: number | null
          specific: string | null
          start_date: string
          status: Database["public"]["Enums"]["goal_status"]
          target_value: number | null
          template_id: string | null
          time_bound: string | null
          title: string
          unit_of_measure: string | null
          updated_at: string
          weighting: number | null
        }
        Insert: {
          achievable?: string | null
          assigned_by?: string | null
          category?: string | null
          company_id: string
          completed_date?: string | null
          created_at?: string
          current_value?: number | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          final_score?: number | null
          goal_level?: Database["public"]["Enums"]["goal_level"]
          goal_source?: Database["public"]["Enums"]["goal_source"]
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_objective?: boolean | null
          manager_rating?: number | null
          measurable?: string | null
          objective_id?: string | null
          parent_goal_id?: string | null
          progress_percentage?: number | null
          relevant?: string | null
          self_rating?: number | null
          specific?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_value?: number | null
          template_id?: string | null
          time_bound?: string | null
          title: string
          unit_of_measure?: string | null
          updated_at?: string
          weighting?: number | null
        }
        Update: {
          achievable?: string | null
          assigned_by?: string | null
          category?: string | null
          company_id?: string
          completed_date?: string | null
          created_at?: string
          current_value?: number | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          final_score?: number | null
          goal_level?: Database["public"]["Enums"]["goal_level"]
          goal_source?: Database["public"]["Enums"]["goal_source"]
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_objective?: boolean | null
          manager_rating?: number | null
          measurable?: string | null
          objective_id?: string | null
          parent_goal_id?: string | null
          progress_percentage?: number | null
          relevant?: string | null
          self_rating?: number | null
          specific?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_value?: number | null
          template_id?: string | null
          time_bound?: string | null
          title?: string
          unit_of_measure?: string | null
          updated_at?: string
          weighting?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_goals_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pii_access_alerts: {
        Row: {
          access_count: number
          alert_reason: string | null
          alert_type: string
          created_at: string
          email_sent: boolean | null
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          access_count?: number
          alert_reason?: string | null
          alert_type: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          user_email: string
          user_id: string
        }
        Update: {
          access_count?: number
          alert_reason?: string | null
          alert_type?: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      policy_documents: {
        Row: {
          category_id: string | null
          chunk_count: number | null
          company_id: string | null
          created_at: string
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_active: boolean
          is_global: boolean
          processed_at: string | null
          processing_error: string | null
          processing_status: string | null
          title: string
          updated_at: string
          uploaded_by: string
          version: string | null
        }
        Insert: {
          category_id?: string | null
          chunk_count?: number | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
          version?: string | null
        }
        Update: {
          category_id?: string | null
          chunk_count?: number | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "policy_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_enforcement_logs: {
        Row: {
          action_context: string
          created_at: string
          id: string
          override_justification: string | null
          rule_id: string | null
          rule_triggered: string
          user_id: string
          user_response: string | null
        }
        Insert: {
          action_context: string
          created_at?: string
          id?: string
          override_justification?: string | null
          rule_id?: string | null
          rule_triggered: string
          user_id: string
          user_response?: string | null
        }
        Update: {
          action_context?: string
          created_at?: string
          id?: string
          override_justification?: string | null
          rule_id?: string | null
          rule_triggered?: string
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_enforcement_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "policy_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_rules: {
        Row: {
          created_at: string
          document_id: string
          id: string
          is_active: boolean
          rule_condition: Json
          rule_context: string
          rule_description: string
          rule_type: string
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          is_active?: boolean
          rule_condition: Json
          rule_context: string
          rule_description: string
          rule_type: string
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          is_active?: boolean
          rule_condition?: Json
          rule_context?: string
          rule_description?: string
          rule_type?: string
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_rules_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "policy_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      position_compensation: {
        Row: {
          amount: number
          created_at: string
          currency: string
          effective_date: string
          end_date: string | null
          frequency_id: string | null
          id: string
          is_active: boolean
          notes: string | null
          pay_element_id: string
          position_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          effective_date?: string
          end_date?: string | null
          frequency_id?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          pay_element_id: string
          position_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          effective_date?: string
          end_date?: string | null
          frequency_id?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          pay_element_id?: string
          position_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_compensation_frequency_id_fkey"
            columns: ["frequency_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_compensation_pay_element_id_fkey"
            columns: ["pay_element_id"]
            isOneToOne: false
            referencedRelation: "pay_elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_compensation_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          authorized_headcount: number
          code: string
          created_at: string
          department_id: string
          description: string | null
          end_date: string | null
          headcount_notes: string | null
          id: string
          is_active: boolean
          job_family_id: string | null
          reports_to_position_id: string | null
          salary_grade_id: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          authorized_headcount?: number
          code: string
          created_at?: string
          department_id: string
          description?: string | null
          end_date?: string | null
          headcount_notes?: string | null
          id?: string
          is_active?: boolean
          job_family_id?: string | null
          reports_to_position_id?: string | null
          salary_grade_id?: string | null
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          authorized_headcount?: number
          code?: string
          created_at?: string
          department_id?: string
          description?: string | null
          end_date?: string | null
          headcount_notes?: string | null
          id?: string
          is_active?: boolean
          job_family_id?: string | null
          reports_to_position_id?: string | null
          salary_grade_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_job_family_id_fkey"
            columns: ["job_family_id"]
            isOneToOne: false
            referencedRelation: "job_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_reports_to_position_id_fkey"
            columns: ["reports_to_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_salary_grade_id_fkey"
            columns: ["salary_grade_id"]
            isOneToOne: false
            referencedRelation: "salary_grades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          date_format: string | null
          department_id: string | null
          email: string
          full_name: string | null
          id: string
          preferred_language: string | null
          section_id: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          date_format?: string | null
          department_id?: string | null
          email: string
          full_name?: string | null
          id: string
          preferred_language?: string | null
          section_id?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          date_format?: string | null
          department_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          section_id?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      property_assignments: {
        Row: {
          actual_return_date: string | null
          assigned_by: string | null
          assigned_date: string
          condition_at_assignment: string | null
          condition_at_return: string | null
          created_at: string
          employee_id: string
          expected_return_date: string | null
          id: string
          notes: string | null
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_return_date?: string | null
          assigned_by?: string | null
          assigned_date?: string
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string
          employee_id: string
          expected_return_date?: string | null
          id?: string
          notes?: string | null
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_return_date?: string | null
          assigned_by?: string | null
          assigned_date?: string
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string
          employee_id?: string
          expected_return_date?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_items"
            referencedColumns: ["id"]
          },
        ]
      }
      property_categories: {
        Row: {
          code: string
          company_id: string | null
          created_at: string
          depreciation_years: number | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string
          depreciation_years?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string
          depreciation_years?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      property_items: {
        Row: {
          asset_tag: string
          category_id: string
          company_id: string
          condition: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          specifications: Json | null
          status: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          asset_tag: string
          category_id: string
          company_id: string
          condition?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          asset_tag?: string
          category_id?: string
          company_id?: string
          condition?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      property_maintenance: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          id: string
          maintenance_type: string
          notes: string | null
          performed_by: string | null
          property_id: string
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          performed_by?: string | null
          property_id: string
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          performed_by?: string | null
          property_id?: string
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_maintenance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_maintenance_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_items"
            referencedColumns: ["id"]
          },
        ]
      }
      property_requests: {
        Row: {
          category_id: string | null
          company_id: string
          created_at: string
          description: string | null
          employee_id: string
          fulfilled_property_id: string | null
          id: string
          justification: string | null
          priority: string
          request_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          employee_id: string
          fulfilled_property_id?: string | null
          id?: string
          justification?: string | null
          priority?: string
          request_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          employee_id?: string
          fulfilled_property_id?: string | null
          id?: string
          justification?: string | null
          priority?: string
          request_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_requests_fulfilled_property_id_fkey"
            columns: ["fulfilled_property_id"]
            isOneToOne: false
            referencedRelation: "property_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_data_sources: {
        Row: {
          available_fields: Json
          base_table: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          join_config: Json
          module: string
          name: string
          updated_at: string
        }
        Insert: {
          available_fields?: Json
          base_table: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          join_config?: Json
          module: string
          name: string
          updated_at?: string
        }
        Update: {
          available_fields?: Json
          base_table?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          join_config?: Json
          module?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_template_bands: {
        Row: {
          band_order: number
          band_type: string
          content: Json
          created_at: string
          group_field: string | null
          height: number | null
          id: string
          page_break_after: boolean
          page_break_before: boolean
          repeat_on_each_page: boolean
          sub_report_link_field: string | null
          sub_report_template_id: string | null
          template_id: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          band_order?: number
          band_type: string
          content?: Json
          created_at?: string
          group_field?: string | null
          height?: number | null
          id?: string
          page_break_after?: boolean
          page_break_before?: boolean
          repeat_on_each_page?: boolean
          sub_report_link_field?: string | null
          sub_report_template_id?: string | null
          template_id: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          band_order?: number
          band_type?: string
          content?: Json
          created_at?: string
          group_field?: string | null
          height?: number | null
          id?: string
          page_break_after?: boolean
          page_break_before?: boolean
          repeat_on_each_page?: boolean
          sub_report_link_field?: string | null
          sub_report_template_id?: string | null
          template_id?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "report_template_bands_sub_report_template_id_fkey"
            columns: ["sub_report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_template_bands_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          bands: Json
          calculations: Json
          code: string
          company_id: string | null
          created_at: string
          created_by: string | null
          custom_sql: string | null
          data_source: string
          description: string | null
          end_date: string | null
          grouping: Json
          id: string
          is_active: boolean
          is_global: boolean
          layout: Json
          module: string
          name: string
          page_settings: Json
          parameters: Json
          sorting: Json
          start_date: string
          updated_at: string
        }
        Insert: {
          bands?: Json
          calculations?: Json
          code: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_sql?: string | null
          data_source: string
          description?: string | null
          end_date?: string | null
          grouping?: Json
          id?: string
          is_active?: boolean
          is_global?: boolean
          layout?: Json
          module: string
          name: string
          page_settings?: Json
          parameters?: Json
          sorting?: Json
          start_date?: string
          updated_at?: string
        }
        Update: {
          bands?: Json
          calculations?: Json
          code?: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_sql?: string | null
          data_source?: string
          description?: string | null
          end_date?: string | null
          grouping?: Json
          id?: string
          is_active?: boolean
          is_global?: boolean
          layout?: Json
          module?: string
          name?: string
          page_settings?: Json
          parameters?: Json
          sorting?: Json
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      responsibilities: {
        Row: {
          code: string
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responsibilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      review_cycles: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          feedback_deadline: string | null
          id: string
          include_direct_report_review: boolean | null
          include_manager_review: boolean | null
          include_peer_review: boolean | null
          include_self_review: boolean | null
          is_manager_cycle: boolean | null
          max_peer_reviewers: number | null
          min_peer_reviewers: number | null
          name: string
          peer_nomination_deadline: string | null
          self_review_deadline: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          feedback_deadline?: string | null
          id?: string
          include_direct_report_review?: boolean | null
          include_manager_review?: boolean | null
          include_peer_review?: boolean | null
          include_self_review?: boolean | null
          is_manager_cycle?: boolean | null
          max_peer_reviewers?: number | null
          min_peer_reviewers?: number | null
          name: string
          peer_nomination_deadline?: string | null
          self_review_deadline?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          feedback_deadline?: string | null
          id?: string
          include_direct_report_review?: boolean | null
          include_manager_review?: boolean | null
          include_peer_review?: boolean | null
          include_self_review?: boolean | null
          is_manager_cycle?: boolean | null
          max_peer_reviewers?: number | null
          min_peer_reviewers?: number | null
          name?: string
          peer_nomination_deadline?: string | null
          self_review_deadline?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_cycles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      review_participants: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          manager_id: string | null
          manager_review_completed: boolean | null
          overall_score: number | null
          review_cycle_id: string
          self_review_completed: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          manager_id?: string | null
          manager_review_completed?: boolean | null
          overall_score?: number | null
          review_cycle_id: string
          self_review_completed?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          manager_id?: string | null
          manager_review_completed?: boolean | null
          overall_score?: number | null
          review_cycle_id?: string
          self_review_completed?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_participants_review_cycle_id_fkey"
            columns: ["review_cycle_id"]
            isOneToOne: false
            referencedRelation: "review_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_questions: {
        Row: {
          applies_to: string[] | null
          competency_id: string | null
          created_at: string
          display_order: number | null
          id: string
          is_required: boolean | null
          options: Json | null
          question_text: string
          question_type: string
          rating_labels: Json | null
          rating_scale_max: number | null
          rating_scale_min: number | null
          review_cycle_id: string
          updated_at: string
        }
        Insert: {
          applies_to?: string[] | null
          competency_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question_text: string
          question_type?: string
          rating_labels?: Json | null
          rating_scale_max?: number | null
          rating_scale_min?: number | null
          review_cycle_id: string
          updated_at?: string
        }
        Update: {
          applies_to?: string[] | null
          competency_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question_text?: string
          question_type?: string
          rating_labels?: Json | null
          rating_scale_max?: number | null
          rating_scale_min?: number | null
          review_cycle_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_questions_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_questions_review_cycle_id_fkey"
            columns: ["review_cycle_id"]
            isOneToOne: false
            referencedRelation: "review_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          can_view_pii: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          menu_permissions: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          can_view_pii?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          menu_permissions?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          can_view_pii?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          menu_permissions?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      salary_grades: {
        Row: {
          code: string
          company_id: string | null
          created_at: string
          currency: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          max_salary: number | null
          mid_salary: number | null
          min_salary: number | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_salary?: number | null
          mid_salary?: number | null
          min_salary?: number | null
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_salary?: number | null
          mid_salary?: number | null
          min_salary?: number | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_grades_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_report_configs: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean
          name: string
          parameters: Json
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          name: string
          parameters?: Json
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          name?: string
          parameters?: Json
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_report_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_report_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_scenarios: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          current_headcount: number
          description: string | null
          id: string
          is_shared: boolean
          name: string
          parameters: Json
          results: Json | null
          share_token: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          current_headcount: number
          description?: string | null
          id?: string
          is_shared?: boolean
          name: string
          parameters: Json
          results?: Json | null
          share_token?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          current_headcount?: number
          description?: string | null
          id?: string
          is_shared?: boolean
          name?: string
          parameters?: Json
          results?: Json | null
          share_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_scenarios_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_comments: {
        Row: {
          annotation_target: string | null
          content: string
          created_at: string
          id: string
          is_resolved: boolean | null
          parent_comment_id: string | null
          scenario_id: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          annotation_target?: string | null
          content: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          scenario_id: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          annotation_target?: string | null
          content?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          scenario_id?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "scenario_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_comments_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "saved_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_templates: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          is_global: boolean
          name: string
          parameters: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_global?: boolean
          name: string
          parameters?: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_global?: boolean
          name?: string
          parameters?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_versions: {
        Row: {
          change_notes: string | null
          created_at: string
          created_by: string
          current_headcount: number
          description: string | null
          id: string
          name: string
          parameters: Json
          results: Json | null
          scenario_id: string
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          created_at?: string
          created_by: string
          current_headcount: number
          description?: string | null
          id?: string
          name: string
          parameters?: Json
          results?: Json | null
          scenario_id: string
          version_number?: number
        }
        Update: {
          change_notes?: string | null
          created_at?: string
          created_by?: string
          current_headcount?: number
          description?: string | null
          id?: string
          name?: string
          parameters?: Json
          results?: Json | null
          scenario_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenario_versions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "saved_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_org_reports: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          day_of_month: number | null
          day_of_week: number | null
          department_id: string | null
          description: string | null
          id: string
          include_changes: boolean
          include_employees: boolean
          include_positions: boolean
          is_active: boolean
          last_sent_at: string | null
          name: string
          recipient_emails: string[]
          schedule_type: string
          time_of_day: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          day_of_month?: number | null
          day_of_week?: number | null
          department_id?: string | null
          description?: string | null
          id?: string
          include_changes?: boolean
          include_employees?: boolean
          include_positions?: boolean
          is_active?: boolean
          last_sent_at?: string | null
          name: string
          recipient_emails?: string[]
          schedule_type?: string
          time_of_day?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          day_of_month?: number | null
          day_of_week?: number | null
          department_id?: string | null
          description?: string | null
          id?: string
          include_changes?: boolean
          include_employees?: boolean
          include_positions?: boolean
          is_active?: boolean
          last_sent_at?: string | null
          name?: string
          recipient_emails?: string[]
          schedule_type?: string
          time_of_day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_org_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_org_reports_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          code: string
          created_at: string
          department_id: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      succession_candidates: {
        Row: {
          created_at: string
          development_areas: string | null
          employee_id: string
          id: string
          nominated_by: string | null
          notes: string | null
          plan_id: string
          ranking: number | null
          readiness_level: string
          readiness_timeline: string | null
          status: string
          strengths: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          development_areas?: string | null
          employee_id: string
          id?: string
          nominated_by?: string | null
          notes?: string | null
          plan_id: string
          ranking?: number | null
          readiness_level?: string
          readiness_timeline?: string | null
          status?: string
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          development_areas?: string | null
          employee_id?: string
          id?: string
          nominated_by?: string | null
          notes?: string | null
          plan_id?: string
          ranking?: number | null
          readiness_level?: string
          readiness_timeline?: string | null
          status?: string
          strengths?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "succession_candidates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_candidates_nominated_by_fkey"
            columns: ["nominated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_candidates_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "succession_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      succession_development_plans: {
        Row: {
          candidate_id: string
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          development_type: string
          id: string
          notes: string | null
          progress: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          development_type?: string
          id?: string
          notes?: string | null
          progress?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          development_type?: string
          id?: string
          notes?: string | null
          progress?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "succession_development_plans_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "succession_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_development_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      succession_plans: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          plan_name: string
          position_id: string
          priority: string
          risk_level: string
          start_date: string
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          plan_name: string
          position_id: string
          priority?: string
          risk_level?: string
          start_date?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          plan_name?: string
          position_id?: string
          priority?: string
          risk_level?: string
          start_date?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "succession_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_plans_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean | null
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      talent_pool_members: {
        Row: {
          added_by: string | null
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          pool_id: string
          reason: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          pool_id: string
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          pool_id?: string
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_pool_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_pool_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_pool_members_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "talent_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_pools: {
        Row: {
          code: string
          company_id: string
          created_at: string
          created_by: string | null
          criteria: Json | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          pool_type: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          pool_type?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pool_type?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_pools_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_pools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          code: string
          created_at: string
          default_assignee_id: string | null
          default_priority_id: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          default_assignee_id?: string | null
          default_priority_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          default_assignee_id?: string | null
          default_priority_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_default_assignee_id_fkey"
            columns: ["default_assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_categories_default_priority_id_fkey"
            columns: ["default_priority_id"]
            isOneToOne: false
            referencedRelation: "ticket_priorities"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          attachments: Json | null
          author_id: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_history: {
        Row: {
          changed_by: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_priorities: {
        Row: {
          code: string
          color: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          resolution_time_hours: number
          response_time_hours: number
        }
        Insert: {
          code: string
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          resolution_time_hours: number
          response_time_hours: number
        }
        Update: {
          code?: string
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          resolution_time_hours?: number
          response_time_hours?: number
        }
        Relationships: []
      }
      ticket_satisfaction_surveys: {
        Row: {
          agent_rating: number | null
          created_at: string
          feedback: string | null
          id: string
          rating: number
          resolution_rating: number | null
          response_time_rating: number | null
          ticket_id: string
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          agent_rating?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          resolution_rating?: number | null
          response_time_rating?: number | null
          ticket_id: string
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          agent_rating?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          resolution_rating?: number | null
          response_time_rating?: number | null
          ticket_id?: string
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_satisfaction_surveys_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assignee_id: string | null
          category_id: string | null
          closed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          first_response_at: string | null
          id: string
          priority_id: string | null
          related_article_id: string | null
          requester_id: string
          resolved_at: string | null
          sla_breach_resolution: boolean | null
          sla_breach_response: boolean | null
          status: string
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          first_response_at?: string | null
          id?: string
          priority_id?: string | null
          related_article_id?: string | null
          requester_id: string
          resolved_at?: string | null
          sla_breach_resolution?: boolean | null
          sla_breach_response?: boolean | null
          status?: string
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          first_response_at?: string | null
          id?: string
          priority_id?: string | null
          related_article_id?: string | null
          requester_id?: string
          resolved_at?: string | null
          sla_breach_resolution?: boolean | null
          sla_breach_response?: boolean | null
          status?: string
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "ticket_priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_related_article_id_fkey"
            columns: ["related_article_id"]
            isOneToOne: false
            referencedRelation: "kb_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_delegates: {
        Row: {
          category: Database["public"]["Enums"]["workflow_category"] | null
          created_at: string
          created_by: string
          delegate_id: string
          delegator_id: string
          end_date: string | null
          id: string
          is_active: boolean
          reason: string | null
          start_date: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["workflow_category"] | null
          created_at?: string
          created_by: string
          delegate_id: string
          delegator_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          start_date?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["workflow_category"] | null
          created_at?: string
          created_by?: string
          delegate_id?: string
          delegator_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          start_date?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_delegates_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_delegates_delegator_id_fkey"
            columns: ["delegator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_delegates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          auto_terminate_at: string | null
          category: Database["public"]["Enums"]["workflow_category"]
          company_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          current_step_id: string | null
          current_step_order: number
          deadline_at: string | null
          escalated_at: string | null
          final_action: Database["public"]["Enums"]["workflow_action"] | null
          id: string
          initiated_at: string
          initiated_by: string
          metadata: Json | null
          reference_id: string
          reference_type: string
          status: Database["public"]["Enums"]["workflow_status"]
          template_id: string
          updated_at: string
        }
        Insert: {
          auto_terminate_at?: string | null
          category: Database["public"]["Enums"]["workflow_category"]
          company_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          current_step_id?: string | null
          current_step_order?: number
          deadline_at?: string | null
          escalated_at?: string | null
          final_action?: Database["public"]["Enums"]["workflow_action"] | null
          id?: string
          initiated_at?: string
          initiated_by: string
          metadata?: Json | null
          reference_id: string
          reference_type: string
          status?: Database["public"]["Enums"]["workflow_status"]
          template_id: string
          updated_at?: string
        }
        Update: {
          auto_terminate_at?: string | null
          category?: Database["public"]["Enums"]["workflow_category"]
          company_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          current_step_id?: string | null
          current_step_order?: number
          deadline_at?: string | null
          escalated_at?: string | null
          final_action?: Database["public"]["Enums"]["workflow_action"] | null
          id?: string
          initiated_at?: string
          initiated_by?: string
          metadata?: Json | null
          reference_id?: string
          reference_type?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_letters: {
        Row: {
          created_at: string
          created_by: string
          employee_id: string
          final_pdf_url: string | null
          generated_content: string
          id: string
          signed_at: string | null
          status: string
          template_id: string
          updated_at: string
          variable_values: Json
          verification_code: string
          workflow_instance_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          employee_id: string
          final_pdf_url?: string | null
          generated_content: string
          id?: string
          signed_at?: string | null
          status?: string
          template_id: string
          updated_at?: string
          variable_values?: Json
          verification_code: string
          workflow_instance_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          employee_id?: string
          final_pdf_url?: string | null
          generated_content?: string
          id?: string
          signed_at?: string | null
          status?: string
          template_id?: string
          updated_at?: string
          variable_values?: Json
          verification_code?: string
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_letters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_letters_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "letter_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_letters_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_signatures: {
        Row: {
          created_at: string
          generated_letter_id: string | null
          id: string
          instance_id: string
          ip_address: string | null
          signature_hash: string
          signature_text: string
          signed_at: string
          signer_email: string
          signer_id: string
          signer_name: string
          signer_position: string | null
          step_action_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          generated_letter_id?: string | null
          id?: string
          instance_id: string
          ip_address?: string | null
          signature_hash: string
          signature_text: string
          signed_at?: string
          signer_email: string
          signer_id: string
          signer_name: string
          signer_position?: string | null
          step_action_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          generated_letter_id?: string | null
          id?: string
          instance_id?: string
          ip_address?: string | null
          signature_hash?: string
          signature_text?: string
          signed_at?: string
          signer_email?: string
          signer_id?: string
          signer_name?: string
          signer_position?: string | null
          step_action_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_signatures_generated_letter_id_fkey"
            columns: ["generated_letter_id"]
            isOneToOne: false
            referencedRelation: "generated_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_signatures_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_signatures_step_action_id_fkey"
            columns: ["step_action_id"]
            isOneToOne: false
            referencedRelation: "workflow_step_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_actions: {
        Row: {
          acted_at: string
          action: Database["public"]["Enums"]["workflow_action"]
          actor_id: string
          comment: string | null
          created_at: string
          delegated_to: string | null
          delegation_reason: string | null
          id: string
          instance_id: string
          internal_notes: string | null
          ip_address: string | null
          return_reason: string | null
          return_to_step: number | null
          step_id: string
          step_order: number
          user_agent: string | null
        }
        Insert: {
          acted_at?: string
          action: Database["public"]["Enums"]["workflow_action"]
          actor_id: string
          comment?: string | null
          created_at?: string
          delegated_to?: string | null
          delegation_reason?: string | null
          id?: string
          instance_id: string
          internal_notes?: string | null
          ip_address?: string | null
          return_reason?: string | null
          return_to_step?: number | null
          step_id: string
          step_order: number
          user_agent?: string | null
        }
        Update: {
          acted_at?: string
          action?: Database["public"]["Enums"]["workflow_action"]
          actor_id?: string
          comment?: string | null
          created_at?: string
          delegated_to?: string | null
          delegation_reason?: string | null
          id?: string
          instance_id?: string
          internal_notes?: string | null
          ip_address?: string | null
          return_reason?: string | null
          return_to_step?: number | null
          step_id?: string
          step_order?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_actions_delegated_to_fkey"
            columns: ["delegated_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_actions_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_actions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          alternate_approver_id: string | null
          approver_governance_body_id: string | null
          approver_position_id: string | null
          approver_role_id: string | null
          approver_type: string
          approver_user_id: string | null
          can_delegate: boolean
          created_at: string
          description: string | null
          escalation_action: string | null
          escalation_hours: number | null
          id: string
          is_active: boolean
          name: string
          requires_comment: boolean
          requires_signature: boolean
          step_order: number
          template_id: string
          updated_at: string
          use_reporting_line: boolean
        }
        Insert: {
          alternate_approver_id?: string | null
          approver_governance_body_id?: string | null
          approver_position_id?: string | null
          approver_role_id?: string | null
          approver_type: string
          approver_user_id?: string | null
          can_delegate?: boolean
          created_at?: string
          description?: string | null
          escalation_action?: string | null
          escalation_hours?: number | null
          id?: string
          is_active?: boolean
          name: string
          requires_comment?: boolean
          requires_signature?: boolean
          step_order: number
          template_id: string
          updated_at?: string
          use_reporting_line?: boolean
        }
        Update: {
          alternate_approver_id?: string | null
          approver_governance_body_id?: string | null
          approver_position_id?: string | null
          approver_role_id?: string | null
          approver_type?: string
          approver_user_id?: string | null
          can_delegate?: boolean
          created_at?: string
          description?: string | null
          escalation_action?: string | null
          escalation_hours?: number | null
          id?: string
          is_active?: boolean
          name?: string
          requires_comment?: boolean
          requires_signature?: boolean
          step_order?: number
          template_id?: string
          updated_at?: string
          use_reporting_line?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_alternate_approver_id_fkey"
            columns: ["alternate_approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_approver_governance_body_id_fkey"
            columns: ["approver_governance_body_id"]
            isOneToOne: false
            referencedRelation: "governance_bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_approver_position_id_fkey"
            columns: ["approver_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_approver_role_id_fkey"
            columns: ["approver_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_approver_user_id_fkey"
            columns: ["approver_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          allow_return_to_previous: boolean
          auto_terminate_hours: number | null
          category: Database["public"]["Enums"]["workflow_category"]
          code: string
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          is_global: boolean
          letter_template_id: string | null
          name: string
          requires_letter: boolean
          requires_signature: boolean
          start_date: string | null
          updated_at: string
        }
        Insert: {
          allow_return_to_previous?: boolean
          auto_terminate_hours?: number | null
          category: Database["public"]["Enums"]["workflow_category"]
          code: string
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_global?: boolean
          letter_template_id?: string | null
          name: string
          requires_letter?: boolean
          requires_signature?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          allow_return_to_previous?: boolean
          auto_terminate_hours?: number | null
          category?: Database["public"]["Enums"]["workflow_category"]
          code?: string
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_global?: boolean
          letter_template_id?: string | null
          name?: string
          requires_letter?: boolean
          requires_signature?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_letter_template_id_fkey"
            columns: ["letter_template_id"]
            isOneToOne: false
            referencedRelation: "letter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accrue_leave_balance: {
        Args: {
          p_accrual_amount: number
          p_company_id: string
          p_employee_id: string
          p_leave_type_id: string
          p_year: number
        }
        Returns: undefined
      }
      can_act_on_workflow: {
        Args: { p_instance_id: string; p_user_id: string }
        Returns: boolean
      }
      can_approve_headcount_request: {
        Args: { p_request_id: string; p_user_id: string }
        Returns: boolean
      }
      check_auto_approval: {
        Args: { p_requested_modules: Json; p_user_id: string }
        Returns: {
          approved_modules: Json
          is_auto_approved: boolean
          rule_name: string
        }[]
      }
      execute_report_sql: { Args: { sql_query: string }; Returns: Json }
      get_360_feedback_summary: {
        Args: { p_participant_id: string }
        Returns: {
          avg_rating: number
          competency_name: string
          question_id: string
          question_text: string
          response_count: number
          reviewer_type: string
          text_responses: string[]
        }[]
      }
      get_active_workflow_template: {
        Args: { p_as_of_date?: string; p_template_code: string }
        Returns: string
      }
      get_employee_supervisor: {
        Args: { p_employee_id: string; p_position_id?: string }
        Returns: {
          supervisor_id: string
          supervisor_name: string
          supervisor_position_id: string
          supervisor_position_title: string
        }[]
      }
      get_manager_direct_reports: {
        Args: { p_manager_id: string }
        Returns: {
          employee_email: string
          employee_id: string
          employee_name: string
          position_title: string
        }[]
      }
      get_position_vacancy_summary: {
        Args: { p_company_id: string }
        Returns: {
          authorized_headcount: number
          department_name: string
          filled_count: number
          position_id: string
          position_title: string
          vacancy_count: number
        }[]
      }
      get_workflow_approver: {
        Args: { p_instance_id: string; p_step_id: string }
        Returns: {
          approver_email: string
          approver_id: string
          approver_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_at_date: {
        Args: {
          p_check_date?: string
          p_end_date: string
          p_start_date: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_entity_id?: string
          p_entity_name?: string
          p_entity_type: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
      match_policy_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_company_id?: string
          query_embedding: string
        }
        Returns: {
          category_name: string
          content: string
          document_id: string
          document_title: string
          id: string
          similarity: number
        }[]
      }
      recalculate_comp_time_balance: {
        Args: { p_company_id: string; p_employee_id: string }
        Returns: undefined
      }
      recalculate_leave_balance: {
        Args: {
          p_calculation_type?: string
          p_company_id: string
          p_employee_id: string
          p_initiated_by?: string
          p_period_end?: string
          p_period_start?: string
          p_triggered_by?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "hr_manager" | "employee"
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "VIEW"
        | "EXPORT"
        | "LOGIN"
        | "LOGOUT"
      goal_level: "company" | "department" | "team" | "individual"
      goal_source: "cascaded" | "manager_assigned" | "self_created"
      goal_status:
        | "draft"
        | "active"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "overdue"
      goal_type: "okr_objective" | "okr_key_result" | "smart_goal"
      lookup_category:
        | "employee_status"
        | "termination_reason"
        | "employee_type"
        | "employment_action"
        | "leave_type"
        | "contract_type"
        | "transaction_type"
        | "probation_extension_reason"
        | "promotion_reason"
        | "transfer_reason"
        | "acting_reason"
        | "hire_type"
        | "pay_element_type"
        | "proration_method"
        | "payment_frequency"
      workflow_action:
        | "approve"
        | "reject"
        | "return"
        | "escalate"
        | "delegate"
        | "comment"
      workflow_category:
        | "leave_request"
        | "probation_confirmation"
        | "headcount_request"
        | "training_request"
        | "promotion"
        | "transfer"
        | "resignation"
        | "termination"
        | "expense_claim"
        | "letter_request"
        | "general"
      workflow_status:
        | "draft"
        | "pending"
        | "in_progress"
        | "approved"
        | "rejected"
        | "cancelled"
        | "escalated"
        | "returned"
        | "auto_terminated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hr_manager", "employee"],
      audit_action: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "EXPORT",
        "LOGIN",
        "LOGOUT",
      ],
      goal_level: ["company", "department", "team", "individual"],
      goal_source: ["cascaded", "manager_assigned", "self_created"],
      goal_status: [
        "draft",
        "active",
        "in_progress",
        "completed",
        "cancelled",
        "overdue",
      ],
      goal_type: ["okr_objective", "okr_key_result", "smart_goal"],
      lookup_category: [
        "employee_status",
        "termination_reason",
        "employee_type",
        "employment_action",
        "leave_type",
        "contract_type",
        "transaction_type",
        "probation_extension_reason",
        "promotion_reason",
        "transfer_reason",
        "acting_reason",
        "hire_type",
        "pay_element_type",
        "proration_method",
        "payment_frequency",
      ],
      workflow_action: [
        "approve",
        "reject",
        "return",
        "escalate",
        "delegate",
        "comment",
      ],
      workflow_category: [
        "leave_request",
        "probation_confirmation",
        "headcount_request",
        "training_request",
        "promotion",
        "transfer",
        "resignation",
        "termination",
        "expense_claim",
        "letter_request",
        "general",
      ],
      workflow_status: [
        "draft",
        "pending",
        "in_progress",
        "approved",
        "rejected",
        "cancelled",
        "escalated",
        "returned",
        "auto_terminated",
      ],
    },
  },
} as const
