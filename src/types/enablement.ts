// Enablement Hub Types

export interface EnablementRelease {
  id: string;
  version_number: string;
  release_name: string | null;
  release_date: string | null;
  preview_start_date: string | null;
  status: 'planning' | 'preview' | 'released' | 'archived';
  release_notes: string | null;
  feature_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnablementContentStatus {
  id: string;
  feature_code: string;
  module_code: string;
  release_id: string | null;
  workflow_status: 'backlog' | 'in_progress' | 'review' | 'published' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  documentation_status: string;
  scorm_lite_status: string;
  rise_course_status: string;
  video_status: string;
  dap_guide_status: string;
  complexity_score: number | null;
  recommended_tool: 'scorm_lite' | 'rise' | 'both' | null;
  ai_change_impact: string | null;
  assigned_to: string | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  release?: EnablementRelease;
  assignee?: { full_name: string; email: string };
}

export interface EnablementFeatureChange {
  id: string;
  feature_code: string;
  module_code: string;
  release_id: string | null;
  change_type: 'new_feature' | 'ui_change' | 'workflow_change' | 'deprecated' | 'removed';
  change_description: string | null;
  change_severity: 'major' | 'minor' | 'cosmetic';
  requires_content_update: boolean;
  detected_at: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface EnablementRiseTemplate {
  id: string;
  name: string;
  description: string | null;
  lesson_structure: Record<string, unknown> | null;
  source_document_id: string | null;
  section_patterns: Record<string, unknown> | null;
  timing_guidelines: Record<string, unknown> | null;
  exercise_types: string[] | null;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnablementVideo {
  id: string;
  feature_code: string;
  module_code: string;
  video_provider: 'trupeer' | 'guidde' | 'youtube' | 'vimeo' | 'other';
  video_url: string;
  embed_code: string | null;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnablementDAPGuide {
  id: string;
  feature_code: string;
  module_code: string;
  userguiding_guide_id: string;
  guide_type: 'tooltip' | 'walkthrough' | 'checklist' | 'hotspot' | 'announcement' | null;
  guide_name: string | null;
  trigger_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnablementSCORMPackage {
  id: string;
  feature_code: string;
  module_code: string;
  release_id: string | null;
  package_type: 'scorm_lite' | 'rise_import';
  scorm_version: '1.2' | '2004';
  package_url: string | null;
  manifest_xml: string | null;
  quiz_questions: Record<string, unknown>[] | null;
  duration_minutes: number | null;
  created_by: string | null;
  created_at: string;
}

export type WorkflowColumn = 'backlog' | 'in_progress' | 'review' | 'published' | 'archived';

export interface ContentCoverageStats {
  total_features: number;
  documented: number;
  scorm_lite: number;
  rise_courses: number;
  videos: number;
  dap_guides: number;
  coverage_percentage: number;
}

export interface FeatureComplexityResult {
  feature_code: string;
  complexity_score: number;
  recommended_tool: 'scorm_lite' | 'rise' | 'both';
  reasoning: string;
  estimated_duration_minutes: number;
}
