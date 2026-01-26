import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  UserPlus, 
  Settings, 
  ChevronRight, 
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell
} from 'lucide-react';

export function TalentPoolNomination() {
  const nominationSteps: Step[] = [
    {
      title: 'Navigate to Talent Pool Nomination',
      description: 'Access the nomination feature from the Manager Self-Service portal.',
      substeps: [
        'Log in as a manager with direct reports',
        'Go to Manager Self-Service → Talent Pool Nomination',
        'Alternatively, access from MSS → My Team → Actions → Nominate for Talent Pool'
      ],
      expectedResult: 'You see your direct reports listed with their current nomination status'
    },
    {
      title: 'Review Team Member List',
      description: 'Understand your team\'s current talent pool status.',
      substeps: [
        'Review the summary cards showing Total team members, Already Nominated, and Approved',
        'Use the search field to find specific team members',
        'Filter by department or job family if applicable',
        'Review existing pool memberships for each team member'
      ],
      notes: [
        'Employees already nominated will show "Pending" status',
        'Approved employees show their current pool membership'
      ],
      expectedResult: 'You can see which team members are eligible for nomination'
    },
    {
      title: 'Select Employee to Nominate',
      description: 'Choose an eligible team member for talent pool nomination.',
      substeps: [
        'Click the "Nominate" button next to the eligible employee',
        'The nomination dialog opens with employee details pre-populated'
      ],
      expectedResult: 'Nomination dialog opens with employee information displayed'
    },
    {
      title: 'Select Target Talent Pool',
      description: 'Choose which pool to nominate the employee for.',
      substeps: [
        'Review the available talent pools in the dropdown',
        'Select the most appropriate pool based on employee capabilities',
        'Read the pool description and criteria to verify fit'
      ],
      notes: [
        'Only active pools are available for nomination',
        'Pool criteria are shown to help validate eligibility'
      ],
      expectedResult: 'Target pool is selected and criteria are visible'
    },
    {
      title: 'Provide Nomination Justification',
      description: 'Document why this employee should be added to the pool.',
      substeps: [
        'Enter a clear, evidence-based justification (required)',
        'Reference specific accomplishments, skills, or assessments',
        'Include performance highlights or Nine-Box position',
        'Mention any leadership behaviors or high-potential indicators'
      ],
      notes: [
        'Justification should be 2-4 sentences minimum',
        'HR will review this justification during approval'
      ],
      expectedResult: 'Justification field is populated with supporting evidence'
    },
    {
      title: 'Add Recommended Development (Optional)',
      description: 'Suggest development activities for the nominee.',
      substeps: [
        'Expand the "Recommended Development" section',
        'Add suggested learning activities, stretch assignments, or mentors',
        'Include any skill gaps that should be addressed'
      ],
      expectedResult: 'Development recommendations are captured (optional)'
    },
    {
      title: 'Submit Nomination',
      description: 'Complete the nomination process.',
      substeps: [
        'Review all entered information',
        'Click "Submit Nomination" to send for HR review',
        'Nomination is created with status "nominated"'
      ],
      expectedResult: 'Success message confirms nomination. Employee now shows "Pending" status in your list. HR receives notification for review.'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Direct report only', enforcement: 'System', description: 'Managers can only nominate their direct reports. Cross-team nominations require HR action.' },
    { rule: 'One nomination per pool', enforcement: 'System', description: 'An employee cannot be nominated for the same pool twice while a pending nomination exists.' },
    { rule: 'Active employee', enforcement: 'System', description: 'Only active employees (not terminated or on extended leave) can be nominated.' },
    { rule: 'Justification required', enforcement: 'System', description: 'All nominations must include justification text. Blank justifications are rejected.' },
    { rule: 'Pool eligibility', enforcement: 'Advisory', description: 'Nomination should align with pool criteria. HR may reject nominations that don\'t meet criteria.' },
    { rule: 'Notification trigger', enforcement: 'System', description: 'Submitting a nomination automatically notifies HR Partners for review.' }
  ];

  return (
    <section id="sec-5-5" data-manual-anchor="sec-5-5" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.5 Manager Nomination Workflow</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manager-driven talent pool nomination through MSS
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Navigate the MSS Talent Pool Nomination interface as a manager',
          'Submit talent pool nominations with proper justification and evidence',
          'Understand the nomination-to-approval workflow and timelines',
          'Track nomination status and respond to HR feedback'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Manager Self-Service</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Talent Pool Nomination</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <Settings className="h-4 w-4 text-primary opacity-50" />
            <span className="font-medium text-muted-foreground">Alternative:</span>
            <Badge variant="outline">MSS</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">My Team</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Actions</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Nominate for Talent Pool</Badge>
          </div>
        </CardContent>
      </Card>

      {/* UI Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            MSS Nomination Page Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Manager Nomination page provides a consolidated view of direct reports 
            with their talent pool status and nomination actions.
          </p>
          
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Total Team Members</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-xs text-muted-foreground">Nominated (Pending)</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-xs text-muted-foreground">In Talent Pools</div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Team Member List Features</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Employee name, job title, and department</li>
              <li>• Current talent pool membership badges</li>
              <li>• Nomination status indicators (Eligible, Pending, Approved)</li>
              <li>• Nine-Box position if available</li>
              <li>• "Nominate" action button for eligible employees</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Nominate Team Member for Talent Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={nominationSteps} title="" />
        </CardContent>
      </Card>

      {/* Justification Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Effective Justification Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Strong nominations include specific evidence and clear rationale. 
            Compare these examples:
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-sm text-red-800 dark:text-red-300">Weak</span>
              </div>
              <p className="text-xs italic">"Sarah is a great employee and should be in the high potential pool."</p>
              <p className="text-xs text-muted-foreground mt-2">❌ No specific evidence, vague reasoning</p>
            </div>
            
            <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-sm text-green-800 dark:text-green-300">Strong</span>
              </div>
              <p className="text-xs italic">"Sarah has exceeded targets for 3 consecutive quarters, placed in Nine-Box quadrant 2 (High Potential), and successfully led the Q3 product launch. Her learning agility score of 4.2 and proactive mentorship of junior team members demonstrate readiness for accelerated development."</p>
              <p className="text-xs text-muted-foreground mt-2">✓ Specific metrics, evidence-based, clear fit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notification & Status Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h5 className="font-medium text-sm">Nomination Submitted</h5>
                <p className="text-xs text-muted-foreground">
                  HR Partners receive notification with nomination details. 
                  Employee shows "Pending" in your team list.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h5 className="font-medium text-sm">HR Review in Progress</h5>
                <p className="text-xs text-muted-foreground">
                  HR reviews nomination against pool criteria, validates evidence, 
                  and may request additional information.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h5 className="font-medium text-sm">Decision Notification</h5>
                <p className="text-xs text-muted-foreground">
                  Manager receives notification of approval or rejection. 
                  Rejection includes feedback for future nominations.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Typical SLA:</strong> HR review is typically completed within 5 business days. 
                Urgent nominations can be escalated through the HR Hub.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Manager Nomination Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Nominate employees after they have demonstrated consistent high performance (2+ review cycles)',
              'Include specific metrics and accomplishments in your justification',
              'Reference Nine-Box position and talent signals when available',
              'Discuss career aspirations with the employee before nominating',
              'Coordinate with HR Partner if unsure about the appropriate pool',
              'Follow up promptly if HR requests additional information'
            ].map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
