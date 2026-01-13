import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, AlertCircle, Sparkles, Link2 } from 'lucide-react';
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
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for the competency', defaultValue: 'Auto-generated', validation: 'Max 20 chars, unique' },
  { name: 'Name', required: true, type: 'Text', description: 'Display name for the competency', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Type', required: true, type: 'Enum', description: 'Must be COMPETENCY for appraisal use', defaultValue: 'COMPETENCY', validation: 'From list' },
  { name: 'Category', required: true, type: 'Enum', description: 'behavioral, leadership, or core', defaultValue: 'behavioral', validation: 'From predefined list' },
  { name: 'Description', required: false, type: 'Text', description: 'Full description of the competency and its importance', defaultValue: '—', validation: 'Max 1000 characters' },
  { name: 'Proficiency Indicators', required: true, type: 'JSONB', description: 'Behavioral descriptors for each proficiency level (1-5)', defaultValue: '—', validation: 'All 5 levels required' },
  { name: 'External Source', required: false, type: 'Enum', description: 'ESCO, O*NET, or Manual', defaultValue: 'Manual', validation: 'From list' },
  { name: 'Is Global', required: true, type: 'Boolean', description: 'Available to all companies (platform-wide)', defaultValue: 'false', validation: '—' },
  { name: 'Effective From', required: true, type: 'Date', description: 'When competency becomes active', defaultValue: 'Today', validation: 'Valid date' },
  { name: 'Status', required: true, type: 'Enum', description: 'draft, active, or deprecated', defaultValue: 'draft', validation: 'From list' },
];

const JOB_LINK_FIELDS = [
  { name: 'Job', required: true, type: 'Reference', description: 'The job this competency applies to', defaultValue: '—', validation: 'Valid job ID' },
  { name: 'Weight', required: true, type: 'Percentage', description: 'Contribution to overall competency score for this job', defaultValue: '—', validation: 'All job competencies must sum to 100%' },
  { name: 'Required Level', required: true, type: 'Number (1-5)', description: 'Expected proficiency level for this job', defaultValue: '3', validation: 'Between 1 and 5' },
  { name: 'Is Required', required: true, type: 'Boolean', description: 'Whether competency is mandatory for the job', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Skills & Competencies Registry',
    description: 'Go to Workforce → Skills & Competencies',
    substeps: [
      'Select company from the company filter (top of page)',
      'Filter to show only Competencies using the Type filter'
    ],
    expectedResult: 'Competency Registry displays with existing competencies for the selected company'
  },
  {
    title: 'Import or Create Competency Library',
    description: 'Build your competency framework using one of these methods',
    substeps: [
      'Option A: Click "Import & Generate" → "Import from Library" to import from ESCO/O*NET',
      'Option B: Use Quick Start Wizard to select from curated library',
      'Option C: Click "Add Capability" to manually create competencies'
    ],
    expectedResult: 'Competencies added to the registry for your company'
  },
  {
    title: 'Generate AI Proficiency Indicators',
    description: 'Use AI to create behavioral descriptors for each proficiency level',
    substeps: [
      'Select competencies that need indicators (checkbox)',
      'Click "Import & Generate" → "Generate Competency Indicators"',
      'AI generates behavioral descriptions for levels 1-5',
      'Review and edit generated indicators as needed'
    ],
    expectedResult: 'All competencies have proficiency indicators for levels 1-5'
  },
  {
    title: 'Link Competencies to Jobs',
    description: 'Associate competencies with relevant jobs in your organization',
    substeps: [
      'Click "Manage Jobs" on a competency card',
      'Or navigate to Workforce → Jobs and expand a job',
      'Click "Link Competencies" or use the competency linking panel',
      'Search and select applicable competencies'
    ],
    expectedResult: 'Competencies linked to relevant jobs'
  },
  {
    title: 'Configure Weights and Required Levels',
    description: 'Set the contribution weight and expected proficiency for each job-competency link',
    substeps: [
      'For each linked competency, set the Weight percentage (e.g., 25%)',
      'Set the Required Level (1-5) indicating expected proficiency',
      'Weights for all competencies linked to a job MUST total 100%',
      'System validates weight totals and shows warnings if not 100%'
    ],
    expectedResult: 'All job-competency links have weights totaling 100% per job'
  },
  {
    title: 'Verify Configuration Status',
    description: 'Check that competencies are ready for use in appraisals',
    substeps: [
      'Navigate to Performance → Setup → Core Framework → Competencies',
      'Review the Configuration Status column for each competency',
      'Green "Ready" = Has indicators + linked to 1+ jobs',
      'Yellow "Partial" = Missing indicators OR job links',
      'Red "Not Ready" = Missing both indicators AND job links'
    ],
    expectedResult: 'All competencies show "Ready" status for appraisal use'
  }
];

const BUSINESS_RULES = [
  { rule: 'Competency weights per job MUST equal 100%', enforcement: 'System' as const, description: 'System validates that all competency weights for a single job sum to exactly 100%.' },
  { rule: 'All 5 proficiency levels required for appraisals', enforcement: 'System' as const, description: 'Cannot use competency in appraisals without behavioral indicators for all 5 levels.' },
  { rule: 'Core category competencies auto-assign to all employees', enforcement: 'System' as const, description: 'Marking competency category as "core" adds it to all appraisal forms regardless of job.' },
  { rule: 'Non-core competencies require job links', enforcement: 'Policy' as const, description: 'Behavioral and leadership competencies should be linked to at least one job.' },
  { rule: 'AI indicator generation requires company context', enforcement: 'System' as const, description: 'AI uses company-specific context to generate relevant behavioral indicators.' },
  { rule: 'Deprecated competencies cannot be added to new jobs', enforcement: 'System' as const, description: 'Once deprecated, competency can only be used in existing assignments.' },
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Competency not appearing on appraisal forms',
    cause: 'Competency not linked to employee\'s job, missing indicators, or status is not "active".',
    solution: 'Verify: 1) Competency is linked to the employee\'s current job, 2) Has proficiency indicators for all 5 levels, 3) Status is "active", 4) Effective dates are current.'
  },
  {
    issue: 'Weight validation error - "Weights must equal 100%"',
    cause: 'Competency weights for a job do not sum to exactly 100%.',
    solution: 'Navigate to the job profile and adjust competency weights. System shows current total. Add or reduce weights until they equal 100%.'
  },
  {
    issue: 'AI indicator generation failed',
    cause: 'Competency lacks sufficient description context, or system is rate-limited.',
    solution: 'Add a detailed description to the competency before generating indicators. If rate-limited, wait a few minutes and retry.'
  },
  {
    issue: 'Configuration status shows "Partial"',
    cause: 'Missing either proficiency indicators OR job links (but not both).',
    solution: 'Check which is missing: If no indicators, generate using AI. If no job links, link to at least one relevant job.'
  },
  {
    issue: 'Cannot delete competency',
    cause: 'Competency is referenced in active or historical appraisals.',
    solution: 'Set status to "deprecated" instead of deleting. Historical data requires reference integrity.'
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
            ~20 min read
          </Badge>
          <Badge className="bg-purple-600 text-white dark:bg-purple-700">
            Critical for Appraisals
          </Badge>
        </div>
        <CardTitle className="text-2xl">Competency Framework Configuration</CardTitle>
        <CardDescription>
          Import competencies, generate AI indicators, and link to jobs with weights for performance assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Workforce', 'Skills & Competencies']} />
        <div className="text-xs text-muted-foreground">
          Verification: Performance → Setup → Core Framework → Competencies
        </div>

        <LearningObjectives
          objectives={[
            'Import or create competencies for your organization',
            'Generate AI-powered proficiency indicators',
            'Link competencies to jobs with proper weighting',
            'Validate that weights equal 100% per job',
            'Verify competency readiness for appraisal forms'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Jobs configured in Workforce → Jobs module',
            'Company selected for competency management',
            'Understanding of Skills vs Competencies (Section 2.4a)'
          ]}
        />

        {/* Overview */}
        <div>
          <h4 className="font-medium mb-2">What Is Competency Framework Configuration?</h4>
          <p className="text-muted-foreground">
            Competencies form the "C" component of the CRGV appraisal model. This section covers how to 
            import or create competencies in the unified <code className="bg-muted px-1 rounded">skills_competencies</code> registry, 
            generate AI-powered behavioral indicators, and link them to jobs with weights that must total 100% per job.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Competency Configuration Workflow
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="px-3 py-1.5 bg-primary/10 rounded-full">1. Import/Create</div>
            <span className="text-muted-foreground">→</span>
            <div className="px-3 py-1.5 bg-primary/10 rounded-full">2. AI Indicators</div>
            <span className="text-muted-foreground">→</span>
            <div className="px-3 py-1.5 bg-primary/10 rounded-full">3. Link to Jobs</div>
            <span className="text-muted-foreground">→</span>
            <div className="px-3 py-1.5 bg-primary/10 rounded-full">4. Set Weights (100%)</div>
            <span className="text-muted-foreground">→</span>
            <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">✓ Ready</div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.4.1: Skills & Competencies Registry with competency filter applied"
          alt="Competency Registry main view"
        />

        {/* Competency Categories */}
        <div>
          <h4 className="font-medium mb-3">Competency Categories</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 text-purple-600 dark:text-purple-400">Core</h5>
              <p className="text-sm text-muted-foreground mb-3">Applied to all employees regardless of role</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Communication</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Teamwork</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Problem Solving</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Accountability</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Leadership</h5>
              <p className="text-sm text-muted-foreground mb-3">Manager and above positions</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategic Thinking</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> People Development</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Change Management</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Decision Making</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 text-amber-600 dark:text-amber-400">Behavioral</h5>
              <p className="text-sm text-muted-foreground mb-3">Role-specific behavioral traits</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Customer Focus</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Innovation</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Adaptability</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Attention to Detail</div>
              </div>
            </div>
          </div>
        </div>

        <StepByStep steps={STEPS} title="Configuring Competencies: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.4.2: AI-generated proficiency indicators for a competency"
          alt="Competency with AI-generated behavioral indicators"
        />

        {/* Job Linking Section */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Job Linking & Weight Validation</h4>
              <p className="text-sm text-foreground mt-1">
                Each competency linked to a job requires a <strong>weight percentage</strong> and 
                <strong> required proficiency level</strong>. The system enforces that all competency 
                weights for a single job must equal exactly 100%.
              </p>
              <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded">
                <h5 className="font-medium text-sm mb-2">Example: Software Developer Job</h5>
                <table className="w-full text-sm">
                  <thead className="text-left">
                    <tr className="border-b">
                      <th className="py-1">Competency</th>
                      <th className="py-1">Weight</th>
                      <th className="py-1">Required Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Problem Solving</td><td>30%</td><td>Level 4</td></tr>
                    <tr><td>Communication</td><td>25%</td><td>Level 3</td></tr>
                    <tr><td>Teamwork</td><td>25%</td><td>Level 3</td></tr>
                    <tr><td>Adaptability</td><td>20%</td><td>Level 3</td></tr>
                    <tr className="border-t font-medium"><td>Total</td><td>100% ✓</td><td></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Competency Field Reference" />
        
        <FieldReferenceTable fields={JOB_LINK_FIELDS} title="Job-Competency Link Fields (job_capability_requirements)" />

        <Separator />

        {/* Configuration Status */}
        <div>
          <h4 className="font-medium mb-3">Configuration Status Indicators</h4>
          <p className="text-muted-foreground mb-4">
            The system tracks readiness status for each competency based on required configuration:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-green-500 bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600">Ready</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Has proficiency indicators for all 5 levels AND linked to at least 1 job with weight.
              </p>
            </div>
            <div className="p-4 border rounded-lg border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-600">Partial</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Has proficiency indicators OR job links, but not both. Complete missing configuration.
              </p>
            </div>
            <div className="p-4 border rounded-lg border-red-500 bg-red-50 dark:bg-red-950/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-600">Not Ready</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Missing both proficiency indicators AND job links. Cannot be used in appraisals.
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Weight Validation is Enforced</h4>
              <p className="text-sm text-foreground">
                If competency weights for a job do not equal 100%, the system will display a warning 
                and may prevent cycle activation. Always verify weights before launching an appraisal cycle.
              </p>
            </div>
          </div>
        </div>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
