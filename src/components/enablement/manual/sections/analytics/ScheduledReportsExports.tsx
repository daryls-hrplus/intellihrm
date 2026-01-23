import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, Calendar, Mail, Download, FileText, Play, History, Settings } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, InfoCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldReference } from '../../components/FieldReferenceTable';
import { RelatedTopics, StepByStep } from '../../components';

const SCHEDULED_FIELDS: FieldReference[] = [
  { fieldName: 'id', location: 'scheduled_org_reports', required: true, description: 'Unique schedule identifier' },
  { fieldName: 'company_id', location: 'scheduled_org_reports', required: true, description: 'Company owning the schedule' },
  { fieldName: 'report_template_id', location: 'scheduled_org_reports', required: true, description: 'Template to execute' },
  { fieldName: 'schedule_name', location: 'scheduled_org_reports', required: true, description: 'Display name for the schedule' },
  { fieldName: 'schedule_type', location: 'scheduled_org_reports', required: true, description: 'daily, weekly, monthly, quarterly' },
  { fieldName: 'schedule_day', location: 'scheduled_org_reports', required: false, description: 'Day of week (1-7) or month (1-31)' },
  { fieldName: 'schedule_time', location: 'scheduled_org_reports', required: true, description: 'Time of day to execute (HH:MM)' },
  { fieldName: 'timezone', location: 'scheduled_org_reports', required: true, description: 'Timezone for schedule execution' },
  { fieldName: 'filter_config', location: 'scheduled_org_reports', required: false, description: 'JSON filter parameters for report' },
  { fieldName: 'recipients', location: 'scheduled_org_reports', required: true, description: 'Email addresses or distribution lists' },
  { fieldName: 'output_format', location: 'scheduled_org_reports', required: true, description: 'PDF, Excel, or PowerPoint' },
  { fieldName: 'is_active', location: 'scheduled_org_reports', required: true, description: 'Whether schedule is enabled' },
  { fieldName: 'last_run_at', location: 'scheduled_org_reports', required: false, description: 'Last successful execution timestamp' },
  { fieldName: 'next_run_at', location: 'scheduled_org_reports', required: false, description: 'Next scheduled execution timestamp' }
];

const GENERATED_FIELDS: FieldReference[] = [
  { fieldName: 'id', location: 'generated_reports', required: true, description: 'Unique report instance identifier' },
  { fieldName: 'schedule_id', location: 'generated_reports', required: false, description: 'Scheduled job that created this (null for ad-hoc)' },
  { fieldName: 'template_id', location: 'generated_reports', required: true, description: 'Template used for generation' },
  { fieldName: 'generated_by', location: 'generated_reports', required: true, description: 'User or system that triggered generation' },
  { fieldName: 'generated_at', location: 'generated_reports', required: true, description: 'Generation timestamp' },
  { fieldName: 'file_path', location: 'generated_reports', required: true, description: 'Storage path for generated file' },
  { fieldName: 'file_size_bytes', location: 'generated_reports', required: false, description: 'Size of generated file' },
  { fieldName: 'status', location: 'generated_reports', required: true, description: 'success, failed, pending' },
  { fieldName: 'error_message', location: 'generated_reports', required: false, description: 'Error details if failed' },
  { fieldName: 'delivery_status', location: 'generated_reports', required: false, description: 'Email delivery status' }
];

const STEPS = [
  {
    title: 'Select Report Template',
    description: 'Choose the report to schedule',
    substeps: [
      'Navigate to Performance → Reports → Schedules',
      'Click "Create Schedule"',
      'Select from available report templates'
    ],
    expectedResult: 'Template selected'
  },
  {
    title: 'Configure Schedule',
    description: 'Set frequency and timing',
    substeps: [
      'Choose schedule type (daily, weekly, monthly)',
      'Select day of week/month if applicable',
      'Set execution time and timezone'
    ],
    expectedResult: 'Schedule timing configured'
  },
  {
    title: 'Set Report Filters',
    description: 'Define data scope for each run',
    substeps: [
      'Select department/company filter',
      'Choose cycle or date range',
      'Apply any additional filters'
    ],
    expectedResult: 'Filters configured'
  },
  {
    title: 'Configure Recipients',
    description: 'Add email recipients',
    substeps: [
      'Enter email addresses or select distribution lists',
      'Set email subject line',
      'Add optional message body'
    ],
    expectedResult: 'Recipients configured'
  },
  {
    title: 'Activate Schedule',
    description: 'Enable and test',
    substeps: [
      'Toggle schedule to Active',
      'Click "Run Now" to test',
      'Verify email delivery'
    ],
    expectedResult: 'Schedule active and tested'
  }
];

const BUSINESS_RULES = [
  { rule: 'Schedules execute in timezone specified', enforcement: 'System' as const, description: 'Execution time respects the configured timezone.' },
  { rule: 'Failed deliveries retry 3 times', enforcement: 'System' as const, description: 'Email delivery failures retry with exponential backoff.' },
  { rule: 'Generated reports expire after 90 days', enforcement: 'System' as const, description: 'Old generated reports are automatically purged.' },
  { rule: 'Recipients must have report access', enforcement: 'Advisory' as const, description: 'Ensure recipients have permission to view the data.' }
];

export function ScheduledReportsExports() {
  return (
    <Card id="sec-6-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.10</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-amber-600 text-white"><Users className="h-3 w-3" />Admin / HR User</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-500" />
          Scheduled Reports & Exports
        </CardTitle>
        <CardDescription>
          Configure automated report generation and delivery to stakeholders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Reports', 'Schedules']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Create scheduled report jobs for automated delivery</li>
            <li>Configure recipients and delivery options</li>
            <li>Monitor execution history and troubleshoot failures</li>
            <li>Manage saved user configurations and favorites</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Automated Report Delivery
          </h3>
          <p className="text-muted-foreground">
            Scheduled Reports enables automated generation and email delivery of performance 
            reports. Configure once, and stakeholders receive fresh data on their preferred 
            schedule without manual intervention.
          </p>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: 'Daily', icon: Calendar, desc: 'For operational monitoring' },
              { label: 'Weekly', icon: Calendar, desc: 'For manager updates' },
              { label: 'Monthly', icon: Calendar, desc: 'For executive summaries' },
              { label: 'Quarterly', icon: Calendar, desc: 'For board reports' }
            ].map((item) => (
              <div key={item.label} className="p-3 border rounded-lg text-center">
                <item.icon className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Formats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Formats
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { format: 'PDF', icon: FileText, color: 'text-red-500', use: 'Best for final, formatted reports' },
              { format: 'Excel', icon: FileText, color: 'text-green-500', use: 'Best for data analysis and manipulation' },
              { format: 'PowerPoint', icon: FileText, color: 'text-orange-500', use: 'Best for presentations and meetings' }
            ].map((item) => (
              <Card key={item.format}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <h4 className="font-semibold">{item.format}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.use}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <StepByStep steps={STEPS} title="Creating a Scheduled Report" />

        {/* Execution History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Execution History
          </h3>
          <p className="text-muted-foreground">
            The execution history shows all past runs with status and delivery information:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-left p-3 border-b">Meaning</th>
                  <th className="text-left p-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { status: 'Success', meaning: 'Report generated and delivered', action: 'Download available' },
                  { status: 'Delivered', meaning: 'Email confirmed sent', action: 'Check recipient inbox' },
                  { status: 'Failed', meaning: 'Generation or delivery error', action: 'View error, retry' },
                  { status: 'Pending', meaning: 'Scheduled but not yet run', action: 'Wait for execution' }
                ].map((row, i) => (
                  <tr key={row.status} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.status}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.meaning}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Test Before Activating">
          Always use "Run Now" to test a new schedule before activating. This verifies 
          the report generates correctly and recipients are valid.
        </TipCallout>

        <InfoCallout title="Saved Configurations">
          Users can save their preferred filter combinations as personal favorites. 
          Access saved configurations from the report filter dropdown.
        </InfoCallout>

        <FieldReferenceTable 
          fields={SCHEDULED_FIELDS}
          title="Database Fields: scheduled_org_reports"
        />

        <FieldReferenceTable 
          fields={GENERATED_FIELDS}
          title="Database Fields: generated_reports"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-9', title: 'Report Builder Configuration' },
            { sectionId: 'sec-6-1', title: 'Appraisal Analytics Dashboard' },
            { sectionId: 'sec-7-6', title: 'Notification Orchestration' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
