import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, AlertTriangle, XCircle, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Overall Readiness Score', required: true, type: 'Percentage', description: 'Weighted average of all category readiness scores', defaultValue: 'Calculated', validation: '0-100%' },
  { name: 'Core Framework Status', required: true, type: 'Status', description: 'Rating scales, competencies, and foundational settings', defaultValue: 'Incomplete', validation: 'Complete/Partial/Incomplete' },
  { name: 'Appraisals Setup Status', required: true, type: 'Status', description: 'Form templates, rating levels, and cycle configuration', defaultValue: 'Incomplete', validation: 'Complete/Partial/Incomplete' },
  { name: 'Workforce Data Status', required: true, type: 'Status', description: 'Employee assignments, reporting relationships, job mappings', defaultValue: 'Incomplete', validation: 'Complete/Partial/Incomplete' },
  { name: 'Remediation Link', required: false, type: 'Navigation', description: 'Direct link to fix identified issues', defaultValue: 'Context-sensitive', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Appraisal Readiness',
    description: 'Go to Performance → Setup → Appraisals → Readiness',
    expectedResult: 'Readiness dashboard displays with overall score and category breakdowns'
  },
  {
    title: 'Review Overall Readiness Score',
    description: 'Check the prominent readiness percentage at the top of the panel',
    substeps: [
      '90-100%: Ready to launch cycles',
      '70-89%: Address critical issues before launch',
      '50-69%: Significant setup remaining',
      'Below 50%: Major configuration required'
    ],
    expectedResult: 'Understanding of current readiness state'
  },
  {
    title: 'Expand Category Cards',
    description: 'Click on each category card to see detailed check items',
    substeps: [
      'Core Framework: Rating scales, competencies, performance trends',
      'Appraisals Setup: Form templates, rating levels, outcome rules',
      'Workforce Data: Employee-job assignments, manager relationships'
    ],
    expectedResult: 'Detailed breakdown of requirements per category'
  },
  {
    title: 'Identify Critical vs Warning Issues',
    description: 'Review the status icons for each check item',
    substeps: [
      'Green checkmark (✓): Requirement met',
      'Yellow warning (⚠): Recommended but not blocking',
      'Red error (✗): Critical issue - must fix before launch'
    ],
    expectedResult: 'Prioritized list of issues to address'
  },
  {
    title: 'Use Remediation Links',
    description: 'Click the "Fix" or "Configure" button next to each issue',
    substeps: [
      'System navigates directly to the relevant configuration page',
      'Complete the required setup',
      'Return to Readiness panel to verify resolution'
    ],
    expectedResult: 'Issues resolved and readiness score improves'
  },
  {
    title: 'Verify Cycle Launch Eligibility',
    description: 'Confirm all critical requirements are met before creating cycles',
    substeps: [
      'All critical checks should show green status',
      'Warning items may be addressed post-launch',
      'Document any intentional exceptions'
    ],
    expectedResult: 'System allows cycle creation when readiness threshold met'
  }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Readiness score not updating after fixes',
    cause: 'Browser cache or delayed database sync.',
    solution: 'Refresh the page or wait 30 seconds for the readiness calculation to update. Changes are validated in real-time but UI may cache.'
  },
  {
    issue: 'Critical issue shows but configuration looks complete',
    cause: 'Specific validation criteria not met (e.g., score ranges have gaps).',
    solution: 'Click the issue to see detailed validation message. Common causes: overlapping ranges, missing weights totaling 100%, inactive records.'
  },
  {
    issue: 'Remediation link leads to empty page',
    cause: 'User lacks permission to access the target configuration page.',
    solution: 'Contact HR Admin to grant appropriate module permissions. The readiness panel shows all checks regardless of user access.'
  },
  {
    issue: 'Workforce Data shows incomplete despite all employees assigned',
    cause: 'Some employees may lack job assignments or active manager relationships.',
    solution: 'Use the Employee Master Data report to identify employees without positions or with vacant manager positions.'
  }
];

export function SetupReadiness() {
  return (
    <Card id="sec-2-readiness">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.18</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge variant="destructive">Required</Badge>
        </div>
        <CardTitle className="text-2xl">Appraisal Readiness</CardTitle>
        <CardDescription>
          Final validation dashboard before launching appraisal cycles - the system's pre-flight checklist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Readiness']} />

        <LearningObjectives
          objectives={[
            'Interpret the overall readiness score and category breakdowns',
            'Distinguish between critical errors and advisory warnings',
            'Use remediation links to quickly resolve configuration gaps',
            'Understand launch eligibility thresholds for appraisal cycles'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Access to Performance module with Setup permissions',
            'Familiarity with Core Framework and Appraisals Setup tabs'
          ]}
        />

        {/* What is Appraisal Readiness */}
        <div>
          <h4 className="font-medium mb-2">What is Appraisal Readiness?</h4>
          <p className="text-muted-foreground">
            The Appraisal Readiness panel is a pre-launch validation dashboard that checks whether your 
            organization has completed all necessary configuration before starting appraisal cycles. 
            Think of it as a <strong>pre-flight checklist</strong> that ensures rating scales are configured, 
            form templates are ready, employees are assigned to jobs, and managers are set up for evaluation workflows.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">AI-First Design</h4>
              <p className="text-sm text-foreground">
                The Readiness panel continuously monitors your configuration in real-time. As you complete 
                setup steps in other areas (Rating Scales, Form Templates, etc.), the readiness score 
                automatically updates to reflect your progress. No manual refresh required.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.1a.1: Appraisal Readiness dashboard with category cards and remediation links"
          alt="Appraisal Readiness panel showing overall score, category breakdowns, and action buttons"
        />

        {/* Readiness Categories */}
        <div>
          <h4 className="font-medium mb-3">Readiness Categories</h4>
          <p className="text-muted-foreground mb-4">
            The readiness check is organized into three main categories, each containing multiple validation items:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Core Framework</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Rating Scales configured</li>
                <li>• Overall Rating Scales defined</li>
                <li>• Competency framework populated</li>
                <li>• Performance Trends settings</li>
                <li>• Approval workflows active</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                  <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium">Appraisals Setup</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At least one Form Template</li>
                <li>• Rating Levels configured</li>
                <li>• Job Assessment weights valid</li>
                <li>• Outcome Rules defined</li>
                <li>• Notification templates ready</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">Workforce Data</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Employees assigned to jobs</li>
                <li>• Manager relationships defined</li>
                <li>• Active employment status</li>
                <li>• Job-competency mappings</li>
                <li>• Department structure complete</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <h4 className="font-medium mb-3">Understanding Status Indicators</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">Complete</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Requirement fully satisfied. No action needed.
              </p>
            </div>
            
            <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-700 dark:text-amber-400">Warning</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended configuration. Cycle can launch but functionality may be limited.
              </p>
            </div>
            
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700 dark:text-red-400">Critical</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Blocking issue. Must be resolved before launching appraisal cycles.
              </p>
            </div>
          </div>
        </div>

        <StepByStep steps={STEPS} title="Using the Readiness Panel: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <Separator />

        {/* Remediation Workflow */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Quick Fix Workflow</h4>
              <p className="text-sm text-foreground mt-1">
                Each incomplete item in the Readiness panel includes a direct "Fix" button:
              </p>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <div className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                  No Rating Levels
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300">
                  Click "Fix"
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-300">
                  Rating Levels Page
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300">
                  Configure & Save
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                After configuration, return to Readiness to verify the issue is resolved.
              </p>
            </div>
          </div>
        </div>

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

        <Separator />

        {/* Best Practices */}
        <div>
          <h4 className="font-medium mb-3">Best Practices</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Check Readiness at least 2 weeks before planned cycle launch date</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Address all Critical issues before creating the cycle - they cannot be fixed once the cycle is active</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use the Readiness panel as a training checklist for new HR administrators</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Export or screenshot the Readiness summary for audit documentation</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
