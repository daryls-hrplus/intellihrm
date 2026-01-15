// Document Validation Types
// Shared types for multi-document validation system

export type DocumentType = 
  | 'implementation_handbook' 
  | 'product_capabilities';

export interface DocumentInfo {
  type: DocumentType;
  name: string;
  description: string;
  icon: string; // lucide icon name
}

export const DOCUMENT_REGISTRY: Record<DocumentType, DocumentInfo> = {
  implementation_handbook: {
    type: 'implementation_handbook',
    name: 'Implementation Handbook',
    description: 'Validates implementation tasks against application features registry',
    icon: 'BookOpen'
  },
  product_capabilities: {
    type: 'product_capabilities',
    name: 'Product Capabilities',
    description: 'Validates capabilities document modules against route registry',
    icon: 'FileText'
  }
};

export interface BaseValidationIssue {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fixable: boolean;
  details: Record<string, unknown>;
}

export interface DocumentValidationSummary {
  [key: string]: number;
}

export interface BaseValidationReport {
  documentType: DocumentType;
  documentName: string;
  runId: string;
  timestamp: Date;
  summary: DocumentValidationSummary;
  issues: BaseValidationIssue[];
  healthScore: number;
  fixableCount: number;
}
