import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Competency Name', required: true, type: 'Text', description: 'Display name for the competency', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for integrations', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Category', required: true, type: 'Select', description: 'Grouping category (Core, Leadership, Technical, Functional)', defaultValue: 'Core', validation: 'From predefined list' },
  { name: 'Description', required: true, type: 'Text', description: 'Full description of the competency and its importance', defaultValue: '—', validation: 'Max 1000 characters' },
  { name: 'Proficiency Levels', required: true, type: 'Array', description: 'Behavioral indicators for each proficiency level (1-5)', defaultValue: '—', validation: 'All 5 levels required' },
  { name: 'Job Families', required: false, type: 'Multi-select', description: 'Which job families require this competency', defaultValue: 'None', validation: '—' },
  { name: 'Expected Level by Grade', required: false, type: 'Mapping', description: 'Target proficiency level for each job grade', defaultValue: 'Level 3', validation: 'Level 1-5' },
  { name: 'Is Core', required: true, type: 'Boolean', description: 'Whether this applies to all employees', defaultValue: 'false', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether competency is available for use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Competency Library',
    description: 'Go to Performance → Setup → Foundation → Competencies',
    expectedResult: 'Competency Library displays with existing competencies grouped by category'
  },
  {
    title: 'Click "Add Competency"',
    description: 'Click the primary action button to create a new competency',
    expectedResult: 'Competency creation form opens'
  },
  {
    title: 'Enter Competency Details',
    description: 'Fill in the basic competency information',
    substeps: [
      'Name: Enter a clear, descriptive name (e.g., "Strategic Thinking")',
      'Code: Enter unique identifier or accept auto-generated',
      'Category: Select the appropriate grouping (Core, Leadership, Technical)',
      'Description: Write a comprehensive explanation of the competency'
    ],
    expectedResult: 'Basic information saved'
  },
  {
    title: 'Define Proficiency Levels',
    description: 'Create behavioral indicators for each of the 5 proficiency levels',
    substeps: [
      'Level 1 (Foundational): Basic understanding, learning stage',
      'Level 2 (Developing): Applies with guidance, building skills',
      'Level 3 (Competent): Independent application, consistent performance',
      'Level 4 (Advanced): Expert application, coaches others',
      'Level 5 (Mastery): Strategic influence, organizational impact'
    ],
    expectedResult: 'All 5 proficiency levels have behavioral descriptions'
  },
  {
    title: 'Assign to Job Families',
    description: 'Map the competency to relevant job families',
    substeps: [
      'Select job families that require this competency',
      'Set expected proficiency level for each job grade within the family',
      'Mark as "Core" if applicable to all employees'
    ],
    expectedResult: 'Competency linked to job hierarchy'
  },
  {
    title: 'Save and Verify',
    description: 'Save the competency and verify it appears correctly',
    expectedResult: 'Competency saved and visible in the library with correct assignments'
  }
];

const BUSINESS_RULES = [
  { rule: 'All 5 proficiency levels required', enforcement: 'System' as const, description: 'Cannot save competency without behavioral indicators for all levels.' },
  { rule: 'Core competencies auto-assign to all employees', enforcement: 'System' as const, description: 'Marking competency as Core adds it to all appraisal forms.' },
  { rule: 'Job family assignment required for non-core', enforcement: 'System' as const, description: 'Non-core competencies must be linked to at least one job family.' },
  { rule: 'Grade-level expectations recommended', enforcement: 'Policy' as const, description: 'Set expected proficiency by grade for consistent evaluation standards.' },
  { rule: 'Annual competency framework review', enforcement: 'Policy' as const, description: 'Review and update competencies annually to reflect evolving needs.' },
  { rule: 'Behavioral indicators should be observable', enforcement: 'Advisory' as const, description: 'Write indicators that describe specific, measurable behaviors.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Competency not appearing on appraisal forms',
    cause: 'Competency not linked to employee\'s job family or marked inactive.',
    solution: 'Verify the competency is active and assigned to the correct job family. Check employee\'s job assignment in Core HR.'
  },
  {
    issue: 'Wrong expected level displayed for employee',
    cause: 'Grade-level mapping not configured or employee grade incorrect.',
    solution: 'Update the expected level by grade mapping in the competency, or correct the employee\'s grade in Core HR.'
  },
  {
    issue: 'Cannot delete competency',
    cause: 'Competency is referenced in active or historical appraisals.',
    solution: 'Deactivate the competency instead of deleting. Historical data requires reference integrity.'
  }
];

export function SetupCompetencies() {
  return (
    <Card id="sec-2-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.4</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            Quarterly updates
          </Badge>
        </div>
        <CardTitle className="text-2xl">Competency Library</CardTitle>
        <CardDescription>
          Define organizational competencies with behavioral indicators for performance assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Foundation', 'Competencies']} />

        <LearningObjectives
          objectives={[
            'Understand the competency framework structure and categories',
            'Create competencies with meaningful behavioral indicators',
            'Link competencies to job families and grade expectations',
            'Manage core vs. role-specific competency assignments'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Job families and grades configured in Core HR',
            'Organizational competency framework defined',
            'Rating scales configured (Section 2.2)'
          ]}
        />

        {/* Overview */}
        <div>
          <h4 className="font-medium mb-2">What Is the Competency Library?</h4>
          <p className="text-muted-foreground">
            The Competency Library serves as the central repository for all organizational competencies 
            used in performance evaluations. Each competency includes behavioral indicators across 
            proficiency levels, enabling consistent assessment of employee capabilities. Competencies 
            are linked to job families to ensure relevant skills appear on each employee's appraisal form.
          </p>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.4.1: Competency Library showing competencies grouped by category"
          alt="Competency Library main view"
        />

        {/* Competency Categories */}
        <div>
          <h4 className="font-medium mb-3">Competency Categories</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Core Competencies</h5>
              <p className="text-sm text-muted-foreground mb-3">Applied to all employees regardless of role</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Communication</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Teamwork & Collaboration</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Problem Solving</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Accountability</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Leadership Competencies</h5>
              <p className="text-sm text-muted-foreground mb-3">Manager and above positions</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategic Thinking</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> People Development</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Change Management</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Business Acumen</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Technical Competencies</h5>
              <p className="text-sm text-muted-foreground mb-3">Role-specific technical skills</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Software Development</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Data Analysis</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Project Management</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Financial Analysis</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Functional Competencies</h5>
              <p className="text-sm text-muted-foreground mb-3">Department-specific capabilities</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500" /> Sales & Negotiation</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500" /> Customer Service</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500" /> Regulatory Compliance</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500" /> Quality Assurance</div>
              </div>
            </div>
          </div>
        </div>

        <StepByStep steps={STEPS} title="Creating a Competency: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.4.2: Competency creation form with proficiency level configuration"
          alt="Add Competency dialog"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <Separator />

        {/* Proficiency Level Example */}
        <div>
          <h4 className="font-medium mb-3">Example: Strategic Thinking Proficiency Levels</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium w-24">Level</th>
                  <th className="text-left p-3 font-medium">Behavioral Indicator</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { level: '1 - Foundational', desc: 'Understands team goals and how individual work contributes to them' },
                  { level: '2 - Developing', desc: 'Considers implications beyond immediate task; asks clarifying questions about priorities' },
                  { level: '3 - Competent', desc: 'Anticipates how decisions impact other teams; aligns work with department objectives' },
                  { level: '4 - Advanced', desc: 'Develops strategies that advance organizational goals; influences cross-functional direction' },
                  { level: '5 - Mastery', desc: 'Shapes organizational strategy; balances competing priorities for enterprise benefit' }
                ].map((row) => (
                  <tr key={row.level} className="border-t">
                    <td className="p-3 font-medium">{row.level}</td>
                    <td className="p-3 text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
