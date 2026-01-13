import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Lightbulb, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Name', required: true, type: 'Text', description: 'Display name for the rating level (e.g., "Exceptional")', defaultValue: '—', validation: 'Max 50 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for reporting and integrations', defaultValue: 'Auto-generated', validation: 'Max 20 chars, unique' },
  { name: 'Description', required: false, type: 'Text', description: 'Explanation of what this rating level represents', defaultValue: '—', validation: 'Max 500 characters' },
  { name: 'Min Score', required: true, type: 'Decimal', description: 'Lower bound of the score range (inclusive)', defaultValue: '—', validation: 'Between 1.0 and 5.0' },
  { name: 'Max Score', required: true, type: 'Decimal', description: 'Upper bound of the score range (inclusive)', defaultValue: '—', validation: 'Between 1.0 and 5.0, > min_score' },
  { name: 'Color', required: true, type: 'Color', description: 'Visual indicator in dashboards, reports, and nine-box grid', defaultValue: 'System assigned', validation: 'Valid hex color' },
  { name: 'Display Order', required: true, type: 'Number', description: 'Sort order for display (1 = highest/best)', defaultValue: 'Sequential', validation: 'Unique positive integer' },
  { name: 'promotion_eligible', required: false, type: 'Boolean', description: 'Eligible for promotion consideration', defaultValue: 'false', validation: '—' },
  { name: 'succession_eligible', required: false, type: 'Boolean', description: 'Can be added to succession plans and talent pools', defaultValue: 'false', validation: '—' },
  { name: 'bonus_eligible', required: false, type: 'Boolean', description: 'Qualifies for bonus payout in compensation planning', defaultValue: 'false', validation: '—' },
  { name: 'requires_pip', required: false, type: 'Boolean', description: 'Triggers Performance Improvement Plan workflow', defaultValue: 'false', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether rating level is available for use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Rating Levels',
    description: 'Go to Performance → Setup → Appraisals → Rating Levels',
    expectedResult: 'Rating Levels page displays with existing levels for the company'
  },
  {
    title: 'Review Default Rating Levels',
    description: 'System provides 5 default levels that can be customized',
    substeps: [
      'Exceptional (4.5-5.0) - Green - Top performers',
      'Exceeds Expectations (3.5-4.49) - Blue - Above average',
      'Meets Expectations (2.5-3.49) - Yellow - Solid performers',
      'Needs Improvement (1.5-2.49) - Orange - Development required',
      'Unsatisfactory (1.0-1.49) - Red - Significant gaps'
    ],
    expectedResult: 'Understanding of default rating level structure'
  },
  {
    title: 'Configure Score Thresholds',
    description: 'Click Edit on a level to modify the score range',
    substeps: [
      'Set the Min Score (lower bound, inclusive)',
      'Set the Max Score (upper bound, inclusive)',
      'Ensure no gaps between levels (e.g., 3.49 → 3.5)',
      'Ensure no overlaps (each score maps to exactly one level)'
    ],
    expectedResult: 'Score ranges configured without gaps or overlaps'
  },
  {
    title: 'Set Eligibility Flags',
    description: 'Configure which downstream actions are triggered by each level',
    substeps: [
      'promotion_eligible: Check for levels that qualify for promotion consideration',
      'succession_eligible: Check for levels that can join succession plans',
      'bonus_eligible: Check for levels that receive performance bonuses',
      'requires_pip: Check for levels that should trigger a PIP workflow'
    ],
    expectedResult: 'Eligibility flags configured to automate talent decisions'
  },
  {
    title: 'Configure Color Coding',
    description: 'Select colors for visual identification in dashboards',
    substeps: [
      'Use intuitive colors (green = positive, red = attention needed)',
      'Ensure colors are distinguishable for accessibility',
      'Colors appear in nine-box grids, distribution charts, and reports'
    ],
    expectedResult: 'Color coding configured for visual consistency'
  },
  {
    title: 'Save and Validate',
    description: 'Save changes and verify configuration',
    substeps: [
      'System validates no overlapping score ranges',
      'System validates no gaps in score coverage (1.0 to 5.0)',
      'System validates at least one level is active',
      'Review the rating level list for accuracy'
    ],
    expectedResult: 'Rating levels saved and validated by the system'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard 5-Level System with Eligibility Flags',
    context: 'Traditional performance distribution with automated talent actions.',
    values: [
      { field: 'Exceptional (4.5-5.0)', value: 'Green | ✓ Promotion | ✓ Succession | ✓ Bonus' },
      { field: 'Exceeds (3.5-4.49)', value: 'Blue | ✓ Promotion | ✓ Succession | ✓ Bonus' },
      { field: 'Meets (2.5-3.49)', value: 'Yellow | | | ✓ Bonus' },
      { field: 'Needs Improvement (1.5-2.49)', value: 'Orange | | | ' },
      { field: 'Unsatisfactory (1.0-1.49)', value: 'Red | | | | ✓ PIP' }
    ],
    outcome: 'Clear performance differentiation with automated eligibility for talent programs.'
  },
  {
    title: 'Simplified 3-Level System',
    context: 'Streamlined approach for organizations avoiding forced distribution.',
    values: [
      { field: 'High Performer (4.0-5.0)', value: 'Green | ✓ Promotion | ✓ Succession | ✓ Bonus' },
      { field: 'Solid Performer (2.5-3.99)', value: 'Blue | | | ✓ Bonus' },
      { field: 'Needs Development (1.0-2.49)', value: 'Red | | | | ✓ PIP' }
    ],
    outcome: 'Simplified categorization focusing on growth-oriented feedback.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Score ranges cannot overlap', enforcement: 'System' as const, description: 'Each score value can only belong to one rating level. System prevents overlapping ranges.' },
  { rule: 'All scores must be covered (no gaps)', enforcement: 'System' as const, description: 'Gaps in rating ranges are not allowed; all scores from 1.0 to 5.0 must map to a level.' },
  { rule: 'At least one level required', enforcement: 'System' as const, description: 'System requires at least one active rating level for appraisal completion.' },
  { rule: 'Eligibility flags drive automation', enforcement: 'System' as const, description: 'Flags automatically enable/disable actions in Succession, Compensation, and PIP modules.' },
  { rule: 'Level changes affect historical reports', enforcement: 'Policy' as const, description: 'Modifying level ranges may impact historical distribution reporting. Document changes.' },
  { rule: 'Color consistency recommended', enforcement: 'Advisory' as const, description: 'Use consistent colors across the organization (green=positive, red=attention needed).' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Overlapping range error when saving',
    cause: 'The score range overlaps with another existing rating level.',
    solution: 'Review all level ranges and ensure no overlap. Each score must map to exactly one level. Adjust boundaries (e.g., 3.49 for one level, 3.5 for the next).'
  },
  {
    issue: 'Gap in coverage warning',
    cause: 'There is a score range not covered by any rating level.',
    solution: 'Extend an existing level range or create a new level to cover the gap. All scores from 1.0 to 5.0 must be covered.'
  },
  {
    issue: 'Rating level not appearing in reports',
    cause: 'Level is inactive or no employees fall within its score range.',
    solution: 'Ensure the level is active. Check if the score range is realistic for your rating distribution.'
  },
  {
    issue: 'Eligibility flags not triggering actions',
    cause: 'Downstream module (Succession, Compensation, PIP) is not configured to read flags.',
    solution: 'Verify Integration Rules (Section 2.9) are configured to use rating level eligibility flags for automated actions.'
  },
  {
    issue: 'PIP not initiated for low performers',
    cause: 'requires_pip flag not set, or PIP module not enabled.',
    solution: 'Check that requires_pip is enabled for the lowest rating level(s). Verify PIP module is active in system settings.'
  }
];

export function SetupPerformanceCategories() {
  return (
    <Card id="sec-2-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.7</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Rating Levels Configuration</CardTitle>
        <CardDescription>
          Map overall appraisal scores to rating labels, colors, and eligibility flags for automated talent actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Rating Levels']} />

        <LearningObjectives
          objectives={[
            'Understand how rating levels map scores to meaningful labels',
            'Configure score thresholds without gaps or overlaps',
            'Set eligibility flags for automated talent decisions',
            'Customize colors for visual dashboards and reports'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Overall rating scales configured (Section 2.3)',
            'Understanding of desired performance distribution'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Rating Levels?</h4>
          <p className="text-muted-foreground">
            Rating levels translate numeric overall appraisal scores into meaningful labels like 
            "Exceptional" or "Needs Improvement." They drive analytics, distribution reports, 
            calibration discussions, and can automatically trigger downstream actions such as 
            promotion eligibility, succession planning, bonus qualification, or PIP initiation.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-purple-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Rating Level Design Tip</h4>
              <p className="text-sm text-foreground">
                Use positive, growth-oriented language. "Developing Performer" is more constructive 
                than "Below Average." Rating levels should guide development conversations, not just label employees.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.7.1: Rating Levels configuration with score ranges, colors, and eligibility flags"
          alt="Rating Levels setup page"
        />

        {/* Eligibility Flags Section */}
        <div>
          <h4 className="font-medium mb-3">Eligibility Flags - Automated Talent Actions</h4>
          <p className="text-muted-foreground mb-4">
            Eligibility flags enable automatic downstream actions when an employee receives a specific rating level:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">promotion_eligible</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enables "Recommend for Promotion" action. Employee appears in promotion-ready reports.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="font-medium">succession_eligible</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Allows addition to succession pools and talent pipelines. Powers nine-box placement.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                <span className="font-medium">bonus_eligible</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Includes employee in compensation planning bonus pools. May affect merit increase calculations.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium">requires_pip</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Triggers Performance Improvement Plan workflow. Creates PIP task for manager with templates.
              </p>
            </div>
          </div>
        </div>

        {/* Example Configuration Table */}
        <div>
          <h4 className="font-medium mb-3">Example: Standard 5-Level Configuration</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Level</th>
                  <th className="text-left p-3 font-medium">Score Range</th>
                  <th className="text-center p-3 font-medium">Promotion</th>
                  <th className="text-center p-3 font-medium">Succession</th>
                  <th className="text-center p-3 font-medium">Bonus</th>
                  <th className="text-center p-3 font-medium">PIP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { level: 'Exceptional', range: '4.50 - 5.00', color: 'bg-green-500', promo: true, succ: true, bonus: true, pip: false },
                  { level: 'Exceeds Expectations', range: '3.50 - 4.49', color: 'bg-blue-500', promo: true, succ: true, bonus: true, pip: false },
                  { level: 'Meets Expectations', range: '2.50 - 3.49', color: 'bg-yellow-500', promo: false, succ: false, bonus: true, pip: false },
                  { level: 'Needs Improvement', range: '1.50 - 2.49', color: 'bg-orange-500', promo: false, succ: false, bonus: false, pip: false },
                  { level: 'Unsatisfactory', range: '1.00 - 1.49', color: 'bg-red-500', promo: false, succ: false, bonus: false, pip: true },
                ].map((row) => (
                  <tr key={row.level} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${row.color}`} />
                        <span className="font-medium">{row.level}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{row.range}</td>
                    <td className="p-3 text-center">{row.promo ? '✓' : ''}</td>
                    <td className="p-3 text-center">{row.succ ? '✓' : ''}</td>
                    <td className="p-3 text-center">{row.bonus ? '✓' : ''}</td>
                    <td className="p-3 text-center">{row.pip ? '✓' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <StepByStep steps={STEPS} title="Configuring Rating Levels: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <Separator />

        {/* Downstream Integration */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Downstream Integration</h4>
              <p className="text-sm text-foreground mt-1">
                Rating levels with eligibility flags integrate with other modules:
              </p>
              <ul className="mt-2 text-sm space-y-1 text-foreground">
                <li>• <strong>Nine-Box Grid:</strong> Uses rating level for Performance axis placement</li>
                <li>• <strong>Succession Planning:</strong> succession_eligible controls pool access</li>
                <li>• <strong>Compensation:</strong> bonus_eligible affects merit and bonus calculations</li>
                <li>• <strong>PIP Module:</strong> requires_pip triggers improvement workflow</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Configure Integration Rules (Section 2.9) to fully enable these automations.
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
