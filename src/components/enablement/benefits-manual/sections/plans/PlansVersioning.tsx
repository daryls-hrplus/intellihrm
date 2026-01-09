import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../manual/components/LearningObjectives';
import { StepByStep, Step } from '../../../manual/components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../manual/components/BusinessRules';
import { TipCallout, WarningCallout, InfoCallout } from '../../../manual/components/Callout';
import { ScreenshotPlaceholder } from '../../../manual/components/ScreenshotPlaceholder';
import { 
  History, 
  Calendar, 
  RefreshCw, 
  Archive,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const learningObjectives = [
  'Understand the plan lifecycle from creation through archival',
  'Execute plan year renewal with proper configuration migration',
  'Manage plan version history and compare changes across years',
  'Handle mid-year plan amendments correctly'
];

const planStatuses = [
  {
    status: 'Draft',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: FileText,
    description: 'Plan is being configured and tested',
    actions: ['Edit all fields', 'Delete plan', 'Activate'],
    restrictions: ['Not visible to employees', 'Cannot enroll', 'No carrier feeds']
  },
  {
    status: 'Active',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    icon: CheckCircle,
    description: 'Plan is available for enrollment and in effect',
    actions: ['Limited field edits', 'Inactivate', 'Renew'],
    restrictions: ['Cannot delete', 'Some fields locked', 'Changes audited']
  },
  {
    status: 'Inactive',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    icon: Clock,
    description: 'Plan exists but is not available for new enrollments',
    actions: ['Reactivate', 'Archive', 'View history'],
    restrictions: ['Existing enrollments may continue', 'No new enrollments']
  },
  {
    status: 'Archived',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    icon: Archive,
    description: 'Plan is historical record only',
    actions: ['View only', 'Export data', 'Copy to new plan'],
    restrictions: ['Cannot modify', 'No enrollments', 'Retained for compliance']
  }
];

const renewalSteps: Step[] = [
  {
    title: 'Initiate Plan Renewal',
    description: 'Start the renewal process for an existing plan.',
    substeps: [
      'Navigate to Benefits → Plan Management',
      'Select the plan to renew',
      'Click "Renew Plan" button',
      'Enter new plan year dates'
    ],
    expectedResult: 'New plan year version created with copied configuration'
  },
  {
    title: 'Update Plan Year Details',
    description: 'Modify configuration for the new plan year.',
    substeps: [
      'Review and update contribution amounts if changed',
      'Adjust eligibility rules if needed',
      'Update carrier information if contract renewed',
      'Upload new plan documents (SPD, SBC)'
    ],
    expectedResult: 'New plan year configuration reflects current terms'
  },
  {
    title: 'Configure Enrollment Migration',
    description: 'Determine how existing enrollees transition to new plan year.',
    substeps: [
      'Select migration type: Passive (auto-migrate) or Active (re-enroll required)',
      'Configure coverage level mapping if options changed',
      'Set default election for non-responding employees',
      'Define communication timeline'
    ],
    expectedResult: 'Migration rules configured for smooth transition'
  },
  {
    title: 'Schedule Activation',
    description: 'Set the timing for plan year transition.',
    substeps: [
      'Set activation date (typically plan year start date)',
      'Configure enrollment period for active enrollment',
      'Set deadline for enrollment changes',
      'Schedule carrier notification feeds'
    ],
    expectedResult: 'New plan year scheduled to activate automatically'
  },
  {
    title: 'Review and Approve',
    description: 'Final validation before new plan year goes live.',
    substeps: [
      'Run comparison report between old and new plan years',
      'Verify contribution amount changes',
      'Test eligibility rules with current employee data',
      'Obtain required approvals per workflow'
    ],
    expectedResult: 'New plan year approved and ready for activation'
  }
];

const versioningRules: BusinessRule[] = [
  {
    rule: 'Only one plan year version can be Active at a time',
    enforcement: 'System',
    description: 'When a new plan year activates, the previous year automatically transitions to Inactive status.'
  },
  {
    rule: 'Plan Code remains constant across versions',
    enforcement: 'System',
    description: 'The Plan Code is the persistent identifier. Version/year is a separate attribute that changes with each renewal.'
  },
  {
    rule: 'Archived plans cannot be modified',
    enforcement: 'System',
    description: 'Archived plan records are locked for compliance. To make changes, copy to a new plan or revert to Inactive status if within retention policy.'
  },
  {
    rule: 'Mid-year amendments require documentation',
    enforcement: 'Policy',
    description: 'Any change to an Active plan requires documented justification and may trigger employee communication. HR must approve mid-year changes.'
  },
  {
    rule: 'Contribution changes have payroll lead time',
    enforcement: 'Advisory',
    description: 'Schedule contribution changes at least one payroll period in advance to ensure proper deduction processing.'
  },
  {
    rule: 'Plan document retention follows compliance requirements',
    enforcement: 'System',
    description: 'Archived plan records and documents are retained per configured retention policy (minimum 7 years for ERISA plans).'
  }
];

export function PlansVersioning() {
  return (
    <div id="ben-sec-3-5" className="scroll-mt-24 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">3.5 Plan Year & Version Management</h3>
        <p className="text-muted-foreground">
          Benefits plans operate on annual cycles with version history maintained for compliance 
          and audit purposes. Understanding the plan lifecycle enables proper renewal management 
          and historical reporting.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Plan Lifecycle Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Plan Status Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Flow */}
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg overflow-x-auto">
            {planStatuses.map((status, index) => {
              const IconComponent = status.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`px-3 py-2 rounded-lg ${status.color} flex items-center gap-2`}>
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium text-sm whitespace-nowrap">{status.status}</span>
                  </div>
                  {index < planStatuses.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {planStatuses.map((status, index) => {
              const IconComponent = status.icon;
              return (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={status.color}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {status.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{status.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Allowed:</span>
                      <ul className="text-muted-foreground mt-1 space-y-0.5">
                        {status.actions.map((action, i) => (
                          <li key={i}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-amber-600 dark:text-amber-400">Restricted:</span>
                      <ul className="text-muted-foreground mt-1 space-y-0.5">
                        {status.restrictions.map((restriction, i) => (
                          <li key={i}>• {restriction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="Plan Year Concept">
        A plan year is typically 12 months aligned with calendar year (Jan-Dec) or fiscal year. 
        Each plan year is a distinct version that can have different contribution amounts, 
        eligibility rules, and carrier contracts while maintaining the same Plan Code for continuity.
      </InfoCallout>

      <StepByStep steps={renewalSteps} title="Plan Year Renewal Procedure" />

      <ScreenshotPlaceholder 
        alt="Plan renewal wizard showing configuration migration and enrollment settings"
        caption="Plan Renewal Wizard"
      />

      <BusinessRules rules={versioningRules} />

      {/* Version Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Version Comparison Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            HRplus provides tools to compare plan versions and track changes across plan years.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Side-by-Side Comparison
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Compare any two plan year versions</li>
                <li>• Highlight changed fields with before/after values</li>
                <li>• Show contribution amount differences</li>
                <li>• Identify eligibility rule changes</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                Change History Log
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete audit trail of all changes</li>
                <li>• User, timestamp, and IP for each change</li>
                <li>• Before/after values for every field</li>
                <li>• Exportable for compliance audits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Mid-Year Plan Changes">
        <div className="space-y-2">
          <p>Changing an Active plan mid-year can have significant impacts:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Contribution changes</strong>: May require employee communication and payroll updates</li>
            <li>• <strong>Eligibility changes</strong>: Could result in involuntary termination of coverage</li>
            <li>• <strong>Coverage changes</strong>: May trigger carrier amendments and form filings</li>
          </ul>
          <p className="mt-2">Always use the Impact Analysis tool before saving mid-year changes.</p>
        </div>
      </WarningCallout>

      <TipCallout title="Renewal Timeline">
        Start plan renewal at least 90 days before the new plan year. This allows time for:
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Carrier contract negotiations</li>
          <li>• Configuration and testing</li>
          <li>• Open enrollment communication</li>
          <li>• Employee enrollment period</li>
        </ul>
      </TipCallout>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Version Management Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Recommended
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  Use consistent Plan Code naming conventions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  Document all configuration changes in plan notes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  Test renewal in Draft before activation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  Schedule carrier feeds before go-live
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  Keep prior year versions for reference
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Avoid
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Changing Plan Codes between years
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Deleting plan versions with enrollment history
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Making changes without Impact Analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Activating new year before testing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Archiving plans with open claims
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
