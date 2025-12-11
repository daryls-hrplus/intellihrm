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
          department_id: string | null
          email: string
          full_name: string | null
          id: string
          section_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          full_name?: string | null
          id: string
          section_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          section_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
    },
  },
} as const
