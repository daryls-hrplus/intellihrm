import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Users, CheckCircle, FileText, Lock, Eye, AlertTriangle, ClipboardList } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, InfoCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const AUDIT_STEPS = [
  {
    title: 'Access Calibration Audit Trail',
    description: 'Navigate to the audit log for calibration sessions.',
    substeps: [
      'Go to Performance → Calibration → Sessions',
      'Select a completed session',
      'Click "View Audit Trail" in session actions',
      'Audit log opens showing all session activities'
    ],
    expectedResult: 'Chronological list of all session events and decisions'
  },
  {
    title: 'Review Session Summary',
    description: 'Examine high-level session outcomes.',
    substeps: [
      'View session metadata (date, duration, attendees)',
      'Review total employees calibrated',
      'Check number of rating adjustments made',
      'Examine distribution change summary'
    ],
    expectedResult: 'Understanding of session impact'
  },
  {
    title: 'Examine Individual Decisions',
    description: 'Drill into specific rating changes.',
    substeps: [
      'Filter by "Rating Adjustments" event type',
      'Click on individual adjustment entries',
      'Review original rating, new rating, and justification',
      'See who proposed, who approved, and vote results'
    ],
    expectedResult: 'Full transparency on each decision'
  },
  {
    title: 'Export Audit Report',
    description: 'Generate compliance documentation.',
    substeps: [
      'Click "Export" button',
      'Select format (PDF, Excel, CSV)',
      'Choose data scope (full audit or summary)',
      'Download report for records'
    ],
    expectedResult: 'Audit report saved for compliance purposes'
  }
];

const AUDIT_FIELDS = [
  { name: 'event_timestamp', required: true, type: 'DateTime', description: 'Exact time the event occurred', validation: 'System-generated, immutable' },
  { name: 'event_type', required: true, type: 'Enum', description: 'Type of event (rating_change, vote, comment, etc.)', validation: 'Predefined event types only' },
  { name: 'actor_id', required: true, type: 'UUID', description: 'User who performed the action', validation: 'Must be a valid session attendee' },
  { name: 'employee_id', required: false, type: 'UUID', description: 'Employee affected by the action (if applicable)' },
  { name: 'original_value', required: false, type: 'JSON', description: 'State before the change' },
  { name: 'new_value', required: false, type: 'JSON', description: 'State after the change' },
  { name: 'justification', required: false, type: 'Text', description: 'Reason provided for the action', validation: 'Required for rating changes' },
  { name: 'ip_address', required: true, type: 'String', description: 'IP address of the user performing action' },
  { name: 'session_id', required: true, type: 'UUID', description: 'Link to the calibration session' }
];

const BUSINESS_RULES = [
  { rule: 'All calibration events are logged immutably', enforcement: 'System' as const, description: 'Audit entries cannot be edited or deleted. System maintains complete history.' },
  { rule: 'Rating changes require documented justification', enforcement: 'System' as const, description: 'Cannot save a rating adjustment without entering a justification (min 10 characters).' },
  { rule: 'Audit logs must be retained for 7 years', enforcement: 'Policy' as const, description: 'Compliance with labor law requirements for performance documentation.' },
  { rule: 'Audit access is role-restricted', enforcement: 'System' as const, description: 'Only HR Admin, Compliance, and designated auditors can view full audit trails.' },
  { rule: 'AI decisions are logged with full explainability', enforcement: 'System' as const, description: 'Every AI suggestion includes the model version, inputs, and reasoning in the audit log.' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot access audit trail', cause: 'Insufficient permissions to view audit data.', solution: 'Contact HR Admin or Compliance team for access. Only authorized roles can view audit logs.' },
  { issue: 'Audit export fails or times out', cause: 'Large dataset or system load.', solution: 'Try exporting smaller date ranges. Schedule exports during off-peak hours.' },
  { issue: 'Missing audit entries', cause: 'Audit entries are never missing—likely a filter issue.', solution: 'Clear all filters and check date range. Audit system is immutable and complete.' },
  { issue: 'Cannot find specific employee\'s calibration history', cause: 'Employee may have been in multiple sessions.', solution: 'Search by employee ID across all sessions. Use the employee-centric audit view.' }
];

export function CalibrationGovernanceAudit() {
  return (
    <Card id="sec-4-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.6</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Shield className="h-3 w-3" />HR Admin / Compliance</Badge>
        </div>
        <CardTitle className="text-2xl">Calibration Governance & Audit</CardTitle>
        <CardDescription>Ensuring compliance, transparency, and accountability in calibration decisions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Calibration', 'Sessions', '[Session Name]', 'Audit Trail']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand calibration governance requirements</li>
            <li>Navigate and interpret the audit trail</li>
            <li>Export compliance documentation</li>
            <li>Apply best practices for defensible calibration processes</li>
          </ul>
        </div>

        {/* Why Governance Matters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Why Calibration Governance Matters</h3>
          <p className="text-muted-foreground">
            Calibration decisions directly impact compensation, promotions, and career trajectories. 
            Strong governance ensures these decisions are fair, consistent, and legally defensible.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'Legal Compliance', desc: 'Documentation protects against discrimination claims and supports employment decisions in legal proceedings.' },
              { icon: Eye, title: 'Transparency', desc: 'Clear audit trails build trust with employees and managers by showing how decisions are made.' },
              { icon: Lock, title: 'Accountability', desc: 'Immutable logs ensure decision-makers stand behind their calibration choices.' },
              { icon: ClipboardList, title: 'Continuous Improvement', desc: 'Audit data enables analysis of calibration patterns and process improvements over time.' }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-3 border rounded-lg">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            What Gets Logged
          </h3>
          <p className="text-muted-foreground">
            Every action in a calibration session is captured in an immutable audit log. 
            This includes both human decisions and AI-assisted actions.
          </p>
          <div className="space-y-3">
            {[
              { event: 'Session Start/End', details: 'Timestamp, facilitator, attendees present' },
              { event: 'Rating Adjustment', details: 'Employee, original rating, new rating, justification, proposer, approver, vote results' },
              { event: 'Discussion Flag', details: 'Employee flagged, reason, who flagged, resolution' },
              { event: 'AI Suggestion', details: 'Suggestion content, confidence score, model version, inputs used, human decision (accept/reject/modify)' },
              { event: 'Nine-Box Movement', details: 'Employee, original cell, new cell, justification' },
              { event: 'Comment/Note', details: 'Content, author, timestamp, related employee (if any)' },
              { event: 'Attendee Join/Leave', details: 'Attendee name, role, join/leave time' },
              { event: 'Export/View', details: 'Who accessed what data, when, export format' }
            ].map((item) => (
              <div key={item.event} className="flex gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{item.event}</h4>
                  <p className="text-xs text-muted-foreground">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InfoCallout title="Immutability Guarantee">
          Audit logs are write-once, read-many. Once an entry is created, it cannot be modified or deleted 
          by any user, including system administrators. This ensures the integrity of the audit trail.
        </InfoCallout>

        <StepByStep steps={AUDIT_STEPS} title="Reviewing the Audit Trail" />

        {/* Access Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Audit Access Controls
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Role</th>
                  <th className="text-left py-2 px-3 font-medium">Session Audit</th>
                  <th className="text-left py-2 px-3 font-medium">Employee History</th>
                  <th className="text-left py-2 px-3 font-medium">Export</th>
                  <th className="text-left py-2 px-3 font-medium">Compliance Reports</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Session Facilitator', session: 'Full (sessions they facilitated)', employee: 'Limited', export: 'Yes', compliance: 'No' },
                  { role: 'Session Chair', session: 'Full (sessions they chaired)', employee: 'Limited', export: 'Yes', compliance: 'No' },
                  { role: 'HR Admin', session: 'Full (all sessions)', employee: 'Full', export: 'Yes', compliance: 'Yes' },
                  { role: 'Compliance Officer', session: 'Full (all sessions)', employee: 'Full', export: 'Yes', compliance: 'Yes' },
                  { role: 'Manager', session: 'Summary only', employee: 'Own directs only', export: 'Limited', compliance: 'No' },
                  { role: 'Employee', session: 'None', employee: 'Own record only', export: 'No', compliance: 'No' }
                ].map((item) => (
                  <tr key={item.role} className="border-b">
                    <td className="py-2 px-3 font-medium">{item.role}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.session}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.employee}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.export}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.compliance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Reporting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Compliance Reporting
          </h3>
          <p className="text-muted-foreground">
            The system generates standard compliance reports for regulatory requirements and internal audits.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { report: 'Calibration Summary Report', description: 'High-level overview of all sessions in a period, including participation rates and adjustment counts.' },
              { report: 'Rating Distribution Analysis', description: 'Pre/post calibration distribution comparison with statistical analysis.' },
              { report: 'Bias Detection Report', description: 'AI-generated analysis of rating patterns across demographic groups.' },
              { report: 'Manager Calibration Patterns', description: 'Analysis of individual manager rating tendencies and calibration impacts.' },
              { report: 'Decision Justification Report', description: 'All rating changes with full justification text for legal review.' },
              { report: 'AI Governance Report', description: 'Summary of AI suggestions, acceptance rates, and override patterns.' }
            ].map((item) => (
              <div key={item.report} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.report}</h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          Schedule quarterly reviews of calibration audit data with your compliance team. 
          Proactive analysis helps identify process improvements before issues become problems.
        </TipCallout>

        <WarningCallout title="Retention Requirements">
          Calibration audit data must be retained for a minimum of 7 years per labor law requirements. 
          Ensure your data retention policies account for this requirement.
        </WarningCallout>

        <FieldReferenceTable fields={AUDIT_FIELDS} title="Audit Log Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
