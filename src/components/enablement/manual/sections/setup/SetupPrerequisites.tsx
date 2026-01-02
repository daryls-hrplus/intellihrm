import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { LearningObjectives, TroubleshootingSection } from '../../components';

const PREREQUISITES = [
  { label: 'Rating Scales configured for goals, competencies, and responsibilities', critical: true, module: 'Foundation' },
  { label: 'Overall Rating Scales defined with performance categories', critical: true, module: 'Foundation' },
  { label: 'Competency Library populated with behavioral indicators', critical: true, module: 'Foundation' },
  { label: 'Job Profiles assigned with competencies and responsibilities', critical: true, module: 'Core HR' },
  { label: 'Employee-Manager relationships established in org hierarchy', critical: true, module: 'Core HR' },
  { label: 'Approval Workflows configured for performance processes', critical: false, module: 'Foundation' },
  { label: 'Performance Categories defined with score thresholds', critical: false, module: 'Appraisals' },
  { label: 'Goal cycles created and goals assigned to employees', critical: false, module: 'Goals' },
  { label: 'Notification templates configured for appraisal events', critical: false, module: 'Settings' },
  { label: 'Action Rules configured for outcome-based triggers', critical: false, module: 'Appraisals' },
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Cannot create appraisal cycle - missing prerequisites',
    cause: 'Required foundation elements (rating scales, templates) have not been configured.',
    solution: 'Complete all "Required" prerequisites in the checklist before attempting to create a cycle. The system validates these dependencies.'
  },
  {
    issue: 'Employees missing from appraisal participant list',
    cause: 'Employee-manager relationships not established or employee status is not Active.',
    solution: 'Verify org hierarchy in Core HR module. Ensure employees have active employment records and assigned managers.'
  },
  {
    issue: 'Competencies not appearing on appraisal forms',
    cause: 'Competencies not linked to job families or employee job assignments missing.',
    solution: 'Map competencies to job families in the Competency Library, then verify employees have correct job assignments.'
  }
];

export function SetupPrerequisites() {
  return (
    <Card id="sec-2-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.1</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge className="bg-amber-600 text-white dark:bg-amber-700">
            One-time setup
          </Badge>
        </div>
        <CardTitle className="text-2xl">Prerequisites Checklist</CardTitle>
        <CardDescription>
          Essential configuration items to complete before launching appraisal cycles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', '(Multiple areas)']} />

        <LearningObjectives
          objectives={[
            'Identify all required prerequisites for appraisal configuration',
            'Understand the dependency chain between modules',
            'Verify readiness for appraisal cycle launch',
            'Plan the implementation timeline for prerequisites'
          ]}
        />

        {/* Overview */}
        <div>
          <h4 className="font-medium mb-2">Overview</h4>
          <p className="text-muted-foreground">
            The Performance Management module depends on several foundational elements from other modules. 
            Before configuring appraisal cycles, these prerequisites must be in place to ensure proper 
            data flow, accurate calculations, and complete evaluation forms.
          </p>
        </div>

        {/* Timeline Alert */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Implementation Timeline</h4>
              <p className="text-sm text-foreground">
                Complete these prerequisites <strong>4-6 weeks</strong> before your planned go-live date. 
                This allows time for testing, user training, and data validation.
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h4 className="font-medium mb-3">Prerequisites Checklist</h4>
          <div className="space-y-3">
            {PREREQUISITES.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox id={`prereq-${i}`} />
                <label htmlFor={`prereq-${i}`} className="flex-1 text-sm cursor-pointer">
                  {item.label}
                </label>
                <Badge variant="outline" className="text-xs">{item.module}</Badge>
                {item.critical ? (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dependency Chain */}
        <div>
          <h4 className="font-medium mb-3">Configuration Dependency Chain</h4>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className="bg-blue-600 text-white dark:bg-blue-700">Rating Scales</Badge>
              <span>→</span>
              <Badge className="bg-blue-600 text-white dark:bg-blue-700">Competency Library</Badge>
              <span>→</span>
              <Badge className="bg-blue-600 text-white dark:bg-blue-700">Job Profiles</Badge>
              <span>→</span>
              <Badge className="bg-green-600 text-white dark:bg-green-700">Form Templates</Badge>
              <span>→</span>
              <Badge className="bg-green-600 text-white dark:bg-green-700">Appraisal Cycles</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Each element depends on the previous items in the chain. Configure in this order for best results.
            </p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div>
          <h4 className="font-medium mb-3">Verification Steps</h4>
          <div className="space-y-2">
            {[
              'Run the System Readiness Check from Performance → Setup → Diagnostics',
              'Create a test appraisal cycle with a small employee group',
              'Verify all form sections populate correctly with expected data',
              'Test the complete workflow from creation to completion',
              'Validate score calculations and category assignments'
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
