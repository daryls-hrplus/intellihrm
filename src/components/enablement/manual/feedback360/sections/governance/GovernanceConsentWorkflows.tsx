import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

const learningObjectives = [
  'Implement consent collection gates during cycle enrollment',
  'Process consent withdrawal requests with proper audit trails',
  'Generate consent compliance reports for regulatory audits',
  'Configure consent reminder workflows for pending consents'
];

const consentCollectionSteps: Step[] = [
  {
    title: 'Employee Accesses 360 Feedback',
    description: 'Employee navigates to their 360 feedback cycle from ESS dashboard.',
    substeps: [
      'Employee clicks "My 360 Feedback" or notification link',
      'System checks existing consent records for the cycle',
      'ConsentGate component evaluates required consent status'
    ],
    expectedResult: 'ConsentGate determines if consent collection is needed'
  },
  {
    title: 'Consent Collection Dialog Displayed',
    description: 'If required consents are missing, ConsentManagementPanel is shown.',
    substeps: [
      'Panel displays all consent types with descriptions',
      'Required consents (participation, data_processing) marked as mandatory',
      'Optional consents (AI analysis, signal generation) clearly labeled'
    ],
    expectedResult: 'Employee sees comprehensive consent form with clear explanations'
  },
  {
    title: 'Employee Reviews and Grants Consent',
    description: 'Employee reads consent language and makes selections.',
    substeps: [
      'Employee toggles consent checkboxes',
      'System validates required consents are selected',
      'Employee clicks "Submit Consent" button'
    ],
    expectedResult: 'Consent form validated; submission enabled when requirements met'
  },
  {
    title: 'System Records Consent with Audit Data',
    description: 'Consent records are created with full audit trail.',
    substeps: [
      'System captures IP address and user agent',
      'Timestamp recorded for each consent type',
      'Current consent version stored with full text',
      'Records inserted into feedback_consent_records table'
    ],
    expectedResult: 'Consent records created with complete audit trail'
  },
  {
    title: 'Access Granted to 360 Feedback',
    description: 'With required consents in place, employee can proceed.',
    substeps: [
      'ConsentGate re-evaluates and passes',
      'Employee sees their 360 feedback dashboard',
      'Privacy badge indicates consent status'
    ],
    expectedResult: 'Employee has full access to 360 feedback functionality'
  }
];

const withdrawalSteps: Step[] = [
  {
    title: 'Employee Initiates Withdrawal Request',
    description: 'Employee accesses consent management to withdraw previously granted consent.',
    substeps: [
      'Navigate to Settings → Privacy → My Consents',
      'Locate the specific consent to withdraw',
      'Click "Withdraw Consent" button'
    ],
    expectedResult: 'Withdrawal dialog opens with implications displayed'
  },
  {
    title: 'Review Withdrawal Implications',
    description: 'System displays the impact of withdrawing this consent.',
    substeps: [
      'Dialog shows what features will be disabled',
      'Warning if withdrawal affects cycle participation',
      'Option to provide withdrawal reason (optional)'
    ],
    expectedResult: 'Employee understands the consequences of withdrawal'
  },
  {
    title: 'Confirm Withdrawal',
    description: 'Employee confirms the withdrawal decision.',
    substeps: [
      'Employee types confirmation text or clicks confirm',
      'System validates the withdrawal request',
      'Audit log entry created for the action'
    ],
    expectedResult: 'Withdrawal request submitted for processing'
  },
  {
    title: 'System Processes Withdrawal',
    description: 'System updates consent records and applies business rules.',
    substeps: [
      'withdrawn_at timestamp set on consent record',
      'withdrawal_reason stored if provided',
      'Downstream systems notified (AI, signals, reports)',
      'Confirmation notification sent to employee'
    ],
    expectedResult: 'Consent withdrawn; affected features disabled for employee'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Consent dialog keeps appearing after submission',
    cause: 'Database insert failed or consent version mismatch',
    solution: 'Check browser console for errors. Verify feedback_consent_records table has the new record. Ensure consent_version matches current policy version.'
  },
  {
    issue: 'Employee cannot withdraw consent',
    cause: 'Cycle is in a locked state or withdrawal period has passed',
    solution: 'Check if cycle status allows modifications. Some cycles may lock consent after feedback collection begins. HR can process manual withdrawal if needed.'
  },
  {
    issue: 'Consent report shows missing records for some employees',
    cause: 'Employees enrolled but never accessed the cycle to trigger consent collection',
    solution: 'Generate list of employees without consent records. Send targeted reminder to complete consent process before cycle deadline.'
  },
  {
    issue: 'IP address not being captured in consent records',
    cause: 'Privacy settings or network configuration blocking IP capture',
    solution: 'IP capture is optional for GDPR compliance. If required by policy, ensure ConsentManagementPanel has access to request headers. Check edge function configuration.'
  }
];

export function GovernanceConsentWorkflows() {
  return (
    <section id="sec-4-4" data-manual-anchor="sec-4-4" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          4.4 Consent Collection Workflows
        </h3>
        <p className="text-muted-foreground mt-2">
          Implementing consent gates, processing withdrawals, and generating consent reports for regulatory compliance.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Navigation Paths</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Consent Collection:</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">My 360 Feedback</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">[Automatic ConsentGate]</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Consent Management:</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Settings</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Privacy</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">My Consents</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>HR Consent Reports:</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Performance</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">360 Feedback</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Governance</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Consent Records</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={consentCollectionSteps} 
        title="Consent Collection Process (Employee Journey)" 
      />

      <StepByStep 
        steps={withdrawalSteps} 
        title="Consent Withdrawal Process" 
      />

      {/* UI Component Reference */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">UI Component Reference</h4>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">ConsentGate</code>
                <span className="text-xs text-muted-foreground">Wrapper Component</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Wraps protected content and blocks access until required consents are in place.
                Automatically renders ConsentManagementPanel in "collect" mode when consent is missing.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">ConsentManagementPanel</code>
                <span className="text-xs text-muted-foreground">Form Component</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Displays consent options in two modes: "collect" for initial collection, "view" for 
                reviewing/modifying existing consents. Handles both grant and withdrawal workflows.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <Lightbulb className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Best Practices</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Send consent reminders 3-5 days before cycle feedback window opens</li>
            <li>Include direct link to consent page in reminder notifications</li>
            <li>Track consent completion rates and follow up with non-responders</li>
            <li>Archive consent text versions for audit purposes when updating policies</li>
          </ul>
        </AlertDescription>
      </Alert>

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Common Consent Workflow Issues" 
      />
    </section>
  );
}
