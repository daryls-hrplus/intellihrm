import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  Link2, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  Target,
  GraduationCap,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export function GapDevelopmentLinking() {
  const gapDevelopmentFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'candidate_id', required: false, type: 'UUID', description: 'Reference to succession candidate', validation: 'Recommended but nullable' },
    { name: 'company_id', required: false, type: 'UUID', description: 'Reference to company', validation: 'Recommended but nullable' },
    { name: 'gap_type', required: true, type: 'Text', description: 'Category of the development gap', validation: 'competency, experience, skill, knowledge, leadership' },
    { name: 'gap_description', required: false, type: 'Text', description: 'Description of the gap', validation: 'Recommended, max 500 chars' },
    { name: 'gap_severity', required: false, type: 'Text', description: 'Severity of the gap', defaultValue: 'medium', validation: 'low, medium, high' },
    { name: 'linked_idp_item_id', required: false, type: 'UUID', description: 'Reference to IDP goal item', validation: 'Must be valid IDP item' },
    { name: 'linked_learning_id', required: false, type: 'UUID', description: 'Reference to learning assignment or course', validation: 'Must be valid learning record' },
    { name: 'recommended_experience', required: false, type: 'Text', description: 'Recommended experience or assignment to close gap' },
    { name: 'status', required: false, type: 'Text', description: 'Gap closure status', defaultValue: 'identified', validation: 'identified, in_progress, closed' },
    { name: 'created_at', required: false, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: false, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const gapTypes = [
    { type: 'Competency', description: 'Gap in a required competency area', example: 'Strategic Thinking rated 2/5, requires 4/5 for target role' },
    { type: 'Experience', description: 'Missing critical experience', example: 'No P&L responsibility, international assignment needed' },
    { type: 'Skill', description: 'Technical or functional skill gap', example: 'Limited M&A experience, needs financial modeling skills' },
    { type: 'Knowledge', description: 'Domain or industry knowledge gap', example: 'Limited regulatory compliance knowledge' },
    { type: 'Leadership', description: 'Leadership capability gap', example: 'Needs experience leading larger teams or cross-functional initiatives' }
  ];

  const linkGapSteps: Step[] = [
    {
      title: 'Identify Development Gap',
      description: 'Document the gap from readiness assessment or observation.',
      substeps: [
        'Navigate to the candidate\'s profile in the succession plan',
        'Review readiness assessment results and development areas',
        'Click "Add Gap" or access the Gap-Development section',
        'Enter Gap Type, Description, and Severity'
      ],
      expectedResult: 'Development gap is documented for the candidate'
    },
    {
      title: 'Link to IDP Goal',
      description: 'Connect the gap to an Individual Development Plan goal.',
      substeps: [
        'Click "Link to IDP" in the gap record',
        'Search for existing IDP goals or create a new one',
        'Select the IDP item that addresses this gap',
        'Save the linkage'
      ],
      notes: [
        'IDP goals provide structured development tracking',
        'Multiple gaps can link to the same IDP goal'
      ],
      expectedResult: 'Gap is linked to an IDP goal'
    },
    {
      title: 'Link to Learning Assignment',
      description: 'Connect the gap to a formal learning opportunity.',
      substeps: [
        'Click "Link to Learning" in the gap record',
        'Search the learning catalog for relevant courses',
        'Select the course or create a learning request',
        'Save the linkage'
      ],
      expectedResult: 'Gap is linked to a learning assignment'
    },
    {
      title: 'Add Recommended Experience',
      description: 'Document experiential development recommendations.',
      substeps: [
        'Enter recommended experiences in the text field',
        'Be specific about the type of assignment or exposure needed',
        'Examples: "Lead a cross-functional project", "International rotation"'
      ],
      expectedResult: 'Experience recommendations are documented'
    },
    {
      title: 'Monitor Gap Closure',
      description: 'Track progress toward closing the gap.',
      substeps: [
        'Update status as development progresses: Identified → In Progress → Closed',
        'Review linked IDP and learning completion status',
        'Close the gap when development objectives are met'
      ],
      expectedResult: 'Gap status reflects current progress'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Candidate recommended', enforcement: 'Advisory', description: 'Gaps should be linked to a succession candidate for tracking purposes.' },
    { rule: 'Gap type required', enforcement: 'System', description: 'Each gap must have a categorized type.' },
    { rule: 'Description recommended', enforcement: 'Advisory', description: 'Gaps should have a description for clarity; optional in DB.' },
    { rule: 'Optional linkages', enforcement: 'System', description: 'IDP and Learning links are optional; gaps can have neither, one, or both.' },
    { rule: 'Foreign key validation', enforcement: 'System', description: 'Linked IDP and Learning records must exist and be valid.' },
    { rule: 'Status transitions', enforcement: 'Policy', description: 'Status should progress: identified → in_progress → closed.' }
  ];

  return (
    <section id="sec-6-8" data-manual-anchor="sec-6-8" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.8 Gap-to-Development Linking</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Connect succession gaps to IDP goals and learning assignments
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Document development gaps for succession candidates',
          'Link gaps to Individual Development Plan (IDP) goals',
          'Connect gaps to learning assignments and courses',
          'Track gap closure progress through integrated development'
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
            <Badge variant="outline">Candidate</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Gap-Development Links</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status Note */}
      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Implementation Note:</strong> Gap-to-Development linking in HRplus is primarily 
              managed through the IDP (Individual Development Plan) and Learning modules. While the 
              <code className="bg-muted mx-1 px-1 rounded text-xs">succession_gap_development_links</code> 
              table stores the associations, the user interface for creating and managing these links 
              is accessed via the IDP Module (link development goals to succession gaps) and Learning 
              Module (assign courses addressing identified gaps). A dedicated Succession UI for gap 
              management is planned for future release.
            </span>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            Gap-Development Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The gap-development linking system connects succession gaps to development actions 
            in other modules, creating a unified view of candidate development.
          </p>

          {/* Integration Diagram */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium">Succession Gap</span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-xs font-medium">IDP Goal</span>
            </div>
            <span className="text-muted-foreground">&</span>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-xs font-medium">Learning</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Gap Type Definitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {gapTypes.map((item) => (
              <div key={item.type} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                <p className="text-xs"><span className="font-medium">Example:</span> {item.example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            succession_gap_development_links Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={gapDevelopmentFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Link Gap to Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={linkGapSteps} title="" />
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Gap-Development Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Derive gaps from formal readiness assessments for objectivity',
              'Prioritize high-severity gaps that directly impact readiness',
              'Use IDP goals for long-term development; learning for specific skills',
              'Include experiential recommendations, not just formal training',
              'Review gap status during succession planning meetings',
              'Close gaps only when development objectives are demonstrably met'
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
              <strong>Industry Benchmark:</strong> Organizations that integrate succession gaps 
              with IDP and learning systems see 50% faster gap closure rates compared to those 
              managing development separately (Bersin by Deloitte Leadership Development Report).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
