/**
 * Orphan Management Types
 * 
 * Types for detecting, analyzing, and managing orphaned database entries
 * that have no corresponding code implementation.
 */

export type OrphanSource = 'auto_migration' | 'manual_entry' | 'registry' | 'unknown';
export type OrphanRecommendation = 'keep_as_planned' | 'archive' | 'delete' | 'merge' | 'review';

export interface OrphanEntry {
  id: string;
  featureCode: string;
  featureName: string;
  routePath: string | null;
  moduleCode: string | null;
  moduleName: string | null;
  description: string | null;
  source: OrphanSource;
  createdAt: Date;
  isActive: boolean;
  // Analysis fields
  hasDuplicate: boolean;
  duplicateOf: string[];
  similarTo: string[];
  recommendation: OrphanRecommendation;
  recommendationReason: string;
  // Metadata
  groupCode: string | null;
  groupName: string | null;
  displayOrder: number | null;
}

export interface OrphanDuplicate {
  featureName: string;
  entries: OrphanEntry[];
  suggestedPrimary: string | null;
  mergeRecommendation: string;
}

export interface OrphanRouteConflict {
  routePath: string;
  entries: OrphanEntry[];
  conflictReason: string;
}

export interface OrphanModuleGroup {
  moduleCode: string;
  moduleName: string;
  totalFeatures: number;
  orphanCount: number;
  orphanPercentage: number;
  orphans: OrphanEntry[];
  recommendations: {
    keep: number;
    archive: number;
    delete: number;
    merge: number;
    review: number;
  };
}

export interface OrphanStats {
  total: number;
  bySource: Record<OrphanSource, number>;
  byModule: Record<string, number>;
  byRecommendation: Record<OrphanRecommendation, number>;
  duplicateClusters: number;
  routeConflicts: number;
  oldestOrphan: Date | null;
  newestOrphan: Date | null;
}

export interface OrphanReport {
  generatedAt: Date;
  stats: OrphanStats;
  moduleGroups: OrphanModuleGroup[];
  duplicates: OrphanDuplicate[];
  routeConflicts: OrphanRouteConflict[];
  allOrphans: OrphanEntry[];
  executiveSummary: {
    totalDbFeatures: number;
    totalCodeRoutes: number;
    orphanCount: number;
    orphanPercentage: number;
    immediateActionItems: string[];
  };
}

export interface OrphanAction {
  type: 'archive' | 'delete' | 'keep' | 'merge';
  orphanId: string;
  mergeTargetId?: string;
}

export interface OrphanBulkAction {
  type: 'archive_all' | 'delete_all' | 'archive_by_source' | 'delete_by_module';
  filter?: {
    source?: OrphanSource;
    moduleCode?: string;
    recommendation?: OrphanRecommendation;
  };
  ids?: string[];
}

export interface OrphanActionResult {
  success: boolean;
  affectedCount: number;
  errors: string[];
  undoToken?: string;
}
