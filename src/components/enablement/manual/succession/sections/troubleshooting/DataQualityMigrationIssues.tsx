import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Clock, AlertCircle, CheckCircle, FileWarning } from 'lucide-react';
import { LearningObjectives, InfoCallout, WarningCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const DATA_QUALITY_ISSUES = [
  {
    id: 'DTA-001',
    symptom: 'Import file validation errors on succession data upload',
    severity: 'High',
    cause: 'File format mismatch, missing required columns, or invalid data types. Import template may be outdated.',
    resolution: [
      'Download latest import template from system',
      'Validate all required columns are present',
      'Check data types match expected format (UUIDs, dates, enums)',
      'Fix validation errors and re-upload'
    ],
    prevention: 'Always use current import template. Validate file locally before upload using template checker.',
    crossRef: 'See implementation guide for import file specifications.'
  },
  {
    id: 'DTA-002',
    symptom: 'Duplicate employee records appearing in assessments',
    severity: 'High',
    cause: 'Employee exists in multiple companies without proper deduplication, or profile UUID mismatch.',
    resolution: [
      'Query profiles table for duplicate entries by email or employee_number',
      'Identify canonical record and merge duplicates',
      'Update foreign keys to point to single profile_id',
      'Archive duplicate records with clear audit trail'
    ],
    prevention: 'Implement duplicate detection during employee import. Use email as unique constraint across companies.',
    crossRef: 'See Workforce module documentation for employee data model.'
  },
  {
    id: 'DTA-003',
    symptom: 'Historical data not migrating to new succession system',
    severity: 'Medium',
    cause: 'Legacy data format incompatible, or migration script not mapping fields correctly. Date formats may differ.',
    resolution: [
      'Review migration mapping document',
      'Identify unmapped legacy fields',
      'Transform data to match target schema',
      'Run migration in test environment first'
    ],
    prevention: 'Create comprehensive data mapping before migration. Test with production data snapshot.',
    crossRef: 'See implementation guide for data migration procedures.'
  },
  {
    id: 'DTA-004',
    symptom: 'Company ID mismatch between modules causing data isolation',
    severity: 'High',
    cause: 'Records created with wrong company_id, or multi-company configuration error. RLS policies enforce isolation.',
    resolution: [
      'Identify records with incorrect company_id',
      'Verify user\'s company access permissions',
      'Update company_id on affected records (with audit)',
      'Refresh user session to load correct company context'
    ],
    prevention: 'Validate company context before record creation. Implement company_id validation triggers.',
    crossRef: 'See Section 2.7 for Company-Specific Settings.'
  },
  {
    id: 'DTA-005',
    symptom: 'is_current flag conflicts causing multiple active assessments',
    severity: 'High',
    cause: 'Trigger to set previous records to is_current=false not firing, or bulk import bypassed lifecycle.',
    resolution: [
      'Query for employee_id with multiple is_current=true records',
      'Identify most recent assessment by assessment_date',
      'Set older records to is_current=false',
      'Verify trigger exists and is active'
    ],
    prevention: 'Never bulk import with is_current=true. Use lifecycle-aware import process.',
    crossRef: 'See Section 3.7 for is_current lifecycle management.'
  },
  {
    id: 'DTA-006',
    symptom: 'Data freshness indicators showing stale information',
    severity: 'Medium',
    cause: 'Signal snapshots not refreshing, or data_freshness_days calculation outdated.',
    resolution: [
      'Check talent_signal_snapshots.captured_at timestamps',
      'Verify snapshot refresh job is running',
      'Manually trigger snapshot refresh for affected employees',
      'Review refresh schedule configuration'
    ],
    prevention: 'Configure daily signal snapshot refresh. Monitor snapshot freshness in health dashboard.',
    crossRef: 'See Section 9.5 for Talent Signal Processing.'
  },
  {
    id: 'DTA-007',
    symptom: 'Reference integrity violations on succession_candidates',
    severity: 'High',
    cause: 'Foreign key target (employee, position, plan) deleted without cascade, or orphaned records from failed import.',
    resolution: [
      'Identify orphaned records with invalid foreign keys',
      'Restore referenced records if accidentally deleted',
      'Remove orphaned succession_candidates if unrecoverable',
      'Document data loss in audit log'
    ],
    prevention: 'Use soft delete (is_deleted flag) instead of hard delete. Configure cascade rules carefully.',
    crossRef: 'See Section 1.4 for Database Architecture and relationships.'
  },
  {
    id: 'DTA-008',
    symptom: 'Bulk update failing with partial record processing',
    severity: 'Medium',
    cause: 'Transaction timeout on large batch, or individual record validation failure stopping entire batch.',
    resolution: [
      'Reduce batch size to 100-500 records',
      'Enable individual record error capture',
      'Identify failed records from error log',
      'Process failed records separately after fixing'
    ],
    prevention: 'Use smaller batch sizes for bulk operations. Implement per-record error handling.',
    crossRef: 'See implementation guide for bulk data operations.'
  },
  {
    id: 'DTA-009',
    symptom: 'JSONB fields (risk_factors, entry_criteria) not querying correctly',
    severity: 'Medium',
    cause: 'JSONB structure doesn\'t match query expectations, or null vs empty object confusion.',
    resolution: [
      'Inspect JSONB field structure with sample query',
      'Verify field uses correct JSON operators (@>, ->>, etc.)',
      'Default empty JSONB to {} not null for consistent queries',
      'Update application code to handle both formats'
    ],
    prevention: 'Document JSONB field schemas in data dictionary. Use consistent default values.',
    crossRef: 'See Section 7.3 for risk_factors JSONB structure.'
  },
  {
    id: 'DTA-010',
    symptom: 'Audit trail incomplete for succession changes',
    severity: 'High',
    cause: 'Audit trigger not configured for table, or application bypassing trigger with SECURITY DEFINER.',
    resolution: [
      'Verify audit trigger exists on succession tables',
      'Check trigger is enabled and not bypassed',
      'Manually log missing changes if identifiable',
      'Fix trigger configuration for future changes'
    ],
    prevention: 'Audit triggers on all succession tables. Include audit verification in deployment checklist.',
    crossRef: 'See Section 9.11 for Integration Execution & Audit.'
  },
];

const DATA_QUALITY_CHECKLIST = [
  { check: 'All employee_id references resolve to valid profiles', category: 'Integrity' },
  { check: 'No duplicate is_current=true for same employee/assessment type', category: 'Lifecycle' },
  { check: 'company_id consistent across related succession records', category: 'Scope' },
  { check: 'JSONB fields contain valid JSON structure', category: 'Format' },
  { check: 'Required fields populated (no unexpected nulls)', category: 'Completeness' },
  { check: 'Date fields in valid range (not future for historical)', category: 'Validity' },
  { check: 'Enum fields contain valid enum values', category: 'Constraint' },
  { check: 'Audit trail entries exist for all recent changes', category: 'Audit' },
];

export function DataQualityMigrationIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-7" data-manual-anchor="sec-11-7" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~12 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">11.7 Data Quality & Migration Issues</h3>
          <p className="text-muted-foreground mt-1">
            Import errors, duplicate detection, data validation, reference integrity, and audit trail troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Troubleshoot import file validation and format errors',
          'Resolve duplicate records and is_current lifecycle conflicts',
          'Fix company_id mismatches and cross-module data isolation',
          'Diagnose reference integrity violations and orphaned records',
          'Apply the data quality checklist systematically'
        ]}
      />

      {/* Data Quality Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-orange-600" />
            Data Quality Validation Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DATA_QUALITY_CHECKLIST.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-xs">{idx + 1}</span>
                </div>
                <span className="text-sm flex-1">{item.check}</span>
                <Badge variant="secondary" className="text-xs">{item.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-600" />
            Detailed Issue Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {DATA_QUALITY_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'High' ? 'text-destructive' : issue.severity === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Root Cause</span>
                      <p className="text-sm mt-1">{issue.cause}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution Steps</span>
                      <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        {issue.resolution.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Prevention</span>
                        <p className="text-sm mt-1">{issue.prevention}</p>
                      </div>
                    </div>
                    {issue.crossRef && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📖 {issue.crossRef}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <WarningCallout title="Data Migration Safety">
        Always perform data migrations in a test environment first with a production data snapshot. 
        Create rollback scripts before executing any destructive operations. Document all changes in audit log.
      </WarningCallout>

      <InfoCallout title="JSONB Default">
        For risk_factors and similar JSONB fields, use '[]'::jsonb as the default rather than null. 
        This enables consistent querying without null checks.
      </InfoCallout>
    </div>
  );
}
