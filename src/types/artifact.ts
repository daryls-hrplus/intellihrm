// Enablement Artifact Types - Phase 1

export type ArtifactStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'deprecated';
export type ContentLevel = 'Overview' | 'How-To' | 'Advanced' | 'Scenario' | 'FAQ' | 'Video';
export type RoleScope = 'Enablement Admin' | 'Client Module Admin' | 'HR User' | 'Manager' | 'Employee' | 'Consultant';

export interface ArtifactStep {
  id: string;
  order: number;
  title: string;
  description: string;
  screenshot_id?: string;
  ui_route?: string;
  tips?: string[];
  warnings?: string[];
}

export interface EnablementArtifact {
  id: string;
  artifact_id: string;
  product_version: string;
  module_id: string | null;
  feature_id: string | null;
  role_scope: RoleScope[];
  content_level: ContentLevel;
  title: string;
  description: string | null;
  learning_objective: string[];
  preconditions: string[];
  steps: ArtifactStep[];
  expected_outcomes: string[];
  ui_routes: string[];
  tags: string[];
  status: ArtifactStatus;
  version_number: number;
  supersedes_artifact_id: string | null;
  submitted_by: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  published_by: string | null;
  published_at: string | null;
  deprecated_by: string | null;
  deprecated_at: string | null;
  deprecation_reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  module?: { module_code: string; module_name: string };
  feature?: { feature_code: string; feature_name: string };
}

export interface ArtifactApproval {
  id: string;
  artifact_id: string;
  action: 'created' | 'updated' | 'submitted' | 'review_requested' | 'approved' | 'rejected' | 'published' | 'deprecated' | 'restored';
  from_status: string | null;
  to_status: string | null;
  performed_by: string | null;
  comments: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateArtifactInput {
  product_version: string;
  module_id?: string;
  feature_id?: string;
  role_scope: RoleScope[];
  content_level: ContentLevel;
  title: string;
  description?: string;
  learning_objective?: string[];
  preconditions?: string[];
  steps?: ArtifactStep[];
  expected_outcomes?: string[];
  ui_routes?: string[];
  tags?: string[];
}

export interface UpdateArtifactInput extends Partial<CreateArtifactInput> {
  status?: ArtifactStatus;
  review_notes?: string;
  deprecation_reason?: string;
}

export const ROLE_SCOPE_OPTIONS: RoleScope[] = [
  'Employee',
  'Manager',
  'HR User',
  'Client Module Admin',
  'Enablement Admin',
  'Consultant'
];

export const CONTENT_LEVEL_OPTIONS: { value: ContentLevel; label: string; description: string }[] = [
  { value: 'Overview', label: 'Overview', description: 'High-level introduction to a feature or concept' },
  { value: 'How-To', label: 'How-To', description: 'Step-by-step instructions for completing a task' },
  { value: 'Advanced', label: 'Advanced', description: 'In-depth guidance for power users' },
  { value: 'Scenario', label: 'Scenario', description: 'Real-world use cases and examples' },
  { value: 'FAQ', label: 'FAQ', description: 'Frequently asked questions and answers' },
  { value: 'Video', label: 'Video', description: 'Video-based training content' }
];

export const STATUS_CONFIG: Record<ArtifactStatus, { label: string; color: string; description: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', description: 'Work in progress' },
  in_review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800', description: 'Pending review' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', description: 'Ready to publish' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800', description: 'Live in Help Center' },
  deprecated: { label: 'Deprecated', color: 'bg-red-100 text-red-800', description: 'No longer active' }
};
