// Implementation Tracking Types for HRplus
// Tracks module/feature implementation progress separate from tour completion

export type ImplementationStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

// Module Implementation - tracks which modules are being implemented
export interface ModuleImplementation {
  id: string;
  module_id: string;
  company_id: string | null;
  implementation_order: number;
  status: ImplementationStatus;
  target_go_live: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  module?: {
    module_code: string;
    module_name: string;
    description: string | null;
    icon_name: string | null;
    route_path: string;
  };
}

// Feature Implementation - dual tracking for tours vs implementation
export interface FeatureImplementation {
  id: string;
  module_impl_id: string;
  feature_id: string;
  tour_id: string | null;
  company_id: string | null;
  implementation_order: number;
  
  // Tour tracking (auto-flagged by trigger)
  tour_watched: boolean;
  tour_completed_at: string | null;
  tour_completed_by: string | null;
  
  // Implementation tracking (manual by client)
  impl_complete: boolean;
  impl_completed_at: string | null;
  impl_completed_by: string | null;
  
  // Unflag tracking
  impl_uncompleted_at: string | null;
  impl_uncompleted_by: string | null;
  
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  feature?: {
    feature_code: string;
    feature_name: string;
    description: string | null;
    route_path: string | null;
  };
  tour?: {
    tour_code: string;
    tour_name: string;
  };
  tour_completed_by_profile?: {
    full_name: string;
    email: string;
  };
  impl_completed_by_profile?: {
    full_name: string;
    email: string;
  };
}

// Feature Implementation Task - standard and custom tasks
export interface FeatureImplementationTask {
  id: string;
  feature_id: string;
  task_order: number;
  task_name: string;
  task_description: string | null;
  is_required: boolean;
  is_standard: boolean; // true = global, false = custom per client
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Task Progress - tracks completion per feature implementation
export interface FeatureImplTaskProgress {
  id: string;
  feature_impl_id: string;
  task_id: string;
  company_id: string | null;
  
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  
  // Unflag tracking
  uncompleted_at: string | null;
  uncompleted_by: string | null;
  
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  task?: FeatureImplementationTask;
  completed_by_profile?: {
    full_name: string;
    email: string;
  };
}

// Summary stats for a module implementation
export interface ModuleImplementationStats {
  total_features: number;
  tours_watched: number;
  impl_completed: number;
  total_tasks: number;
  tasks_completed: number;
  required_tasks: number;
  required_tasks_completed: number;
  percent_tours: number;
  percent_impl: number;
  percent_tasks: number;
}

// Summary stats for a feature implementation
export interface FeatureImplementationStats {
  total_tasks: number;
  tasks_completed: number;
  required_tasks: number;
  required_tasks_completed: number;
  percent_complete: number;
  all_required_complete: boolean;
}

// Input types for creating/updating
export interface CreateModuleImplementationInput {
  module_id: string;
  company_id?: string;
  implementation_order?: number;
  target_go_live?: string;
  notes?: string;
}

export interface UpdateModuleImplementationInput {
  status?: ImplementationStatus;
  implementation_order?: number;
  target_go_live?: string;
  notes?: string;
}

export interface CreateFeatureImplementationInput {
  module_impl_id: string;
  feature_id: string;
  tour_id?: string;
  company_id?: string;
  implementation_order?: number;
}

export interface CreateImplementationTaskInput {
  feature_id: string;
  task_name: string;
  task_description?: string;
  task_order?: number;
  is_required?: boolean;
  is_standard?: boolean;
  company_id?: string;
}

export interface ToggleTaskProgressInput {
  feature_impl_id: string;
  task_id: string;
  is_completed: boolean;
  notes?: string;
}
