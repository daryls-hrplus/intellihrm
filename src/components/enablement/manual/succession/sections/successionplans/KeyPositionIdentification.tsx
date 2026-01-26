import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  Key, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  AlertTriangle,
  Building,
  Briefcase,
  Star,
  Filter
} from 'lucide-react';

export function KeyPositionIdentification() {
  const jobKeyPositionFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key for job record', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'title', required: true, type: 'Text', description: 'Job title', validation: 'Required, max 200 chars' },
    { name: 'job_code', required: false, type: 'Text', description: 'Unique job identifier code', validation: 'Unique within company' },
    { name: 'is_key_position', required: true, type: 'Boolean', description: 'Flag indicating position is key/critical for succession', defaultValue: 'false' },
    { name: 'job_family_id', required: false, type: 'UUID', description: 'Reference to job family grouping' },
    { name: 'level', required: false, type: 'Integer', description: 'Job level/grade in hierarchy' },
    { name: 'is_active', required: true, type: 'Boolean', description: 'Whether job is currently active', defaultValue: 'true' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const markKeyPositionSteps: Step[] = [
    {
      title: 'Navigate to Key Positions Tab',
      description: 'Access the key positions management interface.',
      substeps: [
        'Go to Performance → Succession → Key Positions',
        'Select your company from the company filter',
        'The Key Positions tab displays all jobs with is_key_position status'
      ],
      expectedResult: 'Key Positions page is displayed with list of positions'
    },
    {
      title: 'Review Job Positions',
      description: 'Evaluate positions for key position designation.',
      substeps: [
        'Review the list of all active job positions',
        'Use filters to narrow by department, job family, or level',
        'Identify positions that meet key position criteria'
      ],
      notes: [
        'Typically 10-15% of positions qualify as key positions',
        'Focus on positions critical to business operations or strategy'
      ],
      expectedResult: 'Candidate positions for key designation are identified'
    },
    {
      title: 'Mark Position as Key',
      description: 'Toggle the key position flag for selected positions.',
      substeps: [
        'Locate the position in the list',
        'Click the "Key Position" toggle or checkbox',
        'Confirm the action when prompted',
        'The position is now flagged as a key position'
      ],
      expectedResult: 'Position is marked as key and appears in key positions list'
    },
    {
      title: 'Document Key Position Rationale',
      description: 'Capture the business justification for key position status.',
      substeps: [
        'Click on the key position to open details',
        'Navigate to the Risk Assessment section',
        'Enter criticality level and impact description',
        'Save the risk assessment information'
      ],
      notes: [
        'Documentation supports audit requirements',
        'Helps stakeholders understand position importance'
      ],
      expectedResult: 'Key position has documented rationale and risk assessment'
    },
    {
      title: 'Review Key Position Summary',
      description: 'Verify key position designation across the organization.',
      substeps: [
        'Return to the Key Positions list',
        'Filter to show only key positions',
        'Review the distribution across departments and levels',
        'Identify any gaps in key position coverage'
      ],
      expectedResult: 'Complete view of key positions across the organization'
    }
  ];

  const keyPositionCriteria = [
    { criterion: 'Strategic Impact', description: 'Position directly influences organizational strategy, revenue, or competitive advantage', weight: 'High' },
    { criterion: 'Replacement Difficulty', description: 'Specialized skills, long learning curve, or scarce talent market', weight: 'High' },
    { criterion: 'Institutional Knowledge', description: 'Position holds critical organizational knowledge or relationships', weight: 'Medium' },
    { criterion: 'Leadership Scope', description: 'Manages significant teams, budgets, or cross-functional initiatives', weight: 'Medium' },
    { criterion: 'Regulatory Requirement', description: 'Position is required for compliance or regulatory reasons', weight: 'Medium' },
    { criterion: 'Client/Stakeholder Relationships', description: 'Position maintains key external relationships', weight: 'Medium' }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Active positions only', enforcement: 'System', description: 'Only active job positions can be marked as key positions.' },
    { rule: 'Company-scoped', enforcement: 'System', description: 'Key position flag is company-specific; same job can have different status across companies.' },
    { rule: 'HR role required', enforcement: 'System', description: 'Only HR Partner or Admin roles can modify key position status.' },
    { rule: 'Audit trail', enforcement: 'System', description: 'All changes to key position status are logged with timestamp and user.' },
    { rule: 'Succession plan prerequisite', enforcement: 'System', description: 'Position must be marked as key before a succession plan can be created.' },
    { rule: 'Position-to-plan relationship', enforcement: 'System', description: 'Each key position can have at most one active succession plan.' }
  ];

  return (
    <section id="sec-6-2" data-manual-anchor="sec-6-2" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.2 Key Position Identification</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Mark positions as key/critical for succession planning coverage
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Apply key position criteria to identify positions requiring succession planning',
          'Mark job positions as key positions in the system',
          'Document key position rationale for audit and stakeholder alignment',
          'Review key position distribution across the organization'
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
            <Badge variant="secondary">Key Positions</Badge>
          </div>
        </CardContent>
      </Card>

      {/* What is a Key Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-primary" />
            What is a Key Position?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A key position (also called critical position or pivotal role) is a job that is 
            essential to the organization's ability to execute strategy, serve customers, or 
            maintain operations. Vacancies in these positions pose significant business risk.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-sm text-green-800 dark:text-green-300">Key Positions Are</span>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Critical to business continuity</li>
                <li>• Difficult to fill externally</li>
                <li>• High impact if vacant</li>
                <li>• Require succession planning coverage</li>
              </ul>
            </div>
            
            <div className="p-4 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-sm text-amber-800 dark:text-amber-300">Key Positions Are NOT</span>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Every manager or leadership role</li>
                <li>• Positions easily filled externally</li>
                <li>• Roles with abundant talent supply</li>
                <li>• All high-salary positions</li>
              </ul>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Industry Benchmark:</strong> Best practice organizations identify 10-15% of 
                positions as key/critical. Exceeding 20% dilutes focus and resources. Below 5% may 
                leave significant gaps unaddressed.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Position Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Key Position Identification Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use these criteria to evaluate whether a position should be designated as key. 
            Positions meeting 3+ criteria are strong candidates for key position status.
          </p>

          <div className="space-y-3">
            {keyPositionCriteria.map((item) => (
              <div key={item.criterion} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{item.criterion}</h5>
                  <Badge 
                    variant={item.weight === 'High' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {item.weight} Weight
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            jobs Table - Key Position Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The <code className="text-xs bg-muted px-1 rounded">is_key_position</code> flag on 
            the jobs table determines whether a position requires succession planning.
          </p>
          <FieldReferenceTable fields={jobKeyPositionFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            Mark Position as Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={markKeyPositionSteps} title="" />
        </CardContent>
      </Card>

      {/* UI Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5 text-primary" />
            Key Positions Tab Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Key Positions tab provides a centralized view of all positions marked as key 
            and their succession coverage status.
          </p>

          {/* Technical Architecture Note */}
          <div className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Technical Note:</strong> Key positions are determined by the 
                <code className="bg-muted mx-1 px-1 rounded text-xs">jobs.is_key_position</code> flag. 
                The KeyPositionsTab UI shows <em>positions</em> that are linked to jobs where 
                <code className="bg-muted mx-1 px-1 rounded text-xs">is_key_position = true</code>. 
                Unmarking a job as key removes its associated positions from the Key Positions view.
              </span>
            </p>
          </div>

          {/* Simulated UI */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 bg-muted border-b">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Key Positions Overview</span>
                <div className="flex gap-2">
                  <Badge variant="outline">All Positions: 150</Badge>
                  <Badge variant="secondary">Key Positions: 18</Badge>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid gap-3 md:grid-cols-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-xs text-muted-foreground">With Succession Plan</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">4</div>
                  <div className="text-xs text-muted-foreground">No Plan</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-xs text-muted-foreground">High Risk</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">67%</div>
                  <div className="text-xs text-muted-foreground">Coverage Rate</div>
                </div>
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
            Key Position Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Review key position designations annually during strategic planning',
              'Involve executives in key position identification to ensure strategic alignment',
              'Document rationale for each key position designation for audit purposes',
              'Balance between levels: include critical individual contributor roles, not just managers',
              'Consider both current criticality and future strategic importance',
              'Avoid marking too many positions as key (dilutes focus and resources)'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
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
