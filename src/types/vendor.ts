// Vendor Management Type Definitions
// Aligned with actual database schema from training_vendors, training_vendor_courses, etc.

import type { Json } from "@/integrations/supabase/types";

export type VendorStatus = 'active' | 'pending' | 'suspended' | 'terminated';
export type VendorType = 'training_provider' | 'consulting' | 'certification_body' | 'university' | 'online_platform' | 'other';
export type ContactType = 'primary' | 'billing' | 'technical' | 'escalation' | 'sales';
export type DeliveryMethod = 'classroom' | 'virtual' | 'hybrid' | 'online' | 'on_the_job';
export type SessionStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ReviewStatus = 'draft' | 'submitted' | 'approved';

// Core Vendor Interface (training_vendors table)
export interface Vendor {
  id: string;
  company_id: string;
  group_id?: string | null;
  code: string;
  name: string;
  description?: string | null;
  vendor_type: string;
  status: string;
  is_preferred: boolean;
  is_shared?: boolean | null;
  // Legacy single contact (deprecated - use training_vendor_contacts)
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  // Address
  address?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  // Contract details
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  contract_value?: number | null;
  payment_terms?: string | null;
  sla_document_url?: string | null;
  // Performance
  performance_score?: number | null;
  last_review_date?: string | null;
  // Termination
  terminated_at?: string | null;
  termination_reason?: string | null;
  // Metadata
  notes?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

// Vendor Course Interface (training_vendor_courses table - actual schema)
export interface VendorCourse {
  id: string;
  vendor_id: string;
  course_code: string | null;
  course_name: string;
  description?: string | null;
  delivery_method: string;
  duration_hours?: number | null;
  duration_days?: number | null;
  base_price?: number | null;
  base_currency?: string | null;
  certification_name?: string | null;
  certification_validity_months?: number | null;
  prerequisites?: string | null;
  target_audience?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Vendor Session Interface (training_vendor_sessions table - actual schema)
export interface VendorSession {
  id: string;
  vendor_course_id: string;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  location_type?: string | null;
  meeting_url?: string | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  capacity?: number | null;
  minimum_attendees?: number | null;
  registered_count: number;
  waitlist_count: number;
  status: string;
  registration_deadline?: string | null;
  confirmation_deadline?: string | null;
  cancellation_deadline?: string | null;
  cost_per_person?: number | null;
  currency?: string | null;
  timezone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  vendor_course?: {
    id: string;
    course_name: string;
    course_code: string | null;
  };
}

// Vendor Contact Interface (training_vendor_contacts table)
export interface VendorContact {
  id: string;
  vendor_id: string;
  contact_type: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  is_primary: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Vendor Review Interface (training_vendor_reviews table - actual schema)
export interface VendorReview {
  id: string;
  vendor_id: string;
  review_date: string;
  review_type: string;
  reviewer_id?: string | null;
  quality_score?: number | null;
  delivery_score?: number | null;
  value_score?: number | null;
  responsiveness_score?: number | null;
  overall_score?: number | null;
  findings?: Json | null;
  recommendations?: Json | null;
  action_items?: Json | null;
  status: string;
  next_review_date?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  reviewer?: {
    full_name: string;
    avatar_url?: string | null;
  };
}

// Session Enrollment Interface (vendor_session_enrollments table)
export interface VendorSessionEnrollment {
  id: string;
  session_id: string;
  employee_id: string;
  enrollment_date: string;
  status: 'enrolled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  attendance_confirmed?: boolean | null;
  completion_status?: string | null;
  certificate_issued?: boolean | null;
  feedback_submitted?: boolean | null;
  feedback_score?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: {
    full_name: string;
    email?: string | null;
    avatar_url?: string | null;
  };
}

// Session Waitlist Interface (vendor_session_waitlist table)
export interface VendorSessionWaitlist {
  id: string;
  session_id: string;
  employee_id: string;
  waitlist_date: string;
  priority: number;
  status: 'waiting' | 'offered' | 'enrolled' | 'expired' | 'declined';
  offered_at?: string | null;
  offer_expires_at?: string | null;
  notes?: string | null;
  created_at: string;
  // Joined data
  employee?: {
    full_name: string;
    email?: string | null;
  };
}

// Volume Discount Interface (vendor_volume_discounts table)
export interface VendorVolumeDiscount {
  id: string;
  vendor_id: string;
  min_participants: number;
  max_participants?: number | null;
  discount_percentage: number;
  effective_from?: string | null;
  effective_to?: string | null;
  is_active: boolean;
  created_at: string;
}

// Form Input Types
export interface VendorFormInput {
  code: string;
  name: string;
  description?: string;
  vendor_type: string;
  status: string;
  is_preferred: boolean;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  payment_terms?: string;
  notes?: string;
}

export interface VendorCourseFormInput {
  course_code?: string;
  course_name: string;
  description?: string;
  delivery_method: string;
  duration_hours?: number;
  duration_days?: number;
  base_price?: number;
  base_currency?: string;
  certification_name?: string;
  certification_validity_months?: number;
  prerequisites?: string;
  target_audience?: string;
  is_active: boolean;
}

export interface VendorSessionFormInput {
  vendor_course_id: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  location_type?: string;
  meeting_url?: string;
  instructor_id?: string;
  instructor_name?: string;
  capacity?: number;
  minimum_attendees?: number;
  registration_deadline?: string;
  confirmation_deadline?: string;
  cancellation_deadline?: string;
  cost_per_person?: number;
  currency?: string;
  timezone?: string;
  notes?: string;
}

export interface VendorContactFormInput {
  contact_type: string;
  name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  is_primary: boolean;
  notes?: string;
}

export interface VendorReviewFormInput {
  review_date: string;
  review_type: string;
  quality_score?: number;
  delivery_score?: number;
  value_score?: number;
  responsiveness_score?: number;
  overall_score?: number;
  findings?: Json;
  recommendations?: Json;
  action_items?: Json;
  status: string;
  next_review_date?: string;
}
