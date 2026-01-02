import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout, Clock, Users, CheckCircle, Eye, MessageSquare, BarChart3, Settings, Move, Filter } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const NAVIGATION_STEPS = [
  {
    title: 'Open the Calibration Workspace',
    description: 'Launch the interactive calibration interface.',
    substeps: [
      'Navigate to Performance → Calibration → Sessions',
      'Find your scheduled session and click "Open Workspace"',
      'Wait for all participants to join (shown in attendee panel)',
      'Facilitator clicks "Start Session" when ready'
    ],
    expectedResult: 'Workspace loads with employee cards and distribution chart'
  },
  {
    title: 'Review Distribution Overview',
    description: 'Understand the current rating distribution before discussions.',
    substeps: [
      'View the distribution chart at the top of the workspace',
      'Compare against expected/target distribution (if configured)',
      'Note any significant deviations (e.g., 80% "Exceeds Expectations")',
      'Identify outliers for priority discussion'
    ],
    expectedResult: 'Understanding of current rating spread and discussion priorities'
  },
  {
    title: 'Navigate Employee Cards',
    description: 'Review individual employee ratings and evidence.',
    substeps: [
      'Cards are organized by manager or rating level (configurable)',
      'Click a card to expand full details',
      'Review goal achievement, competency scores, and manager comments',
      'Flag cards for discussion using the flag icon'
    ],
    expectedResult: 'Employees needing discussion are flagged'
  },
  {
    title: 'Propose Rating Adjustments',
    description: 'Suggest changes to ratings with justification.',
    substeps: [
      'Click "Adjust Rating" on an employee card',
      'Select proposed new rating',
      'Enter justification (required)',
      'Click "Propose" to submit for group review'
    ],
    expectedResult: 'Proposal appears in the session discussion queue'
  },
  {
    title: 'Document Decisions',
    description: 'Record final decisions and next steps.',
    substeps: [
      'Chair confirms final rating decision',
      'Facilitator documents decision rationale',
      'System captures all votes and comments',
      'Move to next employee or close session'
    ],
    expectedResult: 'Audit trail created for all decisions'
  }
];

const TROUBLESHOOTING = [
  { issue: 'Workspace not loading or very slow', cause: 'Large number of participants or slow network connection.', solution: 'Reduce participant scope for the session. Ensure stable internet. Try refreshing the page.' },
  { issue: 'Cannot see employee details', cause: 'Insufficient permissions or employee not in your scope.', solution: 'Contact facilitator to verify your role. Managers can only see their direct reports initially.' },
  { issue: 'Drag-and-drop not working', cause: 'Browser compatibility or role permissions.', solution: 'Use Chrome or Edge browser. Only Facilitators and Chairs can reorder discussion queues.' },
  { issue: 'Real-time updates not appearing', cause: 'WebSocket connection lost.', solution: 'Check the connection indicator (top right). Refresh the page to reconnect.' },
  { issue: 'Cannot submit adjustment proposal', cause: 'Justification not provided or character limit exceeded.', solution: 'Ensure justification is between 10-500 characters. Required field must be filled.' }
];

export function CalibrationWorkspaceGuide() {
  return (
    <Card id="sec-4-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.3</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />All Attendees</Badge>
        </div>
        <CardTitle className="text-2xl">Calibration Workspace Guide</CardTitle>
        <CardDescription>Navigating the interactive calibration interface for effective rating discussions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Calibration', 'Sessions', '[Session Name]', 'Workspace']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Navigate the calibration workspace interface</li>
            <li>Understand workspace panels and their functions</li>
            <li>Review employee ratings and supporting evidence</li>
            <li>Propose, discuss, and document rating adjustments</li>
          </ul>
        </div>

        {/* Workspace Layout */}
        <WorkflowDiagram 
          title="Calibration Workspace Layout"
          description="Overview of the main workspace areas and their interactions"
          diagram={`flowchart TB
    subgraph Header["📊 Header Bar"]
        H1[Session Info]
        H2[Timer]
        H3[Attendees]
        H4[Connection Status]
    end
    
    subgraph Main["🖥️ Main Workspace"]
        subgraph Left["Left Panel"]
            L1[Distribution Chart]
            L2[Filter Controls]
            L3[AI Insights]
        end
        
        subgraph Center["Center Panel"]
            C1[Employee Cards Grid]
            C2[Discussion Queue]
            C3[Active Discussion]
        end
        
        subgraph Right["Right Panel"]
            R1[Employee Details]
            R2[Evidence & Comments]
            R3[Adjustment Form]
        end
    end
    
    subgraph Footer["📝 Footer Bar"]
        F1[Session Notes]
        F2[Export/Actions]
        F3[Complete Session]
    end
    
    Header --> Main
    Main --> Footer`}
        />

        {/* Interface Components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interface Components</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: BarChart3, title: 'Distribution Chart', desc: 'Visual representation of current rating distribution. Compares actual vs. target distribution. Updates in real-time as adjustments are made.' },
              { icon: Filter, title: 'Filter Controls', desc: 'Filter employee cards by department, rating level, manager, or flagged status. Helps focus discussion on specific groups.' },
              { icon: Layout, title: 'Employee Cards', desc: 'Each card shows employee name, current rating, manager, and key metrics. Click to expand details. Drag to reorder discussion priority.' },
              { icon: MessageSquare, title: 'Discussion Queue', desc: 'List of employees flagged for discussion. Ordered by priority. Facilitator moves employees in/out of active discussion.' },
              { icon: Eye, title: 'Employee Details', desc: 'Full view of goals, competencies, manager comments, and AI insights. Evidence panel shows supporting documentation.' },
              { icon: Settings, title: 'Adjustment Form', desc: 'Propose rating changes with required justification. Submit for group vote or chair decision.' }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Card Anatomy */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Employee Card Anatomy</h3>
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">JD</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">Senior Analyst • Finance • Reports to: Mark Smith</p>
                  </div>
                  <Badge className="bg-green-600 text-white">Exceeds Expectations</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-background rounded border">
                    <p className="text-muted-foreground">Goals</p>
                    <p className="font-semibold">4.2 / 5.0</p>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <p className="text-muted-foreground">Competencies</p>
                    <p className="font-semibold">4.0 / 5.0</p>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <p className="text-muted-foreground">Overall</p>
                    <p className="font-semibold">4.1 / 5.0</p>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <p className="text-muted-foreground">AI Flag</p>
                    <p className="font-semibold text-amber-600">Potential Outlier</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">View Details</Badge>
                  <Badge variant="outline" className="text-xs">Flag for Discussion</Badge>
                  <Badge variant="outline" className="text-xs">Adjust Rating</Badge>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Employee cards provide at-a-glance information. Colors indicate rating levels. AI flags highlight employees 
            requiring attention. Click any card to see full evaluation details.
          </p>
        </div>

        <StepByStep steps={NAVIGATION_STEPS} title="Navigating the Workspace" />

        {/* Real-Time Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Real-Time Collaboration Features</h3>
          <div className="space-y-3">
            {[
              { feature: 'Live Cursors', description: 'See where other attendees are looking in the workspace. Facilitator\'s cursor is highlighted.' },
              { feature: 'Instant Updates', description: 'Rating changes and comments appear immediately for all attendees. No refresh needed.' },
              { feature: 'Voting Panel', description: 'When adjustment is proposed, attendees see a voting panel. Results display in real-time.' },
              { feature: 'Session Chat', description: 'Side chat for questions and clarifications without interrupting main discussion.' },
              { feature: 'Connection Status', description: 'Green indicator shows active connection. Yellow/Red indicates connectivity issues.' }
            ].map((item) => (
              <div key={item.feature} className="flex gap-3 p-3 border rounded-lg">
                <Move className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{item.feature}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Keyboard Shortcuts">
          Use keyboard shortcuts for faster navigation: <strong>Arrow keys</strong> to move between cards, 
          <strong>Enter</strong> to expand details, <strong>F</strong> to flag for discussion, <strong>Esc</strong> to close panels.
        </TipCallout>

        <WarningCallout title="Session Etiquette">
          Keep workspace focused on the current employee being discussed. Avoid browsing ahead or 
          making changes to employees not in active discussion—this causes confusion for other attendees.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
