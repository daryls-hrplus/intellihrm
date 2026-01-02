import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, CheckCircle, MessageSquare, AlertTriangle, ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout, InfoCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const RESPONSE_STEPS = [
  {
    title: 'Review Manager Evaluation',
    description: 'Carefully read through your complete evaluation.',
    substeps: [
      'Access your completed evaluation in ESS',
      'Review each goal rating and comments',
      'Read competency assessments and feedback',
      'Note the overall rating and summary comments',
      'Compare manager ratings to your self-assessment'
    ],
    expectedResult: 'Full understanding of manager evaluation and feedback'
  },
  {
    title: 'Reflect Before Responding',
    description: 'Take time to process the feedback objectively.',
    substeps: [
      'Wait at least 24 hours before submitting response',
      'Consider feedback from the manager perspective',
      'Identify areas of agreement',
      'Note specific concerns with evidence'
    ],
    expectedResult: 'Thoughtful, objective perspective on the evaluation'
  },
  {
    title: 'Select Response Type',
    description: 'Choose the appropriate acknowledgment option.',
    substeps: [
      'Review the three response options available',
      '"Agree" - Accept evaluation as written',
      '"Partially Disagree" - Accept with specific comments',
      '"Disagree" - Formal disagreement triggering HR review'
    ],
    expectedResult: 'Appropriate response type selected'
  },
  {
    title: 'Document Response Comments',
    description: 'Provide constructive feedback on the evaluation.',
    substeps: [
      'Write specific, professional comments',
      'Reference concrete evidence for disagreements',
      'Acknowledge areas of agreement',
      'Suggest corrections if factual errors exist'
    ],
    expectedResult: 'Professional, evidence-based response documented'
  },
  {
    title: 'Submit Response',
    description: 'Finalize your acknowledgment.',
    substeps: [
      'Review your complete response',
      'Click "Submit Response"',
      'Confirm submission in dialog',
      'Note next steps if escalation was triggered'
    ],
    expectedResult: 'Response submitted and visible to manager/HR'
  }
];

const FIELDS = [
  { name: 'response_type', required: true, type: 'Enum', description: 'Employee acknowledgment status', validation: 'Agree, Partially Disagree, Disagree' },
  { name: 'response_comments', required: false, type: 'Text', description: 'Employee feedback on evaluation', validation: 'Required if Partially Disagree or Disagree' },
  { name: 'specific_disagreements', required: false, type: 'JSON', description: 'Itemized concerns by section', validation: 'Structured format for HR review' },
  { name: 'escalation_requested', required: false, type: 'Boolean', description: 'Formal HR review requested', defaultValue: 'Auto-set if Disagree' },
  { name: 'response_submitted_at', required: true, type: 'Timestamp', description: 'When response was finalized' },
  { name: 'response_deadline', required: true, type: 'Date', description: 'Due date for employee response' },
  { name: 'hr_review_status', required: false, type: 'Enum', description: 'Escalation review progress', validation: 'Pending, In Review, Resolved' }
];

const BUSINESS_RULES = [
  { rule: 'Response required within 5-10 business days', enforcement: 'Policy' as const, description: 'Employees must acknowledge evaluation within the response window.' },
  { rule: 'Disagree triggers mandatory HR review', enforcement: 'System' as const, description: 'Formal disagreements automatically escalate to HR for investigation.' },
  { rule: 'Comments required for disagreements', enforcement: 'System' as const, description: 'Cannot submit Partially Disagree or Disagree without explanation.' },
  { rule: 'Response is part of permanent record', enforcement: 'System' as const, description: 'Employee response attached to evaluation for audit and future reference.' },
  { rule: 'No response defaults to Agree', enforcement: 'Policy' as const, description: 'If deadline passes without response, evaluation is considered accepted.' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot access evaluation to respond', cause: 'Manager has not submitted evaluation or interview not completed.', solution: 'Check with manager on evaluation status. Response phase begins after manager submission.' },
  { issue: 'Response deadline too short', cause: 'Standard window may not account for leave or other circumstances.', solution: 'Contact HR to request deadline extension before it expires.' },
  { issue: 'Disagree option feels too extreme', cause: 'Concerned about relationship or career impact.', solution: 'Consider Partially Disagree for specific concerns. Focus on facts, not emotions. HR reviews ensure fair process.' },
  { issue: 'Factual error in evaluation', cause: 'Manager may have incorrect information about achievements or dates.', solution: 'Use Partially Disagree and document the correction with evidence. Factual corrections are usually resolved quickly.' }
];

export function WorkflowEmployeeResponse() {
  return (
    <Card id="sec-3-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.7</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-teal-600 text-white"><User className="h-3 w-3" />Employee</Badge>
        </div>
        <CardTitle className="text-2xl">Employee Response Phase</CardTitle>
        <CardDescription>Managing employee acknowledgment and handling disagreements (5-10 business days)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-7']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Review and understand your complete performance evaluation</li>
            <li>Choose the appropriate response type for your situation</li>
            <li>Document professional, evidence-based feedback</li>
            <li>Understand the escalation process for formal disagreements</li>
          </ul>
        </div>

        {/* Response Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Response Options
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500 bg-muted/50 rounded-l-none">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-foreground">Agree</h4>
                </div>
                <p className="text-sm text-foreground">Accept the evaluation as written. Optional comments for additional context.</p>
                <Badge variant="outline" className="mt-3 text-xs">No escalation</Badge>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500 bg-muted/50 rounded-l-none">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MinusCircle className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-foreground">Partially Disagree</h4>
                </div>
                <p className="text-sm text-foreground">Accept with specific concerns noted. Comments on particular sections or ratings.</p>
                <Badge variant="outline" className="mt-3 text-xs">Manager notified</Badge>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500 bg-muted/50 rounded-l-none">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-foreground">Disagree</h4>
                </div>
                <p className="text-sm text-foreground">Formal disagreement requiring detailed justification and HR review.</p>
                <Badge variant="outline" className="mt-3 text-xs">HR escalation</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        <InfoCallout title="Your Voice Matters">
          The response phase ensures employees have input in their performance record. Your acknowledgment and comments become part of the permanent evaluation file.
        </InfoCallout>

        <StepByStep steps={RESPONSE_STEPS} title="Response Process" />

        {/* Escalation Process */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Escalation Process (Disagree)
          </h3>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Automatic HR Notification', desc: 'HR receives alert of formal disagreement' },
              { step: 2, title: 'HR Review Initiated', desc: 'HR reviews evaluation, response, and supporting evidence' },
              { step: 3, title: 'Stakeholder Interviews', desc: 'HR may meet with employee, manager, and witnesses' },
              { step: 4, title: 'Resolution Decision', desc: 'HR determines if evaluation adjustment is warranted' },
              { step: 5, title: 'Final Documentation', desc: 'Resolution documented and attached to evaluation' }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-medium text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Professional Communication">
          Focus on facts and evidence, not emotions. "My Q3 results show 115% target achievement, but the rating reflects 95%" is more effective than "This rating is unfair."
        </TipCallout>

        <WarningCallout title="Consider Carefully Before Disagreeing">
          Formal disagreements are taken seriously and investigated thoroughly. Use this option for significant concerns with evidence, not minor rating differences.
        </WarningCallout>

        <NoteCallout title="No Retaliation Policy">
          Employees are protected from retaliation for honest feedback or formal disagreement. If you experience adverse treatment after responding, report to HR immediately.
        </NoteCallout>

        <FieldReferenceTable fields={FIELDS} title="Response Record Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
