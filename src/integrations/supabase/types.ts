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
