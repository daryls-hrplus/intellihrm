import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Lightbulb, Database } from 'lucide-react';
import { FieldReferenceTable } from '../../../components/FieldReferenceTable';
import { StepByStep } from '../../../components/StepByStep';

const CONFIGURATION_ISSUES = [
  {
    id: 'cfg-001',
    title: 'Cycle dates overlap with existing cycle',
    severity: 'high',
    symptoms: ['Error when saving cycle: "Date range overlaps with existing cycle"', 'Cannot activate cycle'],
    causes: ['Another 360 cycle is active in the overlapping period', 'Draft cycle dates conflict with active cycle'],
    resolution: [
      'Check Admin → 360 Cycles for existing cycles in the date range',
      'Adjust start/end dates to avoid overlap',
      'If cycles must overlap, contact system administrator to enable concurrent cycles (requires config change)'
    ],
    prevention: 'Review cycle calendar before creating new cycles; use cycle templates with non-overlapping defaults',
    tableRef: 'feedback_360_cycles',
    fieldRef: 'nomination_start_date, feedback_end_date'
  },
  {
    id: 'cfg-002',
    title: 'Question bank is empty or missing questions',
    severity: 'high',
    symptoms: ['Cannot activate cycle: "No questions configured"', 'Raters see empty survey'],
    causes: ['Questions not linked to cycle framework', 'Questions marked inactive', 'Competency framework not assigned'],
    resolution: [
      'Navigate to Setup → Question Bank → verify questions exist',
      'Check question status is "active"',
      'Verify framework is assigned to cycle in cycle settings',
      'Ensure questions are mapped to competencies in the assigned framework'
    ],
    prevention: 'Use cycle templates with pre-configured question sets; validate before activation',
    tableRef: 'feedback_360_questions',
    fieldRef: 'is_active, competency_id, framework_id'
  },
  {
    id: 'cfg-003',
    title: 'Rater category weight exceeds 100%',
    severity: 'medium',
    symptoms: ['Validation error: "Total weight must equal 100%"', 'Cannot save cycle settings'],
    causes: ['Category weights incorrectly configured', 'New category added without adjusting others'],
    resolution: [
      'Navigate to cycle settings → Rater Category Weights',
      'Verify sum of all enabled category weights equals 100%',
      'Adjust weights proportionally across categories',
      'Disable unused categories to exclude from weight calculation'
    ],
    prevention: 'Use weight presets (e.g., Standard: Self 10%, Manager 25%, Peer 40%, Direct 25%)',
    tableRef: 'feedback_360_rater_categories',
    fieldRef: 'weight_percentage, is_enabled'
  },
  {
    id: 'cfg-004',
    title: 'Competency framework version mismatch',
    severity: 'medium',
    symptoms: ['Questions reference deprecated competencies', 'Report shows "Unknown Competency"'],
    causes: ['Framework was updated after cycle creation', 'Cycle uses old framework version'],
    resolution: [
      'Check cycle settings for framework version',
      'If cycle is draft, update to latest framework version',
      'If cycle is active, complete with current version (DO NOT change mid-cycle)',
      'For reports, map deprecated competencies via Admin → Data Mapping'
    ],
    prevention: 'Lock framework versions before cycle activation; archive deprecated frameworks',
    tableRef: 'feedback_360_frameworks',
    fieldRef: 'version, is_active, deprecated_at'
  },
  {
    id: 'cfg-005',
    title: 'Rating scale labels not displaying',
    severity: 'low',
    symptoms: ['Raters see numeric values only (1-5)', 'No behavioral anchors visible'],
    causes: ['Scale labels not configured', 'BARS configuration incomplete', 'Language localization missing'],
    resolution: [
      'Navigate to Setup → Rating Scales → verify labels exist',
      'Check each rating level has a label and description',
      'Verify BARS are linked to questions if using behavioral anchors',
      'Check localization settings for non-English deployments'
    ],
    prevention: 'Use standard scale templates; validate in preview mode before activation',
    tableRef: 'rating_scale_labels',
    fieldRef: 'label_text, description, sort_order'
  },
  {
    id: 'cfg-006',
    title: 'External rater domain not whitelisted',
    severity: 'medium',
    symptoms: ['External rater cannot submit feedback', 'Access denied error for external link'],
    causes: ['Email domain not in allowed list', 'External rater feature disabled', 'Token expired'],
    resolution: [
      'Check Setup → External Raters → Domain Whitelist',
      'Add the rater\'s email domain to allowed list',
      'Regenerate invitation token if expired',
      'Verify external_raters_enabled = true in cycle settings'
    ],
    prevention: 'Pre-configure common vendor/client domains; set long token expiration',
    tableRef: 'feedback_360_external_raters',
    fieldRef: 'email_domain, invitation_token, token_expires_at'
  },
  {
    id: 'cfg-007',
    title: 'Anonymity threshold not enforced',
    severity: 'critical',
    symptoms: ['Individual rater feedback visible when category has < 3 responses', 'Privacy violation alert'],
    causes: ['Threshold set to 0 or 1', 'Manager bypass incorrectly enabled', 'Report template bypasses aggregation'],
    resolution: [
      'IMMEDIATELY restrict report access until resolved',
      'Check rater category anonymity settings (min 3 recommended)',
      'Review manager bypass logs for unauthorized access',
      'Regenerate reports with correct aggregation settings'
    ],
    prevention: 'Set company-wide minimum threshold policy; audit reports before release',
    tableRef: 'feedback_360_rater_categories',
    fieldRef: 'is_anonymous, min_raters, anonymity_threshold'
  },
  {
    id: 'cfg-008',
    title: 'Notification templates not sending',
    severity: 'medium',
    symptoms: ['Raters not receiving email invitations', 'Participants unaware of cycle start'],
    causes: ['Notification template disabled', 'Email integration issue', 'Template variables malformed'],
    resolution: [
      'Check Setup → Notifications → 360 Templates are enabled',
      'Verify email integration is active (Settings → Email)',
      'Test notification with preview function',
      'Check email logs for delivery failures'
    ],
    prevention: 'Send test notifications before cycle activation; monitor delivery rates',
    tableRef: 'notification_templates',
    fieldRef: 'template_type, is_active, channel'
  }
];

const DIAGNOSTIC_STEPS = [
  {
    number: 1,
    title: 'Identify the Error Type',
    description: 'Determine if the error is validation, data, or permission related',
    substeps: [
      'Check error message text for specific field references',
      'Note when the error occurs (save, activate, preview)',
      'Identify the affected component (cycle, questions, raters)'
    ]
  },
  {
    number: 2,
    title: 'Check Configuration Hierarchy',
    description: 'Verify settings at company, cycle, and category levels',
    substeps: [
      'Review company-level defaults (Admin → Settings → 360 Defaults)',
      'Check cycle-specific overrides',
      'Validate rater category configurations'
    ]
  },
  {
    number: 3,
    title: 'Validate Data Relationships',
    description: 'Ensure all required relationships are properly configured',
    substeps: [
      'Verify framework → competency → question mappings',
      'Check participant → manager associations',
      'Confirm rater category → weight assignments'
    ]
  },
  {
    number: 4,
    title: 'Test in Preview Mode',
    description: 'Use preview functionality to simulate user experience',
    substeps: [
      'Preview as participant to test nomination flow',
      'Preview as rater to test survey display',
      'Preview as manager to test approval workflow'
    ]
  },
  {
    number: 5,
    title: 'Document and Resolve',
    description: 'Apply fix and document for future reference',
    substeps: [
      'Apply the resolution steps from issue database',
      'Test the fix with affected users',
      'Document root cause and prevention in cycle notes'
    ]
  }
];

const FIELD_REFERENCES = [
  { field: 'status', table: 'feedback_360_cycles', description: 'Cycle lifecycle state: draft, nomination, collection, processing, review, released, closed' },
  { field: 'anonymity_threshold', table: 'feedback_360_rater_categories', description: 'Minimum responses required before data is aggregated (default: 3)' },
  { field: 'is_active', table: 'feedback_360_questions', description: 'Whether question is available for assignment to cycles' },
  { field: 'weight_percentage', table: 'feedback_360_rater_categories', description: 'Contribution weight for this category to overall score (0-100)' },
  { field: 'framework_id', table: 'feedback_360_cycles', description: 'Assigned competency framework for this cycle' },
  { field: 'external_raters_enabled', table: 'feedback_360_cycles', description: 'Whether non-employee raters can participate' }
];

export function F360CommonIssuesSection() {
  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">8.1 Common Configuration Issues</h3>
        </div>
        <p className="text-muted-foreground">
          Resolving cycle setup, question bank, rater category, framework, and scale configuration problems 
          with diagnostic steps and prevention strategies.
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg flex flex-wrap gap-4 text-sm">
          <span><strong>Read Time:</strong> 12 minutes</span>
          <span><strong>Target Roles:</strong> Admin, Consultant</span>
          <span><strong>Issues Covered:</strong> 15+</span>
        </div>
      </div>

      {/* Learning Objectives */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Learning Objectives</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Diagnose and resolve common 360 configuration errors</li>
            <li>Apply systematic troubleshooting methodology</li>
            <li>Implement preventive measures for recurring issues</li>
            <li>Understand database field relationships affecting configuration</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Diagnostic Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Configuration Diagnostic Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={DIAGNOSTIC_STEPS} variant="numbered" />
        </CardContent>
      </Card>

      {/* Issue Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Configuration Issue Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {CONFIGURATION_ISSUES.map((issue) => (
            <div key={issue.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">{issue.id}</Badge>
                  <div>
                    <h4 className="font-semibold">{issue.title}</h4>
                    <Badge variant="outline" className={`mt-1 ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Symptoms
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {issue.symptoms.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Causes
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {issue.causes.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Resolution Steps
                </h5>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  {issue.resolution.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t text-xs">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">{issue.tableRef}</code>
                </span>
                <span className="text-muted-foreground">
                  Fields: <code className="bg-muted px-1 rounded">{issue.fieldRef}</code>
                </span>
                <span className="text-muted-foreground italic">
                  Prevention: {issue.prevention}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Field Reference */}
      <FieldReferenceTable 
        title="Configuration Field Reference"
        fields={FIELD_REFERENCES}
      />

      {/* Prevention Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Activation Configuration Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { item: 'Question bank has active questions linked to framework', category: 'Content' },
              { item: 'Rating scale labels and BARS configured', category: 'Content' },
              { item: 'Rater category weights sum to 100%', category: 'Scoring' },
              { item: 'Anonymity thresholds set (minimum 3)', category: 'Governance' },
              { item: 'Notification templates enabled and tested', category: 'Communications' },
              { item: 'Cycle dates do not overlap with existing cycles', category: 'Scheduling' },
              { item: 'Framework version locked and not deprecated', category: 'Content' },
              { item: 'External rater domains whitelisted (if enabled)', category: 'Access' }
            ].map((check, i) => (
              <div key={i} className="flex items-start gap-2 p-2 border rounded">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm">{check.item}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{check.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
