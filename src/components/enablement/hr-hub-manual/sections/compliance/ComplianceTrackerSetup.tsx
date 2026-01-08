import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, CheckCircle, AlertTriangle, FileText, Calendar, TrendingUp } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const complianceCategories = [
  { category: 'Labor Law', examples: 'Minimum wage updates, contract requirements, working hours limits', frequency: 'Annual/As changed' },
  { category: 'Safety Regulations', examples: 'OSHA compliance, workplace audits, safety training', frequency: 'Ongoing' },
  { category: 'Tax Compliance', examples: 'Statutory deductions, annual filings, withholding updates', frequency: 'Monthly/Annual' },
  { category: 'Data Protection', examples: 'GDPR, data retention policies, privacy notices', frequency: 'Ongoing' },
  { category: 'Immigration', examples: 'Work permit renewals, visa tracking, CSME documentation', frequency: 'Per employee' },
  { category: 'Benefits', examples: 'Enrollment deadlines, contribution limits, plan updates', frequency: 'Annual' },
  { category: 'Training', examples: 'Mandatory certifications, safety training, compliance courses', frequency: 'Per requirement' },
  { category: 'Licensing', examples: 'Professional license renewals, business permits', frequency: 'Per license' }
];

const statusDefinitions = [
  { status: 'Pending', description: 'Requirement identified but not yet started', color: 'bg-yellow-500', icon: Clock },
  { status: 'In Progress', description: 'Work has begun on meeting the requirement', color: 'bg-blue-500', icon: TrendingUp },
  { status: 'Compliant', description: 'Requirement has been fully met', color: 'bg-green-500', icon: CheckCircle },
  { status: 'Overdue', description: 'Deadline has passed without compliance', color: 'bg-red-500', icon: AlertTriangle }
];

const configurationSteps = [
  {
    title: 'Navigate to Compliance Tracker',
    description: 'Access HR Hub → Compliance from the main menu.',
    expectedResult: 'Compliance Tracker page loads with dashboard and requirements list'
  },
  {
    title: 'Review Overall Compliance Rate',
    description: 'The header shows your overall compliance percentage based on compliant items vs. total requirements.',
    expectedResult: 'Quick visibility into compliance health'
  },
  {
    title: 'Add New Requirement',
    description: 'Click "Add Requirement" to create a new compliance item.',
    expectedResult: 'Requirement creation dialog opens'
  },
  {
    title: 'Complete Requirement Details',
    description: 'Enter all relevant information for the compliance requirement:',
    substeps: [
      'Title: Clear, specific name for the requirement',
      'Category: Select from Labor Law, Safety, Tax, etc.',
      'Description: Details about what compliance entails',
      'Deadline: When this must be completed by',
      'Responsible: Person or role accountable',
      'Priority: Low, Medium, High, or Urgent'
    ],
    expectedResult: 'Requirement is fully documented'
  },
  {
    title: 'Track Progress',
    description: 'Update progress percentage and status as work is completed. Items automatically show as overdue when deadline passes.',
    expectedResult: 'Real-time compliance visibility'
  },
  {
    title: 'Monitor Dashboard',
    description: 'Use the tabs (All, Overdue, In Progress, Compliant) to filter and focus on different compliance states.',
    expectedResult: 'Actionable view of compliance priorities'
  }
];

const requirementFields = [
  { name: 'title', type: 'Text', required: true, description: 'Clear name for the compliance requirement' },
  { name: 'category', type: 'Select', required: true, description: 'Category (Labor Law, Safety, Tax, etc.)' },
  { name: 'description', type: 'Text', required: false, description: 'Details about compliance criteria' },
  { name: 'deadline', type: 'Date', required: true, description: 'When compliance must be achieved' },
  { name: 'responsible', type: 'Text', required: false, description: 'Person/role accountable' },
  { name: 'priority', type: 'Select', required: true, description: 'Low, Medium, High, or Urgent' },
  { name: 'status', type: 'Select', required: true, description: 'Pending, In Progress, Compliant, or Overdue' },
  { name: 'progress', type: 'Number', required: false, description: 'Completion percentage (0-100)' }
];

const statusFlowDiagram = `stateDiagram-v2
    [*] --> Pending: Requirement Added
    Pending --> InProgress: Work Begins
    InProgress --> Compliant: Completed
    Pending --> Overdue: Deadline Passes
    InProgress --> Overdue: Deadline Passes
    Overdue --> InProgress: Remediation Starts
    Compliant --> [*]`;

export function ComplianceTrackerSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.6</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          8 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle>Compliance Tracker</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track regulatory requirements across jurisdictions and ensure timely compliance
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              The Compliance Tracker helps organizations monitor and manage regulatory requirements 
              across multiple jurisdictions. Track deadlines, assign responsibility, and maintain 
              visibility into your compliance posture with real-time dashboards.
            </p>
          </div>

          <InfoCallout title="Multi-Jurisdiction Support">
            For organizations operating across the Caribbean, Africa, and other regions, the 
            Compliance Tracker can manage jurisdiction-specific requirements while providing 
            a consolidated view of overall compliance health.
          </InfoCallout>

          {/* Compliance Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Categories
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Category</th>
                    <th className="border p-3 text-left font-medium">Examples</th>
                    <th className="border p-3 text-left font-medium">Typical Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceCategories.map((cat, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-medium">{cat.category}</td>
                      <td className="border p-3 text-muted-foreground">{cat.examples}</td>
                      <td className="border p-3">
                        <Badge variant="outline">{cat.frequency}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Definitions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status Definitions
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {statusDefinitions.map((status, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <status.icon className={`h-5 w-5 ${status.color.replace('bg-', 'text-').replace('/20', '')} mt-0.5 flex-shrink-0`} />
                  <div>
                    <h5 className="font-medium">{status.status}</h5>
                    <p className="text-sm text-muted-foreground">{status.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Flow Diagram */}
          <WorkflowDiagram
            title="Compliance Status Transitions"
            description="How compliance items move through different states"
            diagram={statusFlowDiagram}
          />

          <WarningCallout title="Overdue Items">
            Items marked as Overdue are highlighted in red for immediate attention. Overdue compliance 
            items may indicate regulatory exposure and should be addressed as a priority. The system 
            automatically transitions items to Overdue when deadlines pass without achieving Compliant status.
          </WarningCallout>

          {/* Configuration Steps */}
          <StepByStep
            title="Using the Compliance Tracker"
            steps={configurationSteps}
          />

          {/* Field Reference */}
          <FieldReferenceTable
            title="Requirement Fields"
            fields={requirementFields}
          />

          <TipCallout title="Dashboard Metrics">
            The compliance dashboard shows key metrics at a glance: total requirements, compliant count, 
            in-progress count, and overdue count. The overall compliance rate is calculated as 
            (Compliant / Total) × 100%. Monitor this regularly to identify trends.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Review compliance dashboard weekly during leadership meetings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Set deadlines with buffer time before actual regulatory due dates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Assign clear ownership for each compliance requirement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use priorities consistently to triage competing requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Never ignore overdue items - escalate to leadership if blockers exist</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
