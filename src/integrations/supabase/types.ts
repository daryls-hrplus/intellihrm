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
          reports_to_position_id: string | null
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
          reports_to_position_id?: string | null
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
          reports_to_position_id?: string | null
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
            foreignKeyName: "positions_reports_to_position_id_fkey"
            columns: ["reports_to_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
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
