import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Clock, AlertCircle, CheckCircle, Shield, FileSearch } from 'lucide-react';
import { LearningObjectives, TipCallout, CriticalCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const DATA_MANAGEMENT_ISSUES = [
  {
    id: 'DMC-001',
    symptom: 'GDPR data export request incomplete or missing L&D records',
    severity: 'High',
    cause: 'Export job not including all L&D tables, relationship traversal incomplete, or data archived.',
    resolution: [
      'Verify data export includes all L&D tables (enrollments, progress, certificates)',
      'Check join relationships are being followed correctly',
      'Validate export against data mapping documentation',
      'Include archived data if within retention period',
      'Document any intentionally excluded data with legal justification'
    ],
    prevention: 'Maintain data inventory for GDPR. Test exports quarterly with sample requests.'
  },
  {
    id: 'DMC-002',
    symptom: 'User data not being anonymized after retention period expires',
    severity: 'High',
    cause: 'Anonymization job not running, retention rules misconfigured, or data dependencies blocking deletion.',
    resolution: [
      'Check data retention job schedule and last run time',
      'Verify retention rules in company data settings',
      'Identify records with expired retention still in system',
      'Review data dependencies (certificates, audit logs) blocking anonymization',
      'Run manual anonymization for critical cases'
    ],
    prevention: 'Configure retention rules during implementation. Monitor anonymization job health.'
  },
  {
    id: 'DMC-003',
    symptom: 'Training history not appearing in employee data export',
    severity: 'Medium',
    cause: 'Training data not included in export template, or employee ID mismatch, or data in separate schema.',
    resolution: [
      'Verify export template includes L&D module tables',
      'Check employee ID consistency across HR and L&D records',
      'Include external_training_records in export scope',
      'Validate certificate and credential data is exported',
      'Test export with known training history'
    ],
    prevention: 'Include L&D in data export templates. Test exports across modules.'
  },
  {
    id: 'DMC-004',
    symptom: 'Consent records not logged for mandatory compliance training',
    severity: 'High',
    cause: 'Consent capture disabled, logging trigger not active, or acknowledgment step skipped.',
    resolution: [
      'Verify consent_required flag on compliance training',
      'Check compliance_audit_log for consent events',
      'Enable acknowledgment step in compliance training workflow',
      'Review consent logging trigger configuration',
      'Retroactively collect consent if missing'
    ],
    prevention: 'Require acknowledgment for all mandatory training. Enable audit logging from start.'
  },
  {
    id: 'DMC-005',
    symptom: 'Audit log data truncated or missing critical events',
    severity: 'High',
    cause: 'Log rotation deleting too early, storage quota exceeded, or logging disabled for event type.',
    resolution: [
      'Check compliance_audit_log for gaps in sequence_number',
      'Review log rotation and archival settings',
      'Verify storage quota for audit logs',
      'Check all critical event types are enabled for logging',
      'Restore from backup if logs were incorrectly deleted'
    ],
    prevention: 'Configure long-term audit log retention. Set up alerts for logging failures.'
  },
  {
    id: 'DMC-006',
    symptom: 'Cross-border data transfer validation failing',
    severity: 'Medium',
    cause: 'Country data residency rules not configured, or transfer without adequate safeguards.',
    resolution: [
      'Review data residency configuration for affected countries',
      'Verify adequate safeguards (SCCs, BCRs) are documented',
      'Check if data replication to allowed regions is configured',
      'Consult legal team for transfer mechanism validation',
      'Enable transfer logging for compliance evidence'
    ],
    prevention: 'Map data flows during implementation. Document transfer mechanisms for each country.'
  },
];

const QUICK_REFERENCE = [
  { id: 'DMC-001', symptom: 'GDPR export incomplete', severity: 'High' },
  { id: 'DMC-002', symptom: 'Data not anonymized after retention', severity: 'High' },
  { id: 'DMC-004', symptom: 'Consent not logged for mandatory training', severity: 'High' },
  { id: 'DMC-005', symptom: 'Audit log truncated', severity: 'High' },
];

const DIAGNOSTIC_QUERIES = [
  {
    title: 'Find orphan enrollments without parent courses',
    query: `SELECT e.id, e.user_id, e.course_id 
FROM lms_enrollments e
LEFT JOIN lms_courses c ON e.course_id = c.id
WHERE c.id IS NULL;`,
    purpose: 'Identifies enrollments referencing deleted or missing courses'
  },
  {
    title: 'Find progress records with percentage mismatch',
    query: `SELECT e.id, e.progress_percentage,
  (SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0) 
   FROM lms_lesson_progress lp 
   JOIN lms_lessons l ON lp.lesson_id = l.id 
   JOIN lms_modules m ON l.module_id = m.id 
   WHERE m.course_id = e.course_id AND lp.user_id = e.user_id) as calculated
FROM lms_enrollments e
WHERE ABS(e.progress_percentage - calculated) > 5;`,
    purpose: 'Detects enrollments where stored progress differs from calculated progress'
  },
  {
    title: 'Find overdue compliance assignments',
    query: `SELECT cta.*, ct.name as training_name, p.full_name
FROM compliance_training_assignments cta
JOIN compliance_training ct ON cta.compliance_training_id = ct.id
JOIN profiles p ON cta.employee_id = p.id
WHERE cta.due_date < NOW() 
  AND cta.status NOT IN ('completed', 'exempted')
ORDER BY cta.due_date;`,
    purpose: 'Lists all overdue compliance training for escalation review'
  },
  {
    title: 'Find high-risk learners without interventions',
    query: `SELECT crp.*, p.full_name
FROM completion_risk_predictions crp
JOIN profiles p ON crp.employee_id = p.id
WHERE crp.risk_level = 'high' 
  AND crp.id NOT IN (SELECT prediction_id FROM risk_interventions)
ORDER BY crp.predicted_at DESC;`,
    purpose: 'Identifies at-risk learners who need intervention but haven\'t received one'
  },
];

export function LndDataManagementIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-14" data-manual-anchor="sec-9-14" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~12 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant, Compliance Officer</span>
          </div>
          <h3 className="text-xl font-semibold">9.14 Data Management, Privacy & Retention Issues</h3>
          <p className="text-muted-foreground mt-1">
            GDPR compliance, data exports, anonymization, consent logging, audit trails, and cross-border transfers
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve GDPR data subject request issues',
          'Troubleshoot data retention and anonymization job failures',
          'Fix missing consent records for mandatory training',
          'Address audit log gaps and truncation issues',
          'Resolve cross-border data transfer validation failures'
        ]}
      />

      <CriticalCallout title="Regulatory Compliance">
        DMC-001, DMC-002, and DMC-004 are critical for GDPR and regional data protection compliance. 
        Failures may result in regulatory fines. Escalate immediately if unresolved.
      </CriticalCallout>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Data Management Issues Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Issue ID</th>
                  <th className="text-left py-2 font-medium">Symptom</th>
                  <th className="text-left py-2 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">
                      <Badge variant="outline" className="font-mono">{item.id}</Badge>
                    </td>
                    <td className="py-2">{item.symptom}</td>
                    <td className="py-2">
                      <Badge variant="destructive">{item.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Detailed Issue Resolution (6 Issues)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {DATA_MANAGEMENT_ISSUES.map((issue) => (
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Diagnostic Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Diagnostic SQL Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these queries to diagnose data integrity issues across L&D tables:
          </p>
          {DIAGNOSTIC_QUERIES.map((query, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">{query.title}</h4>
              <p className="text-xs text-muted-foreground">{query.purpose}</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                <code>{query.query}</code>
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      <TipCallout title="Data Governance Best Practice">
        Schedule quarterly data quality audits using the diagnostic queries above. Document findings 
        and remediation actions for compliance evidence and continuous improvement.
      </TipCallout>
    </div>
  );
}
