import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FileText, ArrowRight, Download, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const learningObjectives = [
  'Generate compliance reports for internal and external audits',
  'Export audit data in various formats (CSV, PDF, JSON)',
  'Respond to regulatory inquiries with appropriate documentation',
  'Configure automated compliance report schedules'
];

const auditEventCategories = [
  {
    category: 'consent_events',
    label: 'Consent Events',
    events: ['consent_granted', 'consent_declined', 'consent_withdrawn', 'consent_version_updated'],
    retention: '7 years',
    exportable: true
  },
  {
    category: 'policy_changes',
    label: 'Policy Changes',
    events: ['policy_created', 'policy_approved', 'policy_activated', 'policy_archived'],
    retention: '7 years',
    exportable: true
  },
  {
    category: 'investigation_access',
    label: 'Investigation Access',
    events: ['investigation_requested', 'investigation_approved', 'data_accessed', 'investigation_closed'],
    retention: '10 years',
    exportable: true
  },
  {
    category: 'ai_actions',
    label: 'AI Actions',
    events: ['ai_action_performed', 'human_review_completed', 'human_override_applied'],
    retention: '5 years',
    exportable: true
  },
  {
    category: 'data_access',
    label: 'Data Access',
    events: ['report_viewed', 'report_exported', 'results_released', 'admin_data_access'],
    retention: '3 years',
    exportable: true
  },
  {
    category: 'exception_handling',
    label: 'Exception Handling',
    events: ['exception_requested', 'exception_approved', 'exception_rejected', 'exception_expired'],
    retention: '5 years',
    exportable: true
  }
];

const reportTemplates = [
  {
    template: 'consent_summary',
    label: 'Consent Summary Report',
    description: 'Overview of consent rates, types, and withdrawal statistics',
    frequency: 'Monthly',
    audience: 'DPO, Compliance, HR'
  },
  {
    template: 'investigation_summary',
    label: 'Investigation Summary Report',
    description: 'Log of investigation requests, approvals, outcomes, and access patterns',
    frequency: 'Quarterly',
    audience: 'Legal, HR Director'
  },
  {
    template: 'ai_usage_report',
    label: 'AI Usage Report',
    description: 'AI action statistics, human override rates, and model performance metrics',
    frequency: 'Monthly',
    audience: 'IT, Compliance, HR'
  },
  {
    template: 'data_retention_status',
    label: 'Data Retention Status Report',
    description: 'Data lifecycle status, upcoming anonymization, and retention compliance',
    frequency: 'Monthly',
    audience: 'Compliance, IT'
  },
  {
    template: 'exception_audit',
    label: 'Exception Audit Report',
    description: 'Summary of exceptions granted, reasons, and validity periods',
    frequency: 'Quarterly',
    audience: 'HR Director, Compliance'
  },
  {
    template: 'regulatory_response',
    label: 'Regulatory Response Package',
    description: 'Comprehensive documentation package for regulatory inquiries',
    frequency: 'On-demand',
    audience: 'Legal, Compliance'
  }
];

const generateReportSteps: Step[] = [
  {
    title: 'Access Compliance Reports',
    description: 'Navigate to the audit and compliance reporting section.',
    substeps: [
      'Go to Performance → 360 Feedback → Governance → Audit Log',
      'Click "Reports" tab or "Generate Report" button',
      'Select report type from template list'
    ],
    expectedResult: 'Report configuration panel displayed'
  },
  {
    title: 'Configure Report Parameters',
    description: 'Set the scope and filters for the report.',
    substeps: [
      'Select date range for the report',
      'Choose cycle(s) to include (or all cycles)',
      'Filter by event categories if needed',
      'Select export format (PDF, CSV, JSON)'
    ],
    expectedResult: 'Report parameters configured'
  },
  {
    title: 'Generate and Review',
    description: 'Generate the report and review before export.',
    substeps: [
      'Click "Generate Report"',
      'Preview report content on screen',
      'Verify data accuracy and completeness',
      'Make adjustments if needed'
    ],
    expectedResult: 'Report generated and displayed for review'
  },
  {
    title: 'Export and Distribute',
    description: 'Export the report in selected format.',
    substeps: [
      'Click "Export" and select format',
      'Choose destination (download, email, archive)',
      'Add distribution notes if emailing',
      'Confirm export action'
    ],
    expectedResult: 'Report exported and optionally distributed'
  }
];

const auditResponseSteps: Step[] = [
  {
    title: 'Receive Audit Request',
    description: 'Document and categorize the incoming audit request.',
    substeps: [
      'Log the audit request with date and source',
      'Identify specific data/documentation requested',
      'Determine applicable regulatory framework (GDPR, local labor law, etc.)',
      'Assign response owner and deadline'
    ],
    expectedResult: 'Audit request documented with clear scope and timeline'
  },
  {
    title: 'Gather Required Documentation',
    description: 'Collect all relevant records and reports.',
    substeps: [
      'Generate applicable compliance reports',
      'Export audit logs for relevant time period',
      'Collect policy documents and approval records',
      'Include consent records if personal data involved'
    ],
    expectedResult: 'Complete documentation package assembled'
  },
  {
    title: 'Review with Legal/Compliance',
    description: 'Ensure response meets legal requirements.',
    substeps: [
      'Legal review of documentation package',
      'Verify no inadvertent disclosures',
      'Confirm response addresses all request items',
      'Obtain approval to submit response'
    ],
    expectedResult: 'Response package approved for submission'
  },
  {
    title: 'Submit and Document',
    description: 'Submit response and maintain records.',
    substeps: [
      'Submit response to requesting party',
      'Log submission date and method',
      'Archive copy of response package',
      'Set reminder for follow-up if needed'
    ],
    expectedResult: 'Audit response submitted with complete audit trail'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Report generation timing out',
    cause: 'Date range too large or too many events to process',
    solution: 'Narrow the date range or filter by specific event categories. For large exports, use the scheduled/async report generation option.'
  },
  {
    issue: 'Missing events in audit log',
    cause: 'Event logging was added after the missing event occurred, or filtering is excluding events',
    solution: 'Check filter settings to ensure desired events are included. Note that audit logging improvements may not be retroactive. Document any gaps for auditors.'
  },
  {
    issue: 'Cannot export report in requested format',
    cause: 'Format not supported for this report type or browser compatibility issue',
    solution: 'Check supported formats for the specific report template. Try alternative browser. For complex formats (e.g., JSON with attachments), use the API export option.'
  },
  {
    issue: 'Scheduled reports not being delivered',
    cause: 'Email configuration issue or schedule disabled',
    solution: 'Verify report schedule is active. Check email delivery settings and recipient addresses. Review scheduled job logs for delivery errors.'
  }
];

export function GovernanceAuditReporting() {
  return (
    <section id="sec-4-10" data-manual-anchor="sec-4-10" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          4.10 Audit Logging & Compliance Reports
        </h3>
        <p className="text-muted-foreground mt-2">
          Comprehensive audit trails, compliance report generation, and procedures for responding to external audits.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Navigation Path</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Performance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">360 Feedback</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Governance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Audit Log</span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Event Categories Table */}
      <div>
        <h4 className="font-medium mb-4">Audit Event Categories</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Category</TableHead>
                <TableHead className="font-medium">Events Tracked</TableHead>
                <TableHead className="font-medium">Retention</TableHead>
                <TableHead className="font-medium">Exportable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEventCategories.map((cat) => (
                <TableRow key={cat.category}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{cat.category}</code>
                    <p className="text-xs text-muted-foreground mt-1">{cat.label}</p>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1">
                      {cat.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs font-mono">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{cat.retention}</Badge>
                  </TableCell>
                  <TableCell>
                    {cat.exportable && (
                      <Download className="h-4 w-4 text-green-600" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Report Templates Table */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4" />
          Report Templates
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Template</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Frequency</TableHead>
                <TableHead className="font-medium">Audience</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportTemplates.map((template) => (
                <TableRow key={template.template}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{template.template}</code>
                    <p className="text-xs text-muted-foreground mt-1">{template.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{template.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{template.frequency}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{template.audience}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Audit Data Flow Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Audit Data Flow</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUDIT DATA FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  USER ACTIONS                    SYSTEM EVENTS                          │
│       │                               │                                 │
│       ▼                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      AUDIT LOG ENGINE                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │  Event   │  │ Timestamp│  │  Actor   │  │  Details │        │   │
│  │  │  Type    │  │   UTC    │  │   ID     │  │  (JSON)  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      AUDIT LOG STORAGE                          │   │
│  │                    (Immutable, Indexed)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│           ┌────────────────────┼────────────────────┐                  │
│           ▼                    ▼                    ▼                  │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐           │
│   │   REAL-TIME   │   │   SCHEDULED   │   │   ON-DEMAND   │           │
│   │   DASHBOARD   │   │    REPORTS    │   │    EXPORT     │           │
│   └───────────────┘   └───────────────┘   └───────────────┘           │
│                                                                         │
│  EXPORT FORMATS:                                                        │
│  ───────────────                                                        │
│  ● PDF - Executive summaries, formal reports                            │
│  ● CSV - Data analysis, spreadsheet integration                         │
│  ● JSON - API integration, automated processing                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={generateReportSteps} 
        title="Generating Compliance Reports" 
      />

      <StepByStep 
        steps={auditResponseSteps} 
        title="Responding to External Audits" 
      />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Audit & Reporting Issues" 
      />
    </section>
  );
}
