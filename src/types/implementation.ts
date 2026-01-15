// Implementation Tracking Types for Intelli HRM
// Tracks module/feature implementation progress separate from tour completion

export type ImplementationStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

// ============================================================================
// Handbook / Implementation Tasks Types (Database-First SSOT)
// ============================================================================

/**
 * @deprecated Use ImplementationTask for new code.
 * StepMapping is the legacy format from hardcoded implementationMappings.ts
 */
export interface StepMapping {
  order: number;
  area: string;
  adminRoute?: string;
  importType?: string;
  isRequired?: boolean;
  estimatedMinutes?: number;
  subSection?: string;
  sourceManual?: 'workforce' | 'hr-hub' | 'appraisals' | 'admin-security';
  sourceSection?: string;
  isGlobal?: boolean;
}

/**
 * ImplementationTask is the database-backed format (SSOT).
 * This represents a row from the implementation_tasks table.
 */
export interface ImplementationTask {
  id: string;
  phase_id: string;
  step_order: number;
  area: string;
  description: string | null;
  feature_code: string | null;
  admin_route: string | null;
  import_type: string | null;
  is_required: boolean;
  estimated_minutes: number;
  sub_section: string | null;
  source_manual: string | null;
  source_section: string | null;
  is_global: boolean;
  display_order: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Phase statistics calculated from implementation tasks
 */
export interface PhaseStats {
  totalTasks: number;
  requiredTasks: number;
  estimatedMinutes: number;
  importableTasks: number;
  globalTasks: number;
  companyTasks: number;
  tasksWithFeatureCode: number;
  tasksWithLegacyRoute: number;
}

/**
 * Data source indicator for UI display
 */
export type DataSourceType = 'database' | 'legacy';

/**
 * Convert legacy StepMapping to ImplementationTask format
 */
export function convertStepMappingToTask(
  mapping: StepMapping,
  phaseId: string,
  index: number
): ImplementationTask {
  return {
    id: `legacy-${phaseId}-${mapping.order}`,
    phase_id: phaseId,
    step_order: mapping.order,
    area: mapping.area,
    description: null,
    feature_code: null,
    admin_route: mapping.adminRoute || null,
    import_type: mapping.importType || null,
    is_required: mapping.isRequired || false,
    estimated_minutes: mapping.estimatedMinutes || 15,
    sub_section: mapping.subSection || null,
    source_manual: mapping.sourceManual || null,
    source_section: mapping.sourceSection || null,
    is_global: mapping.isGlobal || false,
    display_order: index,
    is_active: true,
  };
}

// ============================================================================
// Module/Feature Implementation Types (Original types below)
// ============================================================================

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
