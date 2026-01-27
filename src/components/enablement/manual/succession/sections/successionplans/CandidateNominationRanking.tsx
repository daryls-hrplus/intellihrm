import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  Users, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  UserPlus,
  Medal,
  ArrowUpDown,
  Star,
  Clock
} from 'lucide-react';

export function CandidateNominationRanking() {
  const successionCandidateFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'plan_id', required: true, type: 'UUID', description: 'Reference to succession plan', validation: 'Must be valid, active plan' },
    { name: 'employee_id', required: true, type: 'UUID', description: 'Reference to employee profile', validation: 'Must be active employee' },
    { name: 'readiness_level', required: true, type: 'Text', description: 'Current readiness classification', defaultValue: 'developing', validation: 'ready_now, ready_1_year, ready_2_years, developing' },
    { name: 'readiness_timeline', required: false, type: 'Text', description: 'Estimated time to readiness' },
    { name: 'strengths', required: false, type: 'Text', description: 'Candidate strengths relevant to position' },
    { name: 'development_areas', required: false, type: 'Text', description: 'Areas requiring development' },
    { name: 'ranking', required: false, type: 'Integer', description: 'Succession priority ranking (1 = primary)', defaultValue: '1' },
    { name: 'status', required: true, type: 'Text', description: 'Candidate status in the plan', defaultValue: 'active', validation: 'active, removed' },
    { name: 'notes', required: false, type: 'Text', description: 'Additional notes about the candidate' },
    { name: 'nominated_by', required: false, type: 'UUID', description: 'User who nominated the candidate' },
    { name: 'performance_risk_id', required: false, type: 'UUID', description: 'Reference to performance risk assessment' },
    { name: 'is_promotion_blocked', required: false, type: 'Boolean', description: 'Flag if promotion is blocked', defaultValue: 'false' },
    { name: 'block_reason', required: false, type: 'Text', description: 'Reason for promotion block' },
    { name: 'last_risk_check_at', required: false, type: 'Timestamp', description: 'When risk was last checked' },
    { name: 'latest_readiness_score', required: false, type: 'Numeric', description: 'Most recent readiness assessment score' },
    { name: 'latest_readiness_band', required: false, type: 'Text', description: 'Band from latest readiness assessment' },
    { name: 'readiness_assessed_at', required: false, type: 'Timestamp', description: 'When readiness was last assessed' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const nominateCandidateSteps: Step[] = [
    {
      title: 'Open Succession Plan',
      description: 'Navigate to the target succession plan.',
      substeps: [
        'Go to Performance → Succession → Succession Plans',
        'Locate and click on the target succession plan',
        'The plan detail page opens with the Candidates tab'
      ],
      expectedResult: 'Succession plan detail page is displayed'
    },
    {
      title: 'Add Candidate',
      description: 'Nominate an employee as a succession candidate.',
      substeps: [
        'Click "Add Candidate" or the + button',
        'Search for the employee by name or employee ID',
        'Select the employee from the search results',
        'Click "Nominate" to add them as a candidate'
      ],
      notes: [
        'Candidates can be from any department or location',
        'Talent pool graduates are prime candidates'
      ],
      expectedResult: 'Employee is added as a succession candidate'
    },
    {
      title: 'Set Readiness Level',
      description: 'Classify the candidate\'s current readiness.',
      substeps: [
        'Select Readiness Level from the dropdown',
        'Options: Ready Now, Ready in 1 Year, Ready in 2 Years, Developing',
        'This is an initial assessment pending formal readiness assessment'
      ],
      expectedResult: 'Readiness level is set for the candidate'
    },
    {
      title: 'Document Strengths and Development Areas',
      description: 'Capture the candidate\'s qualifications and gaps.',
      substeps: [
        'Enter key Strengths relevant to the target position',
        'Document Development Areas that need attention',
        'Add any relevant Notes about the candidate'
      ],
      expectedResult: 'Candidate profile is documented'
    },
    {
      title: 'Set Ranking',
      description: 'Establish the succession priority order.',
      substeps: [
        'Assign a Ranking number (1 = primary successor)',
        'Rankings should reflect overall succession priority',
        'Multiple candidates can share a ranking if desired'
      ],
      notes: [
        'Ranking informs promotion decisions',
        'Review rankings after each assessment cycle'
      ],
      expectedResult: 'Candidate has a succession ranking'
    },
    {
      title: 'Save Candidate',
      description: 'Save the candidate record to the plan.',
      substeps: [
        'Review all entered information',
        'Click "Save" to add the candidate',
        'Candidate appears in the plan\'s candidate list'
      ],
      expectedResult: 'Candidate is saved and visible in the succession plan'
    }
  ];

  const readinessLevels = [
    { level: 'Ready Now', color: 'bg-green-500', timeline: '0-6 months', description: 'Can assume role immediately or with minimal transition' },
    { level: 'Ready 1 Year', color: 'bg-blue-500', timeline: '6-12 months', description: 'On track with targeted development; ready within a year' },
    { level: 'Ready 2 Years', color: 'bg-amber-500', timeline: '12-24 months', description: 'Significant development needed but strong potential' },
    { level: 'Developing', color: 'bg-gray-500', timeline: '24+ months', description: 'Early stage; long-term succession potential' }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Active plan required', enforcement: 'System', description: 'Candidates can only be added to active succession plans.' },
    { rule: 'Active employee required', enforcement: 'System', description: 'Only active employees can be nominated as succession candidates.' },
    { rule: 'No duplicate candidates', enforcement: 'System', description: 'Same employee cannot be added to the same plan twice.' },
    { rule: 'Ranking uniqueness optional', enforcement: 'Policy', description: 'Multiple candidates can share a ranking; system does not enforce uniqueness.' },
    { rule: 'Readiness sync', enforcement: 'System', description: 'When readiness assessment completes, latest_readiness_score and band are updated automatically.' },
    { rule: 'Removal is soft delete', enforcement: 'System', description: 'Setting status to "removed" preserves history; record is not deleted.' },
    { rule: 'HR/Manager role required', enforcement: 'System', description: 'HR Partner, Admin, or Manager of the position can nominate candidates.' }
  ];

  return (
    <section id="sec-6-5" data-manual-anchor="sec-6-5" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.5 Candidate Nomination & Ranking</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add candidates to succession plans and establish priority rankings
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Nominate employees as succession candidates for key positions',
          'Apply the 4-level readiness classification to candidates',
          'Document candidate strengths and development areas',
          'Establish and maintain succession ranking order'
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
            <Badge variant="outline">Succession Plans</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Candidates</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Readiness Level Definitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Readiness levels classify how soon a candidate could assume the target position.
          </p>

          <div className="space-y-3">
            {readinessLevels.map((level) => (
              <div key={level.level} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${level.color} flex-shrink-0 mt-1`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">{level.level}</h5>
                    <Badge variant="outline" className="text-xs">{level.timeline}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
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
            <Users className="h-5 w-5 text-primary" />
            succession_candidates Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={successionCandidateFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Nominate Candidate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={nominateCandidateSteps} title="" />
        </CardContent>
      </Card>

      {/* Ranking Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Candidate Ranking Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Rankings establish the succession priority order. Consider multiple factors when ranking.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Medal className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-sm">Ranking #1 (Primary)</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Highest readiness level</li>
                <li>• Best fit for role requirements</li>
                <li>• Strongest stakeholder support</li>
                <li>• Lowest development risk</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Ranking #2+ (Backup)</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Alternative if primary declines</li>
                <li>• May have longer development timeline</li>
                <li>• Could be from different business unit</li>
                <li>• Provides bench depth</li>
              </ul>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Best Practice:</strong> Maintain 2-3 ranked candidates per succession plan. 
                Having only one candidate creates risk; having too many dilutes development focus.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Card UI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Candidate Card Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each candidate is displayed with their profile, readiness status, and ranking.
          </p>

          {/* Simulated Candidate Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 flex items-start gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Sarah Chen</h5>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Ready Now</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">VP of Finance • 8 years tenure</p>
                <div className="grid gap-2 md:grid-cols-2 text-xs">
                  <div>
                    <span className="font-medium">Strengths:</span>
                    <p className="text-muted-foreground">Strategic planning, M&A experience, board presentation</p>
                  </div>
                  <div>
                    <span className="font-medium">Development:</span>
                    <p className="text-muted-foreground">Investor relations, international operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Values Promotion Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            Values Promotion Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The ValuesPromotionCheck component validates candidates against company values 
            before promotion decisions are finalized.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Data Source</h5>
              <p className="text-xs text-muted-foreground">
                Queries <code className="bg-muted px-1 rounded">skills_competencies</code> where 
                type='VALUE' and <code className="bg-muted px-1 rounded">appraisal_capability_scores</code> 
                for ratings.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Promotion Criteria</h5>
              <p className="text-xs text-muted-foreground">
                Values with <code className="bg-muted px-1 rounded">is_promotion_factor=true</code> 
                must have rating ≥3 to meet promotion criteria.
              </p>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Display Modes</h5>
            <div className="flex gap-4 items-center">
              <Badge className="bg-emerald-100 text-emerald-800">Values OK</Badge>
              <span className="text-xs text-muted-foreground">or</span>
              <Badge className="bg-amber-100 text-amber-800">2/3 Values</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Compact mode shows badge; full mode shows detailed card with rating breakdown.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Development Plan Inline Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Development Plan Inline Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Development plan progress is displayed inline on candidate cards within the 
            Succession Plans tab, providing at-a-glance visibility without leaving the 
            succession context.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Progress Bar Display</h5>
              <p className="text-xs text-muted-foreground">
                Each candidate card shows a progress bar with completion percentage 
                based on their linked Individual Development Plan (IDP).
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">IDP Module Navigation</h5>
              <p className="text-xs text-muted-foreground">
                Clicking the progress indicator navigates to the full development 
                plan in the IDP module for detailed editing.
              </p>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Integration Note:</strong> Development plan CRUD operations are 
                managed via the IDP module. The succession tab provides read-only visibility 
                to track development progress against succession readiness goals.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Leadership Signals Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            Leadership Signals Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The SuccessorProfileLeadershipSignals component displays leadership-category 
            talent signals for succession candidates.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Data Source</h5>
              <p className="text-xs text-muted-foreground">
                <code className="bg-muted px-1 rounded">talent_signal_snapshots</code> table 
                filtered by <code className="bg-muted px-1 rounded">signal_category = 'leadership'</code>
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Signal Metrics</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Score: 1-5 scale</li>
                <li>• Confidence: percentage</li>
                <li>• Trend: up/down/stable</li>
              </ul>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Display Modes</h5>
            <p className="text-xs text-muted-foreground">
              <strong>Compact:</strong> Top 3 signals with tooltips | 
              <strong> Full:</strong> Up to 5 signals with progress bars
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Signal Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Candidate Signal Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The CandidateSignalComparison component enables side-by-side comparison 
            of talent signals across multiple candidates.
          </p>

          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Availability</h5>
            <p className="text-xs text-muted-foreground">
              Appears when 2 or more candidates exist in a succession plan. Accessible 
              via the comparison panel in the Candidates tab.
            </p>
          </div>

          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Usage Context</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Succession committee meetings</li>
              <li>• Calibration discussions</li>
              <li>• Development prioritization decisions</li>
            </ul>
          </div>

          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Features</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Expandable comparison panel</li>
              <li>• Side-by-side signal visualization</li>
              <li>• Highlight gaps between candidates</li>
            </ul>
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
            Candidate Management Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Consider candidates from talent pools who have demonstrated potential',
              'Include candidates from different business units for cross-pollination',
              'Document specific strengths and gaps relevant to the target role',
              'Review rankings quarterly and after major performance or assessment events',
              'Communicate succession status to candidates (per organizational policy)',
              'Link development plans to close identified gaps'
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
