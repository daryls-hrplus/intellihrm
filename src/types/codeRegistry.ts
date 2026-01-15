/**
 * Code Registry Types
 * 
 * Represents the actual code implementation as the source of truth.
 * Used for unidirectional validation: Code → Database → Document
 */

export interface CodeRegistryEntry {
  /** Page component name (e.g., "AdminDashboardPage") */
  pageName: string;
  /** Route path (e.g., "/admin") */
  routePath: string;
  /** Module code derived from route (e.g., "admin") */
  moduleCode: string;
  /** Feature code for database matching */
  featureCode: string;
  /** Has ProtectedRoute wrapper */
  hasProtection: boolean;
  /** Required roles from ProtectedRoute */
  requiredRoles: string[];
  /** Module code from ProtectedRoute if any */
  protectedModuleCode: string | null;
  /** Source file reference */
  sourceFile: string;
}

export interface CodeRegistry {
  entries: CodeRegistryEntry[];
  totalPages: number;
  totalRoutes: number;
  lastScanned: Date;
  scanDuration: number;
}

export interface CodeRegistrySyncStatus {
  /** Exists in code and database */
  synced: CodeRegistryEntry[];
  /** Exists in code but not database */
  unregistered: CodeRegistryEntry[];
  /** Exists in database but not in code (orphan) */
  orphaned: {
    featureCode: string;
    routePath: string;
    featureName: string;
  }[];
}

export type ValidationDirection = 'code_to_db' | 'db_to_doc' | 'code_to_doc';

export interface UnidirectionalValidationIssue {
  id: string;
  type: 
    | 'UNREGISTERED_CODE'      // Code exists but not in DB
    | 'ORPHAN_DB_ENTRY'        // DB entry exists but code doesn't
    | 'UNDOCUMENTED_FEATURE'   // In DB but not in docs
    | 'GHOST_DOCUMENTATION'    // In docs but not in code
    | 'STALE_DOCUMENTATION';   // In docs, in code, but outdated
  severity: 'error' | 'warning' | 'info';
  direction: ValidationDirection;
  message: string;
  source: {
    code?: CodeRegistryEntry;
    database?: { featureCode: string; routePath: string };
    document?: { moduleId: string; title: string };
  };
  autoFixable: boolean;
  fixAction?: string;
}

export interface UnidirectionalValidationReport {
  timestamp: Date;
  summary: {
    codeRoutes: number;
    dbFeatures: number;
    documentedModules: number;
    syncedCodeToDb: number;
    syncedDbToDoc: number;
    issues: {
      total: number;
      errors: number;
      warnings: number;
      autoFixable: number;
    };
  };
  issues: UnidirectionalValidationIssue[];
  healthScore: number;
}
