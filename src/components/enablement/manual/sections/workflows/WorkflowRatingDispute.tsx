import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, MessageSquare, Scale, Users, FileCheck, ShieldCheck } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  StepByStep, 
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  TipCallout,
  WarningCallout,
  ComplianceCallout
} from '../../components';

const ACKNOWLEDGMENT_STEPS = [
  {
    title: 'Rating Release by Manager/HR',
    description: 'Manager submits evaluation; HR releases ratings to employee',
    substeps: [
      'Manager completes all ratings and comments',
      'Manager clicks "Submit for Review" or "Release to Employee"',
      'If HR approval required, HR reviews and releases',
      'Employee receives notification of available ratings'
    ],
    expectedResult: 'Ratings visible to employee in their My Appraisals view'
  },
  {
    title: 'Employee Reviews Ratings',
    description: 'Employee accesses and reviews their appraisal ratings',
    substeps: [
      'Employee navigates to My Performance → Appraisals',
      'Opens the released appraisal to view ratings',
      'Reviews each section: Goals, Competencies, Values, Comments',
      'Views overall score and performance category'
    ],
    expectedResult: 'Employee has full visibility of their evaluation'
  },
  {
    title: 'Employee Acknowledgment',
    description: 'Employee formally acknowledges the appraisal',
    substeps: [
      'Click "Acknowledge & Respond" button',
      'Select response: Agree, Disagree, or Partially Agree',
      'Add optional comments explaining their perspective',
      'Submit acknowledgment within the configured window period'
    ],
    expectedResult: 'Acknowledgment recorded with timestamp'
  }
];

const DISPUTE_STEPS = [
  {
    title: 'Initiate Dispute',
    description: 'Employee submits a formal rating dispute',
    substeps: [
      'From the appraisal view, click "Dispute Rating"',
      'Select dispute category (see table below)',
      'Provide detailed justification for the dispute',
      'Attach supporting evidence if available'
    ],
    expectedResult: 'Dispute submitted and manager notified'
  },
  {
    title: 'Manager Rebuttal (Optional)',
    description: 'Manager reviews dispute and provides response',
    substeps: [
      'Manager receives dispute notification',
      'Reviews employee justification and evidence',
      'Can accept dispute and revise rating, or',
      'Submit rebuttal with supporting rationale'
    ],
    expectedResult: 'Manager response recorded'
  },
  {
    title: 'HR Resolution',
    description: 'HR reviews the dispute if not resolved by manager',
    substeps: [
      'HR Partner receives escalated dispute',
      'Reviews original rating, employee dispute, and manager rebuttal',
      'May request additional documentation',
      'Makes final determination: Uphold, Modify, or Overturn'
    ],
    expectedResult: 'Dispute resolved with documented decision'
  },
  {
    title: 'Finalization',
    description: 'Dispute outcome applied to appraisal',
    substeps: [
      'If rating modified, new score calculated',
      'All parties notified of resolution',
      'Full audit trail preserved',
      'Employee can acknowledge final outcome'
    ],
    expectedResult: 'Appraisal finalized with dispute resolution documented'
  }
];

const BUSINESS_RULES = [
  { rule: 'Dispute window is configurable', enforcement: 'System' as const, description: 'Default 10 business days from rating release. Configurable in cycle settings.' },
  { rule: 'Only one dispute per section allowed', enforcement: 'System' as const, description: 'Employee cannot re-dispute the same rating section after resolution.' },
  { rule: 'Disputes require justification', enforcement: 'System' as const, description: 'Minimum 50 characters of explanation required to submit dispute.' },
  { rule: 'HR resolution is final', enforcement: 'Policy' as const, description: 'After HR makes a final determination, the dispute is closed.' },
  { rule: 'All disputes logged for audit', enforcement: 'System' as const, description: 'Complete audit trail maintained for compliance and legal review.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Employee cannot see "Dispute Rating" button',
    cause: 'Dispute window has closed or disputes not enabled.',
    solution: 'Check cycle settings for dispute window configuration. Verify current date is within window from rating release date.'
  },
  {
    issue: 'Manager not receiving dispute notifications',
    cause: 'Notification settings misconfigured.',
    solution: 'Verify manager email is correct and dispute notifications are enabled in cycle notification settings.'
  },
  {
    issue: 'Dispute stuck in "Pending" status',
    cause: 'Awaiting manager or HR action.',
    solution: 'Check assignment. If manager has not responded within SLA, escalate to HR. HR can take action directly.'
  },
  {
    issue: 'Overall score not updated after dispute resolution',
    cause: 'Manual score recalculation may be required.',
    solution: 'After dispute resolution, verify score breakdown was recalculated. Contact support if score persists incorrectly.'
  }
];

const DISPUTE_CATEGORIES = [
  { category: 'Score Inaccuracy', description: 'Believes the numeric rating does not reflect actual performance' },
  { category: 'Missing Evidence', description: 'Key accomplishments or contributions were not considered' },
  { category: 'Bias Concern', description: 'Perceives unfair treatment based on protected characteristics' },
  { category: 'Process Violation', description: 'Proper evaluation procedures were not followed' },
  { category: 'Missing Context', description: 'Extenuating circumstances (leave, role change) not accounted for' },
  { category: 'Other', description: 'Issue does not fit above categories' }
];

export function WorkflowRatingDispute() {
  return (
    <Card id="sec-3-11">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.11</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~18 min read
          </Badge>
          <Badge className="gap-1 bg-purple-600 text-white">
            <Users className="h-3 w-3" />
            Employee / Manager / HR
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Scale className="h-6 w-6 text-purple-500" />
          Rating Dispute & Acknowledgment Workflow
        </CardTitle>
        <CardDescription>
          Complete workflow for rating release, employee acknowledgment, disputes, and HR resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Appraisals', 'Response & Disputes']} />

        <LearningObjectives
          objectives={[
            'Understand the rating release and acknowledgment process',
            'Learn how employees can dispute ratings they disagree with',
            'Master the manager rebuttal and HR resolution workflow',
            'Know dispute categories and resolution statuses'
          ]}
        />

        {/* Workflow Diagram */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-4">Rating Dispute Lifecycle</h4>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <FileCheck className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs">Release</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <p className="text-xs">Acknowledge</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded border border-amber-300 text-center min-w-[80px]">
              <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-amber-600" />
              <p className="text-xs">Dispute?</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <MessageSquare className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs">Rebuttal</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xs">HR Resolve</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 text-center min-w-[80px]">
              <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-xs">Finalized</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Part 1: Rating Acknowledgment</h3>
          <p className="text-muted-foreground mb-4">
            After managers submit evaluations and ratings are released, employees must acknowledge 
            their appraisal. This formal step ensures employees have reviewed their ratings and 
            provides an opportunity to respond.
          </p>
          <StepByStep steps={ACKNOWLEDGMENT_STEPS} title="Acknowledgment Process" />
        </div>

        <ScreenshotPlaceholder
          caption="Figure 3.11.1: Employee acknowledgment dialog with response options"
          alt="Appraisal acknowledgment dialog"
        />

        <div>
          <h3 className="text-lg font-semibold mb-4">Part 2: Rating Disputes</h3>
          <p className="text-muted-foreground mb-4">
            If an employee disagrees with their rating, they can submit a formal dispute within 
            the configured window period. Disputes follow a structured resolution process involving 
            the manager and HR.
          </p>
        </div>

        <div className="overflow-x-auto">
          <h4 className="font-medium mb-3">Dispute Categories</h4>
          <table className="w-full text-sm border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 border-b">Category</th>
                <th className="text-left p-3 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              {DISPUTE_CATEGORIES.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3 font-medium">{item.category}</td>
                  <td className="p-3 text-muted-foreground">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <StepByStep steps={DISPUTE_STEPS} title="Dispute Resolution Process" />

        <ScreenshotPlaceholder
          caption="Figure 3.11.2: Dispute submission form with category selection and evidence upload"
          alt="Rating dispute submission form"
        />

        <ScreenshotPlaceholder
          caption="Figure 3.11.3: HR dispute resolution panel with decision options"
          alt="HR dispute resolution interface"
        />

        <ComplianceCallout title="Legal Documentation">
          All disputes and resolutions are logged with full audit trails. This documentation 
          is essential for legal compliance and may be required during employment disputes 
          or regulatory audits. Ensure managers provide objective, documented rationale for 
          their ratings and rebuttals.
        </ComplianceCallout>

        <TipCallout title="Manager Best Practice">
          When receiving a dispute, approach it as a learning opportunity rather than defensively. 
          Review your original rating with fresh eyes and consider whether the employee's 
          perspective has merit. A thoughtful response builds trust even if the rating stands.
        </TipCallout>

        <WarningCallout title="Bias Concern Disputes">
          Disputes citing bias concerns require immediate HR attention. These should be prioritized 
          and may trigger involvement of Compliance or Legal teams depending on organizational policy.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
