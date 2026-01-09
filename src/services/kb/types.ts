// Type definitions for Knowledge Base services

export type ArticleStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'in_review' 
  | 'changes_requested' 
  | 'approved' 
  | 'published' 
  | 'retired' 
  | 'archived';

export type VersionChangeType = 'major' | 'minor' | 'patch' | 'initial' | 'rollback';

export type ReviewStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'approved' 
  | 'changes_requested' 
  | 'delegated' 
  | 'expired';

export type FeedbackType = 
  | 'helpful' 
  | 'not_helpful' 
  | 'suggestion' 
  | 'error_report' 
  | 'outdated';

export type FeedbackStatus = 
  | 'new' 
  | 'acknowledged' 
  | 'in_progress' 
  | 'resolved' 
  | 'dismissed';

export type PublishedManualStatus = 'current' | 'superseded' | 'archived';

export interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: string;
  major_version: number;
  minor_version: number;
  patch_version: number;
  title: string;
  content: string;
  excerpt: string | null;
  change_summary: string | null;
  change_type: VersionChangeType | null;
  source_manual_id: string | null;
  source_manual_version: string | null;
  source_section_id: string | null;
  status: ArticleStatus;
  created_by: string | null;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comments: string | null;
  published_by: string | null;
  published_at: string | null;
  review_due_date: string | null;
  expires_at: string | null;
  rolled_back_from_version_id: string | null;
}

export interface ArticleReview {
  id: string;
  version_id: string;
  reviewer_id: string | null;
  assigned_by: string | null;
  assigned_at: string;
  due_date: string | null;
  status: ReviewStatus;
  decision_at: string | null;
  comments: string | null;
  inline_comments: InlineComment[] | null;
  escalated_to: string | null;
  escalated_at: string | null;
  escalation_reason: string | null;
  created_at: string;
}

export interface InlineComment {
  lineNumber: number;
  comment: string;
  author: string;
  createdAt: string;
  resolved?: boolean;
}

export interface PublishedManual {
  id: string;
  company_id: string | null;
  manual_id: string;
  manual_name: string;
  source_version: string;
  published_version: string;
  sections_total: number;
  sections_published: number;
  sections_updated: number;
  status: PublishedManualStatus;
  changelog: string[] | null;
  category_id: string | null;
  published_at: string;
  published_by: string | null;
  superseded_at: string | null;
}

export interface ArticleFeedback {
  id: string;
  article_id: string;
  version_id: string | null;
  feedback_type: FeedbackType;
  comment: string | null;
  suggested_change: string | null;
  section_reference: string | null;
  submitted_by: string | null;
  submitted_at: string;
  status: FeedbackStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface WorkflowTransition {
  from: ArticleStatus[];
  to: ArticleStatus;
  action: string;
  requiredRole?: string[];
  requiresComment?: boolean;
}

export interface ManualConfig {
  id: string;
  name: string;
  version: string;
  sectionsCount: number;
  href: string;
  icon: string;
  color: string;
}

export interface PublishOptions {
  manualId: string;
  manualName: string;
  targetCategoryId: string;
  sourceVersion: string;
  publishVersion: string;
  changelog: string[];
  sections: string[];
  reviewerId?: string;
  reviewDueDate?: Date;
  generationRunId?: string;
}

export interface SyncResult {
  added: number;
  updated: number;
  unchanged: number;
  errors: string[];
}

export interface VersionComparison {
  oldVersion: ArticleVersion | null;
  newVersion: ArticleVersion;
  hasChanges: boolean;
  additions: number;
  deletions: number;
}
