import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  UserPlus, 
  Settings, 
  ChevronRight, 
  ArrowRight,
  UserMinus,
  GraduationCap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function TalentPoolMembers() {
  const memberFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'pool_id', required: true, type: 'UUID', description: 'Reference to parent talent pool', validation: 'Must be valid pool' },
    { name: 'employee_id', required: true, type: 'UUID', description: 'Reference to employee (profiles table)', validation: 'Must be active employee' },
    { name: 'added_by', required: true, type: 'UUID', description: 'User who added/nominated the member', validation: 'Valid user ID' },
    { name: 'reason', required: false, type: 'Text', description: 'Justification for pool membership', defaultValue: 'null' },
    { name: 'status', required: true, type: 'Text', description: 'Current membership status', defaultValue: 'active', validation: 'Valid status enum' },
    { name: 'start_date', required: false, type: 'Date', description: 'Date membership began', defaultValue: 'Current date' },
    { name: 'end_date', required: false, type: 'Date', description: 'Date membership ended (if applicable)', defaultValue: 'null' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Record last update timestamp', defaultValue: 'now()' }
  ];

  const addMemberSteps: Step[] = [
    {
      title: 'Select the Target Pool',
      description: 'Open the talent pool where you want to add a member.',
      substeps: [
        'Navigate to Performance → Succession → Talent Pools',
        'Click on the pool row to open the detail view',
        'Verify this is the correct pool for the employee'
      ],
      expectedResult: 'Pool detail view is displayed with the Members tab visible'
    },
    {
      title: 'Initiate Add Member',
      description: 'Open the add member dialog.',
      substeps: [
        'Click the "+ Add Member" button in the Members section',
        'The employee search dialog opens'
      ],
      expectedResult: 'Add member dialog is displayed with search field'
    },
    {
      title: 'Search and Select Employee',
      description: 'Find the employee to add to the pool.',
      substeps: [
        'Enter employee name or ID in the search field',
        'Review the search results',
        'Click on the employee to select them',
        'Verify the employee is not already in this pool'
      ],
      notes: [
        'Employees already in the pool will be marked',
        'Search includes terminated employees—ensure you select an active employee'
      ],
      expectedResult: 'Employee is selected and their profile summary is displayed'
    },
    {
      title: 'Provide Justification',
      description: 'Enter the reason for adding this employee to the pool.',
      substeps: [
        'Enter a clear justification in the Reason field',
        'Include relevant performance evidence or manager endorsement',
        'Optionally attach supporting documentation'
      ],
      notes: [
        'Justification is required for audit trail compliance',
        'Be specific about why this employee qualifies'
      ],
      expectedResult: 'Justification is entered'
    },
    {
      title: 'Complete Addition',
      description: 'Add the employee to the pool.',
      substeps: [
        'Review the employee selection and justification',
        'Click "Add to Pool" to confirm',
        'Member is added with status "active"'
      ],
      expectedResult: 'Employee appears in the members list with active status'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Unique membership', enforcement: 'System', description: 'An employee can only be in each pool once. Duplicate additions are prevented.' },
    { rule: 'Active employee only', enforcement: 'System', description: 'Only active employees can be added to talent pools.' },
    { rule: 'Maximum pool membership', enforcement: 'Advisory', description: 'Recommended maximum of 2-3 pools per employee to maintain development focus.' },
    { rule: 'End date on removal', enforcement: 'System', description: 'When removing a member, end_date is automatically set to current date.' },
    { rule: 'Status transition rules', enforcement: 'System', description: 'Status must follow valid transition path (nominated → active → graduated/removed).' },
    { rule: 'Justification required', enforcement: 'Policy', description: 'All membership changes should include justification for audit purposes.' }
  ];

  const memberStatuses = [
    { status: 'nominated', color: 'bg-blue-500', description: 'Manager has proposed the employee for pool membership', nextSteps: 'Awaiting HR review and approval' },
    { status: 'active', color: 'bg-green-500', description: 'Employee is an active member of the talent pool', nextSteps: 'Ongoing development and assessment' },
    { status: 'approved', color: 'bg-emerald-500', description: 'HR has approved the nomination (may auto-transition to active)', nextSteps: 'Member receives pool benefits' },
    { status: 'rejected', color: 'bg-red-500', description: 'Nomination was declined during review', nextSteps: 'Manager notified with feedback' },
    { status: 'graduated', color: 'bg-purple-500', description: 'Employee has advanced to succession candidate or promoted', nextSteps: 'Added to succession plan' },
    { status: 'removed', color: 'bg-gray-500', description: 'Employee has exited the pool (voluntary or involuntary)', nextSteps: 'Historical record retained' }
  ];

  return (
    <section id="sec-5-4" data-manual-anchor="sec-5-4" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.4 Member Management</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add, review, graduate, and remove talent pool members
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Add employees to talent pools with proper justification',
          'Understand and apply the member status lifecycle correctly',
          'Graduate high-performing members to succession plans',
          'Remove members appropriately with audit trail compliance'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Talent Pools</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">[Pool Name]</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Members</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            talent_pool_members Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={memberFields} />
        </CardContent>
      </Card>

      {/* Status Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Member Status Lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Members progress through defined status stages. Understanding these statuses 
            is essential for proper pool management.
          </p>
          
          {/* Status Flow Diagram */}
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg overflow-x-auto">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">1</span>
              </div>
              <span className="text-xs mt-1">Nominated</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs">2a</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">2b</span>
                </div>
              </div>
              <span className="text-xs mt-1">Approved / Rejected</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
              <span className="text-xs mt-1">Active</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-xs">4a</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white text-xs">4b</span>
                </div>
              </div>
              <span className="text-xs mt-1">Graduated / Removed</span>
            </div>
          </div>

          {/* Status Definitions */}
          <div className="space-y-2">
            {memberStatuses.map((item) => (
              <div key={item.status} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5 flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm font-mono">{item.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  <p className="text-xs text-primary mt-1">→ {item.nextSteps}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Member (HR Direct Add)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={addMemberSteps} title="" />
        </CardContent>
      </Card>

      {/* Graduate Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Graduate Member to Succession Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When a pool member is ready to become a succession candidate, graduate them 
            to link their development history to the succession plan.
          </p>
          <ol className="space-y-3 text-sm">
            {[
              'Open the member detail view from the pool members list',
              'Review the member\'s development progress and assessment history',
              'Click "Graduate to Succession" from the actions menu',
              'Select the target succession plan or key position',
              'Enter graduation notes summarizing readiness',
              'Confirm graduation—member status changes to "graduated"',
              'Member is added as a succession candidate with pool history'
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Remove Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserMinus className="h-5 w-5 text-amber-500" />
            Remove Member from Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-r-lg mb-4">
            <p className="text-sm text-foreground flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> Removing a member sets their status to "removed" and 
                records an end date. The membership record is retained for audit purposes and 
                cannot be deleted.
              </span>
            </p>
          </div>
          
          <ol className="space-y-3 text-sm">
            {[
              'Open the member detail view from the pool members list',
              'Click "Remove from Pool" from the actions menu',
              'Select the removal reason (e.g., "Left company", "No longer eligible", "Voluntary exit")',
              'Enter removal notes with justification',
              'Confirm removal—member status changes to "removed"',
              'End date is set to current date automatically'
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Member Management Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Review pool membership quarterly to ensure currency and relevance',
              'Document clear justification for all additions and removals',
              'Graduate members promptly when they meet succession criteria',
              'Use the "rejected" status with constructive feedback to support future nominations',
              'Monitor time-in-pool metrics to identify stagnation',
              'Coordinate with L&D on development activities for active members'
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
