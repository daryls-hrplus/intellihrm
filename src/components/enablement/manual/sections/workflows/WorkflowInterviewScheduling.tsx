import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, Users, Video, FileText, MessageSquare } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const SCHEDULING_STEPS = [
  {
    title: 'Complete Manager Evaluation First',
    description: 'Ensure evaluation is submitted before scheduling.',
    substeps: [
      'Verify all ratings and comments are complete',
      'Submit the manager evaluation',
      'Confirm submission was successful'
    ],
    expectedResult: 'Evaluation submitted and ready for discussion'
  },
  {
    title: 'Access Scheduling Tool',
    description: 'Open the interview scheduling interface.',
    substeps: [
      'Navigate to MSS → Team Appraisals',
      'Select the employee from pending interviews',
      'Click "Schedule Interview"'
    ],
    expectedResult: 'Scheduling calendar opens with available slots'
  },
  {
    title: 'Select Meeting Time',
    description: 'Choose a mutually available time slot.',
    substeps: [
      'Review calendar availability',
      'Select a 45-60 minute slot',
      'Consider employee preferences if known',
      'Allow buffer time before/after'
    ],
    expectedResult: 'Time slot selected for both parties'
  },
  {
    title: 'Configure Meeting Details',
    description: 'Set up the meeting format and location.',
    substeps: [
      'Choose meeting format (in-person/video)',
      'Add meeting location or video link',
      'Set reminder notifications',
      'Add optional notes for employee'
    ],
    expectedResult: 'Meeting details configured completely'
  },
  {
    title: 'Add Discussion Agenda',
    description: 'Prepare topics to cover during the interview.',
    substeps: [
      'Review performance highlights',
      'Identify key feedback points',
      'Prepare development discussion topics',
      'Add questions for employee input'
    ],
    expectedResult: 'Structured agenda attached to invitation'
  },
  {
    title: 'Send Invitation',
    description: 'Dispatch the calendar invitation.',
    substeps: [
      'Review all meeting details',
      'Click "Send Invitation"',
      'Verify employee receives notification',
      'Block time on your calendar'
    ],
    expectedResult: 'Employee receives calendar invitation with agenda'
  }
];

const FIELDS = [
  { name: 'interview_date', required: true, type: 'DateTime', description: 'Scheduled date and time', validation: 'Must be future date within cycle window' },
  { name: 'duration_minutes', required: true, type: 'Integer', description: 'Planned meeting length', defaultValue: '60', validation: 'Minimum 30 minutes' },
  { name: 'meeting_format', required: true, type: 'Enum', description: 'In-person or virtual', defaultValue: 'In-Person', validation: 'In-Person, Video, Phone' },
  { name: 'location', required: false, type: 'String', description: 'Meeting room or video link', validation: 'Required for in-person meetings' },
  { name: 'agenda_items', required: false, type: 'JSON', description: 'Discussion topics list' },
  { name: 'interview_status', required: true, type: 'Enum', description: 'Current scheduling state', defaultValue: 'Scheduled', validation: 'Scheduled, Completed, Rescheduled, Cancelled' },
  { name: 'interview_notes', required: false, type: 'Text', description: 'Manager notes from discussion' },
  { name: 'completed_at', required: false, type: 'Timestamp', description: 'When interview was marked complete' }
];

const BUSINESS_RULES = [
  { rule: 'Interview required before employee response', enforcement: 'Policy' as const, description: 'Employee acknowledgment window opens after interview completion (configurable).' },
  { rule: 'Manager must schedule within 2 weeks of evaluation', enforcement: 'Policy' as const, description: 'Prevents delays in feedback delivery.' },
  { rule: 'Minimum 45 minutes recommended', enforcement: 'Advisory' as const, description: 'Adequate time for meaningful discussion and development planning.' },
  { rule: 'Interview completion must be logged', enforcement: 'System' as const, description: 'Manager confirms interview occurred to progress workflow.' },
  { rule: 'Rescheduling allowed with notice', enforcement: 'Policy' as const, description: 'At least 24 hours notice required for rescheduling.' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot find scheduling option', cause: 'Evaluation not yet submitted or employee has not completed self-assessment.', solution: 'Complete and submit manager evaluation first. Verify workflow status in participant details.' },
  { issue: 'No available time slots showing', cause: 'Calendar integration may not be connected or both calendars fully booked.', solution: 'Manually enter a time or contact IT to verify calendar sync status.' },
  { issue: 'Employee declined invitation', cause: 'Time conflict or need for different format.', solution: 'Reach out to employee directly to find mutually agreeable time. Offer alternative formats.' },
  { issue: 'Need to postpone interview', cause: 'Unexpected conflicts or preparation needs.', solution: 'Use reschedule option with at least 24 hours notice. Communicate reason to employee.' }
];

export function WorkflowInterviewScheduling() {
  return (
    <Card id="sec-3-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.8</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~6 min read</Badge>
          <Badge className="gap-1 bg-green-600 text-white"><Users className="h-3 w-3" />Manager</Badge>
        </div>
        <CardTitle className="text-2xl">Appraisal Interview Scheduling</CardTitle>
        <CardDescription>Booking and preparing for performance discussion meetings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-8']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Schedule performance interviews efficiently</li>
            <li>Prepare a structured agenda for productive discussions</li>
            <li>Configure meeting formats for different scenarios</li>
            <li>Document interview completion for workflow progression</li>
          </ul>
        </div>

        {/* Interactive Workflow Diagram */}
        <WorkflowDiagram 
          title="Interview Scheduling Workflow"
          description="Flow for scheduling and preparing performance discussions"
          diagram={`flowchart LR
    subgraph Manager["👔 Manager Actions"]
        A[Complete Evaluation] --> B[Open Scheduler]
        B --> C[Select Time Slot]
        C --> D[Configure Meeting]
        D --> E[Add Agenda]
        E --> F[Send Invitation]
    end
    
    subgraph System["⚙️ System"]
        G[Check Availability]
        H[Create Calendar Event]
        I[Send Notifications]
    end
    
    subgraph Employee["👤 Employee"]
        J[Receive Invitation]
        K[Review Evaluation]
        L[Prepare Questions]
        M[Attend Interview]
    end
    
    C --> G
    F --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M`}
        />

        {/* Meeting Format Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Meeting Format Options</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { format: 'In-Person', icon: Users, desc: 'Face-to-face meeting in office or meeting room', best: 'Sensitive feedback, new employees' },
              { format: 'Video Call', icon: Video, desc: 'Virtual meeting via video conferencing', best: 'Remote employees, distributed teams' },
              { format: 'Hybrid', icon: MessageSquare, desc: 'Manager in-office, employee remote (or vice versa)', best: 'Flexible work arrangements' }
            ].map((item) => (
              <Card key={item.format} className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">{item.format}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2"><strong>Best for:</strong> {item.best}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <StepByStep steps={SCHEDULING_STEPS} title="Scheduling Process" />

        {/* Recommended Agenda */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Recommended Discussion Agenda
          </h3>
          <div className="space-y-2">
            {[
              { time: '0-5 min', topic: 'Opening & Context', desc: 'Set a positive tone, review purpose of discussion' },
              { time: '5-15 min', topic: 'Achievements Review', desc: 'Discuss highlights and successes from the period' },
              { time: '15-25 min', topic: 'Goal & Competency Ratings', desc: 'Walk through ratings with specific examples' },
              { time: '25-35 min', topic: 'Development Discussion', desc: 'Identify growth areas and career aspirations' },
              { time: '35-45 min', topic: 'Next Period Planning', desc: 'Preview upcoming goals and expectations' },
              { time: '45-50 min', topic: 'Employee Questions', desc: 'Address concerns and clarify any points' },
              { time: '50-55 min', topic: 'Action Items & Close', desc: 'Summarize decisions and next steps' }
            ].map((item) => (
              <div key={item.topic} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="text-xs min-w-[80px] h-fit">{item.time}</Badge>
                <div>
                  <h4 className="font-medium">{item.topic}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Pre-Interview Preparation">
          Share the evaluation with the employee at least 24 hours before the interview. This allows them to process feedback and prepare thoughtful questions, leading to more productive discussions.
        </TipCallout>

        <NoteCallout title="Documentation Requirement">
          After the interview, mark it as complete in the system. This triggers the employee response window and maintains accurate workflow tracking.
        </NoteCallout>

        <WarningCallout title="Avoid Surprises">
          The interview should not introduce any feedback not already in the written evaluation. Significant concerns should always be documented first.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Interview Record Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
