import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Link, ExternalLink, BookOpen } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  BusinessRules,
  ScreenshotPlaceholder,
  PrerequisiteAlert,
  TipCallout,
  InfoCallout,
  IntegrationCallout
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Include Goals', required: false, type: 'Boolean', description: 'Enable goal scoring in appraisal forms', defaultValue: 'true', validation: '—' },
  { name: 'Goals Weight', required: true, type: 'Number', description: 'Weight of goals in CRGV calculation', defaultValue: '40', validation: '0-100%' },
  { name: 'Link Goal Cycle', required: true, type: 'Select', description: 'Which goal cycle to pull goals from', defaultValue: 'Current Active', validation: '—' },
  { name: 'Include Goal Rating', required: true, type: 'Boolean', description: 'Allow managers to rate individual goals', defaultValue: 'true', validation: '—' },
  { name: 'Show Goal Progress', required: false, type: 'Boolean', description: 'Display goal completion % in appraisal form', defaultValue: 'true', validation: '—' },
  { name: 'Auto-Calculate from Progress', required: false, type: 'Boolean', description: 'Derive goal score from tracked progress %', defaultValue: 'false', validation: '—' },
];

const BUSINESS_RULES = [
  { rule: 'Goals module must be enabled for integration', enforcement: 'System' as const, description: 'Cannot link goals to appraisals if Goals module is not active.' },
  { rule: 'Goal cycle must overlap with appraisal period', enforcement: 'System' as const, description: 'Only goals from cycles that overlap the appraisal period can be linked.' },
  { rule: 'Goals appear read-only in appraisal form', enforcement: 'System' as const, description: 'Goal details are pulled from Goals module; editing happens in Goals module.' },
  { rule: 'Goal score contributes to overall CRGV', enforcement: 'System' as const, description: 'Weighted goal score is included in final appraisal calculation.' }
];

export function SetupGoalsIntegration() {
  return (
    <Card id="sec-2-16">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.16</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~8 min read
          </Badge>
          <Badge variant="secondary">Reference</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="h-6 w-6 text-orange-500" />
          Goals Integration Settings
        </CardTitle>
        <CardDescription>
          Configure how goals from the Goals module integrate into appraisal forms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Goals Integration']} />

        <LearningObjectives
          objectives={[
            'Understand how Goals module integrates with Appraisals',
            'Configure goals weight in CRGV model',
            'Link goal cycles to appraisal cycles',
            'Know when to reference the Goals Manual for details'
          ]}
        />

        <IntegrationCallout title="Goals Module Integration">
          <p>
            The Goals module is a separate, standalone module with its own administrator manual. 
            This section covers only the <strong>integration points</strong> between Goals and Appraisals. 
            For comprehensive goal management documentation, see the <strong>Goals Administrator Manual</strong>.
          </p>
        </IntegrationCallout>

        <PrerequisiteAlert
          items={[
            'Goals module enabled and configured',
            'Active goal cycle created in Goals module',
            'Appraisal cycle created (Section 2.6)',
            'Goals Administrator Manual reviewed for goal setup'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            How Goals Integrate with Appraisals
          </h4>
          <p className="text-muted-foreground">
            Goals from the Goals module can optionally be included in appraisal forms as part of 
            the CRGV scoring model. When enabled, employee goals and their progress are displayed 
            in the appraisal form, and managers can rate goal achievement as part of the evaluation.
          </p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">Data Flow: Goals → Appraisals</h4>
          <div className="flex items-center gap-4 overflow-x-auto py-2">
            <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[100px]">
              <Target className="h-6 w-6 mx-auto mb-1 text-orange-500" />
              <p className="text-xs font-medium">Goals Module</p>
              <p className="text-xs text-muted-foreground">Goal Cycle</p>
            </div>
            <div className="flex-shrink-0 text-2xl text-muted-foreground">→</div>
            <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[100px]">
              <p className="text-xs font-medium">Goals & Progress</p>
              <p className="text-xs text-muted-foreground">Pulled into form</p>
            </div>
            <div className="flex-shrink-0 text-2xl text-muted-foreground">→</div>
            <div className="flex-shrink-0 p-3 bg-background rounded-lg border text-center min-w-[100px]">
              <p className="text-xs font-medium">Manager Rates</p>
              <p className="text-xs text-muted-foreground">Goal Achievement</p>
            </div>
            <div className="flex-shrink-0 text-2xl text-muted-foreground">→</div>
            <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg border-2 border-primary text-center min-w-[100px]">
              <p className="text-xs font-medium">Goal Score</p>
              <p className="text-xs text-muted-foreground">→ CRGV Total</p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.16.1: Goals section in appraisal form showing linked goals and progress"
          alt="Goals integration in appraisal form"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Integration Configuration Fields" />

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Goals Manual References
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            For detailed information on the following topics, refer to the <strong>Goals Administrator Manual</strong>:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-blue-600" />
              <span><strong>Goal Cycle Configuration</strong> – Creating and managing goal cycles</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-blue-600" />
              <span><strong>Goal Approval Workflows</strong> – Multi-level approval chain setup</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-blue-600" />
              <span><strong>Check-In Cadence</strong> – Configuring regular goal check-ins</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-blue-600" />
              <span><strong>Goal Rating & Disputes</strong> – Rating workflows within the Goals module</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-blue-600" />
              <span><strong>Strategic Alignment</strong> – Cascading goals from organizational objectives</span>
            </li>
          </ul>
        </div>

        <TipCallout title="Integration Best Practice">
          Ensure goal cycle end dates are before or during the appraisal evaluation window. 
          This allows accurate goal achievement scores to be included in appraisals.
        </TipCallout>

        <InfoCallout title="When Goals Are Not Included">
          If goals are not part of your appraisal model (e.g., for certain job families), 
          set Goals Weight to 0% and disable "Include Goals" in the cycle settings. The 
          remaining weights (C, R, V) will be redistributed proportionally.
        </InfoCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
