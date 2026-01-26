import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Lightbulb, Eye, Lock, Database } from 'lucide-react';
import { FieldReferenceTable } from '../../../components/FieldReferenceTable';

const ANONYMITY_ISSUES = [
  {
    id: 'anon-001',
    title: 'Anonymity threshold not met for category',
    severity: 'critical',
    symptoms: ['Report shows "Insufficient data"', 'Category scores suppressed', 'Rater cannot submit (threshold warning)'],
    causes: ['Fewer than min_raters responded', 'Raters declined after assignment', 'Category enabled but no raters assigned'],
    resolution: [
      'Check rater count vs. anonymity_threshold in category settings',
      'For active cycles: Assign additional raters to meet threshold',
      'For post-collection: Accept data suppression or invoke manager bypass (requires HR approval)',
      'For future cycles: Increase rater pool during nomination'
    ],
    prevention: 'Set min_raters = 3 minimum; require 4+ nominations to account for declines',
    affectedTable: 'feedback_360_rater_categories',
    affectedFields: 'anonymity_threshold, min_raters, is_anonymous'
  },
  {
    id: 'anon-002',
    title: 'Manager bypass request processing',
    severity: 'high',
    symptoms: ['Manager requests access to sub-threshold data', 'Bypass request pending approval', 'Audit log shows bypass attempt'],
    causes: ['Legitimate business need for data', 'Investigation requirement', 'Insufficient understanding of policy'],
    resolution: [
      'Review bypass request justification in Admin → 360 → Bypass Requests',
      'Verify requester has legitimate need (document reason)',
      'If approved: Grant time-limited access (max 30 days)',
      'If denied: Document denial reason and communicate to requester',
      'All actions logged to audit trail automatically'
    ],
    prevention: 'Train managers on anonymity policy; provide aggregate insights as alternative',
    affectedTable: 'feedback_360_bypass_requests',
    affectedFields: 'requester_id, justification, approved_by, expires_at'
  },
  {
    id: 'anon-003',
    title: 'Visibility rule conflict',
    severity: 'medium',
    symptoms: ['User sees more/less data than expected', 'Report sections hidden unexpectedly', 'Access denied on report view'],
    causes: ['Cycle-level rules override company defaults', 'Conflicting audience type settings', 'Role permissions mismatch'],
    resolution: [
      'Check company-level visibility defaults (Settings → 360 → Visibility)',
      'Review cycle-specific overrides in cycle settings',
      'Verify user role matches allowed audience types',
      'For conflicts: Cycle settings take precedence over company defaults'
    ],
    prevention: 'Document visibility matrix; review during cycle setup',
    affectedTable: 'feedback_360_visibility_rules',
    affectedFields: 'cycle_id, role, can_view_scores, can_view_comments, can_view_rater_breakdown'
  },
  {
    id: 'anon-004',
    title: 'Consent gate blocking report access',
    severity: 'medium',
    symptoms: ['User cannot access their report', 'Consent prompt appears repeatedly', 'Error: "Consent required"'],
    causes: ['Participant never provided consent', 'Consent expired', 'New consent required for AI features'],
    resolution: [
      'Check consent status in participant record',
      'If pending: Prompt participant to complete consent form',
      'If expired: Re-request consent for continued access',
      'If declined: Respect decision; disable AI features for this participant'
    ],
    prevention: 'Request consent during cycle enrollment; set reminders before expiry',
    affectedTable: 'feedback_consent_records',
    affectedFields: 'participant_id, consent_type, consent_status, expires_at'
  },
  {
    id: 'anon-005',
    title: 'k-Anonymity violation in workforce analytics',
    severity: 'critical',
    symptoms: ['Dashboard shows individual-identifiable data', 'Filter combination reveals single employee', 'Audit alert triggered'],
    causes: ['Dimension combination too narrow', 'Sample size < 5 for intersection', 'Filter logic bypass'],
    resolution: [
      'IMMEDIATELY suppress the affected dashboard view',
      'Review filter combinations that led to violation',
      'Increase minimum sample size threshold in analytics settings',
      'Document incident per GDPR breach notification requirements',
      'Notify affected individuals if legally required'
    ],
    prevention: 'Set minimum sample size = 5; implement dimension restriction rules',
    affectedTable: 'feedback_360_analytics_config',
    affectedFields: 'min_sample_size, restricted_dimensions, k_anonymity_threshold'
  },
  {
    id: 'anon-006',
    title: 'External rater identity exposed',
    severity: 'high',
    symptoms: ['External rater name visible in report', 'Email address shown in feedback', 'Rater complains about identification'],
    causes: ['External category not marked as anonymous', 'Report template includes rater names', 'Comment contains self-identifying information'],
    resolution: [
      'Verify EXTERNAL category has is_anonymous = true',
      'Review report template for rater name fields',
      'If comment contains identifying info: Redact and regenerate report',
      'Notify external rater of the issue and remediation'
    ],
    prevention: 'Audit report templates; warn raters about self-identification in comments',
    affectedTable: 'feedback_360_external_raters',
    affectedFields: 'is_anonymous, display_as, organization'
  },
  {
    id: 'anon-007',
    title: 'Investigation mode access unauthorized',
    severity: 'critical',
    symptoms: ['Non-aggregated data accessed without approval', 'Audit log shows investigation access', 'Policy violation alert'],
    causes: ['Investigation mode enabled without proper approval', 'Role permission misconfigured', 'Emergency access not documented'],
    resolution: [
      'Immediately disable investigation mode access',
      'Review audit logs for accessed data',
      'Document incident and notify DPO if required',
      'Revoke access for unauthorized users',
      'Conduct policy review with offending user'
    ],
    prevention: 'Require dual approval for investigation mode; audit access weekly',
    affectedTable: 'feedback_360_investigation_access',
    affectedFields: 'granted_by, approved_by, reason, expires_at, access_log'
  }
];

const THRESHOLD_GUIDE = [
  { category: 'Self', isAnonymous: false, minRaters: 1, threshold: 'N/A (always identified)' },
  { category: 'Manager', isAnonymous: false, minRaters: 1, threshold: 'N/A (always identified)' },
  { category: 'Skip-Level', isAnonymous: false, minRaters: 0, threshold: 'N/A (always identified)' },
  { category: 'Peer', isAnonymous: true, minRaters: 3, threshold: '3 minimum (SHRM recommends 4+)' },
  { category: 'Direct Report', isAnonymous: true, minRaters: 3, threshold: '3 minimum; suppress if < threshold' },
  { category: 'External', isAnonymous: true, minRaters: 2, threshold: '2-3 based on pool size' }
];

const FIELD_REFERENCES = [
  { field: 'is_anonymous', table: 'feedback_360_rater_categories', description: 'Whether responses in this category are aggregated for privacy' },
  { field: 'anonymity_threshold', table: 'feedback_360_rater_categories', description: 'Minimum responses required before category data is shown' },
  { field: 'consent_status', table: 'feedback_consent_records', description: 'Participant consent state: pending, granted, declined, expired' },
  { field: 'can_view_rater_breakdown', table: 'feedback_360_visibility_rules', description: 'Whether user can see scores by rater category' },
  { field: 'k_anonymity_threshold', table: 'feedback_360_analytics_config', description: 'Minimum individuals in any data intersection (default: 5)' },
  { field: 'investigation_mode', table: 'feedback_360_cycles', description: 'Whether non-aggregated access is enabled for investigations' }
];

export function F360AnonymityPrivacyIssues() {
  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">8.3 Anonymity & Privacy Problems</h3>
        </div>
        <p className="text-muted-foreground">
          Resolving threshold violations, bypass scenarios, visibility rule conflicts, consent gate failures, 
          and k-anonymity preservation issues.
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg flex flex-wrap gap-4 text-sm">
          <span><strong>Read Time:</strong> 12 minutes</span>
          <span><strong>Target Roles:</strong> Admin, HR Partner</span>
          <span><strong>Industry Benchmark:</strong> SHRM minimum 3 raters per anonymous category</span>
        </div>
      </div>

      {/* Critical Alert */}
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertTitle>Privacy Protection is Non-Negotiable</AlertTitle>
        <AlertDescription>
          Anonymity violations can result in legal liability, loss of employee trust, and GDPR penalties. 
          Always err on the side of suppressing data rather than exposing individual feedback.
        </AlertDescription>
      </Alert>

      {/* Learning Objectives */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Learning Objectives</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Understand anonymity thresholds and k-anonymity principles</li>
            <li>Process manager bypass requests according to policy</li>
            <li>Resolve visibility rule conflicts</li>
            <li>Handle consent gate and investigation mode issues</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Threshold Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Anonymity Threshold Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Anonymous?</th>
                  <th className="text-left p-2">Min Raters</th>
                  <th className="text-left p-2">Threshold Rule</th>
                </tr>
              </thead>
              <tbody>
                {THRESHOLD_GUIDE.map((cat, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-medium">{cat.category}</td>
                    <td className="p-2">
                      <Badge variant={cat.isAnonymous ? 'default' : 'outline'}>
                        {cat.isAnonymous ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="p-2">{cat.minRaters}</td>
                    <td className="p-2 text-muted-foreground">{cat.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Issue Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anonymity & Privacy Issue Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {ANONYMITY_ISSUES.map((issue) => (
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
                  <code className="bg-muted px-1 rounded">{issue.affectedTable}</code>
                </span>
                <span className="text-muted-foreground">
                  Fields: <code className="bg-muted px-1 rounded">{issue.affectedFields}</code>
                </span>
                {issue.prevention && (
                  <span className="text-muted-foreground italic">
                    Prevention: {issue.prevention}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Field Reference */}
      <FieldReferenceTable 
        title="Anonymity & Privacy Field Reference"
        fields={FIELD_REFERENCES}
      />

      {/* GDPR Compliance Note */}
      <Card>
        <CardHeader>
          <CardTitle>GDPR Compliance Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium mb-2">Data Subject Rights</h5>
              <ul className="text-muted-foreground space-y-1">
                <li>• Access: Participants can request their feedback data</li>
                <li>• Rectification: Factual errors can be corrected</li>
                <li>• Erasure: Subject to retention policy limits</li>
                <li>• Portability: Export in machine-readable format</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium mb-2">Breach Response (72-Hour Rule)</h5>
              <ul className="text-muted-foreground space-y-1">
                <li>• Notify DPO immediately upon discovery</li>
                <li>• Document scope and affected individuals</li>
                <li>• Report to supervisory authority within 72 hours</li>
                <li>• Notify affected individuals if high risk</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
