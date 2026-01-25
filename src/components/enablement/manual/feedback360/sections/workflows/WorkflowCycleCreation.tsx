import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { PlusCircle, Calendar, Users, Settings, FileQuestion } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Create and configure a new 360 feedback cycle from scratch or template',
  'Set appropriate timelines for nomination and feedback phases',
  'Configure rater types (Self, Manager, Peer, Direct Report, External)',
  'Apply cycle-specific options like anonymity and comment requirements',
  'Link cycles to competency frameworks and question sets'
];

const CREATION_DIAGRAM = `
flowchart TD
    subgraph Setup["Initial Setup"]
        A[Start: Create Cycle] --> B{From Template?}
        B -->|Yes| C[Select Template]
        B -->|No| D[Blank Configuration]
        C --> E[Basic Information]
        D --> E
    end
    
    subgraph Config["Configuration"]
        E --> F[Set Cycle Name & Description]
        F --> G[Configure Timeline]
        G --> H[Select Rater Types]
        H --> I[Configure Options]
        I --> J[Link Framework & Questions]
    end
    
    subgraph Validation["Pre-Launch Validation"]
        J --> K{All Required Fields?}
        K -->|No| L[Show Validation Errors]
        L --> E
        K -->|Yes| M{Participants Added?}
        M -->|No| N[Add Participants]
        N --> M
        M -->|Yes| O[Ready to Launch]
    end
    
    subgraph Launch["Launch"]
        O --> P[Preview & Confirm]
        P --> Q[Launch Cycle]
        Q --> R[Active Status]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style R fill:#10b981,stroke:#059669,color:#fff
    style L fill:#f59e0b,stroke:#d97706
`;

const CYCLE_TYPES = [
  {
    type: 'Standard 360',
    description: 'Full multi-rater feedback with all rater categories',
    raters: ['Self', 'Manager', 'Peers', 'Direct Reports'],
    useCase: 'Leadership development, comprehensive performance review'
  },
  {
    type: 'Manager/Leadership 360',
    description: 'Focused on leadership competencies with upward feedback emphasis',
    raters: ['Self', 'Manager', 'Direct Reports', 'Skip-Level'],
    useCase: 'Manager development programs, succession planning'
  },
  {
    type: 'Peer Only',
    description: 'Collaborative feedback from colleagues at same level',
    raters: ['Self', 'Peers'],
    useCase: 'Team building, project retrospectives'
  },
  {
    type: 'Upward Feedback',
    description: 'Direct reports provide feedback on their manager',
    raters: ['Direct Reports'],
    useCase: 'Manager effectiveness assessment, anonymous upward feedback'
  }
];

const TIMELINE_FIELDS: FieldDefinition[] = [
  {
    name: 'name',
    required: true,
    type: 'string',
    description: 'Display name for the cycle (e.g., "Q2 2024 Leadership 360")',
    defaultValue: '—',
    validation: 'Max 100 characters, must be unique per company'
  },
  {
    name: 'description',
    required: false,
    type: 'text',
    description: 'Purpose and context for participants',
    defaultValue: '—',
    validation: 'Max 500 characters'
  },
  {
    name: 'start_date',
    required: true,
    type: 'date',
    description: 'When the cycle becomes active and nominations open',
    defaultValue: '—',
    validation: 'Must be future date'
  },
  {
    name: 'end_date',
    required: true,
    type: 'date',
    description: 'Deadline for all feedback submissions',
    defaultValue: '—',
    validation: 'Must be after start_date'
  },
  {
    name: 'nomination_window_start',
    required: false,
    type: 'date',
    description: 'When peer nomination opens (if enabled)',
    defaultValue: 'Same as start_date',
    validation: 'Must be on or after start_date'
  },
  {
    name: 'nomination_window_end',
    required: false,
    type: 'date',
    description: 'Deadline for peer nominations',
    defaultValue: '7 days after start',
    validation: 'Must be before response window'
  },
  {
    name: 'response_window_start',
    required: false,
    type: 'date',
    description: 'When feedback submission opens',
    defaultValue: 'After nomination_window_end',
    validation: 'Must be after nominations if enabled'
  },
  {
    name: 'response_window_end',
    required: true,
    type: 'date',
    description: 'Final deadline for feedback submission',
    defaultValue: 'Same as end_date',
    validation: 'Must be on or before end_date'
  },
  {
    name: 'results_release_date',
    required: false,
    type: 'date',
    description: 'Scheduled date for automatic results release',
    defaultValue: 'Manual release',
    validation: 'Must be after end_date'
  }
];

const OPTIONS_FIELDS: FieldDefinition[] = [
  {
    name: 'allow_peer_nomination',
    required: true,
    type: 'boolean',
    description: 'Whether employees can nominate their own peer raters',
    defaultValue: 'true',
    validation: '—'
  },
  {
    name: 'require_manager_approval',
    required: true,
    type: 'boolean',
    description: 'Manager must approve peer nominations before requests are created',
    defaultValue: 'true',
    validation: '—'
  },
  {
    name: 'min_peer_reviewers',
    required: true,
    type: 'integer',
    description: 'Minimum number of peer raters required per participant',
    defaultValue: '3',
    validation: '1-10'
  },
  {
    name: 'max_peer_reviewers',
    required: true,
    type: 'integer',
    description: 'Maximum number of peer raters allowed per participant',
    defaultValue: '5',
    validation: 'Must be >= min_peer_reviewers'
  },
  {
    name: 'hide_rating_points',
    required: true,
    type: 'boolean',
    description: 'Hide numerical scores from employees, show only labels',
    defaultValue: 'false',
    validation: '—'
  },
  {
    name: 'exclude_self_from_average',
    required: true,
    type: 'boolean',
    description: 'Exclude self-assessment from overall average calculation',
    defaultValue: 'true',
    validation: '—'
  },
  {
    name: 'require_comments',
    required: true,
    type: 'boolean',
    description: 'Make text comments mandatory for all questions',
    defaultValue: 'false',
    validation: '—'
  },
  {
    name: 'anonymity_threshold',
    required: true,
    type: 'integer',
    description: 'Minimum responses per category before showing breakdown',
    defaultValue: '3',
    validation: '2-5'
  },
  {
    name: 'allow_external_raters',
    required: true,
    type: 'boolean',
    description: 'Enable customer/vendor feedback collection',
    defaultValue: 'false',
    validation: '—'
  }
];

const STEPS: Step[] = [
  {
    title: 'Access Cycle Creation',
    description: 'Navigate to the 360 Feedback module and initiate cycle creation.',
    substeps: [
      'Go to Performance → 360 Feedback → Cycles',
      'Click "Create Cycle" button in the header',
      'Choose "New Cycle" or "From Template"',
      'If from template, select the template to use'
    ],
    expectedResult: 'Cycle creation dialog opens with default or template values'
  },
  {
    title: 'Configure Basic Information',
    description: 'Set the cycle name, description, and purpose.',
    substeps: [
      'Enter a descriptive cycle name (e.g., "Q2 2024 Leadership 360")',
      'Add context in the description field for participants',
      'Select the cycle type (Standard, Leadership, Peer Only, Upward)',
      'Choose the target population scope'
    ],
    expectedResult: 'Basic information section complete with clear naming'
  },
  {
    title: 'Set Timeline Configuration',
    description: 'Define the key dates for the feedback cycle.',
    substeps: [
      'Set start date (when cycle becomes active)',
      'Set nomination window if peer nomination enabled (typically 1-2 weeks)',
      'Set response window start and end dates (typically 3-4 weeks)',
      'Optionally set auto-release date for results',
      'Review timeline summary visualization'
    ],
    expectedResult: 'Timeline configured with appropriate buffer periods between phases'
  },
  {
    title: 'Select Rater Types',
    description: 'Choose which categories of raters will participate.',
    substeps: [
      'Enable/disable Self-Assessment',
      'Enable/disable Manager feedback',
      'Enable/disable Peer feedback (configure min/max)',
      'Enable/disable Direct Report feedback',
      'Enable/disable External raters (customers/vendors)'
    ],
    expectedResult: 'Rater types selected with appropriate minimum thresholds'
  },
  {
    title: 'Configure Cycle Options',
    description: 'Set behavioral options for the cycle.',
    substeps: [
      'Set anonymity threshold (recommend minimum 3)',
      'Configure whether to hide rating points from employees',
      'Decide if self-ratings should be excluded from averages',
      'Set comment requirements (optional vs mandatory)',
      'Enable manager approval for peer nominations if needed'
    ],
    expectedResult: 'Options configured to balance transparency with anonymity'
  },
  {
    title: 'Link Framework and Questions',
    description: 'Connect competency framework and question sets.',
    substeps: [
      'Select the competency framework to use',
      'Choose framework version (latest or specific)',
      'Select question set or create new',
      'Review question assignment by rater type',
      'Verify all competencies have associated questions'
    ],
    expectedResult: 'Framework and questions linked with full coverage'
  },
  {
    title: 'Validate and Save',
    description: 'Review configuration and save as draft.',
    substeps: [
      'Click "Validate Configuration" to check for issues',
      'Review any warnings or errors',
      'Address validation issues if present',
      'Click "Save as Draft" to preserve configuration',
      'Note: Participants must be added before launch'
    ],
    expectedResult: 'Cycle saved in Draft status, ready for participant enrollment'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Cannot save cycle - validation errors',
    cause: 'Required fields are missing or timeline dates are invalid',
    solution: 'Check that all required fields are filled. Ensure start_date is in the future and end_date is after start_date.'
  },
  {
    issue: 'Template not loading correctly',
    cause: 'Template may reference deleted framework or question set',
    solution: 'Create new cycle without template, or update template to reference valid framework/questions.'
  },
  {
    issue: 'External raters option not available',
    cause: 'External rater feature is not enabled in system configuration',
    solution: 'Contact system administrator to enable external rater configuration in Setup → 360 Feedback → External Raters.'
  },
  {
    issue: 'Cannot select certain competency framework',
    cause: 'Framework may be inactive or not mapped for 360 feedback use',
    solution: 'Check framework status in Core Framework → Library. Ensure framework has "360 Feedback" enabled in usage settings.'
  }
];

export function WorkflowCycleCreation() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.2</Badge>
          <Badge variant="secondary">~15 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Creating a New Cycle
        </CardTitle>
        <CardDescription>
          Step-by-step guide to creating and configuring a 360 feedback cycle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', 'Create Cycle']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Cycle Creation Workflow"
          description="End-to-end process from initial creation to launch readiness"
          diagram={CREATION_DIAGRAM}
        />

        {/* Cycle Types */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cycle Types
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {CYCLE_TYPES.map((type) => (
              <div key={type.type} className="border rounded-lg p-4 space-y-2">
                <h5 className="font-medium">{type.type}</h5>
                <p className="text-sm text-muted-foreground">{type.description}</p>
                <div className="flex flex-wrap gap-1">
                  {type.raters.map((rater) => (
                    <Badge key={rater} variant="outline" className="text-xs">
                      {rater}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">{type.useCase}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Template-Based Creation">
          For recurring cycles (e.g., annual leadership reviews), create a template after your first
          successful cycle. Templates preserve timeline patterns, rater configurations, and question
          assignments for rapid deployment.
        </TipCallout>

        <StepByStep steps={STEPS} title="Step-by-Step Procedure" />

        <FieldReferenceTable 
          fields={TIMELINE_FIELDS} 
          title="Timeline Configuration Fields" 
        />

        <FieldReferenceTable 
          fields={OPTIONS_FIELDS} 
          title="Cycle Options Fields" 
        />

        <WarningCallout title="Timeline Planning">
          Allow adequate time between phases: 1-2 weeks for nominations, 3-4 weeks for feedback
          collection. Compressed timelines reduce response rates and feedback quality.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
