import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  FileText, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  Plus,
  Calendar,
  Target,
  AlertTriangle,
  Edit
} from 'lucide-react';

export function SuccessionPlanCreation() {
  const successionPlanFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'position_id', required: true, type: 'UUID', description: 'Reference to key position (job)', validation: 'Must be key position' },
    { name: 'plan_name', required: true, type: 'Text', description: 'Succession plan name', validation: 'Required, max 200 chars' },
    { name: 'plan_name_en', required: false, type: 'Text', description: 'English translation of plan name' },
    { name: 'description', required: false, type: 'Text', description: 'Plan description and objectives' },
    { name: 'description_en', required: false, type: 'Text', description: 'English translation of description' },
    { name: 'risk_level', required: true, type: 'Text', description: 'Overall succession risk level', defaultValue: 'medium', validation: 'low, medium, high' },
    { name: 'priority', required: true, type: 'Text', description: 'Plan priority for resource allocation', defaultValue: 'medium', validation: 'low, medium, high, critical' },
    { name: 'status', required: true, type: 'Text', description: 'Current plan status', defaultValue: 'active', validation: 'active, inactive, closed' },
    { name: 'target_date', required: false, type: 'Date', description: 'Target date for having a ready successor' },
    { name: 'notes', required: false, type: 'Text', description: 'Additional planning notes' },
    { name: 'notes_en', required: false, type: 'Text', description: 'English translation of notes' },
    { name: 'position_criticality', required: false, type: 'Text', description: 'Inherited or overridden criticality from position risk', validation: 'low, medium, high, critical' },
    { name: 'replacement_difficulty', required: false, type: 'Text', description: 'How difficult to fill externally', validation: 'easy, moderate, difficult, very_difficult' },
    { name: 'calculated_risk_level', required: false, type: 'Text', description: 'System-calculated risk based on coverage and readiness' },
    { name: 'availability_reason_id', required: false, type: 'UUID', description: 'Reference to availability reason if vacancy expected' },
    { name: 'is_active', required: true, type: 'Boolean', description: 'Whether plan is currently active', defaultValue: 'true' },
    { name: 'start_date', required: false, type: 'Date', description: 'When plan was activated' },
    { name: 'end_date', required: false, type: 'Date', description: 'When plan was closed or completed' },
    { name: 'created_by', required: false, type: 'UUID', description: 'User who created the plan' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const createPlanSteps: Step[] = [
    {
      title: 'Navigate to Succession Plans',
      description: 'Access the succession plan management interface.',
      substeps: [
        'Go to Performance → Succession → Succession Plans',
        'Select your company from the company filter',
        'Click "Create Succession Plan" or the + button'
      ],
      expectedResult: 'Succession plan creation form is displayed'
    },
    {
      title: 'Select Target Position',
      description: 'Choose the key position for this succession plan.',
      substeps: [
        'Click "Select Position" to open the position selector',
        'Only positions marked as key positions are available',
        'Search or filter to find the target position',
        'Click to select the position'
      ],
      notes: [
        'Each key position can have only one active succession plan',
        'If a plan exists, you will be prompted to edit or close it first'
      ],
      expectedResult: 'Target position is selected and displayed'
    },
    {
      title: 'Enter Plan Details',
      description: 'Configure the succession plan parameters.',
      substeps: [
        'Enter a descriptive Plan Name (e.g., "CFO Succession Plan 2024")',
        'Add a Description explaining the plan objectives',
        'Set Priority level: Low, Medium, High, or Critical',
        'Set initial Risk Level: Low, Medium, or High'
      ],
      expectedResult: 'Plan details are entered'
    },
    {
      title: 'Set Target Date',
      description: 'Define when a ready successor should be available.',
      substeps: [
        'Consider incumbent retirement or departure timeline',
        'Set Target Date for succession readiness',
        'This date drives development planning urgency'
      ],
      notes: [
        'Target date should align with anticipated vacancy',
        'Adjust based on candidate development timelines'
      ],
      expectedResult: 'Target date is set for succession readiness'
    },
    {
      title: 'Configure Additional Settings',
      description: 'Complete optional configuration fields.',
      substeps: [
        'Set Replacement Difficulty: Easy, Moderate, Difficult, Very Difficult',
        'Optionally override Position Criticality from risk assessment',
        'Select Availability Reason if vacancy is anticipated',
        'Add any relevant Notes for planners'
      ],
      expectedResult: 'All relevant settings are configured'
    },
    {
      title: 'Save and Activate Plan',
      description: 'Save the succession plan and make it active.',
      substeps: [
        'Review all entered information',
        'Click "Create Plan" or "Save"',
        'Plan is created with status "Active"',
        'You are redirected to the plan detail page'
      ],
      expectedResult: 'Succession plan is created and active. Ready for candidate nomination.'
    }
  ];

  const priorityDefinitions = [
    { level: 'Critical', color: 'bg-red-500', description: 'Immediate succession risk. Must have ready successor. Executive attention required.' },
    { level: 'High', color: 'bg-orange-500', description: 'Significant succession risk. Priority development and monitoring needed.' },
    { level: 'Medium', color: 'bg-amber-500', description: 'Moderate succession risk. Standard succession planning timeline.' },
    { level: 'Low', color: 'bg-green-500', description: 'Manageable succession risk. Can be addressed in normal planning cycle.' }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Key position required', enforcement: 'System', description: 'Succession plans can only be created for positions marked as key positions.' },
    { rule: 'One active plan per position', enforcement: 'System', description: 'Each key position can have at most one active succession plan at a time.' },
    { rule: 'Plan name required', enforcement: 'System', description: 'Plan must have a name for identification and reporting.' },
    { rule: 'Status transitions', enforcement: 'System', description: 'Plan can transition: active → inactive → closed. Cannot reactivate closed plans.' },
    { rule: 'Risk auto-calculation', enforcement: 'System', description: 'calculated_risk_level is updated automatically based on candidate coverage and readiness.' },
    { rule: 'Audit logging', enforcement: 'System', description: 'All plan changes are logged with timestamp and user for compliance.' },
    { rule: 'HR role required', enforcement: 'System', description: 'Only HR Partner or Admin roles can create or modify succession plans.' }
  ];

  return (
    <section id="sec-6-4" data-manual-anchor="sec-6-4" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.4 Succession Plan Creation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create and configure succession plans for key positions
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Create a succession plan for a key position',
          'Configure plan priority, risk level, and target dates',
          'Understand the relationship between position risk and plan priority',
          'Manage plan lifecycle from creation through closure'
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
            <Badge variant="secondary">Succession Plans</Badge>
          </div>
        </CardContent>
      </Card>

      {/* What is a Succession Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            What is a Succession Plan?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A succession plan is a documented strategy for ensuring continuity in a key position. 
            It identifies potential successors, tracks their development progress, and prepares 
            them to assume the role when needed.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-sm mb-1">Target Position</h4>
              <p className="text-xs text-muted-foreground">
                The key position requiring succession coverage
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-sm mb-1">Timeline</h4>
              <p className="text-xs text-muted-foreground">
                Target date for having a ready successor
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <AlertTriangle className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-sm mb-1">Risk Level</h4>
              <p className="text-xs text-muted-foreground">
                Current succession coverage risk status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Plan Priority Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Priority level determines resource allocation and attention for the succession plan.
          </p>

          <div className="space-y-3">
            {priorityDefinitions.map((level) => (
              <div key={level.level} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${level.color} flex-shrink-0 mt-1`} />
                <div>
                  <h5 className="font-medium text-sm">{level.level}</h5>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            succession_plans Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={successionPlanFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-primary" />
            Create Succession Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={createPlanSteps} title="" />
        </CardContent>
      </Card>

      {/* UI Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Edit className="h-5 w-5 text-primary" />
            Succession Plan Card UI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each succession plan is displayed as a card with key information and actions.
          </p>

          {/* Simulated Plan Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-sm">Chief Financial Officer Succession Plan</h5>
                  <p className="text-xs text-muted-foreground">Position: CFO • Department: Finance</p>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="p-4 grid gap-4 md:grid-cols-4">
              <div>
                <span className="text-xs text-muted-foreground">Priority</span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">High</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Risk Level</span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Medium</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Target Date</span>
                <span className="text-sm font-medium block mt-1">Dec 2025</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Candidates</span>
                <span className="text-sm font-medium block mt-1">3 (1 Ready Now)</span>
              </div>
            </div>
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
            Succession Plan Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Create plans for all key positions, even if candidates are not yet identified',
              'Set realistic target dates based on candidate development timelines',
              'Align plan priority with position criticality and vacancy risk',
              'Review and update plans quarterly or when significant changes occur',
              'Document plan rationale and decisions for audit and handoff',
              'Coordinate with hiring plans if external successors may be needed'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Industry Benchmark:</strong> Best practice organizations maintain succession 
              plans for 100% of key positions, with an average of 2-3 candidates per plan. The 
              target is to have at least one "Ready Now" or "Ready in 1 Year" candidate for each 
              critical position (SHRM Succession Planning Report 2024).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
