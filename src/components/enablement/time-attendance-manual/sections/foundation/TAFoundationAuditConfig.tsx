import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, FileSearch, Shield, GraduationCap, Database,
  Eye, AlertTriangle, History
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  ComplianceCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationAuditConfig() {
  const learningObjectives = [
    'Configure audit trail logging for time-sensitive operations',
    'Define which actions require audit logging',
    'Set retention policies for audit data',
    'Query and export audit logs for compliance',
    'Understand audit log fields and their meanings'
  ];

  const auditLogFields: FieldDefinition[] = [
    { name: 'audit_id', required: true, type: 'uuid', description: 'Unique audit entry ID', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Auto-set from context' },
    { name: 'action_type', required: true, type: 'enum', description: 'Type of action performed', defaultValue: '—', validation: 'create, update, delete, approve, reject, etc.' },
    { name: 'entity_type', required: true, type: 'text', description: 'Table/entity affected', defaultValue: '—', validation: 'e.g., time_clock_entries, timesheets' },
    { name: 'entity_id', required: true, type: 'uuid', description: 'ID of affected record', defaultValue: '—', validation: 'Links to source record' },
    { name: 'employee_id', required: false, type: 'uuid', description: 'Employee whose data changed', defaultValue: 'null', validation: 'For employee-related actions' },
    { name: 'performed_by', required: true, type: 'uuid', description: 'User who performed action', defaultValue: '—', validation: 'User ID' },
    { name: 'performed_at', required: true, type: 'timestamp', description: 'When action occurred', defaultValue: 'now()', validation: 'Server timestamp' },
    { name: 'old_values', required: false, type: 'jsonb', description: 'Values before change', defaultValue: '{}', validation: 'JSON snapshot' },
    { name: 'new_values', required: false, type: 'jsonb', description: 'Values after change', defaultValue: '{}', validation: 'JSON snapshot' },
    { name: 'change_reason', required: false, type: 'text', description: 'User-provided justification', defaultValue: 'null', validation: 'Required for corrections' },
    { name: 'ip_address', required: false, type: 'text', description: 'Source IP address', defaultValue: 'null', validation: 'Client IP' },
    { name: 'user_agent', required: false, type: 'text', description: 'Browser/device info', defaultValue: 'null', validation: 'Device fingerprint' },
    { name: 'session_id', required: false, type: 'text', description: 'User session identifier', defaultValue: 'null', validation: 'For session tracking' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Immutable Audit Trail',
      enforcement: 'System',
      description: 'Audit log entries cannot be modified or deleted by any user, including system administrators. This ensures compliance integrity.'
    },
    {
      rule: 'Automatic Logging',
      enforcement: 'System',
      description: 'All configured actions are logged automatically via database triggers. Applications cannot bypass audit logging.'
    },
    {
      rule: 'Retention Period',
      enforcement: 'System',
      description: 'Audit logs are retained for the configured period (default: 7 years). Archival processes move old logs to cold storage.'
    },
    {
      rule: 'Change Reason Required',
      enforcement: 'Policy',
      description: 'For punch corrections and timesheet modifications, users must provide a change_reason explaining the adjustment.'
    },
    {
      rule: 'Sensitive Field Masking',
      enforcement: 'System',
      description: 'Certain fields (e.g., biometric data, PII) are masked in old_values/new_values to prevent exposure in audit reports.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Audit Configuration',
      description: 'Access audit settings from the system administration menu.',
      notes: ['Admin → System → Audit Trail Configuration']
    },
    {
      title: 'Select Entities to Audit',
      description: 'Choose which tables/entities require audit logging.',
      notes: ['Recommended: time_clock_entries, timesheets, exceptions, approvals']
    },
    {
      title: 'Configure Action Types',
      description: 'Select which actions to log: create, update, delete, approve, reject, etc.',
      notes: ['Most organizations log all actions for compliance']
    },
    {
      title: 'Set Retention Policy',
      description: 'Define how long audit logs are retained before archival.',
      notes: ['7 years is common for labor law compliance']
    },
    {
      title: 'Configure Change Reason Requirements',
      description: 'Enable mandatory change reasons for specific actions.',
      notes: ['Required for punch corrections, recommended for all edits']
    },
    {
      title: 'Set Up Audit Reports',
      description: 'Create scheduled reports for compliance review.',
      notes: ['Weekly exception reports, monthly audit summaries']
    }
  ];

  return (
    <Card id="ta-sec-2-14" data-manual-anchor="ta-sec-2-14" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.14</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Audit Trail Configuration</CardTitle>
        <CardDescription>
          Logging time-sensitive operations, retention policies, and compliance reporting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Why Audit Logging Matters</h3>
              <p className="text-muted-foreground leading-relaxed">
                Time and attendance data directly impacts payroll—and payroll affects wages. 
                Any modification to clock entries, timesheets, or approvals must be traceable 
                for compliance audits, labor disputes, and internal investigations. The audit 
                trail provides an immutable record of who changed what, when, and why. This 
                is essential for SOX compliance, labor law adherence, and fraud prevention.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Audit Trail Viewer"
          caption="Audit log interface showing change history with before/after values and justifications"
        />

        {/* Audited Entities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Entities with Audit Logging
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { entity: 'time_clock_entries', actions: 'create, update, delete', priority: 'Critical' },
              { entity: 'timesheets', actions: 'submit, approve, reject, unlock', priority: 'Critical' },
              { entity: 'attendance_exceptions', actions: 'create, resolve, override', priority: 'High' },
              { entity: 'overtime_requests', actions: 'create, approve, reject', priority: 'High' },
              { entity: 'attendance_policies', actions: 'create, update, deactivate', priority: 'Medium' },
              { entity: 'shift_assignments', actions: 'create, update, delete', priority: 'Medium' },
              { entity: 'geofence_validations', actions: 'override', priority: 'High' },
              { entity: 'face_verification_logs', actions: 'manual_override', priority: 'High' }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg bg-muted/30 flex items-center justify-between">
                <div>
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{item.entity}</code>
                  <p className="text-xs text-muted-foreground mt-1">{item.actions}</p>
                </div>
                <Badge 
                  variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={auditLogFields}
          title="time_attendance_audit_log Table Fields"
        />

        {/* Compliance Callout */}
        <ComplianceCallout>
          <strong>Regulatory Requirements:</strong> Many jurisdictions require employers to 
          maintain time records for 3-7 years. The audit trail ensures you can prove what 
          data existed at any point in time, who made changes, and why. This is critical 
          for wage & hour audits, discrimination claims, and union grievances.
        </ComplianceCallout>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Configuration
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Query Examples */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Common Audit Queries
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Punch corrections this week', filter: 'action_type=update, entity_type=time_clock_entries, date range' },
              { name: 'All actions by specific user', filter: 'performed_by=user_id' },
              { name: 'Timesheet approvals pending review', filter: 'action_type=approve, entity_type=timesheets' },
              { name: 'Geofence overrides', filter: 'entity_type=geofence_validations, action_type=override' },
              { name: 'After-hours changes', filter: 'performed_at outside business hours' }
            ].map((query, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="font-medium text-sm">{query.name}</div>
                <div className="text-xs text-muted-foreground mt-1">Filter: {query.filter}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>Audit Reports:</strong> Use the built-in audit report generator to create 
          scheduled reports. Common reports include: daily corrections summary, weekly 
          approval audit, and monthly exception analysis. Reports can be emailed to 
          compliance officers automatically.
        </InfoCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Proactive Monitoring:</strong> Set up alerts for unusual patterns: high 
          volume of corrections by one user, corrections near payroll deadline, or repeated 
          geofence overrides. These can indicate fraud or process issues.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
