import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, CheckCircle, Target, FileText, Upload, Bell } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout, InfoCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const SELF_ASSESSMENT_STEPS = [
  {
    title: 'Access Your Appraisal',
    description: 'Navigate to your active performance review.',
    substeps: [
      'Go to ESS → My Performance',
      'Click on the active appraisal cycle',
      'Review the cycle timeline and deadlines'
    ],
    expectedResult: 'Self-assessment form opens with your assigned goals and competencies'
  },
  {
    title: 'Review Your Goals',
    description: 'Familiarize yourself with assigned goals before rating.',
    substeps: [
      'Read each goal description carefully',
      'Review the success criteria and metrics',
      'Gather evidence of your achievements',
      'Note any challenges or blockers encountered'
    ],
    expectedResult: 'Clear understanding of each goal and available evidence'
  },
  {
    title: 'Rate Your Goals',
    description: 'Provide honest self-ratings with supporting evidence.',
    substeps: [
      'Select a rating for each goal',
      'Add specific examples of achievements',
      'Document metrics and outcomes where possible',
      'Explain any partial completion circumstances'
    ],
    expectedResult: 'All goals rated with evidence-based comments'
  },
  {
    title: 'Assess Your Competencies',
    description: 'Evaluate your behavioral competencies honestly.',
    substeps: [
      'Review each competency and its behavioral indicators',
      'Reflect on situations where you demonstrated the competency',
      'Select your proficiency level',
      'Provide specific behavioral examples'
    ],
    expectedResult: 'All competencies self-assessed with examples'
  },
  {
    title: 'Upload Supporting Evidence',
    description: 'Attach documents that support your self-assessment.',
    substeps: [
      'Click "Add Evidence" for relevant goals',
      'Upload documents, screenshots, or reports',
      'Add descriptions for each attachment',
      'Verify files uploaded successfully'
    ],
    expectedResult: 'Relevant evidence attached to appropriate sections'
  },
  {
    title: 'Write Overall Self-Reflection',
    description: 'Summarize your performance and development needs.',
    substeps: [
      'Reflect on your overall performance this period',
      'Highlight your top 3 achievements',
      'Identify 2-3 areas for development',
      'Share career aspirations if applicable'
    ],
    expectedResult: 'Thoughtful self-reflection completed'
  },
  {
    title: 'Review and Submit',
    description: 'Final review before submitting to your manager.',
    substeps: [
      'Review all ratings and comments',
      'Check for any incomplete sections',
      'Click "Submit Self-Assessment"',
      'Confirm submission in dialog'
    ],
    expectedResult: 'Self-assessment submitted and manager notified'
  }
];

const FIELDS = [
  { name: 'self_goal_ratings', required: true, type: 'JSON', description: 'Your ratings for each assigned goal', validation: 'All goals must be rated' },
  { name: 'self_competency_ratings', required: true, type: 'JSON', description: 'Your competency self-assessments', validation: 'All competencies must be rated' },
  { name: 'self_comments', required: true, type: 'Text', description: 'Overall self-reflection', validation: 'Minimum 50 characters' },
  { name: 'evidence_attachments', required: false, type: 'JSON', description: 'Uploaded supporting documents', validation: 'Max 10 files, 5MB each' },
  { name: 'self_assessment_status', required: true, type: 'Enum', description: 'Completion state', defaultValue: 'Not Started', validation: 'Not Started, In Progress, Submitted' },
  { name: 'submitted_at', required: false, type: 'Timestamp', description: 'When self-assessment was submitted' },
  { name: 'deadline', required: true, type: 'Date', description: 'Due date for self-assessment submission' }
];

const BUSINESS_RULES = [
  { rule: 'Self-assessment required before manager evaluation', enforcement: 'System' as const, description: 'Manager evaluation form is locked until employee submits self-assessment.' },
  { rule: 'All assigned components must be rated', enforcement: 'System' as const, description: 'Cannot submit with missing ratings for goals or competencies.' },
  { rule: 'Submission deadline enforced', enforcement: 'System' as const, description: 'Self-assessment cannot be submitted after deadline. Contact HR for extensions.' },
  { rule: 'Self-ratings visible to manager', enforcement: 'Advisory' as const, description: 'Be honest—managers see your self-ratings alongside their own assessment.' },
  { rule: 'Evidence encouraged but not required', enforcement: 'Advisory' as const, description: 'Supporting documents strengthen your case but are optional unless specified.' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot find my appraisal', cause: 'You may not be enrolled in the current cycle or enrollment is pending.', solution: 'Contact HR to verify your enrollment status. Check if you meet eligibility criteria.' },
  { issue: 'Goal appears locked or read-only', cause: 'Goal may be from a locked period or requires manager action first.', solution: 'Check goal status indicators. Some goals may need manager to confirm assignment first.' },
  { issue: 'File upload failing', cause: 'File too large, unsupported format, or network issues.', solution: 'Ensure file is under 5MB and in supported format (PDF, DOC, DOCX, PNG, JPG). Try again with stable connection.' },
  { issue: 'Missed submission deadline', cause: 'Self-assessment window has closed.', solution: 'Contact HR immediately. They can grant deadline extension if justified.' }
];

export function WorkflowSelfAssessment() {
  return (
    <Card id="sec-3-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.4</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-teal-600 text-white"><User className="h-3 w-3" />Employee</Badge>
        </div>
        <CardTitle className="text-2xl">Self-Assessment Process</CardTitle>
        <CardDescription>Employee guide to completing self-evaluation and submitting evidence</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-4']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Complete a thorough and honest self-assessment</li>
            <li>Rate goals and competencies with supporting evidence</li>
            <li>Upload relevant documentation to strengthen your case</li>
            <li>Submit self-assessment before the deadline</li>
          </ul>
        </div>

        {/* Interactive Workflow Diagram */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Self-Assessment Workflow</h3>
          <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
            <pre className="text-xs text-muted-foreground mb-2">Participant Flow Diagram</pre>
            <div className="mermaid-container">
              <presentation-mermaid>
                {`flowchart TD
    subgraph System["⚙️ System"]
        A[Cycle Launches] --> B[Send Notification]
        J[Validate Submission]
        K[Unlock Manager Form]
    end
    
    subgraph Employee["👤 Employee Actions"]
        C[Access Appraisal] --> D[Review Goals]
        D --> E[Rate Goals with Evidence]
        E --> F[Assess Competencies]
        F --> G[Upload Evidence]
        G --> H[Write Self-Reflection]
        H --> I{Ready to Submit?}
        I -->|No| D
        I -->|Yes| L[Submit Self-Assessment]
    end
    
    subgraph Manager["👔 Manager"]
        M[Begin Evaluation]
    end
    
    B --> C
    L --> J
    J --> K
    K --> M`}
              </presentation-mermaid>
            </div>
          </div>
        </div>

        {/* Timeline Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            Typical Timeline
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { phase: 'Notification', days: 'Day 1', color: 'bg-blue-600' },
              { phase: 'Self-Assessment Window', days: 'Days 1-14', color: 'bg-green-600' },
              { phase: 'Reminder', days: 'Day 10', color: 'bg-amber-600' },
              { phase: 'Deadline', days: 'Day 14', color: 'bg-red-600' }
            ].map((item) => (
              <Badge key={item.phase} className={`${item.color} text-white py-1 px-3`}>
                {item.phase}: {item.days}
              </Badge>
            ))}
          </div>
        </div>

        <InfoCallout title="Why Self-Assessment Matters">
          Self-assessment gives you a voice in your performance review. Your manager will see your self-ratings alongside their evaluation, creating a foundation for productive discussion.
        </InfoCallout>

        {/* Self-Assessment Components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What You Will Assess</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { component: 'Goals', icon: Target, desc: 'Rate achievement of your assigned objectives', weight: 'Typically 40%' },
              { component: 'Competencies', icon: CheckCircle, desc: 'Assess your behavioral capabilities', weight: 'Typically 30%' },
              { component: 'Responsibilities', icon: FileText, desc: 'Evaluate your KRA performance', weight: 'Typically 30%' }
            ].map((item) => (
              <Card key={item.component} className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">{item.component}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{item.weight}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <StepByStep steps={SELF_ASSESSMENT_STEPS} title="Self-Assessment Steps" />

        {/* Evidence Guidelines */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Evidence Guidelines
          </h3>
          <div className="space-y-3">
            {[
              { type: 'Metrics & Reports', examples: 'Sales figures, project completion reports, KPI dashboards', format: 'PDF, Excel' },
              { type: 'Recognition', examples: 'Customer feedback, peer kudos, awards received', format: 'Email screenshots, certificates' },
              { type: 'Project Deliverables', examples: 'Presentations, designs, code reviews, documentation', format: 'PDF, images' },
              { type: 'Training & Development', examples: 'Course completions, certifications, learning records', format: 'Certificates, transcripts' }
            ].map((item) => (
              <div key={item.type} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.type}</h4>
                  <p className="text-sm text-muted-foreground">{item.examples}</p>
                </div>
                <Badge variant="outline" className="text-xs h-fit">{item.format}</Badge>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Be Specific and Honest">
          Vague self-assessments like "I did well" are less effective than specific statements like "Exceeded Q3 target by 15%, acquiring 12 new accounts." Honesty builds trust with your manager.
        </TipCallout>

        <WarningCallout title="Deadline Reminder">
          Your manager cannot begin their evaluation until you submit. Late self-assessments delay the entire review process and may affect your final rating.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Self-Assessment Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
