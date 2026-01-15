/**
 * Content Currency Validation Types
 * 
 * Types for detecting implemented features (in code/database) 
 * that are missing from documentation.
 * 
 * Direction: Code → Document (validates if docs are up-to-date with code)
 */

export type ContentCurrencyDocumentType = 
  | 'product_capabilities' 
  | 'implementation_handbook' 
  | 'admin_manual';

export type ContentCurrencyIssueType = 
  | 'undocumented_in_capabilities' 
  | 'missing_from_handbook' 
  | 'missing_from_manual'
  | 'intentionally_undocumented';

export interface ContentCurrencyIssue {
  id: string;
  type: ContentCurrencyIssueType;
  severity: 'error' | 'warning' | 'info';
  featureCode: string;
  featureName: string;
  routePath: string;
  moduleCode: string;
  documentType: ContentCurrencyDocumentType;
  recommendation: string;
  suggestedSection?: string;
  isIntentionallyUndocumented?: boolean;
}

export interface ContentCurrencySummary {
  totalCodeRoutes: number;
  documentedInCapabilities: number;
  documentedInHandbook: number;
  documentedInManual: number;
  undocumentedCount: number;
  currencyScore: number; // 0-100 (how current are the docs?)
}

export interface ContentCurrencyReport {
  timestamp: Date;
  runId: string;
  summary: ContentCurrencySummary;
  issues: ContentCurrencyIssue[];
  byDocument: {
    product_capabilities: ContentCurrencyIssue[];
    implementation_handbook: ContentCurrencyIssue[];
    admin_manual: ContentCurrencyIssue[];
  };
}

export interface DocumentCoverageStats {
  documentType: ContentCurrencyDocumentType;
  documentName: string;
  coveredRoutes: number;
  totalAdminRoutes: number;
  coveragePercentage: number;
  gaps: string[];
}
