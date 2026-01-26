import { LearningObjectives } from '../../../components/LearningObjectives';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { Shield, AlertTriangle, Lock, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Diagnose permission and role-based access issues',
  'Troubleshoot RLS policy conflicts',
  'Resolve audit logging gaps',
  'Fix data visibility rule problems'
];

const permissionIssues: TroubleshootingItem[] = [
  {
    issue: 'User cannot access 360 feedback module',
    cause: 'Module permission not assigned, or role missing FEEDBACK_360_VIEW permission',
    solution: 'Check user_roles and role_permissions for FEEDBACK_360_* permissions, verify module is enabled for company, and assign appropriate role if missing.'
  },
  {
    issue: 'Manager cannot view team 360 results',
    cause: 'Manager role not recognized, reporting relationship incorrect, or team access disabled',
    solution: 'Verify reports_to relationship in profiles, check role has FEEDBACK_360_VIEW_TEAM permission, and ensure cycle.manager_report_access = true.'
  },
  {
    issue: 'HR cannot access investigation mode',
    cause: 'Investigation permission requires elevated role, or investigation not enabled for cycle',
    solution: 'Verify HR role has FEEDBACK_360_INVESTIGATE permission, check cycle.investigation_mode_enabled = true, and ensure proper approval workflow completed.'
  },
  {
    issue: 'Admin cannot configure 360 settings',
    cause: 'Admin role missing configuration permissions, or settings locked',
    solution: 'Check for FEEDBACK_360_ADMIN permission, verify no company-level lock on settings, and ensure user has correct company_id scope.'
  }
];

const rlsPolicyIssues: TroubleshootingItem[] = [
  {
    issue: 'Query returning empty results despite data existing',
    cause: 'RLS policy filtering out all rows for current user context',
    solution: 'Review RLS policies on feedback_360_* tables, check auth.uid() matches expected user_id or company_id, and verify policy conditions are correct.'
  },
  {
    issue: 'User seeing data they shouldn\'t access',
    cause: 'RLS policy too permissive, or bypass condition triggered incorrectly',
    solution: 'Audit all RLS policies for feedback tables, tighten conditions, remove overly broad "true" policies, and add explicit role checks.'
  },
  {
    issue: 'Aggregated scores visible without proper anonymization',
    cause: 'Anonymity threshold bypass in RLS, or category count check missing',
    solution: 'Add category-level count check to RLS policy, ensure aggregation respects min_raters threshold, and implement k-anonymity validation in policy.'
  },
  {
    issue: 'Cross-company data leakage',
    cause: 'Company_id not checked in RLS policy, or JWT missing company claim',
    solution: 'Verify all RLS policies include company_id = auth.jwt()->\'company_id\' check, validate JWT claims are set correctly, and audit all cross-table queries.'
  }
];

const auditLoggingIssues: TroubleshootingItem[] = [
  {
    issue: 'Audit logs missing for sensitive actions',
    cause: 'Audit trigger not configured, or action not classified as auditable',
    solution: 'Verify feedback_360_audit_logs trigger exists on tables, check action_type enum includes all sensitive operations, and ensure trigger fires on UPDATE/DELETE.'
  },
  {
    issue: 'Cannot identify who accessed specific report',
    cause: 'Report access not logged, or log retention policy deleted entries',
    solution: 'Add report_access action to audit logging, extend retention period for compliance requirements, and implement access tracking in application layer.'
  },
  {
    issue: 'Audit log entries missing user context',
    cause: 'Auth context not captured in trigger, or anonymous access logged',
    solution: 'Verify trigger captures auth.uid() and auth.jwt() claims, handle anonymous/external rater access separately, and include IP address where available.'
  }
];

const visibilityRuleIssues: TroubleshootingItem[] = [
  {
    issue: 'Custom visibility rules not being applied',
    cause: 'JSON syntax error in results_visibility_rules, or field override not processed',
    solution: 'Validate JSON structure in results_visibility_rules, ensure proper format: {"category": {"min_count": N}}, and check application layer parses rules correctly.'
  },
  {
    issue: 'Visibility different in web vs PDF report',
    cause: 'Visibility rules applied inconsistently between render paths',
    solution: 'Centralize visibility rule evaluation in shared utility, ensure PDF generation uses same visibility logic, and add integration tests for consistency.'
  },
  {
    issue: 'Subject can see individual rater identities',
    cause: 'Anonymity flag overridden, or manager bypass incorrectly applied to subject',
    solution: 'Verify is_anonymous flag on rater category, check subject never receives investigation-level access, and audit bypass conditions.'
  }
];

const databaseFields: FieldDefinition[] = [
  { name: 'user_roles.role_id', required: true, type: 'uuid', description: 'Assigned role reference' },
  { name: 'role_permissions.permission_code', required: true, type: 'text', description: 'Permission identifier (FEEDBACK_360_*)' },
  { name: 'feedback_360_audit_logs.action_type', required: true, type: 'enum', description: 'Logged action type' },
  { name: 'feedback_360_audit_logs.user_id', required: true, type: 'uuid', description: 'User who performed action' },
  { name: 'feedback_360_audit_logs.ip_address', required: false, type: 'inet', description: 'Client IP address' },
  { name: 'feedback_360_cycles.investigation_mode_enabled', required: true, type: 'boolean', description: 'Allow anonymity bypass' },
  { name: 'feedback_360_cycles.manager_report_access', required: true, type: 'boolean', description: 'Manager access enabled' },
  { name: 'feedback_360_rater_categories.is_anonymous', required: true, type: 'boolean', description: 'Category anonymity flag' },
  { name: 'profiles.company_id', required: true, type: 'uuid', description: 'Company scope for RLS' },
  { name: 'feedback_360_cycles.results_visibility_rules', required: false, type: 'jsonb', description: 'Custom visibility configuration' },
];

export function F360SecurityAccessSection() {
  return (
    <section id="sec-8-8" data-manual-anchor="sec-8-8" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          8.8 Security & Access Control
        </h3>
        <p className="text-muted-foreground mt-2">
          Troubleshooting permissions, RLS policies, audit logging, and data visibility rules.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">Security-Critical Section</AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          Issues in this section may indicate security vulnerabilities. Treat all access control failures
          with high priority and document resolution in security incident log.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-500" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Role-based access control issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              RLS Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Database row-level security issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Audit Logging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Audit trail gaps or failures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              Visibility Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Custom visibility configuration problems
            </p>
          </CardContent>
        </Card>
      </div>

      <TroubleshootingSection
        items={permissionIssues}
        title="Permission & Role Issues"
      />

      <TroubleshootingSection
        items={rlsPolicyIssues}
        title="RLS Policy Issues"
      />

      <TroubleshootingSection
        items={auditLoggingIssues}
        title="Audit Logging Issues"
      />

      <TroubleshootingSection
        items={visibilityRuleIssues}
        title="Visibility Rule Issues"
      />

      <FieldReferenceTable
        fields={databaseFields}
        title="Security & Access Database Fields"
      />
    </section>
  );
}
