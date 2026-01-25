import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { BookOpen, Link, Target, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Link AI-generated themes to IDP goals',
  'Understand the three link types: derived, informed, validated',
  'Access AI-recommended learning resources',
  'Track development progress from 360 insights'
];

const linkTypes = [
  {
    type: 'derived',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Auto-created from high-confidence themes',
    example: 'Theme "Communication Development" → New IDP goal auto-created',
    approval: 'Requires employee confirmation',
    icon: '🤖'
  },
  {
    type: 'informed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Employee links confirmed theme to existing goal',
    example: 'Theme "Leadership" linked to existing "Prepare for Manager Role" goal',
    approval: 'Employee-initiated',
    icon: '👤'
  },
  {
    type: 'validated',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'HR/Manager approves theme-to-goal linkage',
    example: 'HR confirms theme appropriately linked for development planning',
    approval: 'HR or Manager approval',
    icon: '✓'
  }
];

const idpLinkFields: FieldDefinition[] = [
  {
    name: 'idp_id',
    required: false,
    type: 'UUID',
    description: 'Reference to the IDP (Individual Development Plan)',
    defaultValue: 'null',
    validation: 'Valid IDP ID'
  },
  {
    name: 'idp_item_id',
    required: false,
    type: 'UUID',
    description: 'Reference to specific goal within the IDP',
    defaultValue: 'null',
    validation: 'Valid IDP item ID'
  },
  {
    name: 'source_theme_id',
    required: false,
    type: 'UUID',
    description: 'Development theme that generated this link',
    defaultValue: 'null',
    validation: 'Valid theme ID'
  },
  {
    name: 'source_cycle_id',
    required: false,
    type: 'UUID',
    description: '360 cycle that produced the theme',
    defaultValue: 'null',
    validation: 'Valid cycle ID'
  },
  {
    name: 'link_type',
    required: true,
    type: 'enum',
    description: 'How the link was created: derived, informed, validated',
    defaultValue: 'informed',
    validation: 'Valid link type'
  }
];

const linkingSteps: Step[] = [
  {
    title: 'Review Confirmed Development Theme',
    description: 'Start from a confirmed theme in your 360 results.',
    substeps: [
      'Navigate to ESS → 360 Feedback → My Results → Development Themes',
      'Select a confirmed theme (is_confirmed=true)',
      'Click "Link to IDP" button'
    ],
    expectedResult: 'IDP linking dialog opens'
  },
  {
    title: 'Choose Link Approach',
    description: 'Decide whether to link to existing goal or create new.',
    substeps: [
      'To link to existing: Select goal from dropdown',
      'To create new: Click "Create New Goal from Theme"',
      'AI pre-populates goal details from theme'
    ],
    expectedResult: 'Goal selected or new goal form populated'
  },
  {
    title: 'Review Learning Recommendations',
    description: 'See AI-suggested learning resources.',
    substeps: [
      'Review recommended courses linked to theme',
      'Check learning paths for progressive skill building',
      'Select resources to add to goal'
    ],
    expectedResult: 'Learning resources attached to IDP goal'
  },
  {
    title: 'Confirm and Save Link',
    description: 'Finalize the theme-to-IDP connection.',
    substeps: [
      'Review link summary',
      'Add optional notes for context',
      'Click "Save Link"'
    ],
    expectedResult: 'Theme linked; visible in IDP with 360 context badge'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Themes must be confirmed before linking',
    enforcement: 'System',
    description: 'Only is_confirmed=true themes can be linked to IDP goals'
  },
  {
    rule: 'Derived links require confirmation',
    enforcement: 'System',
    description: 'Auto-derived links are flagged for employee review before activation'
  },
  {
    rule: 'Links maintain audit trail',
    enforcement: 'System',
    description: 'Full history of theme→goal linkage preserved for compliance'
  },
  {
    rule: 'Learning recommendations are optional',
    enforcement: 'Policy',
    description: 'Employees can skip AI-recommended courses and add their own'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot link theme to IDP',
    cause: 'Theme not confirmed or IDP not active',
    solution: 'Ensure theme is_confirmed=true and you have an active IDP in the system.'
  },
  {
    issue: 'No learning recommendations shown',
    cause: 'Theme not mapped to competencies with linked courses',
    solution: 'Ask HR to verify competency→course mappings in LMS integration settings.'
  },
  {
    issue: 'Link not appearing in IDP',
    cause: 'IDP may need refresh or link pending approval',
    solution: 'Refresh IDP page; for validated links, check if approval is pending.'
  }
];

export function AIIDPLearningIntegration() {
  return (
    <section id="sec-5-9" data-manual-anchor="sec-5-9" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          5.9 IDP & Learning Integration
        </h3>
        <p className="text-muted-foreground mt-2">
          Connecting AI-generated development themes to Individual Development Plans with learning recommendations.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Integration Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Link className="h-4 w-4" />
            Theme to IDP Integration Flow
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THEME → IDP → LEARNING INTEGRATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Confirmed      │                                                         │
│  │ Development    │                                                         │
│  │ Theme          │                                                         │
│  └───────┬────────┘                                                         │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                    LINK TYPE SELECTION                          │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │        │
│  │  │   DERIVED    │  │   INFORMED   │  │   VALIDATED  │         │        │
│  │  │ (Auto-create)│  │ (User-link)  │  │ (HR-approve) │         │        │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │        │
│  └───────────────────────────┬────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │              IDP_FEEDBACK_LINKS                                 │        │
│  │  • idp_id, idp_item_id                                         │        │
│  │  • source_theme_id, source_cycle_id                            │        │
│  │  • link_type                                                    │        │
│  └───────────────────────────┬────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │              AI LEARNING RECOMMENDATIONS                        │        │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │        │
│  │  │ Linked Courses │  │ Learning Paths │  │ Mentoring      │   │        │
│  │  │ from LMS       │  │ for Progression│  │ Suggestions    │   │        │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │        │
│  └───────────────────────────┬────────────────────────────────────┘        │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                IDP GOAL WITH 360 CONTEXT                        │        │
│  │  • Development goal with theme linkage                         │        │
│  │  • Associated learning resources                               │        │
│  │  • Progress tracking via remeasurement                         │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Link Types */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Target className="h-4 w-4" />
          Link Types Explained
        </h4>
        <div className="space-y-4">
          {linkTypes.map((lt) => (
            <Card key={lt.type}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{lt.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={lt.color}>{lt.type}</Badge>
                      <span className="text-sm text-muted-foreground">{lt.approval}</span>
                    </div>
                    <p className="text-sm mb-2">{lt.description}</p>
                    <div className="p-2 bg-muted rounded text-xs italic">
                      Example: {lt.example}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Recommendations Preview */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4" />
            AI Learning Recommendations (Example)
          </h4>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Effective Communication for Leaders</p>
                  <p className="text-xs text-muted-foreground">Course • 4 hours • High relevance</p>
                </div>
              </div>
              <Badge variant="outline">Recommended</Badge>
            </div>
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Leadership Communication Path</p>
                  <p className="text-xs text-muted-foreground">Learning Path • 5 courses • 12 hours total</p>
                </div>
              </div>
              <Badge variant="outline">Suggested</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={linkingSteps} title="Linking a Theme to IDP" />

      <FieldReferenceTable 
        fields={idpLinkFields} 
        title="IDP Feedback Link Fields (idp_feedback_links)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection items={troubleshootingItems} />
    </section>
  );
}
