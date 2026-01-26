import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { MessageSquare, Lightbulb, Target, TrendingUp, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const coachingPromptFields: FieldDefinition[] = [
  {
    name: 'prompt_category',
    required: true,
    type: 'enum',
    description: 'Category: strength, development, blind_spot, exploration',
    defaultValue: '—',
    validation: 'Valid category'
  },
  {
    name: 'prompt_text',
    required: true,
    type: 'text',
    description: 'The AI-generated coaching question or conversation starter',
    defaultValue: '—',
    validation: 'Non-empty'
  },
  {
    name: 'source_theme_id',
    required: false,
    type: 'UUID',
    description: 'Link to development_themes that generated this prompt',
    defaultValue: 'null',
    validation: 'Valid theme ID'
  },
  {
    name: 'source_signal_ids',
    required: false,
    type: 'UUID[]',
    description: 'Array of talent signals used to generate the prompt',
    defaultValue: '[]',
    validation: 'Array of UUIDs'
  },
  {
    name: 'confidence_score',
    required: false,
    type: 'decimal',
    description: 'AI confidence in prompt relevance (0-1)',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  },
  {
    name: 'is_starred',
    required: false,
    type: 'boolean',
    description: 'Manager saved this prompt for use',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'is_used',
    required: false,
    type: 'boolean',
    description: 'Manager used this prompt in a coaching conversation',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'manager_notes',
    required: false,
    type: 'text',
    description: 'Manager notes from coaching conversation',
    defaultValue: 'null',
    validation: 'Free text'
  }
];

const learningObjectives = [
  'Understand the four categories of coaching prompts',
  'Access and use AI-generated coaching prompts',
  'Link prompts to specific themes and signals',
  'Customize prompts for individual coaching conversations'
];

const promptCategories = [
  {
    category: 'strength',
    icon: '💪',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Build on confirmed areas of excellence',
    examples: [
      'Your team rates your collaboration highly. How might you mentor others to develop this skill?',
      'Multiple raters noted your strategic thinking. What stretch opportunities could leverage this strength?'
    ]
  },
  {
    category: 'development',
    icon: '📈',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    description: 'Address areas needing growth',
    examples: [
      'Communication was flagged as a development area. What specific situations feel most challenging?',
      'Feedback suggests delegation could improve. What holds you back from delegating more?'
    ]
  },
  {
    category: 'blind_spot',
    icon: '👁️',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'Explore self-other perception gaps',
    examples: [
      'You rated yourself higher on strategic thinking than others did. What might explain this gap?',
      'There\'s a difference between your view and your team\'s on approachability. Can we explore this?'
    ]
  },
  {
    category: 'exploration',
    icon: '🔍',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Open-ended discovery questions',
    examples: [
      'Looking at this feedback overall, what surprised you most?',
      'If you could focus on one area for the next quarter, what would have the biggest impact?'
    ]
  }
];

const usageSteps: Step[] = [
  {
    title: 'Access Coaching Prompts Panel',
    description: 'Navigate to the employee\'s 360 results as their manager.',
    substeps: [
      'Go to MSS → Team → 360 Feedback Results',
      'Select the employee whose results you want to review',
      'Click the "Coaching Prompts" tab in the results view'
    ],
    expectedResult: 'AI-generated prompts organized by category'
  },
  {
    title: 'Review Prompt Context',
    description: 'Understand what data generated each prompt.',
    substeps: [
      'Click "View Context" on any prompt',
      'Review the linked signals/themes that generated it',
      'Note the confidence score and evidence count'
    ],
    expectedResult: 'Understanding of why this prompt was suggested'
  },
  {
    title: 'Select Prompts for Meeting',
    description: 'Choose relevant prompts for your coaching conversation.',
    substeps: [
      'Star prompts you want to use',
      'Optionally customize the wording',
      'Export to meeting notes or calendar invite'
    ],
    expectedResult: 'Prepared conversation starters for 1:1'
  },
  {
    title: 'Document Conversation Outcomes',
    description: 'Record insights from the coaching discussion.',
    substeps: [
      'After the 1:1, return to the prompts panel',
      'Click "Add Note" on used prompts',
      'Record key insights, commitments, and next steps'
    ],
    expectedResult: 'Coaching conversation documented for follow-up'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'No coaching prompts generated',
    cause: 'Cycle results not yet processed or insufficient data',
    solution: 'Verify cycle status is Completed and results have been processed. Minimum data required for prompt generation.'
  },
  {
    issue: 'Prompts seem generic',
    cause: 'Low confidence signals or limited feedback depth',
    solution: 'Prompts are generated from available data. Consider adding context manually or waiting for more feedback cycles.'
  },
  {
    issue: 'Cannot see prompts for my direct report',
    cause: 'Results not released to managers yet',
    solution: 'Contact HR to confirm results release status. Managers only see prompts after manager-level release.'
  }
];

export function AICoachingPromptsGeneration() {
  return (
    <section id="sec-5-8" data-manual-anchor="sec-5-8" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          5.8 Coaching Prompts Generation
        </h3>
        <p className="text-muted-foreground mt-2">
          AI-generated conversation starters for managers based on feedback themes, signals, and blind spots.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          MSS → Team → 360 Feedback Results → [Employee] → Coaching Prompts
        </span>
      </div>

      {/* Prompt Generation Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4" />
            Prompt Generation Logic
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COACHING PROMPT GENERATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐          │
│  │ Development    │     │ Blind Spot     │     │ Talent Signal  │          │
│  │ Themes         │     │ Analysis       │     │ Snapshots      │          │
│  └───────┬────────┘     └───────┬────────┘     └───────┬────────┘          │
│          │                      │                      │                    │
│          └──────────────────────┼──────────────────────┘                    │
│                                 │                                            │
│                                 ▼                                            │
│                     ┌────────────────────────────────────┐                  │
│                     │       AI PROMPT GENERATOR          │                  │
│                     │  • Match theme to prompt template  │                  │
│                     │  • Personalize with context        │                  │
│                     │  • Assign category                 │                  │
│                     │  • Link to source signals          │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────┐            │
│          │               │               │               │      │            │
│          ▼               ▼               ▼               ▼      │            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │  STRENGTH    │ │ DEVELOPMENT  │ │  BLIND SPOT  │ │ EXPLORATION  │       │
│  │  PROMPTS     │ │   PROMPTS    │ │   PROMPTS    │ │   PROMPTS    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                                              │
│                                 │                                            │
│                                 ▼                                            │
│                     ┌────────────────────────────────────┐                  │
│                     │      MANAGER COACHING PANEL        │                  │
│                     │  • Review and select prompts       │                  │
│                     │  • Customize wording               │                  │
│                     │  • Export to meeting notes         │                  │
│                     │  • Document outcomes               │                  │
│                     └────────────────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Categories */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Target className="h-4 w-4" />
          Prompt Categories
        </h4>
        <div className="space-y-4">
          {promptCategories.map((cat) => (
            <Card key={cat.category}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{cat.icon}</span>
                  <Badge className={cat.color}>{cat.category}</Badge>
                  <span className="text-sm text-muted-foreground">{cat.description}</span>
                </div>
                <div className="space-y-2">
                  {cat.examples.map((ex, i) => (
                    <div key={i} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm italic">"{ex}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Example Prompt Card */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Example: Coaching Prompt Card (UI View)</h4>
          <div className="border-2 border-dashed rounded-lg p-4 bg-muted/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <Badge className="bg-amber-100 text-amber-800">development</Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">⭐ Save</Badge>
                <Badge variant="outline" className="text-xs">✏️ Edit</Badge>
              </div>
            </div>
            <p className="text-sm mb-3">
              "Feedback suggests communication with stakeholders could be clearer. 
              What specific situations feel most challenging for you?"
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Based on: Communication theme (confidence: 0.82)</span>
            </div>
            <div className="mt-3 pt-3 border-t">
              <button className="text-xs text-primary hover:underline">
                View Source Signals →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={usageSteps} title="Using Coaching Prompts" />

      <FieldReferenceTable 
        fields={coachingPromptFields} 
        title="Coaching Prompts Fields (feedback_coaching_prompts)" 
      />

      {/* Database Note */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/50">
        <Database className="h-4 w-4 text-green-600" />
        <AlertTitle>Database Architecture</AlertTitle>
        <AlertDescription>
          Coaching prompts are stored in the <code className="bg-green-100 dark:bg-green-900 px-1 rounded text-xs">feedback_coaching_prompts</code> table 
          with full traceability to source themes and signals. Manager interactions (starring, using, noting) 
          are tracked for analytics on prompt effectiveness and adoption rates.
        </AlertDescription>
      </Alert>

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Tip Callout */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Prompts Are Conversation Starters, Not Scripts</h5>
            <p className="text-sm text-muted-foreground mt-1">
              AI-generated prompts provide a starting point for coaching conversations. Adapt the 
              wording to your relationship with the employee and the specific context of your discussion. 
              The best coaching happens when prompts lead to genuine exploration, not checklist completion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
