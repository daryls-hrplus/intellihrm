import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { Sparkles, CheckCircle, Link, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand how AI extracts development themes from feedback patterns',
  'Navigate the theme confirmation workflow',
  'Link confirmed themes to signals and IDP goals',
  'Manage AI-generated vs. manually created themes'
];

const themeFields: FieldDefinition[] = [
  {
    name: 'theme_code',
    required: false,
    type: 'text',
    description: 'System-generated or manual theme identifier',
    defaultValue: 'null',
    validation: 'Alphanumeric'
  },
  {
    name: 'theme_name',
    required: true,
    type: 'text',
    description: 'Display name for the development theme',
    defaultValue: '—',
    validation: 'Max 200 characters'
  },
  {
    name: 'theme_description',
    required: false,
    type: 'text',
    description: 'Detailed explanation of the theme and evidence',
    defaultValue: 'null',
    validation: 'Max 2000 characters'
  },
  {
    name: 'signal_ids',
    required: false,
    type: 'UUID[]',
    description: 'Linked talent signal snapshots that support this theme',
    defaultValue: '[]',
    validation: 'Valid signal IDs'
  },
  {
    name: 'confidence_score',
    required: false,
    type: 'decimal',
    description: 'AI confidence in theme accuracy (0-1)',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  },
  {
    name: 'ai_generated',
    required: true,
    type: 'boolean',
    description: 'Whether theme was AI-generated or manually created',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'is_confirmed',
    required: true,
    type: 'boolean',
    description: 'Whether theme has been confirmed by human reviewer',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'confirmed_by',
    required: false,
    type: 'UUID',
    description: 'User who confirmed the theme',
    defaultValue: 'null',
    validation: 'Valid user ID'
  }
];

const recommendationTypes = [
  { type: 'learning', icon: '📚', description: 'Formal training courses or certifications' },
  { type: 'experience', icon: '💼', description: 'On-the-job experiences and projects' },
  { type: 'mentoring', icon: '🤝', description: 'Mentorship from experienced colleagues' },
  { type: 'coaching', icon: '🎯', description: 'Professional coaching engagement' },
  { type: 'stretch_assignment', icon: '🚀', description: 'Challenging projects beyond comfort zone' }
];

const confirmationSteps: Step[] = [
  {
    title: 'Access Theme Review Panel',
    description: 'Navigate to the employee\'s 360 results and open the Development Themes tab.',
    substeps: [
      'Go to Performance → 360 Feedback → Cycles → [Cycle Name]',
      'Select the employee from results list',
      'Click the "Development Themes" tab'
    ],
    expectedResult: 'AI-generated themes displayed with confidence scores'
  },
  {
    title: 'Review Theme Evidence',
    description: 'Examine the signals and feedback that support each theme.',
    substeps: [
      'Click "View Evidence" on a theme card',
      'Review linked signals with their confidence scores',
      'Read sample feedback excerpts (anonymized)'
    ],
    expectedResult: 'Understanding of what data supports the theme'
  },
  {
    title: 'Confirm, Edit, or Reject Theme',
    description: 'Make a decision on each AI-generated theme.',
    substeps: [
      'For accurate themes: Click "Confirm Theme"',
      'For partially accurate: Click "Edit" to adjust name/description',
      'For inaccurate themes: Click "Reject" with reason'
    ],
    expectedResult: 'Theme status updated; action logged for audit'
  },
  {
    title: 'Link to IDP (Optional)',
    description: 'Connect confirmed themes to existing or new IDP goals.',
    substeps: [
      'Click "Link to IDP" on confirmed theme',
      'Select existing goal or create new goal',
      'Choose link type: derived, informed, or validated'
    ],
    expectedResult: 'Theme appears in employee IDP with 360 context'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'AI themes require human confirmation',
    enforcement: 'System',
    description: 'is_confirmed must be true before theme feeds downstream systems'
  },
  {
    rule: 'Confidence threshold for display',
    enforcement: 'Policy',
    description: 'Themes with confidence <0.5 are flagged for review but still shown'
  },
  {
    rule: 'Signal linkage is traceable',
    enforcement: 'System',
    description: 'signal_ids array maintains full audit trail to source data'
  },
  {
    rule: 'Rejection requires reason',
    enforcement: 'System',
    description: 'Rejected themes must have documented rejection_reason for AI improvement'
  },
  {
    rule: 'Manual themes skip confirmation',
    enforcement: 'System',
    description: 'Themes created manually (ai_generated=false) are auto-confirmed'
  }
];

export function AIDevelopmentThemeGeneration() {
  return (
    <section id="sec-5-3" data-manual-anchor="sec-5-3" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          5.3 Development Theme Generation
        </h3>
        <p className="text-muted-foreground mt-2">
          AI-powered extraction of development themes from feedback patterns with human confirmation workflows.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Theme Generation Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4" />
            Theme Generation Pipeline
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT THEME GENERATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐          │
│  │ Cycle          │────▶│ Signal         │────▶│ Pattern        │          │
│  │ Completed      │     │ Snapshots      │     │ Analysis       │          │
│  └────────────────┘     └────────────────┘     └───────┬────────┘          │
│                                                         │                   │
│                              ┌──────────────────────────┘                   │
│                              │                                               │
│                              ▼                                               │
│                     ┌────────────────────────────────────┐                  │
│                     │        AI THEME EXTRACTION         │                  │
│                     │  • Cluster similar signals         │                  │
│                     │  • Identify recurring patterns     │                  │
│                     │  • Generate theme descriptions     │                  │
│                     │  • Calculate confidence scores     │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│                                     ▼                                        │
│                     ┌────────────────────────────────────┐                  │
│                     │        development_themes          │                  │
│                     │  (ai_generated=true,               │                  │
│                     │   is_confirmed=false)              │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────┐            │
│          │                          │                          │            │
│          ▼                          ▼                          ▼            │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐      │
│  │   CONFIRM    │          │    EDIT      │          │   REJECT     │      │
│  │  (as-is)     │          │  (modify)    │          │  (with reason)│     │
│  └──────┬───────┘          └──────┬───────┘          └──────┬───────┘      │
│         │                         │                         │               │
│         └─────────────────────────┼─────────────────────────┘               │
│                                   │                                          │
│                                   ▼                                          │
│                     ┌────────────────────────────────────┐                  │
│                     │    development_recommendations     │                  │
│                     │  • learning                        │                  │
│                     │  • experience                      │                  │
│                     │  • mentoring / coaching            │                  │
│                     │  • stretch_assignment              │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│                                     ▼                                        │
│                     ┌────────────────────────────────────┐                  │
│                     │        IDP INTEGRATION             │                  │
│                     │  (idp_feedback_links)              │                  │
│                     └────────────────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Types */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Target className="h-4 w-4" />
          Recommendation Types
        </h4>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
          {recommendationTypes.map((r) => (
            <Card key={r.type}>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl mb-2">{r.icon}</div>
                <Badge variant="outline" className="mb-2">{r.type}</Badge>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Theme Confirmation Status */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4" />
            Theme Status Indicators
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-500">Pending</Badge>
                <span className="text-sm">AI-generated, awaiting confirmation</span>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">ai_generated=true, is_confirmed=false</code>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500">Confirmed</Badge>
                <span className="text-sm">Reviewed and approved by human</span>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">is_confirmed=true</code>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500">Manual</Badge>
                <span className="text-sm">Created manually by user</span>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">ai_generated=false</code>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-600">Linked</Badge>
                <span className="text-sm">Connected to IDP goal</span>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">idp_feedback_links exists</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={confirmationSteps} title="Theme Confirmation Workflow" />

      <FieldReferenceTable 
        fields={themeFields} 
        title="Development Theme Fields (development_themes)" 
      />

      <BusinessRules rules={businessRules} />

      {/* Tip Callout */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <Link className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Linking Best Practice</h5>
            <p className="text-sm text-muted-foreground mt-1">
              Themes consolidate patterns across multiple raters and cycles. Link themes to IDP goals 
              to create a clear development path with measurable progress tracking through remeasurement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
